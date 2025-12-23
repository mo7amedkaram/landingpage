import { z } from 'zod';

// Egyptian phone number validation: 11 digits, starts with 01
const egyptianPhoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;

export const phoneSchema = z
    .string()
    .min(11, 'رقم الهاتف يجب أن يكون 11 رقم')
    .max(11, 'رقم الهاتف يجب أن يكون 11 رقم')
    .regex(egyptianPhoneRegex, 'رقم الهاتف يجب أن يبدأ ب 01 ويكون 11 رقم');

export const leadFormSchema = z.object({
    // User's information
    full_name: z
        .string()
        .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')
        .max(100, 'الاسم طويل جداً'),
    phone_number: phoneSchema,
    specialization: z
        .string()
        .max(100, 'التخصص طويل جداً')
        .optional()
        .or(z.literal('')),

    // Friend's information
    friend_name: z
        .string()
        .min(3, 'اسم الزميل يجب أن يكون 3 أحرف على الأقل')
        .max(100, 'اسم الزميل طويل جداً'),
    friend_phone: phoneSchema,
}).refine((data) => data.phone_number !== data.friend_phone, {
    message: 'رقم هاتفك ورقم زميلك يجب أن يكونا مختلفين',
    path: ['friend_phone'],
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

export const settingsSchema = z.object({
    facebook_pixel_id: z.string().optional().or(z.literal('')),
    tiktok_pixel_id: z.string().optional().or(z.literal('')),
    snapchat_pixel_id: z.string().optional().or(z.literal('')),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

// Status options for leads
export const leadStatuses = [
    { value: 'new', label: 'جديد', color: 'bg-blue-100 text-blue-800' },
    { value: 'contacted', label: 'تم التواصل', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'مؤكد', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'مرفوض', color: 'bg-red-100 text-red-800' },
] as const;
