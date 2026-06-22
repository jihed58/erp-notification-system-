import { useEffect, useState, useCallback, Fragment } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Box, Collapse, IconButton,
  Alert, Snackbar, List, ListItem, ListItemText, Divider, Tabs, Tab
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Navbar from '../components/Navbar';
import { getDepartmentUsers, getUserAlerts, getUserNotifications } from '../services/userService';
import { useAuth } from '../context/AuthContext';

function UserRow({ user, onError }) {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const handleToggle = async () => {
    if (!open && alerts.length === 0 && history.length === 0) {
      try {
        setLoadingData(true);
        const [alertsData, historyData] = await Promise.all([
          getUserAlerts(user._id),
          getUserNotifications(user._id)
        ]);
        setAlerts(alertsData);
        setHistory(historyData);
      } catch (err) {
        onError('Erreur lors du chargement des données');
      } finally {
        setLoadingData(false);
      }
    }
    setOpen(!open);
  };

  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={handleToggle}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>
          <Chip label={user.status} color={user.status === 'active' ? 'success' : 'warning'} size="small" variant="outlined" />
        </TableCell>
        <TableCell>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={(e, newVal) => setTabValue(newVal)}>
                  <Tab label="Règles Actives" />
                  <Tab label="Historique" />
                </Tabs>
              </Box>

              {loadingData ? (
                <Typography>Chargement...</Typography>
              ) : (
                <>
                  {tabValue === 0 && (
                    alerts.length === 0 ? (
                      <Typography color="text.secondary">Aucune règle active configurée.</Typography>
                    ) : (
                      <List disablePadding>
                        {alerts.map((alert, index) => (
                          <Fragment key={alert._id}>
                            <ListItem sx={{ py: 1, px: 0, display: 'flex', justifyContent: 'space-between' }}>
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {alert.name} ({alert.module})
                                  </Typography>
                                }
                                secondary={
                                  <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary" component="span">
                                      Cible: {alert.targetType} = {alert.targetValue}
                                    </Typography>
                                    <br/>
                                    <Typography variant="body2" color="text.secondary" component="span">
                                      Conditions ({alert.logicOperator}): {alert.conditions.map(c => `${c.field} ${c.operator} ${c.value}`).join(' | ')}
                                    </Typography>
                                  </Box>
                                }
                              />
                              <Chip
                                label={alert.isActive ? 'Active' : 'Désactivée'}
                                color={alert.isActive ? 'success' : 'default'}
                                size="small"
                              />
                            </ListItem>
                            {index < alerts.length - 1 && <Divider />}
                          </Fragment>
                        ))}
                      </List>
                    )
                  )}

                  {tabValue === 1 && (
                    history.length === 0 ? (
                      <Typography color="text.secondary">Aucun historique de notification.</Typography>
                    ) : (
                      <List disablePadding>
                        {history.map((log, index) => {
                          const snapshot = log.ruleSnapshot || log.alertRule || {};
                          return (
                            <Fragment key={log._id}>
                              <ListItem sx={{ py: 1, px: 0 }}>
                                <ListItemText
                                  primary={
                                    <Typography variant="subtitle2">
                                      {snapshot.name || 'Alerte inconnue'} - {new Date(log.createdAt).toLocaleString('fr-FR')}
                                    </Typography>
                                  }
                                  secondary={log.message}
                                />
                                {log.severity && (
                                  <Chip 
                                    label={log.severity.toUpperCase()} 
                                    size="small" 
                                    color={log.severity === 'critical' ? 'error' : log.severity === 'high' ? 'warning' : 'default'}
                                  />
                                )}
                              </ListItem>
                              {index < history.length - 1 && <Divider />}
                            </Fragment>
                          );
                        })}
                      </List>
                    )
                  )}
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

function DepartmentPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = useCallback(async () => {
    try {
      const data = await getDepartmentUsers();
      setUsers(data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors du chargement des utilisateurs', severity: 'error' });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleError = (message) => {
    setSnackbar({ open: true, message, severity: 'error' });
  };

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Mon Département: {user?.department}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Gérez les utilisateurs de votre département et consultez leurs alertes.
        </Typography>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell />
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Inscrit le</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Aucun utilisateur dans ce département</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <UserRow key={u._id} user={u} onError={handleError} />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
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
    </>
  );
}

export default DepartmentPage;
