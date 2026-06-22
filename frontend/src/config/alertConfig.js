// Configuration centrale pour le système d'alertes ERP
// Définit les modules, champs par module, et opérateurs disponibles

export const ERP_MODULES = [
  { id: 'stock',       label: 'Stock',        icon: 'Inventory',     description: 'Gestion des stocks et inventaires' },
  { id: 'crm',         label: 'CRM',          icon: 'People',        description: 'Gestion de la relation client' },
  { id: 'facturation', label: 'Facturation',  icon: 'Receipt',       description: 'Factures et paiements' },
  { id: 'gmao',        label: 'GMAO',         icon: 'Build',         description: 'Maintenance assistée par ordinateur' },
  { id: 'rh',          label: 'RH',           icon: 'Badge',         description: 'Ressources humaines' },
  { id: 'achats',      label: 'Achats',       icon: 'ShoppingCart',  description: 'Commandes et fournisseurs' },
];

export const MODULE_FIELDS = {
  stock: [
    { value: 'prix',            label: 'Prix unitaire',       type: 'number' },
    { value: 'tempsClient',     label: 'Temps client (min)',  type: 'number' },
    { value: 'etat',            label: 'État (1=actif, 0=inactif)', type: 'number' },
  ],
  crm: [
    { value: 'solde',           label: 'Solde client',        type: 'number' },
    { value: 'chiffre',         label: "Chiffre d'affaires",  type: 'number' },
    { value: 'reglements',      label: 'Réglements client',   type: 'number' },
  ],
  facturation: [
    { value: 'resteReglemnt',   label: 'Reste à régler',      type: 'number' },
    { value: 'etatReglement',   label: 'État règlement (0=non, 1=partiel, 2=réglé)', type: 'number' },
    { value: 'acquittE',        label: 'Acquitté (0=non, 1=oui)', type: 'number' },
    { value: 'dateFacture',     label: 'Date de la facture',  type: 'date' },
  ],
  gmao: [
    { value: 'criticite',       label: 'Criticité machine',   type: 'number' },
    { value: 'etatActuel',      label: 'État actuel (1=service, 0=arrêt)', type: 'number' },
    { value: 'dureeVie',        label: 'Durée de vie (h)',    type: 'number' },
  ],
  rh: [
    { value: 'etat',            label: 'État employé (0=inactif, 1=actif)', type: 'number' },
    { value: 'allure',          label: 'Allure',              type: 'number' },
    { value: 'discipline',      label: 'Discipline',          type: 'number' },
    { value: 'dateFinContrat',  label: 'Date fin de contrat', type: 'date' },
  ],
  achats: [
    { value: 'solde',           label: 'Solde fournisseur',   type: 'number' },
    { value: 'chiffre',         label: "Chiffre d'affaires",  type: 'number' },
    { value: 'note',            label: 'Note fournisseur',    type: 'number' },
  ],
};

// Cibles disponibles par module — l'utilisateur choisit le type de cible puis saisit la valeur
export const MODULE_TARGETS = {
  stock: [
    { value: 'produit',   label: 'Produit spécifique' },
    { value: 'categorie', label: 'Catégorie de produit' },
    { value: 'entrepot',  label: 'Entrepôt' },
  ],
  crm: [
    { value: 'client', label: 'Client spécifique' },
    { value: 'deal',   label: 'Deal / Opportunité' },
  ],
  facturation: [
    { value: 'facture', label: 'Facture spécifique' },
    { value: 'client',  label: 'Client' },
  ],
  gmao: [
    { value: 'equipement', label: 'Équipement spécifique' },
    { value: 'site',       label: 'Site / Localisation' },
  ],
  rh: [
    { value: 'employe',     label: 'Employé spécifique' },
    { value: 'departement', label: 'Département' },
  ],
  achats: [
    { value: 'fournisseur', label: 'Fournisseur spécifique' },
    { value: 'commande',    label: "Commande d'achat" },
  ],
};

// Placeholder dynamique pour le champ de saisie de la cible
export const TARGET_PLACEHOLDERS = {
  produit:     'Ex : iPhone 15 Pro, Câble USB-C...',
  categorie:   'Ex : Électronique, Fournitures...',
  entrepot:    'Ex : Entrepôt Nord, Dépôt Central...',
  client:      'Ex : Société ABC, M. Dupont...',
  deal:        'Ex : Contrat Cloud 2025...',
  facture:     'Ex : FACT-2025-0042...',
  equipement:  'Ex : Presse hydraulique #3...',
  site:        'Ex : Usine Casablanca...',
  employe:     'Ex : Ahmed Benali...',
  departement: 'Ex : Département IT, RH...',
  fournisseur: 'Ex : FournisseurX, TechParts...',
  commande:    'Ex : CMD-2025-0108...',
};

export const OPERATORS = {
  number: [
    { value: 'gt',  label: 'Supérieur à (>)' },
    { value: 'lt',  label: 'Inférieur à (<)' },
    { value: 'eq',  label: 'Égal à (=)' },
    { value: 'gte', label: 'Supérieur ou égal (≥)' },
    { value: 'lte', label: 'Inférieur ou égal (≤)' },
    { value: 'neq', label: 'Différent de (≠)' },
  ],
  text: [
    { value: 'eq',       label: 'Égal à' },
    { value: 'neq',      label: 'Différent de' },
    { value: 'contains', label: 'Contient' },
  ],
  date: [
    { value: 'gt',  label: 'Après le' },
    { value: 'lt',  label: 'Avant le' },
    { value: 'eq',  label: 'Le' },
  ],
};

// Utilisé par AlertPreview pour transformer les opérateurs en phrases lisibles
export const OPERATOR_LABELS = {
  gt: 'est supérieur à',
  lt: 'est inférieur à',
  eq: 'est égal à',
  gte: 'est supérieur ou égal à',
  lte: 'est inférieur ou égal à',
  neq: 'est différent de',
  contains: 'contient',
};

/**
 * DYNAMIC_TARGETS — defines which module+targetType combos load from the DB.
 * To enable a dropdown for a new module, add an entry here.
 * The value must match the `erpTargetConfig.js` keys on the backend.
 */
export const DYNAMIC_TARGETS = {
  rh: ['employe', 'departement'],
  facturation: ['facture', 'client'],
  crm: ['client'],
  gmao: ['equipement', 'site'],
  stock: ['produit'],
  achats: ['fournisseur'],
};
