import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Box, TextField, Button,
  Typography, Alert, Paper, Link as MuiLink,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Change password state (forced on first login)
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const navigate = useNavigate();
  const { login, changePassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      const accountStatus = err.response?.data?.status;

      if (status === 403 && accountStatus === 'pending') {
        setError('Votre compte est en attente d\'approbation par le responsable ERP.');
      } else if (status === 403 && accountStatus === 'suspended') {
        setError(message || 'Votre compte a été suspendu. Contactez le responsable ERP.');
      } else if (status === 403 && accountStatus === 'must_change_password') {
        setMustChangePassword(true);
        setError('');
        setSnackbar({ open: true, message: 'Veuillez définir votre mot de passe personnel pour continuer.', severity: 'info' });
      } else {
        setError(message || 'Échec de la connexion');
      }
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await changePassword(email, password, newPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Connexion
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {mustChangePassword ? (
          <Box component="form" onSubmit={handleChangePasswordSubmit}>
            <Typography variant="body1" sx={{ mb: 2 }} color="text.secondary" align="center">
              Le responsable ERP a réinitialisé votre mot de passe.
              <br />Veuillez créer votre nouveau mot de passe personnel.
            </Typography>
            <TextField
              label="Nouveau mot de passe"
              type="password"
              fullWidth
              required
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              color="success"
              sx={{ mt: 2 }}
            >
              Enregistrer et se connecter
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Mot de passe"
              type="password"
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
            >
              Se connecter
            </Button>
          </Box>
        )}

        <Typography align="center" sx={{ mt: 2 }}>
          Pas de compte ? <Link to="/register">S'inscrire</Link>
        </Typography>
      </Paper>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default LoginPage;