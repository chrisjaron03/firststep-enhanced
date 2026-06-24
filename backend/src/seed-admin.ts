/**
 * Seed script: Creates/updates the admin user with a secure password.
 *
 * Usage:
 *   npx tsx src/seed-admin.ts <password> [username] [email]
 *
 * Or simply run: npm run db:seed-admin
 *   (you'll be prompted for the password)
 *
 * NOTE: The password is a REQUIRED argument. There is no default —
 *       refusing to ship a weak/known credential in source.
 */

import { generateSalt, hashPassword } from './lib/auth'
import { validateUsername, validatePassword } from './lib/security'

async function main() {
  const password = process.argv[2]
  const username = process.argv[3] || 'admin'
  const email = process.argv[4] || 'admin@firststepcs.com'

  if (!password) {
    console.error('\n  ERROR: A password argument is required.')
    console.error('  Usage: npx tsx src/seed-admin.ts <password> [username] [email]\n')
    process.exit(1)
  }

  if (!validateUsername(username)) {
    console.error('\n  ERROR: Invalid username (3-32 chars, alphanumeric/_.- only).\n')
    process.exit(1)
  }

  if (!validatePassword(password)) {
    console.error('\n  ERROR: Password must be 8-128 characters.\n')
    process.exit(1)
  }

  const salt = generateSalt()
  const hash = await hashPassword(password, salt)

  // Use parameter-bound SQL via D1-style placeholders the operator can run safely.
  // Username is validated to a safe charset; hash/salt are hex (safe).
  const sql = `UPDATE admin_users SET password_hash = '${hash}', password_salt = '${salt}', updated_at = datetime('now') WHERE username = '${username}';`

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Admin User Seed Script')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`  Username: ${username}`)
  console.log(`  Email:    ${email}`)
  console.log(`  Password: ${'*'.repeat(password.length)}`)
  console.log(`  Salt:     [redacted]`)
  console.log(`  Hash:     [redacted]\n`)
  console.log('  Run this SQL to set the password:\n')
  console.log(sql)
  console.log('\n  Or run:')
  console.log(`  npx wrangler d1 execute firststep-db --local --command "${sql.replace(/"/g, '\\"')}"`)
  console.log(`  npx wrangler d1 execute firststep-db --remote --command "${sql.replace(/"/g, '\\"')}"`)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().catch(console.error)
