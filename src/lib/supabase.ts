import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SiteContent, defaultContent } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client - handle missing credentials gracefully
const isConfigured = supabaseUrl && supabaseAnonKey;

export const supabase: SupabaseClient = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key');

export const isSupabaseConfigured = isConfigured;

// ============================================
// LEAD TYPES & FUNCTIONS
// ============================================

export interface Lead {
    id: string;
    created_at: string;
    user_name: string;
    user_phone: string;
    friend_name: string;
    friend_phone: string;
    status: 'new' | 'contacted' | 'confirmed' | 'rejected';
    segment_id?: string; // Dynamic segment reference
}

export async function createLead(lead: Omit<Lead, 'id' | 'created_at' | 'status'>) {
    if (!isConfigured) {
        console.warn('Supabase not configured - lead not saved');
        const mockLead = {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            status: 'new' as const,
            ...lead,
        } as Lead;
        console.log('Mock lead created:', mockLead);
        return mockLead;
    }

    const { data, error } = await supabase
        .from('leads')
        .insert([lead])
        .select()
        .single();

    if (error) {
        console.error('Supabase insert error:', error);
        throw error;
    }

    console.log('Lead created successfully:', data);
    return data as Lead;
}

export async function getLeads() {
    if (!isConfigured) return [] as Lead[];

    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Lead[];
}

export async function updateLeadStatus(id: string, status: Lead['status']) {
    if (!isConfigured) return null;

    const { data, error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Lead;
}

export async function searchLeads(phone: string) {
    if (!isConfigured) return [] as Lead[];

    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .or(`user_phone.ilike.%${phone}%,friend_phone.ilike.%${phone}%`)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Lead[];
}

// Batch update status for multiple leads
export async function updateLeadsStatusBatch(ids: string[], status: Lead['status']) {
    if (!isConfigured) return [];

    const { data, error } = await supabase
        .from('leads')
        .update({ status })
        .in('id', ids)
        .select();

    if (error) throw error;
    return data as Lead[];
}

// Delete specific leads by ID
export async function deleteLeads(ids: string[]) {
    if (!isConfigured) return true;

    const { error } = await supabase
        .from('leads')
        .delete()
        .in('id', ids);

    if (error) throw error;
    return true;
}

// Delete ALL leads (danger zone)
export async function deleteAllLeads() {
    if (!isConfigured) return true;

    const { error } = await supabase
        .from('leads')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) throw error;
    return true;
}

// Manually create a lead with optional fields
export interface ManualLeadInput {
    user_name: string;
    user_phone: string;
    email?: string;
    source?: string;
}

export async function createLeadManually(lead: ManualLeadInput) {
    if (!isConfigured) {
        return {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            status: 'new' as const,
            user_name: lead.user_name,
            user_phone: lead.user_phone,
            friend_name: '',
            friend_phone: '',
        } as Lead;
    }

    const { data, error } = await supabase
        .from('leads')
        .insert([{
            user_name: lead.user_name,
            user_phone: lead.user_phone,
            friend_name: lead.email || '',
            friend_phone: lead.source || '',
            status: 'new',
        }])
        .select()
        .single();

    if (error) throw error;
    return data as Lead;
}

// ============================================
// CRM SEGMENTS FUNCTIONS
// ============================================

export interface CrmSegment {
    id: string;
    name: string;
    color: string;
    order_index: number;
    created_at?: string;
}

// Default segments for when DB not configured
const defaultSegments: CrmSegment[] = [
    { id: '1', name: 'جديد', color: 'blue', order_index: 0 },
    { id: '2', name: 'تم التواصل', color: 'yellow', order_index: 1 },
    { id: '3', name: 'مؤكد', color: 'green', order_index: 2 },
    { id: '4', name: 'مرفوض', color: 'red', order_index: 3 },
];

export async function getSegments(): Promise<CrmSegment[]> {
    if (!isConfigured) return defaultSegments;

    const { data, error } = await supabase
        .from('crm_segments')
        .select('*')
        .order('order_index', { ascending: true });

    if (error) {
        console.warn('Failed to fetch segments, using defaults:', error);
        return defaultSegments;
    }
    return data as CrmSegment[];
}

export async function createSegment(segment: Omit<CrmSegment, 'id' | 'created_at'>): Promise<CrmSegment> {
    if (!isConfigured) {
        return { id: crypto.randomUUID(), ...segment };
    }

    const { data, error } = await supabase
        .from('crm_segments')
        .insert([segment])
        .select()
        .single();

    if (error) throw error;
    return data as CrmSegment;
}

export async function updateSegment(id: string, updates: Partial<CrmSegment>): Promise<CrmSegment> {
    if (!isConfigured) {
        return { id, name: '', color: '', order_index: 0, ...updates } as CrmSegment;
    }

    const { data, error } = await supabase
        .from('crm_segments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as CrmSegment;
}

export async function deleteSegment(id: string, moveToSegmentId?: string): Promise<boolean> {
    if (!isConfigured) return true;

    // If moveToSegmentId provided, move all leads first
    if (moveToSegmentId) {
        await supabase
            .from('leads')
            .update({ segment_id: moveToSegmentId })
            .eq('segment_id', id);
    }

    const { error } = await supabase
        .from('crm_segments')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

// Update single lead segment
export async function updateLeadSegment(leadId: string, segmentId: string): Promise<Lead | null> {
    if (!isConfigured) return null;

    const { data, error } = await supabase
        .from('leads')
        .update({ segment_id: segmentId })
        .eq('id', leadId)
        .select()
        .single();

    if (error) throw error;
    return data as Lead;
}

// Batch update segment for multiple leads
export async function updateLeadsSegmentBatch(leadIds: string[], segmentId: string): Promise<Lead[]> {
    if (!isConfigured) return [];

    const { data, error } = await supabase
        .from('leads')
        .update({ segment_id: segmentId })
        .in('id', leadIds)
        .select();

    if (error) throw error;
    return data as Lead[];
}

// ============================================
// SITE CONTENT CMS FUNCTIONS
// ============================================

export async function getSiteContent(): Promise<SiteContent> {
    if (!isConfigured) {
        return defaultContent;
    }

    try {
        const { data, error } = await supabase
            .from('site_content')
            .select('content')
            .eq('id', 1)
            .single();

        if (error || !data) {
            console.warn('Failed to fetch site content, using defaults');
            return defaultContent;
        }

        // Merge with defaults to ensure all fields exist
        return { ...defaultContent, ...data.content } as SiteContent;
    } catch {
        return defaultContent;
    }
}

export async function updateSiteContent(content: SiteContent): Promise<boolean> {
    if (!isConfigured) {
        console.warn('Supabase not configured - content not saved');
        return false;
    }

    try {
        const { error } = await supabase
            .from('site_content')
            .update({
                content,
                updated_at: new Date().toISOString()
            })
            .eq('id', 1);

        if (error) {
            console.error('Failed to update site content:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Error updating site content:', err);
        return false;
    }
}

// ============================================
// IMAGE UPLOAD FUNCTIONS
// ============================================

const STORAGE_BUCKET = 'images';

export async function uploadImage(file: File): Promise<string | null> {
    if (!isConfigured) {
        console.warn('Supabase not configured - image not uploaded');
        return null;
    }

    try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (err) {
        console.error('Error uploading image:', err);
        return null;
    }
}

export async function deleteImage(url: string): Promise<boolean> {
    if (!isConfigured || !url) return false;

    try {
        // Extract path from URL
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const filePath = pathParts.slice(pathParts.indexOf(STORAGE_BUCKET) + 1).join('/');

        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([filePath]);

        if (error) {
            console.error('Delete error:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Error deleting image:', err);
        return false;
    }
}
