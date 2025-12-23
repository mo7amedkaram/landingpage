'use client';

import { useEffect } from 'react';

interface ThemeProviderProps {
    theme: {
        // New nested buttons structure
        buttons?: {
            heroCta?: string;
            formSubmit?: string;
            stickyMobile?: string;
            secondaryCta?: string;
        };
        // Legacy flat button colors (for backwards compatibility)
        heroBtnColor?: string;
        formBtnColor?: string;
        primaryColor?: string;
        // Other colors
        accentColor?: string;
        secondaryAccent?: string;
        secondaryColor?: string;
        pageBgColor?: string;
        backgroundColor?: string;
        painSectionBg?: string;
        painSectionColor?: string;
        textColor?: string;
        headingColor?: string;
    };
    children: React.ReactNode;
}

// Helper to darken a hex color (with null safety)
function darkenColor(hex: string | undefined, percent: number): string {
    if (!hex) return '#000000';
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
    const B = Math.max(0, (num & 0x0000ff) - amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
    useEffect(() => {
        const root = document.documentElement;

        // Button colors: prefer new nested structure, fallback to legacy flat names
        const heroCta = theme.buttons?.heroCta || theme.heroBtnColor || theme.primaryColor || '#ef4444';
        const formSubmit = theme.buttons?.formSubmit || theme.formBtnColor || theme.primaryColor || '#ef4444';
        const stickyMobile = theme.buttons?.stickyMobile || theme.heroBtnColor || theme.primaryColor || '#ef4444';
        const secondaryCta = theme.buttons?.secondaryCta || theme.secondaryAccent || theme.secondaryColor || '#0284c7';

        // Other colors with fallbacks
        const accentColor = theme.accentColor || '#16a34a';
        const secondaryAccent = theme.secondaryAccent || theme.secondaryColor || '#0284c7';
        const pageBgColor = theme.pageBgColor || theme.backgroundColor || '#ffffff';
        const painSectionBg = theme.painSectionBg || theme.painSectionColor || '#fef2f2';
        const textColor = theme.textColor || '#334155';
        const headingColor = theme.headingColor || '#1e293b';

        // Set CSS custom properties for buttons
        root.style.setProperty('--btn-hero-cta', heroCta);
        root.style.setProperty('--btn-hero-cta-hover', darkenColor(heroCta, 10));
        root.style.setProperty('--btn-form-submit', formSubmit);
        root.style.setProperty('--btn-form-submit-hover', darkenColor(formSubmit, 10));
        root.style.setProperty('--btn-sticky-mobile', stickyMobile);
        root.style.setProperty('--btn-sticky-mobile-hover', darkenColor(stickyMobile, 10));
        root.style.setProperty('--btn-secondary-cta', secondaryCta);
        root.style.setProperty('--btn-secondary-cta-hover', darkenColor(secondaryCta, 10));

        // Set CSS custom properties for other colors
        root.style.setProperty('--color-accent', accentColor);
        root.style.setProperty('--color-secondary', secondaryAccent);
        root.style.setProperty('--color-secondary-hover', darkenColor(secondaryAccent, 10));
        root.style.setProperty('--color-page-bg', pageBgColor);
        root.style.setProperty('--color-pain-bg', painSectionBg);
        root.style.setProperty('--color-text', textColor);
        root.style.setProperty('--color-heading', headingColor);

        // Cleanup on unmount
        return () => {
            root.style.removeProperty('--btn-hero-cta');
            root.style.removeProperty('--btn-hero-cta-hover');
            root.style.removeProperty('--btn-form-submit');
            root.style.removeProperty('--btn-form-submit-hover');
            root.style.removeProperty('--btn-sticky-mobile');
            root.style.removeProperty('--btn-sticky-mobile-hover');
            root.style.removeProperty('--btn-secondary-cta');
            root.style.removeProperty('--btn-secondary-cta-hover');
            root.style.removeProperty('--color-accent');
            root.style.removeProperty('--color-secondary');
            root.style.removeProperty('--color-secondary-hover');
            root.style.removeProperty('--color-page-bg');
            root.style.removeProperty('--color-pain-bg');
            root.style.removeProperty('--color-text');
            root.style.removeProperty('--color-heading');
        };
    }, [theme]);

    return <>{children}</>;
}
