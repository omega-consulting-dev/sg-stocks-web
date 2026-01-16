export default {
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    export: 'Exporter',
    import: 'Importer',
    loading: 'Chargement...',
    noData: 'Aucune donnée disponible',
    actions: 'Actions',
    status: 'Statut',
    active: 'Actif',
    inactive: 'Inactif',
    yes: 'Oui',
    no: 'Non',
    confirm: 'Confirmer',
    close: 'Fermer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    refresh: 'Actualiser',
    view: 'Voir',
    details: 'Détails',
    total: 'Total',
    date: 'Date',
    amount: 'Montant',
    description: 'Description',
    name: 'Nom',
    email: 'E-mail',
    phone: 'Téléphone',
    address: 'Adresse',
    required: 'Obligatoire',
    optional: 'Optionnel'
  },

  nav: {
    dashboard: 'Tableau de bord',
    sales: 'Ventes',
    products: 'Produits',
    inventory: 'Inventaire',
    customers: 'Clients',
    suppliers: 'Fournisseurs',
    expenses: 'Dépenses',
    reports: 'Rapports',
    settings: 'Paramètres',
    logout: 'Déconnexion'
  },

  menu: {
    sales: {
      title: 'Ventes',
      newSale: 'Nouvelle vente',
      salesList: 'Liste des ventes',
      invoices: 'Factures',
      cashRegister: 'Caisse'
    },
    products: {
      title: 'Produits',
      productList: 'Liste des produits',
      categories: 'Catégories',
      brands: 'Marques',
      units: 'Unités'
    },
    customers: {
      title: 'Clients',
      customerList: 'Liste des clients',
      customerTracking: 'Suivie Clients',
      debts: 'Dettes'
    },
    suppliers: {
      title: 'Fournisseurs',
      supplierList: 'Liste des fournisseurs',
      purchases: 'Achats',
      payments: 'Paiements'
    },
    expenses: {
      title: 'Dépenses',
      expenseList: 'Liste des dépenses',
      categories: 'Catégories',
      reports: 'Rapports'
    },
    statistics: {
      title: 'Statistiques',
      salesStats: 'Statistiques de vente',
      productStats: 'Statistiques produits',
      customerStats: 'Statistiques clients'
    },
    settings: {
      title: 'Paramètres',
      general: 'Général',
      company: 'Entreprise',
      users: 'Utilisateurs',
      roles: 'Rôles',
      subscription: 'Abonnement',
      documentation: 'Documentation'
    }
  },

  settings: {
    title: 'Paramètres',
    subtitle: 'Configurez vos informations liées à votre entreprise',
    searchPlaceholder: 'Rechercher dans les paramètres',

    sections: {
      general: {
        title: 'GENERAL',
        subtitle: 'GENERAL SETTINGS'
      },
      invoice: {
        title: 'FACTURE',
        subtitle: 'PERSONNALISER VOTRE FACTURE'
      },
      users: {
        title: 'UTILISATEURS & RÔLES',
        subtitle: 'GESTION DES ACCÈS'
      },
      subscription: {
        title: 'ABONNEMENT',
        subtitle: 'GERER VOTRE FORFAIT'
      },
      documentation: {
        title: 'DOCUMENTATION',
        subtitle: 'GUIDE D\'UTILISATION'
      }
    },

    company: {
      title: 'Sociétés',
      name: 'Nom de l\'entreprise',
      email: 'E-mail',
      phone: 'Téléphone',
      address: 'Adresse',
      namePlaceholder: 'Ex: Tenant du client 1',
      emailPlaceholder: "Ex: client1{'@'}tenant.com",
      phonePlaceholder: 'Ex: +221 XX XXX XX XX',
      addressPlaceholder: 'Adresse complète de l\'entreprise',
      updateButton: 'Mettre à jour les informations',
      updating: 'Mise à jour...',
      updateSuccess: 'Informations mises à jour avec succès !',
      updateError: 'Erreur lors de la mise à jour',
      requiredFields: 'Le nom et l\'email sont obligatoires'
    },

    branding: {
      title: 'Branding',
      logo: 'Logo',
      chooseFile: 'Choisir un fichier',
      noFile: 'Aucun fichier choisi',
      logoInfo: 'Sera redimensionné à 75px de hauteur. JPG, GIF et PNG acceptés'
    },

    language: {
      title: 'Langues',
      current: 'Langue actuelle',
      interface: 'Langue de l\'interface',
      select: 'Sélectionnez une langue :',
      french: 'Français',
      english: 'English',
      changing: 'Changement en cours...',
      changeSuccess: 'Langue modifiée avec succès. La page va se recharger.',
      changeError: 'Impossible de changer la langue'
    },

    documentation: {
      title: 'Documentation de l\'Application',
      subtitle: 'Guide complet d\'utilisation de SG-Stock',

      overview: {
        title: 'Présentation de SG-Stock',
        description: 'SG-Stock est une solution complète de gestion d\'entreprise conçue pour optimiser vos opérations commerciales, de la gestion des stocks à la facturation, en passant par le suivi des ventes et la gestion de caisse.',
        forWho: 'Pour qui ?',
        targets: {
          sme: 'Petites et moyennes entreprises',
          retail: 'Commerces de détail et de gros',
          services: 'Entreprises de services',
          multiStore: 'Points de vente multiples'
        }
      },

      features: {
        title: 'Fonctionnalités Principales',
        products: {
          title: 'Gestion des Produits',
          catalog: 'Catalogue produits complet avec catégories',
          pricing: 'Suivi des prix d\'achat et de vente',
          barcode: 'Gestion des codes-barres',
          images: 'Images et descriptions détaillées',
          variants: 'Variantes de produits'
        },
        inventory: {
          title: 'Gestion des Stocks',
          realTime: 'Suivi en temps réel des stocks',
          alerts: 'Alertes de stock minimum',
          movements: 'Mouvements de stock détaillés',
          physical: 'Inventaire physique',
          multiStore: 'Multi-magasins'
        },
        sales: {
          title: 'Ventes & Caisse',
          pos: 'Interface de vente rapide (POS)',
          cashManagement: 'Gestion de caisse complète',
          openClose: 'Ouverture/fermeture de caisse',
          dailyReports: 'Rapports journaliers automatiques',
          multiPayment: 'Multiples modes de paiement'
        },
        invoicing: {
          title: 'Facturation',
          autoGenerate: 'Génération automatique de factures',
          customization: 'Personnalisation des modèles',
          email: 'Envoi par email',
          tracking: 'Suivi des paiements',
          quotes: 'Gestion des devis'
        },
        contacts: {
          title: 'Clients & Fournisseurs',
          directory: 'Carnet d\'adresses complet',
          history: 'Historique des transactions',
          credits: 'Gestion des crédits clients',
          debts: 'Suivi des dettes',
          notes: 'Notes et commentaires'
        },
        expenses: {
          title: 'Gestion des Dépenses',
          recording: 'Enregistrement des dépenses',
          categorization: 'Catégorisation des dépenses',
          documents: 'Pièces justificatives',
          reports: 'Rapports de dépenses',
          budget: 'Budget prévisionnel'
        },
        analytics: {
          title: 'Analytique & Rapports',
          dashboards: 'Tableaux de bord personnalisés',
          salesStats: 'Statistiques de ventes',
          margins: 'Analyse des marges',
          export: 'Rapports exportables (PDF, Excel)',
          charts: 'Graphiques interactifs'
        },
        users: {
          title: 'Utilisateurs & Permissions',
          roles: 'Gestion des rôles (Admin, Caissier, etc.)',
          permissions: 'Permissions granulaires',
          multiUser: 'Multi-utilisateurs',
          logs: 'Journaux d\'activité',
          security: 'Sécurité renforcée'
        }
      },

      roles: {
        title: 'Rôles et Autorisations',
        description: 'L\'application propose une gestion fine des permissions selon les rôles :',
        superAdmin: {
          title: 'Super Administrateur',
          description: 'Accès complet à toutes les fonctionnalités et paramètres système'
        },
        manager: {
          title: 'Manager / Gestionnaire',
          description: 'Gestion complète des opérations, rapports et supervision d\'équipe'
        },
        cashier: {
          title: 'Caissier',
          description: 'Accès aux ventes, encaissement et gestion de caisse uniquement'
        },
        warehouseKeeper: {
          title: 'Magasinier',
          description: 'Gestion des stocks, inventaire et mouvements de marchandises'
        },
        sales: {
          title: 'Commercial',
          description: 'Gestion clients, devis et suivi des ventes'
        },
        note: 'L\'admin ou le superadmin peut configurer les rôles et les fonctionnalités comme il le souhaite.'
      },

      terms: {
        title: 'Conditions d\'Utilisation',
        acceptance: {
          title: 'Acceptation des conditions',
          content: 'En utilisant SG-Stock, vous acceptez d\'être lié par ces conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser l\'application.'
        },
        appropriateUse: {
          title: 'Utilisation appropriée',
          legal: 'Utilisez l\'application uniquement pour des activités commerciales légales',
          credentials: 'Ne partagez pas vos identifiants de connexion',
          rights: 'Respectez les droits des autres utilisateurs',
          malicious: 'N\'introduisez pas de contenu malveillant'
        },
        responsibilities: {
          title: 'Responsabilités de l\'utilisateur',
          confidentiality: 'Maintenir la confidentialité de vos informations de compte',
          backups: 'Effectuer des sauvegardes régulières de vos données',
          accuracy: 'Vérifier l\'exactitude des informations saisies',
          security: 'Signaler tout problème de sécurité immédiatement'
        },
        dataProtection: {
          title: 'Protection des données',
          content: 'Nous nous engageons à protéger vos données conformément au RGPD. Vos informations sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers sans votre consentement.'
        },
        liability: {
          title: 'Limitation de responsabilité',
          content: 'L\'application est fournie "en l\'état". Nous ne garantissons pas que le service sera ininterrompu ou exempt d\'erreurs. Vous êtes responsable de vos décisions commerciales basées sur les données de l\'application.'
        },
        support: {
          title: 'Support technique',
          content: 'Un support technique est disponible pour vous aider. Contactez-nous par email ou via le système de tickets intégré pour toute assistance.',
          contact: 'Contact Support: support@sg-stock.com',
          responseTime: 'Délai de réponse moyen: 24-48 heures'
        }
      },

      gettingStarted: {
        title: 'Démarrage Rapide',
        step1: {
          title: 'Configuration initiale :',
          description: 'Renseignez les informations de votre entreprise dans les paramètres généraux'
        },
        step2: {
          title: 'Créez vos magasins :',
          description: 'Configurez vos points de vente ou entrepôts'
        },
        step3: {
          title: 'Ajoutez vos produits :',
          description: 'Importez ou créez votre catalogue de produits'
        },
        step4: {
          title: 'Créez les utilisateurs :',
          description: 'Ajoutez votre équipe avec les rôles appropriés'
        },
        step5: {
          title: 'Commencez à vendre :',
          description: 'Ouvrez une caisse et effectuez votre première vente !'
        }
      },

      help: {
        title: 'Besoin d\'aide ?',
        description: 'Notre équipe est là pour vous accompagner dans l\'utilisation de SG-Stock',
        contactButton: 'Contacter le support'
      }
    }
  }
}
