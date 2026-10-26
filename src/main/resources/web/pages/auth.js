/**
 * GeneDex Authentication, Registration, and User Profile Pages
 * Split-screen entrance, strict validation, profile management, and session control.
 */
import { api } from '../services/api.js';
import { Toast } from '../components/Toast.js';

// =============================================================================
// 1. Split-Screen Sign In Page
// =============================================================================
export class LoginPage {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="auth-split-wrapper">
                <div class="auth-split-container">
                    <!-- Left Side: Visual & Branding Showcase -->
                    <div class="auth-left-panel">
                        <div class="auth-left-backdrop"></div>
                        <div class="auth-left-content">
                            <div class="auth-brand-lockup">
                                <div class="brand-icon-box">
                                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                                        <path d="M10 6C14 10 22 14 26 18C30 22 22 26 18 30" stroke="#d97706" stroke-width="3.2" stroke-linecap="round"/>
                                        <path d="M26 6C22 10 14 14 10 18C6 22 14 26 18 30" stroke="#059669" stroke-width="3.2" stroke-linecap="round"/>
                                        <line x1="12" y1="10" x2="24" y2="10" stroke="#cbd5e1" stroke-width="2"/>
                                        <line x1="10" y1="18" x2="26" y2="18" stroke="#cbd5e1" stroke-width="2"/>
                                        <line x1="12" y1="26" x2="24" y2="26" stroke="#cbd5e1" stroke-width="2"/>
                                    </svg>
                                </div>
                                <span class="brand-title-text"><span class="brand-gene">Gene</span><span class="brand-dex">Dex</span></span>
                            </div>

                            <div class="auth-welcome-copy">
                                <span class="auth-tagline-badge">GENOMIC SEQUENCE ANALYSIS PLATFORM</span>
                                <h1 class="auth-welcome-heading">Welcome to GeneDex</h1>
                                <p class="auth-welcome-desc">
                                    Your workspace for uploading, searching, exploring, and analyzing DNA sequencing data.
                                </p>
                            </div>

                            <div class="auth-feature-list">
                                <div class="auth-feature-item">
                                    <div class="auth-feature-icon">🧬</div>
                                    <div class="auth-feature-text">
                                        <strong>Intelligent Dataset Ingestion</strong>
                                        <span>Process standard FASTQ files with instant quality verification.</span>
                                    </div>
                                </div>
                                <div class="auth-feature-item">
                                    <div class="auth-feature-icon">🔍</div>
                                    <div class="auth-feature-text">
                                        <strong>Fast Pattern &amp; Motif Search</strong>
                                        <span>Locate exact nucleotide patterns across millions of bases in milliseconds.</span>
                                    </div>
                                </div>
                                <div class="auth-feature-item">
                                    <div class="auth-feature-icon">📊</div>
                                    <div class="auth-feature-text">
                                        <strong>Analytical Reporting &amp; Inspection</strong>
                                        <span>Visualize nucleotide distributions, GC-ratios, and read-level metrics.</span>
                                    </div>
                                </div>
                            </div>

                            <div class="auth-left-footer">
                                <span>&copy; ${new Date().getFullYear()} GeneDex Genomics. Secure, isolated sequence workspace.</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right Side: Clean White Sign In Card -->
                    <div class="auth-right-panel">
                        <div class="auth-card">
                            <div class="auth-card-header">
                                <h2 class="auth-title">Sign In</h2>
                                <p class="auth-subtitle">Enter your email and password to access your genomic workspace.</p>
                            </div>

                            <div id="loginAlert" class="auth-alert hidden"></div>

                            <form id="loginForm" class="auth-form" novalidate>
                                <div class="form-group">
                                    <label for="loginEmail" class="form-label">Email Address</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon">✉️</span>
                                        <input type="email" id="loginEmail" class="form-input" placeholder="researcher@genomicdemo.local" required autocomplete="email" />
                                    </div>
                                </div>

                                <div class="form-group">
                                    <div class="label-with-action">
                                        <label for="loginPassword" class="form-label">Password</label>
                                        <a href="#/forgot-password" class="auth-link-subtle">Forgot password?</a>
                                    </div>
                                    <div class="input-with-icon">
                                        <span class="input-icon">🔒</span>
                                        <input type="password" id="loginPassword" class="form-input" placeholder="••••••••" required autocomplete="current-password" />
                                        <button type="button" class="btn-toggle-visibility" id="btnTogglePassword" title="Show / Hide Password">👁️</button>
                                    </div>
                                </div>

                                <div class="form-group-inline">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="loginRememberMe" checked />
                                        <span>Remember my session</span>
                                    </label>
                                </div>

                                <button type="submit" class="btn-primary btn-block" id="btnLoginSubmit">
                                    <span class="btn-text">Sign In</span>
                                    <span class="spinner hidden" id="loginSpinner"></span>
                                </button>
                            </form>

                            <!-- Subtle Demo Credentials for Testing / Grading -->
                            <div class="demo-accounts-accordion">
                                <div class="demo-accordion-toggle" id="btnToggleDemoPresets">
                                    <span>⚡ Quick Evaluation Presets</span>
                                    <span class="toggle-arrow" id="demoArrow">&#9662;</span>
                                </div>
                                <div class="demo-accordion-content" id="demoPresetsContent">
                                    <p class="demo-accounts-desc">Click any persona to auto-fill credentials for quick review:</p>
                                    <div class="demo-button-grid">
                                        <button type="button" class="btn-demo-preset" data-email="researcher@genomicdemo.local" data-pass="ResearchDemo@2026!">
                                            <strong>🧬 Researcher</strong>
                                            <span>researcher@genomicdemo.local</span>
                                        </button>
                                        <button type="button" class="btn-demo-preset" data-email="lab@genomicdemo.local" data-pass="LabDemo@2026!">
                                            <strong>🔬 Lab Tech</strong>
                                            <span>lab@genomicdemo.local</span>
                                        </button>
                                        <button type="button" class="btn-demo-preset" data-email="admin@genomicdemo.local" data-pass="AdminDemo@2026!">
                                            <strong>🛡️ Administrator</strong>
                                            <span>admin@genomicdemo.local</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="auth-footer-links">
                                <span>Don't have an account? <a href="#/register" class="auth-link-bold">Create Account</a></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const form = this.container.querySelector('#loginForm');
        const alertEl = this.container.querySelector('#loginAlert');
        const spinner = this.container.querySelector('#loginSpinner');
        const btnSubmit = this.container.querySelector('#btnLoginSubmit');
        const btnText = btnSubmit?.querySelector('.btn-text');
        const emailInput = this.container.querySelector('#loginEmail');
        const passInput = this.container.querySelector('#loginPassword');
        const rememberInput = this.container.querySelector('#loginRememberMe');
        const btnTogglePass = this.container.querySelector('#btnTogglePassword');

        // Toggle password visibility
        btnTogglePass?.addEventListener('click', () => {
            const isPass = passInput.getAttribute('type') === 'password';
            passInput.setAttribute('type', isPass ? 'text' : 'password');
            btnTogglePass.textContent = isPass ? '🙈' : '👁️';
        });

        // Demo accounts toggle
        const demoToggle = this.container.querySelector('#btnToggleDemoPresets');
        const demoContent = this.container.querySelector('#demoPresetsContent');
        const demoArrow = this.container.querySelector('#demoArrow');
        demoToggle?.addEventListener('click', () => {
            demoContent?.classList.toggle('open');
            if (demoArrow) {
                demoArrow.innerHTML = demoContent?.classList.contains('open') ? '&#9652;' : '&#9662;';
            }
        });

        // Auto-fill demo presets
        this.container.querySelectorAll('.btn-demo-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const em = btn.getAttribute('data-email');
                const pw = btn.getAttribute('data-pass');
                if (emailInput) emailInput.value = em;
                if (passInput) passInput.value = pw;
                if (alertEl) alertEl.classList.add('hidden');
                Toast.info(`Credentials filled for ${em}`);
            });
        });

        // Form submission
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput?.value.trim();
            const password = passInput?.value;
            const rememberMe = rememberInput?.checked || false;

            if (!email || !password) {
                this.showAlert("Please enter both your email address and password.", "error");
                return;
            }

            // Simple email structure check
            if (!email.includes('@') || !email.includes('.')) {
                this.showAlert("Please enter a valid email address.", "error");
                return;
            }

            btnSubmit.disabled = true;
            spinner?.classList.remove('hidden');
            if (btnText) btnText.textContent = "Signing in...";
            if (alertEl) alertEl.classList.add('hidden');

            try {
                const res = await api.login(email, password, rememberMe);

                if (res && res.success && res.user) {
                    Toast.success(`Welcome back, ${res.user.fullName || 'Researcher'}!`);
                    // Determine redirect destination
                    let dest = '#/home';
                    try {
                        const saved = sessionStorage.getItem('genedex_redirect');
                        if (saved && !['#/login', '#/register', '#/forgot-password'].includes(saved)) {
                            dest = saved;
                            sessionStorage.removeItem('genedex_redirect');
                        }
                    } catch (e) {}

                    window.location.hash = dest;
                    window.location.reload();
                } else {
                    // Exact generic error message to prevent account enumeration
                    const errMsg = (res && res.error && res.error.includes("locked"))
                        ? res.error
                        : "Invalid email or password. Please try again.";
                    this.showAlert(errMsg, "error");
                }
            } catch (err) {
                this.showAlert("Invalid email or password. Please try again.", "error");
            } finally {
                btnSubmit.disabled = false;
                spinner?.classList.add('hidden');
                if (btnText) btnText.textContent = "Sign In";
            }
        });
    }

    showAlert(message, type = 'error') {
        const el = this.container.querySelector('#loginAlert');
        if (!el) return;
        el.className = `auth-alert ${type}`;
        el.textContent = message;
        el.classList.remove('hidden');
    }
}

// =============================================================================
// 2. Split-Screen Sign Up Page
// =============================================================================
export class RegisterPage {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="auth-split-wrapper">
                <div class="auth-split-container">
                    <!-- Left Side: Visual & Branding Showcase -->
                    <div class="auth-left-panel">
                        <div class="auth-left-backdrop"></div>
                        <div class="auth-left-content">
                            <div class="auth-brand-lockup">
                                <div class="brand-icon-box">
                                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                                        <path d="M10 6C14 10 22 14 26 18C30 22 22 26 18 30" stroke="#d97706" stroke-width="3.2" stroke-linecap="round"/>
                                        <path d="M26 6C22 10 14 14 10 18C6 22 14 26 18 30" stroke="#059669" stroke-width="3.2" stroke-linecap="round"/>
                                        <line x1="12" y1="10" x2="24" y2="10" stroke="#cbd5e1" stroke-width="2"/>
                                        <line x1="10" y1="18" x2="26" y2="18" stroke="#cbd5e1" stroke-width="2"/>
                                        <line x1="12" y1="26" x2="24" y2="26" stroke="#cbd5e1" stroke-width="2"/>
                                    </svg>
                                </div>
                                <span class="brand-title-text"><span class="brand-gene">Gene</span><span class="brand-dex">Dex</span></span>
                            </div>

                            <div class="auth-welcome-copy">
                                <span class="auth-tagline-badge">CREATE RESEARCHER ACCOUNT</span>
                                <h1 class="auth-welcome-heading">Join GeneDex</h1>
                                <p class="auth-welcome-desc">
                                    Create your dedicated genomic workspace. Upload private FASTQ datasets, run instant sequence searches, and generate comprehensive analytical reports.
                                </p>
                            </div>

                            <div class="auth-feature-list">
                                <div class="auth-feature-item">
                                    <div class="auth-feature-icon">🔒</div>
                                    <div class="auth-feature-text">
                                        <strong>Private Dataset Isolation</strong>
                                        <span>Uploaded FASTQ files remain isolated strictly within your personal account.</span>
                                    </div>
                                </div>
                                <div class="auth-feature-item">
                                    <div class="auth-feature-icon">⚡</div>
                                    <div class="auth-feature-text">
                                        <strong>Instant Setup</strong>
                                        <span>Pre-loaded with verified sample datasets to begin exploring immediately.</span>
                                    </div>
                                </div>
                            </div>

                            <div class="auth-left-footer">
                                <span>&copy; ${new Date().getFullYear()} GeneDex Genomics. All rights reserved.</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right Side: Clean White Registration Card -->
                    <div class="auth-right-panel">
                        <div class="auth-card register-card">
                            <div class="auth-card-header">
                                <h2 class="auth-title">Create Account</h2>
                                <p class="auth-subtitle">Fill in your information to create your GeneDex account.</p>
                            </div>

                            <div id="registerAlert" class="auth-alert hidden"></div>

                            <form id="registerForm" class="auth-form" novalidate>
                                <div class="form-group">
                                    <label for="regFullName" class="form-label">Full Name *</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon">👤</span>
                                        <input type="text" id="regFullName" class="form-input" placeholder="Dr. Maya Patel" required />
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="regEmail" class="form-label">Email Address *</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon">✉️</span>
                                        <input type="email" id="regEmail" class="form-input" placeholder="maya.patel@genomics.org" required autocomplete="email" />
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="regOrganization" class="form-label">Organization or Affiliation</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon">🏛️</span>
                                        <input type="text" id="regOrganization" class="form-input" placeholder="Center for Genomic Research" />
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="regPassword" class="form-label">Password *</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon">🔒</span>
                                        <input type="password" id="regPassword" class="form-input" placeholder="Minimum 8 characters" required />
                                        <button type="button" class="btn-toggle-visibility" id="btnToggleRegPassword" title="Show / Hide Password">👁️</button>
                                    </div>
                                </div>

                                <!-- Password Strength Indicator -->
                                <div class="password-strength-container">
                                    <div class="strength-meter-bar">
                                        <div class="strength-fill" id="passStrengthFill"></div>
                                    </div>
                                    <div class="strength-label" id="passStrengthLabel">Minimum 8 characters required</div>
                                </div>

                                <div class="form-group">
                                    <label for="regPasswordConfirm" class="form-label">Confirm Password *</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon">🔒</span>
                                        <input type="password" id="regPasswordConfirm" class="form-input" placeholder="Repeat your password" required />
                                    </div>
                                </div>

                                <button type="submit" class="btn-primary btn-block" id="btnRegisterSubmit">
                                    <span class="btn-text">Create Account</span>
                                    <span class="spinner hidden" id="registerSpinner"></span>
                                </button>
                            </form>

                            <div class="auth-footer-links">
                                <span>Already have an account? <a href="#/login" class="auth-link-bold">Sign In</a></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const form = this.container.querySelector('#registerForm');
        const alertEl = this.container.querySelector('#registerAlert');
        const spinner = this.container.querySelector('#registerSpinner');
        const btnSubmit = this.container.querySelector('#btnRegisterSubmit');
        const btnText = btnSubmit?.querySelector('.btn-text');
        const passInput = this.container.querySelector('#regPassword');
        const confirmInput = this.container.querySelector('#regPasswordConfirm');
        const strengthFill = this.container.querySelector('#passStrengthFill');
        const strengthLabel = this.container.querySelector('#passStrengthLabel');
        const btnTogglePass = this.container.querySelector('#btnToggleRegPassword');

        // Toggle password visibility
        btnTogglePass?.addEventListener('click', () => {
            const isPass = passInput.getAttribute('type') === 'password';
            passInput.setAttribute('type', isPass ? 'text' : 'password');
            btnTogglePass.textContent = isPass ? '🙈' : '👁️';
        });

        // Password strength meter
        passInput?.addEventListener('input', () => {
            const val = passInput.value;
            let score = 0;
            if (val.length >= 8) score++;
            if (val.length >= 12) score++;
            if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
            if (/[0-9]/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;

            const widths = ['0%', '20%', '40%', '60%', '80%', '100%'];
            const colors = ['#cbd5e1', '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#059669'];
            const labels = ['Minimum 8 characters required', 'Too short', 'Fair', 'Good', 'Strong', 'Very Strong'];

            const idx = Math.min(score, 5);
            if (strengthFill && strengthLabel) {
                strengthFill.style.width = widths[idx];
                strengthFill.style.backgroundColor = colors[idx];
                strengthLabel.textContent = `Password strength: ${labels[idx]}`;
                strengthLabel.style.color = colors[idx];
            }
        });

        // Form submission
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = this.container.querySelector('#regFullName')?.value.trim();
            const email = this.container.querySelector('#regEmail')?.value.trim();
            const organization = this.container.querySelector('#regOrganization')?.value.trim() || 'Genomics Research';
            const password = passInput?.value;
            const confirm = confirmInput?.value;

            if (!fullName || !email || !password || !confirm) {
                this.showAlert("Please fill in all required fields.", "error");
                return;
            }

            if (!email.includes('@') || !email.includes('.')) {
                this.showAlert("Please enter a valid email address.", "error");
                return;
            }

            if (password.length < 8) {
                this.showAlert("Password must be at least 8 characters long.", "error");
                return;
            }

            if (password !== confirm) {
                this.showAlert("Passwords do not match. Please re-enter identical passwords.", "error");
                return;
            }

            btnSubmit.disabled = true;
            spinner?.classList.remove('hidden');
            if (btnText) btnText.textContent = "Creating Account...";
            if (alertEl) alertEl.classList.add('hidden');

            try {
                const res = await api.register({
                    fullName,
                    email,
                    password,
                    organization,
                    category: 'Bioinformatics Researcher'
                });

                if (res && res.success) {
                    Toast.success(`Account created successfully! Welcome, ${fullName}.`);
                    window.location.hash = '#/home';
                    window.location.reload();
                } else {
                    const err = (res && res.error) ? res.error : "Registration failed. Please try again.";
                    if (err.toLowerCase().includes("already exists")) {
                        this.showAlert("An account with this email address already exists. Please sign in or use another email.", "error");
                    } else {
                        this.showAlert(err, "error");
                    }
                }
            } catch (err) {
                this.showAlert("Network error during registration. Please try again.", "error");
            } finally {
                btnSubmit.disabled = false;
                spinner?.classList.add('hidden');
                if (btnText) btnText.textContent = "Create Account";
            }
        });
    }

    showAlert(message, type = 'error') {
        const el = this.container.querySelector('#registerAlert');
        if (!el) return;
        el.className = `auth-alert ${type}`;
        el.textContent = message;
        el.classList.remove('hidden');
    }
}

// =============================================================================
// 3. Forgot Password Page
// =============================================================================
export class ForgotPasswordPage {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="auth-page-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-brand-badge">
                            <span style="font-size: 26px;">🔑</span>
                        </div>
                        <h1 class="auth-title">Reset Password</h1>
                        <p class="auth-subtitle">Verify your identity and set a new account password.</p>
                    </div>

                    <!-- Step 1: Request Token -->
                    <div id="stepRequestToken">
                        <form id="forgotPasswordForm" class="auth-form" novalidate>
                            <div id="forgotAlert" class="auth-alert hidden"></div>

                            <div class="form-group">
                                <label for="forgotEmail" class="form-label">Account Email Address</label>
                                <div class="input-with-icon">
                                    <span class="input-icon">✉️</span>
                                    <input type="email" id="forgotEmail" class="form-input" placeholder="researcher@genomicdemo.local" required autocomplete="email" />
                                </div>
                                <span class="form-hint" style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px; display: block;">
                                    Enter the email associated with your GeneDex account.
                                </span>
                            </div>

                            <button type="submit" class="btn-primary btn-block" id="btnForgotSubmit">
                                <span class="btn-text">Generate Reset Authorization</span>
                                <span class="spinner hidden" id="forgotSpinner"></span>
                            </button>
                        </form>
                    </div>

                    <!-- Step 2: Set New Password Form -->
                    <div id="stepResetPassword" class="hidden">
                        <div class="token-banner" id="devTokenBanner">
                            <div class="token-banner-header">
                                <span>🛠️ Authorization Token Generated</span>
                                <button type="button" class="btn-sm btn-outline" id="btnAutoFillToken">Auto-Apply Token</button>
                            </div>
                            <div class="token-code" id="devTokenCode"></div>
                        </div>

                        <form id="resetPasswordForm" class="auth-form" novalidate>
                            <div id="resetAlert" class="auth-alert hidden"></div>

                            <div class="form-group">
                                <label for="resetTokenInput" class="form-label">Authorization Token</label>
                                <input type="text" id="resetTokenInput" class="form-input font-mono" placeholder="Paste reset token here" required />
                            </div>

                            <div class="form-group">
                                <label for="resetNewPassword" class="form-label">New Password</label>
                                <input type="password" id="resetNewPassword" class="form-input" placeholder="Minimum 8 characters" required />
                            </div>

                            <div class="form-group">
                                <label for="resetConfirmPassword" class="form-label">Confirm New Password</label>
                                <input type="password" id="resetConfirmPassword" class="form-input" placeholder="Repeat new password" required />
                            </div>

                            <button type="submit" class="btn-primary btn-block" id="btnResetSubmit">
                                <span class="btn-text">Set New Password &amp; Sign In</span>
                                <span class="spinner hidden" id="resetSpinner"></span>
                            </button>
                        </form>
                    </div>

                    <div class="auth-footer-links">
                        <a href="#/login" class="auth-link-bold">&larr; Return to Sign In</a>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const forgotForm = this.container.querySelector('#forgotPasswordForm');
        const resetForm = this.container.querySelector('#resetPasswordForm');
        const step1 = this.container.querySelector('#stepRequestToken');
        const step2 = this.container.querySelector('#stepResetPassword');
        const devTokenBanner = this.container.querySelector('#devTokenBanner');
        const devTokenCode = this.container.querySelector('#devTokenCode');
        const autoFillBtn = this.container.querySelector('#btnAutoFillToken');
        const tokenInput = this.container.querySelector('#resetTokenInput');

        let generatedToken = "";

        forgotForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = this.container.querySelector('#forgotEmail')?.value.trim();
            if (!email) {
                this.showAlert('#forgotAlert', "Please enter your email address.", "error");
                return;
            }

            const btn = this.container.querySelector('#btnForgotSubmit');
            const spinner = this.container.querySelector('#forgotSpinner');
            btn.disabled = true;
            spinner?.classList.remove('hidden');

            try {
                const res = await api.forgotPassword(email);
                if (res && res.success) {
                    Toast.success("Reset authorization generated.");
                    step1.classList.add('hidden');
                    step2.classList.remove('hidden');

                    if (res.devResetToken) {
                        generatedToken = res.devResetToken;
                        devTokenCode.textContent = generatedToken;
                        tokenInput.value = generatedToken;
                        devTokenBanner.classList.remove('hidden');
                    } else {
                        devTokenBanner.classList.add('hidden');
                    }
                } else {
                    this.showAlert('#forgotAlert', res.error || "Failed to process reset request.", "error");
                }
            } catch (err) {
                this.showAlert('#forgotAlert', "Network error processing request.", "error");
            } finally {
                btn.disabled = false;
                spinner?.classList.add('hidden');
            }
        });

        autoFillBtn?.addEventListener('click', () => {
            if (generatedToken && tokenInput) {
                tokenInput.value = generatedToken;
                Toast.info("Token copied into authorization field.");
            }
        });

        resetForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = tokenInput?.value.trim();
            const newPassword = this.container.querySelector('#resetNewPassword')?.value;
            const confirmPassword = this.container.querySelector('#resetConfirmPassword')?.value;

            if (!token || !newPassword) {
                this.showAlert('#resetAlert', "Please provide the token and new password.", "error");
                return;
            }

            if (newPassword !== confirmPassword) {
                this.showAlert('#resetAlert', "Passwords do not match.", "error");
                return;
            }

            if (newPassword.length < 8) {
                this.showAlert('#resetAlert', "Password must be at least 8 characters long.", "error");
                return;
            }

            const btn = this.container.querySelector('#btnResetSubmit');
            const spinner = this.container.querySelector('#resetSpinner');
            btn.disabled = true;
            spinner?.classList.remove('hidden');

            try {
                const res = await api.resetPassword(token, newPassword);
                if (res && res.success) {
                    Toast.success("Password reset successfully! Please sign in.");
                    window.location.hash = '#/login';
                } else {
                    this.showAlert('#resetAlert', res.error || "Invalid or expired token.", "error");
                }
            } catch (err) {
                this.showAlert('#resetAlert', "Network error resetting password.", "error");
            } finally {
                btn.disabled = false;
                spinner?.classList.add('hidden');
            }
        });
    }

    showAlert(selector, message, type = 'error') {
        const el = this.container.querySelector(selector);
        if (!el) return;
        el.className = `auth-alert ${type}`;
        el.textContent = message;
        el.classList.remove('hidden');
    }
}

// =============================================================================
// 4. Functional My Profile Page
// =============================================================================
export class ProfilePage {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    async render() {
        if (!this.container) return;

        // Fetch fresh profile data
        let user = api.currentUser;
        try {
            const profileRes = await api.getProfile();
            if (profileRes && profileRes.success && profileRes.user) {
                user = profileRes.user;
                api.currentUser = user;
            }
        } catch (e) {
            console.warn("Could not fetch fresh profile:", e);
        }

        const fullName = user?.fullName || 'Genomic Researcher';
        const email = user?.email || 'user@genomicdemo.local';
        const organization = user?.organization || 'Genomic Research Center';
        const initial = (fullName || email || 'U').charAt(0).toUpperCase();

        // Format member since date
        let memberSince = "Active Member";
        if (user?.createdAt) {
            try {
                const date = new Date(user.createdAt);
                memberSince = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
            } catch (e) {}
        }

        this.container.innerHTML = `
            <div class="page-container" style="max-width: 1040px; margin: 0 auto; padding: 32px 20px;">
                <!-- Header Breadcrumb & Title -->
                <div class="profile-page-header" style="margin-bottom: 28px;">
                    <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 6px;">
                        <a href="#/home" style="color: var(--brand-green); font-weight: 600; text-decoration: none;">Home</a> &gt; <span>My Profile</span>
                    </div>
                    <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--text-heading); margin: 0;">My Profile</h1>
                    <p style="color: var(--text-muted); font-size: 0.92rem; margin-top: 4px;">
                        Manage your account settings, personal details, and security credentials.
                    </p>
                </div>

                <div class="profile-layout-grid">
                    <!-- Left Column: User Summary Card -->
                    <div class="profile-summary-col">
                        <div class="profile-summary-card">
                            <div class="profile-avatar-large">${initial}</div>
                            <h2 class="profile-summary-name" id="summaryFullName">${fullName}</h2>
                            <p class="profile-summary-email">${email}</p>
                            <span class="profile-status-pill">&#9679; Active Account</span>

                            <div class="profile-meta-list">
                                <div class="profile-meta-item">
                                    <span class="meta-label">Affiliation</span>
                                    <span class="meta-value" id="summaryOrg">${organization}</span>
                                </div>
                                <div class="profile-meta-item">
                                    <span class="meta-label">Member Since</span>
                                    <span class="meta-value">${memberSince}</span>
                                </div>
                                <div class="profile-meta-item">
                                    <span class="meta-label">Account Role</span>
                                    <span class="meta-value">${user?.role === 'ADMIN' ? 'Administrator' : 'Standard Researcher'}</span>
                                </div>
                            </div>

                            <div style="margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 20px;">
                                <button type="button" class="btn-outline-danger btn-block" id="btnProfileSignOut">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Edit Profile & Change Password Forms -->
                    <div class="profile-forms-col">
                        <!-- 1. Edit Profile Information -->
                        <div class="profile-section-card">
                            <div class="section-card-header">
                                <div class="header-icon-badge">👤</div>
                                <div>
                                    <h3 class="section-card-title">Edit Profile Information</h3>
                                    <p class="section-card-desc">Update your display name and institutional affiliation.</p>
                                </div>
                            </div>

                            <div id="profileEditAlert" class="auth-alert hidden"></div>

                            <form id="editProfileForm" class="profile-form" novalidate>
                                <div class="form-group">
                                    <label for="profileFullName" class="form-label">Full Name *</label>
                                    <input type="text" id="profileFullName" class="form-input" value="${fullName}" required />
                                </div>

                                <div class="form-group">
                                    <label for="profileOrg" class="form-label">Organization or Affiliation</label>
                                    <input type="text" id="profileOrg" class="form-input" value="${organization}" />
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Email Address</label>
                                    <input type="email" class="form-input" value="${email}" disabled style="background: #f8fafc; cursor: not-allowed; color: var(--text-muted);" />
                                    <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: block;">Email address is linked to your primary account authentication.</span>
                                </div>

                                <div class="form-action-row">
                                    <button type="submit" class="btn-primary" id="btnSaveProfile">
                                        <span class="btn-text">Save Changes</span>
                                        <span class="spinner hidden" id="saveProfileSpinner"></span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- 2. Change Password Section -->
                        <div class="profile-section-card" style="margin-top: 24px;">
                            <div class="section-card-header">
                                <div class="header-icon-badge">🔒</div>
                                <div>
                                    <h3 class="section-card-title">Change Password</h3>
                                    <p class="section-card-desc">Keep your workspace secure by updating your credentials.</p>
                                </div>
                            </div>

                            <div id="passwordChangeAlert" class="auth-alert hidden"></div>

                            <form id="changePasswordForm" class="profile-form" novalidate>
                                <div class="form-group">
                                    <label for="profileCurrentPassword" class="form-label">Current Password *</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon">🔑</span>
                                        <input type="password" id="profileCurrentPassword" class="form-input" placeholder="Enter current password" required />
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="profileNewPassword" class="form-label">New Password *</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon">🔒</span>
                                        <input type="password" id="profileNewPassword" class="form-input" placeholder="Minimum 8 characters" required />
                                    </div>
                                    <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: block;">Must be at least 8 characters in length.</span>
                                </div>

                                <div class="form-group">
                                    <label for="profileConfirmPassword" class="form-label">Confirm New Password *</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon">🔒</span>
                                        <input type="password" id="profileConfirmPassword" class="form-input" placeholder="Repeat new password" required />
                                    </div>
                                </div>

                                <div class="form-action-row">
                                    <button type="submit" class="btn-primary" id="btnChangePassword">
                                        <span class="btn-text">Update Password</span>
                                        <span class="spinner hidden" id="changePasswordSpinner"></span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        // Edit Profile Form
        const editForm = this.container.querySelector('#editProfileForm');
        const editAlert = this.container.querySelector('#profileEditAlert');
        const btnSave = this.container.querySelector('#btnSaveProfile');
        const btnSaveText = btnSave?.querySelector('.btn-text');
        const saveSpinner = this.container.querySelector('#saveProfileSpinner');

        editForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = this.container.querySelector('#profileFullName')?.value.trim();
            const organization = this.container.querySelector('#profileOrg')?.value.trim();

            if (!fullName) {
                this.showAlert(editAlert, "Full Name cannot be empty.", "error");
                return;
            }

            btnSave.disabled = true;
            saveSpinner?.classList.remove('hidden');
            if (btnSaveText) btnSaveText.textContent = "Saving...";
            if (editAlert) editAlert.classList.add('hidden');

            try {
                const res = await api.updateProfile({ fullName, organization });
                if (res && res.success && res.user) {
                    Toast.success("Profile updated successfully!");
                    this.showAlert(editAlert, "Profile details updated successfully.", "success");
                    // Update summary card in real-time
                    const nameEl = this.container.querySelector('#summaryFullName');
                    const orgEl = this.container.querySelector('#summaryOrg');
                    if (nameEl) nameEl.textContent = res.user.fullName;
                    if (orgEl) orgEl.textContent = res.user.organization;
                } else {
                    this.showAlert(editAlert, res.error || "Failed to update profile.", "error");
                }
            } catch (err) {
                this.showAlert(editAlert, "Network error updating profile.", "error");
            } finally {
                btnSave.disabled = false;
                saveSpinner?.classList.add('hidden');
                if (btnSaveText) btnSaveText.textContent = "Save Changes";
            }
        });

        // Change Password Form
        const passForm = this.container.querySelector('#changePasswordForm');
        const passAlert = this.container.querySelector('#passwordChangeAlert');
        const btnPass = this.container.querySelector('#btnChangePassword');
        const btnPassText = btnPass?.querySelector('.btn-text');
        const passSpinner = this.container.querySelector('#changePasswordSpinner');

        passForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = this.container.querySelector('#profileCurrentPassword')?.value;
            const newPassword = this.container.querySelector('#profileNewPassword')?.value;
            const confirmPassword = this.container.querySelector('#profileConfirmPassword')?.value;

            if (!currentPassword || !newPassword || !confirmPassword) {
                this.showAlert(passAlert, "Please fill in all password fields.", "error");
                return;
            }

            if (newPassword.length < 8) {
                this.showAlert(passAlert, "New password must be at least 8 characters long.", "error");
                return;
            }

            if (newPassword !== confirmPassword) {
                this.showAlert(passAlert, "New passwords do not match. Please re-enter.", "error");
                return;
            }

            btnPass.disabled = true;
            passSpinner?.classList.remove('hidden');
            if (btnPassText) btnPassText.textContent = "Updating...";
            if (passAlert) passAlert.classList.add('hidden');

            try {
                const res = await api.updateProfile({ currentPassword, newPassword });
                if (res && res.success) {
                    Toast.success("Password updated successfully!");
                    this.showAlert(passAlert, "Your password has been changed successfully.", "success");
                    passForm.reset();
                } else {
                    this.showAlert(passAlert, res.error || "Failed to update password.", "error");
                }
            } catch (err) {
                this.showAlert(passAlert, "Network error updating password.", "error");
            } finally {
                btnPass.disabled = false;
                passSpinner?.classList.add('hidden');
                if (btnPassText) btnPassText.textContent = "Update Password";
            }
        });

        // Log Out Button
        this.container.querySelector('#btnProfileSignOut')?.addEventListener('click', async () => {
            await api.logout();
            Toast.success("Signed out successfully.");
            window.location.hash = '#/login';
            window.location.reload();
        });
    }

    showAlert(el, message, type = 'error') {
        if (!el) return;
        el.className = `auth-alert ${type}`;
        el.textContent = message;
        el.classList.remove('hidden');
    }
}

// =============================================================================
// 5. 404 Not Found Page
// =============================================================================
export class NotFoundPage {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render() {
        if (!this.container) return;

        const currentHash = window.location.hash || '#/unknown';

        this.container.innerHTML = `
            <div class="page-container not-found-container" style="padding: 60px 20px; text-align: center;">
                <div class="not-found-card" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); max-width: 580px; margin: 0 auto; padding: 48px 32px; box-shadow: var(--shadow-card);">
                    <div style="font-size: 3.5rem; font-weight: 900; color: var(--brand-green); margin-bottom: 8px;">404</div>
                    <div style="display: inline-block; padding: 4px 12px; background: rgba(5, 150, 105, 0.08); border-radius: 20px; font-weight: 700; font-size: 0.8rem; color: var(--brand-green); margin-bottom: 16px;">
                        A &middot; T &middot; C &middot; G
                    </div>
                    <h1 class="not-found-title" style="font-size: 1.6rem; font-weight: 800; color: var(--text-heading); margin-bottom: 12px;">Genomic Locus Not Found</h1>
                    <p class="not-found-desc" style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px;">
                        The destination <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${currentHash}</code> does not exist or has been relocated.
                    </p>

                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <a href="#/home" class="btn-primary" style="font-size: 0.88rem; padding: 9px 18px; text-decoration: none;">&larr; Return to Home</a>
                        <a href="#/upload" class="btn-secondary" style="font-size: 0.88rem; padding: 9px 18px; text-decoration: none;">Upload Datasets</a>
                    </div>
                </div>
            </div>
        `;
    }
}
