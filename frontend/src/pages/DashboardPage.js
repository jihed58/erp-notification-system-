import { Typography, Container, Grid, Paper, Box } from '@mui/material';
import Navbar from '../components/Navbar';
function DashboardPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bienvenue, {user.name} 👋
        </Typography>
        <Grid container spacing={3}>
          {/* Carte : Alertes actives */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3">0</Typography>
              <Typography color="text.secondary">Alertes actives</Typography>
            </Paper>
          </Grid>
          {/* Carte : Notifications envoyées */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3">0</Typography>
              <Typography color="text.secondary">Notifications envoyées</Typography>
            </Paper>
          </Grid>
          {/* Carte : Modules connectés */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3">0</Typography>
              <Typography color="text.secondary">Modules ERP</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
export default DashboardPage;