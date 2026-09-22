// Interactive Visual Tournament Brackets & Draws Component
import { store } from '../state.js';
import { getBeltBadge, showToast } from '../utils/helpers.js';
import { openScorekeeperModal } from './scorekeeper.js';

export function renderBracketViewer(container) {
    const user = store.getCurrentUser();
    const tournaments = store.getTournaments();
    const draws = store.getDraws();

    // Get all available category IDs from draws or tournaments
    const categoryOptions = [];
    tournaments.forEach(t => {
        (t.categories || []).forEach(cat => {
            categoryOptions.push({
                id: cat.id,
                title: `${cat.title} • ${t.title.split(' ')[0]}`,
                rawTitle: cat.title,
                hasDraw: !!draws[cat.id]
            });
        });
    });

    const selectedCatId = container.dataset.selectedCatId || (categoryOptions[0] ? categoryOptions[0].id : null);
    const activeDraw = draws[selectedCatId] || null;

    container.innerHTML = `
        <div class="bracket-viewer-container space-y-6">
            <!-- Header & Category Switcher -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="tkd-badge tkd-badge-blue font-bold"><i class="fa-solid fa-sitemap me-1"></i>Official Draw</span>
                        <span class="text-xs text-slate-600 font-semibold">Single Elimination Knockout</span>
                    </div>
                    <h1 class="text-2xl font-black text-slate-900 mt-1">Tournament Draws &amp; Brackets</h1>
                    <p class="text-xs text-slate-600">Interactive Taekwondo championship tree with Chung (Blue) and Hong (Red) seeded pairings.</p>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                    <div>
                        <select class="tkd-select py-2 px-3 text-sm min-w-[280px]" id="select-bracket-category">
                            ${categoryOptions.map(c => `
                                <option value="${c.id}" ${c.id === selectedCatId ? 'selected' : ''}>
                                    ${c.title} ${c.hasDraw ? 'Ready' : '(No Draw)'}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    ${user.role === 'admin' && !activeDraw ? `
                        <button class="tkd-btn tkd-btn-amber" id="btn-generate-selected-draw">
                            <i class="fa-solid fa-wand-magic-sparkles me-1"></i>Generate Draw
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- Visual Bracket Canvas -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200 overflow-x-auto min-h-[500px]">
                ${activeDraw && activeDraw.rounds && activeDraw.rounds.length > 0 ? `
                    <div class="mb-4 flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <h2 class="text-lg font-black text-slate-900">${activeDraw.title}</h2>
                            <span class="tkd-badge tkd-badge-slate text-xs font-bold">${activeDraw.ring || 'Tatami 1'}</span>
                        </div>
                        <div class="text-xs text-slate-600 flex items-center gap-4 font-semibold">
                            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> CHUNG (Blue)</span>
                            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> HONG (Red)</span>
                            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Winner Advanced</span>
                        </div>
                    </div>

                    <!-- Bracket Tree Columns -->
                    <div class="tkd-bracket-tree flex gap-8 pb-4">
                        ${activeDraw.rounds.map((round, rIdx) => `
                            <div class="tkd-bracket-round flex-1 min-w-[280px] space-y-6">
                                <!-- Round Header -->
                                <div class="text-center py-2 px-3 bg-white rounded-xl border border-slate-200">
                                    <h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">${round.roundName}</h3>
                                    <span class="text-[10px] text-slate-600 font-semibold">${round.matches.length} Bout(s)</span>
                                </div>

                                <!-- Matches in this Round -->
                                <div class="space-y-8 flex flex-col justify-around h-full">
                                    ${round.matches.map(m => {
                                        const isCompleted = m.status === 'COMPLETED';
                                        const isLive = m.status === 'LIVE';
                                        const chungWinner = m.winnerCorner === 'chung';
                                        const hongWinner = m.winnerCorner === 'hong';

                                        return `
                                            <div class="tkd-bracket-match-node relative bg-white rounded-xl border ${isLive ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : (isCompleted ? 'border-slate-200' : 'border-slate-200')} shadow-lg overflow-hidden cursor-pointer hover:border-[#345DBF] transition" data-match-id="${m.matchId || m.matchNumber}">
                                                <!-- Top Match Bar -->
                                                <div class="bg-white px-3 py-1.5 flex justify-between items-center text-[10px] border-b border-slate-200">
                                                    <span class="font-mono font-bold text-blue-600">Bout #${m.matchNumber}</span>
                                                    <span class="tkd-badge ${isLive ? 'tkd-badge-amber animate-pulse' : (isCompleted ? 'tkd-badge-green' : 'tkd-badge-blue')} text-[9px] py-0 px-1.5 font-bold">
                                                        ${m.status}
                                                    </span>
                                                </div>

                                                <!-- CHUNG (Top) -->
                                                <div class="p-2.5 flex justify-between items-center border-b border-slate-200 ${chungWinner ? 'bg-blue-950/40 border-l-4 border-blue-500' : ''}">
                                                    <div class="flex items-center gap-2 overflow-hidden">
                                                        <span class="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                                                        ${m.chung.seed ? `<span class="text-[10px] font-mono text-slate-600">[${m.chung.seed}]</span>` : ''}
                                                        <div class="truncate">
                                                            <div class="text-xs font-bold ${chungWinner ? 'text-slate-900 font-black' : 'text-slate-600'} truncate">
                                                                ${m.chung.name}
                                                            </div>
                                                            <div class="text-[10px] text-slate-600 truncate">${m.chung.dojang || '-'}</div>
                                                        </div>
                                                    </div>
                                                    <div class="font-mono text-xs font-black ${chungWinner ? 'text-amber-400' : 'text-slate-600'} shrink-0 ml-2">
                                                        ${m.chung.scoreTotal !== undefined ? m.chung.scoreTotal : '-'}
                                                    </div>
                                                </div>

                                                <!-- HONG (Bottom) -->
                                                <div class="p-2.5 flex justify-between items-center ${hongWinner ? 'bg-rose-950/40 border-l-4 border-rose-500' : ''}">
                                                    <div class="flex items-center gap-2 overflow-hidden">
                                                        <span class="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                                                        ${m.hong.seed ? `<span class="text-[10px] font-mono text-slate-600">[${m.hong.seed}]</span>` : ''}
                                                        <div class="truncate">
                                                            <div class="text-xs font-bold ${hongWinner ? 'text-slate-900 font-black' : 'text-slate-600'} truncate">
                                                                ${m.hong.name}
                                                            </div>
                                                            <div class="text-[10px] text-slate-600 truncate">${m.hong.dojang || '-'}</div>
                                                        </div>
                                                    </div>
                                                    <div class="font-mono text-xs font-black ${hongWinner ? 'text-amber-400' : 'text-slate-600'} shrink-0 ml-2">
                                                        ${m.hong.scoreTotal !== undefined ? m.hong.scoreTotal : '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="text-center py-20 text-slate-600">
                        <i class="fa-solid fa-sitemap text-5xl text-blue-600 mb-3"></i>
                        <h3 class="text-lg font-bold text-slate-900">No Bracket Generated for this Division</h3>
                        <p class="text-xs text-slate-600 mt-1 max-w-sm mx-auto">Tournament administrators can generate the single elimination seeds directly or athletes can enroll.</p>
                        ${user.role === 'admin' ? `
                            <button class="tkd-btn tkd-btn-amber mt-4" id="btn-generate-empty-draw">
                                <i class="fa-solid fa-wand-magic-sparkles me-2"></i>Generate Division Bracket Now
                            </button>
                        ` : ''}
                    </div>
                `}
            </div>
        </div>
    `;

    // Attach Event Listeners
    attachBracketEvents(container, selectedCatId);
}

function attachBracketEvents(container, selectedCatId) {
    const user = store.getCurrentUser();

    // Category Selector
    const catSelect = container.querySelector('#select-bracket-category');
    if (catSelect) {
        catSelect.addEventListener('change', (e) => {
            container.dataset.selectedCatId = e.target.value;
            renderBracketViewer(container);
        });
    }

    // Generate Draw Buttons
    const btnGenSelected = container.querySelector('#btn-generate-selected-draw');
    const btnGenEmpty = container.querySelector('#btn-generate-empty-draw');

    const handleGen = () => {
        const draw = store.generateCategoryDraw(selectedCatId);
        if (draw) {
            showToast('Knockout draw generated with seeded fighter slots!', 'success', 'Draw Ready');
            renderBracketViewer(container);
        } else {
            showToast('Unable to generate draw for this division.', 'error');
        }
    };

    if (btnGenSelected) btnGenSelected.addEventListener('click', handleGen);
    if (btnGenEmpty) btnGenEmpty.addEventListener('click', handleGen);

    // Match Node Clicks
    container.querySelectorAll('.tkd-bracket-match-node').forEach(node => {
        node.addEventListener('click', () => {
            const matchId = node.getAttribute('data-match-id');
            if (user.role === 'admin') {
                openScorekeeperModal(selectedCatId, matchId);
            } else {
                showToast(`Bout #${matchId} selected. Official results recorded in bracket.`, 'info');
            }
        });
    });
}
