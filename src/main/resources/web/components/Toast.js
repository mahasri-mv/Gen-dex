/**
 * GeneDex Toast Notification Component
 */
export class Toast {
    static getContainer() {
        let el = document.getElementById('toastContainer');
        if (!el) {
            el = document.createElement('div');
            el.id = 'toastContainer';
            el.className = 'toast-container';
            document.body.appendChild(el);
        }
        return el;
    }

    static show(message, type = 'info', title = '') {
        const container = this.getContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = 'ℹ️';
        if (type === 'success') icon = '✔';
        if (type === 'error') icon = '✖';

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 4000);
    }

    static success(msg, title = 'Success') {
        this.show(msg, 'success', title);
    }

    static error(msg, title = 'Notice') {
        this.show(msg, 'error', title);
    }

    static info(msg, title = 'Information') {
        this.show(msg, 'info', title);
    }
}
