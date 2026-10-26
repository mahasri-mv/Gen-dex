/**
 * GeneDex Modal Component
 */
export class Modal {
    constructor(id, title, contentHtml, footerHtml = '') {
        this.id = id;
        this.title = title;
        this.contentHtml = contentHtml;
        this.footerHtml = footerHtml;
        this.backdrop = null;
    }

    render() {
        let existing = document.getElementById(this.id);
        if (existing) existing.remove();

        this.backdrop = document.createElement('div');
        this.backdrop.id = this.id;
        this.backdrop.className = 'modal-backdrop';

        this.backdrop.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3 class="modal-title">${this.title}</h3>
                    <button type="button" class="modal-close-btn" data-action="close">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.contentHtml}
                </div>
                ${this.footerHtml ? `<div class="modal-footer">${this.footerHtml}</div>` : ''}
            </div>
        `;

        document.body.appendChild(this.backdrop);

        this.backdrop.addEventListener('click', (e) => {
            if (e.target === this.backdrop || e.target.closest('[data-action="close"]')) {
                this.close();
            }
        });
    }

    open() {
        if (!this.backdrop) this.render();
        this.backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (this.backdrop) {
            this.backdrop.classList.remove('open');
            document.body.style.overflow = '';
        }
    }
}
