// Highlight Renderer - Applies and removes highlights on the page
// Ported from ReadableView.tsx's applyHighlight function

import { Highlight, HighlightColor } from '../../@/lib/types/highlight';

const HIGHLIGHT_DATA_ATTR = 'data-lw-highlight-id';

/**
 * Apply all highlights to the page
 */
export function applyHighlights(highlights: Highlight[]): void {
    // Sort by startOffset to apply in order
    const sortedHighlights = [...highlights].sort(
        (a, b) => a.startOffset - b.startOffset
    );

    for (const highlight of sortedHighlights) {
        applyHighlight(highlight);
    }
}

/**
 * Apply a single highlight to the page
 */
export function applyHighlight(highlight: Highlight): void {
    // Try text-based matching first (enables sync between live page and reader view)
    const textToFind = highlight.text;

    if (textToFind && textToFind.length > 0) {
        const foundByText = applyHighlightByText(highlight, textToFind);
        if (foundByText) return;
    }

    // Fallback to offset-based matching
    applyHighlightByOffset(highlight);
}

/**
 * Try to apply highlight by searching for the text content
 */
function applyHighlightByText(highlight: Highlight, searchText: string): boolean {
    const container = document.body;

    // Get all text content and find the position
    const allText = getFilteredTextContent(container);
    const searchIndex = allText.indexOf(searchText);

    if (searchIndex === -1) {
        // Try case-insensitive search
        const lowerText = allText.toLowerCase();
        const lowerSearch = searchText.toLowerCase();
        const caseInsensitiveIndex = lowerText.indexOf(lowerSearch);
        if (caseInsensitiveIndex === -1) {
            return false;
        }
        return applyHighlightAtPosition(highlight, caseInsensitiveIndex, caseInsensitiveIndex + searchText.length);
    }

    return applyHighlightAtPosition(highlight, searchIndex, searchIndex + searchText.length);
}

/**
 * Get filtered text content (excluding script, style, etc.)
 */
function getFilteredTextContent(container: HTMLElement): string {
    let text = '';
    const treeWalker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;

                const tagName = parent.tagName.toLowerCase();
                if (
                    tagName === 'script' ||
                    tagName === 'style' ||
                    tagName === 'noscript' ||
                    parent.classList.contains('lw-toolbox') ||
                    parent.hasAttribute(HIGHLIGHT_DATA_ATTR)
                ) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            },
        }
    );

    while (treeWalker.nextNode()) {
        text += treeWalker.currentNode.textContent || '';
    }
    return text;
}

/**
 * Apply highlight at specific offset positions
 */
function applyHighlightAtPosition(highlight: Highlight, startOffset: number, endOffset: number): boolean {
    const container = document.body;
    let currentOffset = 0;

    const treeWalker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;

                const tagName = parent.tagName.toLowerCase();
                if (
                    tagName === 'script' ||
                    tagName === 'style' ||
                    tagName === 'noscript' ||
                    parent.classList.contains('lw-toolbox') ||
                    parent.hasAttribute(HIGHLIGHT_DATA_ATTR)
                ) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            },
        }
    );

    const rangesToWrap: Array<{
        node: Text;
        start: number;
        end: number;
    }> = [];

    while (treeWalker.nextNode()) {
        const node = treeWalker.currentNode as Text;
        const nodeLength = node.textContent?.length ?? 0;
        const nodeStart = currentOffset;
        const nodeEnd = nodeStart + nodeLength;

        if (nodeStart < endOffset && nodeEnd > startOffset) {
            rangesToWrap.push({
                node,
                start: Math.max(0, startOffset - nodeStart),
                end: Math.min(nodeLength, endOffset - nodeStart),
            });
        }

        currentOffset += nodeLength;
    }

    if (rangesToWrap.length === 0) return false;

    // Apply wrapping
    rangesToWrap.forEach(({ node, start, end }) => {
        try {
            let targetNode = node;

            if (start > 0) {
                targetNode = node.splitText(start);
                end -= start;
            }

            if (end < targetNode.length) {
                targetNode.splitText(end);
            }

            const wrapper = document.createElement('span');
            wrapper.id = `lw-highlight-${highlight.id}`;
            wrapper.setAttribute(HIGHLIGHT_DATA_ATTR, highlight.id.toString());
            wrapper.className = getHighlightClasses(highlight.color as HighlightColor, !!highlight.comment);

            targetNode.parentNode?.insertBefore(wrapper, targetNode);
            wrapper.appendChild(targetNode);
        } catch (e) {
            console.warn('[Linkwarden] Failed to apply highlight:', e);
        }
    });

    return true;
}

/**
 * Fallback: Apply highlight using stored offsets
 */
function applyHighlightByOffset(highlight: Highlight): void {
    applyHighlightAtPosition(highlight, highlight.startOffset, highlight.endOffset);
}

/**
 * Remove a highlight from the page
 */
export function removeHighlight(highlightId: number): void {
    const elements = document.querySelectorAll(`[${HIGHLIGHT_DATA_ATTR}="${highlightId}"]`);

    elements.forEach((el) => {
        const parent = el.parentNode;
        while (el.firstChild) {
            parent?.insertBefore(el.firstChild, el);
        }
        parent?.removeChild(el);
    });

    // Normalize text nodes
    document.body.normalize();
}

/**
 * Remove all highlights from the page
 */
export function removeAllHighlights(): void {
    const elements = document.querySelectorAll(`[${HIGHLIGHT_DATA_ATTR}]`);

    elements.forEach((el) => {
        const parent = el.parentNode;
        while (el.firstChild) {
            parent?.insertBefore(el.firstChild, el);
        }
        parent?.removeChild(el);
    });

    document.body.normalize();
}

/**
 * Get the selection info for creating a new highlight
 */
export function getSelectionInfo(): {
    text: string;
    startOffset: number;
    endOffset: number;
    rect: DOMRect;
} | null {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        return null;
    }

    const range = selection.getRangeAt(0);
    const text = range.toString().trim();

    if (!text) {
        return null;
    }

    const rect = range.getBoundingClientRect();

    // Calculate global offsets
    let startOffset = -1;
    let endOffset = -1;
    let currentOffset = 0;

    const treeWalker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;

                const tagName = parent.tagName.toLowerCase();
                if (
                    tagName === 'script' ||
                    tagName === 'style' ||
                    tagName === 'noscript' ||
                    parent.classList.contains('lw-toolbox') ||
                    parent.hasAttribute(HIGHLIGHT_DATA_ATTR)
                ) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            },
        }
    );

    while (treeWalker.nextNode()) {
        const node = treeWalker.currentNode;
        const nodeLength = node.textContent?.length ?? 0;

        if (node === range.startContainer) {
            startOffset = currentOffset + range.startOffset;
        }

        if (node === range.endContainer) {
            endOffset = currentOffset + range.endOffset;
            break;
        }

        currentOffset += nodeLength;
    }

    if (startOffset === -1 || endOffset === -1) {
        return null;
    }

    return {
        text,
        startOffset,
        endOffset,
        rect,
    };
}

/**
 * Get CSS classes for a highlight
 */
function getHighlightClasses(color: HighlightColor, hasComment: boolean): string {
    const classes = [`lw-highlight-${color}`];
    if (hasComment) {
        classes.push('lw-has-comment');
    }
    return classes.join(' ');
}

/**
 * Update highlight classes (e.g., when comment is added)
 */
export function updateHighlightClasses(
    highlightId: number,
    color: HighlightColor,
    hasComment: boolean
): void {
    const elements = document.querySelectorAll(`[${HIGHLIGHT_DATA_ATTR}="${highlightId}"]`);
    elements.forEach((el) => {
        el.className = getHighlightClasses(color, hasComment);
    });
}

/**
 * Get highlight ID from clicked element
 */
export function getHighlightIdFromElement(element: HTMLElement): number | null {
    const id = element.getAttribute(HIGHLIGHT_DATA_ATTR);
    if (id) {
        return parseInt(id, 10);
    }

    // Check parent
    const parent = element.closest(`[${HIGHLIGHT_DATA_ATTR}]`);
    if (parent) {
        const parentId = parent.getAttribute(HIGHLIGHT_DATA_ATTR);
        return parentId ? parseInt(parentId, 10) : null;
    }

    return null;
}
