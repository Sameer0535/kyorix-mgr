// Main Application Controller & View Router
import { store } from './state.js';
import { renderAuthModal } from './components/auth.js';
import { renderAdminPortal } from './components/adminPortal.js';
import { renderDojangPortal } from './components/dojangPortal.js';
import { renderAthletePortal } from './components/athletePortal.js';
import { renderBracketViewer } from './components/bracketViewer.js';
import { renderLiveTatami } from './components/liveTatami.js';
import { showToast } from './utils/helpers.js';

class App {
    constructor() {
        this.currentView = 'admin'; // 'admin', 'dojang', 'athlete', 'brackets', 'tatami'
        this.init();
    }

    init() {
        this.bindEvents();
        this.syncRoleWithView();
        this.render();

        // Subscribe to state updates
        store.subscribe(() => {
            this.updateHeaderUser();
            this.renderCurrentView();
        });
    }

    syncRoleWithView() {
        const user = store.getCurrentUser();
        if (user.role === 'admin') this.currentView = 'admin';
        else if (user.role === 'dojang') this.currentView = 'dojang';
        else if (user.role === 'athlete') this.currentView = 'athlete';
    }

    bindEvents() {
        // Navigation View Tabs
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetView = btn.getAttribute('data-view');
                this.navigate(targetView);
            });
        });

        // Fast Role Switcher Buttons in Top Bar
        document.querySelectorAll('[data-switch-role]').forEach(btn => {
            btn.addEventListener('click', () => {
                const role = btn.getAttribute('data-switch-role');
                store.switchRole(role);
                this.syncRoleWithView();
                this.render();
                showToast(`Switched view to ${role.toUpperCase()} Portal`, 'info');
            });
        });

        // Login / Switch Account Modal Button
        const btnAuthModal = document.getElementById('btn-open-auth');
        if (btnAuthModal) {
            btnAuthModal.addEventListener('click', () => {
                renderAuthModal();
            });
        }

        // Reset Demo Data Button
        const btnReset = document.getElementById('btn-reset-demo');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (confirm('Reset all championship, Dojang, and athlete data to pristine demo state?')) {
                    store.resetToDefault();
                    this.syncRoleWithView();
                    this.render();
                    showToast('Demo data restored successfully!', 'success', 'State Reset');
                }
            });
        }
    }

    navigate(view) {
        this.currentView = view;
        document.querySelectorAll('[data-view]').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-view') === view);
        });
        this.renderCurrentView();
    }

    updateHeaderUser() {
        const user = store.getCurrentUser();
        const userBadge = document.getElementById('header-user-badge');
        const userName = document.getElementById('header-user-name');
        const userRolePill = document.getElementById('header-role-pill');

        if (userName) userName.textContent = user.name || 'Official';
        if (userRolePill) {
            const roleLabels = {
                admin: '<i class="fa-solid fa-crown text-amber-400 me-1"></i>Organization / Admin',
                dojang: '<i class="fa-solid fa-school text-blue-400 me-1"></i>Academy Coach',
                athlete: '<i class="fa-solid fa-user-ninja text-emerald-400 me-1"></i>Athlete'
            };
            userRolePill.innerHTML = roleLabels[user.role] || user.role;
        }

        // Update active quick switcher pill
        document.querySelectorAll('[data-switch-role]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-switch-role') === user.role);
        });
    }

    render() {
        this.updateHeaderUser();
        this.renderCurrentView();
    }

    renderCurrentView() {
        const mainContainer = document.getElementById('main-content');
        if (!mainContainer) return;

        // Highlight active nav item
        document.querySelectorAll('[data-view]').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-view') === this.currentView);
        });

        if (this.currentView === 'admin') {
            renderAdminPortal(mainContainer);
        } else if (this.currentView === 'dojang') {
            renderDojangPortal(mainContainer);
        } else if (this.currentView === 'athlete') {
            renderAthletePortal(mainContainer);
        } else if (this.currentView === 'brackets') {
            renderBracketViewer(mainContainer);
        } else if (this.currentView === 'tatami') {
            renderLiveTatami(mainContainer);
        }
    }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.tkdApp = new App();
});
