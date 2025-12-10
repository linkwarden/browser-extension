// Highlight API actions for browser extension

import { Highlight, HighlightCreateData, LinkWithHighlights } from '../types/highlight.ts';

/**
 * Get link by URL with its highlights
 */
export async function getLinkByUrl(
    baseUrl: string,
    url: string,
    apiKey: string
): Promise<LinkWithHighlights | null> {
    const searchUrl = `${baseUrl}/api/v1/links?searchQueryString=${encodeURIComponent(url)}`;

    const response = await fetch(searchUrl, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        console.error('Failed to get link by URL:', response.status);
        return null;
    }

    const data = await response.json();
    const links = data.response;

    if (!links || links.length === 0) {
        return null;
    }

    // Find exact URL match
    const exactMatch = links.find((link: LinkWithHighlights) => link.url === url);
    return exactMatch || null;
}

/**
 * Get highlights for a specific link
 */
export async function getLinkHighlights(
    baseUrl: string,
    linkId: number,
    apiKey: string
): Promise<Highlight[]> {
    const url = `${baseUrl}/api/v1/links/${linkId}/highlights`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        console.error('Failed to get highlights:', response.status);
        return [];
    }

    const data = await response.json();
    return data.response || [];
}

/**
 * Create or update a highlight
 */
export async function postHighlight(
    baseUrl: string,
    data: HighlightCreateData,
    apiKey: string
): Promise<Highlight | null> {
    const url = `${baseUrl}/api/v1/highlights`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create highlight:', errorData);
        return null;
    }

    const result = await response.json();
    return result.response;
}

/**
 * Delete a highlight
 */
export async function deleteHighlight(
    baseUrl: string,
    highlightId: number,
    apiKey: string
): Promise<boolean> {
    const url = `${baseUrl}/api/v1/highlights/${highlightId}`;

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        console.error('Failed to delete highlight:', response.status);
        return false;
    }

    return true;
}

/**
 * Create a new link (for auto-save when highlighting on unsaved page)
 */
export async function createLinkForHighlight(
    baseUrl: string,
    pageUrl: string,
    pageTitle: string,
    apiKey: string
): Promise<LinkWithHighlights | null> {
    const url = `${baseUrl}/api/v1/links`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            url: pageUrl,
            name: pageTitle,
            description: '',
            collection: {
                name: 'Unorganized',
            },
            tags: [],
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create link:', errorData);
        return null;
    }

    const result = await response.json();
    return result.response;
}
