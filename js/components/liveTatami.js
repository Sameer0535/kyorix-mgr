// Live Tatami Ring Display & Tournament Medal Leaderboard
import { store } from '../state.js';
import { openScorekeeperModal } from './scorekeeper.js';

export function renderLiveTatami(container) {
    const user = store.getCurrentUser();
    const tatamiState = store.getTatamiState();
    const dojangs = store.getDojangs();

    // Sort dojangs by medal tally (Gold * 3 + Silver * 2 + Bronze * 1)
    const sortedDojangs = [...dojangs].sort((a, b) => {
        const scoreA = ((a.medals?.gold || 0) * 3) + ((a.medals?.silver || 0) * 2) + (a.medals?.bronze || 0);
        const scoreB = ((b.medals?.gold || 0) * 3) + ((b.medals?.silver || 0) * 2) + (b.medals?.bronze || 0);
        return scoreB - scoreA;
    });

    container.innerHTML = `
        <div class="live-tatami-container space-y-6">
            <!-- Header Banner -->
            <div class="bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="tkd-badge tkd-badge-red animate-pulse"><i class="fa-solid fa-tower-broadcast me-1"></i>Live Arena</span>
                        <span class="text-xs text-slate-400 font-mono">4 Active Tatami Rings</span>
                    </div>
                    <h1 class="text-2xl font-black text-white mt-1">Tatami Live Match Center</h1>
                    <p class="text-xs text-slate-400">Live electronic scoreboards, round timers, and on-deck fight queues across all competition rings.</p>
                </div>
            </div>

            <!-- 4-Ring Tatami Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${tatamiState.map(ring => {
                    const isFighting = ring.status === 'FIGHTING';
                    return `
                        <div class="tkd-tatami-board rounded-2xl bg-slate-950 border ${isFighting ? 'border-amber-500/80 shadow-amber-500/10' : 'border-slate-800'} shadow-2xl overflow-hidden flex flex-col justify-between">
                            <!-- Ring Header -->
                            <div class="bg-slate-900 px-5 py-3 border-b border-slate-800 flex justify-between items-center">
                                <div class="flex items-center gap-2.5">
                                    <span class="w-3 h-3 rounded-full ${isFighting ? 'bg-amber-400 animate-ping' : 'bg-slate-600'}"></span>
                                    <div>
                                        <h3 class="text-base font-black text-white">${ring.ringName}</h3>
                                        <div class="text-[11px] text-blue-400 font-bold">${ring.currentCategory}</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="tkd-badge ${isFighting ? 'tkd-badge-amber' : 'tkd-badge-slate'} text-xs font-mono">
                                        Bout #${ring.matchNumber} • ${ring.status}
                                    </span>
                                </div>
                            </div>

                            <!-- Dual Split Score Screen -->
                            <div class="grid grid-cols-2 divide-x divide-slate-800 bg-slate-950 p-4 min-h-[160px]">
                                <!-- Chung Blue -->
                                <div class="p-3 bg-blue-950/20 flex flex-col justify-between">
                                    <div>
                                        <span class="tkd-badge tkd-badge-blue text-[9px] font-black">CHUNG</span>
                                        <h4 class="text-sm font-black text-white mt-1 truncate">${ring.chung.name}</h4>
                                        <p class="text-[10px] text-blue-300 truncate">${ring.chung.dojang}</p>
                                    </div>
                                    <div class="text-center my-2">
                                        <div class="text-4xl md:text-5xl font-black text-blue-400 font-mono tracking-tighter">
                                            ${ring.chung.points}
                                        </div>
                                        <div class="text-[10px] text-amber-400">Gam-jeom: ${ring.chung.gamjeom}</div>
                                    </div>
                                </div>

                                <!-- Hong Red -->
                                <div class="p-3 bg-rose-950/20 flex flex-col justify-between">
                                    <div>
                                        <span class="tkd-badge tkd-badge-red text-[9px] font-black">HONG</span>
                                        <h4 class="text-sm font-black text-white mt-1 truncate">${ring.hong.name}</h4>
                                        <p class="text-[10px] text-rose-300 truncate">${ring.hong.dojang}</p>
                                    </div>
                                    <div class="text-center my-2">
                                        <div class="text-4xl md:text-5xl font-black text-rose-400 font-mono tracking-tighter">
                                            ${ring.hong.points}
                                        </div>
                                        <div class="text-[10px] text-amber-400">Gam-jeom: ${ring.hong.gamjeom}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Bottom Ring Footer & On-Deck Queue -->
                            <div class="bg-slate-900/90 px-4 py-2.5 border-t border-slate-800 flex justify-between items-center text-xs">
                                <div>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase">On-Deck (Next):</span>
                                    <div class="text-[11px] text-slate-200 font-semibold truncate max-w-[240px]">
                                        #${ring.onDeck.matchNumber} • ${ring.onDeck.chung} vs ${ring.onDeck.hong}
                                    </div>
                                </div>
                                ${user.role === 'admin' ? `
                                    <button class="tkd-btn tkd-btn-xs tkd-btn-amber btn-tatami-score" data-ring-id="${ring.ringId}">
                                        <i class="fa-solid fa-gamepad me-1"></i>Control
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Academy Medal Standings Table -->
            <div class="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h3 class="text-lg font-bold text-white flex items-center gap-2">
                            <i class="fa-solid fa-medal text-amber-400"></i> Academy Medal Tally & Standings
                        </h3>
                        <p class="text-xs text-slate-400">Official ranking of participating Dojangs and clubs based on gold, silver, and bronze medals won.</p>
                    </div>
                </div>

                <div class="tkd-table-container">
                    <table class="tkd-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Academy / Dojang</th>
                                <th>Head Master</th>
                                <th><span class="inline-flex items-center gap-1 font-bold text-amber-600"><i class="fa-solid fa-medal text-amber-500"></i> Gold</span></th>
                                <th><span class="inline-flex items-center gap-1 font-bold text-slate-600"><i class="fa-solid fa-medal text-slate-400"></i> Silver</span></th>
                                <th><span class="inline-flex items-center gap-1 font-bold text-amber-800"><i class="fa-solid fa-medal text-amber-700"></i> Bronze</span></th>
                                <th>Total Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedDojangs.map((d, idx) => {
                                const gold = d.medals?.gold || 0;
                                const silver = d.medals?.silver || 0;
                                const bronze = d.medals?.bronze || 0;
                                const totalPts = (gold * 3) + (silver * 2) + bronze;

                                return `
                                    <tr>
                                        <td class="font-mono font-bold text-sm ${idx === 0 ? 'text-amber-400' : 'text-slate-400'}">
                                            #${idx + 1}
                                        </td>
                                        <td>
                                            <div class="font-bold text-white text-sm">${d.name} <span class="text-xs text-slate-400 font-mono">(${d.shortCode})</span></div>
                                            <div class="text-xs text-slate-400">${d.city}, ${d.state}</div>
                                        </td>
                                        <td class="text-xs text-slate-300">${d.masterName}</td>
                                        <td class="font-bold text-amber-400 text-sm">${gold}</td>
                                        <td class="font-bold text-slate-300 text-sm">${silver}</td>
                                        <td class="font-bold text-amber-700 text-sm">${bronze}</td>
                                        <td class="font-mono font-black text-emerald-400 text-sm">${totalPts} pts</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Attach Event Listeners
    container.querySelectorAll('.btn-tatami-score').forEach(btn => {
        btn.addEventListener('click', () => {
            const ringId = parseInt(btn.getAttribute('data-ring-id'));
            const catId = ringId === 1 ? 'cat-1' : (ringId === 2 ? 'cat-2' : 'cat-1');
            openScorekeeperModal(catId, 102);
        });
    });
}
