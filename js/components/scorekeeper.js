// Electronic Referee & Scorekeeper Console for Taekwondo Tatami Matches
import { store } from '../state.js';
import { showToast, formatTime } from '../utils/helpers.js';

let activeTimerInterval = null;
let timerSeconds = 120;
let isTimerRunning = false;

export function openScorekeeperModal(categoryId, matchId) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const draw = store.getDraw(categoryId);
    if (!draw) {
        showToast('Draw not found for this category.', 'error');
        return;
    }

    let match = null;
    let roundIndex = 0;
    draw.rounds.forEach((rnd, rIdx) => {
        const found = rnd.matches.find(m => m.matchId === matchId || m.matchNumber === matchId);
        if (found) {
            match = found;
            roundIndex = rIdx;
        }
    });

    if (!match) {
        showToast('Match not found.', 'error');
        return;
    }

    // Working state for live scoring
    let matchState = {
        currentRound: match.currentRound || 1,
        timeRemaining: match.timeRemainingSeconds || 120,
        chung: {
            name: match.chung.name || 'CHUNG',
            dojang: match.chung.dojang || 'Dojang',
            score: match.chung.roundScores ? (match.chung.roundScores[0] || 0) : 0,
            gamjeom: match.chung.gamjeom || 0,
            roundsWon: match.chung.scoreTotal || 0,
            history: []
        },
        hong: {
            name: match.hong.name || 'HONG',
            dojang: match.hong.dojang || 'Dojang',
            score: match.hong.roundScores ? (match.hong.roundScores[0] || 0) : 0,
            gamjeom: match.hong.gamjeom || 0,
            roundsWon: match.hong.scoreTotal || 0,
            history: []
        }
    };

    timerSeconds = matchState.timeRemaining;
    isTimerRunning = false;
    if (activeTimerInterval) clearInterval(activeTimerInterval);

    modalContainer.innerHTML = `
        <div class="tkd-modal-backdrop animate-fade-in" id="scorekeeper-modal">
            <div class="tkd-modal-card max-w-4xl p-0 overflow-hidden bg-slate-950 border border-slate-700 shadow-2xl">
                <!-- Top Console Header -->
                <div class="bg-slate-900 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <span class="tkd-badge tkd-badge-blue text-xs font-mono">
                            <i class="fa-solid fa-gamepad me-1"></i>${match.ring || 'Tatami 1'}
                        </span>
                        <div>
                            <span class="text-xs text-slate-400 font-bold uppercase tracking-wider">Bout #${match.matchNumber}</span>
                            <h3 class="text-sm font-black text-white">${draw.title}</h3>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <div class="text-xs text-amber-400 font-semibold px-2.5 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                            Best of 3 Rounds
                        </div>
                        <button class="tkd-modal-close text-slate-400 hover:text-white" id="btn-close-scorekeeper">&times;</button>
                    </div>
                </div>

                <!-- Timer & Round Control Banner -->
                <div class="bg-slate-900/90 py-3 px-6 flex justify-between items-center border-b border-slate-800">
                    <!-- Round Indicator -->
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-slate-400 font-bold uppercase">Round:</span>
                        <div class="flex gap-1">
                            <button class="round-tab-btn ${matchState.currentRound === 1 ? 'active' : ''}" data-round="1">R1</button>
                            <button class="round-tab-btn ${matchState.currentRound === 2 ? 'active' : ''}" data-round="2">R2</button>
                            <button class="round-tab-btn ${matchState.currentRound === 3 ? 'active' : ''}" data-round="3">R3</button>
                        </div>
                    </div>

                    <!-- Digital Timer Display -->
                    <div class="flex items-center gap-3">
                        <div class="text-3xl font-black font-mono tracking-widest text-white bg-slate-950 px-4 py-1.5 rounded-lg border border-slate-800" id="timer-display">
                            ${formatTime(timerSeconds)}
                        </div>
                        <div class="flex gap-1.5">
                            <button class="tkd-btn tkd-btn-sm tkd-btn-emerald" id="btn-toggle-timer">
                                <i class="fa-solid fa-play" id="timer-play-icon"></i>
                            </button>
                            <button class="tkd-btn tkd-btn-sm tkd-btn-outline" id="btn-reset-timer">
                                <i class="fa-solid fa-rotate-left"></i>
                            </button>
                        </div>
                    </div>

                    <!-- End Round / End Match Actions -->
                    <div class="flex gap-2">
                        <button class="tkd-btn tkd-btn-sm tkd-btn-amber" id="btn-finish-round">
                            <i class="fa-solid fa-flag-checkered me-1"></i>End Round
                        </button>
                        <button class="tkd-btn tkd-btn-sm tkd-btn-purple" id="btn-finalize-match">
                            <i class="fa-solid fa-trophy me-1"></i>Finalize Match
                        </button>
                    </div>
                </div>

                <!-- Dual Corner Scoring Grid (Chung Blue vs Hong Red) -->
                <div class="grid grid-cols-2 divide-x divide-slate-800 min-h-[420px]">
                    <!-- CHUNG (BLUE) CORNER -->
                    <div class="p-6 bg-gradient-to-b from-blue-950/40 to-slate-950 flex flex-col justify-between">
                        <div>
                            <!-- Fighter Info -->
                            <div class="flex justify-between items-start">
                                <div>
                                    <span class="tkd-badge tkd-badge-blue text-xs font-black uppercase tracking-wider">CHUNG (BLUE)</span>
                                    <h2 class="text-2xl font-black text-white mt-1" id="chung-name">${matchState.chung.name}</h2>
                                    <p class="text-xs text-blue-300">${matchState.chung.dojang}</p>
                                </div>
                                <div class="text-right">
                                    <span class="text-xs text-slate-400">Rounds Won</span>
                                    <div class="text-xl font-black text-blue-400" id="chung-rounds-won">${matchState.chung.roundsWon}</div>
                                </div>
                            </div>

                            <!-- Big Score Counter -->
                            <div class="my-6 text-center">
                                <div class="text-7xl md:text-8xl font-black text-blue-400 font-mono tracking-tighter" id="chung-score">
                                    ${matchState.chung.score}
                                </div>
                                <div class="flex justify-center items-center gap-2 mt-2">
                                    <span class="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                        Gam-jeom: <span id="chung-gamjeom">${matchState.chung.gamjeom}</span>/5
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Technical Scoring Keypad -->
                        <div class="space-y-2">
                            <div class="grid grid-cols-3 gap-2">
                                <button class="tkd-score-btn bg-blue-600/20 hover:bg-blue-600/40 text-blue-200 border-blue-500/30 btn-add-score" data-corner="chung" data-pts="1" data-label="Punch">
                                    +1 Punch
                                </button>
                                <button class="tkd-score-btn bg-blue-600/30 hover:bg-blue-600/50 text-blue-100 border-blue-500/40 btn-add-score" data-corner="chung" data-pts="2" data-label="Body Kick">
                                    +2 Body Kick
                                </button>
                                <button class="tkd-score-btn bg-blue-600/40 hover:bg-blue-600/60 text-white border-blue-500/50 btn-add-score" data-corner="chung" data-pts="4" data-label="Turn Body">
                                    +4 Turn Body
                                </button>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <button class="tkd-score-btn bg-blue-500/40 hover:bg-blue-500/60 text-white border-blue-400/50 btn-add-score" data-corner="chung" data-pts="3" data-label="Head Kick">
                                    +3 Head Kick
                                </button>
                                <button class="tkd-score-btn bg-blue-500/60 hover:bg-blue-500/80 text-white font-bold border-blue-400 btn-add-score" data-corner="chung" data-pts="5" data-label="Turn Head">
                                    +5 Turn Head
                                </button>
                            </div>
                            <div class="grid grid-cols-2 gap-2 pt-1">
                                <button class="tkd-score-btn bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30 btn-add-gamjeom" data-corner="chung">
                                    <i class="fa-solid fa-triangle-exclamation me-1"></i>Gam-jeom
                                </button>
                                <button class="tkd-score-btn bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 btn-undo-score" data-corner="chung">
                                    <i class="fa-solid fa-rotate-left me-1"></i>Undo
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- HONG (RED) CORNER -->
                    <div class="p-6 bg-gradient-to-b from-rose-950/40 to-slate-950 flex flex-col justify-between">
                        <div>
                            <!-- Fighter Info -->
                            <div class="flex justify-between items-start">
                                <div>
                                    <span class="tkd-badge tkd-badge-red text-xs font-black uppercase tracking-wider">HONG (RED)</span>
                                    <h2 class="text-2xl font-black text-white mt-1" id="hong-name">${matchState.hong.name}</h2>
                                    <p class="text-xs text-rose-300">${matchState.hong.dojang}</p>
                                </div>
                                <div class="text-right">
                                    <span class="text-xs text-slate-400">Rounds Won</span>
                                    <div class="text-xl font-black text-rose-400" id="hong-rounds-won">${matchState.hong.roundsWon}</div>
                                </div>
                            </div>

                            <!-- Big Score Counter -->
                            <div class="my-6 text-center">
                                <div class="text-7xl md:text-8xl font-black text-rose-400 font-mono tracking-tighter" id="hong-score">
                                    ${matchState.hong.score}
                                </div>
                                <div class="flex justify-center items-center gap-2 mt-2">
                                    <span class="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                        Gam-jeom: <span id="hong-gamjeom">${matchState.hong.gamjeom}</span>/5
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Technical Scoring Keypad -->
                        <div class="space-y-2">
                            <div class="grid grid-cols-3 gap-2">
                                <button class="tkd-score-btn bg-rose-600/20 hover:bg-rose-600/40 text-rose-200 border-rose-500/30 btn-add-score" data-corner="hong" data-pts="1" data-label="Punch">
                                    +1 Punch
                                </button>
                                <button class="tkd-score-btn bg-rose-600/30 hover:bg-rose-600/50 text-rose-100 border-rose-500/40 btn-add-score" data-corner="hong" data-pts="2" data-label="Body Kick">
                                    +2 Body Kick
                                </button>
                                <button class="tkd-score-btn bg-rose-600/40 hover:bg-rose-600/60 text-white border-rose-500/50 btn-add-score" data-corner="hong" data-pts="4" data-label="Turn Body">
                                    +4 Turn Body
                                </button>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <button class="tkd-score-btn bg-rose-500/40 hover:bg-rose-500/60 text-white border-rose-400/50 btn-add-score" data-corner="hong" data-pts="3" data-label="Head Kick">
                                    +3 Head Kick
                                </button>
                                <button class="tkd-score-btn bg-rose-500/60 hover:bg-rose-500/80 text-white font-bold border-rose-400 btn-add-score" data-corner="hong" data-pts="5" data-label="Turn Head">
                                    +5 Turn Head
                                </button>
                            </div>
                            <div class="grid grid-cols-2 gap-2 pt-1">
                                <button class="tkd-score-btn bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30 btn-add-gamjeom" data-corner="hong">
                                    <i class="fa-solid fa-triangle-exclamation me-1"></i>Gam-jeom
                                </button>
                                <button class="tkd-score-btn bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 btn-undo-score" data-corner="hong">
                                    <i class="fa-solid fa-rotate-left me-1"></i>Undo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // UI Update functions
    const updateUI = () => {
        const chungScoreEl = document.getElementById('chung-score');
        const hongScoreEl = document.getElementById('hong-score');
        const chungGamjeomEl = document.getElementById('chung-gamjeom');
        const hongGamjeomEl = document.getElementById('hong-gamjeom');
        const chungRoundsEl = document.getElementById('chung-rounds-won');
        const hongRoundsEl = document.getElementById('hong-rounds-won');
        const timerDisplay = document.getElementById('timer-display');

        if (chungScoreEl) chungScoreEl.textContent = matchState.chung.score;
        if (hongScoreEl) hongScoreEl.textContent = matchState.hong.score;
        if (chungGamjeomEl) chungGamjeomEl.textContent = matchState.chung.gamjeom;
        if (hongGamjeomEl) hongGamjeomEl.textContent = matchState.hong.gamjeom;
        if (chungRoundsEl) chungRoundsEl.textContent = matchState.chung.roundsWon;
        if (hongRoundsEl) hongRoundsEl.textContent = matchState.hong.roundsWon;
        if (timerDisplay) timerDisplay.textContent = formatTime(timerSeconds);

        // Point Gap check (12-point gap standard in WT rules)
        const pointDiff = Math.abs(matchState.chung.score - matchState.hong.score);
        if (pointDiff >= 12) {
            showToast('12-Point Gap threshold reached in this round!', 'info', 'Point Gap Alert');
        }
    };

    // Timer Controls
    const btnToggleTimer = document.getElementById('btn-toggle-timer');
    const playIcon = document.getElementById('timer-play-icon');

    btnToggleTimer.addEventListener('click', () => {
        if (isTimerRunning) {
            clearInterval(activeTimerInterval);
            isTimerRunning = false;
            playIcon.className = 'fa-solid fa-play';
        } else {
            isTimerRunning = true;
            playIcon.className = 'fa-solid fa-pause';
            activeTimerInterval = setInterval(() => {
                if (timerSeconds > 0) {
                    timerSeconds--;
                    updateUI();
                } else {
                    clearInterval(activeTimerInterval);
                    isTimerRunning = false;
                    playIcon.className = 'fa-solid fa-play';
                    showToast('Round time expired! Referee call end of round.', 'warning', 'Time Expired');
                }
            }, 1000);
        }
    });

    document.getElementById('btn-reset-timer').addEventListener('click', () => {
        if (activeTimerInterval) clearInterval(activeTimerInterval);
        isTimerRunning = false;
        playIcon.className = 'fa-solid fa-play';
        timerSeconds = 120;
        updateUI();
    });

    // Score keypad clicks
    modalContainer.querySelectorAll('.btn-add-score').forEach(btn => {
        btn.addEventListener('click', () => {
            const corner = btn.getAttribute('data-corner');
            const pts = parseInt(btn.getAttribute('data-pts'));
            const label = btn.getAttribute('data-label');

            matchState[corner].score += pts;
            matchState[corner].history.push({ type: 'score', pts, label });
            updateUI();
        });
    });

    // Gam-jeom clicks (adds 1 point to the opponent!)
    modalContainer.querySelectorAll('.btn-add-gamjeom').forEach(btn => {
        btn.addEventListener('click', () => {
            const corner = btn.getAttribute('data-corner');
            const opponentCorner = corner === 'chung' ? 'hong' : 'chung';

            matchState[corner].gamjeom += 1;
            matchState[opponentCorner].score += 1; // WT rule: Gam-jeom awards +1 pt to opponent
            matchState[corner].history.push({ type: 'gamjeom', pts: 1, label: 'Gam-jeom Penalty' });

            if (matchState[corner].gamjeom >= 5) {
                showToast(`${matchState[corner].name} has reached 5 Gam-jeom penalties (Disqualification by penalties)!`, 'error', 'Gam-jeom DQ Warning');
            } else {
                showToast(`Gam-jeom penalty on ${corner.toUpperCase()}! (+1 pt to ${opponentCorner.toUpperCase()})`, 'warning');
            }
            updateUI();
        });
    });

    // Undo clicks
    modalContainer.querySelectorAll('.btn-undo-score').forEach(btn => {
        btn.addEventListener('click', () => {
            const corner = btn.getAttribute('data-corner');
            const history = matchState[corner].history;
            if (history.length > 0) {
                const last = history.pop();
                if (last.type === 'score') {
                    matchState[corner].score = Math.max(0, matchState[corner].score - last.pts);
                } else if (last.type === 'gamjeom') {
                    const opponentCorner = corner === 'chung' ? 'hong' : 'chung';
                    matchState[corner].gamjeom = Math.max(0, matchState[corner].gamjeom - 1);
                    matchState[opponentCorner].score = Math.max(0, matchState[opponentCorner].score - 1);
                }
                updateUI();
                showToast(`Reversed last ${last.label}`, 'info');
            }
        });
    });

    // End Round Click
    document.getElementById('btn-finish-round').addEventListener('click', () => {
        if (matchState.chung.score > matchState.hong.score) {
            matchState.chung.roundsWon += 1;
            showToast(`CHUNG (${matchState.chung.name}) wins Round ${matchState.currentRound}!`, 'success', 'Round Winner');
        } else if (matchState.hong.score > matchState.chung.score) {
            matchState.hong.roundsWon += 1;
            showToast(`HONG (${matchState.hong.name}) wins Round ${matchState.currentRound}!`, 'success', 'Round Winner');
        } else {
            showToast('Round ended in a tie. Superiority criteria applied.', 'info');
        }

        if (matchState.currentRound < 3) {
            matchState.currentRound += 1;
            matchState.chung.score = 0;
            matchState.hong.score = 0;
            matchState.chung.gamjeom = 0;
            matchState.hong.gamjeom = 0;
            timerSeconds = 120;
            isTimerRunning = false;
            playIcon.className = 'fa-solid fa-play';
            if (activeTimerInterval) clearInterval(activeTimerInterval);

            // Update Round tabs
            modalContainer.querySelectorAll('.round-tab-btn').forEach(b => {
                b.classList.toggle('active', parseInt(b.getAttribute('data-round')) === matchState.currentRound);
            });
            updateUI();
        }
    });

    // Finalize Match & Advance in Bracket
    document.getElementById('btn-finalize-match').addEventListener('click', () => {
        let winnerCorner = 'chung';
        let winnerName = matchState.chung.name;
        let winnerId = match.chung.athleteId;

        if (matchState.hong.roundsWon > matchState.chung.roundsWon || 
           (matchState.hong.roundsWon === matchState.chung.roundsWon && matchState.hong.score > matchState.chung.score)) {
            winnerCorner = 'hong';
            winnerName = matchState.hong.name;
            winnerId = match.hong.athleteId;
        }

        // Write to state
        store.updateMatchScore(categoryId, match.matchId || match.matchNumber, {
            status: 'COMPLETED',
            winnerCorner,
            winnerId,
            winnerName,
            chung: {
                ...match.chung,
                scoreTotal: matchState.chung.roundsWon,
                roundScores: [matchState.chung.score],
                gamjeom: matchState.chung.gamjeom
            },
            hong: {
                ...match.hong,
                scoreTotal: matchState.hong.roundsWon,
                roundScores: [matchState.hong.score],
                gamjeom: matchState.hong.gamjeom
            }
        });

        // Update Tatami board state
        store.updateTatamiState(1, {
            status: 'COMPLETED',
            timeRemaining: '00:00'
        });

        if (activeTimerInterval) clearInterval(activeTimerInterval);
        modalContainer.innerHTML = '';
        showToast(`Match finalized! Winner: ${winnerName} (${winnerCorner.toUpperCase()}). Bracket updated.`, 'success', 'Bout Completed');
    });

    // Close Modal
    document.getElementById('btn-close-scorekeeper').addEventListener('click', () => {
        if (activeTimerInterval) clearInterval(activeTimerInterval);
        modalContainer.innerHTML = '';
    });
}
