import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, IconButton, Chip, Switch, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, List, ListItem, ListItemText, Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RuleIcon from '@mui/icons-material/Rule';
import { ERP_MODULES, MODULE_FIELDS, MODULE_TARGETS, OPERATOR_LABELS } from '../../config/alertConfig';
import { deleteAlert, updateAlert } from '../../services/alertService';

function AlertList({ alerts, onRefresh }) {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  if (alerts.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
        <Typography color="text.secondary">
          Aucune alerte configurée. Créez votre première alerte !
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Mes alertes
      </Typography>

      {alerts.map((alert) => (
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
                  label={`${getTargetLabel(alert.module, alert.targetType)} : ${alert.targetValue || '—'}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
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
      ))}

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
    </Box>
  );
}

export default AlertList;
