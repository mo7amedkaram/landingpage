'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Button,
    Input,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui';
import { createLead } from '@/lib/supabase';
import { scrollToElement } from '@/lib/utils';
import { trackLeadWithAdvancedMatching } from '@/lib/pixel-utils';
import { SiteContent } from '@/lib/types';
import { ThemeProvider } from './ThemeProvider';
import { TestimonialsGrid } from './TestimonialsGrid';
import {
    Star,
    Check,
    X,
    Heart,
    Zap,
    Shield,
    Syringe,
    Gift,
    ChevronDown,
    Phone,
    User,
    Users,
    Loader2,
    AlertTriangle,
    BookOpen,
    Target,
    Award
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Heart,
    Shield,
    Syringe,
};

// Animation variants
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
    visible: { transition: { staggerChildren: 0.15 } }
};

// Form schema
const formSchema = z.object({
    user_name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
    user_phone: z.string().regex(/^01[0-2,5][0-9]{8}$/, 'رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01'),
    friend_name: z.string().min(3, 'اسم الزميل يجب أن يكون 3 أحرف على الأقل'),
    friend_phone: z.string().regex(/^01[0-2,5][0-9]{8}$/, 'رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01'),
}).refine((data) => data.user_phone !== data.friend_phone, {
    message: 'رقم هاتفك ورقم زميلك يجب أن يكونا مختلفين',
    path: ['friend_phone'],
});

type FormData = z.infer<typeof formSchema>;

interface DynamicLandingPageProps {
    content: SiteContent;
}

export function DynamicLandingPage({ content }: DynamicLandingPageProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            // Track Lead event with Facebook Pixel Advanced Matching
            await trackLeadWithAdvancedMatching({
                user_name: data.user_name,
                user_phone: data.user_phone,
                friend_name: data.friend_name,
                friend_phone: data.friend_phone,
            });

            // Save lead to database
            await createLead({
                user_name: data.user_name,
                user_phone: data.user_phone,
                friend_name: data.friend_name,
                friend_phone: data.friend_phone,
            });

            router.push('/thank-you');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Dynamic theme styles - granular color mappings with backwards compatibility
    const theme = content.theme;

    // Button colors: prefer new nested structure, fallback to old flat names
    const heroCta = theme.buttons?.heroCta || (theme as any).heroBtnColor || (theme as any).primaryColor || '#ef4444';
    const formSubmit = theme.buttons?.formSubmit || (theme as any).formBtnColor || (theme as any).primaryColor || '#ef4444';
    const stickyMobile = theme.buttons?.stickyMobile || heroCta;
    const secondaryCta = theme.buttons?.secondaryCta || theme.secondaryAccent || '#0284c7';

    // Other colors
    const accentColor = theme.accentColor || '#16a34a';
    const secondaryAccent = theme.secondaryAccent || (theme as any).secondaryColor || '#0284c7';
    const pageBgColor = theme.pageBgColor || (theme as any).backgroundColor || '#ffffff';
    const painSectionBg = theme.painSectionBg || (theme as any).painSectionColor || '#fef2f2';
    const textColor = theme.textColor || '#334155';
    const headingColor = theme.headingColor || '#1e293b';

    return (
        <ThemeProvider theme={content.theme}>
            <main className="min-h-screen overflow-hidden" style={{ backgroundColor: pageBgColor }}>

                {/* ===== SECTION 1: HERO ===== */}
                <section className="relative min-h-screen bg-white overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(secondaryAccent)}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }} />
                    </div>

                    <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-16 lg:py-24 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
                            {/* Text Content */}
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={stagger}
                                className="order-2 lg:order-1"
                            >
                                <motion.div
                                    variants={fadeUp}
                                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 sm:mb-6 rich-text-content"
                                    style={{ color: headingColor }}
                                    dangerouslySetInnerHTML={{ __html: content.hero.headline }}
                                />

                                <motion.div
                                    variants={fadeUp}
                                    className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 leading-relaxed rich-text-content"
                                    style={{ color: textColor }}
                                    dangerouslySetInnerHTML={{ __html: content.hero.subhead }}
                                />

                                {/* Trust Anchor */}
                                <motion.div
                                    variants={fadeUp}
                                    className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6"
                                >
                                    <div className="flex flex-shrink-0">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <span className="text-slate-600 text-xs sm:text-sm">
                                        أكثر من 5000 طالب وطالبة امتلكوا شجاعة إنقاذ الحياة من خلالنا.
                                    </span>
                                </motion.div>

                                {/* Dynamic Bullet Points */}
                                <motion.ul variants={fadeUp} className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                                    {content.hero.bullets.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 sm:gap-3">
                                            <Check className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 sm:mt-1 flex-shrink-0" style={{ color: accentColor }} />
                                            <span className="text-slate-700 text-sm sm:text-base">{item}</span>
                                        </li>
                                    ))}
                                </motion.ul>

                                {/* CTA Button */}
                                <motion.div variants={fadeUp}>
                                    <Button
                                        size="lg"
                                        onClick={() => scrollToElement('register-form')}
                                        className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 h-auto shadow-xl hover:shadow-2xl animate-pulse hover:animate-none w-full sm:w-auto"
                                        style={{ backgroundColor: heroCta }}
                                    >
                                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                                        <span className="truncate">{content.hero.ctaText}</span>
                                    </Button>
                                </motion.div>
                            </motion.div>

                            {/* Hero Image */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="order-1 lg:order-2"
                            >
                                <div className="relative max-w-full overflow-hidden">
                                    {content.hero.heroImage ? (
                                        <img
                                            src={content.hero.heroImage}
                                            alt="دورة الإسعافات الأولية"
                                            className="w-full max-w-full aspect-square object-cover object-center rounded-2xl sm:rounded-3xl shadow-2xl"
                                        />
                                    ) : (
                                        <div className="aspect-square rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl" style={{ background: `linear-gradient(135deg, ${secondaryAccent}20, ${secondaryAccent}40)` }}>
                                            <div className="text-center p-4 sm:p-8">
                                                <Heart className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4" style={{ color: heroCta }} />
                                                <p className="text-xl sm:text-2xl font-bold text-slate-700">دورة الإسعافات الأولية</p>
                                                <p className="mt-2 text-sm sm:text-base" style={{ color: secondaryAccent }}>3 أيام • عملي 100%</p>
                                            </div>
                                        </div>
                                    )}
                                    {/* Badge - safe positioning that doesn't overflow */}
                                    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg font-bold text-sm sm:text-base" style={{ backgroundColor: accentColor }}>
                                        مجاناً!
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ===== SECTION 2: THE PAIN ===== */}
                <section className="py-20" style={{ backgroundColor: painSectionBg }}>
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full mb-6">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="font-semibold">لحظة صدق</span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8">
                                {content.pain_section.title}
                            </h2>

                            <div
                                className="text-lg md:text-xl text-slate-700 leading-loose space-y-4 text-right rich-text-content"
                                dangerouslySetInnerHTML={{ __html: content.pain_section.body }}
                            />
                        </motion.div>
                    </div>
                </section>

                {/* ===== SECTION 3: THE STORY ===== */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                className="order-2 lg:order-1"
                            >
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                                    {content.story_section.title}
                                </h2>

                                <div
                                    className="text-lg text-slate-700 leading-loose rich-text-content"
                                    dangerouslySetInnerHTML={{ __html: content.story_section.body }}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="order-1 lg:order-2"
                            >
                                {content.story_section.image ? (
                                    <img
                                        src={content.story_section.image}
                                        alt="القصة"
                                        className="w-full aspect-[4/3] object-cover rounded-2xl shadow-xl"
                                    />
                                ) : (
                                    <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-xl">
                                        <div className="text-center p-8">
                                            <BookOpen className="w-20 h-20 text-slate-400 mx-auto mb-4" />
                                            <p className="text-slate-500">صورة القصة</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ===== SECTION 4: CURRICULUM ===== */}
                <section className="py-20 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                                إيه اللي هتتعلمه في <span style={{ color: secondaryAccent }}>3 أيام</span>؟
                            </h2>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
                        >
                            {content.curriculum.map((day, index) => {
                                const IconComponent = iconMap[day.icon] || Heart;
                                return (
                                    <motion.div key={index} variants={fadeUp}>
                                        <Card className="h-full hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2" style={{ borderTopWidth: '4px', borderTopColor: day.color }}>
                                            <CardHeader>
                                                <div
                                                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: `${day.color}20` }}
                                                >
                                                    <div style={{ color: day.color }}>
                                                        <IconComponent className="w-7 h-7" />
                                                    </div>
                                                </div>
                                                <span className="font-bold text-sm" style={{ color: day.color }}>{day.day}</span>
                                                <CardTitle className="text-xl mt-1">{day.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-slate-600 leading-relaxed">{day.desc}</p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                {/* ===== SECTION 5: TRANSFORMATION ===== */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                                التحول اللي هيحصلك
                            </h2>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Before */}
                                <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                                    <h3 className="text-xl font-bold text-red-700 mb-6 flex items-center gap-2">
                                        <X className="w-6 h-6" />
                                        {content.transformation.beforeLabel}
                                    </h3>
                                    <ul className="space-y-4">
                                        {content.transformation.points.map((point, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <X className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                                                <span className="text-slate-700">{point.before}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* After */}
                                <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                                    <h3 className="text-xl font-bold text-green-700 mb-6 flex items-center gap-2">
                                        <Check className="w-6 h-6" />
                                        {content.transformation.afterLabel}
                                    </h3>
                                    <ul className="space-y-4">
                                        {content.transformation.points.map((point, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                                <span className="text-slate-700">{point.after}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ===== SECTION 6: WHO IS THIS FOR ===== */}
                <section className="py-20 text-white" style={{ background: `linear-gradient(to left, ${secondaryAccent}, ${secondaryAccent}dd)` }}>
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-8">
                                {content.audience.title}
                            </h2>

                            <div className="grid md:grid-cols-3 gap-6 mt-10">
                                {content.audience.items.map((item, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                        <Target className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
                                        <p className="text-lg">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ===== SECTION 7: BONUSES ===== */}
                <section className="py-20 bg-gradient-to-r from-amber-50 to-yellow-50">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="text-center mb-12"
                        >
                            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full mb-4">
                                <Gift className="w-5 h-5" />
                                <span className="font-bold">هدايا مجانية</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                                وكمان هتاخد معاك..
                            </h2>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="max-w-3xl mx-auto space-y-4"
                        >
                            {content.bonuses.map((bonus, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeUp}
                                    className="bg-white rounded-xl p-6 shadow-lg border-2 border-amber-200 flex items-start gap-4 hover:shadow-xl transition-shadow"
                                >
                                    <span className="text-3xl">{bonus.emoji}</span>
                                    <div>
                                        <p className="font-bold text-slate-800">
                                            <span className="text-amber-600">{bonus.title}</span> {bonus.description}
                                        </p>
                                        <p className="text-slate-600 text-sm mt-1">{bonus.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* ===== SECTION 8: PRICE ===== */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="text-center max-w-2xl mx-auto"
                        >
                            <Award className="w-16 h-16 mx-auto mb-6" style={{ color: secondaryAccent }} />
                            <p className="text-2xl text-gray-400 line-through mb-2">
                                {content.pricing.originalPrice}
                            </p>
                            <p className="text-5xl md:text-6xl font-extrabold text-green-600 mb-4">
                                {content.pricing.currentPrice}
                            </p>
                            <p className="text-lg text-slate-600">
                                {content.pricing.disclaimer}
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ===== SECTION 9: TESTIMONIALS (Wall of Love) ===== */}
                <TestimonialsGrid
                    title={content.testimonials?.title}
                    subtitle={content.testimonials?.subtitle}
                    items={content.testimonials?.items}
                />


                {/* ===== SECTION 10: FAQ ===== */}
                <section className="py-20 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                                أسئلة شائعة
                            </h2>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="max-w-3xl mx-auto space-y-4"
                        >
                            {content.faq.map((faq, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full p-5 text-right flex items-center justify-between hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-semibold text-slate-800">{faq.question}</span>
                                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openFaq === i && (
                                        <div className="px-5 pb-5 text-slate-600 border-t">
                                            <p className="pt-4">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* ===== SECTION 10: REGISTRATION FORM ===== */}
                <section id="register-form" className="py-20" style={{ background: `linear-gradient(135deg, ${secondaryAccent}, ${secondaryAccent}cc)` }}>
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="max-w-xl mx-auto"
                        >
                            <Card className="shadow-2xl border-0">
                                <CardHeader className="text-center bg-slate-900 text-white rounded-t-xl py-8">
                                    <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                                    <CardTitle className="text-2xl text-white">
                                        سجل الآن واضمن مكانك مجاناً
                                    </CardTitle>
                                    <CardDescription className="text-gray-300 text-base mt-2">
                                        قبل اكتمال العدد
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-6 md:p-8">
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                                <User className="w-4 h-4" />
                                                اسمك الكامل
                                            </label>
                                            <Input
                                                {...register('user_name')}
                                                placeholder="أدخل اسمك الكامل"
                                                error={errors.user_name?.message}
                                            />
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                                <Phone className="w-4 h-4" />
                                                رقم هاتفك ( يشترط واتساب لإستلام رسالة القبول )
                                            </label>
                                            <Input
                                                {...register('user_phone')}
                                                placeholder="01xxxxxxxxx"
                                                type="tel"
                                                dir="ltr"
                                                className="text-left"
                                                error={errors.user_phone?.message}
                                            />
                                        </div>



                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                                <User className="w-4 h-4" />
                                                اسم صديقك المرشح                                            </label>
                                            <Input
                                                {...register('friend_name')}
                                                placeholder="أدخل اسم صديقك"
                                                error={errors.friend_name?.message}
                                            />
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                                <Phone className="w-4 h-4" />
                                                رقم هاتف صديقك
                                            </label>
                                            <Input
                                                {...register('friend_phone')}
                                                placeholder="01xxxxxxxxx"
                                                type="tel"
                                                dir="ltr"
                                                className="text-left"
                                                error={errors.friend_phone?.message}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full text-lg py-6 h-auto animate-pulse hover:animate-none"
                                            style={{ backgroundColor: formSubmit }}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    جاري التسجيل...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="w-5 h-5" />
                                                    تأكيد التسجيل في المنحة
                                                </>
                                            )}
                                        </Button>

                                        <p className="text-center text-sm text-slate-500">
                                            يتم تسجيل البيانات للتواصل وتأكيد الحجز لك ولزميلك.
                                        </p>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </section>

                {/* ===== SECTION 11: FOOTER ===== */}
                <footer className="bg-slate-900 text-white py-8">
                    <div className="container mx-auto px-4 text-center">
                        <p className="text-slate-400">
                            {content.footer.text}
                        </p>
                    </div>
                </footer>
            </main>
        </ThemeProvider>
    );
}
