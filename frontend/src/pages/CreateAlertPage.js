import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Stepper, Step, StepLabel, Button, Box, Paper, Typography, Alert
} from '@mui/material';
import Navbar from '../components/Navbar';
import ModuleSelector from '../components/alerts/ModuleSelector';
import TargetSelector from '../components/alerts/TargetSelector';
import ConditionBuilder from '../components/alerts/ConditionBuilder';
import AlertPreview from '../components/alerts/AlertPreview';
import { AlertFormProvider, useAlertForm } from '../context/AlertFormContext';
import { validateStep, hasErrors } from '../utils/alertValidation';
import { createAlert, updateAlert, getAlerts } from '../services/alertService';

const STEPS = ['Module ERP', 'Cible', 'Conditions', 'Aperçu & Validation'];

// Composant interne qui utilise le context
function CreateAlertForm() {
  const { state, dispatch } = useAlertForm();
  const navigate = useNavigate();
  const { id } = useParams(); // Si présent → mode édition
  const isEditMode = !!id;
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  // En mode édition, charger l'alerte existante
  useEffect(() => {
    if (!isEditMode) return;

    const loadAlert = async () => {
      try {
        const alerts = await getAlerts();
        const alert = alerts.find((a) => a._id === id);
        if (alert) {
          dispatch({
            type: 'LOAD_ALERT',
            payload: {
              module: alert.module,
              targetType: alert.targetType || '',
              targetValue: alert.targetValue || '',
              alertName: alert.name,
              conditions: alert.conditions.map((c, i) => ({
                ...c,
                id: Date.now() + i,
              })),
              logicOperator: alert.logicOperator || 'AND',
              isActive: alert.isActive,
            },
          });
        } else {
          setSubmitError('Alerte introuvable');
        }
      } catch (err) {
        setSubmitError('Erreur lors du chargement de l\'alerte');
      }
    };

    loadAlert();
  }, [id, isEditMode, dispatch]);

  const handleNext = () => {
    const errors = validateStep(state.currentStep, state);
    dispatch({ type: 'SET_ERRORS', payload: errors });
    if (!hasErrors(errors)) {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError('');
    try {
      const payload = {
        name: state.alertName,
        module: state.module,
        targetType: state.targetType,
        targetValue: state.targetValue,
        conditions: state.conditions.map(({ field, operator, value }) => ({
          field,
          operator,
          value,
        })),
        logicOperator: state.logicOperator,
        isActive: state.isActive,
      };

      if (isEditMode) {
        await updateAlert(id, payload);
      } else {
        await createAlert(payload);
      }

      navigate('/dashboard');
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 'Erreur lors de la sauvegarde. Vérifiez que le backend est lancé.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Afficher le composant correspondant à l'étape actuelle
  const renderStep = () => {
    switch (state.currentStep) {
      case 0: return <ModuleSelector />;
      case 1: return <TargetSelector />;
      case 2: return <ConditionBuilder />;
      case 3: return <AlertPreview />;
      default: return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Modifier l\'alerte' : 'Créer une Alerte'}
      </Typography>

      {/* Stepper : indicateur d'étapes */}
      <Stepper activeStep={state.currentStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Contenu de l'étape */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {renderStep()}
      </Paper>

      {/* Message d'erreur de soumission */}
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      {/* Boutons de navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={state.currentStep === 0}
          onClick={handleBack}
        >
          Précédent
        </Button>

        {state.currentStep < 3 ? (
          <Button variant="contained" onClick={handleNext}>
            Suivant
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? 'Sauvegarde...'
              : isEditMode
                ? '✓ Confirmer les modifications'
                : '✓ Confirmer et sauvegarder'
            }
          </Button>
        )}
      </Box>
    </Container>
  );
}

// Composant page qui fournit le context
function CreateAlertPage() {
  return (
    <>
      <Navbar />
      <AlertFormProvider>
        <CreateAlertForm />
      </AlertFormProvider>
    </>
  );
}

export default CreateAlertPage;
