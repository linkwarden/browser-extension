/// <reference types="chrome" />
// Linkwarden Content Script - Main entry point
// Injects highlight functionality into web pages

import { Highlight, HighlightColor, HighlightCreateData } from '../../@/lib/types/highlight';
import {
    applyHighlights,
    applyHighlight,
    removeHighlight,
    getSelectionInfo,
    getHighlightIdFromElement,
    updateHighlightClasses
} from './highlightRenderer';
import { HighlightToolbox, showToast } from './HighlightToolbox';

// Message types for background script communication
interface MessageResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

interface LinkData {
    id: number;
    url: string;
    name: string;
}

// Global state
let toolbox: HighlightToolbox | null = null;
let currentPageLinkId: number | null = null;
let currentHighlights: Highlight[] = [];
let isConfigured = false;

// Initialize on page load
async function init(): Promise<void> {
    console.log('[Linkwarden] Content script initializing...');

    // Check if extension is configured
    const configCheck = await sendMessage<{ configured: boolean }>('CHECK_CONFIG');
    if (!configCheck.success || !configCheck.data?.configured) {
        console.log('[Linkwarden] Extension not configured, skipping highlight initialization');
        return;
    }
    isConfigured = true;

    // Create toolbox
    toolbox = new HighlightToolbox();

    // Load existing highlights for this page
    await loadHighlightsForPage();

    // Setup event listeners
    setupEventListeners();

    console.log('[Linkwarden] Content script initialized');
}

/**
 * Load highlights for the current page
 */
async function loadHighlightsForPage(): Promise<void> {
    const pageUrl = window.location.href;

    const response = await sendMessage<{ link: LinkData | null; highlights: Highlight[] }>(
        'GET_LINK_WITH_HIGHLIGHTS',
        { url: pageUrl }
    );

    if (response.success && response.data) {
        if (response.data.link) {
            currentPageLinkId = response.data.link.id;
            currentHighlights = response.data.highlights || [];

            if (currentHighlights.length > 0) {
                console.log(`[Linkwarden] Applying ${currentHighlights.length} highlight(s)`);
                applyHighlights(currentHighlights);
            }
        }
    }
}

/**
 * Setup event listeners for text selection and highlight clicks
 */
function setupEventListeners(): void {
    // Text selection (mouseup)
    document.addEventListener('mouseup', handleMouseUp);

    // Keyboard escape to close toolbox
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toolbox) {
            toolbox.close();
        }
    });

    // Listen for context menu messages from background
    chrome.runtime.onMessage.addListener(
        (
            message: { type: string },
            _sender: chrome.runtime.MessageSender,
            sendResponse: (response: { success: boolean }) => void
        ) => {
            if (message.type === 'SHOW_HIGHLIGHT_TOOLBOX') {
                handleContextMenuHighlight();
                sendResponse({ success: true });
            }
            return true;
        }
    );
}

/**
 * Handle mouse up event - show toolbox for selection or existing highlight
 */
function handleMouseUp(event: MouseEvent): void {
    if (!toolbox || !isConfigured) return;

    // Small delay to ensure selection is complete
    setTimeout(() => {
        const target = event.target as HTMLElement;

        // Check if clicked on existing highlight
        const highlightId = getHighlightIdFromElement(target);

        if (highlightId) {
            const existingHighlight = currentHighlights.find(h => h.id === highlightId);
            if (existingHighlight) {
                showToolboxForExistingHighlight(existingHighlight, event);
                return;
            }
        }

        // Check for new text selection
        const selectionInfo = getSelectionInfo();
        if (selectionInfo && selectionInfo.text.length > 0) {
            showToolboxForNewSelection(selectionInfo);
        }
    }, 10);
}

/**
 * Handle context menu trigger
 */
function handleContextMenuHighlight(): void {
    if (!toolbox || !isConfigured) return;

    const selectionInfo = getSelectionInfo();
    if (selectionInfo && selectionInfo.text.length > 0) {
        showToolboxForNewSelection(selectionInfo);
    }
}

/**
 * Show toolbox for a new text selection
 */
function showToolboxForNewSelection(selectionInfo: ReturnType<typeof getSelectionInfo>): void {
    if (!toolbox || !selectionInfo) return;

    const position = {
        x: selectionInfo.rect.left + window.scrollX + selectionInfo.rect.width / 2,
        y: selectionInfo.rect.top + window.scrollY,
    };

    toolbox.show(position, {
        onColorSelect: async (color: HighlightColor) => {
            await createHighlight(selectionInfo, color);
        },
        onCommentSave: async (comment: string) => {
            await createHighlight(selectionInfo, 'yellow', comment);
        },
        onDelete: async () => {
            // No-op for new selection
        },
        onClose: () => {
            // Selection cleared by toolbox
        },
    });
}

/**
 * Show toolbox for an existing highlight
 */
function showToolboxForExistingHighlight(highlight: Highlight, event: MouseEvent): void {
    if (!toolbox) return;

    const position = {
        x: event.clientX + window.scrollX,
        y: event.clientY + window.scrollY,
    };

    toolbox.show(position, {
        onColorSelect: async (color: HighlightColor) => {
            await updateHighlight(highlight, color);
        },
        onCommentSave: async (comment: string) => {
            await updateHighlight(highlight, highlight.color as HighlightColor, comment);
        },
        onDelete: async () => {
            await deleteHighlightFromPage(highlight.id);
        },
        onClose: () => { },
    }, highlight);
}

/**
 * Create a new highlight (and auto-save link if needed)
 */
async function createHighlight(
    selectionInfo: NonNullable<ReturnType<typeof getSelectionInfo>>,
    color: HighlightColor,
    comment?: string
): Promise<void> {
    // If page not saved yet, save it first
    if (!currentPageLinkId) {
        console.log('[Linkwarden] Page not saved, creating link first...');
        showToast('Saving page to Linkwarden...', 'success');

        const linkResponse = await sendMessage<{ link: LinkData }>('CREATE_LINK', {
            url: window.location.href,
            title: document.title,
        });

        if (!linkResponse.success || !linkResponse.data?.link) {
            showToast('Failed to save page', 'error');
            return;
        }

        currentPageLinkId = linkResponse.data.link.id;
        showToast('Page saved!', 'success');
    }

    // Create highlight
    const highlightData: HighlightCreateData = {
        linkId: currentPageLinkId,
        color,
        comment: comment || undefined,
        text: selectionInfo.text,
        startOffset: selectionInfo.startOffset,
        endOffset: selectionInfo.endOffset,
    };

    const response = await sendMessage<{ highlight: Highlight }>('CREATE_HIGHLIGHT', highlightData);

    if (response.success && response.data?.highlight) {
        const newHighlight = response.data.highlight;
        currentHighlights.push(newHighlight);
        applyHighlight(newHighlight);
        toolbox?.close();
        showToast('Highlight created!', 'success');
    } else {
        showToast(response.error || 'Failed to create highlight', 'error');
    }
}

/**
 * Update an existing highlight (color or comment)
 */
async function updateHighlight(
    highlight: Highlight,
    color: HighlightColor,
    comment?: string
): Promise<void> {
    const updatedData: HighlightCreateData = {
        linkId: highlight.linkId,
        color,
        comment: comment !== undefined ? comment : highlight.comment || undefined,
        text: highlight.text,
        startOffset: highlight.startOffset,
        endOffset: highlight.endOffset,
    };

    const response = await sendMessage<{ highlight: Highlight }>('CREATE_HIGHLIGHT', updatedData);

    if (response.success && response.data?.highlight) {
        const updatedHighlight = response.data.highlight;

        // Update local state
        const index = currentHighlights.findIndex(h => h.id === highlight.id);
        if (index !== -1) {
            currentHighlights[index] = updatedHighlight;
        }

        // Update DOM
        updateHighlightClasses(highlight.id, color, !!updatedHighlight.comment);

        toolbox?.close();
        showToast('Highlight updated!', 'success');
    } else {
        showToast(response.error || 'Failed to update highlight', 'error');
    }
}

/**
 * Delete a highlight
 */
async function deleteHighlightFromPage(highlightId: number): Promise<void> {
    const response = await sendMessage('DELETE_HIGHLIGHT', { highlightId });

    if (response.success) {
        // Remove from local state
        currentHighlights = currentHighlights.filter(h => h.id !== highlightId);

        // Remove from DOM
        removeHighlight(highlightId);

        showToast('Highlight deleted', 'success');
    } else {
        showToast(response.error || 'Failed to delete highlight', 'error');
    }
}

/**
 * Send message to background script
 */
function sendMessage<T>(type: string, data?: unknown): Promise<MessageResponse<T>> {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type, data }, (response: MessageResponse<T>) => {
            if (chrome.runtime.lastError) {
                console.error('[Linkwarden] Message error:', chrome.runtime.lastError);
                resolve({ success: false, error: chrome.runtime.lastError.message });
            } else {
                resolve(response || { success: false, error: 'No response' });
            }
        });
    });
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
