/**
 * GeneDex — Customer-Facing About Page
 * Professional bioinformatics software platform overview.
 *
 * Structure:
 * 1. Welcome to GeneDex — Hero Section
 * 2. Built for People Working with Genomic Data — 4 Audience Cards
 * 3. Why GeneDex? — 4 Core Benefits
 * 4. Getting Started with GeneDex — 4 Simple Steps
 * 5. Frequently Asked Questions — Accordion FAQ
 * 6. Ready to Explore? — Final Call to Action
 */

export class AboutPage {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="page-container about-page">
                <!-- ==================== BREADCRUMB ==================== -->
                <nav class="breadcrumb-bar" aria-label="Breadcrumb">
                    <a href="#/home">Home</a> &gt; <span>About GeneDex</span>
                </nav>

                <!-- ==================== 1. HERO SECTION ==================== -->
                <section class="about-hero-card">
                    <div class="about-hero-accent"></div>
                    <div class="about-hero-grid">
                        <div class="about-hero-content">
                            <span class="about-eyebrow-pill">GENOMIC SEQUENCE PLATFORM</span>
                            <h1 class="about-hero-title">Making Genomic Data Easier to Explore</h1>
                            <div class="about-hero-subheading">Discover, Search, and Understand DNA Sequences with GeneDex</div>
                            <p class="about-hero-desc">
                                GeneDex is a genomic sequence indexing and analysis platform that helps researchers, laboratory professionals, and learners work with DNA sequencing data. Upload FASTQ datasets, search for DNA patterns, explore individual reads, analyze nucleotide composition, compare datasets, and generate useful reports — all in one workspace.
                            </p>
                            <div class="about-hero-actions">
                                <a href="#/features" class="btn-primary">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    Explore Features
                                </a>
                                <a href="#/upload" class="btn-outline">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    Get Started
                                </a>
                            </div>
                        </div>

                        <div class="about-hero-visual" aria-hidden="true">
                            <div class="dna-illustration-card">
                                <svg width="280" height="260" viewBox="0 0 280 260" fill="none" class="dna-hero-svg">
                                    <!-- Decorative background glow -->
                                    <circle cx="140" cy="130" r="110" fill="rgba(5, 150, 105, 0.06)" />
                                    <circle cx="140" cy="130" r="75" fill="rgba(217, 119, 6, 0.05)" />
                                    
                                    <!-- Double Helix Strands -->
                                    <path d="M50 40 C 90 90, 190 90, 230 40" stroke="#059669" stroke-width="4" stroke-linecap="round"/>
                                    <path d="M50 85 C 90 35, 190 35, 230 85" stroke="#d97706" stroke-width="4" stroke-linecap="round"/>
                                    
                                    <path d="M50 130 C 90 180, 190 180, 230 130" stroke="#059669" stroke-width="4" stroke-linecap="round"/>
                                    <path d="M50 175 C 90 125, 190 125, 230 175" stroke="#d97706" stroke-width="4" stroke-linecap="round"/>
                                    
                                    <path d="M50 220 C 90 270, 190 270, 230 220" stroke="#059669" stroke-width="4" stroke-linecap="round"/>
                                    
                                    <!-- Base Pair Rungs -->
                                    <line x1="75" y1="58" x2="75" y2="67" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="3 3"/>
                                    <line x1="105" y1="75" x2="105" y2="50" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
                                    <line x1="140" y1="78" x2="140" y2="47" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
                                    <line x1="175" y1="75" x2="175" y2="50" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
                                    <line x1="205" y1="58" x2="205" y2="67" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="3 3"/>

                                    <line x1="75" y1="148" x2="75" y2="157" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="3 3"/>
                                    <line x1="105" y1="165" x2="105" y2="140" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
                                    <line x1="140" y1="168" x2="140" y2="137" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
                                    <line x1="175" y1="165" x2="175" y2="140" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
                                    <line x1="205" y1="148" x2="205" y2="157" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="3 3"/>

                                    <!-- Nucleotide Node Beads -->
                                    <circle cx="50" cy="40" r="7" fill="#059669" />
                                    <circle cx="230" cy="40" r="7" fill="#059669" />
                                    <circle cx="50" cy="85" r="7" fill="#d97706" />
                                    <circle cx="230" cy="85" r="7" fill="#d97706" />
                                    <circle cx="140" cy="78" r="6" fill="#0284c7" />
                                    <circle cx="140" cy="137" r="6" fill="#7c3aed" />
                                    <circle cx="50" cy="130" r="7" fill="#059669" />
                                    <circle cx="230" cy="130" r="7" fill="#059669" />
                                    <circle cx="50" cy="175" r="7" fill="#d97706" />
                                    <circle cx="230" cy="175" r="7" fill="#d97706" />
                                    <circle cx="50" cy="220" r="7" fill="#059669" />
                                    <circle cx="230" cy="220" r="7" fill="#059669" />
                                </svg>
                                <div class="dna-floating-badge">
                                    <span class="badge-dot"></span>
                                    <span>Genomic Workspace Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- ==================== 2. WHO IS GENEDEX FOR? ==================== -->
                <section class="about-section">
                    <div class="section-header-centered">
                        <span class="section-eyebrow">AUDIENCE &amp; DOMAINS</span>
                        <h2 class="section-title">Built for People Working with Genomic Data</h2>
                        <p class="section-subtitle">
                            Created to support researchers, technical staff, and educators working with DNA sequencing datasets.
                        </p>
                    </div>

                    <div class="about-audience-grid">
                        <!-- Audience 1: Bioinformatics Researchers -->
                        <div class="about-audience-card">
                            <div class="audience-icon-badge">🧬</div>
                            <h3 class="audience-title">Bioinformatics Researchers</h3>
                            <p class="audience-desc">
                                Explore genomic datasets, search sequence patterns, and study nucleotide composition.
                            </p>
                        </div>

                        <!-- Audience 2: Genomic Laboratory Professionals -->
                        <div class="about-audience-card">
                            <div class="audience-icon-badge">🔬</div>
                            <h3 class="audience-title">Genomic Laboratory Professionals</h3>
                            <p class="audience-desc">
                                Upload sequencing data, inspect DNA reads, and review sequence statistics.
                            </p>
                        </div>

                        <!-- Audience 3: Clinical and Medical Researchers -->
                        <div class="about-audience-card">
                            <div class="audience-icon-badge">🏥</div>
                            <h3 class="audience-title">Clinical and Medical Researchers</h3>
                            <p class="audience-desc">
                                Explore authorized genomic research datasets and analyze sequence characteristics. Do not claim that GeneDex diagnoses diseases or provides clinical decisions.
                            </p>
                        </div>

                        <!-- Audience 4: Students and Educators -->
                        <div class="about-audience-card">
                            <div class="audience-icon-badge">🎓</div>
                            <h3 class="audience-title">Students and Educators</h3>
                            <p class="audience-desc">
                                Learn about DNA sequences and explore genomic datasets through interactive analysis tools.
                            </p>
                        </div>
                    </div>
                </section>

                <!-- ==================== 4. WHY CHOOSE GENEDEX? ==================== -->
                <section class="about-section">
                    <div class="section-header-centered">
                        <span class="section-eyebrow">ADVANTAGES</span>
                        <h2 class="section-title">Why GeneDex?</h2>
                        <p class="section-subtitle">
                            Clear, structured, and focused tools designed to simplify everyday genomic sequence work.
                        </p>
                    </div>

                    <div class="about-benefits-grid">
                        <div class="about-benefit-card">
                            <div class="benefit-icon-box">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                            <div>
                                <h3 class="benefit-title">Organized Genomic Workspace</h3>
                                <p class="benefit-desc">
                                    Keep datasets, searches, analyses, and reports accessible through a unified interface.
                                </p>
                            </div>
                        </div>

                        <div class="about-benefit-card">
                            <div class="benefit-icon-box">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                            </div>
                            <div>
                                <h3 class="benefit-title">Efficient Sequence Exploration</h3>
                                <p class="benefit-desc">
                                    Search and inspect DNA sequences using the platform's compressed indexing technology.
                                </p>
                            </div>
                        </div>

                        <div class="about-benefit-card">
                            <div class="benefit-icon-box">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            </div>
                            <div>
                                <h3 class="benefit-title">Clear and Understandable Results</h3>
                                <p class="benefit-desc">
                                    Present sequence statistics through readable tables, charts, and visualizations.
                                </p>
                            </div>
                        </div>

                        <div class="about-benefit-card">
                            <div class="benefit-icon-box">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                            </div>
                            <div>
                                <h3 class="benefit-title">Practical Research Tools</h3>
                                <p class="benefit-desc">
                                    Move from dataset upload to pattern searching, analysis, comparison, and reporting without switching between multiple interfaces.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- ==================== 5. GETTING STARTED WITH GENEDEX ==================== -->
                <section class="about-section">
                    <div class="section-header-centered">
                        <span class="section-eyebrow">HOW TO USE</span>
                        <h2 class="section-title">Getting Started with GeneDex</h2>
                        <p class="section-subtitle">
                            Four simple steps to begin analyzing your genomic sequencing data.
                        </p>
                    </div>

                    <div class="about-steps-grid">
                        <!-- Step 1 -->
                        <div class="about-step-card">
                            <div class="step-badge">01</div>
                            <h3 class="step-title">Sign In or Explore</h3>
                            <p class="step-desc">
                                Sign in to your account, or use the public sample dataset if guest access is available.
                            </p>
                        </div>

                        <!-- Step 2 -->
                        <div class="about-step-card">
                            <div class="step-badge">02</div>
                            <h3 class="step-title">Select Your Dataset</h3>
                            <p class="step-desc">
                                Upload a valid FASTQ file or select an existing authorized dataset.
                            </p>
                        </div>

                        <!-- Step 3 -->
                        <div class="about-step-card">
                            <div class="step-badge">03</div>
                            <h3 class="step-title">Explore and Analyze</h3>
                            <p class="step-desc">
                                Search DNA patterns, inspect reads, calculate genomic statistics, or compare datasets.
                            </p>
                        </div>

                        <!-- Step 4 -->
                        <div class="about-step-card">
                            <div class="step-badge">04</div>
                            <h3 class="step-title">Save Your Results</h3>
                            <p class="step-desc">
                                Review the analysis and generate reports using the supported export options.
                            </p>
                        </div>
                    </div>
                </section>

                <!-- ==================== 6. FREQUENTLY ASKED QUESTIONS ==================== -->
                <section class="about-section">
                    <div class="section-header-centered">
                        <span class="section-eyebrow">COMMON QUESTIONS</span>
                        <h2 class="section-title">Frequently Asked Questions</h2>
                        <p class="section-subtitle">
                            Find clear, quick answers regarding formats, capabilities, and data access.
                        </p>
                    </div>

                    <div class="about-faq-container">
                        <!-- FAQ 1 -->
                        <div class="about-faq-item">
                            <button type="button" class="about-faq-question" aria-expanded="false">
                                <span>What is GeneDex?</span>
                                <svg class="about-faq-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                            <div class="about-faq-answer">
                                <p>GeneDex is a platform for indexing, searching, exploring, and analyzing genomic sequence data.</p>
                            </div>
                        </div>

                        <!-- FAQ 2 -->
                        <div class="about-faq-item">
                            <button type="button" class="about-faq-question" aria-expanded="false">
                                <span>Which file format does GeneDex support?</span>
                                <svg class="about-faq-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                            <div class="about-faq-answer">
                                <p>GeneDex supports FASTQ files containing DNA sequencing reads, subject to the application's actual file validation rules.</p>
                            </div>
                        </div>

                        <!-- FAQ 3 -->
                        <div class="about-faq-item">
                            <button type="button" class="about-faq-question" aria-expanded="false">
                                <span>Can I search for a specific DNA sequence?</span>
                                <svg class="about-faq-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                            <div class="about-faq-answer">
                                <p>Yes. You can enter a DNA pattern and find its exact occurrences in an indexed dataset.</p>
                            </div>
                        </div>

                        <!-- FAQ 4 -->
                        <div class="about-faq-item">
                            <button type="button" class="about-faq-question" aria-expanded="false">
                                <span>Can I analyze individual DNA reads?</span>
                                <svg class="about-faq-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                            <div class="about-faq-answer">
                                <p>Yes. The DNA Sequence Explorer lets you inspect reads and their nucleotide composition.</p>
                            </div>
                        </div>

                        <!-- FAQ 5 -->
                        <div class="about-faq-item">
                            <button type="button" class="about-faq-question" aria-expanded="false">
                                <span>Can I compare two datasets?</span>
                                <svg class="about-faq-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                            <div class="about-faq-answer">
                                <p>Use the Dataset Comparison tool to compare supported sequence statistics between indexed datasets.</p>
                            </div>
                        </div>

                        <!-- FAQ 6 -->
                        <div class="about-faq-item">
                            <button type="button" class="about-faq-question" aria-expanded="false">
                                <span>Can I download my analysis results?</span>
                                <svg class="about-faq-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                            <div class="about-faq-answer">
                                <p>Use the Research Report Generator to export the formats currently supported by the application.</p>
                            </div>
                        </div>

                        <!-- FAQ 7 -->
                        <div class="about-faq-item">
                            <button type="button" class="about-faq-question" aria-expanded="false">
                                <span>Do I need to understand Wavelet Trees to use GeneDex?</span>
                                <svg class="about-faq-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                            <div class="about-faq-answer">
                                <p>No. GeneDex handles sequence indexing and querying in the background. Users interact through the website's genomic tools.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- ==================== 7. FINAL CALL TO ACTION ==================== -->
                <section class="about-cta-section">
                    <div class="about-cta-content">
                        <h2 class="about-cta-heading">Ready to Explore Your Genomic Data?</h2>
                        <p class="about-cta-desc">
                            Start with a sample dataset or upload your own sequencing file to discover what GeneDex can help you analyze.
                        </p>
                        <div class="about-cta-buttons">
                            <a href="#/upload" class="btn-cta-light">Get Started</a>
                            <a href="#/features" class="btn-cta-outline">Explore Features</a>
                        </div>
                    </div>
                </section>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        // Interactive Accordion for Frequently Asked Questions
        const faqItems = this.container.querySelectorAll('.about-faq-item');
        faqItems.forEach(item => {
            const btn = item.querySelector('.about-faq-question');
            btn?.addEventListener('click', () => {
                const isCurrentlyOpen = item.classList.contains('open');
                
                // Close other accordion items for clean accordion UX
                faqItems.forEach(other => {
                    if (other !== item) {
                        other.classList.remove('open');
                        other.querySelector('.about-faq-question')?.setAttribute('aria-expanded', 'false');
                    }
                });

                item.classList.toggle('open', !isCurrentlyOpen);
                btn.setAttribute('aria-expanded', String(!isCurrentlyOpen));
            });
        });
    }
}
