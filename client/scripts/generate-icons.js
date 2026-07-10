import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, '../public/icons')

// Minimal valid 1x1 indigo PNG — replaced with proper icons in Phase 9
const placeholderPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)

const sizes = [72, 96, 128, 144, 192, 512]

mkdirSync(iconsDir, { recursive: true })

for (const size of sizes) {
  writeFileSync(join(iconsDir, `icon-${size}.png`), placeholderPng)
  console.log(`Created icon-${size}.png`)
}

console.log('PWA placeholder icons generated. Replace in Phase 9.')
