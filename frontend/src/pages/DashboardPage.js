import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Container, Grid, Paper, Box, Button, Chip } from '@mui/material';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import Navbar from '../components/Navbar';
import AlertList from '../components/alerts/AlertList';
import { getAlerts } from '../services/alertService';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { user, isManager, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (err) {
      // Le backend n'est peut-être pas encore lancé
      console.error('Erreur chargement alertes:', err);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const activeCount = alerts.filter((a) => a.isActive).length;

  // Compter les modules uniques utilisés
  const uniqueModules = [...new Set(alerts.map((a) => a.module))].length;

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h4">
            Bienvenue, {user?.name} 👋
          </Typography>
          {(isManager() || isAdmin()) && (
            <Chip
              label={isManager() ? 'Vue globale' : `Département: ${user?.department}`}
              color={isManager() ? 'error' : 'warning'}
              size="small"
            />
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddAlertIcon />}
            onClick={() => navigate('/alerts/create')}
            size="large"
          >
            Créer une nouvelle alerte
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Carte : Alertes actives */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3">{activeCount}</Typography>
              <Typography color="text.secondary">Alertes actives</Typography>
            </Paper>
          </Grid>
          {/* Carte : Total alertes */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3">{alerts.length}</Typography>
              <Typography color="text.secondary">Total alertes</Typography>
            </Paper>
          </Grid>
          {/* Carte : Modules connectés */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3">{uniqueModules}</Typography>
              <Typography color="text.secondary">Modules ERP</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Liste des alertes avec actions */}
        <AlertList alerts={alerts} onRefresh={fetchAlerts} />
      </Container>
    </>
  );
}
export default DashboardPage;