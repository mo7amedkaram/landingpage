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
    updateLeadsStatusBatch,
    deleteLeads,
    deleteAllLeads,
    createLeadManually,
    getSegments,
    createSegment,
    updateSegment,
    deleteSegment,
    updateLeadSegment,
    updateLeadsSegmentBatch,
    type Lead,
    type CrmSegment
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
    MessageCircle,
    CheckSquare,
    Square,
    FolderInput,
    AlertTriangle,
    UserPlus,
    Sliders,
    Edit
} from 'lucide-react';

// Toast type for notifications
interface Toast {
    id: string;
    type: 'success' | 'error';
    message: string;
}

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

    // Lead management state
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
    const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
    const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [newLead, setNewLead] = useState({ name: '', phone: '', email: '', source: '' });

    // Dynamic segments state
    const [segments, setSegments] = useState<CrmSegment[]>([]);
    const [isManageSegmentsOpen, setIsManageSegmentsOpen] = useState(false);
    const [editingSegment, setEditingSegment] = useState<CrmSegment | null>(null);
    const [newSegment, setNewSegment] = useState({ name: '', color: 'blue' });

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

    const loadSegments = useCallback(async () => {
        try {
            const data = await getSegments();
            setSegments(data);
        } catch (error) {
            console.error('Error loading segments:', error);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadLeads();
            loadContent();
            loadSegments();
        }
    }, [isAuthenticated, loadLeads, loadContent, loadSegments]);

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

    // Toast helper
    const showToast = (type: 'success' | 'error', message: string) => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    // Selection handlers
    const handleSelectAll = () => {
        if (selectedLeads.size === leads.length) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(leads.map(l => l.id)));
        }
    };

    const handleSelectLead = (leadId: string) => {
        const newSet = new Set(selectedLeads);
        if (newSet.has(leadId)) {
            newSet.delete(leadId);
        } else {
            newSet.add(leadId);
        }
        setSelectedLeads(newSet);
    };

    // Batch move handler - now uses dynamic segments
    const handleBatchMoveToSegment = async (segmentId: string) => {
        const ids = Array.from(selectedLeads);
        const count = ids.length;
        const segmentName = segments.find(s => s.id === segmentId)?.name || '';

        // Optimistic update
        setLeads(leads.map(lead =>
            selectedLeads.has(lead.id) ? { ...lead, segment_id: segmentId } : lead
        ));
        setSelectedLeads(new Set());

        try {
            await updateLeadsSegmentBatch(ids, segmentId);
            showToast('success', `تم نقل ${count} عميل إلى "${segmentName}"`);
        } catch (error) {
            console.error('Error batch updating:', error);
            showToast('error', 'حدث خطأ أثناء التحديث');
            loadLeads(); // Rollback
        }
    };

    // Delete selected handler
    const handleDeleteSelected = async () => {
        const ids = Array.from(selectedLeads);
        const count = ids.length;

        // Optimistic update
        setLeads(leads.filter(lead => !selectedLeads.has(lead.id)));
        setSelectedLeads(new Set());

        try {
            await deleteLeads(ids);
            showToast('success', `تم حذف ${count} عميل`);
        } catch (error) {
            console.error('Error deleting:', error);
            showToast('error', 'حدث خطأ أثناء الحذف');
            loadLeads(); // Rollback
        }
    };

    // Delete all handler
    const handleDeleteAll = async () => {
        if (deleteConfirmText !== 'DELETE') return;

        const count = leads.length;
        setLeads([]);
        setSelectedLeads(new Set());
        setIsDeleteAllOpen(false);
        setDeleteConfirmText('');

        try {
            await deleteAllLeads();
            showToast('success', `تم حذف جميع العملاء (${count})`);
        } catch (error) {
            console.error('Error deleting all:', error);
            showToast('error', 'حدث خطأ أثناء الحذف');
            loadLeads(); // Rollback
        }
    };

    // Add lead handler
    const handleAddLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLead.name || !newLead.phone) return;

        try {
            const created = await createLeadManually({
                user_name: newLead.name,
                user_phone: newLead.phone,
                email: newLead.email,
                source: newLead.source,
            });
            setLeads([created, ...leads]);
            setNewLead({ name: '', phone: '', email: '', source: '' });
            setIsAddLeadOpen(false);
            showToast('success', 'تم إضافة العميل بنجاح');
        } catch (error) {
            console.error('Error adding lead:', error);
            showToast('error', 'حدث خطأ أثناء الإضافة');
        }
    };

    // Segment management handlers
    const handleCreateSegment = async () => {
        if (!newSegment.name) return;
        try {
            const created = await createSegment({
                name: newSegment.name,
                color: newSegment.color,
                order_index: segments.length,
            });
            setSegments([...segments, created]);
            setNewSegment({ name: '', color: 'blue' });
            showToast('success', 'تم إنشاء القسم بنجاح');
        } catch (error) {
            console.error('Error creating segment:', error);
            showToast('error', 'حدث خطأ أثناء الإنشاء');
        }
    };

    const handleUpdateSegmentSubmit = async () => {
        if (!editingSegment) return;
        try {
            const updated = await updateSegment(editingSegment.id, {
                name: editingSegment.name,
                color: editingSegment.color,
            });
            setSegments(segments.map(s => s.id === updated.id ? updated : s));
            setEditingSegment(null);
            showToast('success', 'تم تحديث القسم بنجاح');
        } catch (error) {
            console.error('Error updating segment:', error);
            showToast('error', 'حدث خطأ أثناء التحديث');
        }
    };

    const handleDeleteSegmentConfirm = async (id: string) => {
        // Move leads to first segment before deleting
        const defaultSegment = segments.find(s => s.id !== id);
        if (!defaultSegment) {
            showToast('error', 'لا يمكن حذف القسم الوحيد');
            return;
        }
        try {
            await deleteSegment(id, defaultSegment.id);
            setSegments(segments.filter(s => s.id !== id));
            setLeads(leads.map(l => l.segment_id === id ? { ...l, segment_id: defaultSegment.id } : l));
            showToast('success', 'تم حذف القسم ونقل العملاء');
        } catch (error) {
            console.error('Error deleting segment:', error);
            showToast('error', 'حدث خطأ أثناء الحذف');
        }
    };

    // Helper: get segment color class
    const getSegmentColorClass = (color: string) => {
        const colorMap: Record<string, string> = {
            blue: 'bg-blue-100 text-blue-800',
            yellow: 'bg-yellow-100 text-yellow-800',
            green: 'bg-green-100 text-green-800',
            red: 'bg-red-100 text-red-800',
            purple: 'bg-purple-100 text-purple-800',
            pink: 'bg-pink-100 text-pink-800',
            orange: 'bg-orange-100 text-orange-800',
            gray: 'bg-gray-100 text-gray-800',
        };
        return colorMap[color] || colorMap.blue;
    };

    // Helper: get lead's segment
    const getLeadSegment = (lead: Lead): CrmSegment | undefined => {
        return segments.find(s => s.id === lead.segment_id) || segments[0];
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
                            {/* Top Actions Bar */}
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
                                        <div className="flex gap-2">
                                            <Button onClick={() => setIsManageSegmentsOpen(true)} variant="outline" type="button" className="gap-2">
                                                <Sliders className="w-4 h-4" />
                                                إدارة الأقسام
                                            </Button>
                                            <Button onClick={() => setIsAddLeadOpen(true)} variant="outline" type="button" className="gap-2">
                                                <UserPlus className="w-4 h-4" />
                                                إضافة عميل
                                            </Button>
                                            <Button onClick={handleExport} variant="outline" type="button">
                                                <Download className="w-4 h-4" />
                                                تصدير CSV
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Selection Action Bar */}
                            {selectedLeads.size > 0 && (
                                <Card className="border-blue-200 bg-blue-50">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <div className="flex items-center gap-3">
                                                <CheckSquare className="w-5 h-5 text-blue-600" />
                                                <span className="font-medium text-blue-800">
                                                    {selectedLeads.size} محدد
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Move To Dropdown */}
                                                <div className="relative group">
                                                    <Button variant="outline" type="button" className="gap-2">
                                                        <FolderInput className="w-4 h-4" />
                                                        نقل إلى...
                                                    </Button>
                                                    <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[150px]">
                                                        {segments.map(segment => (
                                                            <button
                                                                key={segment.id}
                                                                type="button"
                                                                onClick={() => handleBatchMoveToSegment(segment.id)}
                                                                className="w-full px-4 py-2 text-right hover:bg-gray-100 flex items-center gap-2"
                                                            >
                                                                <span className={`w-2 h-2 rounded-full ${getSegmentColorClass(segment.color).split(' ')[0]}`}></span>
                                                                {segment.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Delete Selected */}
                                                <Button
                                                    variant="destructive"
                                                    type="button"
                                                    onClick={handleDeleteSelected}
                                                    className="gap-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    حذف المحدد
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {segments.map(segment => {
                                    const count = leads.filter(l => l.segment_id === segment.id || (!l.segment_id && segment.order_index === 0)).length;
                                    return (
                                        <Card key={segment.id}>
                                            <CardContent className="p-4 text-center">
                                                <div className={`text-2xl font-bold ${getSegmentColorClass(segment.color).replace('bg-', 'text-').replace('-100', '-600')}`}>
                                                    {count}
                                                </div>
                                                <div className="text-sm text-gray-500">{segment.name}</div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Data Table */}
                            <Card>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[800px]">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-4 py-3 text-center w-12">
                                                        <button
                                                            type="button"
                                                            onClick={handleSelectAll}
                                                            className="p-1 hover:bg-gray-200 rounded"
                                                        >
                                                            {selectedLeads.size === leads.length && leads.length > 0 ? (
                                                                <CheckSquare className="w-5 h-5 text-blue-600" />
                                                            ) : (
                                                                <Square className="w-5 h-5 text-gray-400" />
                                                            )}
                                                        </button>
                                                    </th>
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
                                                    <tr><td colSpan={7} className="px-4 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></td></tr>
                                                ) : leads.length === 0 ? (
                                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">لا توجد تسجيلات</td></tr>
                                                ) : (
                                                    leads.map((lead) => (
                                                        <tr key={lead.id} className={`hover:bg-gray-50 ${selectedLeads.has(lead.id) ? 'bg-blue-50' : ''}`}>
                                                            <td className="px-4 py-3 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSelectLead(lead.id)}
                                                                    className="p-1 hover:bg-gray-200 rounded"
                                                                >
                                                                    {selectedLeads.has(lead.id) ? (
                                                                        <CheckSquare className="w-5 h-5 text-blue-600" />
                                                                    ) : (
                                                                        <Square className="w-5 h-5 text-gray-400" />
                                                                    )}
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-3 font-medium">{lead.user_name}</td>
                                                            <td className="px-4 py-3 text-gray-600 font-mono" dir="ltr">{lead.user_phone}</td>
                                                            <td className="px-4 py-3 text-gray-600">{lead.friend_name}</td>
                                                            <td className="px-4 py-3 text-gray-600 font-mono" dir="ltr">{lead.friend_phone}</td>
                                                            <td className="px-4 py-3">
                                                                <Select
                                                                    value={lead.segment_id || segments[0]?.id || ''}
                                                                    onChange={async (e) => {
                                                                        const newSegmentId = e.target.value;
                                                                        setLeads(leads.map(l => l.id === lead.id ? { ...l, segment_id: newSegmentId } : l));
                                                                        try {
                                                                            await updateLeadSegment(lead.id, newSegmentId);
                                                                        } catch (error) {
                                                                            console.error('Error updating segment:', error);
                                                                            loadLeads();
                                                                        }
                                                                    }}
                                                                    options={segments.map(s => ({ value: s.id, label: s.name }))}
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

                            {/* Delete ALL Button */}
                            <div className="flex justify-center pt-4">
                                <Button
                                    variant="destructive"
                                    type="button"
                                    onClick={() => setIsDeleteAllOpen(true)}
                                    className="gap-2 bg-red-600 hover:bg-red-700"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    حذف جميع العملاء
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Add Lead Modal */}
                    {isAddLeadOpen && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsAddLeadOpen(false)}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-blue-600" />
                                    إضافة عميل جديد
                                </h3>
                                <form onSubmit={handleAddLead} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">الاسم *</label>
                                        <Input
                                            value={newLead.name}
                                            onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                            placeholder="اسم العميل"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">الهاتف *</label>
                                        <Input
                                            value={newLead.phone}
                                            onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                                            placeholder="رقم الهاتف"
                                            dir="ltr"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                                        <Input
                                            value={newLead.email}
                                            onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                                            placeholder="البريد الإلكتروني (اختياري)"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">المصدر</label>
                                        <Input
                                            value={newLead.source}
                                            onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                                            placeholder="مصدر العميل (اختياري)"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit" className="flex-1 gap-2">
                                            <Plus className="w-4 h-4" />
                                            إضافة
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => setIsAddLeadOpen(false)}>
                                            إلغاء
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {/* Delete All Confirmation Modal */}
                    {isDeleteAllOpen && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsDeleteAllOpen(false)}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle className="w-8 h-8 text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-red-600">تحذير: حذف جميع البيانات</h3>
                                    <p className="text-gray-600 mt-2">
                                        سيتم حذف جميع العملاء ({leads.length}) بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                            اكتب <span className="font-bold text-red-600">DELETE</span> للتأكيد:
                                        </label>
                                        <Input
                                            value={deleteConfirmText}
                                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                                            placeholder="DELETE"
                                            dir="ltr"
                                            className="text-center font-mono"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={handleDeleteAll}
                                            disabled={deleteConfirmText !== 'DELETE'}
                                            className="flex-1 gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            حذف الكل نهائياً
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsDeleteAllOpen(false);
                                                setDeleteConfirmText('');
                                            }}
                                        >
                                            إلغاء
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Manage Segments Modal */}
                    {isManageSegmentsOpen && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsManageSegmentsOpen(false)}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Sliders className="w-5 h-5" />
                                        إدارة الأقسام
                                    </h3>
                                    <Button variant="ghost" size="icon" onClick={() => setIsManageSegmentsOpen(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Existing Segments List */}
                                <div className="space-y-2 mb-6">
                                    {segments.map(segment => (
                                        <div key={segment.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                            {editingSegment?.id === segment.id ? (
                                                <>
                                                    <Input
                                                        value={editingSegment.name}
                                                        onChange={(e) => setEditingSegment({ ...editingSegment, name: e.target.value })}
                                                        className="flex-1"
                                                    />
                                                    <select
                                                        value={editingSegment.color}
                                                        onChange={(e) => setEditingSegment({ ...editingSegment, color: e.target.value })}
                                                        className="border rounded px-2 py-1"
                                                    >
                                                        <option value="blue">أزرق</option>
                                                        <option value="yellow">أصفر</option>
                                                        <option value="green">أخضر</option>
                                                        <option value="red">أحمر</option>
                                                        <option value="purple">بنفسجي</option>
                                                        <option value="orange">برتقالي</option>
                                                        <option value="gray">رمادي</option>
                                                    </select>
                                                    <Button size="sm" onClick={handleUpdateSegmentSubmit}>
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => setEditingSegment(null)}>
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className={`w-3 h-3 rounded-full ${getSegmentColorClass(segment.color).split(' ')[0]}`}></span>
                                                    <span className="flex-1 font-medium">{segment.name}</span>
                                                    <span className="text-sm text-gray-500">
                                                        ({leads.filter(l => l.segment_id === segment.id || (!l.segment_id && segment.order_index === 0)).length})
                                                    </span>
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingSegment(segment)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleDeleteSegmentConfirm(segment.id)}
                                                        disabled={segments.length <= 1}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Add New Segment */}
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-3">إضافة قسم جديد</h4>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newSegment.name}
                                            onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                                            placeholder="اسم القسم"
                                            className="flex-1"
                                        />
                                        <select
                                            value={newSegment.color}
                                            onChange={(e) => setNewSegment({ ...newSegment, color: e.target.value })}
                                            className="border rounded px-2 py-1"
                                        >
                                            <option value="blue">أزرق</option>
                                            <option value="yellow">أصفر</option>
                                            <option value="green">أخضر</option>
                                            <option value="red">أحمر</option>
                                            <option value="purple">بنفسجي</option>
                                            <option value="orange">برتقالي</option>
                                            <option value="gray">رمادي</option>
                                        </select>
                                        <Button onClick={handleCreateSegment} disabled={!newSegment.name}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Toast Notifications */}
                    <div className="fixed bottom-4 left-4 z-50 space-y-2">
                        {toasts.map(toast => (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: -100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                    }`}
                            >
                                {toast.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                {toast.message}
                            </motion.div>
                        ))}
                    </div>

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
                                        <label className="block text-sm font-medium mb-2">فيديو الهيرو (رابط MP4)</label>
                                        <Input
                                            {...register('hero.heroVideo')}
                                            placeholder="https://example.com/video.mp4"
                                            dir="ltr"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">ضع رابط الفيديو مباشرة (MP4). إذا كان فارغاً، سيظهر البديل.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">صورة الهيرو (بديلة)</label>
                                        <ImageUpload
                                            value={watch('hero.heroImage')}
                                            onChange={(url) => setValue('hero.heroImage', url)}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">تظهر عند عدم وجود فيديو</p>
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
