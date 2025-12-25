/**
 * Facebook Pixel Advanced Matching Utilities
 * Implements SHA-256 hashing for name and phone matching
 */

/**
 * SHA-256 hash function using Web Crypto API
 */
export async function sha256(message: string): Promise<string> {
    if (!message) return '';

    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Normalize phone number for matching
 * - Removes all non-numeric characters
 * - Handles Egyptian phone formats
 */
export function normalizePhone(phone: string): string {
    if (!phone) return '';

    // Remove all non-numeric characters (spaces, dashes, parentheses, etc.)
    let normalized = phone.trim().replace(/\D/g, '');

    // Egyptian phones: If starts with 01, it's local format
    // Facebook can match both local and international formats
    // Optionally prepend country code +20 for better matching
    if (normalized.startsWith('01') && normalized.length === 11) {
        // This is a valid Egyptian mobile number
        // Can optionally convert to international: 20 + number without leading 0
        // normalized = '20' + normalized.substring(1);
    }

    return normalized;
}

/**
 * Split full name into first name and last name
 * Handles Arabic and English names
 */
export function splitName(fullName: string): { firstName: string; lastName: string } {
    if (!fullName) return { firstName: '', lastName: '' };

    // Normalize: lowercase and trim
    const normalized = fullName.trim().toLowerCase();

    // Split by whitespace
    const parts = normalized.split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return { firstName: '', lastName: '' };
    }

    if (parts.length === 1) {
        return { firstName: parts[0], lastName: '' };
    }

    // First name is the first part, last name is the last part
    return {
        firstName: parts[0],
        lastName: parts[parts.length - 1]
    };
}

/**
 * Prepare user data for Facebook Advanced Matching
 */
export async function prepareAdvancedMatchingData(userData: {
    user_name: string;
    user_phone: string;
}): Promise<{
    ph: string;      // Hashed phone
    fn: string;      // Hashed first name
    ln?: string;     // Hashed last name (optional)
}> {
    // Normalize phone
    const normalizedPhone = normalizePhone(userData.user_phone);
    const hashedPhone = await sha256(normalizedPhone);

    // Split and hash name
    const { firstName, lastName } = splitName(userData.user_name);
    const hashedFirstName = await sha256(firstName);
    const hashedLastName = lastName ? await sha256(lastName) : undefined;

    return {
        ph: hashedPhone,
        fn: hashedFirstName,
        ...(hashedLastName && { ln: hashedLastName })
    };
}

/**
 * Track Lead event with Advanced Matching
 */
export async function trackLeadWithAdvancedMatching(userData: {
    user_name: string;
    user_phone: string;
    friend_name?: string;
    friend_phone?: string;
}): Promise<void> {
    // Prepare hashed user data for matching
    const advancedMatchingData = await prepareAdvancedMatchingData({
        user_name: userData.user_name,
        user_phone: userData.user_phone
    });

    // Fire Facebook Pixel Lead event
    if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
            // Event parameters
            content_name: 'First Aid Course Registration',
            currency: 'EGP',
            value: 100,
            // Custom properties (friend info - NOT for matching, just for records)
            friend_referral: !!(userData.friend_name || userData.friend_phone),
            friend_count: userData.friend_name ? 1 : 0
        }, {
            // Advanced Matching Keys (hashed user data only)
            ...advancedMatchingData
        });

        console.log('[FB Pixel] Lead event fired with Advanced Matching:', {
            hasPhone: !!advancedMatchingData.ph,
            hasFirstName: !!advancedMatchingData.fn,
            hasLastName: !!advancedMatchingData.ln
        });
    }
}

/**
 * Track InitiateCheckout event (when user starts filling form)
 */
export async function trackInitiateCheckout(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'InitiateCheckout', {
            content_name: 'First Aid Course',
            currency: 'EGP',
            value: 0
        });
    }
}
