// Athlete / Competitor Portal & Match Center
import { store } from '../state.js';
import { getBeltBadge, showToast } from '../utils/helpers.js';

export function renderAthletePortal(container) {
    const user = store.getCurrentUser();
    const athletes = store.getAthletes();
    const currentAthlete = (user.athleteId ? store.getAthlete(user.athleteId) : athletes[0]) || athletes[0];
    const tournaments = store.getTournaments();
    const draws = store.getDraws();

    // Find athlete's next fight across all draws
    let nextMatch = null;
    let nextMatchDraw = null;
    let myCorner = null;

    Object.values(draws).forEach(draw => {
        draw.rounds.forEach(rnd => {
            rnd.matches.forEach(m => {
                if (m.status !== 'COMPLETED') {
                    if (m.chung && m.chung.athleteId === currentAthlete.id) {
                        nextMatch = m;
                        nextMatchDraw = draw;
                        myCorner = 'CHUNG (BLUE)';
                    } else if (m.hong && m.hong.athleteId === currentAthlete.id) {
                        nextMatch = m;
                        nextMatchDraw = draw;
                        myCorner = 'HONG (RED)';
                    }
                }
            });
        });
    });

    container.innerHTML = `
        <div class="athlete-portal space-y-6">
            <!-- Athlete Profile & Digital Passbook -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Digital Competitor Pass Card -->
                <div class="lg:col-span-1">
                    <div class="tkd-digital-pass relative overflow-hidden rounded-2xl p-6 bg-white border border-slate-200 shadow-2xl">
                        <!-- Holographic Ribbon -->
                        <div class="absolute -right-12 top-6 bg-gradient-to-r from-amber-400 via-rose-500 to-blue-500 text-slate-950 font-black text-[10px] uppercase tracking-widest py-1 px-14 rotate-45 shadow-lg">
                            OFFICIAL PASS
                        </div>

                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-16 h-16 rounded-full bg-slate-100 border-2 border-amber-400/80 flex items-center justify-center text-2xl shadow-inner">
                                ${currentAthlete.avatar || '<i class="fa-solid fa-user-ninja"></i>'}
                            </div>
                            <div>
                                <span class="tkd-badge tkd-badge-blue text-[10px] mb-1 font-bold">WT Competitor</span>
                                <h2 class="text-xl font-black text-slate-900">${currentAthlete.name}</h2>
                                <div class="mt-1">${getBeltBadge(currentAthlete.beltId)}</div>
                            </div>
                        </div>

                        <div class="space-y-2.5 my-5 text-xs">
                            <div class="flex justify-between py-1 border-b border-slate-200">
                                <span class="text-slate-600">Dojang / Club:</span>
                                <span class="font-bold text-slate-900">${currentAthlete.dojangName || currentAthlete.dojangCode}</span>
                            </div>
                            <div class="flex justify-between py-1 border-b border-slate-200">
                                <span class="text-slate-600">Weight Category:</span>
                                <span class="font-bold text-emerald-400 font-mono">${currentAthlete.weight} kg (${currentAthlete.weightClass || 'Featherweight'})</span>
                            </div>
                            <div class="flex justify-between py-1 border-b border-slate-200">
                                <span class="text-slate-600">Kukkiwon License:</span>
                                <span class="font-bold text-blue-600 font-mono">${currentAthlete.kukkiwonNo || 'KKW-0988231'}</span>
                            </div>
                            <div class="flex justify-between py-1 border-b border-slate-200">
                                <span class="text-slate-600">Weigh-in Status:</span>
                                <span class="tkd-badge tkd-badge-green text-[10px] font-bold">${currentAthlete.status || 'Passed'}</span>
                            </div>
                        </div>

                        <!-- Simulated QR Code Pass -->
                        <div class="bg-slate-100 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                            <div class="w-12 h-12 bg-white border border-slate-200 rounded flex items-center justify-center text-blue-600">
                                <i class="fa-solid fa-qrcode text-2xl"></i>
                            </div>
                            <div class="text-left flex-1">
                                <div class="text-[10px] font-black uppercase tracking-wider text-blue-600">Fighter Pass ID</div>
                                <div class="font-mono text-xs font-black text-slate-900">${currentAthlete.id.toUpperCase()}</div>
                                <div class="text-[9px] text-slate-600">Scannable at Tatami Marshall Desk</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment & Registration Status -->
                <div class="lg:col-span-2 space-y-4">
                    <div class="p-5 bg-gradient-to-r from-emerald-950/40 via-[#020717] to-[#020717]/90 rounded-2xl border border-emerald-500/40 shadow-xl space-y-4">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="tkd-badge tkd-badge-green text-xs font-bold">
                                        <i class="fa-solid fa-circle-check me-1"></i>Official Entry Verified
                                    </span>
                                    <span class="text-xs text-slate-600 font-mono">Invoice #INV-2026-${(currentAthlete.id || '849201').replace(/\D/g, '') || '849201'}</span>
                                </div>
                                <h3 class="text-xl font-black text-slate-900 mt-1">Payment &amp; Registration Status</h3>
                            </div>
                            <div class="text-left sm:text-right">
                                <span class="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">Individual Entry Fee</span>
                                <div class="text-2xl font-black text-emerald-400 font-mono">₹ 1,500</div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-white rounded-xl border border-slate-200 text-xs">
                            <div>
                                <span class="text-slate-600 block text-[10px] uppercase font-bold">Payment Status</span>
                                <span class="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                                    <i class="fa-solid fa-circle-check text-xs"></i> Paid in Full
                                </span>
                            </div>
                            <div>
                                <span class="text-slate-600 block text-[10px] uppercase font-bold">Transaction Reference</span>
                                <span class="font-mono font-bold text-slate-900 mt-0.5 block">TXN-IND-${(currentAthlete.id || '849201').replace(/\D/g, '') || '849201'}</span>
                            </div>
                            <div>
                                <span class="text-slate-600 block text-[10px] uppercase font-bold">Payment Mode</span>
                                <span class="font-bold text-slate-900 mt-0.5 block">Online (UPI / Cards Verified)</span>
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <div class="text-xs text-slate-600">
                                <i class="fa-regular fa-clock text-emerald-400 me-1"></i> Registration Confirmed • Official Entry Receipt Issued
                            </div>
                            <div class="flex items-center gap-2">
                                <button class="tkd-btn tkd-btn-sm tkd-btn-blue font-bold flex items-center gap-1.5 shadow-md" onclick="showToast('Payment receipt verified &amp; ready to print', 'success')">
                                    <i class="fa-solid fa-receipt"></i> View Official Receipt
                                </button>
                                <button class="tkd-btn tkd-btn-sm tkd-btn-outline text-xs" onclick="showToast('Payment receipt emailed to registered address!', 'success')">
                                    <i class="fa-solid fa-envelope me-1"></i> Email Receipt
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Self-Registration for Open Tournaments -->
                    <div class="bg-white p-5 rounded-2xl border border-slate-200">
                        <div class="flex justify-between items-center mb-3">
                            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                                <i class="fa-solid fa-trophy text-amber-400"></i> Open Championships for Registration
                            </h3>
                        </div>

                        <div class="space-y-3">
                            ${tournaments.map(t => `
                                <div class="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <span class="tkd-badge ${t.registrationOpen ? 'tkd-badge-green' : 'tkd-badge-slate'} text-xs font-bold">
                                                ${t.registrationOpen ? 'Registration Open' : 'Registration Closed'}
                                            </span>
                                            <span class="text-xs text-slate-600 font-medium"><i class="fa-solid fa-calendar me-1"></i>${t.dates}</span>
                                        </div>
                                        <h4 class="text-sm font-bold text-slate-900 mt-1">${t.title}</h4>
                                        <div class="text-xs text-slate-600">${t.venue} • ${t.sanction}</div>
                                    </div>

                                    <div>
                                        ${t.registrationOpen ? `
                                            <button class="tkd-btn tkd-btn-xs tkd-btn-blue font-bold btn-self-register" data-tourn-id="${t.id}">
                                                <i class="fa-solid fa-plus-circle me-1"></i>Register for Division
                                            </button>
                                        ` : `
                                            <span class="text-xs text-slate-600 font-medium">Draw In Progress</span>
                                        `}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Match Results & Downloadable Certificate Section -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <i class="fa-solid fa-award text-amber-400"></i> Official Tournament Results &amp; Certificate
                        </h3>
                        <p class="text-xs text-slate-600">View your verified match outcomes and generate your official World Taekwondo participation certificate.</p>
                    </div>
                    <button class="tkd-btn tkd-btn-sm tkd-btn-amber" id="btn-generate-cert">
                        <i class="fa-solid fa-file-pdf me-1"></i>Generate Digital Certificate
                    </button>
                </div>

                <!-- Match History Table -->
                <div class="tkd-table-container">
                    <table class="tkd-table">
                        <thead>
                            <tr>
                                <th>Match #</th>
                                <th>Division / Category</th>
                                <th>Corner</th>
                                <th>Opponent</th>
                                <th>Round Score</th>
                                <th>Decision</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="font-mono text-xs font-bold text-blue-600">#101</td>
                                <td class="text-xs text-slate-600">Junior Male Kyorugi (-55kg)</td>
                                <td><span class="tkd-badge tkd-badge-blue text-xs font-bold">CHUNG (BLUE)</span></td>
                                <td class="text-xs font-bold text-slate-900">Ethan Morales (Phoenix Warrior)</td>
                                <td class="font-mono text-xs font-bold text-emerald-400">2 - 0 (14-8, 18-11)</td>
                                <td><span class="tkd-badge tkd-badge-green text-xs font-bold">WIN (Point Gap)</span></td>
                                <td class="text-xs text-emerald-400 font-bold">Verified</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Attach Event Handlers
    attachAthleteEvents(container, currentAthlete);
}

function attachAthleteEvents(container, currentAthlete) {
    // View My Draw Link
    const btnViewDraw = container.querySelector('#btn-view-my-draw');
    if (btnViewDraw) {
        btnViewDraw.addEventListener('click', () => {
            const tabBrackets = document.querySelector('[data-view="brackets"]');
            if (tabBrackets) tabBrackets.click();
        });
    }

    // Certificate Generator Modal
    const btnCert = container.querySelector('#btn-generate-cert');
    if (btnCert) {
        btnCert.addEventListener('click', () => {
            openCertificateModal(currentAthlete);
        });
    }

    // Self Register for Tournament
    container.querySelectorAll('.btn-self-register').forEach(btn => {
        btn.addEventListener('click', () => {
            const tournId = btn.getAttribute('data-tourn-id');
            const success = store.registerAthleteForTournament(currentAthlete.id, tournId, 'cat-201');
            if (success) {
                showToast(`You are registered for the championship in your weight division!`, 'success', 'Entry Confirmed');
                renderAthletePortal(container);
            }
        });
    });
}

function openCertificateModal(athlete) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
        <div class="tkd-modal-backdrop animate-fade-in" id="cert-modal">
            <div class="tkd-modal-card max-w-2xl bg-white text-slate-950 p-8 border-4 border-amber-500 shadow-2xl relative">
                <!-- Certificate Inner Frame -->
                <div class="border-2 border-amber-600/40 p-6 text-center space-y-4 relative">
                    <!-- Watermark Logo -->
                    <div class="text-amber-500 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                        <i class="fa-solid fa-trophy text-amber-500 text-lg"></i>
                        WORLD TAEKWONDO TOURNAMENT COMMITTEE
                        <i class="fa-solid fa-trophy text-amber-500 text-lg"></i>
                    </div>

                    <h1 class="text-3xl font-black text-slate-900 tracking-tight uppercase" style="font-family: serif;">
                        Certificate of Achievement
                    </h1>
                    <p class="text-xs text-slate-600 italic">This is proudly awarded to</p>

                    <h2 class="text-2xl font-black text-blue-900 tracking-wide border-b-2 border-slate-300 pb-1 max-w-md mx-auto">
                        ${athlete.name}
                    </h2>

                    <p class="text-xs text-slate-700 max-w-lg mx-auto leading-relaxed">
                        Representing <strong>${athlete.dojangName || 'Affiliated Academy'}</strong>, for outstanding martial spirit, discipline, and performance in the 
                        <strong>Junior Male Kyorugi Championship (-55kg)</strong>.
                    </p>

                    <div class="grid grid-cols-3 gap-4 pt-6 text-center border-t border-slate-200 text-xs">
                        <div>
                            <div class="font-bold text-slate-900 font-mono">${athlete.weight} kg</div>
                            <div class="text-[10px] text-slate-500 uppercase">Division</div>
                        </div>
                        <div>
                            <div class="font-bold text-amber-600 text-sm"><i class="fa-solid fa-medal me-1"></i>GOLD MEDAL</div>
                            <div class="text-[10px] text-slate-500 uppercase">Official Standing</div>
                        </div>
                        <div>
                            <div class="font-bold text-slate-900 font-mono">SEP 2026</div>
                            <div class="text-[10px] text-slate-500 uppercase">Sanction Date</div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-between items-center mt-6">
                    <button class="tkd-btn tkd-btn-sm tkd-btn-outline text-slate-800 border-slate-400" id="btn-close-cert">
                        Close Preview
                    </button>
                    <button class="tkd-btn tkd-btn-sm tkd-btn-amber" id="btn-print-cert">
                        <i class="fa-solid fa-print me-1"></i>Print / Save PDF
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-close-cert').addEventListener('click', () => { modalContainer.innerHTML = ''; });
    document.getElementById('btn-print-cert').addEventListener('click', () => {
        window.print();
    });
}
