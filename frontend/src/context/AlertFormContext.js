import { createContext, useContext, useReducer } from 'react';

// État initial du formulaire multi-étapes
const initialState = {
  currentStep: 0,
  module: '',
  targetType: '',
  targetValue: '',
  targetLabel: '',
  alertName: '',
  conditions: [
    { id: Date.now(), field: '', operator: '', value: '' }
  ],
  logicOperator: 'AND',
  severity: 'low',
  isActive: true,
  errors: {},
};

// Reducer — toute la logique de mise à jour centralisée
function alertFormReducer(state, action) {
  switch (action.type) {
    case 'SET_MODULE':
      // Réinitialiser les conditions et la cible quand le module change
      return {
        ...state,
        module: action.payload,
        targetType: '',
        targetValue: '',
        conditions: [{ id: Date.now(), field: '', operator: '', value: '' }],
        errors: {},
      };

    case 'SET_ALERT_NAME':
      return { ...state, alertName: action.payload };

    case 'SET_TARGET_TYPE':
      return { ...state, targetType: action.payload };

    case 'SET_TARGET_VALUE':
      return { ...state, targetValue: action.payload };

    case 'SET_TARGET_LABEL':
      return { ...state, targetLabel: action.payload };

    case 'SET_LOGIC_OPERATOR':
      return { ...state, logicOperator: action.payload };

    case 'SET_SEVERITY':
      return { ...state, severity: action.payload };

    case 'SET_ACTIVE':
      return { ...state, isActive: action.payload };

    case 'ADD_CONDITION':
      return {
        ...state,
        conditions: [...state.conditions, { id: Date.now(), field: '', operator: '', value: '' }],
      };

    case 'REMOVE_CONDITION':
      return {
        ...state,
        conditions: state.conditions.filter(c => c.id !== action.payload),
      };

    case 'UPDATE_CONDITION':
      return {
        ...state,
        conditions: state.conditions.map(c =>
          c.id === action.payload.id
            ? { ...c, [action.payload.key]: action.payload.value }
            : c
        ),
      };

    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, 3) };

    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };

    case 'SET_ERRORS':
      return { ...state, errors: action.payload };

    case 'RESET':
      return {
        ...initialState,
        targetType: '',
        targetValue: '',
        conditions: [{ id: Date.now(), field: '', operator: '', value: '' }],
        severity: 'low',
      };

    case 'LOAD_ALERT':
      // Pour le mode édition : charger une alerte existante
      return { ...action.payload, currentStep: 0, errors: {} };

    default:
      return state;
  }
}

// Création du Context
const AlertFormContext = createContext();

// Provider qui enveloppe les composants du formulaire
export function AlertFormProvider({ children }) {
  const [state, dispatch] = useReducer(alertFormReducer, initialState);
  return (
    <AlertFormContext.Provider value={{ state, dispatch }}>
      {children}
    </AlertFormContext.Provider>
  );
}

// Hook personnalisé pour accéder au context
export function useAlertForm() {
  const context = useContext(AlertFormContext);
  if (!context) {
    throw new Error('useAlertForm must be used within an AlertFormProvider');
  }
  return context;
}
