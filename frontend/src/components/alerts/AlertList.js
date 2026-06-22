import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, IconButton, Chip, Switch, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, List, ListItem, ListItemText, Divider, Snackbar, Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RuleIcon from '@mui/icons-material/Rule';
import BugReportIcon from '@mui/icons-material/BugReport';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { ERP_MODULES, MODULE_FIELDS, MODULE_TARGETS, OPERATOR_LABELS } from '../../config/alertConfig';
import { deleteAlert, updateAlert } from '../../services/alertService';
import { simulateAlert } from '../../services/notificationService';

function AlertList({ alerts, onRefresh }) {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [popup, setPopup] = useState({ open: false, title: '', message: '' });

  // Trouver le label du module
  const getModuleLabel = (moduleId) => {
    return ERP_MODULES.find((m) => m.id === moduleId)?.label || moduleId;
  };

  // Trouver le label du champ
  const getFieldLabel = (moduleId, fieldValue) => {
    const fields = MODULE_FIELDS[moduleId] || [];
    return fields.find((f) => f.value === fieldValue)?.label || fieldValue;
  };

  // Trouver le label de l'opérateur
  const getOperatorLabel = (op) => {
    return OPERATOR_LABELS[op] || op;
  };

  // Trouver le label de la cible
  const getTargetLabel = (moduleId, targetType) => {
    const targets = MODULE_TARGETS[moduleId] || [];
    return targets.find((t) => t.value === targetType)?.label || targetType;
  };

  // Basculer le statut actif/inactif
  const handleToggle = async (alert) => {
    try {
      await updateAlert(alert._id, { isActive: !alert.isActive });
      onRefresh();
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
    }
  };

  // Confirmer et supprimer
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteAlert(deleteId);
      onRefresh();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Naviguer vers la page d'édition
  const handleEdit = (id) => {
    navigate(`/alerts/edit/${id}`);
  };

  const handleSimulate = async (id) => {
    try {
      await simulateAlert(id);
      setPopup({ 
        open: true, 
        title: 'Alerte déclenchée !', 
        message: 'Les conditions de cette alerte ont été remplies. Elle a été déclenchée, supprimée de vos règles actives, et transférée dans votre boîte de Notifications.' 
      });
      onRefresh(); // Refresh list to remove the deleted alert
      window.dispatchEvent(new Event('notification_updated'));
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors de la simulation.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Mes alertes
      </Typography>

      {alerts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <Typography color="text.secondary">
            Aucune alerte configurée. Créez votre première alerte !
          </Typography>
        </Paper>
      ) : (
        alerts.map((alert) => (
          <Paper
          key={alert._id}
          sx={{
            p: 3,
            mb: 2,
            opacity: alert.isActive ? 1 : 0.65,
            borderLeft: alert.isActive ? '4px solid #2e7d32' : '4px solid #bdbdbd',
            transition: 'opacity 0.3s ease',
          }}
        >
          {/* En-tête : nom + module + actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">{alert.name}</Typography>
              <Chip
                label={getModuleLabel(alert.module)}
                size="small"
                color="primary"
                variant="outlined"
              />
              {alert.conditions?.length > 1 && (
                <Chip
                  label={alert.logicOperator || 'AND'}
                  size="small"
                  color="info"
                />
              )}
              {alert.targetType && (
                <Chip
                  label={`${getTargetLabel(alert.module, alert.targetType)} : ${alert.targetLabel || alert.targetValue || '—'}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}
              {alert.severity && (
                <Chip
                  label={alert.severity.toUpperCase()}
                  size="small"
                  color={
                    alert.severity === 'critical' ? 'error' :
                    alert.severity === 'high' ? 'warning' : 'default'
                  }
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Toggle actif/inactif */}
              <Tooltip title={alert.isActive ? 'Désactiver' : 'Activer'}>
                <Switch
                  checked={alert.isActive}
                  onChange={() => handleToggle(alert)}
                  color="success"
                  size="small"
                />
              </Tooltip>

              {/* Bouton éditer */}
              <Tooltip title="Modifier">
                <IconButton
                  onClick={() => handleEdit(alert._id)}
                  color="primary"
                  size="small"
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>

              {/* Bouton simuler */}
              <Tooltip title="Simuler (Test)">
                <IconButton
                  onClick={() => handleSimulate(alert._id)}
                  color="warning"
                  size="small"
                >
                  <BugReportIcon />
                </IconButton>
              </Tooltip>

              {/* Bouton supprimer */}
              <Tooltip title="Supprimer">
                <IconButton
                  onClick={() => setDeleteId(alert._id)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Liste des conditions */}
          <List dense disablePadding>
            {(alert.conditions || []).map((cond, i) => (
              <ListItem key={i} disablePadding sx={{ py: 0.3 }}>
                <RuleIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                <ListItemText
                  primary={
                    `${getFieldLabel(alert.module, cond.field)} ${getOperatorLabel(cond.operator)} ${cond.value}`
                  }
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>

          {/* Date de création */}
          <Divider sx={{ mt: 1.5, mb: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Créée le {new Date(alert.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </Typography>
        </Paper>
      )))}

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette alerte ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleting}>
            Annuler
          </Button>
          <Button onClick={handleDelete} color="error" disabled={deleting}>
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      {/* Pop-up de message (Alerte déclenchée) */}
      <Dialog
        open={popup.open}
        onClose={() => setPopup((p) => ({ ...p, open: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsActiveIcon color="primary" />
          {popup.title}
        </DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText sx={{ mt: 1, fontSize: '1.1rem' }}>
            {popup.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setPopup((p) => ({ ...p, open: false }))} color="inherit">
            Fermer
          </Button>
          <Button 
            onClick={() => navigate('/notifications')} 
            variant="contained" 
            color="primary"
          >
            Aller aux Notifications
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AlertList;
