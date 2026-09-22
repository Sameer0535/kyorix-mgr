// State Management & Reactive Store with LocalStorage synchronization
import { INITIAL_TOURNAMENTS, INITIAL_DOJANGS, INITIAL_ATHLETES, INITIAL_DRAWS, INITIAL_TATAMI_STATE } from './mockData.js';
import { generateSingleEliminationDraw } from './utils/drawEngine.js';
import { generateId } from './utils/helpers.js';

const STORAGE_KEYS = {
    USER: 'tkd_active_user',
    TOURNAMENTS: 'tkd_tournaments',
    DOJANGS: 'tkd_dojangs',
    ATHLETES: 'tkd_athletes',
    DRAWS: 'tkd_draws',
    TATAMI: 'tkd_tatami'
};

class StateStore {
    constructor() {
        this.listeners = [];
        this.init();
    }

    init() {
        // Active User / Role (Default is Admin, with easy role switching)
        if (!localStorage.getItem(STORAGE_KEYS.USER)) {
            this.setCurrentUser({
                role: 'admin',
                name: 'Chief Referee / Tournament Director',
                email: 'director@tkdarena.org',
                id: 'admin-1',
                organization: 'World Taekwondo Organizing Committee'
            }, false);
        }

        // Initialize mock collections if not present
        if (!localStorage.getItem(STORAGE_KEYS.TOURNAMENTS)) {
            localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(INITIAL_TOURNAMENTS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.DOJANGS)) {
            localStorage.setItem(STORAGE_KEYS.DOJANGS, JSON.stringify(INITIAL_DOJANGS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.ATHLETES)) {
            localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(INITIAL_ATHLETES));
        }
        if (!localStorage.getItem(STORAGE_KEYS.DRAWS)) {
            localStorage.setItem(STORAGE_KEYS.DRAWS, JSON.stringify(INITIAL_DRAWS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.TATAMI)) {
            localStorage.setItem(STORAGE_KEYS.TATAMI, JSON.stringify(INITIAL_TATAMI_STATE));
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    notify() {
        this.listeners.forEach(fn => fn(this));
    }

    // --- User & Auth ---
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || { role: 'admin' };
        } catch {
            return { role: 'admin' };
        }
    }

    setCurrentUser(user, shouldNotify = true) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        if (shouldNotify) this.notify();
    }

    switchRole(role, entityId = null) {
        let user;
        if (role === 'admin') {
            user = {
                role: 'admin',
                name: 'Chief Referee / Tournament Director',
                email: 'director@tkdarena.org',
                id: 'admin-1',
                organization: 'World Taekwondo Organizing Committee'
            };
        } else if (role === 'dojang') {
            const dojangs = this.getDojangs();
            const dojang = (entityId ? dojangs.find(d => d.id === entityId) : dojangs[0]) || dojangs[0];
            user = {
                role: 'dojang',
                name: dojang.masterName,
                dojangId: dojang.id,
                dojangName: dojang.name,
                dojangCode: dojang.shortCode,
                email: dojang.email
            };
        } else if (role === 'athlete') {
            const athletes = this.getAthletes();
            const athlete = (entityId ? athletes.find(a => a.id === entityId) : athletes[0]) || athletes[0];
            user = {
                role: 'athlete',
                name: athlete.name,
                athleteId: athlete.id,
                beltName: athlete.beltName,
                dojangName: athlete.dojangName,
                avatar: athlete.avatar,
                email: `${athlete.name.toLowerCase().replace(/\s+/g, '.')}@tkdfighter.com`
            };
        }
        this.setCurrentUser(user);
    }

    // --- Tournaments ---
    getTournaments() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.TOURNAMENTS)) || [];
        } catch {
            return [];
        }
    }

    getTournament(id) {
        return this.getTournaments().find(t => t.id === id);
    }

    addTournament(tournData) {
        const list = this.getTournaments();
        const newTourn = {
            id: generateId('tourn'),
            status: 'Registration Open',
            totalAthletes: 0,
            totalDojangs: 0,
            registrationOpen: true,
            categories: [],
            ...tournData
        };
        list.unshift(newTourn);
        localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(list));
        this.notify();
        return newTourn;
    }

    addCategoryToTournament(tournId, categoryData) {
        const list = this.getTournaments();
        const tourn = list.find(t => t.id === tournId);
        if (tourn) {
            const newCategory = {
                id: generateId('cat'),
                status: 'Upcoming',
                roundsCount: 3,
                roundDurationSeconds: 120,
                ...categoryData
            };
            if (!tourn.categories) tourn.categories = [];
            tourn.categories.push(newCategory);
            localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(list));
            this.notify();
            return newCategory;
        }
        return null;
    }

    // --- Dojangs / Academies ---
    getDojangs() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOJANGS)) || [];
        } catch {
            return [];
        }
    }

    getDojang(id) {
        return this.getDojangs().find(d => d.id === id);
    }

    addDojang(dojangData) {
        const list = this.getDojangs();
        const newDojang = {
            id: generateId('dojang'),
            athletesCount: 0,
            medals: { gold: 0, silver: 0, bronze: 0 },
            accentColor: '#3b82f6',
            logoText: dojangData.name ? dojangData.name.substring(0, 2).toUpperCase() : 'TK',
            ...dojangData
        };
        list.push(newDojang);
        localStorage.setItem(STORAGE_KEYS.DOJANGS, JSON.stringify(list));
        this.notify();
        return newDojang;
    }

    // --- Athletes ---
    getAthletes() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATHLETES)) || [];
        } catch {
            return [];
        }
    }

    getAthlete(id) {
        return this.getAthletes().find(a => a.id === id);
    }

    addAthlete(athleteData) {
        const list = this.getAthletes();
        const newAthlete = {
            id: generateId('ath'),
            avatar: '',
            status: 'Registered',
            registeredTournaments: [],
            stats: { matches: 0, wins: 0, ko: 0 },
            ...athleteData
        };
        list.push(newAthlete);
        localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(list));

        // Update Dojang count
        if (athleteData.dojangId) {
            const dojangs = this.getDojangs();
            const dojang = dojangs.find(d => d.id === athleteData.dojangId);
            if (dojang) {
                dojang.athletesCount = (dojang.athletesCount || 0) + 1;
                localStorage.setItem(STORAGE_KEYS.DOJANGS, JSON.stringify(dojangs));
            }
        }

        this.notify();
        return newAthlete;
    }

    updateAthlete(updatedAthlete) {
        const list = this.getAthletes();
        const index = list.findIndex(a => a.id === updatedAthlete.id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updatedAthlete };
            localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(list));
            this.notify();
            return list[index];
        }
        return null;
    }

    updateDojang(updatedDojang) {
        const list = this.getDojangs();
        const index = list.findIndex(d => d.id === updatedDojang.id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updatedDojang };
            localStorage.setItem(STORAGE_KEYS.DOJANGS, JSON.stringify(list));
            this.notify();
            return list[index];
        }
        return null;
    }

    updateTournament(updatedTourn) {
        const list = this.getTournaments();
        const index = list.findIndex(t => t.id === updatedTourn.id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updatedTourn };
            localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(list));
            this.notify();
            return list[index];
        }
        return null;
    }

    registerAthleteForTournament(athleteId, tournamentId, categoryId) {
        const athletes = this.getAthletes();
        const athlete = athletes.find(a => a.id === athleteId);
        if (athlete) {
            if (!athlete.registeredTournaments) athlete.registeredTournaments = [];
            if (!athlete.registeredTournaments.includes(tournamentId)) {
                athlete.registeredTournaments.push(tournamentId);
            }
            athlete.assignedCategoryId = categoryId;
            localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(athletes));

            // Update tournament count
            const tournaments = this.getTournaments();
            const tourn = tournaments.find(t => t.id === tournamentId);
            if (tourn) {
                tourn.totalAthletes = (tourn.totalAthletes || 0) + 1;
                localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
            }

            this.notify();
            return true;
        }
        return false;
    }

    // --- Draws & Brackets ---
    getDraws() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.DRAWS)) || {};
        } catch {
            return {};
        }
    }

    getDraw(categoryId) {
        const draws = this.getDraws();
        return draws[categoryId] || null;
    }

    saveDraw(categoryId, drawData) {
        const draws = this.getDraws();
        draws[categoryId] = drawData;
        localStorage.setItem(STORAGE_KEYS.DRAWS, JSON.stringify(draws));
        this.notify();
    }

    generateCategoryDraw(categoryId) {
        const tournaments = this.getTournaments();
        let targetCategory = null;
        let targetTourn = null;

        for (const t of tournaments) {
            const cat = (t.categories || []).find(c => c.id === categoryId);
            if (cat) {
                targetCategory = cat;
                targetTourn = t;
                break;
            }
        }

        if (!targetCategory) return null;

        // Get matching athletes for this category or seed candidates
        const allAthletes = this.getAthletes();
        const matchingAthletes = allAthletes.filter(a => 
            a.division === targetCategory.division && 
            a.gender === targetCategory.gender
        );

        const drawData = generateSingleEliminationDraw(
            { ...targetCategory, tournamentId: targetTourn.id },
            matchingAthletes.length >= 2 ? matchingAthletes : allAthletes.slice(0, 4),
            targetCategory.ring || 'Tatami 1'
        );

        if (drawData) {
            this.saveDraw(categoryId, drawData);
        }
        return drawData;
    }

    // --- Match Scoring & Advancement ---
    updateMatchScore(categoryId, matchId, resultData) {
        const draws = this.getDraws();
        const draw = draws[categoryId];
        if (!draw) return false;

        let foundMatch = null;
        let foundRoundIdx = -1;
        let foundMatchIdx = -1;

        draw.rounds.forEach((round, rIdx) => {
            round.matches.forEach((m, mIdx) => {
                if (m.matchId === matchId || m.matchNumber === matchId) {
                    foundMatch = m;
                    foundRoundIdx = rIdx;
                    foundMatchIdx = mIdx;
                }
            });
        });

        if (!foundMatch) return false;

        // Update match state
        Object.assign(foundMatch, resultData);

        // If match is finished with a winner, advance winner to the next round!
        if (foundMatch.status === 'COMPLETED' && foundMatch.winnerCorner) {
            const nextRound = draw.rounds[foundRoundIdx + 1];
            if (nextRound) {
                const nextMatchIdx = Math.floor(foundMatchIdx / 2);
                const nextMatch = nextRound.matches[nextMatchIdx];
                if (nextMatch) {
                    const isChung = (foundMatchIdx % 2 === 0);
                    const winnerCornerData = foundMatch[foundMatch.winnerCorner];

                    if (isChung) {
                        nextMatch.chung = {
                            athleteId: winnerCornerData.athleteId,
                            name: winnerCornerData.name,
                            seed: winnerCornerData.seed,
                            belt: winnerCornerData.belt,
                            dojang: winnerCornerData.dojang,
                            scoreTotal: 0,
                            roundScores: [0, 0, 0],
                            gamjeom: 0
                        };
                    } else {
                        nextMatch.hong = {
                            athleteId: winnerCornerData.athleteId,
                            name: winnerCornerData.name,
                            seed: winnerCornerData.seed,
                            belt: winnerCornerData.belt,
                            dojang: winnerCornerData.dojang,
                            scoreTotal: 0,
                            roundScores: [0, 0, 0],
                            gamjeom: 0
                        };
                    }
                }
            }
        }

        this.saveDraw(categoryId, draw);
        return true;
    }

    // --- Live Tatami / Rings ---
    getTatamiState() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.TATAMI)) || [];
        } catch {
            return [];
        }
    }

    updateTatamiState(ringId, updateData) {
        const rings = this.getTatamiState();
        const ring = rings.find(r => r.ringId === ringId);
        if (ring) {
            Object.assign(ring, updateData);
            localStorage.setItem(STORAGE_KEYS.TATAMI, JSON.stringify(rings));
            this.notify();
        }
    }

    // --- Reset ---
    resetToDefault() {
        localStorage.clear();
        this.init();
        this.notify();
    }
}

export const store = new StateStore();
