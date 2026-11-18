/**
 * UI Helper Functions
 */

class UIHelper {
    static showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
            type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    static showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const originalText = element.textContent;
            element.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
            element.disabled = true;
            element.dataset.originalText = originalText;
        }
    }

    static hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element && element.dataset.originalText) {
            element.textContent = element.dataset.originalText;
            element.disabled = false;
        }
    }

    static copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => UIHelper.showToast('Copied to clipboard!', 'success'))
            .catch(err => UIHelper.showToast('Failed to copy: ' + err, 'error'));
    }

    static formatJSON(obj) {
        return JSON.stringify(obj, null, 2);
    }

    static showElement(id) {
        const element = document.getElementById(id);
        if (element) element.classList.remove('hidden');
    }

    static hideElement(id) {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    }

    static setElementText(id, text) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    }

    static setElementValue(id, value) {
        const element = document.getElementById(id);
        if (element) element.value = value;
    }

    static getElementValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    }

    static clearElement(id) {
        const element = document.getElementById(id);
        if (element) element.value = '';
    }
}

// Export for use in main.js
window.UIHelper = UIHelper;