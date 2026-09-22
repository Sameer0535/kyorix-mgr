// Admin & Tournament Organization Management Portal
import { store } from '../state.js';
import { getBeltBadge, showToast, generateId } from '../utils/helpers.js';
import { AGE_DIVISIONS, DISCIPLINES, WEIGHT_DIVISIONS, TKD_BELTS } from '../tkdConstants.js';
import { openScorekeeperModal } from './scorekeeper.js';

export function renderAdminPortal(container) {
    const user = store.getCurrentUser();
    const tournaments = store.getTournaments();
    const dojangs = store.getDojangs();
    const athletes = store.getAthletes();
    const draws = store.getDraws();

    const selectedTournId = container.dataset.selectedTournId || (tournaments[0] ? tournaments[0].id : null);
    const currentTourn = tournaments.find(t => t.id === selectedTournId) || tournaments[0] || null;

    container.innerHTML = `
        <div class="admin-portal space-y-6">
            <!-- Header & Action Bar -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="tkd-badge tkd-badge-amber"><i class="fa-solid fa-crown me-1"></i>Master Control</span>
                        <span class="text-xs text-slate-400 font-mono">${user.organization || 'Organization Hub'}</span>
                    </div>
                    <h1 class="text-2xl md:text-3xl font-black text-white mt-1">Tournament Director & Admin Portal</h1>
                    <p class="text-sm text-slate-400">Manage championships, configure Kyorugi & Poomsae categories, generate tournament brackets, and officiate live Tatami rings.</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button class="tkd-btn tkd-btn-amber" id="btn-create-tourn">
                        <i class="fa-solid fa-plus-circle me-2"></i>Create Championship
                    </button>
                    <button class="tkd-btn tkd-btn-outline" id="btn-manage-weighin">
                        <i class="fa-solid fa-scale-balanced me-2"></i>Weigh-In Desk
                    </button>
                </div>
            </div>

            <!-- Key Metrics Grid -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="tkd-stat-card">
                    <div class="tkd-stat-icon bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <i class="fa-solid fa-trophy"></i>
                    </div>
                    <div class="tkd-stat-label">Total Championships</div>
                    <div class="tkd-stat-value text-blue-400">${tournaments.length}</div>
                </div>

                <div class="tkd-stat-card">
                    <div class="tkd-stat-icon bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <i class="fa-solid fa-school"></i>
                    </div>
                    <div class="tkd-stat-label">Affiliated Academies</div>
                    <div class="tkd-stat-value text-emerald-400">${dojangs.length}</div>
                </div>

                <div class="tkd-stat-card">
                    <div class="tkd-stat-icon bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <i class="fa-solid fa-user-ninja"></i>
                    </div>
                    <div class="tkd-stat-label">Registered Athletes</div>
                    <div class="tkd-stat-value text-purple-400">${athletes.length}</div>
                </div>

                <div class="tkd-stat-card">
                    <div class="tkd-stat-icon bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <i class="fa-solid fa-sitemap"></i>
                    </div>
                    <div class="tkd-stat-label">Active Brackets / Draws</div>
                    <div class="tkd-stat-value text-amber-400">${Object.keys(draws).length}</div>
                </div>
            </div>

            <!-- Tournament Selection & Management -->
            <div class="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div>
                        <h2 class="text-xl font-bold text-white flex items-center gap-2">
                            <i class="fa-solid fa-shield-halved text-amber-400"></i> Active Championship Control
                        </h2>
                        <p class="text-xs text-slate-400">Select a championship to configure categories, assign Tatami rings, and build draws.</p>
                    </div>

                    <div class="flex items-center gap-2">
                        <label class="text-xs text-slate-400 font-medium">Select Championship:</label>
                        <select class="tkd-select py-1.5 px-3 text-sm min-w-[240px]" id="select-active-tournament">
                            ${tournaments.map(t => `<option value="${t.id}" ${currentTourn && currentTourn.id === t.id ? 'selected' : ''}>${t.title}</option>`).join('')}
                        </select>
                    </div>
                </div>

                ${currentTourn ? `
                    <div class="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-6 flex flex-col md:flex-row justify-between gap-4">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="tkd-badge tkd-badge-green">${currentTourn.status}</span>
                                <span class="text-xs text-slate-400"><i class="fa-solid fa-calendar me-1"></i>${currentTourn.dates}</span>
                                <span class="text-xs text-slate-400"><i class="fa-solid fa-location-dot me-1"></i>${currentTourn.venue}, ${currentTourn.city}</span>
                            </div>
                            <h3 class="text-lg font-bold text-white mt-1">${currentTourn.title}</h3>
                            <div class="text-xs text-amber-400/90 mt-0.5"><i class="fa-solid fa-award me-1"></i>${currentTourn.sanction}</div>
                        </div>
                        <div class="flex items-center gap-3">
                            <button class="tkd-btn tkd-btn-sm tkd-btn-blue" id="btn-add-category">
                                <i class="fa-solid fa-layer-group me-1"></i>Add Category / Division
                            </button>
                        </div>
                    </div>

                    <!-- Categories Matrix & Brackets -->
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <h3 class="text-md font-bold text-white uppercase tracking-wider text-xs">
                                Championship Divisions & Draws (${(currentTourn.categories || []).length})
                            </h3>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${(currentTourn.categories || []).map(cat => {
                                const hasDraw = !!draws[cat.id];
                                return `
                                    <div class="tkd-card p-4 flex flex-col justify-between border-slate-800 hover:border-slate-700 transition">
                                        <div>
                                            <div class="flex justify-between items-start gap-2">
                                                <div>
                                                    <span class="tkd-badge ${cat.discipline === 'kyorugi' ? 'tkd-badge-blue' : 'tkd-badge-purple'} text-xs">
                                                        <i class="fa-solid ${cat.discipline === 'kyorugi' ? 'fa-fist-raised' : 'fa-person-walking'} me-1"></i>
                                                        ${cat.discipline === 'kyorugi' ? 'Kyorugi (Sparring)' : 'Poomsae (Forms)'}
                                                    </span>
                                                    <span class="tkd-badge tkd-badge-slate text-xs ml-1">${cat.ring || 'Tatami 1'}</span>
                                                </div>
                                                <span class="text-xs font-semibold ${hasDraw ? 'text-emerald-400' : 'text-amber-400'}">
                                                    <i class="fa-solid ${hasDraw ? 'fa-check-circle' : 'fa-clock'} me-1"></i>
                                                    ${hasDraw ? 'Draw Generated' : 'Draw Pending'}
                                                </span>
                                            </div>

                                            <h4 class="text-base font-bold text-slate-900 mt-2">${cat.title}</h4>
                                            <div class="text-xs text-slate-600 mt-1 flex flex-wrap gap-3">
                                                <span><i class="fa-solid fa-weight-scale me-1 text-blue-600"></i>${cat.weightLabel || 'Open'}</span>
                                                <span><i class="fa-solid fa-ribbon me-1 text-blue-600"></i>${cat.beltGroup || 'All Belts'}</span>
                                                <span><i class="fa-solid fa-stopwatch me-1 text-blue-600"></i>${cat.roundsCount} Rounds (${cat.roundDurationSeconds}s)</span>
                                            </div>
                                        </div>

                                        <div class="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center gap-2">
                                            ${hasDraw ? `
                                                <button class="tkd-btn tkd-btn-xs tkd-btn-blue btn-view-bracket" data-cat-id="${cat.id}">
                                                    <i class="fa-solid fa-sitemap me-1"></i>View / Edit Draw
                                                </button>
                                                <button class="tkd-btn tkd-btn-xs tkd-btn-emerald btn-open-referee" data-cat-id="${cat.id}">
                                                    <i class="fa-solid fa-gamepad me-1"></i>Scorekeeper Console
                                                </button>
                                            ` : `
                                                <button class="tkd-btn tkd-btn-xs tkd-btn-amber btn-generate-draw" data-cat-id="${cat.id}">
                                                    <i class="fa-solid fa-wand-magic-sparkles me-1"></i>Auto-Generate Draw (Seeds)
                                                </button>
                                                <span class="text-xs text-slate-600">Awaiting Seeds</span>
                                            `}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="text-center py-12 text-slate-600">
                        <i class="fa-solid fa-trophy text-4xl text-blue-600 mb-3"></i>
                        <p>No championships created yet. Click "Create Championship" to start.</p>
                    </div>
                `}
            </div>

            <!-- Affiliated Dojangs & Athletes Overview -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Dojangs Roster -->
                <div class="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-md font-bold text-white flex items-center gap-2">
                            <i class="fa-solid fa-school text-emerald-400"></i> Affiliated Dojangs (${dojangs.length})
                        </h3>
                        <span class="text-xs text-slate-400">Kukkiwon Verified</span>
                    </div>
                    <div class="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                        ${dojangs.map(d => `
                            <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex justify-between items-center hover:border-slate-700 transition">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm" style="background-color: ${d.accentColor || '#3b82f6'}">
                                        ${d.logoText || d.shortCode}
                                    </div>
                                    <div>
                                        <div class="font-bold text-white text-sm">${d.name} <span class="text-xs text-slate-400 font-mono">(${d.shortCode})</span></div>
                                        <div class="text-xs text-slate-400">${d.masterName} • ${d.city}, ${d.state}</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-xs font-semibold text-emerald-400">${d.athletesCount || 0} Athletes</div>
                                    <div class="text-xs text-slate-400"><i class="fa-solid fa-award text-amber-400 me-1"></i>${d.medals ? d.medals.gold : 0} Gold</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Recent Registered Athletes -->
                <div class="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-md font-bold text-white flex items-center gap-2">
                            <i class="fa-solid fa-user-ninja text-purple-400"></i> Competitor Roster (${athletes.length})
                        </h3>
                        <span class="text-xs text-slate-400">Live Entries</span>
                    </div>
                    <div class="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                        ${athletes.slice(0, 8).map(a => `
                            <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex justify-between items-center hover:border-slate-700 transition">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm">
                                        ${a.avatar || '<i class="fa-solid fa-user-ninja"></i>'}
                                    </div>
                                    <div>
                                        <div class="font-bold text-white text-sm flex items-center gap-1.5">
                                            ${a.name}
                                            ${getBeltBadge(a.beltId, 'scale-90')}
                                        </div>
                                        <div class="text-xs text-slate-400">${a.dojangName || a.dojangCode} • ${a.weight} kg (${a.weightClass || 'Kyorugi'})</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="tkd-badge ${a.status.includes('Passed') ? 'tkd-badge-green' : 'tkd-badge-slate'} text-xs">
                                        ${a.status}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Attach Event Listeners
    attachAdminEvents(container, currentTourn);
}

function attachAdminEvents(container, currentTourn) {
    // Tournament Switcher
    const selectTourn = container.querySelector('#select-active-tournament');
    if (selectTourn) {
        selectTourn.addEventListener('change', (e) => {
            container.dataset.selectedTournId = e.target.value;
            renderAdminPortal(container);
        });
    }

    // Create Tournament Modal Button
    const btnCreateTourn = container.querySelector('#btn-create-tourn');
    if (btnCreateTourn) {
        btnCreateTourn.addEventListener('click', () => {
            openCreateTournamentModal(container);
        });
    }

    // Add Category Button
    const btnAddCategory = container.querySelector('#btn-add-category');
    if (btnAddCategory && currentTourn) {
        btnAddCategory.addEventListener('click', () => {
            openAddCategoryModal(container, currentTourn);
        });
    }

    // Weigh-In Desk Button
    const btnWeighIn = container.querySelector('#btn-manage-weighin');
    if (btnWeighIn) {
        btnWeighIn.addEventListener('click', () => {
            openWeighInModal(container);
        });
    }

    // Generate Draw Buttons
    container.querySelectorAll('.btn-generate-draw').forEach(btn => {
        btn.addEventListener('click', () => {
            const catId = btn.getAttribute('data-cat-id');
            const draw = store.generateCategoryDraw(catId);
            if (draw) {
                showToast(`Knockout Draw generated with ${draw.rounds[0].matches.length * 2} seeded slots!`, 'success', 'Draw Generated');
                renderAdminPortal(container);
            } else {
                showToast('Unable to generate draw. Ensure athletes are registered for this category.', 'error');
            }
        });
    });

    // View Bracket Buttons
    container.querySelectorAll('.btn-view-bracket').forEach(btn => {
        btn.addEventListener('click', () => {
            const catId = btn.getAttribute('data-cat-id');
            // Trigger navigation to bracket view tab
            const tabBrackets = document.querySelector('[data-view="brackets"]');
            if (tabBrackets) {
                tabBrackets.click();
                setTimeout(() => {
                    const drawSelect = document.getElementById('select-bracket-category');
                    if (drawSelect) {
                        drawSelect.value = catId;
                        drawSelect.dispatchEvent(new Event('change'));
                    }
                }, 100);
            }
        });
    });

    // Scorekeeper Console Buttons
    container.querySelectorAll('.btn-open-referee').forEach(btn => {
        btn.addEventListener('click', () => {
            const catId = btn.getAttribute('data-cat-id');
            const draw = store.getDraw(catId);
            if (draw && draw.rounds.length > 0) {
                const activeMatch = draw.rounds[0].matches.find(m => m.status === 'LIVE') || draw.rounds[0].matches[0];
                openScorekeeperModal(catId, activeMatch.matchId || activeMatch.matchNumber);
            }
        });
    });
}

function openCreateTournamentModal(portalContainer) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
        <div class="tkd-modal-backdrop animate-fade-in" id="create-tourn-modal">
            <div class="tkd-modal-card max-w-lg">
                <div class="tkd-modal-header">
                    <div>
                        <span class="tkd-badge tkd-badge-amber mb-1"><i class="fa-solid fa-trophy me-1"></i>New Championship</span>
                        <h3 class="text-xl font-bold text-white">Create Taekwondo Championship</h3>
                    </div>
                    <button class="tkd-modal-close" id="btn-close-create-tourn">&times;</button>
                </div>
                
                <form id="form-new-championship" class="tkd-modal-body space-y-4">
                    <div>
                        <label class="tkd-label">Championship Title</label>
                        <input type="text" class="tkd-input" id="ct-title" placeholder="e.g. 2026 National Taekwondo Grand Prix" required>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="tkd-label">Sanctioning Body</label>
                            <input type="text" class="tkd-input" id="ct-sanction" value="World Taekwondo / National Fed" required>
                        </div>
                        <div>
                            <label class="tkd-label">Active Tatami / Rings</label>
                            <input type="number" class="tkd-input" id="ct-rings" value="4" min="1" max="8" required>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="tkd-label">Dates</label>
                            <input type="text" class="tkd-input" id="ct-dates" placeholder="Nov 14 - Nov 16, 2026" required>
                        </div>
                        <div>
                            <label class="tkd-label">Venue & City</label>
                            <input type="text" class="tkd-input" id="ct-venue" placeholder="Arena Hall, San Jose, CA" required>
                        </div>
                    </div>

                    <div class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300">
                        <i class="fa-solid fa-circle-info me-1"></i> Default Kyorugi (Sparring) and Recognized Poomsae divisions will be automatically seeded. You can customize divisions right after creation.
                    </div>

                    <div class="flex justify-end gap-2 pt-2">
                        <button type="button" class="tkd-btn tkd-btn-outline" id="btn-cancel-create-tourn">Cancel</button>
                        <button type="submit" class="tkd-btn tkd-btn-amber">
                            <i class="fa-solid fa-check-circle me-2"></i>Publish Championship
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const form = document.getElementById('form-new-championship');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('ct-title').value;
        const sanction = document.getElementById('ct-sanction').value;
        const activeRings = parseInt(document.getElementById('ct-rings').value);
        const dates = document.getElementById('ct-dates').value;
        const venue = document.getElementById('ct-venue').value;

        const newTourn = store.addTournament({
            title,
            sanction,
            activeRings,
            dates,
            venue,
            city: venue.includes(',') ? venue.split(',')[1].trim() : 'Metro Arena',
            categories: [
                {
                    id: generateId('cat'),
                    title: 'Junior Male Kyorugi Featherweight (-55kg)',
                    division: 'junior',
                    gender: 'male',
                    discipline: 'kyorugi',
                    weightLabel: '-55 kg',
                    beltGroup: 'Black & Red Belts',
                    ring: 'Tatami 1',
                    roundsCount: 3,
                    roundDurationSeconds: 120,
                    drawSize: 4,
                    status: 'Registration Open'
                },
                {
                    id: generateId('cat'),
                    title: 'Senior Female Recognized Poomsae Individual',
                    division: 'senior',
                    gender: 'female',
                    discipline: 'poomsae',
                    weightLabel: 'Open',
                    beltGroup: 'Black Belt (Dan 1+)',
                    ring: 'Tatami 2',
                    roundsCount: 2,
                    roundDurationSeconds: 90,
                    drawSize: 4,
                    status: 'Registration Open'
                }
            ]
        });

        modalContainer.innerHTML = '';
        portalContainer.dataset.selectedTournId = newTourn.id;
        renderAdminPortal(portalContainer);
        showToast(`Championship "${title}" published successfully!`, 'success', 'Tournament Created');
    });

    document.getElementById('btn-close-create-tourn').addEventListener('click', () => { modalContainer.innerHTML = ''; });
    document.getElementById('btn-cancel-create-tourn').addEventListener('click', () => { modalContainer.innerHTML = ''; });
}

function openAddCategoryModal(portalContainer, currentTourn) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
        <div class="tkd-modal-backdrop animate-fade-in" id="add-cat-modal">
            <div class="tkd-modal-card max-w-md">
                <div class="tkd-modal-header">
                    <div>
                        <span class="tkd-badge tkd-badge-blue mb-1"><i class="fa-solid fa-layer-group me-1"></i>Division Setup</span>
                        <h3 class="text-xl font-bold text-white">Add Category to Tournament</h3>
                    </div>
                    <button class="tkd-modal-close" id="btn-close-add-cat">&times;</button>
                </div>
                
                <form id="form-add-category" class="tkd-modal-body space-y-4">
                    <div>
                        <label class="tkd-label">Discipline</label>
                        <select class="tkd-select" id="cat-discipline">
                            ${DISCIPLINES.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                        </select>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="tkd-label">Age Division</label>
                            <select class="tkd-select" id="cat-age">
                                ${AGE_DIVISIONS.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="tkd-label">Gender</label>
                            <select class="tkd-select" id="cat-gender">
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="mixed">Mixed / Team</option>
                            </select>
                        </div>
                    </div>

                    <div id="cat-weight-container">
                        <label class="tkd-label">Weight Division (kg threshold)</label>
                        <input type="text" class="tkd-input" id="cat-weight-label" placeholder="e.g. Featherweight (-55 kg)" value="-55 kg" required>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="tkd-label">Belt Qualification</label>
                            <select class="tkd-select" id="cat-belt-group">
                                <option value="Black Belts (Dan 1-4)">Black Belts (Dan 1-4)</option>
                                <option value="Red & Black Belts">Red & Black Belts</option>
                                <option value="Color Belts (Yellow-Blue)">Color Belts (Yellow-Blue)</option>
                                <option value="All Belt Ranks">All Belt Ranks</option>
                            </select>
                        </div>
                        <div>
                            <label class="tkd-label">Tatami / Ring Assignment</label>
                            <select class="tkd-select" id="cat-ring">
                                <option value="Tatami 1">Tatami 1</option>
                                <option value="Tatami 2">Tatami 2</option>
                                <option value="Tatami 3">Tatami 3</option>
                                <option value="Tatami 4">Tatami 4</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex justify-end gap-2 pt-2">
                        <button type="button" class="tkd-btn tkd-btn-outline" id="btn-cancel-add-cat">Cancel</button>
                        <button type="submit" class="tkd-btn tkd-btn-blue">
                            <i class="fa-solid fa-plus-circle me-1"></i>Add Division
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const form = document.getElementById('form-add-category');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const discipline = document.getElementById('cat-discipline').value;
        const division = document.getElementById('cat-age').value;
        const gender = document.getElementById('cat-gender').value;
        const weightLabel = document.getElementById('cat-weight-label').value;
        const beltGroup = document.getElementById('cat-belt-group').value;
        const ring = document.getElementById('cat-ring').value;

        const ageName = AGE_DIVISIONS.find(a => a.id === division)?.name.split(' ')[0] || 'Junior';
        const genderTitle = gender.charAt(0).toUpperCase() + gender.slice(1);
        const disciplineName = discipline === 'kyorugi' ? 'Kyorugi' : 'Poomsae';
        const title = `${ageName} ${genderTitle} ${disciplineName} (${weightLabel})`;

        store.addCategoryToTournament(currentTourn.id, {
            title,
            discipline,
            division,
            gender,
            weightLabel,
            beltGroup,
            ring,
            drawSize: 4
        });

        modalContainer.innerHTML = '';
        renderAdminPortal(portalContainer);
        showToast(`Category "${title}" added to ${currentTourn.title}!`, 'success', 'Division Added');
    });

    document.getElementById('btn-close-add-cat').addEventListener('click', () => { modalContainer.innerHTML = ''; });
    document.getElementById('btn-cancel-add-cat').addEventListener('click', () => { modalContainer.innerHTML = ''; });
}

function openWeighInModal(portalContainer) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const athletes = store.getAthletes();

    modalContainer.innerHTML = `
        <div class="tkd-modal-backdrop animate-fade-in" id="weighin-modal">
            <div class="tkd-modal-card max-w-2xl">
                <div class="tkd-modal-header">
                    <div>
                        <span class="tkd-badge tkd-badge-blue mb-1"><i class="fa-solid fa-scale-balanced me-1"></i>Official Scale</span>
                        <h3 class="text-xl font-bold text-white">Official Weigh-In & Verification Desk</h3>
                    </div>
                    <button class="tkd-modal-close" id="btn-close-weighin">&times;</button>
                </div>
                
                <div class="tkd-modal-body space-y-4">
                    <div class="flex justify-between items-center gap-2">
                        <input type="text" class="tkd-input py-1.5 px-3 text-sm max-w-xs" id="search-weighin" placeholder="Search athlete or Dojang...">
                        <span class="text-xs text-slate-400">${athletes.length} Competitors on record</span>
                    </div>

                    <div class="tkd-table-container max-h-[380px] overflow-y-auto">
                        <table class="tkd-table">
                            <thead>
                                <tr>
                                    <th>Athlete</th>
                                    <th>Dojang</th>
                                    <th>Registered Division</th>
                                    <th>Official Weight</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="tbody-weighin">
                                ${athletes.map(a => `
                                    <tr data-athlete-id="${a.id}">
                                        <td>
                                            <div class="font-bold text-white text-sm">${a.name}</div>
                                            <div class="text-xs text-slate-400 font-mono">${a.kukkiwonNo || 'No KKW #'}</div>
                                        </td>
                                        <td><span class="tkd-badge tkd-badge-slate text-xs">${a.dojangCode || 'Dojang'}</span></td>
                                        <td class="text-xs text-slate-300">${a.weightClass || 'Kyorugi'}</td>
                                        <td>
                                            <input type="number" step="0.1" class="tkd-input py-1 px-2 text-xs w-20 input-weight" value="${a.weight}"> kg
                                        </td>
                                        <td>
                                            <span class="tkd-badge ${a.status.includes('Passed') ? 'tkd-badge-green' : (a.status.includes('Overweight') ? 'tkd-badge-red' : 'tkd-badge-slate')} text-xs">
                                                ${a.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="flex gap-1">
                                                <button class="tkd-btn tkd-btn-xs tkd-btn-emerald btn-pass-weighin" title="Pass Weigh-In">
                                                    <i class="fa-solid fa-check"></i>
                                                </button>
                                                <button class="tkd-btn tkd-btn-xs tkd-btn-rose btn-fail-weighin" title="Mark Overweight">
                                                    <i class="fa-solid fa-xmark"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    const tbody = document.getElementById('tbody-weighin');

    tbody.querySelectorAll('.btn-pass-weighin').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tr = e.target.closest('tr');
            const athId = tr.getAttribute('data-athlete-id');
            const weightInput = tr.querySelector('.input-weight');
            const newWeight = parseFloat(weightInput.value);

            const athlete = store.getAthlete(athId);
            if (athlete) {
                athlete.weight = newWeight;
                athlete.status = 'Weighed-In (Passed)';
                store.updateAthlete(athlete);
                showToast(`${athlete.name} passed official weigh-in (${newWeight} kg)!`, 'success', 'Weigh-In Passed');
                openWeighInModal(portalContainer);
                renderAdminPortal(portalContainer);
            }
        });
    });

    tbody.querySelectorAll('.btn-fail-weighin').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tr = e.target.closest('tr');
            const athId = tr.getAttribute('data-athlete-id');
            const athlete = store.getAthlete(athId);
            if (athlete) {
                athlete.status = 'Overweight / Disqualified';
                store.updateAthlete(athlete);
                showToast(`${athlete.name} flagged as Overweight`, 'warning', 'Weigh-In Disqualified');
                openWeighInModal(portalContainer);
                renderAdminPortal(portalContainer);
            }
        });
    });

    document.getElementById('btn-close-weighin').addEventListener('click', () => { modalContainer.innerHTML = ''; });
}
