/**
 * GeneDex - Read Explorer & Sequence Inspector Page
 * 
 * Provides interactive exploration of individual DNA sequencing reads,
 * nucleotide sequences, Phred quality profiles, and complete FASTQ records.
 * 
 * Features:
 * - Read selection by ID or index, with stepper (Prev / Next) navigation
 * - Telemetry metric cards (identifier, sequence length, dataset position range, GC content, Phred quality)
 * - Bases View with nucleotide ribbon track, position ruler, motif highlighter, and composition
 * - Full 4-Line FASTQ Record view with per-base Phred quality score distribution
 * - Sequence orientation toggle (5' → 3' Forward Strand vs 3' → 5' Reverse Complement)
 * - Copy Bases and Copy FASTQ record to clipboard
 * - Dataset Reads Catalog table with filtering, pagination, and CSV export
 */

import { api } from '../services/api.js';
import { Toast } from '../components/Toast.js';

export class ReadExplorerPage {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.activeDataset = null;
        this.totalReads = 0;
        this.currentReadIndex = 0;
        this.currentReadData = null;
        this.activeTab = 'bases'; // 'bases' | 'fastq'
        this.motifQuery = '';
        this.isReverseComplement = false;

        // Table Pagination State
        this.tablePage = 1;
        this.tablePageSize = 10;
        this.tableTotalPages = 1;
        this.tableSearchFilter = '';
        this.readsTableData = [];
    }

    async render() {
        if (!this.container) return;

        // Fetch active dataset state
        const dsRes = await api.getDatasets();
        this.activeDataset = (dsRes && dsRes.success) ? dsRes.activeDataset : null;
        this.totalReads = this.activeDataset ? (this.activeDataset.totalReads || 0) : 0;

        if (!this.activeDataset || (!this.activeDataset.isLoaded && !this.activeDataset.indexLoaded) || this.totalReads === 0) {
            this.renderEmptyState();
            return;
        }

        // Check if a target read or motif was requested from Pattern Search
        let targetIndex = this.currentReadIndex;
        if (targetIndex >= this.totalReads || targetIndex < 0) {
            targetIndex = 0;
        }
        try {
            const stored = sessionStorage.getItem('genedex_target_read');
            if (stored !== null) {
                const parsed = parseInt(stored, 10);
                if (!isNaN(parsed) && parsed >= 0 && parsed < this.totalReads) {
                    targetIndex = parsed;
                }
                sessionStorage.removeItem('genedex_target_read');
            }
            const storedMotif = sessionStorage.getItem('genedex_target_motif');
            if (storedMotif) {
                this.motifQuery = storedMotif;
                sessionStorage.removeItem('genedex_target_motif');
            }
        } catch (e) {}

        // Load targeted or default read
        await this.loadRead(targetIndex);
        await this.loadTableData();
    }

    renderEmptyState() {
        this.container.innerHTML = `
            <div class="page-container" style="padding-top: 48px; padding-bottom: 64px;">
                <div class="empty-state-box">
                    <div class="empty-state-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>
                    <h2 class="empty-state-title">No Genomic Dataset Loaded</h2>
                    <p class="empty-state-desc">
                        To explore reads, inspect nucleotide sequences, review sequencing quality,
                        and access complete FASTQ records, please load or upload a FASTQ dataset.
                    </p>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <button type="button" class="btn-primary-hero" id="btnLoadDemoInEmpty" style="font-size: 0.88rem; padding: 10px 22px;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            Load Built-In Demo (GATTACAGATTACA)
                        </button>
                        <a href="#/upload" class="btn-secondary-hero" style="font-size: 0.88rem; padding: 10px 22px;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            Go to Upload Dataset
                        </a>
                    </div>
                </div>
            </div>
        `;

        const btnLoad = this.container.querySelector('#btnLoadDemoInEmpty');
        if (btnLoad) {
            btnLoad.addEventListener('click', async () => {
                btnLoad.disabled = true;
                btnLoad.textContent = 'Loading Demo...';
                await api.setActiveDataset('demo_report');
                Toast.success('Loaded built-in report demo dataset: GATTACAGATTACA');
                await this.render();
            });
        }
    }

    async loadRead(indexOrQuery) {
        try {
            const res = await api.getReadStatistics(indexOrQuery);
            if (res && res.success && res.read) {
                this.currentReadData = res.read;
                this.currentReadIndex = res.read.readIndex;
                this.renderReadView();
            } else {
                Toast.error(`Read "${indexOrQuery}" could not be found. Please enter a valid read ID (e.g. @read0) or index (0 to ${Math.max(0, this.totalReads - 1)}).`);
            }
        } catch (err) {
            console.error('Error loading read:', err);
            Toast.error(`Read "${indexOrQuery}" could not be found. Please check the identifier and try again.`);
        }
    }

    async loadTableData() {
        try {
            const res = await api.getReads(this.tablePage, this.tablePageSize);
            if (res && res.success) {
                this.readsTableData = res.reads || [];
                this.tableTotalPages = res.totalPages || 1;
                this.renderTableOnly();
            }
        } catch (err) {
            console.error('Error loading table data:', err);
        }
    }

    renderReadView() {
        if (!this.currentReadData) return;

        const read = this.currentReadData;
        const totalReads = this.totalReads;
        const hasPrev = this.currentReadIndex > 0;
        const hasNext = this.currentReadIndex < (totalReads - 1);

        // Sequence handling (Original vs Reverse Complement)
        const rawSeq = read.sequence || '';
        const rawQual = read.quality || '';
        const rawPhreds = read.phredScores || [];

        let displaySeq = rawSeq;
        let displayQual = rawQual;
        let displayPhreds = [...rawPhreds];

        if (this.isReverseComplement) {
            displaySeq = this.computeReverseComplement(rawSeq);
            displayQual = rawQual.split('').reverse().join('');
            displayPhreds = [...rawPhreds].reverse();
        }

        // Find motif highlight matches
        const motifMatches = this.findMotifMatches(displaySeq, this.motifQuery);

        this.container.innerHTML = `
            <div class="page-container" style="padding-top: 32px; padding-bottom: 64px;">
                <!-- Header Strip -->
                <div class="page-header" style="margin-bottom: 24px;">
                    <div class="breadcrumb" style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px;">
                        <a href="#/home" style="color: var(--text-muted); text-decoration: none;">Home</a> /
                        <span style="color: var(--brand-teal); font-weight: 600;">Read Explorer</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
                        <div>
                            <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--text-heading); margin: 0; line-height: 1.25;">
                                Read Explorer &amp; Sequence Inspector
                            </h1>
                            <p style="color: var(--text-muted); font-size: 0.92rem; margin: 6px 0 0 0;">
                                Explore individual DNA reads, inspect nucleotide sequences, review sequencing quality, and access complete FASTQ records from your selected dataset.
                            </p>
                        </div>
                        <div class="active-ds-indicator" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-pill); padding: 6px 14px; font-size: 0.8rem; display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow-sm);">
                            <span class="status-dot-pulse"></span>
                            <span>Active Dataset: <strong>${this.escapeHtml(this.activeDataset.name || this.activeDataset.datasetName || 'Active Dataset')}</strong> (${totalReads} ${totalReads === 1 ? 'read' : 'reads'})</span>
                        </div>
                    </div>
                </div>

                <!-- Read Lookup & Stepper Toolbar -->
                <div class="explorer-toolbar">
                    <!-- Improved Lookup input form -->
                    <form id="readLookupForm" class="read-lookup-form">
                        <div class="read-search-input-wrap">
                            <input type="text" id="readSearchInput" class="read-search-input" 
                                   placeholder="Enter read ID or FASTQ header (e.g. @read0 or 0)" 
                                   value="${this.escapeHtml(read.header || '@read' + read.readIndex)}" />
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">
                                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                        <button type="submit" class="read-lookup-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            Lookup
                        </button>
                    </form>

                    <!-- Stepper navigation -->
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button type="button" class="btn-stepper" id="btnPrevRead" ${hasPrev ? '' : 'disabled'} title="Previous Read">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            Prev Read
                        </button>
                        <div class="read-position-badge" style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-pill); padding: 8px 16px; font-size: 0.84rem; font-weight: 700; color: var(--text-heading); white-space: nowrap;">
                            Read #${read.readIndex} &bull; ${read.readIndex + 1} of ${totalReads}
                        </div>
                        <button type="button" class="btn-stepper" id="btnNextRead" ${hasNext ? '' : 'disabled'} title="Next Read">
                            Next Read
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>

                <!-- Read Telemetry Metric Cards -->
                <div class="read-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 24px;">
                    <div class="metric-card">
                        <div class="metric-label">READ IDENTIFIER</div>
                        <div class="metric-val" style="font-size: 1.15rem; font-family: var(--font-mono); color: var(--brand-teal); word-break: break-all;">
                            ${this.escapeHtml(read.header)}
                        </div>
                        <div class="metric-sub">Index: <code>#${read.readIndex}</code> of ${totalReads}</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">SEQUENCE LENGTH</div>
                        <div class="metric-val" style="color: var(--text-heading);">${read.length} <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">bp</span></div>
                        <div class="metric-sub">Length of the selected DNA sequence</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">POSITION RANGE</div>
                        <div class="metric-val" style="font-family: var(--font-mono); font-size: 1.05rem; color: #4338ca;">
                            [${read.startPos}, ${read.endPos})
                        </div>
                        <div class="metric-sub">Position within the selected dataset</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">GC CONTENT</div>
                        <div class="metric-val" style="color: ${read.gcPercentage >= 50 ? '#059669' : '#d97706'};">
                            ${read.gcPercentage}%
                        </div>
                        <div class="metric-sub">
                            ${(read.baseCounts ? (read.baseCounts.G || 0) + (read.baseCounts.C || 0) : 0)} of ${read.length} bases (G + C)
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">AVG PHRED QUALITY</div>
                        <div class="metric-val" style="color: ${read.avgPhredScore >= 30 ? '#059669' : '#0284c7'};">
                            ${read.avgPhredScore != null && read.avgPhredScore > 0 ? 'Q' + read.avgPhredScore : 'N/A'}
                        </div>
                        <div class="metric-sub">
                            ${read.avgPhredScore >= 30 ? '≥ 99.9% base accuracy (High)' : (read.avgPhredScore > 0 ? 'Phred+33 quality score' : 'Quality data not available')}
                        </div>
                    </div>
                </div>

                <!-- Interactive Viewer Card -->
                <div class="viewer-main-card" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); box-shadow: var(--shadow-card); overflow: hidden; margin-bottom: 32px;">
                    <!-- Card Toolbar: Tabs + Interactive Controls -->
                    <div class="viewer-toolbar" style="padding: 14px 20px; background: #fafbfc; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
                        <!-- Tab Switcher -->
                        <div class="tab-pills-group" style="display: flex; gap: 6px; background: #e2e8f0; padding: 4px; border-radius: var(--radius-pill);">
                            <button type="button" class="tab-pill ${this.activeTab === 'bases' ? 'active' : ''}" id="tabBasesBtn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
                                Bases View
                            </button>
                            <button type="button" class="tab-pill ${this.activeTab === 'fastq' ? 'active' : ''}" id="tabFastqBtn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                                Full FASTQ Record
                            </button>
                        </div>

                        <!-- Interactive Sequence Controls -->
                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                            <!-- Motif highlighter -->
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <label for="motifHighlightInput" style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                                    Motif Highlight:
                                </label>
                                <input type="text" id="motifHighlightInput" class="form-input" 
                                       placeholder="e.g. ATT or GAT" 
                                       value="${this.escapeHtml(this.motifQuery)}"
                                       maxlength="30"
                                       style="width: 130px; font-family: var(--font-mono); font-size: 0.8rem; padding: 5px 8px; text-transform: uppercase; border-radius: 6px;" />
                                ${this.motifQuery ? `<span class="motif-count-badge">${motifMatches.length} match${motifMatches.length === 1 ? '' : 'es'}</span>` : ''}
                            </div>

                            <!-- Reverse complement toggle -->
                            <button type="button" class="btn-secondary-action ${this.isReverseComplement ? 'active-revcomp' : ''}" id="btnToggleRevComp" title="Toggle Sequence Orientation">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                                ${this.isReverseComplement ? "3' → 5' Rev Comp" : "5' → 3' Forward"}
                            </button>

                            <!-- Copy Sequence -->
                            <button type="button" class="btn-secondary-action" id="btnCopySequence" title="Copy sequence bases to clipboard">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                Copy Bases
                            </button>

                            <!-- Copy Full FASTQ Record -->
                            <button type="button" class="btn-secondary-action" id="btnCopyRecord" title="Copy complete 4-line FASTQ record to clipboard">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                                Copy FASTQ
                            </button>
                        </div>
                    </div>

                    <!-- Tab Content Container -->
                    <div class="viewer-body" style="padding: 24px;">
                        ${this.activeTab === 'bases' 
                            ? this.renderBasesTab(displaySeq, read, motifMatches) 
                            : this.renderFastqTab(read, displaySeq, displayQual, displayPhreds)}
                    </div>
                </div>

                <!-- Paginated Reads Table Section -->
                <div class="reads-table-section" id="readsTableSection">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
                        <div>
                            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-heading); margin: 0;">
                                Dataset Reads Catalog
                            </h2>
                            <p style="color: var(--text-muted); font-size: 0.85rem; margin: 4px 0 0 0;">
                                All reads contained in <code>${this.escapeHtml(this.activeDataset.name || this.activeDataset.datasetName || 'Dataset')}</code>. Click any row or "Inspect Read" to view its sequence and Phred scores.
                            </p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <a href="/api/export/reads" class="btn-secondary-action" download="reads_${this.activeDataset.name || this.activeDataset.datasetName || 'dataset'}.csv" style="text-decoration: none;">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                Export Reads CSV
                            </a>
                        </div>
                    </div>

                    <div id="tableContainerSlot">
                        <!-- Table rendered here -->
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
        this.renderTableOnly();
    }

    renderBasesTab(displaySeq, read, motifMatches) {
        const len = displaySeq.length;
        const baseCounts = read.baseCounts || { A: 0, C: 0, G: 0, T: 0, N: 0 };
        const totalBases = len || 1;

        // Build set of highlighted indices
        const highlightedIndices = new Set();
        motifMatches.forEach(match => {
            for (let i = 0; i < match.length; i++) {
                highlightedIndices.add(match.start + i);
            }
        });

        // Generate base tiles HTML
        const baseTilesHtml = displaySeq.split('').map((base, idx) => {
            const relPos = idx + 1; // 1-based index in read
            const globalPos = read.startPos + idx;
            const isMatch = highlightedIndices.has(idx);
            const baseClass = `base-tile base-${base.toUpperCase()} ${isMatch ? 'base-highlight-pulse' : ''}`;

            return `
                <div class="${baseClass}" title="Base: ${base} | Position in Read: ${relPos} | Dataset Coordinate: ${globalPos}">
                    <span class="base-pos">${relPos}</span>
                    <span class="base-char">${base}</span>
                </div>
            `;
        }).join('');

        // Percentage composition
        const pctA = Math.round(((baseCounts.A || 0) / totalBases) * 100);
        const pctC = Math.round(((baseCounts.C || 0) / totalBases) * 100);
        const pctG = Math.round(((baseCounts.G || 0) / totalBases) * 100);
        const pctT = Math.round(((baseCounts.T || 0) / totalBases) * 100);
        const pctN = Math.round(((baseCounts.N || 0) / totalBases) * 100);

        return `
            <div class="bases-view-container">
                <!-- Color-Coded Nucleotide Ribbon & Ruler -->
                <div class="ribbon-card" style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">
                            Nucleotide Position Ruler (1-based relative position)
                        </span>
                        <span style="font-size: 0.78rem; font-weight: 600; color: var(--brand-teal);">
                            Orientation: ${this.isReverseComplement ? "3' → 5' (Reverse Complement)" : "5' → 3' (Forward Strand)"}
                        </span>
                    </div>

                    <!-- The nucleotide ribbon scroll area -->
                    <div class="nucleotide-ribbon-track">
                        ${baseTilesHtml}
                    </div>

                    <!-- Base Legend Strip -->
                    <div class="base-legend-strip" style="display: flex; gap: 16px; margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border-color); font-size: 0.76rem; font-weight: 700; flex-wrap: wrap;">
                        <span style="display: flex; align-items: center; gap: 5px;"><span class="legend-swatch base-A">A</span> Adenine</span>
                        <span style="display: flex; align-items: center; gap: 5px;"><span class="legend-swatch base-C">C</span> Cytosine</span>
                        <span style="display: flex; align-items: center; gap: 5px;"><span class="legend-swatch base-G">G</span> Guanine</span>
                        <span style="display: flex; align-items: center; gap: 5px;"><span class="legend-swatch base-T">T</span> Thymine</span>
                        <span style="display: flex; align-items: center; gap: 5px;"><span class="legend-swatch base-N">N</span> Ambiguous (N)</span>
                    </div>
                </div>

                <!-- Nucleotide Composition Stacked Bar -->
                <div class="composition-summary-box" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-heading);">
                            Read Nucleotide Composition
                        </span>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">
                            Total: <strong>${len}</strong> bases
                        </span>
                    </div>

                    <!-- Stacked bar -->
                    <div class="composition-stacked-bar" style="display: flex; height: 16px; border-radius: 6px; overflow: hidden; margin-bottom: 12px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);">
                        <div style="width: ${pctA}%; background: #10b981;" title="Adenine: ${baseCounts.A || 0} (${pctA}%)"></div>
                        <div style="width: ${pctC}%; background: #0284c7;" title="Cytosine: ${baseCounts.C || 0} (${pctC}%)"></div>
                        <div style="width: ${pctG}%; background: #f59e0b;" title="Guanine: ${baseCounts.G || 0} (${pctG}%)"></div>
                        <div style="width: ${pctT}%; background: #ef4444;" title="Thymine: ${baseCounts.T || 0} (${pctT}%)"></div>
                        <div style="width: ${pctN}%; background: #64748b;" title="Ambiguous N: ${baseCounts.N || 0} (${pctN}%)"></div>
                    </div>

                    <!-- Badges -->
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <span class="comp-badge comp-A">A: <strong>${baseCounts.A || 0}</strong> (${pctA}%)</span>
                        <span class="comp-badge comp-C">C: <strong>${baseCounts.C || 0}</strong> (${pctC}%)</span>
                        <span class="comp-badge comp-G">G: <strong>${baseCounts.G || 0}</strong> (${pctG}%)</span>
                        <span class="comp-badge comp-T">T: <strong>${baseCounts.T || 0}</strong> (${pctT}%)</span>
                        <span class="comp-badge comp-N">N: <strong>${baseCounts.N || 0}</strong> (${pctN}%)</span>
                        <span class="comp-badge comp-gc">GC Content: <strong>${read.gcPercentage}%</strong></span>
                    </div>
                </div>
            </div>
        `;
    }

    renderFastqTab(read, displaySeq, displayQual, displayPhreds) {
        // Generate Phred Bars
        const phredBarsHtml = displayPhreds.map((q, idx) => {
            const baseChar = displaySeq.charAt(idx) || '';
            const asciiChar = displayQual.charAt(idx) || '';
            const heightPercent = Math.min(100, Math.round((q / 42) * 100));

            let barColor = '#ef4444'; // Red < 10
            let qualityLabel = 'Poor (<90%)';
            if (q >= 30) {
                barColor = '#10b981'; // Green >= 30
                qualityLabel = 'Excellent (≥99.9%)';
            } else if (q >= 20) {
                barColor = '#0284c7'; // Blue 20-29
                qualityLabel = 'Good (99.0%)';
            } else if (q >= 10) {
                barColor = '#f59e0b'; // Amber 10-19
                qualityLabel = 'Moderate (90.0%)';
            }

            return `
                <div class="phred-col" title="Pos ${idx + 1}: Base ${baseChar} | Phred Q${q} | ASCII '${asciiChar}' | ${qualityLabel}">
                    <div class="phred-bar-container">
                        <div class="phred-bar" style="height: ${heightPercent}%; background: ${barColor};"></div>
                    </div>
                    <span class="phred-base-char">${baseChar}</span>
                    <span class="phred-q-num">${q}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="fastq-view-container">
                <!-- 4-Line FASTQ Record Syntax Box -->
                <div style="margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-heading); text-transform: uppercase;">
                            Complete 4-Line FASTQ Record ${this.isReverseComplement ? '<span style="display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; margin-left: 8px; font-weight: 700;">(Reverse-Complement Orientation: 3\' &rarr; 5\')</span>' : ''}
                        </span>
                        <span style="font-size: 0.78rem; color: var(--text-muted);">
                            Format: Sanger FASTQ (Phred+33)
                        </span>
                    </div>
                    <div class="fastq-code-block" style="background: #0f172a; color: #f8fafc; border-radius: 8px; padding: 18px 22px; font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.6; overflow-x: auto; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);">
                        <div style="color: #38bdf8;" title="Line 1: Sequence identifier / Header"><span style="color: #64748b; user-select: none; margin-right: 12px;">1</span>${this.escapeHtml(read.header)}</div>
                        <div style="color: #34d399;" title="Line 2: Sequence bases"><span style="color: #64748b; user-select: none; margin-right: 12px;">2</span>${displaySeq}</div>
                        <div style="color: #fbbf24;" title="Line 3: Plus separator"><span style="color: #64748b; user-select: none; margin-right: 12px;">3</span>+</div>
                        <div style="color: #c084fc;" title="Line 4: Phred quality scores (ASCII)"><span style="color: #64748b; user-select: none; margin-right: 12px;">4</span>${this.escapeHtml(displayQual)}</div>
                    </div>
                </div>

                <!-- Per-Base Phred Quality Score Bar Chart -->
                <div class="phred-chart-card" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 18px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
                        <div>
                            <span style="font-size: 0.85rem; font-weight: 800; color: var(--text-heading);">
                                Per-Base Phred Quality Score Profile
                            </span>
                            <span style="font-size: 0.78rem; color: var(--text-muted); margin-left: 8px;">
                                Phred quality scale (Q30 = 99.9% accuracy, Q20 = 99.0% accuracy)
                            </span>
                        </div>
                        <div style="display: flex; gap: 12px; font-size: 0.75rem; font-weight: 600; flex-wrap: wrap;">
                            <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span> Q ≥ 30 (≥ 99.9%)</span>
                            <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; background: #0284c7; border-radius: 2px;"></span> Q 20-29 (99.0%)</span>
                            <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; background: #f59e0b; border-radius: 2px;"></span> Q 10-19 (90.0%)</span>
                            <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; background: #ef4444; border-radius: 2px;"></span> Q &lt; 10 (&lt; 90%)</span>
                        </div>
                    </div>

                    <!-- Chart track -->
                    <div class="phred-chart-track">
                        ${phredBarsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    renderTableOnly() {
        const slot = this.container.querySelector('#tableContainerSlot');
        if (!slot) return;

        const reads = this.readsTableData;
        const totalPages = this.tableTotalPages;
        const currentPage = this.tablePage;

        let filtered = reads;
        if (this.tableSearchFilter.trim()) {
            const q = this.tableSearchFilter.trim().toLowerCase();
            filtered = reads.filter(r => 
                (r.header && r.header.toLowerCase().includes(q)) || 
                String(r.readIndex).includes(q)
            );
        }

        if (filtered.length === 0) {
            slot.innerHTML = `
                <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 32px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
                    No reads matching "${this.escapeHtml(this.tableSearchFilter)}".
                </div>
            `;
            return;
        }

        const rowsHtml = filtered.map(r => {
            const isSelected = r.readIndex === this.currentReadIndex;
            return `
                <tr class="table-row ${isSelected ? 'row-selected' : ''}" data-index="${r.readIndex}">
                    <td style="font-family: var(--font-mono); font-weight: 700; color: var(--brand-teal);">#${r.readIndex}</td>
                    <td style="font-family: var(--font-mono); font-weight: 600;">${this.escapeHtml(r.header)}</td>
                    <td style="font-family: var(--font-mono); color: var(--text-muted);">[${r.startPos}, ${r.endPos})</td>
                    <td><strong>${r.length}</strong> bp</td>
                    <td>
                        <span class="gc-badge" style="background: ${r.gcPercentage >= 50 ? '#ecfdf5' : '#fffbeb'}; color: ${r.gcPercentage >= 50 ? '#059669' : '#b45309'}; border: 1px solid ${r.gcPercentage >= 50 ? '#a7f3d0' : '#fde68a'}; padding: 2px 8px; border-radius: var(--radius-pill); font-size: 0.78rem; font-weight: 700;">
                            ${r.gcPercentage}%
                        </span>
                    </td>
                    <td style="text-align: right;">
                        <button type="button" class="btn-table-action btn-inspect-read" data-index="${r.readIndex}" title="Inspect Read #${r.readIndex}">
                            ${isSelected ? 'Inspecting' : 'Inspect Read'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        slot.innerHTML = `
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); box-shadow: var(--shadow-sm); overflow: hidden;">
                <!-- Table Search Toolbar -->
                <div style="padding: 12px 18px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; background: #fafbfc;">
                    <div style="position: relative; width: 280px;">
                        <input type="text" id="tableFilterInput" class="form-input" 
                                placeholder="Filter reads by header or index" 
                                value="${this.escapeHtml(this.tableSearchFilter)}"
                                style="font-size: 0.8rem; padding-left: 32px;" />
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">
                            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>

                    <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-muted);">
                        <span>Rows per page:</span>
                        <select id="tablePageSizeSelect" class="form-input" style="padding: 4px 8px; font-size: 0.8rem; width: auto;">
                            <option value="5" ${this.tablePageSize === 5 ? 'selected' : ''}>5</option>
                            <option value="10" ${this.tablePageSize === 10 ? 'selected' : ''}>10</option>
                            <option value="20" ${this.tablePageSize === 20 ? 'selected' : ''}>20</option>
                        </select>
                    </div>
                </div>

                <!-- Table -->
                <div style="overflow-x: auto;">
                    <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                        <thead>
                            <tr style="background: #f1f5f9; text-align: left; color: var(--text-muted); font-size: 0.76rem; font-weight: 700; text-transform: uppercase;">
                                <th style="padding: 10px 18px;">Read ID</th>
                                <th style="padding: 10px 18px;">FASTQ Header</th>
                                <th style="padding: 10px 18px;">Position Range</th>
                                <th style="padding: 10px 18px;">Read Length</th>
                                <th style="padding: 10px 18px;">GC Content</th>
                                <th style="padding: 10px 18px; text-align: right;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>

                <!-- Pagination footer -->
                <div style="padding: 12px 18px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; font-size: 0.82rem; color: var(--text-muted);">
                    <div>Showing <strong>${filtered.length}</strong> of <strong>${this.totalReads}</strong> reads</div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button type="button" class="btn-stepper" id="btnTablePrev" ${currentPage > 1 ? '' : 'disabled'} style="padding: 4px 10px; font-size: 0.78rem;">
                            &larr; Prev
                        </button>
                        <span>Page <strong>${currentPage}</strong> of <strong>${totalPages}</strong></span>
                        <button type="button" class="btn-stepper" id="btnTableNext" ${currentPage < totalPages ? '' : 'disabled'} style="padding: 4px 10px; font-size: 0.78rem;">
                            Next &rarr;
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.bindTableEvents();
    }

    bindEvents() {
        // Read Lookup form with Enter support and validation message
        const lookupForm = this.container.querySelector('#readLookupForm');
        if (lookupForm) {
            lookupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const input = this.container.querySelector('#readSearchInput');
                if (input && input.value.trim()) {
                    await this.loadRead(input.value.trim());
                } else {
                    Toast.error('Please enter a read identifier or numerical index to search.');
                }
            });
        }

        // Stepper: Prev / Next
        const btnPrev = this.container.querySelector('#btnPrevRead');
        if (btnPrev) {
            btnPrev.addEventListener('click', async () => {
                if (this.currentReadIndex > 0) {
                    await this.loadRead(this.currentReadIndex - 1);
                }
            });
        }

        const btnNext = this.container.querySelector('#btnNextRead');
        if (btnNext) {
            btnNext.addEventListener('click', async () => {
                if (this.currentReadIndex < this.totalReads - 1) {
                    await this.loadRead(this.currentReadIndex + 1);
                }
            });
        }

        // Tabs
        const tabBasesBtn = this.container.querySelector('#tabBasesBtn');
        if (tabBasesBtn) {
            tabBasesBtn.addEventListener('click', () => {
                this.activeTab = 'bases';
                this.renderReadView();
            });
        }

        const tabFastqBtn = this.container.querySelector('#tabFastqBtn');
        if (tabFastqBtn) {
            tabFastqBtn.addEventListener('click', () => {
                this.activeTab = 'fastq';
                this.renderReadView();
            });
        }

        // Motif highlight input
        const motifInput = this.container.querySelector('#motifHighlightInput');
        if (motifInput) {
            motifInput.addEventListener('input', (e) => {
                this.motifQuery = e.target.value.trim().toUpperCase();
                // Rerender tab body only
                const viewerBody = this.container.querySelector('.viewer-body');
                if (viewerBody && this.currentReadData) {
                    const rawSeq = this.currentReadData.sequence || '';
                    const displaySeq = this.isReverseComplement ? this.computeReverseComplement(rawSeq) : rawSeq;
                    const matches = this.findMotifMatches(displaySeq, this.motifQuery);
                    if (this.activeTab === 'bases') {
                        viewerBody.innerHTML = this.renderBasesTab(displaySeq, this.currentReadData, matches);
                    }
                }
            });
        }

        // Reverse Complement Toggle
        const btnToggleRevComp = this.container.querySelector('#btnToggleRevComp');
        if (btnToggleRevComp) {
            btnToggleRevComp.addEventListener('click', () => {
                this.isReverseComplement = !this.isReverseComplement;
                Toast.info(this.isReverseComplement ? "Displaying Reverse Complement (3' → 5')" : "Displaying Forward Strand (5' → 3')");
                this.renderReadView();
            });
        }

        // Copy Sequence
        const btnCopySeq = this.container.querySelector('#btnCopySequence');
        if (btnCopySeq) {
            btnCopySeq.addEventListener('click', () => {
                if (!this.currentReadData) return;
                const rawSeq = this.currentReadData.sequence || '';
                const displaySeq = this.isReverseComplement ? this.computeReverseComplement(rawSeq) : rawSeq;
                navigator.clipboard.writeText(displaySeq).then(() => {
                    Toast.success(`Copied ${displaySeq.length} bp sequence to clipboard!`);
                }).catch(err => {
                    Toast.error('Could not copy sequence: ' + err.message);
                });
            });
        }

        // Copy Full FASTQ Record
        const btnCopyRecord = this.container.querySelector('#btnCopyRecord');
        if (btnCopyRecord) {
            btnCopyRecord.addEventListener('click', () => {
                if (!this.currentReadData) return;
                const r = this.currentReadData;
                const text = `${r.header}\n${r.sequence}\n+\n${r.quality}`;
                navigator.clipboard.writeText(text).then(() => {
                    Toast.success('Copied full 4-line FASTQ record to clipboard!');
                }).catch(err => {
                    Toast.error('Could not copy record: ' + err.message);
                });
            });
        }
    }

    bindTableEvents() {
        const slot = this.container.querySelector('#tableContainerSlot');
        if (!slot) return;

        // Row inspect buttons
        slot.querySelectorAll('.btn-inspect-read').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                await this.loadRead(idx);
                window.scrollTo({ top: 120, behavior: 'smooth' });
                Toast.info(`Now inspecting Read #${idx}`);
            });
        });

        // Filter input
        const filterInput = slot.querySelector('#tableFilterInput');
        if (filterInput) {
            filterInput.addEventListener('input', (e) => {
                this.tableSearchFilter = e.target.value;
                this.renderTableOnly();
            });
        }

        // Page size select
        const sizeSelect = slot.querySelector('#tablePageSizeSelect');
        if (sizeSelect) {
            sizeSelect.addEventListener('change', async (e) => {
                this.tablePageSize = parseInt(e.target.value, 10);
                this.tablePage = 1;
                await this.loadTableData();
            });
        }

        // Pagination buttons
        const btnPrev = slot.querySelector('#btnTablePrev');
        if (btnPrev) {
            btnPrev.addEventListener('click', async () => {
                if (this.tablePage > 1) {
                    this.tablePage--;
                    await this.loadTableData();
                }
            });
        }

        const btnNext = slot.querySelector('#btnTableNext');
        if (btnNext) {
            btnNext.addEventListener('click', async () => {
                if (this.tablePage < this.tableTotalPages) {
                    this.tablePage++;
                    await this.loadTableData();
                }
            });
        }
    }

    computeReverseComplement(seq) {
        if (!seq) return '';
        const compMap = { 'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C', 'N': 'N', 'a': 't', 't': 'a', 'c': 'g', 'g': 'c', 'n': 'n' };
        return seq.split('').reverse().map(c => compMap[c] || c).join('');
    }

    findMotifMatches(seq, motif) {
        if (!motif || !seq || motif.length > seq.length) return [];
        const matches = [];
        let startIndex = 0;
        while ((startIndex = seq.indexOf(motif, startIndex)) !== -1) {
            matches.push({ start: startIndex, length: motif.length });
            startIndex++;
        }
        return matches;
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
