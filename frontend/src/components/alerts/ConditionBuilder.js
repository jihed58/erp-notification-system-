import { Box, Button, Typography, TextField, ToggleButtonGroup, ToggleButton, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ConditionRow from './ConditionRow';
import { useAlertForm } from '../../context/AlertFormContext';

function ConditionBuilder() {
  const { state, dispatch } = useAlertForm();

  const handleAddCondition = () => {
    dispatch({ type: 'ADD_CONDITION' });
  };

  return (
    <Box>
      {/* Nom de l'alerte */}
      <TextField
        label="Nom de l'alerte"
        fullWidth
        value={state.alertName}
        onChange={(e) => dispatch({ type: 'SET_ALERT_NAME', payload: e.target.value })}
        error={!!state.errors.alertName}
        helperText={state.errors.alertName || "Ex : Alerte stock bas, Facture impayée..."}
        sx={{ mb: 3 }}
      />

      <Typography variant="h6" gutterBottom>
        Définir les conditions
      </Typography>

      {state.errors.conditions && (
        <Typography color="error" sx={{ mb: 2 }}>
          {state.errors.conditions}
        </Typography>
      )}

      {/* Lignes de conditions */}
      {state.conditions.map((condition, index) => (
        <Box key={condition.id}>
          <ConditionRow
            condition={condition}
            index={index}
            canDelete={state.conditions.length > 1}
          />
          {/* Afficher le sélecteur AND/OR entre les conditions (pas après la dernière) */}
          {index < state.conditions.length - 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
              <ToggleButtonGroup
                value={state.logicOperator}
                exclusive
                onChange={(e, val) => {
                  if (val) dispatch({ type: 'SET_LOGIC_OPERATOR', payload: val });
                }}
                size="small"
              >
                <ToggleButton value="AND">ET (toutes)</ToggleButton>
                <ToggleButton value="OR">OU (au moins une)</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />

      {/* Bouton ajouter une condition */}
      <Button
        startIcon={<AddIcon />}
        onClick={handleAddCondition}
        variant="outlined"
      >
        Ajouter une condition
      </Button>
    </Box>
  );
}

export default ConditionBuilder;
