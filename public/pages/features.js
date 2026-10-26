/**
 * GeneDex — Genomic Analysis Tools Directory (Features Page)
 * Clean, professional, user-focused overview of all genomic sequence analysis tools.
 */

import { api } from '../services/api.js';

export class FeaturesPage {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.activeDataset = null;
    }

    async render() {
        if (!this.container) return;

        // Render template immediately
        this.container.innerHTML = this.getHtml();

        // Check active dataset status asynchronously to show gentle real-data indicator
        try {
            const res = await api.getDatasets();
            if (res && res.success && res.activeDataset) {
                this.activeDataset = res.activeDataset;
                this.updateActiveDatasetNotice();
            }
        } catch (e) {
            // Non-critical: default notice remains intact
        }
    }

    getHtml() {
        return `
            <div class="page-container">
                <!-- ==================== HEADER ==================== -->
                <div class="features-header-wrapper">
                    <!-- Subtle decorative DNA strands at the edges (opacity 0.055) -->
                    <svg class="features-dna-decor left" viewBox="0 0 160 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M40 0 Q120 75 40 150 T40 300" stroke="#059669" stroke-width="2.5" stroke-linecap="round"/>
                        <path d="M120 0 Q40 75 120 150 T120 300" stroke="#0d9488" stroke-width="2.5" stroke-linecap="round"/>
                        <line x1="48" y1="35" x2="112" y2="35" stroke="#059669" stroke-width="1.8" stroke-dasharray="3 3"/>
                        <line x1="70" y1="75" x2="90" y2="75" stroke="#0d9488" stroke-width="2"/>
                        <line x1="48" y1="115" x2="112" y2="115" stroke="#059669" stroke-width="1.8" stroke-dasharray="3 3"/>
                        <line x1="48" y1="185" x2="112" y2="185" stroke="#059669" stroke-width="1.8" stroke-dasharray="3 3"/>
                        <line x1="70" y1="225" x2="90" y2="225" stroke="#0d9488" stroke-width="2"/>
                        <line x1="48" y1="265" x2="112" y2="265" stroke="#059669" stroke-width="1.8" stroke-dasharray="3 3"/>
                        <circle cx="40" cy="0" r="3.5" fill="#059669"/>
                        <circle cx="120" cy="0" r="3.5" fill="#0d9488"/>
                        <circle cx="40" cy="150" r="3.5" fill="#059669"/>
                        <circle cx="120" cy="150" r="3.5" fill="#0d9488"/>
                        <circle cx="40" cy="300" r="3.5" fill="#059669"/>
                        <circle cx="120" cy="300" r="3.5" fill="#0d9488"/>
                    </svg>
                    <svg class="features-dna-decor right" viewBox="0 0 160 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M120 0 Q40 75 120 150 T120 300" stroke="#059669" stroke-width="2.5" stroke-linecap="round"/>
                        <path d="M40 0 Q120 75 40 150 T40 300" stroke="#0d9488" stroke-width="2.5" stroke-linecap="round"/>
                        <line x1="48" y1="35" x2="112" y2="35" stroke="#059669" stroke-width="1.8" stroke-dasharray="3 3"/>
                        <line x1="70" y1="75" x2="90" y2="75" stroke="#0d9488" stroke-width="2"/>
                        <line x1="48" y1="115" x2="112" y2="115" stroke="#059669" stroke-width="1.8" stroke-dasharray="3 3"/>
                        <line x1="48" y1="185" x2="112" y2="185" stroke="#059669" stroke-width="1.8" stroke-dasharray="3 3"/>
                        <line x1="70" y1="225" x2="90" y2="225" stroke="#0d9488" stroke-width="2"/>
                        <line x1="48" y1="265" x2="112" y2="265" stroke="#059669" stroke-width="1.8" stroke-dasharray="3 3"/>
                        <circle cx="120" cy="0" r="3.5" fill="#059669"/>
                        <circle cx="40" cy="0" r="3.5" fill="#0d9488"/>
                        <circle cx="120" cy="150" r="3.5" fill="#059669"/>
                        <circle cx="40" cy="150" r="3.5" fill="#0d9488"/>
                        <circle cx="120" cy="300" r="3.5" fill="#059669"/>
                        <circle cx="40" cy="300" r="3.5" fill="#0d9488"/>
                    </svg>

                    <div class="features-header-content">
                        <h1 class="features-title">Explore Genomic Analysis Tools</h1>
                        <p class="features-subtitle">
                            Discover easy-to-use tools to upload, search, explore, and analyze DNA sequencing data—all in one place.
                        </p>
                        <div class="features-dataset-notice-slot" id="featuresDatasetNotice"></div>
                    </div>
                </div>

                <!-- ==================== 6 TOOL DIRECTORY CARDS ==================== -->
                <div class="features-directory-grid">

                    <!-- CARD 1: Upload Dataset (Green) -->
                    <div class="feature-directory-card card-green">
                        <div class="feature-card-header">
                            <div class="feature-card-icon icon-green" aria-hidden="true">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            </div>
                        </div>
                        <h2 class="feature-card-title">Upload Dataset</h2>
                        <p class="feature-card-desc">
                            Add your DNA sequencing data to GeneDex and prepare it for searching and analysis.
                        </p>
                        <ul class="feature-capabilities-list">
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>Upload a FASTQ file or paste FASTQ text.</span>
                            </li>
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>Check your dataset for valid sequencing records.</span>
                            </li>
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>Choose sample datasets or manage uploaded files.</span>
                            </li>
                        </ul>
                        <a href="#/upload" class="btn-card-action btn-green">
                            Open Tool &rarr;
                        </a>
                    </div>

                    <!-- CARD 2: Pattern Search (Purple) -->
                    <div class="feature-directory-card card-purple">
                        <div class="feature-card-header">
                            <div class="feature-card-icon icon-purple" aria-hidden="true">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </div>
                        </div>
                        <h2 class="feature-card-title">Pattern Search</h2>
                        <p class="feature-card-desc">
                            Find specific DNA sequences and discover where they appear in your dataset.
                        </p>
                        <ul class="feature-capabilities-list">
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>Search for nucleotide patterns.</span>
                            </li>
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>View the number of matching occurrences.</span>
                            </li>
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>Explore matching read identifiers and positions.</span>
                            </li>
                        </ul>
                        <a href="#/search" class="btn-card-action btn-purple">
                            Open Tool &rarr;
                        </a>
                    </div>

                    <!-- CARD 3: Read Explorer (Coral) -->
                    <div class="feature-directory-card card-coral">
                        <div class="feature-card-header">
                            <div class="feature-card-icon icon-coral" aria-hidden="true">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                        </div>
                        <h2 class="feature-card-title">Read Explorer</h2>
                        <p class="feature-card-desc">
                            Browse individual DNA reads and inspect their sequences and quality information.
                        </p>
                        <ul class="feature-capabilities-list">
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>Find reads by identifier or position.</span>
                            </li>
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>View DNA bases with color-coded highlighting.</span>
                            </li>
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>Inspect sequence length, GC content, and quality scores.</span>
                            </li>
                        </ul>
                        <a href="#/explorer" class="btn-card-action btn-coral">
                            Open Tool &rarr;
                        </a>
                    </div>

                    <!-- CARD 4: Genomic Analytics (Blue) -->
                    <div class="feature-directory-card card-blue">
                        <div class="feature-card-header">
                            <div class="feature-card-icon icon-blue" aria-hidden="true">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                            </div>
                        </div>
                        <h2 class="feature-card-title">Genomic Analytics</h2>
                        <p class="feature-card-desc">
                            Understand the composition and quality of your DNA sequencing data through clear visualizations.
                        </p>
                        <ul class="feature-capabilities-list">
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>Explore nucleotide frequency distributions.</span>
                            </li>
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>Compare GC and AT content.</span>
                            </li>
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>Examine read lengths and sequencing quality.</span>
                            </li>
                        </ul>
                        <a href="#/analytics" class="btn-card-action btn-blue">
                            Open Tool &rarr;
                        </a>
                    </div>

                    <!-- CARD 5: Research Reports (Amber) -->
                    <div class="feature-directory-card card-amber">
                        <div class="feature-card-header">
                            <div class="feature-card-icon icon-amber" aria-hidden="true">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                            </div>
                        </div>
                        <h2 class="feature-card-title">Research Reports</h2>
                        <p class="feature-card-desc">
                            Create organized reports that summarize your genomic dataset and analysis results.
                        </p>
                        <ul class="feature-capabilities-list">
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>Choose the information to include.</span>
                            </li>
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>Review a generated analysis report.</span>
                            </li>
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>Download available PDF or CSV results.</span>
                            </li>
                        </ul>
                        <a href="#/reports" class="btn-card-action btn-amber">
                            Open Tool &rarr;
                        </a>
                    </div>

                    <!-- CARD 6: Manage Datasets (Slate) -->
                    <div class="feature-directory-card card-slate">
                        <div class="feature-card-header">
                            <div class="feature-card-icon icon-slate" aria-hidden="true">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                            </div>
                        </div>
                        <h2 class="feature-card-title">Manage Datasets</h2>
                        <p class="feature-card-desc">
                            Keep your DNA datasets organized and switch between them whenever you need.
                        </p>
                        <ul class="feature-capabilities-list">
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>View available datasets and their status.</span>
                            </li>
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>Select the dataset you want to analyze.</span>
                            </li>
                            <li class="feature-capability-item">
                                <div class="feature-capability-bullet">&#10004;</div>
                                <span>Download or reprocess datasets when supported.</span>
                            </li>
                        </ul>
                        <a href="#/upload" class="btn-card-action btn-slate">
                            Manage Datasets &rarr;
                        </a>
                    </div>

                </div> <!-- /features-directory-grid -->

                <!-- ==================== GETTING STARTED SECTION ==================== -->
                <div class="features-getting-started-card">
                    <div class="getting-started-header">
                        <div>
                            <h2 class="getting-started-title">New to GeneDex?</h2>
                            <p class="getting-started-desc">
                                Start with your own DNA sequencing file or explore GeneDex using a sample dataset.
                            </p>
                        </div>
                        <a href="#/upload" class="btn-primary-hero" style="padding: 11px 24px; font-size: 0.92rem; white-space: nowrap;">
                            Get Started &rarr;
                        </a>
                    </div>
                    <div class="getting-started-steps">
                        <div class="getting-started-step">
                            <div class="step-num-badge">1</div>
                            <div class="step-content">
                                <div class="step-name">Add or select a DNA dataset</div>
                                <div class="step-sub">Upload a FASTQ file, paste sequence text, or choose a pre-loaded sample.</div>
                            </div>
                        </div>
                        <div class="getting-started-step">
                            <div class="step-num-badge">2</div>
                            <div class="step-content">
                                <div class="step-name">Choose an analysis tool</div>
                                <div class="step-sub">Locate specific motifs, explore read sequences, or examine base distributions.</div>
                            </div>
                        </div>
                        <div class="getting-started-step">
                            <div class="step-num-badge">3</div>
                            <div class="step-content">
                                <div class="step-name">Explore results and generate reports</div>
                                <div class="step-sub">Review interactive visual summaries and export your analysis findings as PDF or CSV.</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        `;
    }

    updateActiveDatasetNotice() {
        const slot = this.container.querySelector('#featuresDatasetNotice');
        if (!slot) return;
        if (this.activeDataset && this.activeDataset.name) {
            const name = this.escapeHtml(this.activeDataset.name);
            const reads = this.activeDataset.totalReads || 0;
            const readsLabel = reads === 1 ? '1 read' : `${reads.toLocaleString()} reads`;
            slot.innerHTML = `
                <div class="features-dataset-strip">
                    <span style="color: var(--brand-green); font-size: 0.88rem; font-weight: 800;">&#10004;</span>
                    <span>Active Dataset: <strong>${name}</strong> (${readsLabel}) &bull; Ready for analysis</span>
                </div>
            `;
        }
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
