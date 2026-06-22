import { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Paper, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, Chip, Box, IconButton, Tooltip,
  Alert, Snackbar, Button
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArchiveIcon from '@mui/icons-material/Archive';
import Navbar from '../components/Navbar';
import { getHistory, markAsRead, archiveNotification } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

function NotificationsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getHistory(false); // archived = false
      setLogs(data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors du chargement des notifications', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setLogs((prevLogs) =>
        prevLogs.map((log) => (log._id === id ? { ...log, isRead: true } : log))
      );
      window.dispatchEvent(new Event('notification_updated'));
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors de la mise à jour', severity: 'error' });
    }
  };

  const handleArchive = async (id) => {
    try {
      await archiveNotification(id);
      setLogs((prevLogs) => prevLogs.filter((log) => log._id !== id));
      setSnackbar({ open: true, message: 'Notification archivée avec succès', severity: 'success' });
      window.dispatchEvent(new Event('notification_updated'));
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors de l\'archivage', severity: 'error' });
    }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4, mb: 4, maxWidth: '800px' }}>
        <Typography variant="h4" gutterBottom>
          Notifications
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Consultez vos nouvelles alertes déclenchées.
        </Typography>

        <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
          {loading ? (
            <Typography sx={{ p: 2 }}>Chargement...</Typography>
          ) : logs.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsActiveIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography color="text.secondary">
                Vous n'avez aucune notification active.
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
                      bgcolor: log.isRead ? 'transparent' : 'action.hover',
                      border: '1px solid',
                      borderColor: log.isRead ? 'divider' : 'primary.light',
                    }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {!log.isRead ? (
                          <Tooltip title="Marquer comme lu">
                            <IconButton edge="end" aria-label="read" onClick={() => handleMarkAsRead(log._id)}>
                              <CheckCircleOutlineIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Archiver">
                            <IconButton edge="end" aria-label="archive" onClick={() => handleArchive(log._id)}>
                              <ArchiveIcon color="action" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: log.isRead ? 'grey.400' : 'error.main' }}>
                        <NotificationsActiveIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={log.isRead ? 'normal' : 'bold'}>
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
                );
              })}
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

export default NotificationsPage;
