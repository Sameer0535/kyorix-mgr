// Academy / School / Dojang Management Portal
import { store } from '../state.js';
import { getBeltBadge, showToast, generateId, calculateAge } from '../utils/helpers.js';
import { TKD_BELTS, AGE_DIVISIONS, DISCIPLINES } from '../tkdConstants.js';

export function renderDojangPortal(container) {
    const user = store.getCurrentUser();
    const dojangs = store.getDojangs();
    const currentDojang = (user.dojangId ? store.getDojang(user.dojangId) : dojangs[0]) || dojangs[0];
    const allAthletes = store.getAthletes();
    const dojangAthletes = allAthletes.filter(a => a.dojangId === currentDojang.id || a.dojangCode === currentDojang.shortCode);
    const tournaments = store.getTournaments();

    container.innerHTML = `
        <div class="dojang-portal space-y-6">
            <!-- Header & Dojang Brand Banner -->
            <div class="bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900/90 p-6 rounded-2xl border border-blue-900/40 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg" style="background-color: ${currentDojang.accentColor || '#3b82f6'}">
                        ${currentDojang.logoText || currentDojang.shortCode}
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="tkd-badge tkd-badge-blue"><i class="fa-solid fa-school me-1"></i>Academy Portal</span>
                            <span class="text-xs text-slate-400 font-mono">${currentDojang.licenseNo || 'Kukkiwon Affiliated'}</span>
                        </div>
                        <h1 class="text-2xl md:text-3xl font-black text-white mt-1">${currentDojang.name}</h1>
                        <p class="text-xs text-slate-400">Head Master: <strong class="text-slate-200">${currentDojang.masterName}</strong> • ${currentDojang.city}, ${currentDojang.state}</p>
                    </div>
                </div>

                <div class="flex flex-wrap gap-2">
                    <button class="tkd-btn tkd-btn-blue" id="btn-add-student">
                        <i class="fa-solid fa-user-plus me-2"></i>Add Student Athlete
                    </button>
                    <button class="tkd-btn tkd-btn-emerald" id="btn-bulk-register">
                        <i class="fa-solid fa-file-signature me-2"></i>Register Athletes to Tournament
                    </button>
                </div>
            </div>

            <!-- Academy Metrics Grid -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="tkd-stat-card">
                    <div class="tkd-stat-icon bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <i class="fa-solid fa-users"></i>
                    </div>
                    <div class="tkd-stat-label">Total Student Athletes</div>
                    <div class="tkd-stat-value text-blue-400">${dojangAthletes.length}</div>
                </div>

                <div class="tkd-stat-card">
                    <div class="tkd-stat-icon bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <i class="fa-solid fa-medal"></i>
                    </div>
                    <div class="tkd-stat-label">Championship Gold</div>
                    <div class="tkd-stat-value text-amber-400">${currentDojang.medals ? currentDojang.medals.gold : 0}</div>
                </div>

                <div class="tkd-stat-card">
                    <div class="tkd-stat-icon bg-slate-500/10 text-slate-300 border border-slate-500/20">
                        <i class="fa-solid fa-medal"></i>
                    </div>
                    <div class="tkd-stat-label">Silver & Bronze Medals</div>
                    <div class="tkd-stat-value text-slate-300">${(currentDojang.medals ? currentDojang.medals.silver + currentDojang.medals.bronze : 0)}</div>
                </div>

                <div class="tkd-stat-card">
                    <div class="tkd-stat-icon bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <i class="fa-solid fa-calendar-check"></i>
                    </div>
                    <div class="tkd-stat-label">Tournament Entries</div>
                    <div class="tkd-stat-value text-emerald-400">${dojangAthletes.filter(a => a.registeredTournaments && a.registeredTournaments.length > 0).length}</div>
                </div>
            </div>

            <!-- Student Athlete Roster -->
            <div class="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div>
                        <h2 class="text-xl font-bold text-white flex items-center gap-2">
                            <i class="fa-solid fa-user-ninja text-blue-400"></i> Academy Athlete Roster (${dojangAthletes.length})
                        </h2>
                        <p class="text-xs text-slate-400">Manage student ranks, weights, Kukkiwon certifications, and tournament assignments.</p>
                    </div>

                    <div class="flex items-center gap-2">
                        <input type="text" class="tkd-input py-1.5 px-3 text-sm max-w-xs" id="search-dojang-roster" placeholder="Search student name...">
                    </div>
                </div>

                <div class="tkd-table-container">
                    <table class="tkd-table">
                        <thead>
                            <tr>
                                <th>Student Athlete</th>
                                <th>Belt Grade / Dan</th>
                                <th>Gender / Age</th>
                                <th>Weight (kg)</th>
                                <th>Kukkiwon #</th>
                                <th>Tournament Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-dojang-roster">
                            ${dojangAthletes.length > 0 ? dojangAthletes.map(a => `
                                <tr>
                                    <td>
                                        <div class="flex items-center gap-2.5">
                                            <div class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm">
                                                ${a.avatar || '<i class="fa-solid fa-user-ninja"></i>'}
                                            </div>
                                            <div>
                                                <div class="font-bold text-white text-sm">${a.name}</div>
                                                <div class="text-xs text-slate-400">${a.weightClass || 'Kyorugi'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${getBeltBadge(a.beltId)}</td>
                                    <td class="text-xs text-slate-300 capitalize">${a.gender} • ${a.age || calculateAge(a.dob)} yrs</td>
                                    <td class="font-mono text-sm font-semibold text-slate-200">${a.weight} kg</td>
                                    <td class="font-mono text-xs text-slate-400">${a.kukkiwonNo || 'KKW-PENDING'}</td>
                                    <td>
                                        <span class="tkd-badge ${a.registeredTournaments && a.registeredTournaments.length > 0 ? 'tkd-badge-green' : 'tkd-badge-slate'} text-xs">
                                            ${a.registeredTournaments && a.registeredTournaments.length > 0 ? 'Entered in Championship' : 'Not Registered'}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="tkd-btn tkd-btn-xs tkd-btn-outline btn-edit-student" data-ath-id="${a.id}">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="7" class="text-center py-8 text-slate-400">
                                        No student athletes registered in this Dojang yet. Click "Add Student Athlete" to begin.
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Academy Match Schedule & Live Queue -->
            <div class="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h3 class="text-lg font-bold text-white flex items-center gap-2">
                            <i class="fa-solid fa-stopwatch text-amber-400"></i> Academy Fight Call & Schedule
                        </h3>
                        <p class="text-xs text-slate-400">Live Tatami call assignments and upcoming bouts for your registered fighters.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${dojangAthletes.filter(a => a.registeredTournaments && a.registeredTournaments.length > 0).map(a => `
                        <div class="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex justify-between items-center">
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="tkd-badge tkd-badge-blue text-xs">Tatami 1</span>
                                    <span class="text-xs font-mono text-amber-400">Match #103 • Approx 11:45 AM</span>
                                </div>
                                <h4 class="text-base font-bold text-white mt-1.5">${a.name}</h4>
                                <div class="text-xs text-slate-400 mt-0.5">
                                    Corner: <strong class="text-blue-400">CHUNG (BLUE)</strong> • ${a.weightClass || 'Featherweight'}
                                </div>
                            </div>
                            <button class="tkd-btn tkd-btn-xs tkd-btn-blue btn-view-draw-link" data-tourn-id="tourn-1">
                                <i class="fa-solid fa-sitemap me-1"></i>View Draw
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Attach Event Handlers
    attachDojangEvents(container, currentDojang);
}

function attachDojangEvents(container, currentDojang) {
    // Add Student Athlete
    const btnAddStudent = container.querySelector('#btn-add-student');
    if (btnAddStudent) {
        btnAddStudent.addEventListener('click', () => {
            openAddStudentModal(container, currentDojang);
        });
    }

    // Bulk Register to Tournament
    const btnBulkRegister = container.querySelector('#btn-bulk-register');
    if (btnBulkRegister) {
        btnBulkRegister.addEventListener('click', () => {
            openBulkTournamentEntryModal(container, currentDojang);
        });
    }

    // Search filter
    const searchInput = container.querySelector('#search-dojang-roster');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const rows = container.querySelectorAll('#tbody-dojang-roster tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    // View Draw Link
    container.querySelectorAll('.btn-view-draw-link').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabBrackets = document.querySelector('[data-view="brackets"]');
            if (tabBrackets) tabBrackets.click();
        });
    });
}

function openAddStudentModal(portalContainer, currentDojang) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
        <div class="tkd-modal-backdrop animate-fade-in" id="add-student-modal">
            <div class="tkd-modal-card max-w-md">
                <div class="tkd-modal-header">
                    <div>
                        <span class="tkd-badge tkd-badge-blue mb-1"><i class="fa-solid fa-user-plus me-1"></i>Roster Entry</span>
                        <h3 class="text-xl font-bold text-white">Add Student Athlete</h3>
                    </div>
                    <button class="tkd-modal-close" id="btn-close-add-student">&times;</button>
                </div>
                
                <form id="form-new-student" class="tkd-modal-body space-y-4">
                    <div>
                        <label class="tkd-label">Athlete Full Name</label>
                        <input type="text" class="tkd-input" id="sa-name" placeholder="e.g. Lucas Oliveira" required>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="tkd-label">Gender</label>
                            <select class="tkd-select" id="sa-gender">
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label class="tkd-label">Date of Birth</label>
                            <input type="date" class="tkd-input" id="sa-dob" value="2009-08-14" required>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="tkd-label">Current Belt Rank</label>
                            <select class="tkd-select" id="sa-belt">
                                ${TKD_BELTS.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="tkd-label">Weight in kg</label>
                            <input type="number" step="0.1" class="tkd-input" id="sa-weight" placeholder="53.5" required>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="tkd-label">Kukkiwon Certificate #</label>
                            <input type="text" class="tkd-input" id="sa-kkw" placeholder="KKW-0988112">
                        </div>
                        <div>
                            <label class="tkd-label">Discipline</label>
                            <select class="tkd-select" id="sa-discipline">
                                <option value="kyorugi">Kyorugi (Sparring)</option>
                                <option value="poomsae">Poomsae (Forms)</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex justify-end gap-2 pt-2">
                        <button type="button" class="tkd-btn tkd-btn-outline" id="btn-cancel-add-student">Cancel</button>
                        <button type="submit" class="tkd-btn tkd-btn-blue">
                            <i class="fa-solid fa-plus-circle me-1"></i>Save to Roster
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const form = document.getElementById('form-new-student');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('sa-name').value;
        const gender = document.getElementById('sa-gender').value;
        const dob = document.getElementById('sa-dob').value;
        const beltId = document.getElementById('sa-belt').value;
        const weight = parseFloat(document.getElementById('sa-weight').value);
        const kukkiwonNo = document.getElementById('sa-kkw').value || 'KKW-PENDING';
        const discipline = document.getElementById('sa-discipline').value;
        const belt = TKD_BELTS.find(b => b.id === beltId) || TKD_BELTS[0];

        store.addAthlete({
            name,
            gender,
            dob,
            age: calculateAge(dob),
            beltId,
            beltName: belt.name,
            weight,
            weightClass: `${discipline === 'kyorugi' ? 'Kyorugi' : 'Poomsae'} (${weight} kg)`,
            discipline,
            dojangId: currentDojang.id,
            dojangName: currentDojang.name,
            dojangCode: currentDojang.shortCode,
            kukkiwonNo
        });

        modalContainer.innerHTML = '';
        renderDojangPortal(portalContainer);
        showToast(`${name} added to ${currentDojang.name} roster!`, 'success', 'Athlete Enrolled');
    });

    document.getElementById('btn-close-add-student').addEventListener('click', () => { modalContainer.innerHTML = ''; });
    document.getElementById('btn-cancel-add-student').addEventListener('click', () => { modalContainer.innerHTML = ''; });
}

function openBulkTournamentEntryModal(portalContainer, currentDojang) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const tournaments = store.getTournaments();
    const allAthletes = store.getAthletes();
    const dojangAthletes = allAthletes.filter(a => a.dojangId === currentDojang.id || a.dojangCode === currentDojang.shortCode);

    modalContainer.innerHTML = `
        <div class="tkd-modal-backdrop animate-fade-in" id="bulk-entry-modal">
            <div class="tkd-modal-card max-w-2xl">
                <div class="tkd-modal-header">
                    <div>
                        <span class="tkd-badge tkd-badge-emerald mb-1"><i class="fa-solid fa-file-signature me-1"></i>Team Registration</span>
                        <h3 class="text-xl font-bold text-white">Register Academy Athletes for Championship</h3>
                    </div>
                    <button class="tkd-modal-close" id="btn-close-bulk-entry">&times;</button>
                </div>
                
                <form id="form-bulk-entry" class="tkd-modal-body space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label class="tkd-label">Target Championship</label>
                            <select class="tkd-select" id="entry-tournament">
                                ${tournaments.map(t => `<option value="${t.id}">${t.title}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="tkd-label">Select Division / Category</label>
                            <select class="tkd-select" id="entry-category">
                                <!-- Populated dynamically based on chosen tournament -->
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="tkd-label flex justify-between items-center">
                            <span>Select Student Athletes to Register:</span>
                            <span class="text-xs text-slate-400 font-normal">Checkmark all eligible students</span>
                        </label>

                        <div class="space-y-2 max-h-[260px] overflow-y-auto pr-1" id="athlete-checkbox-list">
                            ${dojangAthletes.map(a => `
                                <label class="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-700 cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <input type="checkbox" class="w-4 h-4 rounded text-blue-600 focus:ring-0 ath-checkbox" value="${a.id}">
                                        <div>
                                            <div class="font-bold text-white text-sm">${a.name}</div>
                                            <div class="text-xs text-slate-400">${a.gender} • ${a.weight} kg • ${a.beltName}</div>
                                        </div>
                                    </div>
                                    <span class="tkd-badge tkd-badge-slate text-xs">${a.status}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
                        <i class="fa-solid fa-circle-check me-1"></i> Entries will be automatically linked to your Dojang code (${currentDojang.shortCode}) and assigned to the championship draw.
                    </div>

                    <div class="flex justify-end gap-2 pt-2">
                        <button type="button" class="tkd-btn tkd-btn-outline" id="btn-cancel-bulk-entry">Cancel</button>
                        <button type="submit" class="tkd-btn tkd-btn-emerald">
                            <i class="fa-solid fa-paper-plane me-1"></i>Submit Academy Batch Entry
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Populate categories based on selected tournament
    const tournSelect = document.getElementById('entry-tournament');
    const catSelect = document.getElementById('entry-category');

    const updateCategories = () => {
        const tId = tournSelect.value;
        const tourn = tournaments.find(t => t.id === tId);
        if (tourn && tourn.categories) {
            catSelect.innerHTML = tourn.categories.map(c => `<option value="${c.id}">${c.title} (${c.ring || 'Tatami 1'})</option>`).join('');
        }
    };

    tournSelect.addEventListener('change', updateCategories);
    updateCategories();

    // Form submit
    const form = document.getElementById('form-bulk-entry');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const tournId = tournSelect.value;
        const catId = catSelect.value;
        const checkedAthletes = Array.from(modalContainer.querySelectorAll('.ath-checkbox:checked')).map(cb => cb.value);

        if (checkedAthletes.length === 0) {
            showToast('Please select at least one athlete to register.', 'warning');
            return;
        }

        checkedAthletes.forEach(athId => {
            store.registerAthleteForTournament(athId, tournId, catId);
        });

        modalContainer.innerHTML = '';
        renderDojangPortal(portalContainer);
        showToast(`Successfully registered ${checkedAthletes.length} athlete(s) for the championship!`, 'success', 'Batch Entry Confirmed');
    });

    document.getElementById('btn-close-bulk-entry').addEventListener('click', () => { modalContainer.innerHTML = ''; });
    document.getElementById('btn-cancel-bulk-entry').addEventListener('click', () => { modalContainer.innerHTML = ''; });
}
