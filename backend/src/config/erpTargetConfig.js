const ERP_TARGET_CONFIG = {
  rh: {
    employe: {
      collection: 'employe',
      valueField: 'idEmploye',
      labelFields: ['nom', 'prenom'],
      sortField: 'nom',
      filter: {},
      limit: 1000,
    },
    departement: {
      collection: 'departement',
      valueField: 'idDepartement',
      labelFields: ['departement'],
      sortField: 'departement',
      filter: {},
      limit: 200,
    },
  },

  crm: {
    client: {
      collection: 'client',
      valueField: 'idClient',
      labelFields: ['client'],
      sortField: 'client',
      filter: { etat: 1 },
      limit: 500,
    },
  },

  facturation: {
    facture: {
      collection: 'facture',
      valueField: 'idFacture',
      labelFields: ['libFacture'],
      sortField: 'libFacture',
      filter: { etat: 1 },
      limit: 1000,
    },
    client: {
      collection: 'client',
      valueField: 'idClient',
      labelFields: ['client'],
      sortField: 'client',
      filter: { etat: 1 },
      limit: 500,
    },
  },

  gmao: {
    equipement: {
      collection: 'parcmachine',
      valueField: 'idMachine',
      labelFields: ['machine', 'numero'],
      sortField: 'machine',
      filter: { etat: 1 },
      limit: 1000,
    },
    site: {
      collection: 'intervention',
      valueField: 'idIntervention',
      labelFields: ['numero', 'descriptionIntervention'],
      sortField: 'numero',
      filter: {},
      limit: 500,
    },
  },
  stock: {
    produit: {
      collection: 'article',
      valueField: 'idArticle',
      labelFields: ['article'],
      sortField: 'article',
      filter: {},
      limit: 500,
    },
  },
  achats: {
    fournisseur: {
      collection: 'fournisseur',
      valueField: 'idFournisseur',
      labelFields: ['fournisseur'],
      sortField: 'fournisseur',
      filter: {},
      limit: 500,
    },
  },
};

module.exports = ERP_TARGET_CONFIG;
