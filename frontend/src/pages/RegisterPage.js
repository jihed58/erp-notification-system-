import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Box, TextField, Button,
  Typography, Alert, Paper, MenuItem
} from '@mui/material';
import api from '../services/api';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');

  const DEPARTMENTS = ['Ressources Humaines', 'Logistique & Stock', 'Commercial & Ventes', 'Finance & Comptabilité', 'Maintenance', 'Achats & Approvisionnement'];
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Les mots de passe ne correspondent pas');
    }
    if (password.length < 6) {
      return setError('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (!department) {
      return setError('Veuillez sélectionner un département');
    }

    try {
      await api.post('/auth/register', { name, email, password, role, department });
      // Account is pending — redirect to pending approval page
      navigate('/pending-approval');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Inscription
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Nom complet"
            fullWidth required margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth required margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Mot de passe"
            type="password"
            fullWidth required margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="Confirmer le mot de passe"
            type="password"
            fullWidth required margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <TextField
            select
            label="Type de compte"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="user">Utilisateur</MenuItem>
            <MenuItem value="admin">Admin (Chef de département)</MenuItem>
          </TextField>
          <TextField
            select
            label="Département"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            fullWidth
            margin="normal"
            required
          >
            {DEPARTMENTS.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            S'inscrire
          </Button>
        </Box>
        <Typography align="center" sx={{ mt: 2 }}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default RegisterPage;