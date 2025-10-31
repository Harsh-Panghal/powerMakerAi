import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				/* Brand Colors */
				brand: {
					dark: 'hsl(var(--brand-dark))',
					DEFAULT: 'hsl(var(--brand))',
					medium: 'hsl(var(--brand-medium))',
					accent: 'hsl(var(--brand-accent))',
					light: 'hsl(var(--brand-light))'
				},
				
				/* Status Colors */
				error: {
					DEFAULT: 'hsl(var(--error))',
					light: 'hsl(var(--error-light))',
					dark: 'hsl(var(--error-dark))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					light: 'hsl(var(--warning-light))',
					dark: 'hsl(var(--warning-dark))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					light: 'hsl(var(--success-light))',
					dark: 'hsl(var(--success-dark))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					light: 'hsl(var(--info-light))',
					dark: 'hsl(var(--info-dark))'
				},
				
				/* Layout Colors */
				layout: {
					sidebar: 'hsl(var(--layout-sidebar))',
					main: 'hsl(var(--layout-main))'
				},

				/* Base Colors */
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'flow-smooth': {
					'0%': {
						opacity: '0.3',
						transform: 'scale(1) rotate(0deg)'
					},
					'50%': {
						opacity: '0.6',
						transform: 'scale(1.1) rotate(180deg)'
					},
					'100%': {
						opacity: '0.3',
						transform: 'scale(1) rotate(360deg)'
					}
				},
				slide: {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'50%': {
						transform: 'translateX(200%)'
					},
					'100%': {
						transform: 'translateX(-100%)'
					}
				},
				// UPDATED: Added scale-in animation for send button
				'scale-in': {
					'0%': {
						transform: 'scale(0.8)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'flow-smooth': 'flow-smooth 10s ease-in-out infinite',
				'slide': 'slide 2s ease-in-out infinite',
				// UPDATED: Added scale-in animation
				'scale-in': 'scale-in 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
