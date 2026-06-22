import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, Chip, Box, IconButton, Tooltip,
  Alert, Snackbar
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BugReportIcon from '@mui/icons-material/BugReport'; // Used for simulate button
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Navbar from '../components/Navbar';
import { getHistory } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getHistory(true); // archived = true
      setLogs(data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors du chargement de l\'historique', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleReuseTemplate = (snapshot) => {
    navigate('/alerts/create', { state: { template: snapshot } });
  };

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4, mb: 4, maxWidth: '800px' }}>
        <Typography variant="h4" gutterBottom>
          Historique des Alertes
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Consultez l'historique des notifications qui vous ont été envoyées.
        </Typography>

        <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
          {loading ? (
            <Typography sx={{ p: 2 }}>Chargement...</Typography>
          ) : logs.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsActiveIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography color="text.secondary">
                Aucune alerte n'a encore été déclenchée pour vos règles.
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {logs.map((log, index) => {
                const snapshot = log.ruleSnapshot || log.alertRule || {};
                return (
                  <ListItem
                    key={log._id}
                    alignItems="flex-start"
                    sx={{
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: 'transparent',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                    secondaryAction={
                      <Tooltip title="Réutiliser comme modèle">
                        <IconButton edge="end" aria-label="reuse" onClick={() => handleReuseTemplate(snapshot)}>
                          <ContentCopyIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'grey.400' }}>
                        <NotificationsActiveIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="normal">
                            {snapshot.name || 'Alerte inconnue'}
                          </Typography>
                        {!log.isRead && (
                          <Chip label="Nouveau" color="error" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                        )}
                        {log.severity && (
                          <Chip 
                            label={log.severity.toUpperCase()} 
                            size="small" 
                            color={log.severity === 'critical' ? 'error' : log.severity === 'high' ? 'warning' : 'default'}
                            sx={{ height: 20, fontSize: '0.7rem' }} 
                          />
                        )}
                        {log.user?._id !== user?.id && log.escalationLevel > 0 && (
                          <Chip 
                            label={`Escaladé (Niveau ${log.escalationLevel}) de ${log.user?.name}`} 
                            color="secondary" 
                            size="small" 
                            sx={{ height: 20, fontSize: '0.7rem' }} 
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {log.message}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          {new Date(log.createdAt).toLocaleString('fr-FR')} • Module: {snapshot.module || 'N/A'}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              );})}
            </List>
          )}
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </>
  );
}

export default HistoryPage;
