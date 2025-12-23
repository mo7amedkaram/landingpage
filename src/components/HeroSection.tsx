'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { Heart, Shield, Clock } from 'lucide-react';
import { scrollToElement } from '@/lib/utils';

export function HeroSection() {
    const handleCTAClick = () => {
        scrollToElement('registration-form');
    };

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-bl from-blue-50 via-white to-blue-100">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-20 right-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-20 left-10 w-96 h-96 bg-red-100/30 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
            </div>

            {/* Floating Icons */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-1/4 right-1/4"
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 4, repeat: Infinity }}
                >
                    <Heart className="w-8 h-8 text-red-400/40" />
                </motion.div>
                <motion.div
                    className="absolute bottom-1/3 left-1/5"
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 5, repeat: Infinity }}
                >
                    <Shield className="w-10 h-10 text-blue-400/40" />
                </motion.div>
            </div>

            <div className="container mx-auto px-4 py-16 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
                    >
                        <Clock className="w-4 h-4" />
                        <span>تدريب مكثف 72 ساعة</span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
                    >
                        احترف مهارات{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-blue-800">
                            إنقاذ الحياة
                        </span>{' '}
                        والتمريض الأساسي في{' '}
                        <span className="text-red-600">72 ساعة</span>{' '}
                        فقط
                    </motion.h1>

                    {/* Sub-headline */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
                    >
                        تدريب عملي مكثف يؤهلك للتعامل مع الطوارئ الطبية بثقة.
                        <br />
                        <span className="font-semibold text-gray-800">(شامل الأدوات والشهادة)</span>
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Button
                            size="lg"
                            onClick={handleCTAClick}
                            className="text-xl px-10 py-6 h-auto animate-pulse hover:animate-none"
                        >
                            <Heart className="w-6 h-6" />
                            احجز مقعدي ومقعد زميلي الآن
                        </Button>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-gray-500"
                    >
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-500" />
                            <span>شهادة معتمدة</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500" />
                            <span>تطبيق عملي 100%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <span>3 أيام متتالية</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
