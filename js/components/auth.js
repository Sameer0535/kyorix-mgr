// Authentication, Role Switcher, and Multi-Role Login/Registration Modal
import { store } from '../state.js';
import { showToast, generateId } from '../utils/helpers.js';
import { TKD_BELTS, AGE_DIVISIONS } from '../tkdConstants.js';

export function renderAuthModal() {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
        <div class="tkd-modal-backdrop animate-fade-in" id="auth-modal">
            <div class="tkd-modal-card max-w-md">
                <div class="tkd-modal-header">
                    <div>
                        <div class="tkd-badge tkd-badge-blue mb-1"><i class="fa-solid fa-shield-halved me-1"></i>Portal Access</div>
                        <h3 class="text-xl font-bold text-white">Select Portal & Account</h3>
                    </div>
                    <button class="tkd-modal-close" id="btn-close-auth">&times;</button>
                </div>
                
                <div class="tkd-modal-body">
                    <!-- Role Navigation Tabs -->
                    <div class="tkd-tabs mb-4">
                        <button class="tkd-tab active" data-role-tab="admin">
                            <i class="fa-solid fa-crown me-1 text-amber-400"></i>Admin / Org
                        </button>
                        <button class="tkd-tab" data-role-tab="dojang">
                            <i class="fa-solid fa-school me-1 text-blue-400"></i>Academy / Dojang
                        </button>
                        <button class="tkd-tab" data-role-tab="athlete">
                            <i class="fa-solid fa-user-ninja me-1 text-emerald-400"></i>Athlete
                        </button>
                    </div>

                    <!-- Mode Toggle (Login vs Register) -->
                    <div class="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg mb-4 border border-slate-800">
                        <span class="text-xs text-slate-400 font-medium" id="auth-mode-label">Existing Account</span>
                        <div class="flex gap-1">
                            <button class="tkd-btn-pill active" id="tab-mode-login">Login</button>
                            <button class="tkd-btn-pill" id="tab-mode-register">Register New</button>
                        </div>
                    </div>

                    <!-- Form Containers -->
                    <div id="auth-form-container">
                        <!-- Dynamic Role Form injected here -->
                    </div>
                </div>
            </div>
        </div>
    `;

    let currentRole = 'admin';
    let currentMode = 'login';

    const renderRoleForm = () => {
        const container = document.getElementById('auth-form-container');
        if (!container) return;

        if (currentRole === 'admin') {
            if (currentMode === 'login') {
                container.innerHTML = `
                    <form id="form-admin-login" class="space-y-3">
                        <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
                            <i class="fa-solid fa-circle-info me-1"></i> Admin portal has full authority over championships, categories, brackets, rings & match scoring.
                        </div>
                        <div>
                            <label class="tkd-label">Admin / Official Email</label>
                            <input type="email" class="tkd-input" id="admin-email" value="director@tkdarena.org" required>
                        </div>
                        <div>
                            <label class="tkd-label">Security Passcode</label>
                            <input type="password" class="tkd-input" id="admin-password" value="admin123" required>
                        </div>
                        <button type="submit" class="tkd-btn tkd-btn-amber w-full mt-4">
                            <i class="fa-solid fa-right-to-bracket me-2"></i>Access Admin Portal
                        </button>
                    </form>
                `;
            } else {
                container.innerHTML = `
                    <form id="form-admin-register" class="space-y-3">
                        <div>
                            <label class="tkd-label">Organization Name</label>
                            <input type="text" class="tkd-input" id="org-name" placeholder="e.g. State Taekwondo Association" required>
                        </div>
                        <div>
                            <label class="tkd-label">Director / Official Full Name</label>
                            <input type="text" class="tkd-input" id="admin-name" placeholder="e.g. Master John Wick" required>
                        </div>
                        <div>
                            <label class="tkd-label">Official Email</label>
                            <input type="email" class="tkd-input" id="admin-reg-email" placeholder="admin@association.org" required>
                        </div>
                        <button type="submit" class="tkd-btn tkd-btn-amber w-full mt-4">
                            <i class="fa-solid fa-plus-circle me-2"></i>Register Organization
                        </button>
                    </form>
                `;
            }
        } else if (currentRole === 'dojang') {
            const dojangs = store.getDojangs();
            if (currentMode === 'login') {
                container.innerHTML = `
                    <form id="form-dojang-login" class="space-y-3">
                        <div>
                            <label class="tkd-label">Select Registered Academy / Dojang</label>
                            <select class="tkd-select" id="dojang-select">
                                ${dojangs.map(d => `<option value="${d.id}">${d.name} (${d.shortCode}) - ${d.masterName}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="tkd-label">Master / Coach Password</label>
                            <input type="password" class="tkd-input" id="dojang-password" value="dojang123" required>
                        </div>
                        <button type="submit" class="tkd-btn tkd-btn-blue w-full mt-4">
                            <i class="fa-solid fa-school me-2"></i>Login as Academy Coach
                        </button>
                    </form>
                `;
            } else {
                container.innerHTML = `
                    <form id="form-dojang-register" class="space-y-3">
                        <div>
                            <label class="tkd-label">Academy / School / Dojang Name</label>
                            <input type="text" class="tkd-input" id="reg-dojang-name" placeholder="e.g. Tiger Claws Martial Arts" required>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="tkd-label">Short Code (3-5 letters)</label>
                                <input type="text" class="tkd-input uppercase" id="reg-dojang-code" placeholder="TCMA" maxlength="5" required>
                            </div>
                            <div>
                                <label class="tkd-label">Head Master Name</label>
                                <input type="text" class="tkd-input" id="reg-dojang-master" placeholder="Master Alex Chen" required>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="tkd-label">Kukkiwon License #</label>
                                <input type="text" class="tkd-input" id="reg-dojang-license" placeholder="KUK-2026-XXXX">
                            </div>
                            <div>
                                <label class="tkd-label">City, State</label>
                                <input type="text" class="tkd-input" id="reg-dojang-city" placeholder="San Jose, CA" required>
                            </div>
                        </div>
                        <div>
                            <label class="tkd-label">Contact Email</label>
                            <input type="email" class="tkd-input" id="reg-dojang-email" placeholder="coach@tigerclaws.com" required>
                        </div>
                        <button type="submit" class="tkd-btn tkd-btn-blue w-full mt-4">
                            <i class="fa-solid fa-plus-circle me-2"></i>Register Dojang / School
                        </button>
                    </form>
                `;
            }
        } else if (currentRole === 'athlete') {
            const athletes = store.getAthletes();
            const dojangs = store.getDojangs();

            if (currentMode === 'login') {
                container.innerHTML = `
                    <form id="form-athlete-login" class="space-y-3">
                        <div>
                            <label class="tkd-label">Select Registered Athlete</label>
                            <select class="tkd-select" id="athlete-select">
                                ${athletes.map(a => `<option value="${a.id}">${a.name} (${a.beltName}) - ${a.dojangCode || 'Dojang'}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="tkd-label">Athlete Passcode / PIN</label>
                            <input type="password" class="tkd-input" id="athlete-password" value="1234" required>
                        </div>
                        <button type="submit" class="tkd-btn tkd-btn-emerald w-full mt-4">
                            <i class="fa-solid fa-user-ninja me-2"></i>Access Athlete Portal
                        </button>
                    </form>
                `;
            } else {
                container.innerHTML = `
                    <form id="form-athlete-register" class="space-y-3">
                        <div>
                            <label class="tkd-label">Full Name</label>
                            <input type="text" class="tkd-input" id="reg-ath-name" placeholder="e.g. Min-Ji Song" required>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="tkd-label">Gender</label>
                                <select class="tkd-select" id="reg-ath-gender">
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label class="tkd-label">Date of Birth</label>
                                <input type="date" class="tkd-input" id="reg-ath-dob" value="2009-05-15" required>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="tkd-label">Current Belt</label>
                                <select class="tkd-select" id="reg-ath-belt">
                                    ${TKD_BELTS.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="tkd-label">Weight (kg)</label>
                                <input type="number" step="0.1" class="tkd-input" id="reg-ath-weight" placeholder="54.5" required>
                            </div>
                        </div>
                        <div>
                            <label class="tkd-label">Affiliated Academy / Dojang</label>
                            <select class="tkd-select" id="reg-ath-dojang">
                                ${dojangs.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                            </select>
                        </div>
                        <button type="submit" class="tkd-btn tkd-btn-emerald w-full mt-4">
                            <i class="fa-solid fa-plus-circle me-2"></i>Create Athlete Account
                        </button>
                    </form>
                `;
            }
        }

        // Attach submit listeners
        attachFormListeners();
    };

    const attachFormListeners = () => {
        // Admin Login
        const fAdminLogin = document.getElementById('form-admin-login');
        if (fAdminLogin) {
            fAdminLogin.addEventListener('submit', (e) => {
                e.preventDefault();
                store.switchRole('admin');
                closeModal();
                showToast('Welcome to Super Admin / Organization Master Portal', 'success', 'Admin Logged In');
            });
        }

        // Admin Register
        const fAdminReg = document.getElementById('form-admin-register');
        if (fAdminReg) {
            fAdminReg.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('admin-name').value;
                const org = document.getElementById('org-name').value;
                const email = document.getElementById('admin-reg-email').value;
                store.setCurrentUser({
                    role: 'admin',
                    name,
                    email,
                    organization: org,
                    id: generateId('admin')
                });
                closeModal();
                showToast(`Organization "${org}" registered successfully!`, 'success', 'Admin Access Granted');
            });
        }

        // Dojang Login
        const fDojangLogin = document.getElementById('form-dojang-login');
        if (fDojangLogin) {
            fDojangLogin.addEventListener('submit', (e) => {
                e.preventDefault();
                const dojangId = document.getElementById('dojang-select').value;
                store.switchRole('dojang', dojangId);
                closeModal();
                const user = store.getCurrentUser();
                showToast(`Logged into ${user.dojangName}`, 'success', 'Academy Portal');
            });
        }

        // Dojang Register
        const fDojangReg = document.getElementById('form-dojang-register');
        if (fDojangReg) {
            fDojangReg.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('reg-dojang-name').value;
                const shortCode = document.getElementById('reg-dojang-code').value.toUpperCase();
                const masterName = document.getElementById('reg-dojang-master').value;
                const licenseNo = document.getElementById('reg-dojang-license').value || 'KUK-PENDING';
                const city = document.getElementById('reg-dojang-city').value;
                const email = document.getElementById('reg-dojang-email').value;

                const newDojang = store.addDojang({
                    name,
                    shortCode,
                    masterName,
                    licenseNo,
                    city,
                    email
                });

                store.switchRole('dojang', newDojang.id);
                closeModal();
                showToast(`Academy "${name}" successfully registered!`, 'success', 'Dojang Registered');
            });
        }

        // Athlete Login
        const fAthLogin = document.getElementById('form-athlete-login');
        if (fAthLogin) {
            fAthLogin.addEventListener('submit', (e) => {
                e.preventDefault();
                const athId = document.getElementById('athlete-select').value;
                store.switchRole('athlete', athId);
                closeModal();
                const user = store.getCurrentUser();
                showToast(`Welcome ${user.name}! Accessing competitor pass...`, 'success', 'Athlete Logged In');
            });
        }

        // Athlete Register
        const fAthReg = document.getElementById('form-athlete-register');
        if (fAthReg) {
            fAthReg.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('reg-ath-name').value;
                const gender = document.getElementById('reg-ath-gender').value;
                const dob = document.getElementById('reg-ath-dob').value;
                const beltId = document.getElementById('reg-ath-belt').value;
                const weight = parseFloat(document.getElementById('reg-ath-weight').value);
                const dojangId = document.getElementById('reg-ath-dojang').value;
                const dojang = store.getDojang(dojangId);
                const belt = TKD_BELTS.find(b => b.id === beltId) || TKD_BELTS[0];

                const newAthlete = store.addAthlete({
                    name,
                    gender,
                    dob,
                    beltId,
                    beltName: belt.name,
                    weight,
                    division: 'junior',
                    weightClass: `${weight} kg`,
                    dojangId,
                    dojangName: dojang ? dojang.name : 'Independent',
                    dojangCode: dojang ? dojang.shortCode : 'IND',
                    kukkiwonNo: 'KKW-PENDING'
                });

                store.switchRole('athlete', newAthlete.id);
                closeModal();
                showToast(`Athlete profile for ${name} created!`, 'success', 'Registration Complete');
            });
        }
    };

    // Role Tab Switching
    modalContainer.querySelectorAll('[data-role-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            modalContainer.querySelectorAll('[data-role-tab]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRole = btn.getAttribute('data-role-tab');
            renderRoleForm();
        });
    });

    // Mode Toggle (Login vs Register)
    const btnLoginMode = document.getElementById('tab-mode-login');
    const btnRegMode = document.getElementById('tab-mode-register');
    const lblMode = document.getElementById('auth-mode-label');

    btnLoginMode.addEventListener('click', () => {
        btnLoginMode.classList.add('active');
        btnRegMode.classList.remove('active');
        currentMode = 'login';
        lblMode.textContent = 'Existing Account';
        renderRoleForm();
    });

    btnRegMode.addEventListener('click', () => {
        btnRegMode.classList.add('active');
        btnLoginMode.classList.remove('active');
        currentMode = 'register';
        lblMode.textContent = 'New Registration';
        renderRoleForm();
    });

    // Close Modal
    const closeModal = () => {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.add('animate-fade-out');
            setTimeout(() => { modalContainer.innerHTML = ''; }, 200);
        }
    };

    document.getElementById('btn-close-auth').addEventListener('click', closeModal);

    // Initial render
    renderRoleForm();
}
