// Taekwondo Domain Constants, Categories, Divisions & Rules
// Official Kyorix Federation Tournament System Standard

const TKD_BELTS = [
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

const AGE_DIVISIONS = [
    { id: 'children', name: 'Children Division', minAge: 4, maxAge: 7, label: 'Under 8 Years (Ages 4–7)' },
    { id: 'sub-junior', name: 'Sub-Junior Division', minAge: 8, maxAge: 11, label: 'Ages 8–11' },
    { id: 'cadet', name: 'Cadet Division', minAge: 12, maxAge: 14, label: 'Ages 12–14' },
    { id: 'junior', name: 'Junior Division', minAge: 15, maxAge: 17, label: 'Ages 15–17' },
    { id: 'senior', name: 'Senior Division', minAge: 17, maxAge: 65, label: 'Ages 17+' },
    { id: 'masters', name: 'Masters Division', minAge: 36, maxAge: 75, label: '36+ yrs' }
];

const DISCIPLINES = [
    { 
        id: 'kyorugi', 
        name: 'Kyorugi (Sparring)', 
        icon: 'fa-fist-raised', 
        codePrefix: ['KY-REG-', 'KY-FR-'],
        description: 'Full-contact Olympic Taekwondo sparring with electronic scoring & protective gear' 
    },
    { 
        id: 'poomsae', 
        name: 'Poomsae (Forms)', 
        icon: 'fa-person-walking', 
        codePrefix: ['PO-IND-', 'PO-PAIR-', 'PO-TEAM-'],
        description: 'Official Recognized Individual, Mix Pair, and Team Poomsae forms evaluated on accuracy and presentation' 
    },
    { 
        id: 'kyukpa', 
        name: 'E-Breaking & Kyukpa (Breaking)', 
        icon: 'fa-burst', 
        codePrefix: ['BRK-'],
        description: 'Electronic Pad Breaking and Traditional & High Jump Kyukpa demonstrations' 
    },
    { 
        id: 'speed_kicking', 
        name: 'Speed Kicking (Electronic Frequency)', 
        icon: 'fa-bolt', 
        codePrefix: ['SK-'],
        description: 'High-frequency strike speed contests on electronic impact pads' 
    },
    { 
        id: 'virtual_tkd', 
        name: 'Virtual Taekwondo', 
        icon: 'fa-vr-cardboard', 
        codePrefix: ['VT-'],
        description: 'VR Motion-tracking Taekwondo esport sparring in Individual and Mix Gender divisions' 
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. KYORUGI FULL CATEGORIES & WEIGHT CLASSES
// Tiers: Freshers (KY-FR-...) | Regular (KY-REG-...)
// ─────────────────────────────────────────────────────────────────────────────

// Format Kyorugi Weight Category strictly as weight limit (e.g. "U 54 KG", "O 87 KG")
function formatKyorugiWeight(item) {
    if (!item) return '';
    if (typeof item === 'string') {
        const mU = item.match(/under\s*(\d+(\.\d+)?)\s*kg/i) || item.match(/u\s*(\d+(\.\d+)?)\s*kg/i) || item.match(/-(\d+)\s*kg/i);
        if (mU) return 'U ' + mU[1] + ' KG';
        const mO = item.match(/over\s*(\d+(\.\d+)?)\s*kg/i) || item.match(/o\s*(\d+(\.\d+)?)\s*kg/i) || item.match(/\+(\d+)\s*kg/i);
        if (mO) return 'O ' + mO[1] + ' KG';
        return item.toUpperCase();
    }
    if (item.weightLimit) return item.weightLimit.toUpperCase();
    const str = item.shortLabel || item.name || '';
    const mU = str.match(/under\s*(\d+(\.\d+)?)\s*kg/i) || str.match(/u\s*(\d+(\.\d+)?)\s*kg/i) || str.match(/-(\d+)\s*kg/i);
    if (mU) return 'U ' + mU[1] + ' KG';
    const mO = str.match(/over\s*(\d+(\.\d+)?)\s*kg/i) || str.match(/o\s*(\d+(\.\d+)?)\s*kg/i) || str.match(/\+(\d+)\s*kg/i);
    if (mO) return 'O ' + mO[1] + ' KG';
    if (item.maxWeight && item.maxWeight < 100) return 'U ' + item.maxWeight + ' KG';
    if (item.minWeight) return 'O ' + Math.floor(item.minWeight) + ' KG';
    return str.toUpperCase();
}

const KYORUGI_CATEGORIES = {
    senior: {
        id: 'senior',
        name: 'Senior Division',
        label: 'Senior (Ages 17+)',
        ageRange: 'Ages 17+',
        minAge: 17,
        maxAge: 65,
        Male: [
            { id: 'sen-m-u54', name: 'Finweight (Under 54kg)', shortName: 'Finweight', shortLabel: 'Under 54kg', minWeight: 45.0, maxWeight: 54.0, regularCode: 'KY-REG-SEN-M-U54', freshersCode: 'KY-FR-SEN-M-U54' },
            { id: 'sen-m-u58', name: 'Flyweight (Under 58kg)', shortName: 'Flyweight', shortLabel: 'Under 58kg', minWeight: 54.1, maxWeight: 58.0, regularCode: 'KY-REG-SEN-M-U58', freshersCode: 'KY-FR-SEN-M-U58' },
            { id: 'sen-m-u63', name: 'Bantamweight (Under 63kg)', shortName: 'Bantamweight', shortLabel: 'Under 63kg', minWeight: 58.1, maxWeight: 63.0, regularCode: 'KY-REG-SEN-M-U63', freshersCode: 'KY-FR-SEN-M-U63' },
            { id: 'sen-m-u68', name: 'Featherweight (Under 68kg)', shortName: 'Featherweight', shortLabel: 'Under 68kg', minWeight: 63.1, maxWeight: 68.0, regularCode: 'KY-REG-SEN-M-U68', freshersCode: 'KY-FR-SEN-M-U68' },
            { id: 'sen-m-u74', name: 'Lightweight (Under 74kg)', shortName: 'Lightweight', shortLabel: 'Under 74kg', minWeight: 68.1, maxWeight: 74.0, regularCode: 'KY-REG-SEN-M-U74', freshersCode: 'KY-FR-SEN-M-U74' },
            { id: 'sen-m-u80', name: 'Welterweight (Under 80kg)', shortName: 'Welterweight', shortLabel: 'Under 80kg', minWeight: 74.1, maxWeight: 80.0, regularCode: 'KY-REG-SEN-M-U80', freshersCode: 'KY-FR-SEN-M-U80' },
            { id: 'sen-m-u87', name: 'Middleweight (Under 87kg)', shortName: 'Middleweight', shortLabel: 'Under 87kg', minWeight: 80.1, maxWeight: 87.0, regularCode: 'KY-REG-SEN-M-U87', freshersCode: 'KY-FR-SEN-M-U87' },
            { id: 'sen-m-o87', name: 'Heavyweight (+87kg / Over 87kg)', shortName: 'Heavyweight', shortLabel: 'Over 87kg', minWeight: 87.1, maxWeight: 140.0, regularCode: 'KY-REG-SEN-M-O87', freshersCode: 'KY-FR-SEN-M-O87' }
        ],
        Female: [
            { id: 'sen-f-u46', name: 'Finweight (Under 46kg)', shortName: 'Finweight', shortLabel: 'Under 46kg', minWeight: 38.0, maxWeight: 46.0, regularCode: 'KY-REG-SEN-F-U46', freshersCode: 'KY-FR-SEN-F-U46' },
            { id: 'sen-f-u49', name: 'Flyweight (Under 49kg)', shortName: 'Flyweight', shortLabel: 'Under 49kg', minWeight: 46.1, maxWeight: 49.0, regularCode: 'KY-REG-SEN-F-U49', freshersCode: 'KY-FR-SEN-F-U49' },
            { id: 'sen-f-u53', name: 'Bantamweight (Under 53kg)', shortName: 'Bantamweight', shortLabel: 'Under 53kg', minWeight: 49.1, maxWeight: 53.0, regularCode: 'KY-REG-SEN-F-U53', freshersCode: 'KY-FR-SEN-F-U53' },
            { id: 'sen-f-u57', name: 'Featherweight (Under 57kg)', shortName: 'Featherweight', shortLabel: 'Under 57kg', minWeight: 53.1, maxWeight: 57.0, regularCode: 'KY-REG-SEN-F-U57', freshersCode: 'KY-FR-SEN-F-U57' },
            { id: 'sen-f-u62', name: 'Lightweight (Under 62kg)', shortName: 'Lightweight', shortLabel: 'Under 62kg', minWeight: 57.1, maxWeight: 62.0, regularCode: 'KY-REG-SEN-F-U62', freshersCode: 'KY-FR-SEN-F-U62' },
            { id: 'sen-f-u67', name: 'Welterweight (Under 67kg)', shortName: 'Welterweight', shortLabel: 'Under 67kg', minWeight: 62.1, maxWeight: 67.0, regularCode: 'KY-REG-SEN-F-U67', freshersCode: 'KY-FR-SEN-F-U67' },
            { id: 'sen-f-u73', name: 'Middleweight (Under 73kg)', shortName: 'Middleweight', shortLabel: 'Under 73kg', minWeight: 67.1, maxWeight: 73.0, regularCode: 'KY-REG-SEN-F-U73', freshersCode: 'KY-FR-SEN-F-U73' },
            { id: 'sen-f-o73', name: 'Heavyweight (+73kg / Over 73kg)', shortName: 'Heavyweight', shortLabel: 'Over 73kg', minWeight: 73.1, maxWeight: 120.0, regularCode: 'KY-REG-SEN-F-O73', freshersCode: 'KY-FR-SEN-F-O73' }
        ]
    },
    junior: {
        id: 'junior',
        name: 'Junior Division',
        label: 'Junior (Ages 15–17)',
        ageRange: 'Ages 15–17',
        minAge: 15,
        maxAge: 17,
        Male: [
            { id: 'jun-m-u45', name: 'Finweight (Under 45kg)', shortName: 'Finweight', shortLabel: 'Under 45kg', minWeight: 35.0, maxWeight: 45.0, regularCode: 'KY-REG-JUN-M-U45', freshersCode: 'KY-FR-JUN-M-U45' },
            { id: 'jun-m-u48', name: 'Flyweight (Under 48kg)', shortName: 'Flyweight', shortLabel: 'Under 48kg', minWeight: 45.1, maxWeight: 48.0, regularCode: 'KY-REG-JUN-M-U48', freshersCode: 'KY-FR-JUN-M-U48' },
            { id: 'jun-m-u51', name: 'Bantamweight (Under 51kg)', shortName: 'Bantamweight', shortLabel: 'Under 51kg', minWeight: 48.1, maxWeight: 51.0, regularCode: 'KY-REG-JUN-M-U51', freshersCode: 'KY-FR-JUN-M-U51' },
            { id: 'jun-m-u55', name: 'Featherweight (Under 55kg)', shortName: 'Featherweight', shortLabel: 'Under 55kg', minWeight: 51.1, maxWeight: 55.0, regularCode: 'KY-REG-JUN-M-U55', freshersCode: 'KY-FR-JUN-M-U55' },
            { id: 'jun-m-u59', name: 'Lightweight (Under 59kg)', shortName: 'Lightweight', shortLabel: 'Under 59kg', minWeight: 55.1, maxWeight: 59.0, regularCode: 'KY-REG-JUN-M-U59', freshersCode: 'KY-FR-JUN-M-U59' },
            { id: 'jun-m-u63', name: 'Welterweight (Under 63kg)', shortName: 'Welterweight', shortLabel: 'Under 63kg', minWeight: 59.1, maxWeight: 63.0, regularCode: 'KY-REG-JUN-M-U63', freshersCode: 'KY-FR-JUN-M-U63' },
            { id: 'jun-m-u68', name: 'Light Middle (Under 68kg)', shortName: 'Light Middle', shortLabel: 'Under 68kg', minWeight: 63.1, maxWeight: 68.0, regularCode: 'KY-REG-JUN-M-U68', freshersCode: 'KY-FR-JUN-M-U68' },
            { id: 'jun-m-u73', name: 'Middleweight (Under 73kg)', shortName: 'Middleweight', shortLabel: 'Under 73kg', minWeight: 68.1, maxWeight: 73.0, regularCode: 'KY-REG-JUN-M-U73', freshersCode: 'KY-FR-JUN-M-U73' },
            { id: 'jun-m-u78', name: 'Light Heavy (Under 78kg)', shortName: 'Light Heavy', shortLabel: 'Under 78kg', minWeight: 73.1, maxWeight: 78.0, regularCode: 'KY-REG-JUN-M-U78', freshersCode: 'KY-FR-JUN-M-U78' },
            { id: 'jun-m-o78', name: 'Heavyweight (+78kg / Over 78kg)', shortName: 'Heavyweight', shortLabel: 'Over 78kg', minWeight: 78.1, maxWeight: 120.0, regularCode: 'KY-REG-JUN-M-O78', freshersCode: 'KY-FR-JUN-M-O78' }
        ],
        Female: [
            { id: 'jun-f-u42', name: 'Finweight (Under 42kg)', shortName: 'Finweight', shortLabel: 'Under 42kg', minWeight: 32.0, maxWeight: 42.0, regularCode: 'KY-REG-JUN-F-U42', freshersCode: 'KY-FR-JUN-F-U42' },
            { id: 'jun-f-u44', name: 'Flyweight (Under 44kg)', shortName: 'Flyweight', shortLabel: 'Under 44kg', minWeight: 42.1, maxWeight: 44.0, regularCode: 'KY-REG-JUN-F-U44', freshersCode: 'KY-FR-JUN-F-U44' },
            { id: 'jun-f-u46', name: 'Bantamweight (Under 46kg)', shortName: 'Bantamweight', shortLabel: 'Under 46kg', minWeight: 44.1, maxWeight: 46.0, regularCode: 'KY-REG-JUN-F-U46', freshersCode: 'KY-FR-JUN-F-U46' },
            { id: 'jun-f-u49', name: 'Featherweight (Under 49kg)', shortName: 'Featherweight', shortLabel: 'Under 49kg', minWeight: 46.1, maxWeight: 49.0, regularCode: 'KY-REG-JUN-F-U49', freshersCode: 'KY-FR-JUN-F-U49' },
            { id: 'jun-f-u52', name: 'Lightweight (Under 52kg)', shortName: 'Lightweight', shortLabel: 'Under 52kg', minWeight: 49.1, maxWeight: 52.0, regularCode: 'KY-REG-JUN-F-U52', freshersCode: 'KY-FR-JUN-F-U52' },
            { id: 'jun-f-u55', name: 'Welterweight (Under 55kg)', shortName: 'Welterweight', shortLabel: 'Under 55kg', minWeight: 52.1, maxWeight: 55.0, regularCode: 'KY-REG-JUN-F-U55', freshersCode: 'KY-FR-JUN-F-U55' },
            { id: 'jun-f-u59', name: 'Light Middle (Under 59kg)', shortName: 'Light Middle', shortLabel: 'Under 59kg', minWeight: 55.1, maxWeight: 59.0, regularCode: 'KY-REG-JUN-F-U59', freshersCode: 'KY-FR-JUN-F-U59' },
            { id: 'jun-f-u63', name: 'Middleweight (Under 63kg)', shortName: 'Middleweight', shortLabel: 'Under 63kg', minWeight: 59.1, maxWeight: 63.0, regularCode: 'KY-REG-JUN-F-U63', freshersCode: 'KY-FR-JUN-F-U63' },
            { id: 'jun-f-u68', name: 'Light Heavy (Under 68kg)', shortName: 'Light Heavy', shortLabel: 'Under 68kg', minWeight: 63.1, maxWeight: 68.0, regularCode: 'KY-REG-JUN-F-U68', freshersCode: 'KY-FR-JUN-F-U68' },
            { id: 'jun-f-o68', name: 'Heavyweight (+68kg / Over 68kg)', shortName: 'Heavyweight', shortLabel: 'Over 68kg', minWeight: 68.1, maxWeight: 105.0, regularCode: 'KY-REG-JUN-F-O68', freshersCode: 'KY-FR-JUN-F-O68' }
        ]
    },
    cadet: {
        id: 'cadet',
        name: 'Cadet Division',
        label: 'Cadet (Ages 12–14)',
        ageRange: 'Ages 12–14',
        minAge: 12,
        maxAge: 14,
        Male: [
            { id: 'cad-m-u33', name: 'Finweight (Under 33kg)', shortName: 'Finweight', shortLabel: 'Under 33kg', minWeight: 25.0, maxWeight: 33.0, regularCode: 'KY-REG-CAD-M-U33', freshersCode: 'KY-FR-CAD-M-U33' },
            { id: 'cad-m-u37', name: 'Flyweight (Under 37kg)', shortName: 'Flyweight', shortLabel: 'Under 37kg', minWeight: 33.1, maxWeight: 37.0, regularCode: 'KY-REG-CAD-M-U37', freshersCode: 'KY-FR-CAD-M-U37' },
            { id: 'cad-m-u41', name: 'Bantamweight (Under 41kg)', shortName: 'Bantamweight', shortLabel: 'Under 41kg', minWeight: 37.1, maxWeight: 41.0, regularCode: 'KY-REG-CAD-M-U41', freshersCode: 'KY-FR-CAD-M-U41' },
            { id: 'cad-m-u45', name: 'Featherweight (Under 45kg)', shortName: 'Featherweight', shortLabel: 'Under 45kg', minWeight: 41.1, maxWeight: 45.0, regularCode: 'KY-REG-CAD-M-U45', freshersCode: 'KY-FR-CAD-M-U45' },
            { id: 'cad-m-u49', name: 'Lightweight (Under 49kg)', shortName: 'Lightweight', shortLabel: 'Under 49kg', minWeight: 45.1, maxWeight: 49.0, regularCode: 'KY-REG-CAD-M-U49', freshersCode: 'KY-FR-CAD-M-U49' },
            { id: 'cad-m-u53', name: 'Welterweight (Under 53kg)', shortName: 'Welterweight', shortLabel: 'Under 53kg', minWeight: 49.1, maxWeight: 53.0, regularCode: 'KY-REG-CAD-M-U53', freshersCode: 'KY-FR-CAD-M-U53' },
            { id: 'cad-m-u57', name: 'Light Middle (Under 57kg)', shortName: 'Light Middle', shortLabel: 'Under 57kg', minWeight: 53.1, maxWeight: 57.0, regularCode: 'KY-REG-CAD-M-U57', freshersCode: 'KY-FR-CAD-M-U57' },
            { id: 'cad-m-u61', name: 'Middleweight (Under 61kg)', shortName: 'Middleweight', shortLabel: 'Under 61kg', minWeight: 57.1, maxWeight: 61.0, regularCode: 'KY-REG-CAD-M-U61', freshersCode: 'KY-FR-CAD-M-U61' },
            { id: 'cad-m-u65', name: 'Light Heavy (Under 65kg)', shortName: 'Light Heavy', shortLabel: 'Under 65kg', minWeight: 61.1, maxWeight: 65.0, regularCode: 'KY-REG-CAD-M-U65', freshersCode: 'KY-FR-CAD-M-U65' },
            { id: 'cad-m-o65', name: 'Heavyweight (+65kg / Over 65kg)', shortName: 'Heavyweight', shortLabel: 'Over 65kg', minWeight: 65.1, maxWeight: 95.0, regularCode: 'KY-REG-CAD-M-O65', freshersCode: 'KY-FR-CAD-M-O65' }
        ],
        Female: [
            { id: 'cad-f-u29', name: 'Finweight (Under 29kg)', shortName: 'Finweight', shortLabel: 'Under 29kg', minWeight: 22.0, maxWeight: 29.0, regularCode: 'KY-REG-CAD-F-U29', freshersCode: 'KY-FR-CAD-F-U29' },
            { id: 'cad-f-u33', name: 'Flyweight (Under 33kg)', shortName: 'Flyweight', shortLabel: 'Under 33kg', minWeight: 29.1, maxWeight: 33.0, regularCode: 'KY-REG-CAD-F-U33', freshersCode: 'KY-FR-CAD-F-U33' },
            { id: 'cad-f-u37', name: 'Bantamweight (Under 37kg)', shortName: 'Bantamweight', shortLabel: 'Under 37kg', minWeight: 33.1, maxWeight: 37.0, regularCode: 'KY-REG-CAD-F-U37', freshersCode: 'KY-FR-CAD-F-U37' },
            { id: 'cad-f-u41', name: 'Featherweight (Under 41kg)', shortName: 'Featherweight', shortLabel: 'Under 41kg', minWeight: 37.1, maxWeight: 41.0, regularCode: 'KY-REG-CAD-F-U41', freshersCode: 'KY-FR-CAD-F-U41' },
            { id: 'cad-f-u44', name: 'Lightweight (Under 44kg)', shortName: 'Lightweight', shortLabel: 'Under 44kg', minWeight: 41.1, maxWeight: 44.0, regularCode: 'KY-REG-CAD-F-U44', freshersCode: 'KY-FR-CAD-F-U44' },
            { id: 'cad-f-u47', name: 'Welterweight (Under 47kg)', shortName: 'Welterweight', shortLabel: 'Under 47kg', minWeight: 44.1, maxWeight: 47.0, regularCode: 'KY-REG-CAD-F-U47', freshersCode: 'KY-FR-CAD-F-U47' },
            { id: 'cad-f-u51', name: 'Light Middle (Under 51kg)', shortName: 'Light Middle', shortLabel: 'Under 51kg', minWeight: 47.1, maxWeight: 51.0, regularCode: 'KY-REG-CAD-F-U51', freshersCode: 'KY-FR-CAD-F-U51' },
            { id: 'cad-f-u55', name: 'Middleweight (Under 55kg)', shortName: 'Middleweight', shortLabel: 'Under 55kg', minWeight: 51.1, maxWeight: 55.0, regularCode: 'KY-REG-CAD-F-U55', freshersCode: 'KY-FR-CAD-F-U55' },
            { id: 'cad-f-u59', name: 'Light Heavy (Under 59kg)', shortName: 'Light Heavy', shortLabel: 'Under 59kg', minWeight: 55.1, maxWeight: 59.0, regularCode: 'KY-REG-CAD-F-U59', freshersCode: 'KY-FR-CAD-F-U59' },
            { id: 'cad-f-o59', name: 'Heavyweight (+59kg / Over 59kg)', shortName: 'Heavyweight', shortLabel: 'Over 59kg', minWeight: 59.1, maxWeight: 85.0, regularCode: 'KY-REG-CAD-F-O59', freshersCode: 'KY-FR-CAD-F-O59' }
        ]
    },
    'sub-junior': {
        id: 'sub-junior',
        name: 'Sub-Junior Division',
        label: 'Sub-Junior (Ages 8–11)',
        ageRange: 'Ages 8–11',
        minAge: 8,
        maxAge: 11,
        Male: [
            { id: 'sub-m-u18', name: 'Under 18kg', shortName: 'Under 18kg', shortLabel: 'Under 18kg', minWeight: 12.0, maxWeight: 18.0, regularCode: 'KY-REG-SUB-M-U18', freshersCode: 'KY-FR-SUB-M-U18' },
            { id: 'sub-m-u21', name: 'Under 21kg', shortName: 'Under 21kg', shortLabel: 'Under 21kg', minWeight: 18.1, maxWeight: 21.0, regularCode: 'KY-REG-SUB-M-U21', freshersCode: 'KY-FR-SUB-M-U21' },
            { id: 'sub-m-u23', name: 'Under 23kg', shortName: 'Under 23kg', shortLabel: 'Under 23kg', minWeight: 21.1, maxWeight: 23.0, regularCode: 'KY-REG-SUB-M-U23', freshersCode: 'KY-FR-SUB-M-U23' },
            { id: 'sub-m-u25', name: 'Under 25kg', shortName: 'Under 25kg', shortLabel: 'Under 25kg', minWeight: 23.1, maxWeight: 25.0, regularCode: 'KY-REG-SUB-M-U25', freshersCode: 'KY-FR-SUB-M-U25' },
            { id: 'sub-m-u27', name: 'Under 27kg', shortName: 'Under 27kg', shortLabel: 'Under 27kg', minWeight: 25.1, maxWeight: 27.0, regularCode: 'KY-REG-SUB-M-U27', freshersCode: 'KY-FR-SUB-M-U27' },
            { id: 'sub-m-u29', name: 'Under 29kg', shortName: 'Under 29kg', shortLabel: 'Under 29kg', minWeight: 27.1, maxWeight: 29.0, regularCode: 'KY-REG-SUB-M-U29', freshersCode: 'KY-FR-SUB-M-U29' },
            { id: 'sub-m-u32', name: 'Under 32kg', shortName: 'Under 32kg', shortLabel: 'Under 32kg', minWeight: 29.1, maxWeight: 32.0, regularCode: 'KY-REG-SUB-M-U32', freshersCode: 'KY-FR-SUB-M-U32' },
            { id: 'sub-m-u35', name: 'Under 35kg', shortName: 'Under 35kg', shortLabel: 'Under 35kg', minWeight: 32.1, maxWeight: 35.0, regularCode: 'KY-REG-SUB-M-U35', freshersCode: 'KY-FR-SUB-M-U35' },
            { id: 'sub-m-u38', name: 'Under 38kg', shortName: 'Under 38kg', shortLabel: 'Under 38kg', minWeight: 35.1, maxWeight: 38.0, regularCode: 'KY-REG-SUB-M-U38', freshersCode: 'KY-FR-SUB-M-U38' },
            { id: 'sub-m-u41', name: 'Under 41kg', shortName: 'Under 41kg', shortLabel: 'Under 41kg', minWeight: 38.1, maxWeight: 41.0, regularCode: 'KY-REG-SUB-M-U41', freshersCode: 'KY-FR-SUB-M-U41' },
            { id: 'sub-m-u44', name: 'Under 44kg', shortName: 'Under 44kg', shortLabel: 'Under 44kg', minWeight: 41.1, maxWeight: 44.0, regularCode: 'KY-REG-SUB-M-U44', freshersCode: 'KY-FR-SUB-M-U44' },
            { id: 'sub-m-u50', name: 'Under 50kg', shortName: 'Under 50kg', shortLabel: 'Under 50kg', minWeight: 44.1, maxWeight: 50.0, regularCode: 'KY-REG-SUB-M-U50', freshersCode: 'KY-FR-SUB-M-U50' },
            { id: 'sub-m-o50', name: 'Over 50kg (+50kg)', shortName: 'Over 50kg', shortLabel: 'Over 50kg', minWeight: 50.1, maxWeight: 80.0, regularCode: 'KY-REG-SUB-M-O50', freshersCode: 'KY-FR-SUB-M-O50' }
        ],
        Female: [
            { id: 'sub-f-u16', name: 'Under 16kg', shortName: 'Under 16kg', shortLabel: 'Under 16kg', minWeight: 12.0, maxWeight: 16.0, regularCode: 'KY-REG-SUB-F-U16', freshersCode: 'KY-FR-SUB-F-U16' },
            { id: 'sub-f-u18', name: 'Under 18kg', shortName: 'Under 18kg', shortLabel: 'Under 18kg', minWeight: 16.1, maxWeight: 18.0, regularCode: 'KY-REG-SUB-F-U18', freshersCode: 'KY-FR-SUB-F-U18' },
            { id: 'sub-f-u20', name: 'Under 20kg', shortName: 'Under 20kg', shortLabel: 'Under 20kg', minWeight: 18.1, maxWeight: 20.0, regularCode: 'KY-REG-SUB-F-U20', freshersCode: 'KY-FR-SUB-F-U20' },
            { id: 'sub-f-u22', name: 'Under 22kg', shortName: 'Under 22kg', shortLabel: 'Under 22kg', minWeight: 20.1, maxWeight: 22.0, regularCode: 'KY-REG-SUB-F-U22', freshersCode: 'KY-FR-SUB-F-U22' },
            { id: 'sub-f-u24', name: 'Under 24kg', shortName: 'Under 24kg', shortLabel: 'Under 24kg', minWeight: 22.1, maxWeight: 24.0, regularCode: 'KY-REG-SUB-F-U24', freshersCode: 'KY-FR-SUB-F-U24' },
            { id: 'sub-f-u26', name: 'Under 26kg', shortName: 'Under 26kg', shortLabel: 'Under 26kg', minWeight: 24.1, maxWeight: 26.0, regularCode: 'KY-REG-SUB-F-U26', freshersCode: 'KY-FR-SUB-F-U26' },
            { id: 'sub-f-u29', name: 'Under 29kg', shortName: 'Under 29kg', shortLabel: 'Under 29kg', minWeight: 26.1, maxWeight: 29.0, regularCode: 'KY-REG-SUB-F-U29', freshersCode: 'KY-FR-SUB-F-U29' },
            { id: 'sub-f-u32', name: 'Under 32kg', shortName: 'Under 32kg', shortLabel: 'Under 32kg', minWeight: 29.1, maxWeight: 32.0, regularCode: 'KY-REG-SUB-F-U32', freshersCode: 'KY-FR-SUB-F-U32' },
            { id: 'sub-f-u35', name: 'Under 35kg', shortName: 'Under 35kg', shortLabel: 'Under 35kg', minWeight: 32.1, maxWeight: 35.0, regularCode: 'KY-REG-SUB-F-U35', freshersCode: 'KY-FR-SUB-F-U35' },
            { id: 'sub-f-u38', name: 'Under 38kg', shortName: 'Under 38kg', shortLabel: 'Under 38kg', minWeight: 35.1, maxWeight: 38.0, regularCode: 'KY-REG-SUB-F-U38', freshersCode: 'KY-FR-SUB-F-U38' },
            { id: 'sub-f-u41', name: 'Under 41kg', shortName: 'Under 41kg', shortLabel: 'Under 41kg', minWeight: 38.1, maxWeight: 41.0, regularCode: 'KY-REG-SUB-F-U41', freshersCode: 'KY-FR-SUB-F-U41' },
            { id: 'sub-f-u47', name: 'Under 47kg', shortName: 'Under 47kg', shortLabel: 'Under 47kg', minWeight: 41.1, maxWeight: 47.0, regularCode: 'KY-REG-SUB-F-U47', freshersCode: 'KY-FR-SUB-F-U47' },
            { id: 'sub-f-o47', name: 'Over 47kg (+47kg)', shortName: 'Over 47kg', shortLabel: 'Over 47kg', minWeight: 47.1, maxWeight: 75.0, regularCode: 'KY-REG-SUB-F-O47', freshersCode: 'KY-FR-SUB-F-O47' }
        ]
    },
    children: {
        id: 'children',
        name: 'Children Division',
        label: 'Children (Under 8 Years / Ages 4–7)',
        ageRange: 'Ages 4–7',
        minAge: 4,
        maxAge: 7,
        Male: [
            { id: 'chi-m-u16', name: 'Under 16kg', shortName: 'Under 16kg', shortLabel: 'Under 16kg', minWeight: 10.0, maxWeight: 16.0, regularCode: 'KY-REG-CHI-M-U16', freshersCode: 'KY-FR-CHI-M-U16' },
            { id: 'chi-m-u18', name: 'Under 18kg', shortName: 'Under 18kg', shortLabel: 'Under 18kg', minWeight: 16.1, maxWeight: 18.0, regularCode: 'KY-REG-CHI-M-U18', freshersCode: 'KY-FR-CHI-M-U18' },
            { id: 'chi-m-u20', name: 'Under 20kg', shortName: 'Under 20kg', shortLabel: 'Under 20kg', minWeight: 18.1, maxWeight: 20.0, regularCode: 'KY-REG-CHI-M-U20', freshersCode: 'KY-FR-CHI-M-U20' },
            { id: 'chi-m-u22', name: 'Under 22kg', shortName: 'Under 22kg', shortLabel: 'Under 22kg', minWeight: 20.1, maxWeight: 22.0, regularCode: 'KY-REG-CHI-M-U22', freshersCode: 'KY-FR-CHI-M-U22' },
            { id: 'chi-m-u24', name: 'Under 24kg', shortName: 'Under 24kg', shortLabel: 'Under 24kg', minWeight: 22.1, maxWeight: 24.0, regularCode: 'KY-REG-CHI-M-U24', freshersCode: 'KY-FR-CHI-M-U24' },
            { id: 'chi-m-u26', name: 'Under 26kg', shortName: 'Under 26kg', shortLabel: 'Under 26kg', minWeight: 24.1, maxWeight: 26.0, regularCode: 'KY-REG-CHI-M-U26', freshersCode: 'KY-FR-CHI-M-U26' },
            { id: 'chi-m-u28', name: 'Under 28kg', shortName: 'Under 28kg', shortLabel: 'Under 28kg', minWeight: 26.1, maxWeight: 28.0, regularCode: 'KY-REG-CHI-M-U28', freshersCode: 'KY-FR-CHI-M-U28' },
            { id: 'chi-m-u32', name: 'Under 32kg', shortName: 'Under 32kg', shortLabel: 'Under 32kg', minWeight: 28.1, maxWeight: 32.0, regularCode: 'KY-REG-CHI-M-U32', freshersCode: 'KY-FR-CHI-M-U32' },
            { id: 'chi-m-u36', name: 'Under 36kg', shortName: 'Under 36kg', shortLabel: 'Under 36kg', minWeight: 32.1, maxWeight: 36.0, regularCode: 'KY-REG-CHI-M-U36', freshersCode: 'KY-FR-CHI-M-U36' },
            { id: 'chi-m-o36', name: 'Over 36kg (+36kg)', shortName: 'Over 36kg', shortLabel: 'Over 36kg', minWeight: 36.1, maxWeight: 60.0, regularCode: 'KY-REG-CHI-M-O36', freshersCode: 'KY-FR-CHI-M-O36' }
        ],
        Female: [
            { id: 'chi-f-u14', name: 'Under 14kg', shortName: 'Under 14kg', shortLabel: 'Under 14kg', minWeight: 10.0, maxWeight: 14.0, regularCode: 'KY-REG-CHI-F-U14', freshersCode: 'KY-FR-CHI-F-U14' },
            { id: 'chi-f-u16', name: 'Under 16kg', shortName: 'Under 16kg', shortLabel: 'Under 16kg', minWeight: 14.1, maxWeight: 16.0, regularCode: 'KY-REG-CHI-F-U16', freshersCode: 'KY-FR-CHI-F-U16' },
            { id: 'chi-f-u18', name: 'Under 18kg', shortName: 'Under 18kg', shortLabel: 'Under 18kg', minWeight: 16.1, maxWeight: 18.0, regularCode: 'KY-REG-CHI-F-U18', freshersCode: 'KY-FR-CHI-F-U18' },
            { id: 'chi-f-u20', name: 'Under 20kg', shortName: 'Under 20kg', shortLabel: 'Under 20kg', minWeight: 18.1, maxWeight: 20.0, regularCode: 'KY-REG-CHI-F-U20', freshersCode: 'KY-FR-CHI-F-U20' },
            { id: 'chi-f-u22', name: 'Under 22kg', shortName: 'Under 22kg', shortLabel: 'Under 22kg', minWeight: 20.1, maxWeight: 22.0, regularCode: 'KY-REG-CHI-F-U22', freshersCode: 'KY-FR-CHI-F-U22' },
            { id: 'chi-f-u24', name: 'Under 24kg', shortName: 'Under 24kg', shortLabel: 'Under 24kg', minWeight: 22.1, maxWeight: 24.0, regularCode: 'KY-REG-CHI-F-U24', freshersCode: 'KY-FR-CHI-F-U24' },
            { id: 'chi-f-u26', name: 'Under 26kg', shortName: 'Under 26kg', shortLabel: 'Under 26kg', minWeight: 24.1, maxWeight: 26.0, regularCode: 'KY-REG-CHI-F-U26', freshersCode: 'KY-FR-CHI-F-U26' },
            { id: 'chi-f-u28', name: 'Under 28kg', shortName: 'Under 28kg', shortLabel: 'Under 28kg', minWeight: 26.1, maxWeight: 28.0, regularCode: 'KY-REG-CHI-F-U28', freshersCode: 'KY-FR-CHI-F-U28' },
            { id: 'chi-f-u32', name: 'Under 32kg', shortName: 'Under 32kg', shortLabel: 'Under 32kg', minWeight: 28.1, maxWeight: 32.0, regularCode: 'KY-REG-CHI-F-U32', freshersCode: 'KY-FR-CHI-F-U32' },
            { id: 'chi-f-o32', name: 'Over 32kg (+32kg)', shortName: 'Over 32kg', shortLabel: 'Over 32kg', minWeight: 32.1, maxWeight: 55.0, regularCode: 'KY-REG-CHI-F-O32', freshersCode: 'KY-FR-CHI-F-O32' }
        ]
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. POOMSAE FULL CATEGORIES & CLASSIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
const POOMSAE_CATEGORIES = {
    individual: {
        id: 'individual',
        name: 'Recognised Individual Poomsae',
        Freshers: [
            { name: 'Recognised Individual (Children)', ageLabel: 'Under 12 Years / Ages 5–11 (Born After 2014)', code: 'PO-IND-FR-CHILD' },
            { name: 'Recognised Individual (Sub Junior)', ageLabel: 'Ages 10–11 (Born 2013–2014)', code: 'PO-IND-FR-SUBJUN' },
            { name: 'Recognised Individual (Cadet)', ageLabel: 'Ages 12–14 (Born 2010–2012)', code: 'PO-IND-FR-CADET' }
        ],
        Regular: [
            { name: 'Recognised Individual (Sub Junior)', ageLabel: 'Ages 10–11 (Born 2013–2014)', code: 'PO-IND-REG-SUBJUN' },
            { name: 'Recognised Individual (Cadet)', ageLabel: 'Ages 12–14 (Born 2010–2012)', code: 'PO-IND-REG-CADET' },
            { name: 'Recognised Individual (Junior)', ageLabel: 'Ages 15–17 (Born 2007–2009)', code: 'PO-IND-REG-JUN' },
            { name: 'Recognised Individual (Under 30 Yrs)', ageLabel: 'Ages 18–30 (Born 1994–2006)', code: 'PO-IND-REG-U30' },
            { name: 'Recognised Individual (Under 40 Yrs)', ageLabel: 'Ages 31–40 (Born 1984–1993)', code: 'PO-IND-REG-U40' },
            { name: 'Recognised Individual (Under 50 Yrs)', ageLabel: 'Ages 41–50 (Born 1974–1983)', code: 'PO-IND-REG-U50' },
            { name: 'Recognised Individual (Under 60 Yrs)', ageLabel: 'Ages 51–60 (Born 1964–1973)', code: 'PO-IND-REG-U60' },
            { name: 'Recognised Individual (Under 65 Yrs)', ageLabel: 'Ages 61–65 (Born 1959–1963)', code: 'PO-IND-REG-U65' },
            { name: 'Recognised Individual (Over 65 Yrs)', ageLabel: '66 Years & Over (Born 1958 & Before)', code: 'PO-IND-REG-O65' }
        ]
    },
    pair: {
        id: 'pair',
        name: 'Recognised Mix Pair Poomsae (1 Male + 1 Female)',
        Freshers: [
            { name: 'Recognised Mix Pair (Children)', ageLabel: 'Under 12 Years / Ages 5–11', code: 'PO-PAIR-FR-CHILD' },
            { name: 'Recognised Mix Pair (Sub Junior)', ageLabel: 'Ages 10–11', code: 'PO-PAIR-FR-SUBJUN' },
            { name: 'Recognised Mix Pair (Cadet)', ageLabel: 'Ages 12–14', code: 'PO-PAIR-FR-CADET' }
        ],
        Regular: [
            { name: 'Recognised Mix Pair (Children)', ageLabel: 'Under 12 Years / Ages 5–11', code: 'PO-PAIR-REG-CHILD' },
            { name: 'Recognised Mix Pair (Sub Junior)', ageLabel: 'Ages 10–11', code: 'PO-PAIR-REG-SUBJUN' },
            { name: 'Recognised Mix Pair (Cadet)', ageLabel: 'Ages 12–14', code: 'PO-PAIR-REG-CADET' },
            { name: 'Recognised Mix Pair (Junior)', ageLabel: 'Ages 15–17', code: 'PO-PAIR-REG-JUN' },
            { name: 'Recognised Mix Pair (Under 30 Yrs)', ageLabel: 'Ages 18–30', code: 'PO-PAIR-REG-U30' },
            { name: 'Recognised Mix Pair (Under 40 Yrs)', ageLabel: 'Ages 31–40', code: 'PO-PAIR-REG-U40' },
            { name: 'Recognised Mix Pair (Under 50 Yrs)', ageLabel: 'Ages 41–50', code: 'PO-PAIR-REG-U50' },
            { name: 'Recognised Mix Pair (Under 60 Yrs)', ageLabel: 'Ages 51–60', code: 'PO-PAIR-REG-U60' },
            { name: 'Recognised Mix Pair (Over 60 Yrs)', ageLabel: '61 Years & Over', code: 'PO-PAIR-REG-O60' }
        ]
    },
    team: {
        id: 'team',
        name: 'Recognised Team Poomsae (3 Male or 3 Female)',
        Freshers: [
            { name: 'Recognised Team (Children)', ageLabel: 'Under 12 Years / Ages 5–11', code: 'PO-TEAM-FR-CHILD' },
            { name: 'Recognised Team (Sub Junior)', ageLabel: 'Ages 10–11', code: 'PO-TEAM-FR-SUBJUN' },
            { name: 'Recognised Team (Cadet)', ageLabel: 'Ages 12–14', code: 'PO-TEAM-FR-CADET' }
        ],
        Regular: [
            { name: 'Recognised Team (Cadet)', ageLabel: 'Ages 12–14', code: 'PO-TEAM-REG-CADET' },
            { name: 'Recognised Team (Junior)', ageLabel: 'Ages 15–17', code: 'PO-TEAM-REG-JUN' },
            { name: 'Recognised Team (Under 30 Yrs)', ageLabel: 'Ages 18–30', code: 'PO-TEAM-REG-U30' },
            { name: 'Recognised Team (Under 40 Yrs)', ageLabel: 'Ages 31–40', code: 'PO-TEAM-REG-U40' },
            { name: 'Recognised Team (Under 50 Yrs)', ageLabel: 'Ages 41–50', code: 'PO-TEAM-REG-U50' },
            { name: 'Recognised Team (Under 60 Yrs)', ageLabel: 'Ages 51–60', code: 'PO-TEAM-REG-U60' },
            { name: 'Recognised Team (Over 60 Yrs)', ageLabel: '61 Years & Over', code: 'PO-TEAM-REG-O60' }
        ]
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. E-BREAKING & KYUKPA CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
const BREAKING_CATEGORIES = {
    Freshers: [
        { name: 'E-Breaking (Freshers) - Knife Hand', technique: 'Knife Hand', division: 'Open (Ages 5–65)', code: 'BRK-FR-KNIFE-HAND' },
        { name: 'E-Breaking (Freshers) - Close Fist Jireugi', technique: 'Close Fist Jireugi', division: 'Open (Ages 5–65)', code: 'BRK-FR-CLOSE-FIST' },
        { name: 'E-Breaking (Freshers) - Side Kick', technique: 'Side Kick', division: 'Open (Ages 5–65)', code: 'BRK-FR-SIDE-KICK' },
        { name: 'E-Breaking (Freshers) - Back Kick', technique: 'Back Kick', division: 'Open (Ages 5–65)', code: 'BRK-FR-BACK-KICK' }
    ],
    Regular: [
        { name: 'E-Breaking (Regular) - Knife Hand', technique: 'Knife Hand', division: 'Open (Ages 5–65)', code: 'BRK-REG-KNIFE-HAND' },
        { name: 'E-Breaking (Regular) - Close Fist Jireugi', technique: 'Close Fist Jireugi', division: 'Open (Ages 5–65)', code: 'BRK-REG-CLOSE-FIST' },
        { name: 'E-Breaking (Regular) - Side Kick', technique: 'Side Kick', division: 'Open (Ages 5–65)', code: 'BRK-REG-SIDE-KICK' },
        { name: 'E-Breaking (Regular) - Back Kick', technique: 'Back Kick', division: 'Open (Ages 5–65)', code: 'BRK-REG-BACK-KICK' }
    ],
    Traditional: [
        { name: 'High Jump & Kyukpa Power Breaking', technique: 'High Jump Kyukpa', division: 'Senior / Ages 16+ (1st Dan / Poom & above)', code: 'BRK-HIGH-KYUKPA', altCode: 'DM-KYUKPA-HIGH' },
        { name: 'Championship Team Breaking (Open)', technique: 'Open Team Demonstration', division: 'Open Team Demonstration', code: 'BRK-TEAM-DEMO', altCode: 'DM-TEAM-OPEN' },
        { name: 'Individual Technical Breaking', technique: 'Precision aerial & multi-target breaking', division: 'Precision aerial & multi-target breaking', code: 'BRK-TECH-IND' }
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. SPEED KICKING CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
const SPEED_KICKING_CATEGORIES = {
    Individual: [
        { name: 'Speed Kicking Individual (Freshers) Front Kick', tier: 'Freshers', technique: 'Front Kick', division: 'Open (Ages 5–65)', code: 'SK-IND-FR-FRONT', altCode: 'SK-IND-FRESH' },
        { name: 'Speed Kicking Individual (Regular) Round House Kick', tier: 'Regular', technique: 'Round House Kick', division: 'Open (Ages 5–65)', code: 'SK-IND-REG-ROUND', altCode: 'SK-IND-REG-ROUNDHOUSE' },
        { name: 'Speed Kicking Individual (Regular) Turning Kick', tier: 'Regular', technique: 'Turning Kick', division: 'Open (Ages 5–65)', code: 'SK-IND-REG-TURN', altCode: 'SK-IND-REG-TURNING' }
    ],
    Team: [
        { name: 'Speed Kicking Team (Male) Under 17 Years', gender: 'Male', ageLimit: 'Under 17 Years', code: 'SK-TEAM-M-U17' },
        { name: 'Speed Kicking Team (Male) Over 17 Years', gender: 'Male', ageLimit: 'Over 17 Years', code: 'SK-TEAM-M-O17' },
        { name: 'Speed Kicking Team (Female) Under 17 Years', gender: 'Female', ageLimit: 'Under 17 Years', code: 'SK-TEAM-F-U17' },
        { name: 'Speed Kicking Team (Female) Over 17 Years', gender: 'Female', ageLimit: 'Over 17 Years', code: 'SK-TEAM-F-O17' }
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. VIRTUAL TAEKWONDO CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
const VIRTUAL_TKD_CATEGORIES = {
    Individual: {
        Freshers: [
            { division: 'Children', ageRange: 'Ages 5–11 (Under 12 Yrs)', code: 'VT-IND-FR-CHILD' },
            { division: 'Sub Junior', ageRange: 'Ages 10–11', code: 'VT-IND-FR-SUBJUN' },
            { division: 'Cadet', ageRange: 'Ages 12–14', code: 'VT-IND-FR-CADET' },
            { division: 'Junior', ageRange: 'Ages 15–17', code: 'VT-IND-FR-JUNIOR' },
            { division: 'Senior', ageRange: 'Ages 17–65', code: 'VT-IND-FR-SENIOR' }
        ],
        Regular: [
            { division: 'Children', ageRange: 'Ages 5–11 (Under 12 Yrs)', code: 'VT-IND-REG-CHILD' },
            { division: 'Sub Junior', ageRange: 'Ages 10–11', code: 'VT-IND-REG-SUBJUN' },
            { division: 'Cadet', ageRange: 'Ages 12–14', code: 'VT-IND-REG-CADET' },
            { division: 'Junior', ageRange: 'Ages 15–17', code: 'VT-IND-REG-JUNIOR' },
            { division: 'Senior', ageRange: 'Ages 17–65', code: 'VT-IND-REG-SENIOR' }
        ]
    },
    MixGender: {
        Freshers: [
            { division: 'Children', ageRange: 'Ages 5–11 (Under 12 Yrs)', code: 'VT-MIX-FR-CHILD' },
            { division: 'Sub Junior', ageRange: 'Ages 10–11', code: 'VT-MIX-FR-SUBJUN' },
            { division: 'Cadet', ageRange: 'Ages 12–14', code: 'VT-MIX-FR-CADET' },
            { division: 'Junior', ageRange: 'Ages 15–17', code: 'VT-MIX-FR-JUNIOR' },
            { division: 'Senior', ageRange: 'Ages 17–65', code: 'VT-MIX-FR-SENIOR' }
        ],
        Regular: [
            { division: 'Children', ageRange: 'Ages 5–11 (Under 12 Yrs)', code: 'VT-MIX-REG-CHILD' },
            { division: 'Sub Junior', ageRange: 'Ages 10–11', code: 'VT-MIX-REG-SUBJUN' },
            { division: 'Cadet', ageRange: 'Ages 12–14', code: 'VT-MIX-REG-CADET' },
            { division: 'Junior', ageRange: 'Ages 15–17', code: 'VT-MIX-REG-JUNIOR' },
            { division: 'Senior', ageRange: 'Ages 17–65', code: 'VT-MIX-REG-SENIOR' }
        ]
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED MASTER REGISTRY & LOOKUP HELPER
// ─────────────────────────────────────────────────────────────────────────────
// Aliases for case-insensitive lookup
BREAKING_CATEGORIES.freshers = BREAKING_CATEGORIES.Freshers;
BREAKING_CATEGORIES.regular = BREAKING_CATEGORIES.Regular;
BREAKING_CATEGORIES.traditional = BREAKING_CATEGORIES.Traditional;

SPEED_KICKING_CATEGORIES.individual = SPEED_KICKING_CATEGORIES.Individual;
SPEED_KICKING_CATEGORIES.team = SPEED_KICKING_CATEGORIES.Team;
SPEED_KICKING_CATEGORIES.freshers = [
    SPEED_KICKING_CATEGORIES.Individual[0]
];
SPEED_KICKING_CATEGORIES.regular = [
    SPEED_KICKING_CATEGORIES.Individual[1],
    SPEED_KICKING_CATEGORIES.Individual[2],
    ...SPEED_KICKING_CATEGORIES.Team
];

VIRTUAL_TKD_CATEGORIES.individual = VIRTUAL_TKD_CATEGORIES.Individual;
VIRTUAL_TKD_CATEGORIES.mix = VIRTUAL_TKD_CATEGORIES.MixGender;
VIRTUAL_TKD_CATEGORIES.freshers = { individual: VIRTUAL_TKD_CATEGORIES.Individual.Freshers, mix: VIRTUAL_TKD_CATEGORIES.MixGender.Freshers };
VIRTUAL_TKD_CATEGORIES.regular = { individual: VIRTUAL_TKD_CATEGORIES.Individual.Regular, mix: VIRTUAL_TKD_CATEGORIES.MixGender.Regular };

const BREAKING_DATA = BREAKING_CATEGORIES;
const SPEED_KICKING_DATA = SPEED_KICKING_CATEGORIES;
const VIRTUAL_TKD_DATA = VIRTUAL_TKD_CATEGORIES;

// Add tier views to KYORUGI_CATEGORIES
KYORUGI_CATEGORIES.regular = {};
KYORUGI_CATEGORIES.freshers = {};
['senior', 'junior', 'cadet', 'sub-junior', 'children'].forEach(div => {
    if (KYORUGI_CATEGORIES[div]) {
        KYORUGI_CATEGORIES.regular[div] = {
            Male: (KYORUGI_CATEGORIES[div].Male || []).map(item => ({ ...item, code: item.regularCode })),
            Female: (KYORUGI_CATEGORIES[div].Female || []).map(item => ({ ...item, code: item.regularCode }))
        };
        KYORUGI_CATEGORIES.freshers[div] = {
            Male: (KYORUGI_CATEGORIES[div].Male || []).map(item => ({ ...item, code: item.freshersCode })),
            Female: (KYORUGI_CATEGORIES[div].Female || []).map(item => ({ ...item, code: item.freshersCode }))
        };
    }
});

// Add tier views to POOMSAE_CATEGORIES
if (typeof POOMSAE_CATEGORIES !== 'undefined') {
    POOMSAE_CATEGORIES.freshers = {
        individual: (POOMSAE_CATEGORIES.individual && POOMSAE_CATEGORIES.individual.Freshers) || [],
        mix_pair: (POOMSAE_CATEGORIES.pair && POOMSAE_CATEGORIES.pair.Freshers) || [],
        team: (POOMSAE_CATEGORIES.team && POOMSAE_CATEGORIES.team.Freshers) || []
    };
    POOMSAE_CATEGORIES.regular = {
        individual: (POOMSAE_CATEGORIES.individual && POOMSAE_CATEGORIES.individual.Regular) || [],
        mix_pair: (POOMSAE_CATEGORIES.pair && POOMSAE_CATEGORIES.pair.Regular) || [],
        team: (POOMSAE_CATEGORIES.team && POOMSAE_CATEGORIES.team.Regular) || []
    };
}

// Virtual TKD 3-letter code aliases
const vtCodeMap = {
    'VT-IND-REG-CHI': 'VT-IND-REG-CHILD',
    'VT-IND-REG-SUB': 'VT-IND-REG-SUBJUN',
    'VT-IND-REG-CAD': 'VT-IND-REG-CADET',
    'VT-IND-REG-JUN': 'VT-IND-REG-JUNIOR',
    'VT-IND-REG-SEN': 'VT-IND-REG-SENIOR',
    'VT-IND-FR-CHI': 'VT-IND-FR-CHILD',
    'VT-IND-FR-SUB': 'VT-IND-FR-SUBJUN',
    'VT-IND-FR-CAD': 'VT-IND-FR-CADET',
    'VT-IND-FR-JUN': 'VT-IND-FR-JUNIOR',
    'VT-IND-FR-SEN': 'VT-IND-FR-SENIOR',
    'VT-MIX-REG-CHI': 'VT-MIX-REG-CHILD',
    'VT-MIX-REG-SUB': 'VT-MIX-REG-SUBJUN',
    'VT-MIX-REG-CAD': 'VT-MIX-REG-CADET',
    'VT-MIX-REG-JUN': 'VT-MIX-REG-JUNIOR',
    'VT-MIX-REG-SEN': 'VT-MIX-REG-SENIOR',
    'VT-MIX-FR-CHI': 'VT-MIX-FR-CHILD',
    'VT-MIX-FR-SUB': 'VT-MIX-FR-SUBJUN',
    'VT-MIX-FR-CAD': 'VT-MIX-FR-CADET',
    'VT-MIX-FR-JUN': 'VT-MIX-FR-JUNIOR',
    'VT-MIX-FR-SEN': 'VT-MIX-FR-SENIOR'
};

const ALL_CATEGORIES_REGISTRY = {};

// Register Kyorugi
Object.keys(KYORUGI_CATEGORIES).forEach(divKey => {
    const div = KYORUGI_CATEGORIES[divKey];
    ['Male', 'Female'].forEach(gender => {
        (div[gender] || []).forEach(wt => {
            ALL_CATEGORIES_REGISTRY[wt.regularCode] = {
                code: wt.regularCode,
                discipline: 'Kyorugi',
                tier: 'REGULAR',
                division: div.name,
                divisionId: divKey,
                gender,
                weightClassName: wt.name,
                shortLabel: wt.shortLabel,
                weightLimit: formatKyorugiWeight(wt),
                minWeight: wt.minWeight,
                maxWeight: wt.maxWeight
            };
            ALL_CATEGORIES_REGISTRY[wt.freshersCode] = {
                code: wt.freshersCode,
                discipline: 'Kyorugi',
                tier: 'FRESHERS',
                division: div.name,
                divisionId: divKey,
                gender,
                weightClassName: wt.name,
                shortLabel: wt.shortLabel,
                weightLimit: formatKyorugiWeight(wt),
                minWeight: wt.minWeight,
                maxWeight: wt.maxWeight
            };
        });
    });
});

// Register Poomsae
Object.keys(POOMSAE_CATEGORIES).forEach(pKey => {
    const pGroup = POOMSAE_CATEGORIES[pKey];
    ['Freshers', 'Regular'].forEach(tier => {
        (pGroup[tier] || []).forEach(cat => {
            ALL_CATEGORIES_REGISTRY[cat.code] = {
                code: cat.code,
                discipline: 'Poomsae',
                tier: tier.toUpperCase(),
                division: cat.ageLabel,
                subType: pGroup.name,
                name: cat.name
            };
        });
    });
});

// Register Breaking
['Freshers', 'Regular'].forEach(tier => {
    (BREAKING_DATA[tier] || []).forEach(b => {
        ALL_CATEGORIES_REGISTRY[b.code] = {
            code: b.code,
            discipline: 'Kyukpa',
            tier: tier.toUpperCase(),
            technique: b.technique,
            division: b.division,
            name: b.name
        };
    });
});
BREAKING_DATA.Traditional.forEach(b => {
    ALL_CATEGORIES_REGISTRY[b.code] = {
        code: b.code,
        altCode: b.altCode,
        discipline: 'Kyukpa',
        tier: 'TRADITIONAL',
        technique: b.technique,
        division: b.division,
        name: b.name
    };
    if (b.altCode) {
        ALL_CATEGORIES_REGISTRY[b.altCode] = ALL_CATEGORIES_REGISTRY[b.code];
    }
});

// Register Speed Kicking
SPEED_KICKING_DATA.Individual.forEach(sk => {
    ALL_CATEGORIES_REGISTRY[sk.code] = {
        code: sk.code,
        discipline: 'Speed Kicking',
        tier: (sk.tier || 'REGULAR').toUpperCase(),
        technique: sk.technique,
        division: sk.division,
        name: sk.name
    };
});
SPEED_KICKING_DATA.Team.forEach(sk => {
    ALL_CATEGORIES_REGISTRY[sk.code] = {
        code: sk.code,
        discipline: 'Speed Kicking',
        tier: 'TEAM_RELAY',
        gender: sk.gender,
        division: sk.ageLimit,
        name: sk.name
    };
});

// Register Virtual TKD
['Individual', 'MixGender'].forEach(mode => {
    ['Freshers', 'Regular'].forEach(tier => {
        (VIRTUAL_TKD_DATA[mode][tier] || []).forEach(vt => {
            ALL_CATEGORIES_REGISTRY[vt.code] = {
                code: vt.code,
                discipline: 'Virtual Taekwondo',
                tier: tier.toUpperCase(),
                mode,
                division: vt.division,
                ageRange: vt.ageRange,
                name: `Virtual TKD ${mode === 'MixGender' ? 'Mix Gender' : 'Individual'} (${tier}) - ${vt.division}`
            };
        });
    });
});

function findCategoryByCode(code) {
    if (!code) return null;
    return ALL_CATEGORIES_REGISTRY[code.toUpperCase().trim()] || null;
}

function validateAthleteWeight(arg1, arg2, arg3, arg4) {
    var ath = null;
    var measuredWeight = 0;

    if (typeof arg1 === 'object' && arg1 !== null) {
        ath = arg1;
        measuredWeight = arg2 !== undefined ? parseFloat(arg2) : (ath.measuredWeight || ath.weight || 0);
    } else {
        var divisionId = arg1;
        var gender = arg2;
        var weightClassOrCode = arg3;
        measuredWeight = parseFloat(arg4) || 0;
        ath = {
            division: divisionId,
            gender: gender,
            weightClass: weightClassOrCode,
            categoryCode: (weightClassOrCode && weightClassOrCode.startsWith('KY-')) ? weightClassOrCode : ''
        };
    }

    if (!measuredWeight || isNaN(measuredWeight)) {
        return { valid: false, status: 'No Weight', message: 'Scale weight not recorded' };
    }

    var minWeight = ath.minWeight !== undefined ? parseFloat(ath.minWeight) : null;
    var maxWeight = ath.maxWeight !== undefined ? parseFloat(ath.maxWeight) : null;

    if ((minWeight === null || maxWeight === null) && ath.categoryCode) {
        var cat = typeof findCategoryByCode === 'function' ? findCategoryByCode(ath.categoryCode) : null;
        if (cat && cat.minWeight !== undefined && cat.maxWeight !== undefined) {
            minWeight = cat.minWeight;
            maxWeight = cat.maxWeight;
        }
    }

    if (minWeight === null || maxWeight === null) {
        var divKey = (ath.division || ath.category || 'junior').toLowerCase();
        var div = (typeof KYORUGI_CATEGORIES !== 'undefined') ? KYORUGI_CATEGORIES[divKey] : null;
        if (!div && typeof KYORUGI_CATEGORIES !== 'undefined') {
            var keys = ['senior', 'junior', 'cadet', 'sub-junior', 'children'];
            for (var i = 0; i < keys.length; i++) {
                if (divKey.includes(keys[i])) { div = KYORUGI_CATEGORIES[keys[i]]; break; }
            }
        }
        if (div) {
            var list = div[ath.gender || 'Male'] || [];
            var match = list.find(function(w) { 
                return w.regularCode === ath.categoryCode || 
                    w.freshersCode === ath.categoryCode ||
                    (ath.weightClass && (w.name.toLowerCase().includes(ath.weightClass.toLowerCase()) || w.shortLabel.toLowerCase() === ath.weightClass.toLowerCase()));
            });
            if (match) {
                minWeight = match.minWeight;
                maxWeight = match.maxWeight;
            }
        }
    }

    if (minWeight !== null && maxWeight !== null) {
        if (measuredWeight < minWeight) {
            return { valid: false, status: 'Underweight', minWeight: minWeight, maxWeight: maxWeight, message: 'Under minimum weight limit (' + minWeight + ' kg)' };
        }
        if (measuredWeight > maxWeight) {
            return { valid: false, status: 'Overweight', minWeight: minWeight, maxWeight: maxWeight, message: 'Over maximum weight limit (' + maxWeight + ' kg)' };
        }
        return { valid: true, status: 'Passed', minWeight: minWeight, maxWeight: maxWeight, message: 'Within weight limits' };
    }

    return { valid: true, status: 'Passed', message: 'Weight recorded' };
}





// Backward-compatibility: WEIGHT_DIVISIONS for any legacy imports
const WEIGHT_DIVISIONS = {
    junior: {
        male: KYORUGI_CATEGORIES.junior.Male.map(w => ({ id: w.id, name: w.shortName, minWeight: w.minWeight, maxWeight: w.maxWeight, label: w.shortLabel, code: w.regularCode })),
        female: KYORUGI_CATEGORIES.junior.Female.map(w => ({ id: w.id, name: w.shortName, minWeight: w.minWeight, maxWeight: w.maxWeight, label: w.shortLabel, code: w.regularCode }))
    },
    senior: {
        male: KYORUGI_CATEGORIES.senior.Male.map(w => ({ id: w.id, name: w.shortName, minWeight: w.minWeight, maxWeight: w.maxWeight, label: w.shortLabel, code: w.regularCode })),
        female: KYORUGI_CATEGORIES.senior.Female.map(w => ({ id: w.id, name: w.shortName, minWeight: w.minWeight, maxWeight: w.maxWeight, label: w.shortLabel, code: w.regularCode }))
    },
    cadet: {
        male: KYORUGI_CATEGORIES.cadet.Male.map(w => ({ id: w.id, name: w.shortName, minWeight: w.minWeight, maxWeight: w.maxWeight, label: w.shortLabel, code: w.regularCode })),
        female: KYORUGI_CATEGORIES.cadet.Female.map(w => ({ id: w.id, name: w.shortName, minWeight: w.minWeight, maxWeight: w.maxWeight, label: w.shortLabel, code: w.regularCode }))
    },
    'sub-junior': {
        male: KYORUGI_CATEGORIES['sub-junior'].Male.map(w => ({ id: w.id, name: w.shortName, minWeight: w.minWeight, maxWeight: w.maxWeight, label: w.shortLabel, code: w.regularCode })),
        female: KYORUGI_CATEGORIES['sub-junior'].Female.map(w => ({ id: w.id, name: w.shortName, minWeight: w.minWeight, maxWeight: w.maxWeight, label: w.shortLabel, code: w.regularCode }))
    },
    children: {
        male: KYORUGI_CATEGORIES.children.Male.map(w => ({ id: w.id, name: w.shortName, minWeight: w.minWeight, maxWeight: w.maxWeight, label: w.shortLabel, code: w.regularCode })),
        female: KYORUGI_CATEGORIES.children.Female.map(w => ({ id: w.id, name: w.shortName, minWeight: w.minWeight, maxWeight: w.maxWeight, label: w.shortLabel, code: w.regularCode }))
    }
};

const POOMSAE_FORMS = [
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

const KYORUGI_POINTS = {
    PUNCH_TRUNK: { points: 1, label: 'Punch to Trunk (+1)' },
    KICK_TRUNK: { points: 2, label: 'Kick to Trunk (+2)' },
    TURNING_TRUNK: { points: 4, label: 'Turning Kick to Trunk (+4)' },
    KICK_HEAD: { points: 3, label: 'Kick to Head (+3)' },
    TURNING_HEAD: { points: 5, label: 'Turning Kick to Head (+5)' },
    GAMJEOM: { points: 1, label: 'Gam-jeom Penalty (Opponent +1)' }
};

const CORNERS = {
    CHUNG: { id: 'chung', name: 'CHUNG (Blue)', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.15)', border: '#3b82f6', text: '#60a5fa' },
    HONG: { id: 'hong', name: 'HONG (Red)', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.15)', border: '#ef4444', text: '#f87171' }
};

// Universal Module Definition (UMD / Browser / Node)
// Register VT short aliases
Object.keys(vtCodeMap).forEach(shortCode => {
    const fullCode = vtCodeMap[shortCode];
    if (ALL_CATEGORIES_REGISTRY[fullCode]) {
        ALL_CATEGORIES_REGISTRY[shortCode] = { ...ALL_CATEGORIES_REGISTRY[fullCode], code: shortCode, canonicalCode: fullCode };
    }
});

if (typeof window !== 'undefined') {
    window.TKD_BELTS = TKD_BELTS;
    window.AGE_DIVISIONS = AGE_DIVISIONS;
    window.DISCIPLINES = DISCIPLINES;
    window.WEIGHT_DIVISIONS = WEIGHT_DIVISIONS;
    window.KYORUGI_CATEGORIES = KYORUGI_CATEGORIES;
    window.TKD_KYORUGI_CATEGORIES = KYORUGI_CATEGORIES;
    window.POOMSAE_CATEGORIES = POOMSAE_CATEGORIES;
    window.TKD_POOMSAE_CATEGORIES = POOMSAE_CATEGORIES;
    window.BREAKING_CATEGORIES = BREAKING_CATEGORIES;
    window.TKD_BREAKING_CATEGORIES = BREAKING_CATEGORIES;
    window.SPEED_KICKING_CATEGORIES = SPEED_KICKING_CATEGORIES;
    window.TKD_SPEED_KICKING_CATEGORIES = SPEED_KICKING_CATEGORIES;
    window.VIRTUAL_TKD_CATEGORIES = VIRTUAL_TKD_CATEGORIES;
    window.TKD_VIRTUAL_TKD_CATEGORIES = VIRTUAL_TKD_CATEGORIES;
    window.ALL_CATEGORIES_REGISTRY = ALL_CATEGORIES_REGISTRY;
    window.TKD_ALL_CATEGORIES_REGISTRY = ALL_CATEGORIES_REGISTRY;
    window.findCategoryByCode = findCategoryByCode;
    window.validateAthleteWeight = validateAthleteWeight;
    window.formatKyorugiWeight = formatKyorugiWeight;
}
if (typeof globalThis !== 'undefined') {
    globalThis.TKD_KYORUGI_CATEGORIES = KYORUGI_CATEGORIES;
    globalThis.TKD_POOMSAE_CATEGORIES = POOMSAE_CATEGORIES;
    globalThis.TKD_BREAKING_CATEGORIES = BREAKING_CATEGORIES;
    globalThis.TKD_SPEED_KICKING_CATEGORIES = SPEED_KICKING_CATEGORIES;
    globalThis.TKD_VIRTUAL_TKD_CATEGORIES = VIRTUAL_TKD_CATEGORIES;
    globalThis.TKD_ALL_CATEGORIES_REGISTRY = ALL_CATEGORIES_REGISTRY;
    globalThis.findCategoryByCode = findCategoryByCode;
    globalThis.validateAthleteWeight = validateAthleteWeight;
    globalThis.formatKyorugiWeight = formatKyorugiWeight;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatKyorugiWeight,
        TKD_BELTS, AGE_DIVISIONS, DISCIPLINES, WEIGHT_DIVISIONS,
        KYORUGI_CATEGORIES, TKD_KYORUGI_CATEGORIES: KYORUGI_CATEGORIES,
        POOMSAE_CATEGORIES, TKD_POOMSAE_CATEGORIES: POOMSAE_CATEGORIES,
        BREAKING_CATEGORIES, TKD_BREAKING_CATEGORIES: BREAKING_CATEGORIES,
        SPEED_KICKING_CATEGORIES, TKD_SPEED_KICKING_CATEGORIES: SPEED_KICKING_CATEGORIES,
        VIRTUAL_TKD_CATEGORIES, TKD_VIRTUAL_TKD_CATEGORIES: VIRTUAL_TKD_CATEGORIES,
        ALL_CATEGORIES_REGISTRY, TKD_ALL_CATEGORIES_REGISTRY: ALL_CATEGORIES_REGISTRY,
        findCategoryByCode, validateAthleteWeight
    };
}
