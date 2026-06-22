import { Container, Paper, Typography, Box, Button } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useNavigate } from 'react-router-dom';

function PendingApprovalPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 5, mt: 10, textAlign: 'center' }}>
        <HourglassEmptyIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Compte en attente
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Votre compte a été créé avec succès. Il est actuellement en attente
          d'approbation par le responsable ERP.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Vous recevrez un accès une fois que votre compte sera approuvé et un
          rôle vous sera attribué.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/login')}
          >
            Retour à la connexion
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default PendingApprovalPage;
