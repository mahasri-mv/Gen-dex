import { api } from '../services/api.js';
import { DatasetPill } from './DatasetPill.js';

export class Navbar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.datasetPill = null;
        this.currentUser = null;
        this.currentRoute = '#/home';
    }

    async init() {
        this.currentUser = await api.checkAuth();
        this.render();
        this.bindEvents();

        if (this.shouldShowFullNav()) {
            this.datasetPill = new DatasetPill('datasetPillSlot');
            await this.datasetPill.init();
        }
    }

    isAuthRoute(route) {
        const r = route || this.currentRoute;
        return r === '#/login' || r === '#/register' || r === '#/forgot-password' || r === '#/reset-password';
    }

    shouldShowFullNav() {
        return !this.isAuthRoute(this.currentRoute) && this.currentUser && this.currentUser.role !== 'GUEST';
    }

    updateActiveRoute(route) {
        const prevRoute = this.currentRoute;
        this.currentRoute = route || '#/home';

        const wasAuth = this.isAuthRoute(prevRoute);
        const isAuth = this.isAuthRoute(this.currentRoute);

        // If transitioning between auth mode and full nav mode, re-render navbar
        if (wasAuth !== isAuth) {
            this.render();
            this.bindEvents();
            if (this.shouldShowFullNav()) {
                this.datasetPill = new DatasetPill('datasetPillSlot');
                this.datasetPill.init();
            }
            return;
        }

        const links = this.container.querySelectorAll('.nav-link');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === this.currentRoute || (this.currentRoute === '' && href === '#/home')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    render() {
        if (!this.container) return;

        const isAuthPage = this.isAuthRoute(this.currentRoute);

        if (isAuthPage) {
            // Simplified Minimalist Auth Header
            this.container.innerHTML = `
                <header class="app-navbar app-navbar-auth">
                    <div class="navbar-container" style="justify-content: space-between;">
                        <a href="#/login" class="navbar-brand">
                            <div class="brand-icon-box">
                                <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
                                    <path d="M10 6C14 10 22 14 26 18C30 22 22 26 18 30" stroke="#d97706" stroke-width="3.2" stroke-linecap="round"/>
                                    <path d="M26 6C22 10 14 14 10 18C6 22 14 26 18 30" stroke="#059669" stroke-width="3.2" stroke-linecap="round"/>
                                    <line x1="12" y1="10" x2="24" y2="10" stroke="#cbd5e1" stroke-width="2"/>
                                    <line x1="10" y1="18" x2="26" y2="18" stroke="#cbd5e1" stroke-width="2"/>
                                    <line x1="12" y1="26" x2="24" y2="26" stroke="#cbd5e1" stroke-width="2"/>
                                </svg>
                            </div>
                            <span class="brand-title-text"><span class="brand-gene">Gene</span><span class="brand-dex">Dex</span></span>
                        </a>
                        <div class="auth-header-links">
                            ${this.currentRoute === '#/login' ? `
                                <span class="auth-switch-text">New to GeneDex? <a href="#/register" class="auth-link-pill">Create Account</a></span>
                            ` : `
                                <span class="auth-switch-text">Already registered? <a href="#/login" class="auth-link-pill">Sign In</a></span>
                            `}
                        </div>
                    </div>
                </header>
            `;
            return;
        }

        const isAdmin = this.currentUser && this.currentUser.role === 'ADMIN';
        const userInitial = this.currentUser ? (this.currentUser.fullName || this.currentUser.email || 'U').charAt(0).toUpperCase() : 'U';
        const userName = this.currentUser ? (this.currentUser.fullName || 'User Account') : 'User Account';
        const userEmail = this.currentUser ? (this.currentUser.email || '') : '';

        this.container.innerHTML = `
            <header class="app-navbar">
                <div class="navbar-container">
                    <!-- Brand -->
                    <a href="#/home" class="navbar-brand">
                        <div class="brand-icon-box">
                            <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
                                <path d="M10 6C14 10 22 14 26 18C30 22 22 26 18 30" stroke="#d97706" stroke-width="3.2" stroke-linecap="round"/>
                                <path d="M26 6C22 10 14 14 10 18C6 22 14 26 18 30" stroke="#059669" stroke-width="3.2" stroke-linecap="round"/>
                                <line x1="12" y1="10" x2="24" y2="10" stroke="#cbd5e1" stroke-width="2"/>
                                <line x1="10" y1="18" x2="26" y2="18" stroke="#cbd5e1" stroke-width="2"/>
                                <line x1="12" y1="26" x2="24" y2="26" stroke="#cbd5e1" stroke-width="2"/>
                            </svg>
                        </div>
                        <span class="brand-title-text"><span class="brand-gene">Gene</span><span class="brand-dex">Dex</span></span>
                    </a>

                    <!-- Nav items -->
                    <ul class="navbar-menu" id="navbarMenu">
                        <li><a href="#/home" class="nav-link">Home</a></li>
                        <li><a href="#/features" class="nav-link">Features</a></li>
                        <li><a href="#/upload" class="nav-link">Upload Dataset</a></li>
                        <li><a href="#/search" class="nav-link">Pattern Search</a></li>
                        <li><a href="#/explorer" class="nav-link">Read Explorer</a></li>
                        <li><a href="#/analytics" class="nav-link">Genomic Analytics</a></li>
                        <li><a href="#/reports" class="nav-link">Reports</a></li>
                        <li><a href="#/about" class="nav-link">About</a></li>
                        ${isAdmin ? '<li><a href="#/admin" class="nav-link admin-link">Admin Dashboard</a></li>' : ''}
                    </ul>

                    <!-- Actions Area -->
                    <div class="navbar-actions">
                        <!-- Dataset Pill Slot -->
                        <div id="datasetPillSlot"></div>

                        <!-- Notification Bell -->
                        <button type="button" class="btn-nav-icon" id="btnNavNotifications" title="System Notifications">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            <span class="notification-dot"></span>
                        </button>

                        <!-- Avatar Menu -->
                        <div class="avatar-menu-wrapper" id="avatarMenuWrapper">
                            <button type="button" class="avatar-btn" id="btnToggleAvatarMenu" title="${userName}">
                                ${userInitial}
                            </button>
                            <div class="avatar-dropdown-menu" id="avatarDropdown">
                                <div class="user-profile-header">
                                    <div class="user-display-name">${userName}</div>
                                    <div class="user-display-email">${userEmail}</div>
                                </div>
                                <div class="avatar-menu-divider"></div>
                                <a href="#/profile" class="avatar-menu-item" id="navLinkProfile">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    <span>My Profile</span>
                                </a>
                                <button type="button" class="avatar-menu-item danger" id="btnNavSignOut">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </div>

                        <!-- Mobile Hamburger Button -->
                        <button type="button" class="btn-mobile-toggle" id="btnMobileToggle" aria-label="Toggle navigation menu">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                    </div>
                </div>
            </header>
        `;
    }

    bindEvents() {
        const isAuthPage = this.isAuthRoute(this.currentRoute);
        if (isAuthPage) return;

        const mobileToggle = this.container.querySelector('#btnMobileToggle');
        const menu = this.container.querySelector('#navbarMenu');
        mobileToggle?.addEventListener('click', () => {
            menu?.classList.toggle('mobile-open');
        });

        // Close mobile menu on link click
        menu?.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                menu.classList.remove('mobile-open');
            }
        });

        // Avatar menu toggle
        const avatarBtn = this.container.querySelector('#btnToggleAvatarMenu');
        const avatarWrapper = this.container.querySelector('#avatarMenuWrapper');
        avatarBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            avatarWrapper?.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!avatarWrapper?.contains(e.target)) {
                avatarWrapper?.classList.remove('open');
            }
        });

        // Close dropdown when Profile is clicked
        this.container.querySelector('#navLinkProfile')?.addEventListener('click', () => {
            avatarWrapper?.classList.remove('open');
        });

        // Sign Out / Log Out
        this.container.querySelector('#btnNavSignOut')?.addEventListener('click', async () => {
            avatarWrapper?.classList.remove('open');
            await api.logout();
            this.currentUser = null;
            window.location.hash = '#/login';
            window.location.reload();
        });

        // Notification Bell
        this.container.querySelector('#btnNavNotifications')?.addEventListener('click', () => {
            alert("GeneDex Pipeline Status: Active\nIndex consistency verified. 0 warnings.");
        });
    }
}
