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
    { value: 'quantite',        label: 'Quantité en stock',   type: 'number' },
    { value: 'stock_minimum',   label: 'Stock minimum',       type: 'number' },
    { value: 'date_peremption', label: 'Date de péremption',  type: 'date' },
    { value: 'reference',       label: 'Référence produit',   type: 'text' },
  ],
  crm: [
    { value: 'montant_deal',   label: 'Montant du deal',     type: 'number' },
    { value: 'statut_lead',    label: 'Statut du lead',      type: 'text' },
    { value: 'date_relance',   label: 'Date de relance',     type: 'date' },
    { value: 'nom_client',     label: 'Nom du client',       type: 'text' },
  ],
  facturation: [
    { value: 'montant_facture', label: 'Montant facture',     type: 'number' },
    { value: 'statut_paiement', label: 'Statut de paiement', type: 'text' },
    { value: 'date_echeance',   label: "Date d'échéance",    type: 'date' },
    { value: 'montant_depasse', label: 'Montant dépassé',    type: 'number' },
  ],
  gmao: [
    { value: 'heures_machine',   label: 'Heures machine',        type: 'number' },
    { value: 'date_maintenance', label: 'Prochaine maintenance', type: 'date' },
    { value: 'niveau_criticite', label: 'Niveau de criticité',  type: 'number' },
    { value: 'equipement',       label: 'Nom équipement',        type: 'text' },
  ],
  rh: [
    { value: 'jours_conge',     label: 'Jours de congé restants', type: 'number' },
    { value: 'date_contrat',    label: 'Fin de contrat',          type: 'date' },
    { value: 'nom_employe',     label: "Nom de l'employé",        type: 'text' },
  ],
  achats: [
    { value: 'montant_commande', label: 'Montant commande',      type: 'number' },
    { value: 'date_livraison',   label: 'Date de livraison',     type: 'date' },
    { value: 'fournisseur',      label: 'Fournisseur',           type: 'text' },
    { value: 'statut_commande',  label: 'Statut commande',       type: 'text' },
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
