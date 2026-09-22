// Mock Seed Data for Taekwondo Tournament Management System

export const INITIAL_DOJANGS = [
    {
        id: 'dojang-1',
        name: 'Dragon Fist Taekwondo Academy',
        shortCode: 'DFTKD',
        masterName: 'Grandmaster Kang Min-Soo (7th Dan)',
        licenseNo: 'KUK-2024-8891',
        city: 'Metro City',
        state: 'California',
        email: 'master@dragonfisttkd.com',
        phone: '+1 (555) 234-5678',
        logoText: 'DF',
        accentColor: '#3b82f6',
        athletesCount: 8,
        medals: { gold: 5, silver: 3, bronze: 4 }
    },
    {
        id: 'dojang-2',
        name: 'Apex Martial Arts Dojang',
        shortCode: 'APEX',
        masterName: 'Master Elena Rostova (5th Dan)',
        licenseNo: 'KUK-2023-4102',
        city: 'Westwood',
        state: 'Nevada',
        email: 'info@apexmartialarts.com',
        phone: '+1 (555) 876-5432',
        logoText: 'AX',
        accentColor: '#10b981',
        athletesCount: 6,
        medals: { gold: 3, silver: 4, bronze: 2 }
    },
    {
        id: 'dojang-3',
        name: 'Seoul Spirit Taekwondo Club',
        shortCode: 'SSTKD',
        masterName: 'Master Park Jin-Woo (6th Dan)',
        licenseNo: 'KUK-2022-7721',
        city: 'East Bay',
        state: 'California',
        email: 'contact@seoulspirit.org',
        phone: '+1 (555) 432-1098',
        logoText: 'SS',
        accentColor: '#f59e0b',
        athletesCount: 7,
        medals: { gold: 4, silver: 2, bronze: 5 }
    },
    {
        id: 'dojang-4',
        name: 'Phoenix Warrior Martial Arts',
        shortCode: 'PWMA',
        masterName: 'Master Marcus Vance (5th Dan)',
        licenseNo: 'KUK-2025-1108',
        city: 'South Valley',
        state: 'Arizona',
        email: 'admin@phoenixwarriortkd.com',
        phone: '+1 (555) 901-2345',
        logoText: 'PW',
        accentColor: '#ef4444',
        athletesCount: 5,
        medals: { gold: 2, silver: 5, bronze: 1 }
    }
];

export const INITIAL_ATHLETES = [
    {
        id: 'ath-1',
        name: 'Jin Park',
        gender: 'male',
        dob: '2009-04-12',
        age: 17,
        division: 'junior',
        beltId: 'dan-1',
        beltName: '1st Dan Black Belt',
        weight: 53.8,
        weightClass: 'Featherweight (-55 kg)',
        weightClassId: 'j-m-feather',
        discipline: 'kyorugi',
        dojangId: 'dojang-1',
        dojangName: 'Dragon Fist Taekwondo Academy',
        dojangCode: 'DFTKD',
        kukkiwonNo: 'KKW-0988231',
        avatar: '',
        status: 'Weighed-In (Passed)',
        seed: 1,
        registeredTournaments: ['tourn-1'],
        stats: { matches: 14, wins: 12, ko: 4 }
    },
    {
        id: 'ath-2',
        name: 'Liam Zhang',
        gender: 'male',
        dob: '2009-08-20',
        age: 17,
        division: 'junior',
        beltId: 'dan-1',
        beltName: '1st Dan Black Belt',
        weight: 54.2,
        weightClass: 'Featherweight (-55 kg)',
        weightClassId: 'j-m-feather',
        discipline: 'kyorugi',
        dojangId: 'dojang-2',
        dojangName: 'Apex Martial Arts Dojang',
        dojangCode: 'APEX',
        kukkiwonNo: 'KKW-0945112',
        avatar: '',
        status: 'Weighed-In (Passed)',
        seed: 2,
        registeredTournaments: ['tourn-1'],
        stats: { matches: 11, wins: 9, ko: 2 }
    },
    {
        id: 'ath-3',
        name: 'Tariq Al-Mansoor',
        gender: 'male',
        dob: '2009-02-15',
        age: 17,
        division: 'junior',
        beltId: 'red',
        beltName: 'Red Belt (2nd Gup)',
        weight: 52.9,
        weightClass: 'Featherweight (-55 kg)',
        weightClassId: 'j-m-feather',
        discipline: 'kyorugi',
        dojangId: 'dojang-3',
        dojangName: 'Seoul Spirit Taekwondo Club',
        dojangCode: 'SSTKD',
        kukkiwonNo: 'GUP-884129',
        avatar: '',
        status: 'Weighed-In (Passed)',
        seed: 3,
        registeredTournaments: ['tourn-1'],
        stats: { matches: 8, wins: 6, ko: 1 }
    },
    {
        id: 'ath-4',
        name: 'Ethan Morales',
        gender: 'male',
        dob: '2009-11-03',
        age: 16,
        division: 'junior',
        beltId: 'poom-1',
        beltName: '1st Poom (Junior Black)',
        weight: 54.7,
        weightClass: 'Featherweight (-55 kg)',
        weightClassId: 'j-m-feather',
        discipline: 'kyorugi',
        dojangId: 'dojang-4',
        dojangName: 'Phoenix Warrior Martial Arts',
        dojangCode: 'PWMA',
        kukkiwonNo: 'KKW-0977410',
        avatar: '',
        status: 'Weighed-In (Passed)',
        seed: 4,
        registeredTournaments: ['tourn-1'],
        stats: { matches: 10, wins: 7, ko: 3 }
    },
    {
        id: 'ath-5',
        name: 'Maya Tanaka',
        gender: 'female',
        dob: '2010-06-18',
        age: 16,
        division: 'junior',
        beltId: 'dan-1',
        beltName: '1st Dan Black Belt',
        weight: 48.2,
        weightClass: 'Featherweight (-49 kg)',
        weightClassId: 'j-f-feather',
        discipline: 'kyorugi',
        dojangId: 'dojang-1',
        dojangName: 'Dragon Fist Taekwondo Academy',
        dojangCode: 'DFTKD',
        kukkiwonNo: 'KKW-0988245',
        avatar: '',
        status: 'Weighed-In (Passed)',
        seed: 1,
        registeredTournaments: ['tourn-1'],
        stats: { matches: 16, wins: 15, ko: 5 }
    },
    {
        id: 'ath-6',
        name: 'Sophia Laurent',
        gender: 'female',
        dob: '2010-09-25',
        age: 15,
        division: 'junior',
        beltId: 'red',
        beltName: 'Red Belt (2nd Gup)',
        weight: 47.8,
        weightClass: 'Featherweight (-49 kg)',
        weightClassId: 'j-f-feather',
        discipline: 'kyorugi',
        dojangId: 'dojang-2',
        dojangName: 'Apex Martial Arts Dojang',
        dojangCode: 'APEX',
        kukkiwonNo: 'GUP-993214',
        avatar: '',
        status: 'Weighed-In (Passed)',
        seed: 2,
        registeredTournaments: ['tourn-1'],
        stats: { matches: 9, wins: 7, ko: 1 }
    },
    {
        id: 'ath-7',
        name: 'Kaito Takahashi',
        gender: 'male',
        dob: '2004-03-14',
        age: 22,
        division: 'senior',
        beltId: 'dan-2',
        beltName: '2nd Dan Black Belt',
        weight: 66.5,
        weightClass: 'Featherweight (-68 kg)',
        weightClassId: 's-m-feather',
        discipline: 'kyorugi',
        dojangId: 'dojang-3',
        dojangName: 'Seoul Spirit Taekwondo Club',
        dojangCode: 'SSTKD',
        kukkiwonNo: 'KKW-0612450',
        avatar: '',
        status: 'Weighed-In (Passed)',
        seed: 1,
        registeredTournaments: ['tourn-1'],
        stats: { matches: 24, wins: 20, ko: 8 }
    },
    {
        id: 'ath-8',
        name: 'David O\'Connor',
        gender: 'male',
        dob: '2003-12-01',
        age: 22,
        division: 'senior',
        beltId: 'dan-2',
        beltName: '2nd Dan Black Belt',
        weight: 67.2,
        weightClass: 'Featherweight (-68 kg)',
        weightClassId: 's-m-feather',
        discipline: 'kyorugi',
        dojangId: 'dojang-4',
        dojangName: 'Phoenix Warrior Martial Arts',
        dojangCode: 'PWMA',
        kukkiwonNo: 'KKW-0624991',
        avatar: '',
        status: 'Weighed-In (Passed)',
        seed: 2,
        registeredTournaments: ['tourn-1'],
        stats: { matches: 19, wins: 14, ko: 6 }
    },
    {
        id: 'ath-9',
        name: 'Chloe Kim',
        gender: 'female',
        dob: '2005-07-22',
        age: 21,
        division: 'senior',
        beltId: 'dan-3',
        beltName: '3rd Dan Black Belt',
        weight: 52.0,
        weightClass: 'Poomsae Individual',
        weightClassId: 'poomsae-s-f',
        discipline: 'poomsae',
        dojangId: 'dojang-1',
        dojangName: 'Dragon Fist Taekwondo Academy',
        dojangCode: 'DFTKD',
        kukkiwonNo: 'KKW-0511890',
        avatar: '',
        status: 'Approved',
        seed: 1,
        registeredTournaments: ['tourn-1'],
        stats: { matches: 18, wins: 17, ko: 0 }
    }
];

export const INITIAL_TOURNAMENTS = [
    {
        id: 'tourn-1',
        title: 'National Taekwondo Kyorugi & Poomsae Grand Championship 2026',
        sanction: 'World Taekwondo & National Federation Sanctioned',
        dates: 'Sep 12 - Sep 14, 2026',
        status: 'Live & In Progress',
        venue: 'Grand Olympic Arena, Hall B',
        city: 'Metro City, CA',
        activeRings: 4,
        totalAthletes: 0,
        totalDojangs: 24,
        registrationOpen: false,
        categories: [
            {
                id: 'cat-1',
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
                status: 'Semi-Finals In Progress'
            },
            {
                id: 'cat-2',
                title: 'Junior Female Kyorugi Featherweight (-49kg)',
                division: 'junior',
                gender: 'female',
                discipline: 'kyorugi',
                weightLabel: '-49 kg',
                beltGroup: 'Black & Red Belts',
                ring: 'Tatami 2',
                roundsCount: 3,
                roundDurationSeconds: 120,
                drawSize: 4,
                status: 'Finals Scheduled'
            },
            {
                id: 'cat-3',
                title: 'Senior Male Kyorugi Featherweight (-68kg)',
                division: 'senior',
                gender: 'male',
                discipline: 'kyorugi',
                weightLabel: '-68 kg',
                beltGroup: 'Black Belt (Dan 1-4)',
                ring: 'Tatami 3',
                roundsCount: 3,
                roundDurationSeconds: 120,
                drawSize: 4,
                status: 'Upcoming'
            },
            {
                id: 'cat-4',
                title: 'Senior Female Recognized Poomsae Individual',
                division: 'senior',
                gender: 'female',
                discipline: 'poomsae',
                weightLabel: 'Open Weight',
                beltGroup: 'Black Belt (Dan 1+)',
                ring: 'Tatami 4',
                roundsCount: 2,
                roundDurationSeconds: 90,
                drawSize: 4,
                status: 'Completed'
            }
        ]
    },
    {
        id: 'tourn-2',
        title: 'West Coast Youth Taekwondo Open Cup 2026',
        sanction: 'State Taekwondo Association',
        dates: 'Oct 05 - Oct 07, 2026',
        status: 'Registration Open',
        venue: 'Pacific Sports Center',
        city: 'San Diego, CA',
        activeRings: 3,
        totalAthletes: 0,
        totalDojangs: 16,
        registrationOpen: true,
        categories: [
            {
                id: 'cat-201',
                title: 'Cadet Male Kyorugi Flyweight (-37kg)',
                division: 'cadet',
                gender: 'male',
                discipline: 'kyorugi',
                weightLabel: '-37 kg',
                beltGroup: 'All Belts',
                ring: 'Tatami 1',
                roundsCount: 3,
                roundDurationSeconds: 90,
                drawSize: 8,
                status: 'Draw Pending'
            },
            {
                id: 'cat-202',
                title: 'Junior Female Poomsae (Taegeuk 4-8)',
                division: 'junior',
                gender: 'female',
                discipline: 'poomsae',
                weightLabel: 'Open Weight',
                beltGroup: 'Color & Black Belts',
                ring: 'Tatami 2',
                roundsCount: 2,
                roundDurationSeconds: 90,
                drawSize: 8,
                status: 'Draw Pending'
            }
        ]
    }
];

export const INITIAL_DRAWS = {
    'cat-1': {
        categoryId: 'cat-1',
        title: 'Junior Male Kyorugi Featherweight (-55kg)',
        tournamentId: 'tourn-1',
        ring: 'Tatami 1',
        rounds: [
            {
                roundNumber: 1,
                roundName: 'Semi-Finals',
                matches: [
                    {
                        matchId: 'M101',
                        matchNumber: 101,
                        ring: 'Tatami 1',
                        status: 'COMPLETED',
                        scheduledTime: '10:00 AM',
                        winnerCorner: 'chung',
                        winnerId: 'ath-1',
                        winnerName: 'Jin Park',
                        chung: {
                            athleteId: 'ath-1',
                            name: 'Jin Park',
                            seed: 1,
                            belt: '1st Dan Black',
                            dojang: 'Dragon Fist TKD',
                            scoreTotal: 2, // Rounds won
                            roundScores: [14, 18],
                            gamjeom: 1,
                            punches: 2,
                            bodyKicks: 4,
                            headKicks: 2
                        },
                        hong: {
                            athleteId: 'ath-4',
                            name: 'Ethan Morales',
                            seed: 4,
                            belt: '1st Poom',
                            dojang: 'Phoenix Warrior',
                            scoreTotal: 0,
                            roundScores: [8, 11],
                            gamjeom: 2,
                            punches: 1,
                            bodyKicks: 2,
                            headKicks: 1
                        }
                    },
                    {
                        matchId: 'M102',
                        matchNumber: 102,
                        ring: 'Tatami 1',
                        status: 'LIVE',
                        currentRound: 2,
                        timeRemainingSeconds: 64,
                        scheduledTime: '10:30 AM',
                        winnerCorner: null,
                        winnerId: null,
                        chung: {
                            athleteId: 'ath-3',
                            name: 'Tariq Al-Mansoor',
                            seed: 3,
                            belt: 'Red Belt',
                            dojang: 'Seoul Spirit',
                            scoreTotal: 0,
                            roundScores: [9, 6],
                            gamjeom: 1,
                            punches: 1,
                            bodyKicks: 3,
                            headKicks: 0
                        },
                        hong: {
                            athleteId: 'ath-2',
                            name: 'Liam Zhang',
                            seed: 2,
                            belt: '1st Dan Black',
                            dojang: 'Apex Martial Arts',
                            scoreTotal: 1, // Won round 1
                            roundScores: [12, 10],
                            gamjeom: 0,
                            punches: 3,
                            bodyKicks: 3,
                            headKicks: 1
                        }
                    }
                ]
            },
            {
                roundNumber: 2,
                roundName: 'Gold Medal Final',
                matches: [
                    {
                        matchId: 'M103',
                        matchNumber: 103,
                        ring: 'Tatami 1',
                        status: 'UPCOMING',
                        scheduledTime: '11:45 AM',
                        winnerCorner: null,
                        winnerId: null,
                        chung: {
                            athleteId: 'ath-1',
                            name: 'Jin Park',
                            seed: 1,
                            belt: '1st Dan Black',
                            dojang: 'Dragon Fist TKD',
                            scoreTotal: 0,
                            roundScores: [0, 0, 0],
                            gamjeom: 0
                        },
                        hong: {
                            athleteId: 'TBD',
                            name: 'Winner of Match #102',
                            seed: null,
                            belt: 'TBD',
                            dojang: 'Apex / Seoul Spirit',
                            scoreTotal: 0,
                            roundScores: [0, 0, 0],
                            gamjeom: 0
                        }
                    }
                ]
            }
        ]
    },
    'cat-2': {
        categoryId: 'cat-2',
        title: 'Junior Female Kyorugi Featherweight (-49kg)',
        tournamentId: 'tourn-1',
        ring: 'Tatami 2',
        rounds: [
            {
                roundNumber: 1,
                roundName: 'Gold Medal Final',
                matches: [
                    {
                        matchId: 'M201',
                        matchNumber: 201,
                        ring: 'Tatami 2',
                        status: 'UPCOMING',
                        scheduledTime: '01:15 PM',
                        winnerCorner: null,
                        winnerId: null,
                        chung: {
                            athleteId: 'ath-5',
                            name: 'Maya Tanaka',
                            seed: 1,
                            belt: '1st Dan Black',
                            dojang: 'Dragon Fist TKD',
                            scoreTotal: 0,
                            roundScores: [0, 0, 0],
                            gamjeom: 0
                        },
                        hong: {
                            athleteId: 'ath-6',
                            name: 'Sophia Laurent',
                            seed: 2,
                            belt: 'Red Belt',
                            dojang: 'Apex Martial Arts',
                            scoreTotal: 0,
                            roundScores: [0, 0, 0],
                            gamjeom: 0
                        }
                    }
                ]
            }
        ]
    }
};

export const INITIAL_TATAMI_STATE = [
    {
        ringId: 1,
        ringName: 'Tatami 1 (Main Arena)',
        currentCategory: 'Junior Male Kyorugi (-55kg)',
        matchNumber: 102,
        status: 'FIGHTING',
        round: 2,
        timeRemaining: '01:04',
        chung: {
            name: 'Tariq Al-Mansoor',
            dojang: 'Seoul Spirit',
            points: 6,
            gamjeom: 1,
            roundsWon: 0
        },
        hong: {
            name: 'Liam Zhang',
            dojang: 'Apex Martial Arts',
            points: 10,
            gamjeom: 0,
            roundsWon: 1
        },
        onDeck: {
            matchNumber: 103,
            chung: 'Jin Park (Dragon Fist)',
            hong: 'Winner of #102'
        }
    },
    {
        ringId: 2,
        ringName: 'Tatami 2',
        currentCategory: 'Junior Female Kyorugi (-49kg)',
        matchNumber: 201,
        status: 'ON_DECK',
        round: 1,
        timeRemaining: '02:00',
        chung: {
            name: 'Maya Tanaka',
            dojang: 'Dragon Fist',
            points: 0,
            gamjeom: 0,
            roundsWon: 0
        },
        hong: {
            name: 'Sophia Laurent',
            dojang: 'Apex Martial Arts',
            points: 0,
            gamjeom: 0,
            roundsWon: 0
        },
        onDeck: {
            matchNumber: 202,
            chung: 'Cadet Female Finals',
            hong: 'TBD'
        }
    },
    {
        ringId: 3,
        ringName: 'Tatami 3',
        currentCategory: 'Senior Male Kyorugi (-68kg)',
        matchNumber: 301,
        status: 'WARMUP',
        round: 1,
        timeRemaining: '02:00',
        chung: {
            name: 'Kaito Takahashi',
            dojang: 'Seoul Spirit',
            points: 0,
            gamjeom: 0,
            roundsWon: 0
        },
        hong: {
            name: 'David O\'Connor',
            dojang: 'Phoenix Warrior',
            points: 0,
            gamjeom: 0,
            roundsWon: 0
        },
        onDeck: {
            matchNumber: 302,
            chung: 'Senior Male Semi-Final 2',
            hong: 'TBD'
        }
    },
    {
        ringId: 4,
        ringName: 'Tatami 4 (Poomsae Court)',
        currentCategory: 'Senior Female Recognized Poomsae',
        matchNumber: 401,
        status: 'COMPLETED',
        round: 2,
        timeRemaining: '00:00',
        chung: {
            name: 'Chloe Kim (Dragon Fist)',
            dojang: 'Dragon Fist',
            points: '8.45 (Gold)',
            gamjeom: 0,
            roundsWon: 1
        },
        hong: {
            name: 'Sarah Lin (Apex)',
            dojang: 'Apex Martial Arts',
            points: '8.12 (Silver)',
            gamjeom: 0,
            roundsWon: 0
        },
        onDeck: {
            matchNumber: 402,
            chung: 'Team Poomsae Demonstration',
            hong: 'Scheduled 02:00 PM'
        }
    }
];
