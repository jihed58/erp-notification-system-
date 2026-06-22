import { useState, useEffect } from 'react';
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem,
  TextField, Paper, Chip, CircularProgress, Autocomplete,
} from '@mui/material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { MODULE_TARGETS, TARGET_PLACEHOLDERS, ERP_MODULES, DYNAMIC_TARGETS } from '../../config/alertConfig';
import { useAlertForm } from '../../context/AlertFormContext';
import { getERPTargets } from '../../services/hrService';

function TargetSelector() {
  const { state, dispatch } = useAlertForm();
  const targets = MODULE_TARGETS[state.module] || [];
  const moduleLabel = ERP_MODULES.find(m => m.id === state.module)?.label || state.module;

  // Dynamic dropdown state
  const [options, setOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Determine if the current module+targetType has a dynamic dropdown
  const isDynamic = DYNAMIC_TARGETS[state.module]?.includes(state.targetType);

  // Load options whenever module or targetType changes
  useEffect(() => {
    setOptions([]);
    dispatch({ type: 'SET_TARGET_VALUE', payload: '' });
    dispatch({ type: 'SET_TARGET_LABEL', payload: '' });

    if (!state.module || !state.targetType) return;

    const dynamic = DYNAMIC_TARGETS[state.module]?.includes(state.targetType);
    if (!dynamic) return;

    setLoadingOptions(true);
    getERPTargets(state.module, state.targetType)
      .then(data => {
        console.log('ERP targets loaded:', data.length, 'items');
        setOptions(data);
      })
      .catch(err => {
        console.error('Failed to load ERP targets:', err.response?.data || err.message);
        setOptions([]);
      })
      .finally(() => setLoadingOptions(false));
  }, [state.module, state.targetType]);

  const handleTypeChange = (e) => {
    dispatch({ type: 'SET_TARGET_TYPE', payload: e.target.value });
  };

  // Called when a dropdown option is selected
  const handleDynamicSelect = (event, selected) => {
    if (selected) {
      dispatch({ type: 'SET_TARGET_VALUE', payload: selected.value });
      dispatch({ type: 'SET_TARGET_LABEL', payload: selected.label });
    } else {
      dispatch({ type: 'SET_TARGET_VALUE', payload: '' });
      dispatch({ type: 'SET_TARGET_LABEL', payload: '' });
    }
  };

  // Called for free-text input
  const handleValueChange = (e) => {
    dispatch({ type: 'SET_TARGET_VALUE', payload: e.target.value });
  };

  const placeholder = TARGET_PLACEHOLDERS[state.targetType] || 'Saisissez la cible...';
  const selectedOption = options.find(o => o.value === state.targetValue) || null;
  const displayLabel = state.targetLabel || state.targetValue;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <TrackChangesIcon color="primary" />
        <Typography variant="h6">Définir la cible de l'alerte</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Module sélectionné : <Chip label={moduleLabel} size="small" color="primary" variant="outlined" />
        {' — '}Choisissez le type d'élément à surveiller puis identifiez-le.
      </Typography>

      {/* Target type selector */}
      <FormControl fullWidth error={!!state.errors.targetType} sx={{ mb: 3 }}>
        <InputLabel>Type de cible</InputLabel>
        <Select value={state.targetType} label="Type de cible" onChange={handleTypeChange}>
          {targets.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
              {DYNAMIC_TARGETS[state.module]?.includes(t.value) && (
                <Chip label="BD" size="small" color="success" variant="outlined" sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} />
              )}
            </MenuItem>
          ))}
        </Select>
        {state.errors.targetType && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
            {state.errors.targetType}
          </Typography>
        )}
      </FormControl>

      {/* Target value — dynamic dropdown or free text */}
      {state.targetType && (
        isDynamic ? (
          <Autocomplete
            options={options}
            getOptionLabel={(opt) => opt.label || ''}
            value={selectedOption}
            onChange={handleDynamicSelect}
            loading={loadingOptions}
            isOptionEqualToValue={(opt, val) => opt.value === val.value}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sélectionner depuis la base de données"
                error={!!state.errors.targetValue}
                helperText={state.errors.targetValue || `${options.length} entrée(s) disponible(s)`}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingOptions ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{ mb: 2 }}
          />
        ) : (
          <TextField
            label="Identifiant / Nom de la cible"
            fullWidth
            value={state.targetValue}
            onChange={handleValueChange}
            error={!!state.errors.targetValue}
            helperText={state.errors.targetValue || placeholder}
            sx={{ mb: 2 }}
          />
        )
      )}

      {/* Summary */}
      {state.targetType && state.targetValue && (
        <Paper
          variant="outlined"
          sx={{ p: 2, mt: 1, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderColor: 'primary.main' }}
        >
          <Typography variant="body2" color="text.secondary">L'alerte ciblera :</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {targets.find(t => t.value === state.targetType)?.label} → {displayLabel}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default TargetSelector;
