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
        // ── Rose & Mauve brand palette ───────────────────────
        'rose-blush':     '#FDF0F2',
        'rose-light':     '#F8E4EA',
        'rose-soft':      '#F2D5DE',
        'rose-accent':    '#E87A90',
        'rose-primary':   '#C94F68',
        'rose-deep':      '#A83A54',
        'rose-dark':      '#8B2D40',
        'mauve-light':    '#F0E6EB',
        'mauve-soft':     '#D4B8C0',
        'mauve-mid':      '#B8A0AA',
        'mauve-deep':     '#8A6070',

        // ── Dark (plum) palette ──────────────────────────────
        'plum-900':       '#120810',
        'plum-800':       '#1A0D12',
        'plum-700':       '#230F18',
        'plum-600':       '#2A1018',
        'plum-500':       '#341422',
        'plum-400':       '#44192D',
        'plum-300':       '#5C2038',
        'plum-200':       '#7A3050',

        // ── Semantic page tokens ─────────────────────────────
        'bg-base':        '#FDF0F2',
        'bg-surface':     '#FFF5F7',
        'bg-card':        '#FFFFFF',
        'bg-sidebar':     '#F8E4EA',

        // ── Gray scale remapped to rose-tinted ───────────────
        gray: {
          50:  '#FDF8F9',
          100: '#8B2D40',   // dark text
          200: '#A03650',
          300: '#B8A0AA',   // muted
          400: '#C4B0B8',
          500: '#D4B8C0',   // subtle
          600: '#E0CDD3',
          700: '#EDD9DE',
          800: '#F5E8EC',
          900: '#FDF5F7',
        },

        // ── Brand / functional ───────────────────────────────
        'primary-purple':   '#C94F68',   // remapped → rose
        'primary-pink':     '#E87A90',
        'primary-peach':    '#F4A4B0',
        'accent-rose':      '#E87A90',
        'accent-lavender':  '#C94F68',
        'accent-violet':    '#A83A54',
        'primary-teal':     '#C94F68',   // legacy alias → rose
        'light-purple':     '#E87A90',
        'lavender-bg':      '#FDF0F2',

        // ── Text ─────────────────────────────────────────────
        'fem-text':         '#8B2D40',
        'fem-muted':        '#B8A0AA',
        'fem-subtle':       '#D4B8C0',
        'fem-border':       'rgba(201, 79, 104, 0.15)',
        'text-body':        '#8B2D40',
        'text-muted':       '#B8A0AA',

        // ── Additional legacy aliases ─────────────────────────
        'bg-card-hover':    '#FFF0F3',
        'lavender-100':     '#FDE8EC',
        'lavender-200':     '#FBCFDA',
        'lavender-300':     '#F4A4B0',
        'lavender-400':     '#E87A90',
        'lavender-500':     '#C94F68',
        'lavender-600':     '#A83A54',
        'lavender-700':     '#8B2D40',
        'lavender-800':     '#6E1E30',
        'lavender-900':     '#4A1020',
        'dark-base':        '#1A0D12',
        'dark-surface':     '#230F18',
        'dark-card':        '#2A1018',
        'dark-elevated':    '#341422',
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
        'rose-card':   '0 10px 30px rgba(201, 79, 104, 0.08), 0 2px 8px rgba(201, 79, 104, 0.05)',
        'rose-hover':  '0 20px 50px rgba(201, 79, 104, 0.16), 0 4px 12px rgba(201, 79, 104, 0.10)',
        'rose-glow':   '0 0 20px rgba(232, 122, 144, 0.30)',
        'rose-btn':    '0 4px 16px rgba(201, 79, 104, 0.40)',
        'rose-deep':   '0 0 40px rgba(201, 79, 104, 0.15)',
        // legacy aliases
        'fem-card':    '0 10px 30px rgba(201, 79, 104, 0.08)',
        'fem-hover':   '0 20px 50px rgba(201, 79, 104, 0.16)',
        'fem-glow':    '0 0 20px rgba(232, 122, 144, 0.30)',
        'fem-pink':    '0 4px 20px rgba(232, 122, 144, 0.35)',
        'fem-button':  '0 4px 16px rgba(201, 79, 104, 0.40)',
      },

      backgroundImage: {
        'grad-rose':    'linear-gradient(135deg, #C94F68 0%, #E87A90 100%)',
        'grad-mauve':   'linear-gradient(135deg, #8B2D40 0%, #C94F68 100%)',
        'grad-blush':   'linear-gradient(135deg, #F8E4EA 0%, #FDF0F2 100%)',
        'grad-deep':    'linear-gradient(135deg, #A83A54 0%, #C94F68 100%)',
        'grad-page':    'linear-gradient(145deg, #FDF0F2 0%, #FFF5F7 50%, #F8EEF1 100%)',
        'grad-sidebar': 'linear-gradient(180deg, #F8E4EA 0%, #F2D5DE 100%)',
        'grad-card':    'linear-gradient(135deg, rgba(255,255,255,0.90) 0%, rgba(253,240,242,0.80) 100%)',
        'grad-hero':    'linear-gradient(135deg, #F8E4EA 0%, #FFF0F3 100%)',
        // legacy
        'grad-purple':  'linear-gradient(135deg, #C94F68 0%, #E87A90 100%)',
        'grad-pink':    'linear-gradient(135deg, #E87A90 0%, #F4A4B0 100%)',
        'grad-peach':   'linear-gradient(135deg, #F4A4B0 0%, #E87A90 100%)',
        'grad-lavender':'linear-gradient(135deg, #C94F68 0%, #A83A54 100%)',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'pulse-rose': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,79,104,0.0)' },
          '50%':      { boxShadow: '0 0 16px 4px rgba(201,79,104,0.28)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,79,104,0.0)' },
          '50%':      { boxShadow: '0 0 16px 4px rgba(201,79,104,0.28)' },
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
