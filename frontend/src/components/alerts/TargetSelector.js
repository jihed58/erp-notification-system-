import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem,
  TextField, Paper, Chip
} from '@mui/material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { MODULE_TARGETS, TARGET_PLACEHOLDERS, ERP_MODULES } from '../../config/alertConfig';
import { useAlertForm } from '../../context/AlertFormContext';

function TargetSelector() {
  const { state, dispatch } = useAlertForm();
  const targets = MODULE_TARGETS[state.module] || [];
  const moduleLabel = ERP_MODULES.find(m => m.id === state.module)?.label || state.module;

  const handleTypeChange = (e) => {
    dispatch({ type: 'SET_TARGET_TYPE', payload: e.target.value });
    // Réinitialiser la valeur quand le type change
    dispatch({ type: 'SET_TARGET_VALUE', payload: '' });
  };

  const handleValueChange = (e) => {
    dispatch({ type: 'SET_TARGET_VALUE', payload: e.target.value });
  };

  const placeholder = TARGET_PLACEHOLDERS[state.targetType] || 'Saisissez la cible...';

  return (
    <Box>
      {/* En-tête avec le module sélectionné */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <TrackChangesIcon color="primary" />
        <Typography variant="h6">
          Définir la cible de l'alerte
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Module sélectionné : <Chip label={moduleLabel} size="small" color="primary" variant="outlined" />
        {' — '}Choisissez le type d'élément à surveiller puis identifiez-le.
      </Typography>

      {/* Sélection du type de cible */}
      <FormControl
        fullWidth
        error={!!state.errors.targetType}
        sx={{ mb: 3 }}
      >
        <InputLabel>Type de cible</InputLabel>
        <Select
          value={state.targetType}
          label="Type de cible"
          onChange={handleTypeChange}
        >
          {targets.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </Select>
        {state.errors.targetType && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
            {state.errors.targetType}
          </Typography>
        )}
      </FormControl>

      {/* Saisie de la valeur de la cible */}
      <TextField
        label="Identifiant / Nom de la cible"
        fullWidth
        value={state.targetValue}
        onChange={handleValueChange}
        disabled={!state.targetType}
        error={!!state.errors.targetValue}
        helperText={state.errors.targetValue || placeholder}
        sx={{ mb: 2 }}
      />

      {/* Résumé visuel */}
      {state.targetType && state.targetValue && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mt: 1,
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
            borderColor: 'primary.main',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            L'alerte ciblera :
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {targets.find(t => t.value === state.targetType)?.label} → {state.targetValue}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default TargetSelector;
