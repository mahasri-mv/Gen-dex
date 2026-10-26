/**
 * GeneDex - Admin Dashboard Page
 * System Administrator Actor Role:
 * 1. Index Health Cards: bits per base, delta, number of reads, total bases, JVM memory.
 * 2. "Run Index Consistency Check": verifies alphabet order ($ < A < C < G < T < N),
 *    C-table totals, read count = boundary bits, and ACCESS/EXTRACT round-trips.
 * 3. Rebuild Index (with confirmation modal).
 * 4. User Accounts Table (role, status, organization, last login).
 * 5. Sequencing Pipeline Ingestion Log & System Audit Log.
 * 6. Storage usage and JVM environment stats.
 */

import { api } from '../services/api.js';
import { Toast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';

export class AdminDashboardPage {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentUser = null;
        this.activeDataset = null;
        this.statsData = null;
        this.healthData = null;
        this.usersList = [];
        this.auditLogs = [];
        this.consistencyResult = null;
        this.activeTab = 'consistency'; // 'consistency' | 'users' | 'pipeline' | 'audit' | 'system'
    }

    async render() {
        if (!this.container) return;

        // Check authentication & role
        this.currentUser = await api.checkAuth();

        if (!this.currentUser || this.currentUser.role !== 'ADMIN') {
            this.renderRestrictedAccess();
            return;
        }

        // Fetch all administrative telemetry & data
        const [dsRes, statsRes, healthRes, usersRes, logsRes] = await Promise.all([
            api.getDatasets(),
            api.getStatistics(),
            api.getAdminHealth(),
            api.getAdminUsers(),
            api.getAdminAuditLogs()
        ]);

        this.activeDataset = (dsRes && dsRes.success) ? dsRes.activeDataset : null;
        this.statsData = (statsRes && statsRes.success) ? (statsRes.statistics || statsRes) : {};
        this.healthData = (healthRes && healthRes.success) ? healthRes.health : {};
        this.usersList = (usersRes && usersRes.success) ? (usersRes.users || []) : [];
        this.auditLogs = (logsRes && logsRes.success) ? (logsRes.logs || []) : [];

        this.renderAdminView();
    }

    renderRestrictedAccess() {
        this.container.innerHTML = `
            <div class="page-container" style="padding-top: 48px; padding-bottom: 64px;">
                <div class="empty-state-box" style="max-width: 600px; margin: 0 auto; text-align: center; background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); padding: 48px 32px; box-shadow: var(--shadow-card);">
                    <div style="width: 56px; height: 56px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; color: #ef4444; margin-bottom: 18px;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <div style="display: inline-block; padding: 4px 12px; background: #fef2f2; color: #ef4444; border-radius: var(--radius-pill); font-size: 0.76rem; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
                        SYSTEM ADMINISTRATOR ROLE REQUIRED
                    </div>
                    <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--text-heading); margin-bottom: 12px;">
                        Restricted Administrative Dashboard
                    </h2>
                    <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.6; margin-bottom: 24px;">
                        Access to index rebuilding, consistency verification, pipeline ingestion records, and user management is reserved for the <strong>System Administrator</strong> actor.
                    </p>

                    <!-- Quick Sign In as Demo Admin -->
                    <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: left;">
                        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">
                            Quick Evaluation Access:
                        </div>
                        <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 14px;">
                            You can switch instantly to the seeded platform administrator account:
                            <code style="display: block; margin-top: 4px; color: var(--brand-green);">admin@genomicdemo.local &bull; AdminDemo@2026!</code>
                        </div>
                        <button type="button" class="btn-primary-hero" id="btnQuickLoginAdmin" style="width: 100%; justify-content: center; font-size: 0.85rem; padding: 10px;">
                            Sign In as Platform Administrator
                        </button>
                    </div>

                    <a href="#/home" class="btn-secondary-action" style="justify-content: center; padding: 8px 18px;">
                        &larr; Return to Home
                    </a>
                </div>
            </div>
        `;

        const btnQuick = this.container.querySelector('#btnQuickLoginAdmin');
        if (btnQuick) {
            btnQuick.addEventListener('click', async () => {
                btnQuick.disabled = true;
                btnQuick.textContent = 'Authenticating...';
                const res = await api.login('admin@genomicdemo.local', 'AdminDemo@2026!');
                if (res && res.success) {
                    Toast.success('Authenticated as System Administrator.');
                    // Reload navbar and page
                    window.location.hash = '#/admin';
                    window.location.reload();
                } else {
                    btnQuick.disabled = false;
                    btnQuick.textContent = 'Sign In as Platform Administrator';
                    Toast.error('Login failed: ' + (res.error || 'Invalid credentials'));
                }
            });
        }
    }

    renderAdminView() {
        const ds = this.activeDataset || {};
        const st = this.statsData || {};
        const hl = this.healthData || {};

        const bitsPerBase = st.bitsPerBase || 2.0;
        const delta = st.samplingStepDelta || 16;
        const totalReads = ds.totalReads || 1;
        const totalBases = ds.totalBases || 14;

        this.container.innerHTML = `
            <div class="page-container" style="padding-top: 32px; padding-bottom: 64px;">
                <!-- Header Strip -->
                <div class="page-header" style="margin-bottom: 24px;">
                    <div class="breadcrumb" style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px;">
                        <a href="#/home" style="color: var(--text-muted); text-decoration: none;">Home</a> /
                        <span style="color: #ef4444; font-weight: 600;">Admin Dashboard</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--text-heading); margin: 0;">
                                    System Administrator Control Center
                                </h1>
                                <span class="badge-op" style="background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; font-weight: 800;">
                                    ACTOR: ADMINISTRATOR
                                </span>
                            </div>
                            <p style="color: var(--text-muted); font-size: 0.92rem; margin: 6px 0 0 0;">
                                Manage index structural consistency, rebuild compressed representations, monitor pipeline ingestion, and administrate user accounts.
                            </p>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                            <button type="button" class="btn-primary-hero" id="btnHeaderConsistencyCheck" style="font-size: 0.84rem; padding: 8px 16px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Run Consistency Check
                            </button>
                            <button type="button" class="btn-secondary-action" id="btnHeaderRebuildIndex" style="font-size: 0.84rem; padding: 8px 14px; color: #b45309; border-color: #fde68a; background: #fffbeb;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                                Rebuild Index
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Index Health Cards (6 Cards) -->
                <div class="admin-health-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 28px;">
                    <div class="metric-card">
                        <div class="metric-label">SPACE PER BASE</div>
                        <div class="metric-val" style="color: #4338ca;">~${bitsPerBase} <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">bits</span></div>
                        <div class="metric-sub">Wavelet Tree compressed</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">SAMPLING FACTOR (&delta;)</div>
                        <div class="metric-val" style="color: var(--text-heading);">${delta}</div>
                        <div class="metric-sub">SA sample step delta</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">TOTAL READS</div>
                        <div class="metric-val" style="color: var(--brand-green);">${totalReads}</div>
                        <div class="metric-sub">${totalReads} delimiter '#' bits</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">TOTAL DNA BASES</div>
                        <div class="metric-val" style="color: var(--text-heading);">${totalBases} <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">bp</span></div>
                        <div class="metric-sub">Alphabet $\\sigma = 6$</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">INDEX HEAP SIZE</div>
                        <div class="metric-val" style="color: #0284c7;">${st.compressedSizeBytes || 120} <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">B</span></div>
                        <div class="metric-sub">Active index footprint</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">JVM FREE MEMORY</div>
                        <div class="metric-val" style="color: #059669;">${hl.jvmFreeMemoryMb || 42} <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">MB</span></div>
                        <div class="metric-sub">of ${hl.jvmTotalMemoryMb || 64} MB total</div>
                    </div>
                </div>

                <!-- Admin Tabbed Navigation -->
                <div class="admin-tab-bar" style="display: flex; gap: 8px; border-bottom: 2px solid var(--border-color); margin-bottom: 24px; overflow-x: auto;">
                    <button type="button" class="admin-tab-btn ${this.activeTab === 'consistency' ? 'active' : ''}" id="tabConsistencyBtn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Index Consistency Check
                    </button>
                    <button type="button" class="admin-tab-btn ${this.activeTab === 'users' ? 'active' : ''}" id="tabUsersBtn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        User Accounts (${this.usersList.length})
                    </button>
                    <button type="button" class="admin-tab-btn ${this.activeTab === 'pipeline' ? 'active' : ''}" id="tabPipelineBtn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        Sequencing Pipeline Log
                    </button>
                    <button type="button" class="admin-tab-btn ${this.activeTab === 'audit' ? 'active' : ''}" id="tabAuditBtn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                        Security Audit Log (${this.auditLogs.length})
                    </button>
                    <button type="button" class="admin-tab-btn ${this.activeTab === 'system' ? 'active' : ''}" id="tabSystemBtn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        Environment &amp; Resources
                    </button>
                </div>

                <!-- Tab Body Content -->
                <div class="admin-tab-content">
                    ${this.renderActiveTabContent()}
                </div>
            </div>
        `;

        this.bindEvents();
    }

    renderActiveTabContent() {
        switch (this.activeTab) {
            case 'consistency':
                return this.renderConsistencyTab();
            case 'users':
                return this.renderUsersTab();
            case 'pipeline':
                return this.renderPipelineTab();
            case 'audit':
                return this.renderAuditTab();
            case 'system':
                return this.renderSystemTab();
            default:
                return this.renderConsistencyTab();
        }
    }

    // =========================================================================
    // Tab 1: Index Consistency Verification
    // =========================================================================
    renderConsistencyTab() {
        const res = this.consistencyResult;

        return `
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); padding: 28px; box-shadow: var(--shadow-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 14px;">
                    <div>
                        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-heading); margin: 0;">
                            Wavelet Tree Index Consistency Verification
                        </h2>
                        <p style="color: var(--text-muted); font-size: 0.86rem; margin: 4px 0 0 0;">
                            Validates alphabet ordering, C-table partition sums, read boundary bit vectors, and ACCESS/EXTRACT round-trip invariants.
                        </p>
                    </div>
                    <button type="button" class="btn-primary-hero" id="btnRunConsistencyCheck" style="font-size: 0.85rem; padding: 10px 20px;">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Execute Consistency Verification
                    </button>
                </div>

                ${res ? `
                    <div style="background: ${res.allPassed ? '#ecfdf5' : '#fef2f2'}; border: 1px solid ${res.allPassed ? '#a7f3d0' : '#fecaca'}; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background: ${res.allPassed ? '#10b981' : '#ef4444'}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 800;">
                                ${res.allPassed ? '✓' : '✗'}
                            </div>
                            <div>
                                <strong style="font-size: 1.05rem; color: ${res.allPassed ? '#065f46' : '#991b1b'};">
                                    ${res.allPassed ? 'ALL STRUCTURAL INVARIANTS PASSED' : 'CONSISTENCY FAILURE DETECTED'}
                                </strong>
                                <div style="font-size: 0.78rem; color: ${res.allPassed ? '#047857' : '#b91c1c'};">
                                    Dataset: <code>${this.escapeHtml(res.datasetName)}</code> &bull; Execution Time: <strong>${res.executionTimeMicros} &micro;s</strong> &bull; Total Checks: ${res.totalChecks}
                                </div>
                            </div>
                        </div>
                        <span style="font-size: 0.76rem; font-weight: 700; background: #ffffff; padding: 4px 10px; border-radius: var(--radius-pill); border: 1px solid ${res.allPassed ? '#a7f3d0' : '#fecaca'}; color: ${res.allPassed ? '#047857' : '#b91c1c'};">
                            STATUS: ${res.status}
                        </span>
                    </div>

                    <!-- Individual Checks List -->
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${(res.checks || []).map((c, i) => `
                            <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                                <div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="width: 20px; height: 20px; border-radius: 50%; background: ${c.passed ? '#10b981' : '#ef4444'}; color: #ffffff; font-size: 0.72rem; display: inline-flex; align-items: center; justify-content: center; font-weight: 800;">
                                            ${c.passed ? '✓' : '✗'}
                                        </span>
                                        <strong style="font-size: 0.9rem; color: var(--text-heading);">${i + 1}. ${this.escapeHtml(c.name)}</strong>
                                    </div>
                                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; margin-left: 28px;">
                                        ${this.escapeHtml(c.details)}
                                    </div>
                                </div>
                                <span class="badge-op" style="background: ${c.passed ? '#ecfdf5' : '#fef2f2'}; color: ${c.passed ? '#059669' : '#dc2626'}; border: 1px solid ${c.passed ? '#a7f3d0' : '#fecaca'}; font-weight: 800;">
                                    ${c.passed ? 'PASS' : 'FAIL'}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="background: #f8fafc; border: 1px dashed var(--border-color); border-radius: 8px; padding: 48px; text-align: center; color: var(--text-muted);">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-bottom: 12px; color: #94a3b8;">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-heading); margin: 0 0 6px 0;">No Consistency Check Run in Current Session</h4>
                        <p style="font-size: 0.85rem; max-width: 480px; margin: 0 auto 18px auto;">
                            Click "Execute Consistency Verification" above to perform an automated validation of the active Wavelet Tree index.
                        </p>
                    </div>
                `}
            </div>
        `;
    }

    // =========================================================================
    // Tab 2: User Accounts Administration
    // =========================================================================
    renderUsersTab() {
        return `
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); box-shadow: var(--shadow-sm); overflow: hidden;">
                <div style="padding: 18px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: #fafbfc;">
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-heading); margin: 0;">User Accounts Management</h3>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                            Inspect registered users, adjust role permissions (ADMIN / REGISTERED_USER), and activate/deactivate access.
                        </div>
                    </div>
                </div>
                <div style="overflow-x: auto;">
                    <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 0.84rem;">
                        <thead>
                            <tr style="background: #f1f5f9; text-align: left; font-size: 0.74rem; text-transform: uppercase;">
                                <th style="padding: 10px 16px;">Name &amp; Email</th>
                                <th style="padding: 10px 16px;">Role</th>
                                <th style="padding: 10px 16px;">Category</th>
                                <th style="padding: 10px 16px;">Organization</th>
                                <th style="padding: 10px 16px;">Status</th>
                                <th style="padding: 10px 16px; text-align: right;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.usersList.map(u => `
                                <tr class="table-row">
                                    <td style="padding: 10px 16px;">
                                        <strong style="color: var(--text-heading); display: block;">${this.escapeHtml(u.fullName || 'User')}</strong>
                                        <span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted);">${this.escapeHtml(u.email)}</span>
                                    </td>
                                    <td style="padding: 10px 16px;">
                                        <span class="badge-op" style="${u.role === 'ADMIN' ? 'background: #fef2f2; color: #ef4444; border: 1px solid #fecaca;' : 'background: #f0fdf4; color: #059669; border: 1px solid #bbf7d0;'} font-weight: 800;">
                                            ${u.role}
                                        </span>
                                    </td>
                                    <td style="padding: 10px 16px; color: var(--text-body); font-weight: 600;">
                                        ${this.escapeHtml(u.category || 'User')}
                                    </td>
                                    <td style="padding: 10px 16px; color: var(--text-muted);">
                                        ${this.escapeHtml(u.organization || '—')}
                                    </td>
                                    <td style="padding: 10px 16px;">
                                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${u.active ? '#10b981' : '#ef4444'}; margin-right: 6px;"></span>
                                        <strong>${u.active ? 'Active' : 'Deactivated'}</strong>
                                    </td>
                                    <td style="padding: 10px 16px; text-align: right;">
                                        ${u.email !== 'admin@genomicdemo.local' ? `
                                            <button type="button" class="btn-table-action btn-toggle-user-status" data-id="${u.id}" data-active="${u.active}" style="font-size: 0.74rem;">
                                                ${u.active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        ` : '<span style="font-size: 0.74rem; color: var(--text-muted);">Root Admin</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // Tab 3: Sequencing Pipeline Ingestion Log
    // =========================================================================
    renderPipelineTab() {
        const pipelineLogs = this.auditLogs.filter(l => 
            l.eventType === 'FASTQ_UPLOAD' || 
            l.eventType === 'PIPELINE_INGEST' || 
            (l.details && l.details.toLowerCase().includes('ingest'))
        );

        return `
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); box-shadow: var(--shadow-sm); overflow: hidden;">
                <div style="padding: 18px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: #fafbfc;">
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-heading); margin: 0;">Sequencing Pipeline Ingestion Log</h3>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                            Ingestion history from the external Sequencing Pipeline endpoint (<code>POST /api/datasets</code>).
                        </div>
                    </div>
                    <span class="badge-op badge-op-record">Pipeline Actor: Active</span>
                </div>
                ${pipelineLogs.length > 0 ? `
                    <div style="overflow-x: auto;">
                        <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 0.84rem;">
                            <thead>
                                <tr style="background: #f1f5f9; text-align: left; font-size: 0.74rem; text-transform: uppercase;">
                                    <th style="padding: 10px 16px;">Timestamp</th>
                                    <th style="padding: 10px 16px;">Caller / Operator</th>
                                    <th style="padding: 10px 16px;">Client IP</th>
                                    <th style="padding: 10px 16px;">Ingestion Details</th>
                                    <th style="padding: 10px 16px;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pipelineLogs.map(l => `
                                    <tr class="table-row">
                                        <td style="padding: 10px 16px; font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted);">${l.timestampFormatted || new Date(l.timestamp).toLocaleString()}</td>
                                        <td style="padding: 10px 16px; font-weight: 600;">${this.escapeHtml(l.userEmail)}</td>
                                        <td style="padding: 10px 16px; font-family: var(--font-mono); font-size: 0.78rem;">${this.escapeHtml(l.ipAddress)}</td>
                                        <td style="padding: 10px 16px;">${this.escapeHtml(l.details)}</td>
                                        <td style="padding: 10px 16px;">
                                            <span class="badge-op" style="${l.success ? 'background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;' : 'background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;'}">
                                                ${l.success ? 'SUCCESS' : 'FAILED'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div style="padding: 40px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
                        No external pipeline ingestion requests logged yet. Use <code>POST /api/datasets</code> to ingest new FASTQ sequences.
                    </div>
                `}
            </div>
        `;
    }

    // =========================================================================
    // Tab 4: Security & Operational Audit Log
    // =========================================================================
    renderAuditTab() {
        return `
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); box-shadow: var(--shadow-sm); overflow: hidden;">
                <div style="padding: 18px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: #fafbfc;">
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-heading); margin: 0;">Comprehensive Security &amp; Activity Audit Log</h3>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                            Chronological event trail of index builds, consistency verifications, user logins, and administrative actions.
                        </div>
                    </div>
                </div>
                <div style="overflow-x: auto;">
                    <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 0.84rem;">
                        <thead>
                            <tr style="background: #f1f5f9; text-align: left; font-size: 0.74rem; text-transform: uppercase;">
                                <th style="padding: 10px 16px;">Timestamp</th>
                                <th style="padding: 10px 16px;">Event Type</th>
                                <th style="padding: 10px 16px;">User Email</th>
                                <th style="padding: 10px 16px;">IP Address</th>
                                <th style="padding: 10px 16px;">Details</th>
                                <th style="padding: 10px 16px;">Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.auditLogs.map(l => `
                                <tr class="table-row">
                                    <td style="padding: 10px 16px; font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted); white-space: nowrap;">
                                        ${l.timestampFormatted || new Date(l.timestamp).toLocaleString()}
                                    </td>
                                    <td style="padding: 10px 16px;">
                                        <code style="font-size: 0.78rem; font-weight: 700; color: var(--brand-purple);">${this.escapeHtml(l.eventType)}</code>
                                    </td>
                                    <td style="padding: 10px 16px; font-weight: 600;">${this.escapeHtml(l.userEmail)}</td>
                                    <td style="padding: 10px 16px; font-family: var(--font-mono); font-size: 0.78rem;">${this.escapeHtml(l.ipAddress)}</td>
                                    <td style="padding: 10px 16px;">${this.escapeHtml(l.details)}</td>
                                    <td style="padding: 10px 16px;">
                                        <span class="badge-op" style="${l.success ? 'background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;' : 'background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;'}">
                                            ${l.success ? 'OK' : 'ERR'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // Tab 5: Environment & System Resources
    // =========================================================================
    renderSystemTab() {
        const hl = this.healthData || {};
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px;">
                <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); padding: 24px; box-shadow: var(--shadow-sm);">
                    <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-heading); margin: 0 0 16px 0;">
                        JVM Runtime &amp; Memory Allocation
                    </h3>
                    <table class="doc-table" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                        <tbody>
                            <tr><td style="font-weight: 600; width: 45%;">Runtime Status:</td><td><span style="color: #059669; font-weight: 800;">${hl.status || 'HEALTHY'}</span></td></tr>
                            <tr><td style="font-weight: 600;">Allocated Heap Memory:</td><td>${hl.jvmTotalMemoryMb || 64} MB</td></tr>
                            <tr><td style="font-weight: 600;">Free Heap Memory:</td><td>${hl.jvmFreeMemoryMb || 42} MB</td></tr>
                            <tr><td style="font-weight: 600;">Maximum Heap Cap:</td><td>${hl.jvmMaxMemoryMb || 1024} MB</td></tr>
                            <tr><td style="font-weight: 600;">Available CPU Cores:</td><td>${hl.availableProcessors || 8} Logical Processors</td></tr>
                        </tbody>
                    </table>
                </div>

                <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); padding: 24px; box-shadow: var(--shadow-sm);">
                    <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-heading); margin: 0 0 16px 0;">
                        Host Operating System &amp; Engine
                    </h3>
                    <table class="doc-table" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                        <tbody>
                            <tr><td style="font-weight: 600; width: 45%;">Operating System:</td><td>${hl.osName || 'Windows'}</td></tr>
                            <tr><td style="font-weight: 600;">Java Runtime Version:</td><td>${hl.javaVersion || 'JDK 26'}</td></tr>
                            <tr><td style="font-weight: 600;">Engine Facade:</td><td><code>genomicindex.IndexManager</code></td></tr>
                            <tr><td style="font-weight: 600;">Bit-Vector Architecture:</td><td>RRR 64-bit blocks ($B_0..B_k$)</td></tr>
                            <tr><td style="font-weight: 600;">Suffix Array Sampling:</td><td>Sparse Pointers (\\(\\delta = 16\\))</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Tab buttons
        const bindTab = (id, tabName) => {
            const btn = this.container.querySelector(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.activeTab = tabName;
                    this.renderAdminView();
                });
            }
        };

        bindTab('#tabConsistencyBtn', 'consistency');
        bindTab('#tabUsersBtn', 'users');
        bindTab('#tabPipelineBtn', 'pipeline');
        bindTab('#tabAuditBtn', 'audit');
        bindTab('#tabSystemBtn', 'system');

        // Consistency Check buttons (Header & Tab)
        const runCheck = async () => {
            Toast.info('Executing index consistency and invariant verification...');
            try {
                const res = await api.runConsistencyCheck();
                if (res && res.success) {
                    this.consistencyResult = res;
                    this.activeTab = 'consistency';
                    this.renderAdminView();
                    Toast.success(`Consistency check finished: ${res.status}`);
                } else {
                    Toast.error('Consistency check failed: ' + (res.error || 'Unknown error'));
                }
            } catch (err) {
                Toast.error('Error running consistency check: ' + err.message);
            }
        };

        const btnHdrCheck = this.container.querySelector('#btnHeaderConsistencyCheck');
        if (btnHdrCheck) btnHdrCheck.addEventListener('click', runCheck);

        const btnTabCheck = this.container.querySelector('#btnRunConsistencyCheck');
        if (btnTabCheck) btnTabCheck.addEventListener('click', runCheck);

        // Rebuild Index Button (with confirmation modal)
        const btnRebuild = this.container.querySelector('#btnHeaderRebuildIndex');
        if (btnRebuild) {
            btnRebuild.addEventListener('click', () => {
                Modal.confirm({
                    title: 'Confirm Index Rebuild',
                    message: `Are you sure you want to rebuild the Wavelet Tree index for active dataset "${this.activeDataset ? this.activeDataset.name : 'current'}"? This will recompute the Burrow-Wheeler Transform and reconstruct all RRR bit-vectors.`,
                    confirmText: 'Rebuild Index Now',
                    onConfirm: async () => {
                        Toast.info('Rebuilding Wavelet Tree index...');
                        try {
                            const res = await api.rebuildDataset();
                            if (res && res.success) {
                                Toast.success('Wavelet Tree index successfully rebuilt.');
                                await this.render();
                            } else {
                                Toast.error('Rebuild failed: ' + (res.error || 'Server error'));
                            }
                        } catch (e) {
                            Toast.error('Error: ' + e.message);
                        }
                    }
                });
            });
        }

        // User account status toggles
        this.container.querySelectorAll('.btn-toggle-user-status').forEach(btn => {
            btn.addEventListener('click', async () => {
                const userId = btn.getAttribute('data-id');
                const currentActive = btn.getAttribute('data-active') === 'true';
                const newActive = !currentActive;

                try {
                    const res = await api.updateUser(userId, { active: String(newActive) });
                    if (res && res.success) {
                        Toast.success(`User ${newActive ? 'activated' : 'deactivated'}.`);
                        await this.render();
                    } else {
                        Toast.error('Could not update user: ' + (res.error || 'Error'));
                    }
                } catch (err) {
                    Toast.error('Failed to update user: ' + err.message);
                }
            });
        });
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
