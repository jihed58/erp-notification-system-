import { Box, FormControl, InputLabel, Select, MenuItem, TextField, IconButton, FormHelperText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { MODULE_FIELDS, OPERATORS } from '../../config/alertConfig';
import { useAlertForm } from '../../context/AlertFormContext';

function ConditionRow({ condition, index, canDelete }) {
  const { state, dispatch } = useAlertForm();
  const fields = MODULE_FIELDS[state.module] || [];

  // Déterminer le type du champ sélectionné pour filtrer les opérateurs
  const selectedField = fields.find(f => f.value === condition.field);
  const fieldType = selectedField?.type || 'text';
  const operators = OPERATORS[fieldType] || [];

  const handleChange = (key, value) => {
    dispatch({
      type: 'UPDATE_CONDITION',
      payload: { id: condition.id, key, value },
    });
    // Si le champ change, réinitialiser opérateur et valeur
    if (key === 'field') {
      dispatch({
        type: 'UPDATE_CONDITION',
        payload: { id: condition.id, key: 'operator', value: '' },
      });
      dispatch({
        type: 'UPDATE_CONDITION',
        payload: { id: condition.id, key: 'value', value: '' },
      });
    }
  };

  const handleDelete = () => {
    dispatch({ type: 'REMOVE_CONDITION', payload: condition.id });
  };

  // Déterminer le type d'input HTML pour la valeur
  const getInputType = () => {
    if (fieldType === 'number') return 'number';
    if (fieldType === 'date') return 'date';
    return 'text';
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
      {/* Sélection du champ */}
      <FormControl
        sx={{ minWidth: 200 }}
        error={!!state.errors[`cond_${index}_field`]}
        size="small"
      >
        <InputLabel>Champ</InputLabel>
        <Select
          value={condition.field}
          label="Champ"
          onChange={(e) => handleChange('field', e.target.value)}
        >
          {fields.map((f) => (
            <MenuItem key={f.value} value={f.value}>
              {f.label}
            </MenuItem>
          ))}
        </Select>
        {state.errors[`cond_${index}_field`] && (
          <FormHelperText>{state.errors[`cond_${index}_field`]}</FormHelperText>
        )}
      </FormControl>

      {/* Sélection de l'opérateur */}
      <FormControl
        sx={{ minWidth: 180 }}
        error={!!state.errors[`cond_${index}_operator`]}
        size="small"
      >
        <InputLabel>Opérateur</InputLabel>
        <Select
          value={condition.operator}
          label="Opérateur"
          onChange={(e) => handleChange('operator', e.target.value)}
          disabled={!condition.field}
        >
          {operators.map((op) => (
            <MenuItem key={op.value} value={op.value}>
              {op.label}
            </MenuItem>
          ))}
        </Select>
        {state.errors[`cond_${index}_operator`] && (
          <FormHelperText>{state.errors[`cond_${index}_operator`]}</FormHelperText>
        )}
      </FormControl>

      {/* Saisie de la valeur */}
      <TextField
        label="Valeur"
        type={getInputType()}
        value={condition.value}
        onChange={(e) => handleChange('value', e.target.value)}
        disabled={!condition.operator}
        error={!!state.errors[`cond_${index}_value`]}
        helperText={state.errors[`cond_${index}_value`] || ''}
        InputLabelProps={fieldType === 'date' ? { shrink: true } : {}}
        sx={{ minWidth: 150 }}
        size="small"
      />

      {/* Bouton supprimer */}
      <IconButton
        onClick={handleDelete}
        disabled={!canDelete}
        color="error"
        sx={{ mt: 0.5 }}
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );
}

export default ConditionRow;
