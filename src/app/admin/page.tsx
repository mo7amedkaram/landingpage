'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    Button,
    Input,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Select
} from '@/components/ui';
import { ImageUpload } from '@/components/ImageUpload';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ColorPicker } from '@/components/admin/ColorPicker';
import {
    getSiteContent,
    getLeads,
    searchLeads,
    updateLeadStatus,
    type Lead
} from '@/lib/supabase';
import { updateSiteContentAction } from '@/actions/update-content';
import { SiteContent, defaultContent } from '@/lib/types';
import { formatDate, exportToCSV } from '@/lib/utils';
import {
    Search,
    Download,
    RefreshCw,
    Settings as SettingsIcon,
    Users,
    Lock,
    Calendar,
    Loader2,
    Check,
    X,
    Palette,
    Image,
    FileText,
    BookOpen,
    Repeat,
    Gift,
    HelpCircle,
    Globe,
    Plus,
    Trash2,
    Save,
    MessageCircle
} from 'lucide-react';

const leadStatuses = [
    { value: 'new', label: 'جديد', color: 'bg-blue-100 text-blue-800' },
    { value: 'contacted', label: 'تم التواصل', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'مؤكد', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'مرفوض', color: 'bg-red-100 text-red-800' },
] as const;

type TabType = 'leads' | 'theme' | 'hero' | 'pain' | 'story' | 'curriculum' | 'transformation' | 'audience' | 'bonuses' | 'pricing' | 'testimonials' | 'faq' | 'footer' | 'pixels';

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'leads', label: 'العملاء', icon: <Users className="w-4 h-4" /> },
    { id: 'theme', label: 'الألوان', icon: <Palette className="w-4 h-4" /> },
    { id: 'hero', label: 'الهيرو', icon: <Image className="w-4 h-4" /> },
    { id: 'pain', label: 'الألم', icon: <FileText className="w-4 h-4" /> },
    { id: 'story', label: 'القصة', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'curriculum', label: 'المنهج', icon: <Calendar className="w-4 h-4" /> },
    { id: 'transformation', label: 'التحول', icon: <Repeat className="w-4 h-4" /> },
    { id: 'audience', label: 'الجمهور', icon: <Users className="w-4 h-4" /> },
    { id: 'bonuses', label: 'الهدايا', icon: <Gift className="w-4 h-4" /> },
    { id: 'pricing', label: 'السعر', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'testimonials', label: 'التقييمات', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'faq', label: 'الأسئلة', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'footer', label: 'الفوتر', icon: <FileText className="w-4 h-4" /> },
    { id: 'pixels', label: 'التتبع', icon: <Globe className="w-4 h-4" /> },
];

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');

    const [activeTab, setActiveTab] = useState<TabType>('leads');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [content, setContent] = useState<SiteContent>(defaultContent);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form for content editing
    const { register, control, handleSubmit, setValue, watch, reset } = useForm<SiteContent>({
        defaultValues: defaultContent,
    });

    // Field arrays for dynamic content
    const { fields: bulletFields, append: appendBullet, remove: removeBullet } = useFieldArray({
        control,
        name: 'hero.bullets' as never,
    });

    const { fields: transformationFields, append: appendTransformation, remove: removeTransformation } = useFieldArray({
        control,
        name: 'transformation.points' as never,
    });

    const { fields: audienceFields, append: appendAudience, remove: removeAudience } = useFieldArray({
        control,
        name: 'audience.items' as never,
    });

    const { fields: bonusFields, append: appendBonus, remove: removeBonus } = useFieldArray({
        control,
        name: 'bonuses' as never,
    });

    const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
        control,
        name: 'faq' as never,
    });

    const { fields: curriculumFields } = useFieldArray({
        control,
        name: 'curriculum' as never,
    });

    const { fields: testimonialFields, append: appendTestimonial, remove: removeTestimonial } = useFieldArray({
        control,
        name: 'testimonials.items' as never,
    });

    const loadLeads = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = searchQuery ? await searchLeads(searchQuery) : await getLeads();
            setLeads(data);
        } catch (error) {
            console.error('Error loading leads:', error);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    const loadContent = useCallback(async () => {
        try {
            const data = await getSiteContent();
            setContent(data);
            reset(data);
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }, [reset]);

    useEffect(() => {
        if (isAuthenticated) {
            loadLeads();
            loadContent();
        }
    }, [isAuthenticated, loadLeads, loadContent]);

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === '123456') {
            setIsAuthenticated(true);
            setPinError('');
        } else {
            setPinError('رمز الدخول غير صحيح');
        }
    };

    const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
        try {
            await updateLeadStatus(leadId, newStatus);
            setLeads(leads.map(lead =>
                lead.id === leadId ? { ...lead, status: newStatus } : lead
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleExport = () => {
        exportToCSV(leads, `leads-${new Date().toISOString().split('T')[0]}`);
    };

    const onSaveContent = async (data: SiteContent) => {
        setIsSaving(true);
        setSaveMessage(null);
        try {
            const result = await updateSiteContentAction(data);
            if (result.success) {
                setSaveMessage({ type: 'success', text: 'تم حفظ التغييرات بنجاح!' });
                setContent(data);
                // Reset form to mark it as "clean" with new values
                reset(data);
            } else {
                setSaveMessage({ type: 'error', text: result.error || 'فشل في حفظ التغييرات' });
            }
        } catch (error) {
            console.error('Error saving content:', error);
            setSaveMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    // PIN Entry Screen
    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4" dir="rtl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="w-full max-w-md shadow-xl">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-xl">لوحة التحكم CMS</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePinSubmit} className="space-y-4">
                                <Input
                                    type="password"
                                    placeholder="أدخل رمز الدخول"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    error={pinError}
                                    className="text-center text-2xl tracking-widest"
                                    dir="ltr"
                                />
                                <Button type="submit" className="w-full">
                                    دخول
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100" dir="rtl">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <SettingsIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">CMS - لوحة التحكم</h1>
                            <p className="text-sm text-gray-500">إدارة محتوى الصفحة</p>
                        </div>
                    </div>

                    {/* Save Button */}
                    {activeTab !== 'leads' && (
                        <Button
                            onClick={handleSubmit(onSaveContent)}
                            disabled={isSaving}
                            className="gap-2"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            حفظ التغييرات
                        </Button>
                    )}
                </div>

                {/* Tabs */}
                <div className="container mx-auto px-4 py-2 overflow-x-auto">
                    <div className="flex gap-1 min-w-max">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Save Message */}
            {saveMessage && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${saveMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {saveMessage.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    {saveMessage.text}
                </div>
            )}

            <div className="container mx-auto px-4 py-6">
                <form onSubmit={handleSubmit(onSaveContent)}>

                    {/* LEADS TAB */}
                    {activeTab === 'leads' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <div className="relative flex-1 md:w-80">
                                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <Input
                                                    placeholder="بحث برقم الهاتف..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && loadLeads()}
                                                    className="pr-10"
                                                    dir="ltr"
                                                />
                                            </div>
                                            <Button onClick={loadLeads} variant="outline" type="button">
                                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                            </Button>
                                        </div>
                                        <Button onClick={handleExport} variant="outline" type="button">
                                            <Download className="w-4 h-4" />
                                            تصدير CSV
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {leadStatuses.map(status => {
                                    const count = leads.filter(l => l.status === status.value).length;
                                    return (
                                        <Card key={status.value}>
                                            <CardContent className="p-4 text-center">
                                                <div className={`text-2xl font-bold ${status.color.replace('bg-', 'text-').replace('-100', '-600')}`}>
                                                    {count}
                                                </div>
                                                <div className="text-sm text-gray-500">{status.label}</div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            <Card>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[700px]">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الاسم</th>
                                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الهاتف</th>
                                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الزميل</th>
                                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">هاتف الزميل</th>
                                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">التاريخ</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {isLoading ? (
                                                    <tr><td colSpan={6} className="px-4 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></td></tr>
                                                ) : leads.length === 0 ? (
                                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">لا توجد تسجيلات</td></tr>
                                                ) : (
                                                    leads.map((lead) => (
                                                        <tr key={lead.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 font-medium">{lead.user_name}</td>
                                                            <td className="px-4 py-3 text-gray-600 font-mono" dir="ltr">{lead.user_phone}</td>
                                                            <td className="px-4 py-3 text-gray-600">{lead.friend_name}</td>
                                                            <td className="px-4 py-3 text-gray-600 font-mono" dir="ltr">{lead.friend_phone}</td>
                                                            <td className="px-4 py-3">
                                                                <Select
                                                                    value={lead.status}
                                                                    onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                                                                    options={leadStatuses.map(s => ({ value: s.value, label: s.label }))}
                                                                    className="h-8 text-sm"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(lead.created_at)}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* THEME TAB */}
                    {activeTab === 'theme' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="max-w-4xl mx-auto">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Palette className="w-5 h-5" />
                                        إعدادات الألوان
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 mt-2">
                                        تحكم في ألوان كل عنصر بشكل منفصل
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {/* Per-Button Controls */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg border-b pb-2">🎯 أزرار محددة (تحكم فردي)</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <ColorPicker
                                                label="زر الهيرو الرئيسي"
                                                description="'احجز مقعدي المجاني...' في أعلى الصفحة"
                                                value={watch('theme.buttons.heroCta')}
                                                onChange={(val: string) => setValue('theme.buttons.heroCta', val, { shouldDirty: true })}
                                            />
                                            <ColorPicker
                                                label="زر نموذج التسجيل"
                                                description="زر 'تأكيد التسجيل' في النموذج"
                                                value={watch('theme.buttons.formSubmit')}
                                                onChange={(val: string) => setValue('theme.buttons.formSubmit', val, { shouldDirty: true })}
                                            />
                                            <ColorPicker
                                                label="زر الموبايل العائم"
                                                description="الزر الثابت أسفل الموبايل"
                                                value={watch('theme.buttons.stickyMobile')}
                                                onChange={(val: string) => setValue('theme.buttons.stickyMobile', val, { shouldDirty: true })}
                                            />
                                            <ColorPicker
                                                label="الأزرار الثانوية"
                                                description="أزرار أخرى بلون مختلف"
                                                value={watch('theme.buttons.secondaryCta')}
                                                onChange={(val: string) => setValue('theme.buttons.secondaryCta', val, { shouldDirty: true })}
                                            />
                                        </div>
                                    </div>

                                    {/* Accents Section */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg border-b pb-2">الألوان المميزة</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <ColorPicker
                                                label="علامات الصح والأيقونات"
                                                description="علامات ✓ الخضراء والأيقونات الصغيرة"
                                                value={watch('theme.accentColor')}
                                                onChange={(val) => setValue('theme.accentColor', val, { shouldDirty: true })}
                                            />
                                            <ColorPicker
                                                label="خلفيات الأقسام الملونة"
                                                description="قسم 'لمين المنحة' والنموذج"
                                                value={watch('theme.secondaryAccent')}
                                                onChange={(val) => setValue('theme.secondaryAccent', val, { shouldDirty: true })}
                                            />
                                        </div>
                                    </div>

                                    {/* Backgrounds Section */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg border-b pb-2">الخلفيات</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <ColorPicker
                                                label="خلفية الصفحة"
                                                description="اللون العام للصفحة"
                                                value={watch('theme.pageBgColor')}
                                                onChange={(val) => setValue('theme.pageBgColor', val, { shouldDirty: true })}
                                            />
                                            <ColorPicker
                                                label="خلفية قسم الألم"
                                                description="القسم الأحمر الفاتح"
                                                value={watch('theme.painSectionBg')}
                                                onChange={(val) => setValue('theme.painSectionBg', val, { shouldDirty: true })}
                                            />
                                        </div>
                                    </div>

                                    {/* Text Section */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg border-b pb-2">النصوص</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <ColorPicker
                                                label="لون النص الأساسي"
                                                description="الفقرات والنصوص العادية"
                                                value={watch('theme.textColor')}
                                                onChange={(val) => setValue('theme.textColor', val, { shouldDirty: true })}
                                            />
                                            <ColorPicker
                                                label="لون العناوين"
                                                description="العناوين الكبيرة H1, H2, H3"
                                                value={watch('theme.headingColor')}
                                                onChange={(val) => setValue('theme.headingColor', val, { shouldDirty: true })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* HERO TAB */}
                    {activeTab === 'hero' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="max-w-3xl mx-auto">
                                <CardHeader>
                                    <CardTitle>قسم الهيرو</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">العنوان الرئيسي</label>
                                        <RichTextEditor
                                            value={watch('hero.headline')}
                                            onChange={(html) => setValue('hero.headline', html)}
                                            placeholder="أدخل العنوان الرئيسي..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">العنوان الفرعي</label>
                                        <RichTextEditor
                                            value={watch('hero.subhead')}
                                            onChange={(html) => setValue('hero.subhead', html)}
                                            placeholder="أدخل العنوان الفرعي..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">نص الزر (CTA)</label>
                                        <Input {...register('hero.ctaText')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">صورة الهيرو</label>
                                        <ImageUpload
                                            value={watch('hero.heroImage')}
                                            onChange={(url) => setValue('hero.heroImage', url)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">النقاط المميزة</label>
                                        <div className="space-y-2">
                                            {bulletFields.map((field, index) => (
                                                <div key={field.id} className="flex gap-2">
                                                    <Input
                                                        {...register(`hero.bullets.${index}` as const)}
                                                        placeholder={`النقطة ${index + 1}`}
                                                    />
                                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeBullet(index)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button type="button" variant="outline" onClick={() => appendBullet('')} className="w-full">
                                                <Plus className="w-4 h-4" /> إضافة نقطة
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* PAIN TAB */}
                    {activeTab === 'pain' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="max-w-3xl mx-auto">
                                <CardHeader>
                                    <CardTitle>قسم الألم</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">العنوان</label>
                                        <Input {...register('pain_section.title')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">المحتوى</label>
                                        <RichTextEditor
                                            value={watch('pain_section.body')}
                                            onChange={(html) => setValue('pain_section.body', html)}
                                            placeholder="أدخل محتوى قسم الألم..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* STORY TAB */}
                    {activeTab === 'story' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="max-w-3xl mx-auto">
                                <CardHeader>
                                    <CardTitle>قسم القصة</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">العنوان</label>
                                        <Input {...register('story_section.title')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">المحتوى</label>
                                        <RichTextEditor
                                            value={watch('story_section.body')}
                                            onChange={(html) => setValue('story_section.body', html)}
                                            placeholder="أدخل محتوى قسم القصة..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">الصورة</label>
                                        <ImageUpload
                                            value={watch('story_section.image')}
                                            onChange={(url) => setValue('story_section.image', url)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* CURRICULUM TAB */}
                    {activeTab === 'curriculum' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="max-w-4xl mx-auto space-y-4">
                                {curriculumFields.map((field, index) => (
                                    <Card key={field.id}>
                                        <CardHeader>
                                            <CardTitle className="text-lg">اليوم {index + 1}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">اسم اليوم</label>
                                                    <Input {...register(`curriculum.${index}.day` as const)} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">اللون</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="color"
                                                            {...register(`curriculum.${index}.color` as const)}
                                                            className="w-12 h-12 rounded cursor-pointer"
                                                        />
                                                        <Input {...register(`curriculum.${index}.color` as const)} dir="ltr" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">العنوان</label>
                                                <Input {...register(`curriculum.${index}.title` as const)} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">الوصف</label>
                                                <textarea
                                                    {...register(`curriculum.${index}.desc` as const)}
                                                    className="w-full p-3 border rounded-lg min-h-[100px]"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* TRANSFORMATION TAB */}
                    {activeTab === 'transformation' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="max-w-3xl mx-auto">
                                <CardHeader>
                                    <CardTitle>قسم التحول (قبل/بعد)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">عنوان "قبل"</label>
                                            <Input {...register('transformation.beforeLabel')} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">عنوان "بعد"</label>
                                            <Input {...register('transformation.afterLabel')} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {transformationFields.map((field, index) => (
                                            <div key={field.id} className="p-4 border rounded-lg space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">نقطة {index + 1}</span>
                                                    <Button type="button" variant="destructive" size="sm" onClick={() => removeTransformation(index)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-red-600 mb-1 block">قبل</label>
                                                    <Input {...register(`transformation.points.${index}.before` as const)} />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-green-600 mb-1 block">بعد</label>
                                                    <Input {...register(`transformation.points.${index}.after` as const)} />
                                                </div>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" onClick={() => appendTransformation({ before: '', after: '' })} className="w-full">
                                            <Plus className="w-4 h-4" /> إضافة نقطة تحول
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* AUDIENCE TAB */}
                    {activeTab === 'audience' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="max-w-3xl mx-auto">
                                <CardHeader>
                                    <CardTitle>الجمهور المستهدف</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">العنوان</label>
                                        <Input {...register('audience.title')} />
                                    </div>
                                    <div className="space-y-2">
                                        {audienceFields.map((field, index) => (
                                            <div key={field.id} className="flex gap-2">
                                                <Input {...register(`audience.items.${index}` as const)} placeholder={`الفئة ${index + 1}`} />
                                                <Button type="button" variant="destructive" size="icon" onClick={() => removeAudience(index)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" onClick={() => appendAudience('')} className="w-full">
                                            <Plus className="w-4 h-4" /> إضافة فئة
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* BONUSES TAB */}
                    {activeTab === 'bonuses' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="max-w-3xl mx-auto space-y-4">
                                {bonusFields.map((field, index) => (
                                    <Card key={field.id}>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle className="text-lg">بونص {index + 1}</CardTitle>
                                            <Button type="button" variant="destructive" size="sm" onClick={() => removeBonus(index)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">الإيموجي</label>
                                                    <Input {...register(`bonuses.${index}.emoji` as const)} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">العنوان</label>
                                                    <Input {...register(`bonuses.${index}.title` as const)} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">القيمة</label>
                                                <Input {...register(`bonuses.${index}.value` as const)} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">الوصف</label>
                                                <Input {...register(`bonuses.${index}.description` as const)} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                <Button type="button" variant="outline" onClick={() => appendBonus({ emoji: '🎁', title: '', value: '', description: '' })} className="w-full">
                                    <Plus className="w-4 h-4" /> إضافة بونص
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* PRICING TAB */}
                    {activeTab === 'pricing' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="max-w-2xl mx-auto">
                                <CardHeader>
                                    <CardTitle>قسم السعر</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">السعر الأصلي (مشطوب)</label>
                                        <Input {...register('pricing.originalPrice')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">السعر الحالي</label>
                                        <Input {...register('pricing.currentPrice')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">ملاحظة</label>
                                        <Input {...register('pricing.disclaimer')} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* TESTIMONIALS TAB */}
                    {activeTab === 'testimonials' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="max-w-4xl mx-auto space-y-6">
                                {/* Section Header Settings */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageCircle className="w-5 h-5" />
                                            إعدادات قسم التقييمات
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">عنوان القسم</label>
                                            <Input {...register('testimonials.title')} placeholder="رأي خريجي الدفعات السابقة" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">العنوان الفرعي</label>
                                            <Input {...register('testimonials.subtitle')} placeholder="قصص حقيقية من شباب زيك غيروا حياتهم..." />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Review Cards */}
                                <div className="space-y-4">
                                    {testimonialFields.map((field, index) => (
                                        <Card key={field.id} className="border-r-4 border-r-sky-500">
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <span className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold text-sm">
                                                        {index + 1}
                                                    </span>
                                                    تقييم #{index + 1}
                                                </CardTitle>
                                                <Button type="button" variant="destructive" size="sm" onClick={() => removeTestimonial(index)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {/* Row 1: Name & Title */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">اسم المراجع *</label>
                                                        <Input
                                                            {...register(`testimonials.items.${index}.name` as const)}
                                                            placeholder="مثال: أحمد محمد"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">المسمى الوظيفي / الوصف</label>
                                                        <Input
                                                            {...register(`testimonials.items.${index}.title` as const)}
                                                            placeholder="مثال: خريج دفعة 2024"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Row 2: Rating */}
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">التقييم (نجوم)</label>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="range"
                                                            min="1"
                                                            max="5"
                                                            {...register(`testimonials.items.${index}.rating` as const, { valueAsNumber: true })}
                                                            className="w-32"
                                                        />
                                                        <div className="flex gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span
                                                                    key={i}
                                                                    className={`text-xl ${i < (watch(`testimonials.items.${index}.rating` as const) || 5) ? 'text-amber-400' : 'text-gray-200'}`}
                                                                >
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 3: Review Text */}
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">نص التقييم *</label>
                                                    <textarea
                                                        {...register(`testimonials.items.${index}.review` as const)}
                                                        className="w-full p-3 border rounded-lg min-h-[100px] resize-none"
                                                        placeholder="اكتب تقييم العميل هنا..."
                                                    />
                                                </div>

                                                {/* Row 4: Avatar (Optional) */}
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">صورة المراجع (اختياري)</label>
                                                    <ImageUpload
                                                        value={watch(`testimonials.items.${index}.avatar` as const) || ''}
                                                        onChange={(url) => setValue(`testimonials.items.${index}.avatar`, url)}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Add Review Button */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => appendTestimonial({
                                        id: Date.now(),
                                        name: '',
                                        title: '',
                                        avatar: '',
                                        rating: 5,
                                        review: ''
                                    })}
                                    className="w-full py-6 border-dashed border-2 hover:border-sky-400 hover:bg-sky-50 transition-colors"
                                >
                                    <Plus className="w-5 h-5" /> إضافة تقييم جديد
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* FAQ TAB */}
                    {activeTab === 'faq' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="max-w-3xl mx-auto space-y-4">
                                {faqFields.map((field, index) => (
                                    <Card key={field.id}>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle className="text-lg">سؤال {index + 1}</CardTitle>
                                            <Button type="button" variant="destructive" size="sm" onClick={() => removeFaq(index)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">السؤال</label>
                                                <Input {...register(`faq.${index}.question` as const)} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">الإجابة</label>
                                                <textarea
                                                    {...register(`faq.${index}.answer` as const)}
                                                    className="w-full p-3 border rounded-lg min-h-[80px]"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                <Button type="button" variant="outline" onClick={() => appendFaq({ question: '', answer: '' })} className="w-full">
                                    <Plus className="w-4 h-4" /> إضافة سؤال
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* FOOTER TAB */}
                    {activeTab === 'footer' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="max-w-2xl mx-auto">
                                <CardHeader>
                                    <CardTitle>الفوتر</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">نص الفوتر</label>
                                        <Input {...register('footer.text')} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* PIXELS TAB */}
                    {activeTab === 'pixels' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="max-w-2xl mx-auto">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="w-5 h-5" />
                                        إعدادات التتبع (Pixels)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Facebook Pixel ID</label>
                                        <Input {...register('pixels.facebook')} placeholder="1234567890123456" dir="ltr" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">TikTok Pixel ID</label>
                                        <Input {...register('pixels.tiktok')} placeholder="ABCDEFGHIJ1234567890" dir="ltr" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Snapchat Pixel ID</label>
                                        <Input {...register('pixels.snapchat')} placeholder="abcd1234-5678-efgh" dir="ltr" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                </form>
            </div>
        </main>
    );
}
