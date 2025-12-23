import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type Lead } from './supabase';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format date for display
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

// Export leads to CSV
export function exportToCSV(leads: Lead[], filename: string) {
    const headers = ['الاسم', 'رقم الهاتف', 'اسم الزميل', 'رقم الزميل', 'الحالة', 'تاريخ التسجيل'];
    const csvContent = [
        headers.join(','),
        ...leads.map(lead => [
            `"${lead.user_name}"`,
            lead.user_phone,
            `"${lead.friend_name}"`,
            lead.friend_phone,
            lead.status,
            `"${formatDate(lead.created_at)}"`,
        ].join(','))
    ].join('\n');

    // Add BOM for proper Arabic display in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

// Scroll to element smoothly
export function scrollToElement(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Generate WhatsApp link
export function getWhatsAppLink(phone: string, message: string): string {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
}
