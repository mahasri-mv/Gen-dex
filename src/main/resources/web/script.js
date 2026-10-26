import { api } from './services/api.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { HomePage } from './pages/home.js';
import { FeaturesPage } from './pages/features.js';
import { UploadPage } from './pages/upload.js';
import { SearchPage } from './pages/search.js';
import { ReadExplorerPage } from './pages/explorer.js';
import { GenomicAnalyticsPage } from './pages/analytics.js';
import { ReportsPage } from './pages/reports.js';
import { AdminDashboardPage } from './pages/admin.js';
import { AboutPage } from './pages/about.js';
import { LoginPage, RegisterPage, ForgotPasswordPage, ProfilePage, NotFoundPage } from './pages/auth.js';

let navbarInstance = null;
let footerInstance = null;

const AUTH_ROUTES = ['#/login', '#/register', '#/forgot-password', '#/reset-password'];

async function init() {
    // 1. Check Session & Initialize Dataset
    await api.checkAuth();
    if (api.currentUser && api.currentUser.role !== 'GUEST') {
        await api.getDatasets();
    }

    // 2. Initialize Persistent Layout Components
    navbarInstance = new Navbar('navbar-root');
    await navbarInstance.init();

    // 3. Setup Hash Routing & Dataset Synchronization
    window.addEventListener('hashchange', handleRoute);
    api.onDatasetChange(() => {
        handleRoute();
    });
    handleRoute();
}

async function handleRoute() {
    let hash = window.location.hash || '#/home';
    if (!hash.startsWith('#/')) hash = '#/home';

    // Route Guard: Site-wide protection
    const isAuthenticated = api.currentUser && api.currentUser.role !== 'GUEST';

    if (!isAuthenticated) {
        if (!AUTH_ROUTES.includes(hash)) {
            try {
                sessionStorage.setItem('genedex_redirect', hash);
            } catch (e) {}
            window.location.hash = '#/login';
            return;
        }
    } else {
        if (hash === '#/login' || hash === '#/register') {
            let dest = '#/home';
            try {
                const saved = sessionStorage.getItem('genedex_redirect');
                if (saved && !AUTH_ROUTES.includes(saved)) {
                    dest = saved;
                    sessionStorage.removeItem('genedex_redirect');
                }
            } catch (e) {}
            window.location.hash = dest;
            return;
        }
    }

    if (navbarInstance) {
        navbarInstance.currentUser = api.currentUser;
        navbarInstance.updateActiveRoute(hash);
    }

    const appView = document.getElementById('app-view');
    if (!appView) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (hash) {
        case '#/home': {
            const home = new HomePage('app-view');
            await home.render();
            break;
        }
        case '#/features': {
            const features = new FeaturesPage('app-view');
            features.render();
            break;
        }
        case '#/upload': {
            const upload = new UploadPage('app-view');
            await upload.render();
            break;
        }
        case '#/search': {
            const search = new SearchPage('app-view');
            await search.render();
            break;
        }
        case '#/explorer': {
            const explorer = new ReadExplorerPage('app-view');
            await explorer.render();
            break;
        }
        case '#/analytics': {
            const analytics = new GenomicAnalyticsPage('app-view');
            await analytics.render();
            break;
        }
        case '#/reports': {
            const reports = new ReportsPage('app-view');
            await reports.render();
            break;
        }
        case '#/admin': {
            const admin = new AdminDashboardPage('app-view');
            await admin.render();
            break;
        }
        case '#/about': {
            const about = new AboutPage('app-view');
            about.render();
            break;
        }
        case '#/login': {
            const login = new LoginPage('app-view');
            login.render();
            break;
        }
        case '#/register': {
            const register = new RegisterPage('app-view');
            register.render();
            break;
        }
        case '#/forgot-password': {
            const forgot = new ForgotPasswordPage('app-view');
            forgot.render();
            break;
        }
        case '#/profile': {
            const profile = new ProfilePage('app-view');
            await profile.render();
            break;
        }
        default: {
            const notFound = new NotFoundPage('app-view');
            notFound.render();
            break;
        }
    }
}

function renderPlaceholderPage(route, container) {
    const pageNames = {
        '#/features': 'Features Showcase',
        '#/upload': 'Upload Dataset (BUILD)',
        '#/search': 'Pattern Search (COUNT + LOCATE)',
        '#/explorer': 'Read Explorer (EXTRACT-READ)',
        '#/analytics': 'Genomic Analytics (BASE-COMPOSITION)',
        '#/reports': 'Research Reports Generator',
        '#/about': 'About & Methodology',
        '#/admin': 'Admin Dashboard'
    };
    const title = pageNames[route] || 'GeneDex Module';
    container.innerHTML = `
        <div class="page-container" style="text-align: center; padding: 60px 24px;">
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-card); padding: 48px; max-width: 600px; margin: 0 auto; box-shadow: var(--shadow-card);">
                <div style="display: inline-block; padding: 6px 14px; background: var(--brand-green-light); color: var(--brand-green); border: 1px solid var(--brand-green-border); border-radius: var(--radius-pill); font-size: 0.78rem; font-weight: 700; margin-bottom: 14px;">
                    STEP-BY-STEP ROADMAP
                </div>
                <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-heading); margin-bottom: 12px;">${title}</h2>
                <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px;">
                    The Home page and core architecture foundation (Step 1) are active. This module will be constructed next upon your confirmation.
                </p>
                <a href="#/home" class="btn-primary-hero" style="font-size: 0.88rem; padding: 10px 20px;">&larr; Back to Home</a>
            </div>
        </div>
    `;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
