/**
 * Seed script: Creates/updates the admin user with a secure password.
 *
 * Usage:
 *   npx wrangler d1 execute firststep-db --local --command "DELETE FROM admin_users WHERE username='admin'"
 *   npx tsx src/seed-admin.ts <password>
 *
 * Or simply run: npm run db:seed-admin
 *   (you'll be prompted for the password)
 */

import { generateSalt, hashPassword } from './lib/auth'

async function main() {
  const password = process.argv[2] || 'ChangeMe@2026'
  const username = process.argv[3] || 'admin'
  const email = process.argv[4] || 'admin@firststepcs.com'

  const salt = generateSalt()
  const hash = await hashPassword(password, salt)

  const sql = `UPDATE admin_users SET password_hash = '${hash}', password_salt = '${salt}', updated_at = datetime('now') WHERE username = '${username}';`

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Admin User Seed Script')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`  Username: ${username}`)
  console.log(`  Email:    ${email}`)
  console.log(`  Password: ${'*'.repeat(password.length)}`)
  console.log(`  Salt:     ${salt}`)
  console.log(`  Hash:     ${hash.substring(0, 32)}...\n`)
  console.log('  Run this SQL to set the password:\n')
  console.log(sql)
  console.log('\n  Or run:')
  console.log(`  npx wrangler d1 execute firststep-db --local --command "${sql.replace(/"/g, '\\"')}"`)
  console.log(`  npx wrangler d1 execute firststep-db --remote --command "${sql.replace(/"/g, '\\"')}"`)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().catch(console.error)
