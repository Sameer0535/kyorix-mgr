// Single Elimination Tournament Draw & Bracket Generator Engine
import { generateId } from './helpers.js';

export function generateSingleEliminationDraw(category, athletes = [], tatamiRing = 'Tatami 1') {
    const athleteCount = athletes.length;
    if (athleteCount < 2) {
        return null;
    }

    // Determine nearest power of 2 (2, 4, 8, 16, 32)
    let bracketSize = 2;
    while (bracketSize < athleteCount) {
        bracketSize *= 2;
    }

    // Sort athletes by seed if provided, otherwise randomize or place by dojang
    const sortedAthletes = [...athletes].sort((a, b) => {
        const seedA = a.seed || 999;
        const seedB = b.seed || 999;
        return seedA - seedB;
    });

    // Generate rounds structure
    const totalRounds = Math.log2(bracketSize);
    const rounds = [];
    let matchCounter = 101;

    // Round names based on remaining players
    const getRoundName = (roundIdx, totalRnds) => {
        const remaining = Math.pow(2, totalRnds - roundIdx);
        if (remaining === 2) return 'Gold Medal Final';
        if (remaining === 4) return 'Semi-Finals';
        if (remaining === 8) return 'Quarter-Finals';
        if (remaining === 16) return 'Round of 16';
        return `Round ${roundIdx + 1}`;
    };

    // Round 1 matches
    const round1Matches = [];
    const r1Pairs = bracketSize / 2;

    for (let i = 0; i < r1Pairs; i++) {
        const chungAthlete = sortedAthletes[i * 2] || null;
        const hongAthlete = sortedAthletes[i * 2 + 1] || null;

        const match = {
            matchId: generateId('match'),
            matchNumber: matchCounter++,
            ring: tatamiRing,
            status: 'UPCOMING',
            scheduledTime: `10:${(i * 20).toString().padStart(2, '0')} AM`,
            winnerCorner: null,
            winnerId: null,
            winnerName: null,
            chung: chungAthlete ? {
                athleteId: chungAthlete.id,
                name: chungAthlete.name,
                seed: chungAthlete.seed || (i * 2 + 1),
                belt: chungAthlete.beltName || 'Black Belt',
                dojang: chungAthlete.dojangName || chungAthlete.dojangCode || 'Dojang',
                scoreTotal: 0,
                roundScores: [0, 0, 0],
                gamjeom: 0
            } : {
                athleteId: 'BYE',
                name: 'BYE',
                seed: null,
                belt: '-',
                dojang: '-',
                scoreTotal: 0,
                roundScores: [0, 0, 0],
                gamjeom: 0
            },
            hong: hongAthlete ? {
                athleteId: hongAthlete.id,
                name: hongAthlete.name,
                seed: hongAthlete.seed || (i * 2 + 2),
                belt: hongAthlete.beltName || 'Black Belt',
                dojang: hongAthlete.dojangName || hongAthlete.dojangCode || 'Dojang',
                scoreTotal: 0,
                roundScores: [0, 0, 0],
                gamjeom: 0
            } : {
                athleteId: 'BYE',
                name: 'BYE',
                seed: null,
                belt: '-',
                dojang: '-',
                scoreTotal: 0,
                roundScores: [0, 0, 0],
                gamjeom: 0
            }
        };

        // If Chung or Hong has BYE, auto advance
        if (match.hong.athleteId === 'BYE' && match.chung.athleteId !== 'BYE') {
            match.status = 'COMPLETED';
            match.winnerCorner = 'chung';
            match.winnerId = match.chung.athleteId;
            match.winnerName = match.chung.name;
        } else if (match.chung.athleteId === 'BYE' && match.hong.athleteId !== 'BYE') {
            match.status = 'COMPLETED';
            match.winnerCorner = 'hong';
            match.winnerId = match.hong.athleteId;
            match.winnerName = match.hong.name;
        }

        round1Matches.push(match);
    }

    rounds.push({
        roundNumber: 1,
        roundName: getRoundName(0, totalRounds),
        matches: round1Matches
    });

    // Subsequent rounds placeholder setup
    for (let r = 1; r < totalRounds; r++) {
        const matchesInRound = bracketSize / Math.pow(2, r + 1);
        const nextRoundMatches = [];

        for (let m = 0; m < matchesInRound; m++) {
            nextRoundMatches.push({
                matchId: generateId('match'),
                matchNumber: matchCounter++,
                ring: tatamiRing,
                status: 'UPCOMING',
                scheduledTime: `11:${(m * 30).toString().padStart(2, '0')} AM`,
                winnerCorner: null,
                winnerId: null,
                winnerName: null,
                chung: {
                    athleteId: 'TBD',
                    name: 'Winner of Previous Round',
                    seed: null,
                    belt: 'TBD',
                    dojang: 'TBD',
                    scoreTotal: 0,
                    roundScores: [0, 0, 0],
                    gamjeom: 0
                },
                hong: {
                    athleteId: 'TBD',
                    name: 'Winner of Previous Round',
                    seed: null,
                    belt: 'TBD',
                    dojang: 'TBD',
                    scoreTotal: 0,
                    roundScores: [0, 0, 0],
                    gamjeom: 0
                }
            });
        }

        rounds.push({
            roundNumber: r + 1,
            roundName: getRoundName(r, totalRounds),
            matches: nextRoundMatches
        });
    }

    return {
        categoryId: category.id,
        title: category.title,
        tournamentId: category.tournamentId || 'tourn-1',
        ring: tatamiRing,
        rounds
    };
}
