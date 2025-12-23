'use client';

import { motion } from 'framer-motion';
import { Users, CheckCircle } from 'lucide-react';

export function BuddySystemHook() {
    return (
        <section className="py-16 bg-gradient-to-l from-blue-600 to-blue-800 text-white">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Users className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    {/* Main Message */}
                    <div className="text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            لماذا نطلب تسجيل شخصين؟
                        </h2>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20">
                            <p className="text-lg md:text-xl leading-relaxed mb-6">
                                نظام التدريب يعتمد على{' '}
                                <span className="font-bold text-yellow-300">التطبيق الثنائي (Buddy System)</span>.
                                <br />
                                يجب حجز مقعدين (لك ولشريكك) لضمان وجود نموذج تطبق عليه العملي.
                            </p>

                            {/* Benefits */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                                    <span>تطبيق عملي حقيقي</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                                    <span>تعلم أفضل مع شريك</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                                    <span>زميل لممارسة المهارات</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                                    <span>دعم متبادل في التدريب</span>
                                </div>
                            </div>
                        </div>

                        {/* Arrow indicator */}
                        <motion.div
                            className="mt-8"
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <svg
                                className="w-10 h-10 mx-auto text-white/70"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                />
                            </svg>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
