// Floating Highlight Toolbox - Vanilla TS implementation
// Matches the ReadableView toolbox from main app

import { Highlight, HighlightColor, HIGHLIGHT_COLORS } from '../../@/lib/types/highlight';

export interface ToolboxCallbacks {
    onColorSelect: (color: HighlightColor) => Promise<void>;
    onCommentSave: (comment: string) => Promise<void>;
    onDelete: () => Promise<void>;
    onClose: () => void;
}

export interface ToolboxState {
    isOpen: boolean;
    isCommentMode: boolean;
    isLoading: boolean;
    existingHighlight: Highlight | null;
    position: { x: number; y: number };
}

// SVG Icons
const ICONS = {
    comment: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2.5a2 2 0 0 0-1.6.8L8 14.333 6.1 11.8a2 2 0 0 0-1.6-.8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
    <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/>
  </svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
  </svg>`,
    check: `✓`,
};

export class HighlightToolbox {
    private container: HTMLDivElement | null = null;
    private state: ToolboxState = {
        isOpen: false,
        isCommentMode: false,
        isLoading: false,
        existingHighlight: null,
        position: { x: 0, y: 0 },
    };
    private callbacks: ToolboxCallbacks | null = null;
    private commentValue: string = '';

    constructor() {
        this.createContainer();
        this.setupClickOutsideHandler();
    }

    private createContainer(): void {
        this.container = document.createElement('div');
        this.container.className = 'lw-toolbox lw-toolbox-hidden';
        this.container.id = 'lw-highlight-toolbox';
        document.body.appendChild(this.container);
    }

    private setupClickOutsideHandler(): void {
        document.addEventListener('mousedown', (e) => {
            if (!this.state.isOpen) return;

            const target = e.target as HTMLElement;
            if (this.container && !this.container.contains(target)) {
                this.close();
            }
        });
    }

    public show(
        position: { x: number; y: number },
        callbacks: ToolboxCallbacks,
        existingHighlight?: Highlight | null
    ): void {
        this.state = {
            isOpen: true,
            isCommentMode: false,
            isLoading: false,
            existingHighlight: existingHighlight || null,
            position,
        };
        this.callbacks = callbacks;
        this.commentValue = existingHighlight?.comment || '';
        this.render();
    }

    public close(): void {
        this.state.isOpen = false;
        this.state.isCommentMode = false;
        this.state.isLoading = false;
        this.callbacks?.onClose();
        this.render();

        // Clear selection
        window.getSelection()?.removeAllRanges();
    }

    public setLoading(loading: boolean): void {
        this.state.isLoading = loading;
        this.render();
    }

    private render(): void {
        if (!this.container) return;

        if (!this.state.isOpen) {
            this.container.className = 'lw-toolbox lw-toolbox-hidden';
            this.container.innerHTML = '';
            return;
        }

        // Position
        this.container.style.left = `${this.state.position.x}px`;
        this.container.style.top = `${this.state.position.y}px`;

        if (this.state.isLoading) {
            this.container.className = 'lw-toolbox';
            this.container.innerHTML = '<div class="lw-loading"></div>';
            return;
        }

        if (this.state.isCommentMode) {
            this.renderCommentMode();
        } else {
            this.renderColorMode();
        }
    }

    private renderColorMode(): void {
        if (!this.container) return;

        this.container.className = 'lw-toolbox';

        const currentColor = this.state.existingHighlight?.color;

        let html = HIGHLIGHT_COLORS.map((color) => {
            const isActive = currentColor === color;
            return `
        <button class="lw-color-btn lw-color-btn-${color} ${isActive ? 'lw-color-btn-active' : ''}" 
                data-color="${color}" 
                title="${color.charAt(0).toUpperCase() + color.slice(1)}">
        </button>
      `;
        }).join('');

        // Comment button
        html += `
      <button class="lw-icon-btn" data-action="comment" title="Add note">
        ${ICONS.comment}
      </button>
    `;

        // Delete button (only for existing highlights)
        if (this.state.existingHighlight) {
            html += `
        <button class="lw-icon-btn" data-action="delete" title="Delete">
          ${ICONS.trash}
        </button>
      `;
        }

        this.container.innerHTML = html;
        this.attachColorModeListeners();
    }

    private renderCommentMode(): void {
        if (!this.container) return;

        this.container.className = 'lw-toolbox lw-toolbox-comment-mode';

        this.container.innerHTML = `
      <textarea class="lw-comment-textarea" placeholder="Add a note...">${this.commentValue}</textarea>
      <div class="lw-comment-actions">
        <button class="lw-btn lw-btn-ghost" data-action="cancel-comment">Cancel</button>
        <button class="lw-btn lw-btn-primary" data-action="save-comment">Save</button>
      </div>
    `;

        this.attachCommentModeListeners();

        // Focus textarea
        const textarea = this.container.querySelector('.lw-comment-textarea') as HTMLTextAreaElement;
        if (textarea) {
            textarea.focus();
            textarea.selectionStart = textarea.value.length;
        }
    }

    private attachColorModeListeners(): void {
        if (!this.container) return;

        // Color buttons
        this.container.querySelectorAll('.lw-color-btn').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const color = (btn as HTMLElement).dataset.color as HighlightColor;
                if (color && this.callbacks) {
                    this.setLoading(true);
                    try {
                        await this.callbacks.onColorSelect(color);
                    } finally {
                        this.setLoading(false);
                    }
                }
            });
        });

        // Comment button
        this.container.querySelector('[data-action="comment"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.state.isCommentMode = true;
            this.render();
        });

        // Delete button
        this.container.querySelector('[data-action="delete"]')?.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (this.callbacks) {
                this.setLoading(true);
                try {
                    await this.callbacks.onDelete();
                } finally {
                    this.close();
                }
            }
        });
    }

    private attachCommentModeListeners(): void {
        if (!this.container) return;

        const textarea = this.container.querySelector('.lw-comment-textarea') as HTMLTextAreaElement;

        textarea?.addEventListener('input', (e) => {
            this.commentValue = (e.target as HTMLTextAreaElement).value;
        });

        // Cancel button
        this.container.querySelector('[data-action="cancel-comment"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.state.isCommentMode = false;
            this.commentValue = this.state.existingHighlight?.comment || '';
            this.render();
        });

        // Save button
        this.container.querySelector('[data-action="save-comment"]')?.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (this.callbacks) {
                this.setLoading(true);
                try {
                    await this.callbacks.onCommentSave(this.commentValue);
                } finally {
                    this.state.isCommentMode = false;
                    this.setLoading(false);
                }
            }
        });
    }

    public destroy(): void {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}

// Toast notification helper
export function showToast(message: string, type: 'success' | 'error' = 'success'): void {
    const existing = document.querySelector('.lw-toast');
    if (existing) {
        existing.remove();
    }

    const toast = document.createElement('div');
    toast.className = `lw-toast lw-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
