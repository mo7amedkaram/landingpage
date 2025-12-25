'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface PixelComponentProps {
    facebookPixelId?: string | null;
    tiktokPixelId?: string | null;
    snapchatPixelId?: string | null;
}

declare global {
    interface Window {
        fbq: (...args: unknown[]) => void;
        _fbq: unknown;
        ttq: {
            load: (id: string) => void;
            page: () => void;
            track: (event: string, data?: unknown) => void;
        };
        snaptr: (...args: unknown[]) => void;
    }
}

export function PixelComponent({
    facebookPixelId,
    tiktokPixelId,
    snapchatPixelId
}: PixelComponentProps) {

    useEffect(() => {
        // Fire PageView on mount
        if (facebookPixelId && typeof window.fbq === 'function') {
            window.fbq('track', 'PageView');
        }
        if (tiktokPixelId && typeof window.ttq?.page === 'function') {
            window.ttq.page();
        }
        if (snapchatPixelId && typeof window.snaptr === 'function') {
            window.snaptr('track', 'PAGE_VIEW');
        }
    }, [facebookPixelId, tiktokPixelId, snapchatPixelId]);

    return (
        <>
            {/* Facebook Pixel */}
            {facebookPixelId && (
                <Script id="facebook-pixel" strategy="afterInteractive">
                    {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${facebookPixelId}');
            fbq('track', 'PageView');
          `}
                </Script>
            )}

            {/* TikTok Pixel */}
            {tiktokPixelId && (
                <Script id="tiktok-pixel" strategy="afterInteractive">
                    {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}
                </Script>
            )}

            {/* Snapchat Pixel */}
            {snapchatPixelId && (
                <Script id="snapchat-pixel" strategy="afterInteractive">
                    {`
            (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
            {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
            a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
            r.src=n;var u=t.getElementsByTagName(s)[0];
            u.parentNode.insertBefore(r,u);})(window,document,
            'https://sc-static.net/scevent.min.js');
            snaptr('init', '${snapchatPixelId}', {});
            snaptr('track', 'PAGE_VIEW');
          `}
                </Script>
            )}
        </>
    );
}

// Helper function to fire Lead conversion event with ROAS value and deduplication
export function trackLeadConversion(eventId?: string) {
    if (typeof window !== 'undefined') {
        // Facebook Lead Event with ROAS value and eventID for deduplication
        if (typeof window.fbq === 'function') {
            const eventData = {
                content_name: 'First Aid Course',
                value: 90.00,    // Venue fee for ROAS calculation
                currency: 'EGP'
            };

            if (eventId) {
                // Fire with eventID for deduplication
                window.fbq('track', 'Lead', eventData, { eventID: eventId });
            } else {
                // Fallback without eventID
                window.fbq('track', 'Lead', eventData);
            }
        }
        // TikTok Lead Event
        if (typeof window.ttq?.track === 'function') {
            window.ttq.track('SubmitForm');
        }
        // Snapchat Lead Event
        if (typeof window.snaptr === 'function') {
            window.snaptr('track', 'SIGN_UP');
        }
    }
}
