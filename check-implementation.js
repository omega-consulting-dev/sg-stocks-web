/**
 * Script de vérification de l'implémentation Phase 5
 * Exécuter avec: node check-implementation.js
 */

const fs = require('fs')
const path = require('path')

const checks = {
  passed: [],
  failed: [],
  warnings: []
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    checks.passed.push(`✅ ${description}`)
    return true
  } else {
    checks.failed.push(`❌ ${description} - Fichier manquant: ${filePath}`)
    return false
  }
}

function checkFileContent(filePath, searchStrings, description) {
  if (!fs.existsSync(filePath)) {
    checks.failed.push(`❌ ${description} - Fichier manquant`)
    return false
  }

  const content = fs.readFileSync(filePath, 'utf8')
  const allFound = searchStrings.every(str => content.includes(str))

  if (allFound) {
    checks.passed.push(`✅ ${description}`)
    return true
  } else {
    checks.failed.push(`❌ ${description} - Contenu manquant dans ${filePath}`)
    return false
  }
}

console.log('🔍 Vérification de l\'implémentation Phase 5...\n')

// 1. Vérifier les fichiers API
console.log('📁 Vérification des API Services...')
checkFileExists('src/services/api/analytics.api.ts', 'Analytics API existe')
checkFileExists('src/services/api/transfers.api.ts', 'Transfers API existe')
checkFileExists('src/services/api/inventory.api.ts', 'Inventory API existe')

// 2. Vérifier les stores Pinia
console.log('\n📁 Vérification des Stores Pinia...')
checkFileExists('src/stores/dashboard.ts', 'Dashboard Store existe')
checkFileExists('src/stores/transfers.store.ts', 'Transfers Store existe')
checkFileExists('src/stores/inventory.store.ts', 'Inventory Store existe')

// 3. Vérifier les vues
console.log('\n📁 Vérification des Vues...')
checkFileExists('src/pages/transfers/TransfersView.vue', 'Transfers View existe')
checkFileExists('src/pages/inventory/StockView.vue', 'Stock View existe')
checkFileExists('src/pages/inventory/InventoriesView.vue', 'Inventories View existe')

// 4. Vérifier les dialogs
console.log('\n📁 Vérification des Dialogs...')
checkFileExists('src/components/transfers/TransferFormDialog.vue', 'Transfer Form Dialog existe')
checkFileExists('src/components/inventory/StockAdjustmentDialog.vue', 'Stock Adjustment Dialog existe')
checkFileExists('src/components/inventory/InventoryFormDialog.vue', 'Inventory Form Dialog existe')

// 5. Vérifier les routes
console.log('\n📁 Vérification des Routes...')
checkFileContent('src/router/index.ts', [
  '/stock/transfers',
  '/stock/levels',
  '/stock/inventories'
], 'Routes Inventory/Transfers déclarées')

// 6. Vérifier les imports dans les API
console.log('\n📁 Vérification des imports API...')
checkFileContent('src/services/api/analytics.api.ts', [
  'getOverview',
  'getSalesChart',
  'getTopProducts'
], 'Analytics API - méthodes principales')

checkFileContent('src/services/api/transfers.api.ts', [
  'getTransfers',
  'createTransfer',
  'validateTransfer',
  'receiveTransfer'
], 'Transfers API - méthodes principales')

checkFileContent('src/services/api/inventory.api.ts', [
  'getStockLevels',
  'getMovements',
  'createAdjustment',
  'getInventories'
], 'Inventory API - méthodes principales')

// 7. Vérifier les stores utilisent les API
console.log('\n📁 Vérification des connexions Store → API...')
checkFileContent('src/stores/dashboard.ts', [
  'analyticsApi',
  'fetchDashboardData'
], 'Dashboard Store utilise Analytics API')

checkFileContent('src/stores/transfers.store.ts', [
  'transfersApi',
  'fetchTransfers',
  'createTransfer'
], 'Transfers Store utilise Transfers API')

checkFileContent('src/stores/inventory.store.ts', [
  'inventoryApi',
  'fetchStockLevels',
  'createAdjustment'
], 'Inventory Store utilise Inventory API')

// Afficher les résultats
console.log('\n\n' + '='.repeat(60))
console.log('📊 RÉSULTATS DE LA VÉRIFICATION')
console.log('='.repeat(60))

console.log(`\n✅ Tests réussis: ${checks.passed.length}`)
checks.passed.forEach(msg => console.log(`   ${msg}`))

if (checks.warnings.length > 0) {
  console.log(`\n⚠️  Avertissements: ${checks.warnings.length}`)
  checks.warnings.forEach(msg => console.log(`   ${msg}`))
}

if (checks.failed.length > 0) {
  console.log(`\n❌ Tests échoués: ${checks.failed.length}`)
  checks.failed.forEach(msg => console.log(`   ${msg}`))
  console.log('\n⚠️  Certains fichiers sont manquants ou incomplets!')
  process.exit(1)
} else {
  console.log('\n🎉 Tous les fichiers sont en place!')
  console.log('\n📝 Prochaines étapes:')
  console.log('   1. Démarrez le backend Django: python manage.py runserver')
  console.log('   2. Démarrez le frontend: npm run dev')
  console.log('   3. Suivez le guide: GUIDE_TEST_PHASE5.md')
  process.exit(0)
}
