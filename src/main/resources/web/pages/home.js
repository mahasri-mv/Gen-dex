import { Modal } from '../components/Modal.js';

export class HomePage {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    async render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="home-hero-viewport">
                <!-- Large Viewport-Filling Hero Banner ("The Tab") -->
                <section class="home-hero-banner" role="banner" aria-label="GeneDex Genomic Analysis Workspace">
                    <!-- High-Resolution Genomic Laboratory Artwork (Scientist, Open Laptop, DNA Helix) -->
                    <div class="hero-bg-layer" aria-hidden="true"></div>
                    <div class="hero-gradient-overlay" aria-hidden="true"></div>

                    <!-- Left Column: Primary Typography & Action Buttons -->
                    <div class="hero-content-wrapper">
                        <div class="hero-text-group">
                            <!-- User-Friendly Workspace Eyebrow Badge -->
                            <div class="hero-eyebrow-badge">
                                <span class="hero-eyebrow-dot"></span>
                                <span class="hero-eyebrow-text">YOUR GENOMIC ANALYSIS WORKSPACE</span>
                            </div>

                            <!-- Main Heading -->
                            <h1 class="hero-main-title">
                                Explore Genomic Data<br>
                                Smarter with <span class="brand-dex-highlight">GeneDex</span>
                            </h1>

                            <!-- User-Friendly Value Proposition Description -->
                            <p class="hero-description-text">
                                Upload your DNA sequencing data, search for specific patterns, explore individual reads, and understand your genomic results &mdash; all in one easy-to-use platform.
                            </p>

                            <!-- Dual Action Buttons -->
                            <div class="hero-buttons-row">
                                <a href="#/upload" class="btn-hero-start" id="btnHeroGetStarted">
                                    Get Started
                                    <svg class="btn-arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </a>

                                <button type="button" class="btn-hero-demo" id="btnHomeWatchDemo">
                                    <span class="demo-play-circle">
                                        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                            <polygon points="6,4 20,12 6,20"></polygon>
                                        </svg>
                                    </span>
                                    Watch Demo
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const btnDemo = this.container.querySelector('#btnHomeWatchDemo');
        btnDemo?.addEventListener('click', () => {
            const demoContent = `
                <div style="font-size: 0.9rem; line-height: 1.6; color: var(--text-body);">
                    <div style="background: var(--brand-green-light); border: 1px solid var(--brand-green-border); border-radius: var(--radius-sm); padding: 14px 18px; margin-bottom: 16px;">
                        <strong style="color: var(--brand-green); font-size: 1rem;">GeneDex Demonstration: DNA Motif Search & Analysis</strong>
                        <div style="font-family: var(--font-mono); font-size: 0.95rem; margin-top: 6px; font-weight: 700; color: var(--text-heading);">
                            Sample Read: GATTACAGATTACA
                        </div>
                    </div>

                    <p style="margin-bottom: 12px;">In this demonstration with the built-in report sample dataset:</p>
                    <ul style="margin: 0 0 16px 20px; list-style-type: square; color: var(--text-body);">
                        <li><strong>Dataset:</strong> Single demo read with 14 DNA bases</li>
                        <li><strong>Query Pattern:</strong> <code>"ATT"</code></li>
                        <li><strong>Motif Matches:</strong> Found exactly <strong>2</strong> matching occurrences</li>
                        <li><strong>Sequence Coordinates:</strong> Positions 1 and 8 in the read</li>
                        <li><strong>GC Content:</strong> 28.57% (2 Guanine, 2 Cytosine bases)</li>
                    </ul>

                    <div style="background: var(--bg-surface-alt); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 20px; font-size: 0.85rem; border: 1px solid var(--border-color);">
                        GeneDex enables researchers to load FASTQ files, search patterns, inspect reads, and produce comprehensive research reports directly in your browser.
                    </div>

                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <a href="#/search" class="btn-hero-start" style="font-size: 0.88rem; padding: 10px 18px;" data-action="close">Try Pattern Search &rarr;</a>
                    </div>
                </div>
            `;
            const modal = new Modal('demoModal', 'GeneDex Demonstration Walkthrough', demoContent);
            modal.open();
        });
    }
}
