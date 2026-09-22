// Taekwondo Domain Constants & Rules
export const TKD_BELTS = [
    { id: 'white', name: 'White Belt', level: '10th Gup', color: '#ffffff', textColor: '#000000', border: '#cbd5e1' },
    { id: 'yellow', name: 'Yellow Belt', level: '8th Gup', color: '#eab308', textColor: '#000000' },
    { id: 'green', name: 'Green Belt', level: '6th Gup', color: '#16a34a', textColor: '#ffffff' },
    { id: 'blue', name: 'Blue Belt', level: '4th Gup', color: '#2563eb', textColor: '#ffffff' },
    { id: 'red', name: 'Red Belt', level: '2nd Gup', color: '#dc2626', textColor: '#ffffff' },
    { id: 'poom-1', name: '1st Poom (Junior Black)', level: 'Junior Black', color: '#1e293b', halfColor: '#dc2626', textColor: '#ffffff' },
    { id: 'dan-1', name: '1st Dan Black Belt', level: 'Black Belt', color: '#090d16', textColor: '#fbbf24', border: '#fbbf24' },
    { id: 'dan-2', name: '2nd Dan Black Belt', level: 'Black Belt', color: '#090d16', textColor: '#fbbf24', border: '#fbbf24' },
    { id: 'dan-3', name: '3rd Dan Black Belt', level: 'Black Belt', color: '#090d16', textColor: '#fbbf24', border: '#fbbf24' },
    { id: 'dan-4', name: '4th Dan+ Master', level: 'Master Rank', color: '#090d16', textColor: '#f59e0b', border: '#f59e0b' }
];

export const AGE_DIVISIONS = [
    { id: 'peewee', name: 'Peewee (Sub-Cadet)', minAge: 6, maxAge: 9, label: 'Under 10' },
    { id: 'cadet', name: 'Cadet (Sub-Junior)', minAge: 10, maxAge: 12, label: '10 - 12 yrs' },
    { id: 'junior', name: 'Junior', minAge: 13, maxAge: 17, label: '13 - 17 yrs' },
    { id: 'senior', name: 'Senior', minAge: 18, maxAge: 35, label: '18 - 35 yrs' },
    { id: 'masters', name: 'Masters', minAge: 36, maxAge: 60, label: '36+ yrs' }
];

export const DISCIPLINES = [
    { id: 'kyorugi', name: 'Kyorugi (Sparring)', icon: 'fa-fist-raised', description: 'Full-contact Olympic Taekwondo sparring with electronic scoring & protective gear' },
    { id: 'poomsae', name: 'Poomsae (Forms)', icon: 'fa-person-walking', description: 'Official Recognized and Freestyle Taekwondo forms evaluated on accuracy and presentation' },
    { id: 'kyukpa', name: 'Kyukpa (Breaking)', icon: 'fa-burst', description: 'Power and technical board breaking demonstrations' }
];

export const WEIGHT_DIVISIONS = {
    junior: {
        male: [
            { id: 'j-m-fin', name: 'Finweight', maxWeight: 45, label: 'Under 45 kg' },
            { id: 'j-m-fly', name: 'Flyweight', minWeight: 45, maxWeight: 48, label: '-48 kg' },
            { id: 'j-m-bantam', name: 'Bantamweight', minWeight: 48, maxWeight: 51, label: '-51 kg' },
            { id: 'j-m-feather', name: 'Featherweight', minWeight: 51, maxWeight: 55, label: '-55 kg' },
            { id: 'j-m-light', name: 'Lightweight', minWeight: 55, maxWeight: 59, label: '-59 kg' },
            { id: 'j-m-welter', name: 'Welterweight', minWeight: 59, maxWeight: 63, label: '-63 kg' },
            { id: 'j-m-middle', name: 'Middleweight', minWeight: 63, maxWeight: 73, label: '-73 kg' },
            { id: 'j-m-heavy', name: 'Heavyweight', minWeight: 73, maxWeight: 120, label: '+73 kg' }
        ],
        female: [
            { id: 'j-f-fin', name: 'Finweight', maxWeight: 42, label: 'Under 42 kg' },
            { id: 'j-f-fly', name: 'Flyweight', minWeight: 42, maxWeight: 44, label: '-44 kg' },
            { id: 'j-f-bantam', name: 'Bantamweight', minWeight: 44, maxWeight: 46, label: '-46 kg' },
            { id: 'j-f-feather', name: 'Featherweight', minWeight: 46, maxWeight: 49, label: '-49 kg' },
            { id: 'j-f-light', name: 'Lightweight', minWeight: 49, maxWeight: 52, label: '-52 kg' },
            { id: 'j-f-welter', name: 'Welterweight', minWeight: 52, maxWeight: 55, label: '-55 kg' },
            { id: 'j-f-middle', name: 'Middleweight', minWeight: 55, maxWeight: 63, label: '-63 kg' },
            { id: 'j-f-heavy', name: 'Heavyweight', minWeight: 63, maxWeight: 110, label: '+63 kg' }
        ]
    },
    senior: {
        male: [
            { id: 's-m-fin', name: 'Finweight', maxWeight: 54, label: 'Under 54 kg' },
            { id: 's-m-fly', name: 'Flyweight', minWeight: 54, maxWeight: 58, label: '-58 kg' },
            { id: 's-m-bantam', name: 'Bantamweight', minWeight: 58, maxWeight: 63, label: '-63 kg' },
            { id: 's-m-feather', name: 'Featherweight', minWeight: 63, maxWeight: 68, label: '-68 kg' },
            { id: 's-m-light', name: 'Lightweight', minWeight: 68, maxWeight: 74, label: '-74 kg' },
            { id: 's-m-welter', name: 'Welterweight', minWeight: 74, maxWeight: 80, label: '-80 kg' },
            { id: 's-m-middle', name: 'Middleweight', minWeight: 80, maxWeight: 87, label: '-87 kg' },
            { id: 's-m-heavy', name: 'Heavyweight', minWeight: 87, maxWeight: 140, label: '+87 kg' }
        ],
        female: [
            { id: 's-f-fin', name: 'Finweight', maxWeight: 46, label: 'Under 46 kg' },
            { id: 's-f-fly', name: 'Flyweight', minWeight: 46, maxWeight: 49, label: '-49 kg' },
            { id: 's-f-bantam', name: 'Bantamweight', minWeight: 49, maxWeight: 53, label: '-53 kg' },
            { id: 's-f-feather', name: 'Featherweight', minWeight: 53, maxWeight: 57, label: '-57 kg' },
            { id: 's-f-light', name: 'Lightweight', minWeight: 57, maxWeight: 62, label: '-62 kg' },
            { id: 's-f-welter', name: 'Welterweight', minWeight: 62, maxWeight: 67, label: '-67 kg' },
            { id: 's-f-middle', name: 'Middleweight', minWeight: 67, maxWeight: 73, label: '-73 kg' },
            { id: 's-f-heavy', name: 'Heavyweight', minWeight: 73, maxWeight: 120, label: '+73 kg' }
        ]
    },
    cadet: {
        male: [
            { id: 'c-m-fin', name: 'Finweight', maxWeight: 33, label: '-33 kg' },
            { id: 'c-m-fly', name: 'Flyweight', minWeight: 33, maxWeight: 37, label: '-37 kg' },
            { id: 'c-m-bantam', name: 'Bantamweight', minWeight: 37, maxWeight: 41, label: '-41 kg' },
            { id: 'c-m-feather', name: 'Featherweight', minWeight: 41, maxWeight: 45, label: '-45 kg' },
            { id: 'c-m-light', name: 'Lightweight', minWeight: 45, maxWeight: 49, label: '-49 kg' },
            { id: 'c-m-heavy', name: 'Heavyweight', minWeight: 49, maxWeight: 70, label: '+49 kg' }
        ],
        female: [
            { id: 'c-f-fin', name: 'Finweight', maxWeight: 29, label: '-29 kg' },
            { id: 'c-f-fly', name: 'Flyweight', minWeight: 29, maxWeight: 33, label: '-33 kg' },
            { id: 'c-f-bantam', name: 'Bantamweight', minWeight: 33, maxWeight: 37, label: '-37 kg' },
            { id: 'c-f-feather', name: 'Featherweight', minWeight: 37, maxWeight: 41, label: '-41 kg' },
            { id: 'c-f-light', name: 'Lightweight', minWeight: 41, maxWeight: 44, label: '-44 kg' },
            { id: 'c-f-heavy', name: 'Heavyweight', minWeight: 44, maxWeight: 65, label: '+44 kg' }
        ]
    }
};

export const POOMSAE_FORMS = [
    { id: 'taegeuk-1', name: 'Taegeuk 1 Il Jang', meaning: 'Keon (Heaven, Light)' },
    { id: 'taegeuk-2', name: 'Taegeuk 2 Ee Jang', meaning: 'Tae (Joyfulness, Lake)' },
    { id: 'taegeuk-3', name: 'Taegeuk 3 Sam Jang', meaning: 'Ri (Fire, Sun)' },
    { id: 'taegeuk-4', name: 'Taegeuk 4 Sa Jang', meaning: 'Jin (Thunder)' },
    { id: 'taegeuk-5', name: 'Taegeuk 5 Oh Jang', meaning: 'Seon (Wind)' },
    { id: 'taegeuk-6', name: 'Taegeuk 6 Yook Jang', meaning: 'Gam (Water)' },
    { id: 'taegeuk-7', name: 'Taegeuk 7 Chil Jang', meaning: 'Gan (Mountain)' },
    { id: 'taegeuk-8', name: 'Taegeuk 8 Pal Jang', meaning: 'Gon (Earth)' },
    { id: 'koryo', name: 'Koryo', meaning: 'Ancient Korean Dynasty (Black Belt 1st Dan)' },
    { id: 'keumgang', name: 'Keumgang', meaning: 'Diamond / Hardness (Black Belt 2nd Dan)' },
    { id: 'taebaek', name: 'Taebaek', meaning: 'Bright Mountain (Black Belt 3rd Dan)' }
];

export const KYORUGI_POINTS = {
    PUNCH_TRUNK: { points: 1, label: 'Punch to Trunk (+1)' },
    KICK_TRUNK: { points: 2, label: 'Kick to Trunk (+2)' },
    TURNING_TRUNK: { points: 4, label: 'Turning Kick to Trunk (+4)' },
    KICK_HEAD: { points: 3, label: 'Kick to Head (+3)' },
    TURNING_HEAD: { points: 5, label: 'Turning Kick to Head (+5)' },
    GAMJEOM: { points: 1, label: 'Gam-jeom Penalty (Opponent +1)' }
};

export const CORNERS = {
    CHUNG: { id: 'chung', name: 'CHUNG (Blue)', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.15)', border: '#3b82f6', text: '#60a5fa' },
    HONG: { id: 'hong', name: 'HONG (Red)', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.15)', border: '#ef4444', text: '#f87171' }
};
