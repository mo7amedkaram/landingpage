'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { createLead } from '@/lib/supabase';
import { trackLeadWithAdvancedMatching } from '@/lib/pixel-utils';
import { User, Users, Loader2, CheckCircle } from 'lucide-react';

// Egyptian phone number validation
const egyptianPhoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;

const formSchema = z.object({
    user_name: z
        .string()
        .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')
        .max(100, 'الاسم طويل جداً'),
    user_phone: z
        .string()
        .min(11, 'رقم الهاتف يجب أن يكون 11 رقم')
        .max(11, 'رقم الهاتف يجب أن يكون 11 رقم')
        .regex(egyptianPhoneRegex, 'رقم الهاتف يجب أن يبدأ ب 01 ويكون 11 رقم'),
    friend_name: z
        .string()
        .min(3, 'اسم الزميل يجب أن يكون 3 أحرف على الأقل')
        .max(100, 'اسم الزميل طويل جداً'),
    friend_phone: z
        .string()
        .min(11, 'رقم الهاتف يجب أن يكون 11 رقم')
        .max(11, 'رقم الهاتف يجب أن يكون 11 رقم')
        .regex(egyptianPhoneRegex, 'رقم هاتف الزميل يجب أن يبدأ ب 01 ويكون 11 رقم'),
}).refine((data) => data.user_phone !== data.friend_phone, {
    message: 'رقم هاتفك ورقم زميلك يجب أن يكونا مختلفين',
    path: ['friend_phone'],
});

type FormData = z.infer<typeof formSchema>;

export function RegistrationForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            user_name: '',
            user_phone: '',
            friend_name: '',
            friend_phone: '',
        },
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setSubmitError(null);

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

            // Redirect to thank you page
            router.push('/thank-you');
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitError('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="registration-form" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-2xl mx-auto"
                >
                    <Card className="shadow-2xl border-0">
                        <CardHeader className="text-center bg-gradient-to-l from-blue-600 to-blue-800 text-white rounded-t-2xl py-8">
                            <CardTitle className="text-2xl md:text-3xl text-white">
                                سجل الآن - لك ولزميلك
                            </CardTitle>
                            <CardDescription className="text-blue-100 text-base mt-2">
                                أكمل البيانات التالية لحجز مقعدين في الدورة
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 md:p-8">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                {/* Section 1: Your Information */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-blue-700 font-semibold mb-4">
                                        <User className="w-5 h-5" />
                                        <span className="text-lg">بياناتك الشخصية</span>
                                    </div>

                                    <Input
                                        {...register('user_name')}
                                        label="الاسم الكامل"
                                        placeholder="أدخل اسمك الكامل"
                                        error={errors.user_name?.message}
                                        id="user_name"
                                    />

                                    <Input
                                        {...register('user_phone')}
                                        label="رقم الهاتف"
                                        placeholder="01xxxxxxxxx"
                                        type="tel"
                                        dir="ltr"
                                        className="text-left"
                                        error={errors.user_phone?.message}
                                        id="user_phone"
                                    />
                                </div>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-white px-4 text-sm text-gray-500 flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            بيانات زميلك
                                        </span>
                                    </div>
                                </div>

                                {/* Section 2: Friend's Information */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-green-700 font-semibold mb-4">
                                        <Users className="w-5 h-5" />
                                        <span className="text-lg">بيانات زميلك في التدريب</span>
                                    </div>

                                    <Input
                                        {...register('friend_name')}
                                        label="اسم الزميل الكامل"
                                        placeholder="أدخل اسم زميلك الكامل"
                                        error={errors.friend_name?.message}
                                        id="friend_name"
                                    />

                                    <Input
                                        {...register('friend_phone')}
                                        label="رقم هاتف الزميل"
                                        placeholder="01xxxxxxxxx"
                                        type="tel"
                                        dir="ltr"
                                        className="text-left"
                                        error={errors.friend_phone?.message}
                                        id="friend_phone"
                                    />
                                </div>

                                {/* Error Message */}
                                {submitError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                                        {submitError}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full text-lg py-6 h-auto"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            جاري التسجيل...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            تأكيد التسجيل في المنحة
                                        </>
                                    )}
                                </Button>

                                {/* Privacy Note */}
                                <p className="text-center text-sm text-gray-500">
                                    بيانتك آمنة معنا ولن يتم مشاركتها مع أي طرف ثالث
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </section>
    );
}
