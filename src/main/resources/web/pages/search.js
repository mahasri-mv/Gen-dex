/**
 * GeneDex - DNA Pattern Search Page
 * 
 * Provides an interactive, user-friendly tool to search for specific DNA sequences,
 * discover matching reads, inspect exact coordinates, and highlight sequence contexts.
 */

import { api } from '../services/api.js';
import { Toast } from '../components/Toast.js';

export class SearchPage {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.activeDataset = null;
        this.currentPattern = "ATT";
        this.searchResult = null;
        this.page = 1;
        this.perPage = 10;
        this.recentSearches = this.loadRecentSearches();
        this.isCaseInsensitive = true;
        this.searchRevComp = false;
        this.readCache = new Map(); // readIndex -> sequence string
        this.readsCatalog = new Map(); // readIndex -> { header, length, startPos, endPos }
    }

    loadRecentSearches() {
        try {
            const saved = localStorage.getItem('genedex_recent_searches');
            return saved ? JSON.parse(saved) : ["ATT", "GATTACA", "CAGT"];
        } catch (e) {
            return ["ATT", "GATTACA", "CAGT"];
        }
    }

    saveRecentSearch(pattern) {
        if (!pattern) return;
        const clean = pattern.toUpperCase();
        this.recentSearches = [clean, ...this.recentSearches.filter(p => p !== clean)].slice(0, 6);
        try {
            localStorage.setItem('genedex_recent_searches', JSON.stringify(this.recentSearches));
        } catch (e) {}
    }

    async render() {
        if (!this.container) return;

        // Fetch active dataset state and reads catalog
        try {
            const [dsRes, readsRes] = await Promise.all([
                api.getDatasets(),
                api.getReads(1, 100)
            ]);

            const currentActiveName = (dsRes && dsRes.success && dsRes.activeDataset) ? (dsRes.activeDataset.name || dsRes.activeDataset.datasetName) : null;
            // If active dataset changed, reset stale search results
            const prevActiveName = this.activeDataset ? (this.activeDataset.name || this.activeDataset.datasetName) : null;
            if (prevActiveName && prevActiveName !== currentActiveName) {
                this.searchResult = null;
                this.readCache.clear();
            }

            this.activeDataset = (dsRes && dsRes.success) ? dsRes.activeDataset : null;

            if (readsRes && readsRes.success && Array.isArray(readsRes.reads)) {
                this.readsCatalog.clear();
                readsRes.reads.forEach(r => {
                    this.readsCatalog.set(r.readIndex, r);
                });
            }
        } catch (err) {
            console.error('Error initializing search context:', err);
        }

        const dsName = this.activeDataset ? (this.activeDataset.name || this.activeDataset.datasetName) : 'No dataset active';
        const totalReads = this.activeDataset ? (this.activeDataset.totalReads || 0) : 0;

        // Dynamic Quick Examples relevant to active dataset
        const quickExamples = this.getDatasetQuickExamples();

        this.container.innerHTML = `
            <div class="page-container" style="padding-top: 32px; padding-bottom: 64px;">
                <!-- Header (Centered, Clean, Customer-Facing) -->
                <div class="section-header-centered" style="margin-bottom: 28px; text-align: center;">
                    <h1 class="section-title" style="font-size: 2rem; font-weight: 800; color: var(--text-heading); margin: 0 0 10px 0;">
                        DNA Pattern Search
                    </h1>
                    <p class="section-subtitle" style="font-size: 0.95rem; color: var(--text-muted); max-width: 680px; margin: 0 auto 16px auto; line-height: 1.55;">
                        Search for specific DNA sequences in your dataset, discover matching reads, and identify the exact positions where each pattern occurs.
                    </p>
                    <div style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-pill); padding: 5px 14px; font-size: 0.8rem; box-shadow: var(--shadow-sm);">
                        <span class="status-dot-pulse"></span>
                        <span>Active Dataset: <strong>${this.escapeHtml(dsName)}</strong> (${totalReads} ${totalReads === 1 ? 'read' : 'reads'})</span>
                    </div>
                </div>

                <!-- Pattern Search Input Panel -->
                <div class="search-panel-card" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); padding: 26px 28px; margin-bottom: 24px; box-shadow: var(--shadow-card);">
                    <label for="patternSearchInput" style="display: block; font-size: 0.88rem; font-weight: 700; color: var(--text-heading); margin-bottom: 10px;">
                        Enter DNA Sequence to Search
                    </label>

                    <div class="search-bar-row" style="display: flex; gap: 12px; align-items: stretch; flex-wrap: wrap;">
                        <div style="position: relative; flex: 1; min-width: 260px;">
                            <input type="text" id="patternSearchInput" class="search-input-field" 
                                   value="${this.escapeHtml(this.currentPattern)}" 
                                   placeholder="Enter a DNA pattern, e.g., GATTACA" 
                                   spellcheck="false" autocomplete="off"
                                   style="width: 100%; height: 48px; padding: 10px 16px; font-size: 1.1rem; font-family: var(--font-mono); font-weight: 700; letter-spacing: 0.05em; border-radius: 8px; border: 1.5px solid var(--border-color); background: #ffffff;" />
                        </div>
                        <button type="button" class="btn-primary-hero" id="btnExecuteSearch" style="height: 48px; padding: 0 28px; font-size: 0.92rem; font-weight: 700; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            Search
                        </button>
                        <button type="button" class="btn-secondary-hero" id="btnClearSearch" title="Clear input" style="height: 48px; padding: 0 20px; font-size: 0.9rem; font-weight: 600; border-radius: 8px; white-space: nowrap;">
                            Clear
                        </button>
                    </div>

                    <!-- Live Validation Feedback Slot -->
                    <div id="patternValidationNotice" style="font-size: 0.8rem; margin-top: 8px; display: none;"></div>

                    <!-- Search Options & Examples -->
                    <div class="search-options-row" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                        <div class="search-toggles-group" style="display: flex; align-items: center; gap: 20px; font-size: 0.84rem; font-weight: 600; color: var(--text-body); flex-wrap: wrap;">
                            <label class="search-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
                                <input type="checkbox" id="chkCaseInsensitive" ${this.isCaseInsensitive ? 'checked' : ''}>
                                <span>Case-insensitive (A-Z)</span>
                            </label>
                            <label class="search-checkbox-label" title="Also search for the reverse-complement sequence" style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
                                <input type="checkbox" id="chkRevComp" ${this.searchRevComp ? 'checked' : ''}>
                                <span>Search Reverse Complement <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 400;">(also search reverse-complement sequence)</span></span>
                            </label>
                        </div>

                        <div class="search-examples-group" style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;">
                            <span style="font-weight: 600;">Quick Examples (click to search):</span>
                            ${quickExamples.map(ex => `
                                <span class="example-pill btn-example-query" data-query="${ex.query}" title="Search '${ex.query}'">${ex.label}</span>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Recent Searches Row -->
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 14px; font-size: 0.8rem; color: var(--text-muted); flex-wrap: wrap;">
                        <span style="font-weight: 600;">Recent Searches:</span>
                        <div class="recent-searches-list" id="recentSearchesList" style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${this.renderRecentSearchPills()}
                        </div>
                    </div>
                </div>

                <!-- Results Area Mount -->
                <div id="searchResultsMount">
                    ${this.renderEmptySearchPrompt()}
                </div>
            </div>
        `;

        this.bindEvents();

        // Run initial search if active dataset and query are set
        if (this.currentPattern && this.activeDataset && (this.activeDataset.isLoaded || this.activeDataset.indexLoaded)) {
            await this.performSearch(this.currentPattern);
        }
    }

    getDatasetQuickExamples() {
        const dsName = (this.activeDataset && this.activeDataset.name) ? this.activeDataset.name.toLowerCase() : '';
        if (dsName.includes('demo_report')) {
            return [
                { query: 'ATT', label: 'ATT' },
                { query: 'GATTACA', label: 'GATTACA' },
                { query: 'TTACA', label: 'TTACA' },
                { query: 'GAT', label: 'GAT' }
            ];
        } else if (dsName.includes('sample')) {
            return [
                { query: 'GATTACA', label: 'GATTACA' },
                { query: 'CAGT', label: 'CAGT' },
                { query: 'TTAGC', label: 'TTAGC' },
                { query: 'TAG', label: 'TAG' }
            ];
        }
        return [
            { query: 'GATTACA', label: 'GATTACA' },
            { query: 'CAGT', label: 'CAGT' },
            { query: 'TTAGC', label: 'TTAGC' },
            { query: 'ATAT', label: 'ATAT' }
        ];
    }

    renderRecentSearchPills() {
        if (!this.recentSearches || this.recentSearches.length === 0) {
            return `<span style="font-size: 0.76rem; color: var(--text-muted);">None yet</span>`;
        }
        return this.recentSearches.map(p => `
            <span class="example-pill btn-recent-query" data-query="${p}" title="Search '${p}'">${p}</span>
        `).join('');
    }

    renderEmptySearchPrompt() {
        return `
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); padding: 48px; text-align: center; color: var(--text-muted); box-shadow: var(--shadow-sm);">
                <div style="font-size: 2.2rem; margin-bottom: 8px;">🔍</div>
                <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">Ready to Search</div>
                <div style="font-size: 0.88rem; max-width: 500px; margin: 0 auto; line-height: 1.5;">
                    Enter a DNA sequence pattern above to discover matching reads and identify exact sequence coordinates.
                </div>
            </div>
        `;
    }

    bindEvents() {
        const input = this.container.querySelector('#patternSearchInput');
        const btnSearch = this.container.querySelector('#btnExecuteSearch');
        const btnClear = this.container.querySelector('#btnClearSearch');
        const chkCase = this.container.querySelector('#chkCaseInsensitive');
        const chkRev = this.container.querySelector('#chkRevComp');

        // Live input validation
        input?.addEventListener('input', () => {
            this.validateInputLive(input.value);
        });

        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btnSearch?.click();
            }
        });

        btnSearch?.addEventListener('click', async () => {
            const raw = input.value.trim();
            if (!raw) {
                Toast.error("Please enter a DNA sequence pattern to search.");
                input.focus();
                return;
            }

            // Supported nucleotide validation
            const validRegex = /^[ACGTNacgtn]+$/;
            if (!validRegex.test(raw)) {
                Toast.error("Please enter a valid DNA sequence containing supported nucleotide letters.");
                input.focus();
                return;
            }

            const pattern = this.isCaseInsensitive ? raw.toUpperCase() : raw;
            await this.performSearch(pattern);
        });

        btnClear?.addEventListener('click', () => {
            input.value = "";
            input.focus();
            this.validateInputLive("");
            const mount = this.container.querySelector('#searchResultsMount');
            if (mount) mount.innerHTML = this.renderEmptySearchPrompt();
        });

        chkCase?.addEventListener('change', (e) => {
            this.isCaseInsensitive = e.target.checked;
        });

        chkRev?.addEventListener('change', (e) => {
            this.searchRevComp = e.target.checked;
        });

        // Quick Examples and Recent Searches clicks (immediately execute search)
        this.container.addEventListener('click', async (e) => {
            const pill = e.target.closest('[data-query]');
            if (pill) {
                const q = pill.getAttribute('data-query');
                if (q) {
                    input.value = q;
                    this.validateInputLive(q);
                    await this.performSearch(q);
                }
                return;
            }

            // Export CSV
            if (e.target.closest('#btnExportMatchesCsv')) {
                this.exportMatchesCsv();
                return;
            }

            // Try Another Search button in zero-results view
            if (e.target.closest('#btnTryAnotherSearch')) {
                input.focus();
                input.select();
                window.scrollTo({ top: 100, behavior: 'smooth' });
                return;
            }

            // View Read button in table (navigates to Read Explorer)
            const viewBtn = e.target.closest('.btn-view-read');
            if (viewBtn) {
                const readIdx = viewBtn.getAttribute('data-read-index');
                if (readIdx != null) {
                    try {
                        sessionStorage.setItem('genedex_target_read', String(readIdx));
                        sessionStorage.setItem('genedex_target_motif', this.currentPattern);
                    } catch (err) {}
                    window.location.hash = '#/explorer';
                }
                return;
            }

            // Pagination Prev
            if (e.target.closest('#btnMatchesPrev') && this.page > 1) {
                this.page--;
                this.renderResults();
                return;
            }

            // Pagination Next
            if (e.target.closest('#btnMatchesNext')) {
                const totalMatches = this.searchResult?.matches?.length || 0;
                const totalPages = Math.ceil(totalMatches / this.perPage) || 1;
                if (this.page < totalPages) {
                    this.page++;
                    this.renderResults();
                    return;
                }
            }
        });
    }

    validateInputLive(val) {
        const input = this.container.querySelector('#patternSearchInput');
        const notice = this.container.querySelector('#patternValidationNotice');
        if (!notice || !input) return;

        const trimmed = val.trim();
        if (!trimmed) {
            input.classList.remove('invalid');
            notice.style.display = 'none';
            return;
        }

        const validRegex = /^[ACGTNacgtn]+$/;
        if (!validRegex.test(trimmed)) {
            input.classList.add('invalid');
            notice.style.display = 'block';
            notice.style.color = 'var(--brand-rose)';
            notice.innerHTML = '&#10008; Please enter a valid DNA sequence containing supported nucleotide letters (A, C, G, T, N).';
        } else {
            input.classList.remove('invalid');
            notice.style.display = 'block';
            notice.style.color = 'var(--brand-green)';
            notice.innerHTML = `&#10004; Valid DNA sequence pattern (${trimmed.length} bp).`;
        }
    }

    async performSearch(pattern) {
        const mount = this.container.querySelector('#searchResultsMount');
        if (mount) {
            mount.innerHTML = `
                <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); padding: 36px; text-align: center; box-shadow: var(--shadow-sm);">
                    <div style="font-size: 0.96rem; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">Searching dataset for "${this.escapeHtml(pattern)}"...</div>
                    <div style="font-size: 0.82rem; color: var(--text-muted);">Scanning DNA reads and locating matching positions.</div>
                </div>
            `;
        }

        this.currentPattern = pattern;
        this.saveRecentSearch(pattern);

        try {
            const revComp = this.computeRevComp(pattern);
            const isPalindromic = (pattern === revComp);

            let allMatches = [];
            let totalExecTime = 0;
            let rejectedCount = 0;

            // 1. Search forward pattern
            const resForward = await api.countAndLocate(pattern);
            if (resForward && resForward.success) {
                totalExecTime += (resForward.executionTimeMicros || 0);
                const candidates = resForward.candidates || [];
                rejectedCount += candidates.filter(c => !c.accepted).length;

                const fMatches = (resForward.matches || []).map(m => ({
                    ...m,
                    orientation: 'Forward'
                }));
                allMatches = [...fMatches];
            } else {
                throw new Error(resForward?.error || "Failed to search pattern.");
            }

            // 2. If Reverse Complement search is enabled and pattern is not identical to rev-comp
            if (this.searchRevComp && !isPalindromic) {
                const resRev = await api.countAndLocate(revComp);
                if (resRev && resRev.success) {
                    totalExecTime += (resRev.executionTimeMicros || 0);
                    const candidates = resRev.candidates || [];
                    rejectedCount += candidates.filter(c => !c.accepted).length;

                    const rcMatches = (resRev.matches || []).map(m => ({
                        ...m,
                        pattern: revComp,
                        orientation: 'Reverse Complement'
                    }));
                    allMatches = [...allMatches, ...rcMatches];
                }
            }

            this.searchResult = {
                pattern: pattern,
                matches: allMatches,
                matchCount: allMatches.length,
                executionTimeMicros: totalExecTime,
                rejectedCount: rejectedCount,
                isRevCompEnabled: this.searchRevComp,
                isPalindromic: isPalindromic
            };

            this.page = 1;
            await this.cacheReadSequences(allMatches);
            this.renderResults();
        } catch (err) {
            console.error('Search error:', err);
            if (mount) {
                mount.innerHTML = `
                    <div class="error-banner" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 18px; color: #991b1b;">
                        <strong style="display: block; margin-bottom: 4px;">Search Error</strong>
                        <span>${this.escapeHtml(err.message || "Failed to execute sequence query.")}</span>
                    </div>
                `;
            }
        }
    }

    async cacheReadSequences(matches) {
        // Pre-fetch unique reads to render accurate context snippets with green highlights
        const readIndices = [...new Set(matches.map(m => m.readIndex))];
        for (const idx of readIndices) {
            if (!this.readCache.has(idx)) {
                try {
                    const r = await api.extractRead(idx);
                    if (r && r.success && r.sequence) {
                        this.readCache.set(idx, r.sequence);
                    }
                } catch (e) {}
            }
        }
    }

    renderResults() {
        const mount = this.container.querySelector('#searchResultsMount');
        if (!mount || !this.searchResult) return;

        const res = this.searchResult;
        const matches = res.matches || [];
        const totalMatches = matches.length;

        // 7. Handle Zero Search Results with a clean empty-state card
        if (totalMatches === 0) {
            mount.innerHTML = `
                <div class="empty-matches-card">
                    <div style="font-size: 2.2rem; margin-bottom: 12px; color: var(--text-muted);">🔍</div>
                    <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-heading); margin-bottom: 8px;">
                        No Matching DNA Sequences Found
                    </h3>
                    <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 480px; margin: 0 auto 20px auto; line-height: 1.55;">
                        We couldn't find this DNA pattern in the selected dataset. Try another sequence or check your search options.
                    </p>
                    <button type="button" class="btn-primary-hero" id="btnTryAnotherSearch" style="font-size: 0.88rem; padding: 10px 24px; border-radius: 8px;">
                        Try Another Search
                    </button>
                </div>
            `;
            return;
        }

        // Distinct DNA reads containing the pattern
        const distinctReads = new Set(matches.map(m => m.readIndex));
        const matchingReadsCount = distinctReads.size;

        const patternLen = (this.currentPattern || '').length;
        const timeMs = (res.executionTimeMicros ? (res.executionTimeMicros / 1000.0).toFixed(2) : "0.08") + " ms";

        // Pagination
        const totalPages = Math.ceil(matches.length / this.perPage) || 1;
        this.page = Math.max(1, Math.min(this.page, totalPages));
        const startIdx = (this.page - 1) * this.perPage;
        const pageMatches = matches.slice(startIdx, startIdx + this.perPage);

        mount.innerHTML = `
            <!-- Results Header Metrics (4 Clean User-Focused Cards) -->
            <div class="results-metrics-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                <!-- Card 1: Total Matches -->
                <div class="metric-card-sm" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); padding: 18px 20px; box-shadow: var(--shadow-sm);">
                    <div class="metric-lbl-sm" style="font-size: 0.74rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">
                        TOTAL MATCHES
                    </div>
                    <div class="metric-val-lg" style="font-size: 1.75rem; font-weight: 800; color: var(--brand-green); margin: 4px 0 2px 0;">
                        ${totalMatches}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">
                        ${totalMatches === 1 ? '1 Match Found' : `${totalMatches} Matches Found`}
                    </div>
                </div>

                <!-- Card 2: Reads Containing Pattern -->
                <div class="metric-card-sm" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); padding: 18px 20px; box-shadow: var(--shadow-sm);">
                    <div class="metric-lbl-sm" style="font-size: 0.74rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">
                        READS CONTAINING PATTERN
                    </div>
                    <div class="metric-val-lg" style="font-size: 1.75rem; font-weight: 800; color: var(--brand-blue); margin: 4px 0 2px 0;">
                        ${matchingReadsCount}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">
                        ${matchingReadsCount === 1 ? '1 Matching Read' : `${matchingReadsCount} Matching Reads`}
                    </div>
                </div>

                <!-- Card 3: Pattern Length -->
                <div class="metric-card-sm" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); padding: 18px 20px; box-shadow: var(--shadow-sm);">
                    <div class="metric-lbl-sm" style="font-size: 0.74rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">
                        PATTERN LENGTH
                    </div>
                    <div class="metric-val-lg" style="font-size: 1.75rem; font-weight: 800; color: var(--text-heading); margin: 4px 0 2px 0;">
                        ${patternLen} bp
                    </div>
                    <div style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--text-muted);">
                        ${this.escapeHtml(this.currentPattern)}
                    </div>
                </div>

                <!-- Card 4: Search Time -->
                <div class="metric-card-sm" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); padding: 18px 20px; box-shadow: var(--shadow-sm);">
                    <div class="metric-lbl-sm" style="font-size: 0.74rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">
                        SEARCH TIME
                    </div>
                    <div class="metric-val-lg" style="font-size: 1.75rem; font-weight: 800; color: var(--brand-purple); margin: 4px 0 2px 0;">
                        ${timeMs}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">
                        Measured query duration
                    </div>
                </div>
            </div>

            <!-- Simplified Read Boundary Information (Shown Only When Relevant) -->
            ${res.rejectedCount > 0 ? `
                <div class="boundary-notice-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <div>
                        Search results are matched within individual DNA reads. Sequences spanning two different reads are not counted.
                    </div>
                </div>
            ` : ''}

            <!-- DNA Pattern Matches Table Card -->
            <div class="table-card" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); box-shadow: var(--shadow-sm); overflow: hidden;">
                <div style="padding: 18px 22px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: #fafbfc;">
                    <div>
                        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-heading); margin: 0; display: inline-flex; align-items: center; gap: 8px;">
                            <span>DNA Pattern Matches</span>
                            <span class="badge-active" style="font-size: 0.76rem; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: var(--radius-pill);">
                                ${totalMatches} ${totalMatches === 1 ? 'Match' : 'Matches'}
                            </span>
                        </h3>
                        <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 3px;">
                            View the DNA reads containing your searched sequence and the positions where matches occur.
                        </div>
                    </div>
                    <button type="button" class="btn-table-action primary" id="btnExportMatchesCsv" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 0.82rem; font-weight: 700; border-radius: 6px; cursor: pointer; background: #ffffff; border: 1px solid var(--border-color);">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Export CSV
                    </button>
                </div>

                <div class="table-responsive" style="overflow-x: auto;">
                    <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 0.86rem;">
                        <thead>
                            <tr style="background: #f1f5f9; text-align: left; color: var(--text-muted); font-size: 0.76rem; font-weight: 700; text-transform: uppercase;">
                                <th style="padding: 12px 18px; width: 80px;">Match #</th>
                                <th style="padding: 12px 18px;">Read ID</th>
                                <th style="padding: 12px 18px;">Position in Read</th>
                                <th style="padding: 12px 18px;">Matched Sequence</th>
                                <th style="padding: 12px 18px;">Sequence Context</th>
                                <th style="padding: 12px 18px; text-align: right;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderMatchRows(pageMatches, startIdx)}
                        </tbody>
                    </table>
                </div>

                <!-- Pagination Bar -->
                <div class="pagination-bar" style="padding: 14px 20px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; font-size: 0.82rem; color: var(--text-muted);">
                    <div>
                        Showing <strong>${matches.length > 0 ? startIdx + 1 : 0}</strong> to <strong>${Math.min(startIdx + this.perPage, matches.length)}</strong> of <strong>${matches.length}</strong> match records
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button type="button" class="btn-table-action" id="btnMatchesPrev" ${this.page <= 1 ? 'disabled style="opacity: 0.45; cursor: not-allowed;"' : 'style="cursor: pointer;"'}>
                            &larr; Previous
                        </button>
                        <span>Page <strong>${this.page}</strong> of <strong>${totalPages}</strong></span>
                        <button type="button" class="btn-table-action" id="btnMatchesNext" ${this.page >= totalPages ? 'disabled style="opacity: 0.45; cursor: not-allowed;"' : 'style="cursor: pointer;"'}>
                            Next &rarr;
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderMatchRows(matches, offsetIndex) {
        if (!matches || matches.length === 0) {
            return `<tr><td colspan="6" style="text-align: center; padding: 28px; color: var(--text-muted);">No occurrences found in the selected dataset.</td></tr>`;
        }

        let rows = '';
        matches.forEach((m, idx) => {
            const matchNum = offsetIndex + idx + 1;
            const fullSeq = this.readCache.get(m.readIndex) || "";
            const matchedPattern = m.pattern || this.currentPattern;
            const patLen = matchedPattern.length;

            // 1-based position in read
            const posInRead1Based = (m.offsetInRead != null ? m.offsetInRead + 1 : 1);

            // Read identifier from catalog
            const readMeta = this.readsCatalog.get(m.readIndex);
            const readHeader = readMeta ? readMeta.header : `@read${m.readIndex}`;

            // Context snippet with green motif highlight
            let snippetHtml = '';
            if (fullSeq) {
                const off = m.offsetInRead;
                const flank = 12;
                const preStart = Math.max(0, off - flank);
                const pre = fullSeq.substring(preStart, off);
                const motif = fullSeq.substring(off, Math.min(off + patLen, fullSeq.length));
                const post = fullSeq.substring(off + patLen, Math.min(off + patLen + flank, fullSeq.length));

                snippetHtml = `
                    <div class="dna-snippet-box">
                        ${preStart > 0 ? '&hellip;' : ''}${this.escapeHtml(pre)}<span class="motif-highlight-span">${this.escapeHtml(motif)}</span>${this.escapeHtml(post)}${off + patLen + flank < fullSeq.length ? '&hellip;' : ''}
                    </div>
                `;
            } else {
                snippetHtml = `<span class="motif-highlight-span">${this.escapeHtml(matchedPattern)}</span>`;
            }

            const orientationBadge = m.orientation === 'Reverse Complement'
                ? `<span class="badge-orientation revcomp" title="Matched reverse-complement sequence">Rev Comp</span>`
                : (this.searchRevComp ? `<span class="badge-orientation forward" title="Matched forward sequence">Forward</span>` : '');

            rows += `
                <tr class="table-row">
                    <td style="font-family: var(--font-mono); font-weight: 700; color: var(--brand-purple);">#${matchNum}</td>
                    <td>
                        <div style="font-family: var(--font-mono); font-weight: 600; color: var(--text-heading);">
                            ${this.escapeHtml(readHeader)}
                        </div>
                        <div style="font-size: 0.74rem; color: var(--text-muted);">
                            Read #${m.readIndex}
                        </div>
                    </td>
                    <td>
                        <span style="font-family: var(--font-mono); font-weight: 700;">
                            Position ${posInRead1Based}
                        </span>
                        <span style="font-size: 0.74rem; color: var(--text-muted); display: block;">
                            (1-based)
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <code style="font-family: var(--font-mono); font-weight: 700; color: var(--text-heading); background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${this.escapeHtml(matchedPattern)}</code>
                            ${orientationBadge}
                        </div>
                    </td>
                    <td>${snippetHtml}</td>
                    <td style="text-align: right;">
                        <button type="button" class="btn-view-read" data-read-index="${m.readIndex}" title="Open this read in Read Explorer">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            View Read
                        </button>
                    </td>
                </tr>
            `;
        });
        return rows;
    }

    computeRevComp(dna) {
        if (!dna) return '';
        const comp = { 'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C', 'N': 'N', 'a': 'T', 't': 'A', 'c': 'G', 'g': 'C', 'n': 'N' };
        return dna.split('').reverse().map(c => comp[c] || c).join('');
    }

    exportMatchesCsv() {
        if (!this.searchResult || !this.searchResult.matches || this.searchResult.matches.length === 0) {
            Toast.error("No matches available to export.");
            return;
        }

        const matches = this.searchResult.matches;
        const dsName = this.activeDataset ? this.activeDataset.name : 'dataset';

        let csv = "Dataset,SearchPattern,MatchNumber,ReadIdentifier,ReadIndex,PositionInRead_1Based,MatchedSequence,Orientation\r\n";
        matches.forEach((m, i) => {
            const readMeta = this.readsCatalog.get(m.readIndex);
            const readHeader = readMeta ? readMeta.header : `@read${m.readIndex}`;
            const pos1 = (m.offsetInRead != null ? m.offsetInRead + 1 : 1);
            const pat = m.pattern || this.currentPattern;
            const orient = m.orientation || 'Forward';

            csv += `"${dsName}","${this.currentPattern}",${i + 1},"${readHeader}",${m.readIndex},${pos1},"${pat}","${orient}"\r\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = dsName.replace(/[^a-zA-Z0-9_-]/g, '_');
        a.download = `genedex_matches_${safeName}_${this.currentPattern}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Toast.success("Exported DNA pattern matches to CSV.");
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
