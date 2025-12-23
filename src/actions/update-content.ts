'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { SiteContent } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl && supabaseAnonKey;

// Create a server-side Supabase client
const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export interface UpdateContentResult {
    success: boolean;
    error?: string;
}

export async function updateSiteContentAction(content: SiteContent): Promise<UpdateContentResult> {
    if (!isConfigured || !supabase) {
        console.warn('Supabase not configured - content not saved');
        return { success: false, error: 'Database not configured' };
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
            return { success: false, error: error.message };
        }

        // CRITICAL: Revalidate cached pages to reflect new content
        revalidatePath('/', 'layout');      // Clears cache for the landing page
        revalidatePath('/admin', 'page');   // Clears cache for the admin dashboard
        revalidatePath('/thank-you', 'page');

        return { success: true };
    } catch (err) {
        console.error('Error updating site content:', err);
        return { success: false, error: 'Unexpected error occurred' };
    }
}
