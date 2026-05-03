// Validation des étapes du formulaire de création d'alerte

export function validateStep(step, state) {
  const errors = {};

  switch (step) {
    case 0: // Étape Module
      if (!state.module) {
        errors.module = 'Veuillez sélectionner un module ERP';
      }
      break;

    case 1: // Étape Cible
      if (!state.targetType) {
        errors.targetType = 'Veuillez sélectionner un type de cible';
      }
      if (!state.targetValue || state.targetValue.trim().length < 2) {
        errors.targetValue = 'Veuillez identifier la cible (au moins 2 caractères)';
      }
      break;

    case 2: // Étape Conditions
      if (!state.alertName || state.alertName.trim().length < 3) {
        errors.alertName = "Le nom de l'alerte doit contenir au moins 3 caractères";
      }

      if (state.conditions.length === 0) {
        errors.conditions = 'Au moins une condition est requise';
      }

      state.conditions.forEach((cond, i) => {
        if (!cond.field) {
          errors[`cond_${i}_field`] = 'Champ requis';
        }
        if (!cond.operator) {
          errors[`cond_${i}_operator`] = 'Opérateur requis';
        }
        if (cond.value === '' || cond.value === null || cond.value === undefined) {
          errors[`cond_${i}_value`] = 'Valeur requise';
        }
      });
      break;

    default:
      break;
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
