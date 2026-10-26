/**
 * GeneDex Centralized API Client & State Service
 * Handles REST calls, CSRF tokens, Session persistence, and Dataset state.
 */

class ApiService {
    constructor() {
        this.csrfToken = "";
        this.token = "";
        this.currentUser = null;
        this.activeDataset = null;
        this.datasetChangeListeners = [];

        // Restore saved session token from localStorage if present
        try {
            const saved = localStorage.getItem('genedex_token');
            if (saved) this.token = saved;
        } catch (e) {
            console.warn("Could not read localStorage token:", e);
        }
    }

    onDatasetChange(fn) {
        if (typeof fn === 'function') {
            this.datasetChangeListeners.push(fn);
        }
    }

    notifyDatasetChange(dataset) {
        this.activeDataset = dataset;
        this.datasetChangeListeners.forEach(fn => {
            try { fn(dataset); } catch (e) { console.error("Dataset listener error:", e); }
        });
    }

    async request(endpoint, options = {}) {
        const headers = options.headers || {};

        if (this.csrfToken) {
            headers['X-CSRF-Token'] = this.csrfToken;
        }
        if (this.token) {
            headers['Authorization'] = 'Bearer ' + this.token;
        }

        const config = {
            ...options,
            headers: headers,
            credentials: 'same-origin'
        };

        try {
            const response = await fetch(endpoint, config);
            const contentType = response.headers.get("content-type") || "";

            if (contentType.includes("application/json")) {
                const data = await response.json();
                if (data.csrfToken) this.csrfToken = data.csrfToken;
                return data;
            } else {
                const text = await response.text();
                return { success: response.ok, rawText: text, status: response.status };
            }
        } catch (err) {
            console.error("API Error (" + endpoint + "):", err);
            return { success: false, error: "Network or Server error: " + err.message };
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, body) {
        const isJson = typeof body === 'object' && body !== null;
        const headers = {
            'Content-Type': isJson ? 'application/json; charset=UTF-8' : 'text/plain; charset=UTF-8'
        };
        return this.request(endpoint, {
            method: 'POST',
            headers: headers,
            body: isJson ? JSON.stringify(body) : body
        });
    }

    // =========================================================================
    // Dataset Management Endpoints
    // =========================================================================
    async getDatasets() {
        const res = await this.get('/api/datasets');
        if (res && res.success && res.activeDataset) {
            this.activeDataset = res.activeDataset;
        }
        return res;
    }

    async setActiveDataset(datasetId) {
        const res = await this.post('/api/datasets/active', { datasetId });
        if (res && res.success) {
            await this.getDatasets();
            this.notifyDatasetChange(this.activeDataset);
        }
        return res;
    }

    async uploadFastq(content, datasetName = null) {
        let payload;
        if (datasetName) {
            payload = { name: datasetName, content: content };
        } else {
            payload = content;
        }
        const res = await this.post('/api/datasets', payload);
        if (res && res.success) {
            await this.getDatasets();
            this.notifyDatasetChange(this.activeDataset);
        }
        return res;
    }

    async rebuildDataset() {
        const res = await this.post('/api/rebuild', {});
        if (res && res.success) {
            await this.getDatasets();
            this.notifyDatasetChange(this.activeDataset);
        }
        return res;
    }

    async deleteDataset(datasetId = null) {
        let endpoint = '/api/datasets';
        if (datasetId) endpoint += '?id=' + encodeURIComponent(datasetId);
        const res = await this.request(endpoint, { method: 'DELETE' });
        if (res && res.success) {
            await this.getDatasets();
            this.notifyDatasetChange(this.activeDataset);
        }
        return res;
    }

    async getActiveDatasetStatus() {
        return this.get('/api/status');
    }

    async getStatistics() {
        return this.get('/api/statistics');
    }

    // =========================================================================
    // User-Level Genomic Operations
    // =========================================================================
    async countAndLocate(pattern) {
        return this.get(`/api/find?pattern=${encodeURIComponent(pattern)}`);
    }

    async extractRead(readIndex) {
        return this.get(`/api/extract-read?k=${encodeURIComponent(readIndex)}`);
    }

    async getReadStatistics(readIndexOrQuery) {
        return this.get(`/api/read-statistics?query=${encodeURIComponent(readIndexOrQuery)}`);
    }

    async getReads(page = 1, pageSize = 10, query = '') {
        let url = `/api/reads?page=${page}&pageSize=${pageSize}`;
        if (query) url += `&query=${encodeURIComponent(query)}`;
        return this.get(url);
    }

    async getReadFastqRecord(readId) {
        return this.get(`/api/datasets/active/reads/${encodeURIComponent(readId)}/record`);
    }

    async getAnalytics() {
        return this.get('/api/analytics');
    }

    async getComposition(params = {}) {
        const q = new URLSearchParams();
        if (params.symbol) q.set('symbol', params.symbol);
        if (params.s !== undefined && params.s !== null && params.s !== '') q.set('s', params.s);
        if (params.e !== undefined && params.e !== null && params.e !== '') q.set('e', params.e);
        if (params.readIndex !== undefined && params.readIndex !== null && params.readIndex !== '') q.set('readIndex', params.readIndex);
        if (params.readId) q.set('readId', params.readId);
        const qs = q.toString();
        return this.get(`/api/composition${qs ? '?' + qs : ''}`);
    }

    // =========================================================================
    // Authentication & RBAC
    // =========================================================================
    async checkAuth() {
        try {
            const res = await this.get('/api/auth/me');
            if (res && res.success && res.authenticated && res.user) {
                this.currentUser = res.user;
                this.csrfToken = res.csrfToken || "";
                return res.user;
            } else {
                this.currentUser = null;
                return null;
            }
        } catch (e) {
            this.currentUser = null;
            return null;
        }
    }

    async login(email, password, rememberMe = false) {
        const res = await this.post('/api/auth/login', { email, password, rememberMe });
        if (res && res.success && res.user) {
            this.currentUser = res.user;
            if (res.token) {
                this.token = res.token;
                try { localStorage.setItem('genedex_token', res.token); } catch (e) {}
            }
            if (res.csrfToken) this.csrfToken = res.csrfToken;
        }
        return res;
    }

    async register(data) {
        const res = await this.post('/api/auth/register', data);
        if (res && res.success && res.user) {
            this.currentUser = res.user;
            if (res.csrfToken) this.csrfToken = res.csrfToken;
        }
        return res;
    }

    async forgotPassword(email) {
        return this.post('/api/auth/forgot-password', { email });
    }

    async resetPassword(token, newPassword) {
        return this.post('/api/auth/reset-password', { token, newPassword });
    }

    async guestLogin() {
        const res = await this.post('/api/auth/guest', {});
        if (res && res.success && res.user) {
            this.currentUser = res.user;
            if (res.csrfToken) this.csrfToken = res.csrfToken;
        }
        return res;
    }

    async logout() {
        try { await this.post('/api/auth/logout', {}); } catch (e) {}
        this.currentUser = null;
        this.token = "";
        this.csrfToken = "";
        try { localStorage.removeItem('genedex_token'); } catch (e) {}
        try { sessionStorage.removeItem('genedex_token'); } catch (e) {}
    }

    async getProfile() {
        return this.get('/api/auth/profile');
    }

    async updateProfile(data) {
        const res = await this.post('/api/auth/profile', data);
        if (res && res.success && res.user) {
            this.currentUser = res.user;
        }
        return res;
    }

    // =========================================================================
    // Administrator & System Management Endpoints (RBAC Protected)
    // =========================================================================
    async getAdminUsers() {
        return this.get('/api/admin/users');
    }

    async updateUser(userId, data) {
        return this.request('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId, ...data })
        });
    }

    async getAdminAuditLogs() {
        return this.get('/api/admin/audit-logs');
    }

    async getAdminHealth() {
        return this.get('/api/admin/system-health');
    }

    async runConsistencyCheck() {
        return this.get('/api/admin/consistency-check');
    }
}

// Global Export
export const api = new ApiService();
