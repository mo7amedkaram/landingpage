'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { trackLeadConversion } from '@/components/PixelComponent';
import { getWhatsAppLink } from '@/lib/utils';
import { CheckCircle, MessageCircle, ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';

export default function ThankYouPage() {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201234567890';
    const whatsappMessage = 'مرحباً! أريد تأكيد حجزي في دورة الإسعافات الأولية.';

    useEffect(() => {
        // Fire Lead conversion event on page load
        trackLeadConversion();
    }, []);

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
                                    سنتواصل معكم قريباً لتأكيد الحجز وتحديد موعد الدورة
                                </p>
                            </motion.div>

                            {/* Next Step */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-blue-50 rounded-xl p-4 border border-blue-100"
                            >
                                <h3 className="font-semibold text-blue-800 mb-2">
                                    الخطوة التالية:
                                </h3>
                                <p className="text-blue-700 text-sm">
                                    تواصل معنا عبر واتساب لتأكيد حجزك والحصول على تفاصيل الدورة
                                </p>
                            </motion.div>

                            {/* WhatsApp CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <a
                                    href={getWhatsAppLink(whatsappNumber, whatsappMessage)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button size="lg" className="w-full text-lg py-6 h-auto bg-green-600 hover:bg-green-700">
                                        <MessageCircle className="w-6 h-6" />
                                        تأكيد الحجز عبر واتساب
                                    </Button>
                                </a>
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
