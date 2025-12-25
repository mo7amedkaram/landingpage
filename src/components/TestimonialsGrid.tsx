'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Star, Quote, User } from 'lucide-react';

interface ReviewItem {
    id: number;
    name: string;
    title?: string;
    avatar?: string;
    rating: number;
    review: string;
}

interface TestimonialsGridProps {
    title?: string;
    subtitle?: string;
    items?: ReviewItem[];
}

// Animation variants
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.12 } },
};

// ReviewCard Component
function ReviewCard({ review }: { review: ReviewItem }) {
    return (
        <motion.div
            variants={fadeUp}
            className="break-inside-avoid"
        >
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                {/* Quote Icon */}
                <div className="mb-4">
                    <Quote className="w-8 h-8 text-sky-200 group-hover:text-sky-300 transition-colors" />
                </div>

                {/* Review Text */}
                <p className="text-slate-700 text-lg leading-relaxed mb-6">
                    "{review.review}"
                </p>

                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-5 h-5 ${i < review.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                                }`}
                        />
                    ))}
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 pt-4">
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        {review.avatar ? (
                            <img
                                src={review.avatar}
                                alt={review.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-100"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                {review.name ? review.name.charAt(0) : '?'}
                            </div>
                        )}

                        {/* Name & Title */}
                        <div>
                            <h4 className="font-bold text-slate-800 text-base">
                                {review.name}
                            </h4>
                            {review.title && (
                                <p className="text-slate-500 text-sm">
                                    {review.title}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export function TestimonialsGrid({
    title = 'رأي خريجي الدفعات السابقة',
    subtitle = 'قصص حقيقية من شباب زيك غيروا حياتهم واتعلموا ينقذوا غيرهم.',
    items = [],
}: TestimonialsGridProps) {
    // Don't render section if no reviews
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="text-center mb-14"
                >
                    <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-5 py-2.5 rounded-full mb-5">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-bold">شهادات حقيقية</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 mb-5">
                        {title}
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Masonry Grid of Cards */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="columns-1 md:columns-2 lg:columns-3 gap-6 max-w-6xl mx-auto space-y-6"
                >
                    {items.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </motion.div>

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-14"
                >
                    <div className="inline-flex items-center gap-3 bg-green-50 text-green-700 px-6 py-3 rounded-full border border-green-200">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                            ))}
                        </div>
                        <span className="font-medium">تقييم 5/5 من أكثر من 500+ خريج</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
