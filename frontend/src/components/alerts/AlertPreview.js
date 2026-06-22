import { Box, Typography, Paper, Chip, Divider, List, ListItem, ListItemIcon, ListItemText, TextField, MenuItem } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RuleIcon from '@mui/icons-material/Rule';
import { ERP_MODULES, MODULE_FIELDS, MODULE_TARGETS, OPERATOR_LABELS } from '../../config/alertConfig';
import { useAlertForm } from '../../context/AlertFormContext';

function AlertPreview() {
  const { state, dispatch } = useAlertForm();

  const moduleLabel = ERP_MODULES.find(m => m.id === state.module)?.label || state.module;
  const fields = MODULE_FIELDS[state.module] || [];
  const targets = MODULE_TARGETS[state.module] || [];
  const targetLabel = targets.find(t => t.value === state.targetType)?.label || state.targetType;

  const getFieldLabel = (fieldValue) => {
    return fields.find(f => f.value === fieldValue)?.label || fieldValue;
  };

  const getOperatorLabel = (op) => {
    return OPERATOR_LABELS[op] || op;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        📋 Résumé de la règle
      </Typography>

      <Paper sx={{ p: 3, mb: 2 }} variant="outlined">
        {/* Info de base */}
        <Typography variant="subtitle2" color="text.secondary">
          Module
        </Typography>
        <Typography variant="h6" gutterBottom>
          {moduleLabel}
        </Typography>

        <Typography variant="subtitle2" color="text.secondary">
          Nom de l'alerte
        </Typography>
        <Typography variant="h6" gutterBottom>
          {state.alertName}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Cible */}
        <Typography variant="subtitle2" color="text.secondary">
          Cible
        </Typography>
        <Typography variant="h6" gutterBottom>
          {targetLabel} : {state.targetValue}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Conditions */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Conditions ({state.logicOperator === 'AND'
            ? 'toutes doivent être vraies'
            : 'au moins une doit être vraie'})
        </Typography>

        <List dense>
          {state.conditions.map((cond, i) => (
            <ListItem key={cond.id}>
              <ListItemIcon>
                <RuleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={
                  `${getFieldLabel(cond.field)} ${getOperatorLabel(cond.operator)} ${cond.value}`
                }
              />
              {i < state.conditions.length - 1 && (
                <Chip
                  label={state.logicOperator}
                  size="small"
                  color="info"
                  sx={{ ml: 1 }}
                />
              )}
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Options de l'alerte */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Configuration finale
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 2 }}>
          <TextField
            select
            label="Sévérité (Niveau d'escalade)"
            value={state.severity || 'low'}
            onChange={(e) => dispatch({ type: 'SET_SEVERITY', payload: e.target.value })}
            fullWidth
            helperText="Low: pas d'escalade | High: escalade en 1h | Critical: escalade en 15m"
          >
            <MenuItem value="low">Faible (Low)</MenuItem>
            <MenuItem value="high">Haute (High)</MenuItem>
            <MenuItem value="critical">Critique (Critical)</MenuItem>
          </TextField>

          {/* Statut */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color={state.isActive ? 'success' : 'disabled'} />
            <Typography>
              Statut : {state.isActive ? 'Active' : 'Inactive'}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default AlertPreview;
