import type { Config } from 'tailwindcss'
import preset from '../../packages/config/tailwind/preset'

export default {
  presets: [preset],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/**/*.{ts,tsx}',
  ],
} satisfies Config
