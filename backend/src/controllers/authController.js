const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Validate role and department
    const requestedRole = role === 'admin' ? 'admin' : 'user';
    if (!department) {
      return res.status(400).json({ message: 'Department is required' });
    }

    // New accounts are pending by default — ERP Manager must approve
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: requestedRole,
      department,
      status: 'pending'
    });

    // Don't issue a token — account needs approval first
    res.status(201).json({
      message: 'Account created. Awaiting ERP Manager approval.',
      _id: user._id,
      name: user.name,
      email: user.email,
      status: 'pending',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 3) {
        user.status = 'suspended';
        await user.save();
        return res.status(403).json({ 
          message: 'Compte suspendu après 3 échecs de connexion. Veuillez contacter le manager ERP.',
          status: 'suspended' 
        });
      }
      await user.save();
      return res.status(401).json({ 
        message: `Identifiants incorrects. Tentative ${user.failedLoginAttempts}/3 avant suspension.` 
      });
    }

    if (user.mustChangePassword) {
      return res.status(403).json({
        message: 'You must change your password before logging in.',
        status: 'must_change_password',
        email: user.email,
      });
    }

    // Check account status before issuing token
    if (user.status === 'pending') {
      return res.status(403).json({
        message: 'Account not yet approved. Contact ERP Manager.',
        status: 'pending',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        message: 'Account suspended. Contact ERP Manager.',
        status: 'suspended',
      });
    }

    // Auto-activate old accounts that don't have a status field yet
    let stateChanged = false;
    if (!user.status) {
      user.status = 'active';
      stateChanged = true;
    }

    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      stateChanged = true;
    }

    if (stateChanged) {
      await user.save();
    }

    // JWT payload includes role and department for RBAC
    const token = jwt.sign(
      { id: user._id, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      // Also apply strikes here for security
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 3) {
        user.status = 'suspended';
        await user.save();
        return res.status(403).json({ message: 'Compte suspendu suite à des échecs répétés.' });
      }
      await user.save();
      return res.status(401).json({ message: 'Mot de passe temporaire incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.mustChangePassword = false;
    user.failedLoginAttempts = 0;
    await user.save();

    // Auto log them in after changing password
    const token = jwt.sign(
      { id: user._id, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login, getMe, changePassword };