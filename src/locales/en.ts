export default {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    loading: 'Loading...',
    noData: 'No data available',
    actions: 'Actions',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    yes: 'Yes',
    no: 'No',
    confirm: 'Confirm',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    refresh: 'Refresh',
    view: 'View',
    details: 'Details',
    total: 'Total',
    date: 'Date',
    amount: 'Amount',
    description: 'Description',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    required: 'Required',
    optional: 'Optional'
  },

  nav: {
    dashboard: 'Dashboard',
    sales: 'Sales',
    products: 'Products',
    inventory: 'Inventory',
    customers: 'Customers',
    suppliers: 'Suppliers',
    expenses: 'Expenses',
    reports: 'Reports',
    settings: 'Settings',
    logout: 'Logout'
  },

  menu: {
    sales: {
      title: 'Sales',
      newSale: 'New Sale',
      salesList: 'Sales List',
      invoices: 'Invoices',
      cashRegister: 'Cash Register'
    },
    products: {
      title: 'Products',
      productList: 'Product List',
      categories: 'Categories',
      brands: 'Brands',
      units: 'Units'
    },
    customers: {
      title: 'Customers',
      customerList: 'Customer List',
      customerTracking: 'Customer Tracking',
      debts: 'Debts'
    },
    suppliers: {
      title: 'Suppliers',
      supplierList: 'Supplier List',
      purchases: 'Purchases',
      payments: 'Payments'
    },
    expenses: {
      title: 'Expenses',
      expenseList: 'Expense List',
      categories: 'Categories',
      reports: 'Reports'
    },
    statistics: {
      title: 'Statistics',
      salesStats: 'Sales Statistics',
      productStats: 'Product Statistics',
      customerStats: 'Customer Statistics'
    },
    settings: {
      title: 'Settings',
      general: 'General',
      company: 'Company',
      users: 'Users',
      roles: 'Roles',
      subscription: 'Subscription',
      documentation: 'Documentation'
    }
  },

  settings: {
    title: 'Settings',
    subtitle: 'Configure your company information',
    searchPlaceholder: 'Search in settings',

    sections: {
      general: {
        title: 'GENERAL',
        subtitle: 'GENERAL SETTINGS'
      },
      invoice: {
        title: 'INVOICE',
        subtitle: 'CUSTOMIZE YOUR INVOICE'
      },
      users: {
        title: 'USERS & ROLES',
        subtitle: 'ACCESS MANAGEMENT'
      },
      subscription: {
        title: 'SUBSCRIPTION',
        subtitle: 'MANAGE YOUR PLAN'
      },
      documentation: {
        title: 'DOCUMENTATION',
        subtitle: 'USER GUIDE'
      }
    },

    company: {
      title: 'Company',
      name: 'Company Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      namePlaceholder: 'E.g.: Client 1 Tenant',
      emailPlaceholder: 'E.g.: client1@tenant.com',
      phonePlaceholder: 'E.g.: +221 XX XXX XX XX',
      addressPlaceholder: 'Full company address',
      updateButton: 'Update Information',
      updating: 'Updating...',
      updateSuccess: 'Information updated successfully!',
      updateError: 'Error updating information',
      requiredFields: 'Name and email are required'
    },

    branding: {
      title: 'Branding',
      logo: 'Logo',
      chooseFile: 'Choose File',
      noFile: 'No file chosen',
      logoInfo: 'Will be resized to 75px height. JPG, GIF and PNG accepted'
    },

    language: {
      title: 'Languages',
      current: 'Current Language',
      interface: 'Interface Language',
      select: 'Select a language:',
      french: 'French',
      english: 'English',
      changing: 'Changing...',
      changeSuccess: 'Language changed successfully. Page will reload.',
      changeError: 'Unable to change language'
    },

    documentation: {
      title: 'Application Documentation',
      subtitle: 'Complete SG-Stock User Guide',

      overview: {
        title: 'SG-Stock Overview',
        description: 'SG-Stock is a comprehensive business management solution designed to optimize your business operations, from inventory management to invoicing, including sales tracking and cash management.',
        forWho: 'Who is it for?',
        targets: {
          sme: 'Small and medium-sized enterprises',
          retail: 'Retail and wholesale businesses',
          services: 'Service companies',
          multiStore: 'Multiple points of sale'
        }
      },

      features: {
        title: 'Main Features',
        products: {
          title: 'Product Management',
          catalog: 'Complete product catalog with categories',
          pricing: 'Purchase and sale price tracking',
          barcode: 'Barcode management',
          images: 'Detailed images and descriptions',
          variants: 'Product variants'
        },
        inventory: {
          title: 'Inventory Management',
          realTime: 'Real-time inventory tracking',
          alerts: 'Low stock alerts',
          movements: 'Detailed stock movements',
          physical: 'Physical inventory',
          multiStore: 'Multi-store'
        },
        sales: {
          title: 'Sales & Cash Register',
          pos: 'Fast POS interface',
          cashManagement: 'Complete cash management',
          openClose: 'Cash register opening/closing',
          dailyReports: 'Automatic daily reports',
          multiPayment: 'Multiple payment methods'
        },
        invoicing: {
          title: 'Invoicing',
          autoGenerate: 'Automatic invoice generation',
          customization: 'Template customization',
          email: 'Email sending',
          tracking: 'Payment tracking',
          quotes: 'Quote management'
        },
        contacts: {
          title: 'Customers & Suppliers',
          directory: 'Complete address book',
          history: 'Transaction history',
          credits: 'Customer credit management',
          debts: 'Debt tracking',
          notes: 'Notes and comments'
        },
        expenses: {
          title: 'Expense Management',
          recording: 'Expense recording',
          categorization: 'Expense categorization',
          documents: 'Supporting documents',
          reports: 'Expense reports',
          budget: 'Budget forecasting'
        },
        analytics: {
          title: 'Analytics & Reports',
          dashboards: 'Custom dashboards',
          salesStats: 'Sales statistics',
          margins: 'Margin analysis',
          export: 'Exportable reports (PDF, Excel)',
          charts: 'Interactive charts'
        },
        users: {
          title: 'Users & Permissions',
          roles: 'Role management (Admin, Cashier, etc.)',
          permissions: 'Granular permissions',
          multiUser: 'Multi-user',
          logs: 'Activity logs',
          security: 'Enhanced security'
        }
      },

      roles: {
        title: 'Roles and Permissions',
        description: 'The application offers fine-grained permission management by role:',
        superAdmin: {
          title: 'Super Administrator',
          description: 'Full access to all features and system settings'
        },
        manager: {
          title: 'Manager',
          description: 'Complete management of operations, reports and team supervision'
        },
        cashier: {
          title: 'Cashier',
          description: 'Access to sales, cash collection and cash management only'
        },
        warehouseKeeper: {
          title: 'Warehouse Keeper',
          description: 'Inventory management, inventory and goods movements'
        },
        sales: {
          title: 'Sales Representative',
          description: 'Customer management, quotes and sales tracking'
        },
        note: 'The admin or superadmin can configure roles and features as desired.'
      },

      terms: {
        title: 'Terms of Use',
        acceptance: {
          title: 'Acceptance of terms',
          content: 'By using SG-Stock, you agree to be bound by these terms of use. If you do not accept these terms, please do not use the application.'
        },
        appropriateUse: {
          title: 'Appropriate use',
          legal: 'Use the application only for legal business activities',
          credentials: 'Do not share your login credentials',
          rights: 'Respect the rights of other users',
          malicious: 'Do not introduce malicious content'
        },
        responsibilities: {
          title: 'User responsibilities',
          confidentiality: 'Maintain the confidentiality of your account information',
          backups: 'Perform regular backups of your data',
          accuracy: 'Verify the accuracy of entered information',
          security: 'Report any security issues immediately'
        },
        dataProtection: {
          title: 'Data protection',
          content: 'We are committed to protecting your data in accordance with GDPR. Your information is stored securely and is never shared with third parties without your consent.'
        },
        liability: {
          title: 'Limitation of liability',
          content: 'The application is provided "as is". We do not guarantee that the service will be uninterrupted or error-free. You are responsible for your business decisions based on application data.'
        },
        support: {
          title: 'Technical support',
          content: 'Technical support is available to help you. Contact us by email or via the integrated ticket system for any assistance.',
          contact: 'Support Contact: support@sg-stock.com',
          responseTime: 'Average response time: 24-48 hours'
        }
      },

      gettingStarted: {
        title: 'Quick Start',
        step1: {
          title: 'Initial setup:',
          description: 'Enter your company information in general settings'
        },
        step2: {
          title: 'Create your stores:',
          description: 'Configure your sales points or warehouses'
        },
        step3: {
          title: 'Add your products:',
          description: 'Import or create your product catalog'
        },
        step4: {
          title: 'Create users:',
          description: 'Add your team with appropriate roles'
        },
        step5: {
          title: 'Start selling:',
          description: 'Open a cash register and make your first sale!'
        }
      },

      help: {
        title: 'Need help?',
        description: 'Our team is here to support you in using SG-Stock',
        contactButton: 'Contact Support'
      }
    }
  }
}
