/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// Modern Gen Z palette
				primary: {
					50: '#faf7ff',
					100: '#f3ebff',
					200: '#e9d5ff',
					300: '#d8b4fe',
					400: '#c084fc',
					500: '#a855f7',
					600: '#9333ea',
					700: '#7c3aed',
					800: '#6b21a8',
					900: '#581c87'
				},
				accent: {
					50: '#fff0f5',
					100: '#ffe3ec',
					200: '#ffb3d1',
					300: '#ff80b5',
					400: '#ff4d9a',
					500: '#ff1a7e',
					600: '#e6005c',
					700: '#b3004a',
					800: '#800037',
					900: '#4d0024'
				},
				sage: {
					50: '#f8faf8',
					100: '#f1f5f1',
					200: '#e3ebe3',
					300: '#c9d6c9',
					400: '#a8bea8',
					500: '#87a587',
					600: '#6b8a6b',
					700: '#556b55',
					800: '#445544',
					900: '#334433'
				},
				neutral: {
					50: '#fafafa',
					100: '#f5f5f5',
					200: '#e5e5e5',
					300: '#d4d4d4',
					400: '#a3a3a3',
					500: '#737373',
					600: '#525252',
					700: '#404040',
					800: '#262626',
					900: '#171717'
				}
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif']
			},
			animation: {
				'fade-in': 'fadeIn 0.4s ease-out',
				'slide-up': 'slideUp 0.4s ease-out',
				float: 'float 3s ease-in-out infinite'
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(5px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				slideUp: {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				}
			}
		}
	}
};
