'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui';
import { CheckCircle, ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';

function ThankYouContent() {
    const searchParams = useSearchParams();
    const leadId = searchParams.get('lead_id'); // Get unique DB ID for deduplication
    const fired = useRef(false); // Prevent double-firing in React Strict Mode

    useEffect(() => {
        // ROBUST DEDUPLICATION: Use localStorage to persist across remounts and Strict Mode
        const dedupKey = leadId ? `lead_event_fired_${leadId}` : 'lead_event_fired_generic';
        const alreadyFiredInStorage = typeof window !== 'undefined' && localStorage.getItem(dedupKey);

        // Guard: Only fire if we haven't fired this specific lead_id
        if (alreadyFiredInStorage || fired.current) {
            console.log('[FB Pixel] Skipping duplicate - already fired for:', leadId || 'generic');
            return;
        }

        // Mark as fired IMMEDIATELY (before any async operations)
        fired.current = true;
        if (typeof window !== 'undefined') {
            localStorage.setItem(dedupKey, 'true');
            // Clean up old entries after 24 hours to prevent localStorage bloat
            setTimeout(() => localStorage.removeItem(dedupKey), 24 * 60 * 60 * 1000);
        }

        console.log('[FB Pixel] Firing Lead event with eventID:', leadId || 'none');

        // Fire Facebook Pixel Lead event with eventID for deduplication
        if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
            if (leadId) {
                window.fbq('track', 'Lead', {
                    content_name: 'First Aid Course',
                    value: 90.00,
                    currency: 'EGP'
                }, {
                    eventID: leadId // The Golden Key for Server-Side Deduplication
                });
            } else {
                // Fallback without eventID for direct page access
                window.fbq('track', 'Lead', {
                    content_name: 'First Aid Course',
                    value: 90.00,
                    currency: 'EGP'
                });
            }
        }

        // Fire TikTok
        if (typeof window !== 'undefined' && (window as any).ttq?.track) {
            (window as any).ttq.track('SubmitForm');
        }

        // Fire Snapchat
        if (typeof window !== 'undefined' && typeof (window as any).snaptr === 'function') {
            (window as any).snaptr('track', 'SIGN_UP');
        }
    }, [leadId]);

    return (
        <main className="min-h-screen bg-gradient-to-bl from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="shadow-2xl border-0 overflow-hidden">
                        {/* Success Header */}
                        <div className="bg-gradient-to-l from-green-500 to-green-600 py-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                            >
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl md:text-3xl font-bold text-white"
                            >
                                مبروك! 🎉
                            </motion.h1>
                        </div>

                        <CardContent className="p-6 md:p-8 text-center space-y-6">
                            {/* Success Message */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    تم تسجيل بياناتك وبيانات زميلك مبدئياً
                                </h2>
                                <p className="text-gray-600">
                                    سنتواصل معكم قريباً في خلال 5 لــ 7 أيام برسالة القبول وتحديد موعد المنحة
                                </p>
                            </motion.div>

                            {/* Back to Home */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                            >
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    العودة للصفحة الرئيسية
                                </Link>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Footer */}
                <div className="text-center mt-6 text-sm text-gray-500 flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>شكراً لثقتكم بنا</span>
                </div>
            </div>
        </main>
    );
}

// Wrapper with Suspense for useSearchParams (required by Next.js)
export default function ThankYouPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
            <ThankYouContent />
        </Suspense>
    );
}
