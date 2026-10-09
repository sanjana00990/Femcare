/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Lavender & White brand palette ───────────────────────
        'rose-blush':     '#F7F5FD',
        'rose-light':     '#EEEAFB',
        'rose-soft':      '#E3DDF7',
        'rose-accent':    '#6F5CD0',
        'rose-primary':   '#6F5CD0',
        'rose-deep':      '#5A47BA',
        'rose-dark':      '#2B2540',
        'mauve-light':    '#EEEAFB',
        'mauve-soft':     '#E3DDF7',
        'mauve-mid':      '#A9A2C4',
        'mauve-deep':     '#665E80',

        // ── Dark (deep lavender) palette ─────────────────────────
        'plum-900':       '#0E0C16',
        'plum-800':       '#15121F',
        'plum-700':       '#1A1729',
        'plum-600':       '#1F1B2E',
        'plum-500':       '#2A2441',
        'plum-400':       '#322C48',
        'plum-300':       '#383055',
        'plum-200':       '#4A426B',

        // ── Semantic page tokens ─────────────────────────────
        'bg-base':        '#F7F5FD',
        'bg-surface':     '#FFFFFF',
        'bg-card':        '#FFFFFF',
        'bg-sidebar':     '#EEEAFB',

        // ── Gray scale remapped to lavender-tinted ───────────
        gray: {
          50:  '#FAFAFD',
          100: '#2B2540',   // dark text
          200: '#3D3660',
          300: '#665E80',   // muted
          400: '#A9A2C4',
          500: '#C5C0D8',   // subtle
          600: '#D8D3E8',
          700: '#E3DDF7',
          800: '#EEEAFB',
          900: '#F7F5FD',
        },

        // ── Brand / functional ───────────────────────────────
        'primary-purple':   '#6F5CD0',
        'primary-pink':     '#6F5CD0',
        'primary-peach':    '#A596F0',
        'accent-rose':      '#6F5CD0',
        'accent-lavender':  '#5A47BA',
        'accent-violet':    '#5A47BA',
        'primary-teal':     '#6F5CD0',   // legacy alias → lavender
        'light-purple':     '#A596F0',
        'lavender-bg':      '#F7F5FD',

        // ── Text ─────────────────────────────────────────────
        'fem-text':         '#2B2540',
        'fem-muted':        '#665E80',
        'fem-subtle':       '#A9A2C4',
        'fem-border':       'rgba(111, 92, 208, 0.15)',
        'text-body':        '#2B2540',
        'text-muted':       '#665E80',

        // ── Additional legacy aliases ─────────────────────────
        'bg-card-hover':    '#EEEAFB',
        'lavender-100':     '#EEEAFB',
        'lavender-200':     '#E3DDF7',
        'lavender-300':     '#C5C0D8',
        'lavender-400':     '#A596F0',
        'lavender-500':     '#6F5CD0',
        'lavender-600':     '#5A47BA',
        'lavender-700':     '#2B2540',
        'lavender-800':     '#1F1B2E',
        'lavender-900':     '#15121F',
        'dark-base':        '#15121F',
        'dark-surface':     '#1A1729',
        'dark-card':        '#1F1B2E',
        'dark-elevated':    '#2A2441',
      },

      fontFamily: {
        sans:    ['"DM Sans"', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },

      borderRadius: {
        '2xl': '16px',
        '3xl': '22px',
        '4xl': '28px',
        '5xl': '32px',
      },

      boxShadow: {
        'rose-card':   '0 10px 30px rgba(111, 92, 208, 0.08), 0 2px 8px rgba(111, 92, 208, 0.05)',
        'rose-hover':  '0 20px 50px rgba(111, 92, 208, 0.16), 0 4px 12px rgba(111, 92, 208, 0.10)',
        'rose-glow':   '0 0 20px rgba(111, 92, 208, 0.15)',
        'rose-btn':    '0 4px 16px rgba(111, 92, 208, 0.40)',
        'rose-deep':   '0 0 40px rgba(111, 92, 208, 0.15)',
        // legacy aliases
        'fem-card':    '0 10px 30px rgba(111, 92, 208, 0.08)',
        'fem-hover':   '0 20px 50px rgba(111, 92, 208, 0.16)',
        'fem-glow':    '0 0 20px rgba(111, 92, 208, 0.15)',
        'fem-pink':    '0 4px 20px rgba(111, 92, 208, 0.20)',
        'fem-button':  '0 4px 16px rgba(111, 92, 208, 0.40)',
      },

      backgroundImage: {
        'grad-rose':    'linear-gradient(135deg, #6F5CD0 0%, #A596F0 100%)',
        'grad-mauve':   'linear-gradient(135deg, #5A47BA 0%, #6F5CD0 100%)',
        'grad-blush':   'linear-gradient(135deg, #EEEAFB 0%, #FFFFFF 100%)',
        'grad-deep':    'linear-gradient(135deg, #5A47BA 0%, #6F5CD0 100%)',
        'grad-page':    'linear-gradient(145deg, #F7F5FD 0%, #FFFFFF 50%, #F7F5FD 100%)',
        'grad-sidebar': 'linear-gradient(180deg, #EEEAFB 0%, #E3DDF7 100%)',
        'grad-card':    'linear-gradient(135deg, rgba(255,255,255,0.90) 0%, rgba(238,234,251,0.80) 100%)',
        'grad-hero':    'linear-gradient(135deg, #EEEAFB 0%, #FFFFFF 100%)',
        // legacy
        'grad-purple':  'linear-gradient(135deg, #6F5CD0 0%, #A596F0 100%)',
        'grad-pink':    'linear-gradient(135deg, #A596F0 0%, #C5C0D8 100%)',
        'grad-peach':   'linear-gradient(135deg, #C5C0D8 0%, #A596F0 100%)',
        'grad-lavender':'linear-gradient(135deg, #5A47BA 0%, #6F5CD0 100%)',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'pulse-rose': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(111,92,208,0.0)' },
          '50%':      { boxShadow: '0 0 16px 4px rgba(111,92,208,0.28)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(111,92,208,0.0)' },
          '50%':      { boxShadow: '0 0 16px 4px rgba(111,92,208,0.28)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'float':       'float 4s ease-in-out infinite',
        'pulse-rose':  'pulse-rose 2.5s ease-in-out infinite',
        'pulse-glow':  'pulse-glow 2.5s ease-in-out infinite',
        'fade-up':     'fade-up 0.5s ease both',
        'slide-in':    'slide-in 0.4s ease both',
        'shimmer':     'shimmer 1.5s linear infinite',
      },
    },
  },
  plugins: [],
}
