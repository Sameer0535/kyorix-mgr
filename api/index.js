const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');

const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? os.tmpdir() : path.join(__dirname, '../data');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'payment-settings.json');
const ATHLETES_FILE = path.join(DATA_DIR, 'athletes.json');
const BRACKETS_FILE = path.join(DATA_DIR, 'brackets.json');
const COMPETITORS_FILE = path.join(DATA_DIR, 'competitors.json');
const COURTS_FILE = path.join(DATA_DIR, 'division-courts.json');

const SEED_PAYMENTS_FILE = path.join(__dirname, '../data/payments.json');
const SEED_SETTINGS_FILE = path.join(__dirname, '../data/payment-settings.json');
const SEED_ATHLETES_FILE = path.join(__dirname, '../data/athletes.json');
const SEED_BRACKETS_FILE = path.join(__dirname, '../data/brackets.json');
const SEED_COMPETITORS_FILE = path.join(__dirname, '../data/competitors.json');
const SEED_COURTS_FILE = path.join(__dirname, '../data/division-courts.json');

// In-memory fallback
let _memPayments = [];
let _memAthletes = [];
let _memBrackets = {};
let _memCompetitors = [];
let _memCourts = {};
let _lastSyncTimestamp = Date.now();
let _lastClearTimestamp = 0;
let _memSettings = {
    enablePaymentPage: true,
    qrImageUrl: '/payment-qr.png',
    accountName: 'DARSHAN A',
    upiId: '9482797451@kotakbank',
    paymentInstructions: 'Please mention student name and program while making payment',
    accountHolderName: 'DARSHAN A',
    accountNumber: '0047818057',
    ifscCode: 'KKBK0008094',
    bankName: 'Kotak Mahindra Bank'
};

const SERVER_DATA_VERSION = 'v35_complete_clean_slate_zero_data';
const VERSION_FILE = path.join(DATA_DIR, 'version.txt');

function initStorage() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (!fs.existsSync(PAYMENTS_FILE)) {
            fs.writeFileSync(PAYMENTS_FILE, '[]', 'utf8');
        }
        let currentVer = '';
        try {
            if (fs.existsSync(VERSION_FILE)) {
                currentVer = fs.readFileSync(VERSION_FILE, 'utf8').trim();
            }
        } catch (e) {}

        if (currentVer !== SERVER_DATA_VERSION || !fs.existsSync(ATHLETES_FILE)) {
            if (fs.existsSync(SEED_ATHLETES_FILE)) {
                fs.copyFileSync(SEED_ATHLETES_FILE, ATHLETES_FILE);
            } else {
                fs.writeFileSync(ATHLETES_FILE, '[]', 'utf8');
            }
            if (fs.existsSync(SEED_COMPETITORS_FILE)) {
                fs.copyFileSync(SEED_COMPETITORS_FILE, COMPETITORS_FILE);
            } else {
                fs.writeFileSync(COMPETITORS_FILE, '[]', 'utf8');
            }
            if (fs.existsSync(SEED_BRACKETS_FILE)) {
                fs.copyFileSync(SEED_BRACKETS_FILE, BRACKETS_FILE);
            } else {
                fs.writeFileSync(BRACKETS_FILE, '{}', 'utf8');
            }
            if (fs.existsSync(SEED_COURTS_FILE)) {
                fs.copyFileSync(SEED_COURTS_FILE, COURTS_FILE);
            } else {
                fs.writeFileSync(COURTS_FILE, '{}', 'utf8');
            }
            try { fs.writeFileSync(VERSION_FILE, SERVER_DATA_VERSION, 'utf8'); } catch (e) {}
        }
        if (!fs.existsSync(SETTINGS_FILE)) {
            if (fs.existsSync(SEED_SETTINGS_FILE)) {
                fs.copyFileSync(SEED_SETTINGS_FILE, SETTINGS_FILE);
            } else {
                fs.writeFileSync(SETTINGS_FILE, JSON.stringify(_memSettings, null, 2), 'utf8');
            }
        }
        if (!fs.existsSync(BRACKETS_FILE)) {
            if (fs.existsSync(SEED_BRACKETS_FILE)) {
                fs.copyFileSync(SEED_BRACKETS_FILE, BRACKETS_FILE);
            } else {
                fs.writeFileSync(BRACKETS_FILE, '{}', 'utf8');
            }
        }
        if (!fs.existsSync(COMPETITORS_FILE)) {
            if (fs.existsSync(SEED_COMPETITORS_FILE)) {
                fs.copyFileSync(SEED_COMPETITORS_FILE, COMPETITORS_FILE);
            } else {
                fs.writeFileSync(COMPETITORS_FILE, '[]', 'utf8');
            }
        }
        if (!fs.existsSync(COURTS_FILE)) {
            if (fs.existsSync(SEED_COURTS_FILE)) {
                fs.copyFileSync(SEED_COURTS_FILE, COURTS_FILE);
            } else {
                fs.writeFileSync(COURTS_FILE, '{}', 'utf8');
            }
        }
    } catch (err) {
        console.warn('Init storage error (using memory cache fallback):', err);
    }
}

initStorage();

function sanitizeCompetitors(list) {
    if (!Array.isArray(list)) return [];
    return list.filter(item => {
        if (!item) return false;
        const name = (item.name || '').trim().toLowerCase();
        const id = String(item.id || '');
        const wt = String(item.weightClass || '').toLowerCase();
        const age = String(item.ageCategory || '').toLowerCase();
        if (wt.includes('58') || (age.includes('senior') && wt.includes('58'))) return false;
        if (/^Player\s+\d+/i.test(item.name || '') || id.startsWith('c_large_')) return false;
        const demoNames = new Set([
            'lee dae-hoon','alexei denisenko','joel gonzalez','servet tazegul',
            'ahmad abughaush','jade jones','eva calvo','hedaya malak',
            'kimia alizadeh','marc-andre','park tae-joon',"vito dell'aquila",
            'cheick sallah cisse','lutalo muhammad','milad beigi','albert gaun',
            'oussama oueslati','steven lopez','aaron cook','nikita rafalovich'
        ]);
        if (demoNames.has(name)) return false;
        if (/^c\d+$/.test(id)) return false;
        return true;
    });
}

function sanitizeBrackets(brackets) {
    if (!brackets || typeof brackets !== 'object') return {};
    const clean = {};
    for (const k of Object.keys(brackets)) {
        if (k.toLowerCase().includes('58')) continue;
        const str = JSON.stringify(brackets[k]);
        if (str.includes('Player ') || str.includes('Lee Dae-hoon')) continue;
        clean[k] = brackets[k];
    }
    return clean;
}

function sanitizeCourts(courts) {
    if (!courts || typeof courts !== 'object') return {};
    const clean = {};
    for (const k of Object.keys(courts)) {
        if (k.toLowerCase().includes('58')) continue;
        clean[k] = courts[k];
    }
    return clean;
}

function getBracketsServer() {
    try {
        if (fs.existsSync(BRACKETS_FILE)) {
            _memBrackets = sanitizeBrackets(JSON.parse(fs.readFileSync(BRACKETS_FILE, 'utf8')));
        }
    } catch (e) {}
    return _memBrackets || {};
}

function saveBracketsServer(incoming, isClearAll = false) {
    if (!incoming || typeof incoming !== 'object') return false;
    incoming = sanitizeBrackets(incoming);
    const existing = getBracketsServer();
    if (JSON.stringify(existing) === JSON.stringify(incoming)) return false; // anti-echo
    if (Object.keys(incoming).length === 0) {
        if (!isClearAll) return false;
        _memBrackets = {};
        _lastSyncTimestamp = Date.now();
        try { fs.writeFileSync(BRACKETS_FILE, '{}', 'utf8'); } catch (e) {}
        return true;
    }
    _memBrackets = incoming;
    _lastSyncTimestamp = Date.now();
    try {
        fs.writeFileSync(BRACKETS_FILE, JSON.stringify(_memBrackets, null, 2), 'utf8');
    } catch (e) {}
    return true;
}

function getCompetitorsServer() {
    try {
        if (fs.existsSync(COMPETITORS_FILE)) {
            _memCompetitors = sanitizeCompetitors(JSON.parse(fs.readFileSync(COMPETITORS_FILE, 'utf8')));
        }
    } catch (e) {}
    return _memCompetitors || [];
}

function saveCompetitorsServer(incoming, isClearAll = false) {
    if (!incoming || !Array.isArray(incoming)) return false;
    incoming = sanitizeCompetitors(incoming);
    const existing = getCompetitorsServer();
    if (JSON.stringify(existing) === JSON.stringify(incoming)) return false; // anti-echo
    if (incoming.length === 0) {
        if (!isClearAll) return false;
        _memCompetitors = [];
        _lastSyncTimestamp = Date.now();
        try { fs.writeFileSync(COMPETITORS_FILE, '[]', 'utf8'); } catch (e) {}
        return true;
    }
    _memCompetitors = incoming;
    _lastSyncTimestamp = Date.now();
    try {
        fs.writeFileSync(COMPETITORS_FILE, JSON.stringify(_memCompetitors, null, 2), 'utf8');
    } catch (e) {}
    return true;
}

function getCourtsServer() {
    try {
        if (fs.existsSync(COURTS_FILE)) {
            _memCourts = sanitizeCourts(JSON.parse(fs.readFileSync(COURTS_FILE, 'utf8')));
        }
    } catch (e) {}
    return _memCourts || {};
}

function saveCourtsServer(courts) {
    courts = sanitizeCourts(courts || {});
    const existing = getCourtsServer();
    if (JSON.stringify(existing) === JSON.stringify(courts)) return false; // anti-echo
    _memCourts = courts;
    _lastSyncTimestamp = Date.now();
    try {
        fs.writeFileSync(COURTS_FILE, JSON.stringify(_memCourts, null, 2), 'utf8');
    } catch (e) {}
    return true;
}

function getAthletesServer() {
    try {
        if (fs.existsSync(ATHLETES_FILE)) {
            const raw = fs.readFileSync(ATHLETES_FILE, 'utf8');
            _memAthletes = JSON.parse(raw);
            return _memAthletes;
        }
    } catch (e) {
        console.error('Error reading athletes file:', e);
    }
    return _memAthletes;
}

function saveAthletesServer(athletes) {
    _memAthletes = athletes;
    _lastSyncTimestamp = Date.now();
    try {
        fs.writeFileSync(ATHLETES_FILE, JSON.stringify(athletes, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('Error saving athletes to file:', e);
        return true;
    }
}

function getPayments() {
    try {
        if (fs.existsSync(PAYMENTS_FILE)) {
            const raw = fs.readFileSync(PAYMENTS_FILE, 'utf8');
            _memPayments = JSON.parse(raw);
            return _memPayments;
        }
    } catch (e) {
        console.error('Error reading payments file:', e);
    }
    return _memPayments;
}

function savePayments(payments) {
    _memPayments = payments;
    try {
        fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('Error saving payments to file:', e);
        return true; // Still preserved in memory
    }
}

function getPaymentSettings() {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
            _memSettings = JSON.parse(raw);
            return _memSettings;
        }
    } catch (e) {
        console.error('Error reading settings file:', e);
    }
    return _memSettings;
}

function savePaymentSettings(settings) {
    _memSettings = settings;
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('Error saving settings to file:', e);
        return true;
    }
}

function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        if (req.body && typeof req.body === 'object') {
            return resolve(req.body);
        }
        if (typeof req.body === 'string') {
            try {
                return resolve(req.body ? JSON.parse(req.body) : {});
            } catch (e) {
                return reject(e);
            }
        }
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > 10 * 1024 * 1024) {
                req.destroy();
                reject(new Error('Request entity too large'));
            }
        });
        req.on('end', () => {
            try {
                resolve(body.trim() ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

function loadEnvVariables() {
    try {
        const candidatePaths = [
            path.join(__dirname, '.env'),
            path.join(__dirname, '../.env')
        ];
        for (const p of candidatePaths) {
            if (fs.existsSync(p)) {
                const lines = fs.readFileSync(p, 'utf8').split('\n');
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('#')) {
                        const idx = trimmed.indexOf('=');
                        if (idx > 0) {
                            const key = trimmed.slice(0, idx).trim();
                            const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
                            if (!process.env[key]) process.env[key] = val;
                        }
                    }
                }
                break;
            }
        }
    } catch (e) {}
}
loadEnvVariables();

function authenticateApiKey(req) {
    const configuredKey = process.env.KYORIX_API_KEY;
    if (!configuredKey) {
        console.warn('[AUTH] KYORIX_API_KEY environment variable is not configured.');
        return false;
    }
    const headerKey = req.headers['x-kyorix-api-key'] || req.headers['X-Kyorix-API-Key'];
    return !!headerKey && headerKey.trim() === configuredKey.trim();
}

function deduceCategoryFromDob(dobStr, gender) {
    let division = 'Senior';
    if (dobStr) {
        try {
            const dob = new Date(dobStr);
            if (!isNaN(dob.getTime())) {
                const now = new Date();
                let age = now.getFullYear() - dob.getFullYear();
                const m = now.getMonth() - dob.getMonth();
                if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
                    age--;
                }
                if (age < 8) division = 'Children';
                else if (age <= 11) division = 'Sub-Junior';
                else if (age <= 14) division = 'Cadet';
                else if (age <= 17) division = 'Junior';
                else division = 'Senior';
            }
        } catch (e) {}
    }
    const gen = (gender || 'Male').toLowerCase().startsWith('f') ? 'Female' : 'Male';
    return `${division} ${gen}`;
}

function formatBeltRank(beltRank) {
    if (!beltRank) return 'Black Belt';
    const clean = beltRank.replace(/_/g, ' ').toLowerCase();
    return clean.replace(/\b\w/g, c => c.toUpperCase());
}

function normalizePodiumForKukkiwon(pod, athletes = null) {
    if (!athletes) athletes = typeof getAthletesServer === 'function' ? getAthletesServer() : [];

    if (pod.discipline && pod.category_name && pod.gold && pod.gold.athlete_name) {
        return pod;
    }

    const catName = pod.category_name || pod.division || pod.category || 'Senior Male Kyorugi';
    const lowerCat = catName.toLowerCase();
    const catCode = pod.category_code || pod.categoryCode || '';

    let discipline = 'KYORUGI';
    if (lowerCat.includes('poomsae') || lowerCat.startsWith('po-') || catCode.startsWith('PO-')) discipline = 'POOMSAE';
    else if (lowerCat.includes('kyukpa') || lowerCat.includes('breaking') || lowerCat.startsWith('brk-') || catCode.startsWith('BRK-')) discipline = 'KYUKPA';
    else if (lowerCat.includes('speed') || lowerCat.startsWith('sk-') || catCode.startsWith('SK-')) discipline = 'SPEED_KICKING';
    else if (lowerCat.includes('virtual') || lowerCat.startsWith('vt-') || catCode.startsWith('VT-')) discipline = 'VIRTUAL_TKD';

    let division = 'SENIOR';
    if (lowerCat.includes('child') || lowerCat.includes('under 8') || lowerCat.includes('-chi-') || catCode.includes('-CHI-')) division = 'CHILDREN';
    else if (lowerCat.includes('sub-junior') || lowerCat.includes('sub junior') || lowerCat.includes('-sub-') || lowerCat.includes('subjun') || catCode.includes('-SUB-')) division = 'SUB-JUNIOR';
    else if (lowerCat.includes('cadet') || lowerCat.includes('-cad-') || catCode.includes('-CAD-')) division = 'CADET';
    else if (lowerCat.includes('junior') || lowerCat.includes('-jun-') || catCode.includes('-JUN-')) division = 'JUNIOR';
    else if (lowerCat.includes('senior') || lowerCat.includes('-sen-') || catCode.includes('-SEN-')) division = 'SENIOR';
    else if (lowerCat.includes('master')) division = 'MASTERS';
    else if (lowerCat.includes('peewee')) division = 'CHILDREN';

    let tier = 'REGULAR';
    if (lowerCat.includes('fresh') || lowerCat.includes('-fr-') || catCode.includes('-FR-')) tier = 'FRESHERS';

    let gender = 'MALE';
    if (lowerCat.includes('female') || lowerCat.includes('women') || lowerCat.includes('girl') || lowerCat.includes('-f-') || catCode.includes('-F-')) {
        gender = 'FEMALE';
    }

    const findAthleteKukkiwonId = (name, compId) => {
        if (!name && !compId) return '';
        const norm = (name || '').trim().toLowerCase();
        const found = athletes.find(a => 
            (compId && (a.id === compId || a.athleteId === compId)) ||
            (norm && (a.name || '').trim().toLowerCase() === norm)
        );
        return found ? (found.kukkiwonDanNumber || found.kukkiwonId || '') : '';
    };

    const formatWinnerObj = (winner) => {
        if (!winner) return null;
        const athName = winner.athlete_name || winner.athlete || winner.name || '';
        const acadName = winner.academy_name || winner.academy || winner.dojang || winner.club || 'Independent';
        const kId = winner.kukkiwon_id || winner.kukkiwonDanNumber || findAthleteKukkiwonId(athName, winner.id);
        const res = {
            athlete_name: athName,
            academy_name: acadName
        };
        if (kId) res.kukkiwon_id = kId;
        return res;
    };

    const gold = formatWinnerObj(pod.gold);
    const silver = formatWinnerObj(pod.silver);

    let bronze1 = null;
    let bronze2 = null;

    if (pod.bronze_1) {
        bronze1 = formatWinnerObj(pod.bronze_1);
    } else if (Array.isArray(pod.bronze) && pod.bronze.length > 0) {
        bronze1 = formatWinnerObj(pod.bronze[0]);
        if (pod.bronze.length > 1) {
            bronze2 = formatWinnerObj(pod.bronze[1]);
        }
    } else if (pod.bronze && typeof pod.bronze === 'object') {
        bronze1 = formatWinnerObj(pod.bronze);
    }

    const result = {
        discipline,
        division,
        tier,
        category_name: catName,
        category_code: catCode,
        gender,
        gold,
        silver
    };

    if (bronze1) result.bronze_1 = bronze1;
    if (bronze2) result.bronze_2 = bronze2;

    return result;
}

function compileCompletedPodiumsFromBrackets() {
    const brackets = getBracketsServer();
    const athletes = getAthletesServer();
    const podiums = [];

    const resolveWinner = (match) => {
        if (!match || (match.status !== 'completed' && match.status !== 'COMPLETED')) return null;
        let wId = String(match.winnerId || '').trim().toLowerCase();
        if (match.p1 && (String(match.p1.id).toLowerCase() === wId || (match.p1.name && match.p1.name.toLowerCase() === wId))) return match.p1;
        if (match.p2 && (String(match.p2.id).toLowerCase() === wId || (match.p2.name && match.p2.name.toLowerCase() === wId))) return match.p2;
        if (wId === 'chung' || wId === 'blue' || wId === 'p1') return match.p1 || match.chung;
        if (wId === 'hong' || wId === 'red' || wId === 'p2') return match.p2 || match.hong;
        if (match.winner && match.winner.name) return match.winner;
        return match.p1 || match.chung || null;
    };

    const resolveLoser = (match) => {
        if (!match || (match.status !== 'completed' && match.status !== 'COMPLETED')) return null;
        const w = resolveWinner(match);
        if (!w) return null;
        const wName = (w.name || '').trim().toLowerCase();
        if (match.p1 && (match.p1.name || '').trim().toLowerCase() !== wName) return match.p1;
        if (match.p2 && (match.p2.name || '').trim().toLowerCase() !== wName) return match.p2;
        if (match.chung && (match.chung.name || '').trim().toLowerCase() !== wName) return match.chung;
        if (match.hong && (match.hong.name || '').trim().toLowerCase() !== wName) return match.hong;
        return null;
    };

    for (const divKey of Object.keys(brackets)) {
        const rounds = brackets[divKey];
        if (!Array.isArray(rounds) || rounds.length === 0) continue;

        const finalRound = rounds[rounds.length - 1];
        if (!Array.isArray(finalRound) || finalRound.length === 0) continue;

        const finalMatch = finalRound[0];
        if (!finalMatch || (finalMatch.status !== 'completed' && finalMatch.status !== 'COMPLETED')) continue;

        const goldComp = resolveWinner(finalMatch);
        const silverComp = resolveLoser(finalMatch);
        if (!goldComp) continue;

        const bronzes = [];
        if (rounds.length >= 2) {
            const semiRound = rounds[rounds.length - 2];
            if (Array.isArray(semiRound)) {
                semiRound.forEach(sm => {
                    const semiLoser = resolveLoser(sm);
                    if (semiLoser && semiLoser.name) {
                        bronzes.push(semiLoser);
                    }
                });
            }
        }

        const rawPodium = {
            category_name: divKey,
            gold: goldComp,
            silver: silverComp,
            bronze: bronzes
        };

        podiums.push(normalizePodiumForKukkiwon(rawPodium, athletes));
    }

    return podiums;
}

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Kyorix-API-Key, x-kyorix-api-key'
    });
    res.end(JSON.stringify(data));
}

module.exports = async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Kyorix-API-Key, x-kyorix-api-key'
        });
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // =========================================================================
    // KUKKIWON CUP INTEGRATION ENDPOINTS
    // =========================================================================

    // 0A. GET /api/v1/health (Public health check)
    if (method === 'GET' && pathname === '/api/v1/health') {
        return sendJson(res, 200, {
            status: 'ok',
            version: '1.0',
            serverTime: new Date().toISOString()
        });
    }

    // 0B. POST /api/v1/athletes/sync (Protected: ingest registered athletes)
    if (method === 'POST' && pathname === '/api/v1/athletes/sync') {
        if (!authenticateApiKey(req)) {
            return sendJson(res, 401, {
                success: false,
                error: 'Unauthorized: Invalid or missing X-Kyorix-API-Key header.'
            });
        }

        try {
            const body = await parseJsonBody(req);
            const rawList = Array.isArray(body) 
                ? body 
                : (Array.isArray(body.athletes) ? body.athletes : (body && typeof body === 'object' && Object.keys(body).length > 0 ? [body] : []));

            if (rawList.length === 0) {
                return sendJson(res, 400, {
                    success: false,
                    error: 'Empty athlete payload received.'
                });
            }

            const currentAthletes = getAthletesServer();
            const ingestedAthletes = [];

            for (const item of rawList) {
                if (!item) continue;
                const localId = item.localAthleteId || item.athleteId || item.id;
                const firstName = (item.firstName || '').trim();
                const lastName = (item.lastName || '').trim();
                let fullName = (item.name || `${firstName} ${lastName}`).trim();
                if (!fullName && localId) fullName = `Athlete ${localId}`;

                const academy = item.academyName || item.dojangName || item.club || 'Independent Competitor';
                const gender = (item.gender || 'Male').toUpperCase().startsWith('F') ? 'Female' : 'Male';
                const dob = item.dateOfBirth || item.dob || '';
                const kukkiwonDan = item.kukkiwonDanNumber || item.kukkiwonId || '';
                const beltRank = item.beltRank || item.rank || '1ST_DAN_BLACK';
                const beltName = formatBeltRank(beltRank);

                // Deduplicate / update existing athlete by localAthleteId or name + academy
                const existingIdx = currentAthletes.findIndex(a => 
                    (localId && (a.athleteId === localId || a.id === localId || a.id === `ath-${localId}`)) ||
                    ((a.name || '').trim().toLowerCase() === fullName.toLowerCase() && 
                     (a.dojangName || '').trim().toLowerCase() === academy.toLowerCase())
                );

                const athleteRecord = {
                    ...(existingIdx >= 0 ? currentAthletes[existingIdx] : {}),
                    id: (existingIdx >= 0 ? currentAthletes[existingIdx].id : null) || (localId ? `ath-${localId}` : ('ath-' + Date.now().toString(36))),
                    athleteId: localId || (existingIdx >= 0 ? currentAthletes[existingIdx].athleteId : ('ATH-' + Math.floor(100000 + Math.random() * 900000))),
                    localAthleteId: localId || '',
                    name: fullName,
                    firstName: firstName || (fullName.split(' ')[0] || ''),
                    lastName: lastName || (fullName.split(' ').slice(1).join(' ') || ''),
                    gender: gender,
                    dateOfBirth: dob,
                    dob: dob,
                    beltRank: beltRank,
                    beltName: beltName,
                    belt: beltName,
                    rank: beltRank,
                    kukkiwonDanNumber: kukkiwonDan,
                    kukkiwonId: kukkiwonDan,
                    kukkiwonNo: kukkiwonDan,
                    academyName: academy,
                    dojangName: academy,
                    club: academy,
                    dojangId: (existingIdx >= 0 ? currentAthletes[existingIdx].dojangId : null) || 'ind-competitor',
                    category: (existingIdx >= 0 && currentAthletes[existingIdx].category) ? currentAthletes[existingIdx].category : (item.category || deduceCategoryFromDob(dob, gender)),
                    weightClass: (existingIdx >= 0 ? currentAthletes[existingIdx].weightClass : '') || item.weightClass || item.weightDivision || '',
                    status: (existingIdx >= 0 && currentAthletes[existingIdx].status === 'Passed') ? 'Passed' : 'Confirmed',
                    weighInStatus: (existingIdx >= 0 && currentAthletes[existingIdx].weighInStatus === 'Passed') ? 'Passed' : 'Pending',
                    measuredWeight: (existingIdx >= 0 ? currentAthletes[existingIdx].measuredWeight : null) || item.measuredWeight || null,
                    paymentStatus: 'Paid',
                    feeStatus: 'Paid',
                    tournId: item.tournId || 'tourn-kukkiwon-2026',
                    tournamentId: item.tournId || 'tourn-kukkiwon-2026',
                    tournamentTitle: 'Kukkiwon Cup India Taekwondo Championship 2026',
                    registeredTournaments: Array.from(new Set([
                        ...(existingIdx >= 0 && Array.isArray(currentAthletes[existingIdx].registeredTournaments) ? currentAthletes[existingIdx].registeredTournaments : []),
                        item.tournId,
                        'tourn-kukkiwon-2026',
                        'tourn-state-2026',
                        'tourn-1',
                        'all'
                    ].filter(Boolean))),
                    syncedFrom: 'kukkiwon-cup-championship',
                    syncedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                if (!athleteRecord.createdAt) athleteRecord.createdAt = new Date().toISOString();

                if (existingIdx >= 0) {
                    currentAthletes[existingIdx] = athleteRecord;
                } else {
                    currentAthletes.unshift(athleteRecord);
                }
                ingestedAthletes.push(athleteRecord);
            }

            saveAthletesServer(currentAthletes);

            return sendJson(res, 201, {
                success: true,
                message: `Successfully synced ${ingestedAthletes.length} athlete(s) ready for weigh-in and ring assignment.`,
                count: ingestedAthletes.length,
                athletes: ingestedAthletes,
                timestamp: _lastSyncTimestamp
            });
        } catch (err) {
            console.error('Athlete sync error:', err);
            return sendJson(res, 500, {
                success: false,
                error: 'Failed to process athlete sync ingestion: ' + err.message
            });
        }
    }

    // 0C. POST /api/v1/results/publish (Export results & medalists webhook to main site)
    if (method === 'POST' && pathname === '/api/v1/results/publish') {
        try {
            const body = await parseJsonBody(req);
            let podiumsToPublish = [];

            if (body && body.gold && body.category_name) {
                podiumsToPublish.push(body);
            } else if (Array.isArray(body?.podiums)) {
                podiumsToPublish = body.podiums;
            } else if (body && body.podium) {
                podiumsToPublish.push(body.podium);
            } else if (body && body.publishAll === true) {
                podiumsToPublish = compileCompletedPodiumsFromBrackets();
            }

            if (podiumsToPublish.length === 0) {
                return sendJson(res, 400, {
                    success: false,
                    error: 'No valid category podium data provided to publish.'
                });
            }

            const targetUrl = (process.env.KUKKIWON_API_URL || 'https://kukkiwon-cup-championship.vercel.app').replace(/\/$/, '') + '/api/admin/results';
            const apiKey = process.env.KYORIX_API_KEY || '';
            const publishResults = [];

            for (const pod of podiumsToPublish) {
                const formatted = normalizePodiumForKukkiwon(pod);
                try {
                    const fetchRes = await fetch(targetUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Kyorix-API-Key': apiKey
                        },
                        body: JSON.stringify(formatted)
                    });
                    const resText = await fetchRes.text();
                    let resData = null;
                    try { resData = JSON.parse(resText); } catch(e) { resData = resText; }

                    publishResults.push({
                        category_name: formatted.category_name,
                        status: fetchRes.status,
                        ok: fetchRes.ok,
                        response: resData
                    });
                } catch (fetchErr) {
                    publishResults.push({
                        category_name: formatted.category_name,
                        status: 500,
                        ok: false,
                        error: fetchErr.message
                    });
                }
            }

            const allOk = publishResults.every(r => r.ok);
            return sendJson(res, allOk ? 200 : 207, {
                success: allOk,
                message: allOk 
                    ? `Successfully published ${publishResults.length} category podium(s) to Kukkiwon Cup site.`
                    : `Published with partial status: ${publishResults.filter(r => r.ok).length}/${publishResults.length} succeeded.`,
                targetUrl,
                results: publishResults
            });
        } catch (err) {
            console.error('Publish results error:', err);
            return sendJson(res, 500, { success: false, error: 'Failed to publish results: ' + err.message });
        }
    }

    // 1. POST /api/payments/submit-utr
    if (method === 'POST' && pathname === '/api/payments/submit-utr') {
        try {
            const body = await parseJsonBody(req);
            let { utr, userName, mobile, email, purpose, amount, notes, metadata } = body;

            utr = (utr || '').toString().trim().replace(/\s+/g, '');
            if (!/^\d{12}$/.test(utr)) {
                return sendJson(res, 400, {
                    success: false,
                    error: 'Invalid UTR Number. Must be exactly 12 numeric digits.'
                });
            }

            if (!userName || !userName.trim()) {
                return sendJson(res, 400, {
                    success: false,
                    error: 'Payer name is required.'
                });
            }

            const parsedAmount = parseFloat(amount) || 0;
            if (parsedAmount <= 0) {
                return sendJson(res, 400, {
                    success: false,
                    error: 'Amount must be greater than 0.'
                });
            }

            const payments = getPayments();

            const existing = payments.find(p => p.utr === utr);
            if (existing) {
                if (existing.status === 'Approved') {
                    return sendJson(res, 409, {
                        success: false,
                        error: 'This 12-digit UTR has already been approved and settled.',
                        payment: existing
                    });
                } else if (existing.status === 'Pending') {
                    return sendJson(res, 200, {
                        success: true,
                        message: 'This UTR is already submitted and currently under verification.',
                        payment: existing
                    });
                }
            }

            const newPayment = {
                id: 'PAY-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900),
                utr: utr,
                userName: userName.trim(),
                mobile: (mobile || '').toString().trim(),
                email: (email || '').toString().trim(),
                purpose: (purpose || 'Championship Entry Fee').toString().trim(),
                amount: parsedAmount,
                notes: (notes || '').toString().trim(),
                metadata: metadata || {},
                entityId: body.entityId || null,
                entityType: body.entityType || null,
                userId: body.userId || null,
                dojangId: body.dojangId || null,
                status: 'Pending',
                createdAt: new Date().toISOString(),
                approvedAt: null,
                rejectedAt: null,
                rejectReason: null
            };

            // If athleteData or entityType === 'athlete', persist athlete in server storage
            let savedAthlete = null;
            try {
                const athletes = getAthletesServer();
                let athData = body.athleteData || body.athlete;
                let parsedAthName = userName.trim();
                let parsedDojangName = 'Individual Competitor';
                const userAcMatch = parsedAthName.match(/^(.+?)\s*\(([^)]+)\)$/);
                if (userAcMatch) {
                    parsedDojangName = userAcMatch[1].trim();
                    parsedAthName = userAcMatch[2].trim();
                }

                if (!athData && (body.entityType === 'athlete' || !body.entityType)) {
                    athData = {
                        id: body.entityId || ('ath-' + Date.now().toString(36)),
                        athleteId: body.athleteId || ('ATH-' + Math.floor(100000 + Math.random() * 900000)),
                        name: parsedAthName,
                        phone: (mobile || '').toString().trim(),
                        email: (email || '').toString().trim(),
                        dojangName: parsedDojangName,
                        dojangId: 'ind-competitor',
                        dojangCode: 'IND',
                        tournId: body.tournamentId || 'tourn-state-2026',
                        registeredTournaments: [body.tournamentId || 'tourn-state-2026'],
                        status: 'Pending',
                        paymentStatus: 'Pending',
                        feeStatus: 'Pending',
                        utr: utr
                    };
                } else if (athData && athData.name) {
                    const m = athData.name.match(/^(.+?)\s*\(([^)]+)\)$/);
                    if (m) {
                        if (!athData.dojangName || athData.dojangName === 'Individual Competitor') {
                            athData.dojangName = m[1].trim();
                        }
                        athData.name = m[2].trim();
                    }
                }
                if (athData) {
                    const athIdx = athletes.findIndex(a => 
                        (athData.id && a.id === athData.id) || 
                        (athData.athleteId && a.athleteId === athData.athleteId) ||
                        (a.name && a.name.toLowerCase() === athData.name.toLowerCase()) ||
                        (athData.phone && a.phone && a.phone.includes(athData.phone))
                    );
                    const mergedAth = {
                        ...(athIdx >= 0 ? athletes[athIdx] : {}),
                        ...athData,
                        paymentStatus: 'Pending',
                        feeStatus: 'Pending',
                        utr: utr,
                        lastSubmittedUtr: utr,
                        updatedAt: new Date().toISOString()
                    };
                    if (athIdx >= 0) {
                        athletes[athIdx] = mergedAth;
                    } else {
                        athletes.unshift(mergedAth);
                    }
                    saveAthletesServer(athletes);
                    savedAthlete = mergedAth;
                }
            } catch (errAth) {
                console.warn('Could not auto-save athlete on payment submission:', errAth);
            }

            newPayment.athleteData = savedAthlete;
            payments.unshift(newPayment);
            savePayments(payments);

            return sendJson(res, 201, {
                success: true,
                message: 'Payment proof submitted successfully! Verification in progress.',
                payment: newPayment,
                athlete: savedAthlete
            });
        } catch (err) {
            console.error('Submit UTR Error:', err);
            return sendJson(res, 500, { success: false, error: 'Internal server error processing payment submission.' });
        }
    }

    // 2. GET /api/admin/payments
    if (method === 'GET' && pathname === '/api/admin/payments') {
        let payments = getPayments();

        // Auto-reconcile payments from athletes if payments list is empty
        if (!payments || payments.length === 0) {
            try {
                const athletes = getAthletesServer();
                const reconciled = [];
                athletes.forEach((a, idx) => {
                    if (a && (a.paymentStatus === 'Paid' || a.feeStatus === 'Paid' || a.utr)) {
                        reconciled.push({
                            id: a.txnId || ('PAY-' + (a.athleteId || a.id)),
                            utr: a.utr || ('982601000' + String(idx + 1).padStart(2, '0') + '99'),
                            userName: a.name || 'Competitor',
                            mobile: (a.phone || '').replace(/\D/g, '').slice(-10) || '9845110001',
                            email: a.email || '',
                            purpose: `Championship Entry Fee - ${a.name || 'Competitor'}`,
                            amount: 1500,
                            notes: 'Official registration fee settlement',
                            metadata: {},
                            entityId: a.id,
                            entityType: 'athlete',
                            athleteId: a.athleteId || a.id,
                            tournamentId: a.tournId || 'tourn-state-2026',
                            status: (a.paymentStatus === 'Paid' || a.feeStatus === 'Paid') ? 'Approved' : 'Pending',
                            createdAt: a.paidDate ? new Date(a.paidDate).toISOString() : new Date().toISOString(),
                            approvedAt: (a.paymentStatus === 'Paid' || a.feeStatus === 'Paid') ? (a.paidDate ? new Date(a.paidDate).toISOString() : new Date().toISOString()) : null,
                            rejectedAt: null,
                            rejectReason: null
                        });
                    }
                });
                if (reconciled.length > 0) {
                    payments = reconciled;
                    savePayments(payments);
                }
            } catch (errRec) {
                console.warn('Reconcile payments error:', errRec);
            }
        }

        const statusFilter = parsedUrl.query.status;
        const searchQuery = (parsedUrl.query.q || '').toLowerCase().trim();

        let filtered = payments;
        if (statusFilter && statusFilter !== 'All') {
            filtered = filtered.filter(p => p.status.toLowerCase() === statusFilter.toLowerCase());
        }
        if (searchQuery) {
            filtered = filtered.filter(p => 
                (p.utr && p.utr.includes(searchQuery)) ||
                (p.userName && p.userName.toLowerCase().includes(searchQuery)) ||
                (p.mobile && p.mobile.includes(searchQuery)) ||
                (p.purpose && p.purpose.toLowerCase().includes(searchQuery))
            );
        }

        const pendingCount = payments.filter(p => p.status === 'Pending').length;
        const approvedCount = payments.filter(p => p.status === 'Approved').length;
        const rejectedCount = payments.filter(p => p.status === 'Rejected').length;

        return sendJson(res, 200, {
            success: true,
            total: payments.length,
            pendingCount,
            approvedCount,
            rejectedCount,
            payments: filtered
        });
    }

    // 3. PATCH /api/admin/payments/:id/approve
    const approveMatch = pathname.match(/^\/api\/admin\/payments\/([^\/]+)\/approve$/);
    if (method === 'PATCH' && approveMatch) {
        const paymentId = approveMatch[1];
        const payments = getPayments();
        const index = payments.findIndex(p => p.id === paymentId || p.utr === paymentId);

        if (index === -1) {
            return sendJson(res, 404, { success: false, error: 'Payment record not found.' });
        }

        payments[index].status = 'Approved';
        payments[index].approvedAt = new Date().toISOString();
        payments[index].rejectedAt = null;
        payments[index].rejectReason = null;
        savePayments(payments);

        // Also update athlete record in server storage
        let updatedAthlete = null;
        try {
            const athletes = getAthletesServer();
            const pay = payments[index];
            let cleanUserName = pay.userName || '';
            let cleanUserAcademy = '';
            const userMatch = cleanUserName.match(/^(.+?)\s*\(([^)]+)\)$/);
            if (userMatch) {
                cleanUserAcademy = userMatch[1].trim();
                cleanUserName = userMatch[2].trim();
            }

            const athIdx = athletes.findIndex(a => 
                (pay.entityId && (a.id === pay.entityId || a.athleteId === pay.entityId)) ||
                (cleanUserName && a.name && a.name.toLowerCase() === cleanUserName.toLowerCase()) ||
                (pay.userName && a.name && a.name.toLowerCase() === pay.userName.toLowerCase()) ||
                (pay.mobile && a.phone && a.phone.includes(pay.mobile))
            );
            if (athIdx >= 0) {
                const targetTourn = pay.tournamentId || athletes[athIdx].tournId || 'tourn-state-2026';
                const curRegs = Array.isArray(athletes[athIdx].registeredTournaments) ? athletes[athIdx].registeredTournaments : [];
                const updatedRegs = Array.from(new Set([...curRegs, targetTourn, 'tourn-state-2026']));
                
                // If athlete's name was in Academy (Name) format, split it
                let curAthName = athletes[athIdx].name || cleanUserName;
                let curDojang = athletes[athIdx].dojangName || cleanUserAcademy;
                const mAth = curAthName.match(/^(.+?)\s*\(([^)]+)\)$/);
                if (mAth) {
                    if (!curDojang || curDojang === 'Individual Competitor') curDojang = mAth[1].trim();
                    curAthName = mAth[2].trim();
                }

                athletes[athIdx] = {
                    ...athletes[athIdx],
                    name: curAthName,
                    dojangName: curDojang || athletes[athIdx].dojangName || 'Individual Competitor',
                    paymentStatus: 'Paid',
                    feeStatus: 'Paid',
                    paidDate: payments[index].approvedAt.split('T')[0],
                    txnId: payments[index].id,
                    utr: payments[index].utr,
                    tournId: targetTourn,
                    registeredTournaments: updatedRegs,
                    updatedAt: new Date().toISOString()
                };
                saveAthletesServer(athletes);
                updatedAthlete = athletes[athIdx];
            } else if (pay.entityType === 'athlete' || !pay.dojangId) {
                const athData = pay.athleteData || {};
                const targetTourn = pay.tournamentId || athData.tournId || 'tourn-state-2026';
                let athName = cleanUserName || athData.name || 'Competitor';
                let athDojang = cleanUserAcademy || athData.dojangName || 'Individual Competitor';
                const mAth = athName.match(/^(.+?)\s*\(([^)]+)\)$/);
                if (mAth) {
                    if (!athDojang || athDojang === 'Individual Competitor') athDojang = mAth[1].trim();
                    athName = mAth[2].trim();
                }

                const newAth = {
                    id: pay.entityId || athData.id || ('ath-' + Date.now().toString(36)),
                    athleteId: pay.athleteId || athData.athleteId || ('ATH-' + Math.floor(100000 + Math.random() * 900000)),
                    name: athName,
                    phone: pay.mobile || athData.phone || '',
                    email: pay.email || athData.email || '',
                    dojangName: athDojang,
                    dojangId: athData.dojangId || 'ind-competitor',
                    dojangCode: athData.dojangCode || 'IND',
                    category: athData.category || 'Junior (15–17 yrs)',
                    weightClass: athData.weightClass || 'Junior Male U-55 kg',
                    weight: athData.weight || 54.0,
                    beltId: athData.beltId || 'white',
                    beltName: athData.beltName || 'White Belt',
                    gender: athData.gender || 'Male',
                    photo: athData.photo || '',
                    aadharDoc: athData.aadharDoc || '',
                    birthCertDoc: athData.birthCertDoc || '',
                    docStatus: athData.docStatus || 'Pending',
                    status: 'Pending',
                    weighInStatus: 'Pending',
                    measuredWeight: null,
                    paymentStatus: 'Paid',
                    feeStatus: 'Paid',
                    paidDate: payments[index].approvedAt.split('T')[0],
                    txnId: payments[index].id,
                    utr: payments[index].utr,
                    tournId: targetTourn,
                    registeredTournaments: Array.from(new Set([targetTourn, 'tourn-state-2026'])),
                    createdAt: new Date().toISOString()
                };
                athletes.unshift(newAth);
                saveAthletesServer(athletes);
                updatedAthlete = newAth;
            }
        } catch (errAth) {
            console.warn('Could not update athlete on payment approval:', errAth);
        }

        return sendJson(res, 200, {
            success: true,
            message: 'Payment approved successfully.',
            payment: payments[index],
            athlete: updatedAthlete
        });
    }

    // 4. PATCH /api/admin/payments/:id/reject
    const rejectMatch = pathname.match(/^\/api\/admin\/payments\/([^\/]+)\/reject$/);
    if (method === 'PATCH' && rejectMatch) {
        try {
            const paymentId = rejectMatch[1];
            const body = await parseJsonBody(req);
            const reason = body.reason || 'Invalid transaction reference or amount mismatch.';

            const payments = getPayments();
            const index = payments.findIndex(p => p.id === paymentId || p.utr === paymentId);

            if (index === -1) {
                return sendJson(res, 404, { success: false, error: 'Payment record not found.' });
            }

            payments[index].status = 'Rejected';
            payments[index].rejectedAt = new Date().toISOString();
            payments[index].rejectReason = reason;
            savePayments(payments);

            return sendJson(res, 200, {
                success: true,
                message: 'Payment rejected.',
                payment: payments[index]
            });
        } catch (err) {
            return sendJson(res, 500, { success: false, error: 'Error rejecting payment.' });
        }
    }

    // 5. GET /api/payments/user-history
    if (method === 'GET' && pathname === '/api/payments/user-history') {
        const query = (parsedUrl.query.q || '').toLowerCase().trim();
        const payments = getPayments();
        if (!query) {
            return sendJson(res, 200, { success: true, payments });
        }
        const filtered = payments.filter(p => 
            (p.userId && p.userId.toLowerCase().includes(query)) ||
            (p.entityId && p.entityId.toLowerCase().includes(query)) ||
            (p.userName && p.userName.toLowerCase().includes(query)) ||
            (p.mobile && p.mobile.includes(query)) ||
            (p.dojangId && p.dojangId.toLowerCase().includes(query))
        );
        return sendJson(res, 200, { success: true, payments: filtered });
    }

    // 5B. GET /api/payments/:id
    const statusMatch = pathname.match(/^\/api\/payments\/([^\/]+)$/);
    if (method === 'GET' && statusMatch) {
        const idOrUtr = statusMatch[1];
        const payments = getPayments();
        const payment = payments.find(p => p.id === idOrUtr || p.utr === idOrUtr);

        if (!payment) {
            return sendJson(res, 404, { success: false, error: 'Payment not found.' });
        }

        return sendJson(res, 200, {
            success: true,
            payment
        });
    }

    // 6. GET /api/config/bank-details
    if (method === 'GET' && pathname === '/api/config/bank-details') {
        return sendJson(res, 200, {
            success: true,
            config: getPaymentSettings()
        });
    }

    // 7. POST /api/config/bank-details
    if (method === 'POST' && pathname === '/api/config/bank-details') {
        try {
            const body = await parseJsonBody(req);
            const current = getPaymentSettings();
            const updated = {
                ...current,
                ...body,
                updatedAt: new Date().toISOString()
            };
            savePaymentSettings(updated);
            return sendJson(res, 200, {
                success: true,
                message: 'Payment QR & Bank Details updated successfully.',
                config: updated
            });
        } catch (err) {
            return sendJson(res, 500, { success: false, error: 'Failed to update payment settings.' });
        }
    }

    // 8. GET /api/athletes
    if (method === 'GET' && pathname === '/api/athletes') {
        const athletes = getAthletesServer();
        const tournId = parsedUrl.query.tournId;
        const q = (parsedUrl.query.q || '').toLowerCase().trim();
        let filtered = athletes;
        if (tournId && tournId !== 'all') {
            filtered = filtered.filter(a => 
                (Array.isArray(a.registeredTournaments) && a.registeredTournaments.includes(tournId)) ||
                a.tournId === tournId ||
                a.syncedFrom === 'kukkiwon-cup-championship' ||
                ((tournId === 'tourn-kukkiwon-2026' || tournId === 'tourn-state-2026') && (
                    (Array.isArray(a.registeredTournaments) && (a.registeredTournaments.includes('tourn-kukkiwon-2026') || a.registeredTournaments.includes('tourn-state-2026'))) ||
                    a.tournId === 'tourn-kukkiwon-2026' || a.tournId === 'tourn-state-2026'
                )) ||
                !a.registeredTournaments ||
                a.registeredTournaments.length === 0 ||
                a.dojangId === 'ind-competitor' ||
                a.dojangName === 'Individual Competitor' ||
                a.isIndividual
            );
        }
        if (q) {
            filtered = filtered.filter(a => 
                (a.name && a.name.toLowerCase().includes(q)) ||
                (a.athleteId && a.athleteId.toLowerCase().includes(q)) ||
                (a.id && a.id.toLowerCase().includes(q)) ||
                (a.phone && a.phone.includes(q))
            );
        }
        return sendJson(res, 200, { success: true, count: filtered.length, athletes: filtered });
    }

    // 8B. DELETE /api/athletes (clear all athletes)
    if (method === 'DELETE' && pathname === '/api/athletes') {
        _lastClearTimestamp = Date.now();
        saveAthletesServer([]);
        return sendJson(res, 200, { success: true, count: 0, message: 'All athletes cleared successfully.', clearTimestamp: _lastClearTimestamp });
    }

    // 9. POST /api/athletes
    if (method === 'POST' && pathname === '/api/athletes') {
        try {
            const body = await parseJsonBody(req);
            if (Array.isArray(body)) {
                if (body.length === 0) {
                    _lastClearTimestamp = Date.now();
                }
                saveAthletesServer(body);
                return sendJson(res, 200, { success: true, count: body.length, athletes: body, clearTimestamp: _lastClearTimestamp });
            }
            if (body && body.clearAll === true) {
                _lastClearTimestamp = Date.now();
                saveAthletesServer([]);
                return sendJson(res, 200, { success: true, count: 0, message: 'All athletes cleared successfully.', clearTimestamp: _lastClearTimestamp });
            }
            if (!body || !body.name) {
                return sendJson(res, 400, { success: false, error: 'Athlete name is required.' });
            }
            const athletes = getAthletesServer();
            const athId = body.id || ('ath-' + Date.now().toString(36));
            const athIdx = athletes.findIndex(a => 
                (body.id && a.id === body.id) ||
                (body.athleteId && a.athleteId === body.athleteId) ||
                ((a.name || '').trim().toLowerCase() === (body.name || '').trim().toLowerCase() && body.phone && a.phone && a.phone.includes(body.phone))
            );
            const savedAth = {
                id: athId,
                athleteId: body.athleteId || ('ATH-' + Math.floor(100000 + Math.random() * 900000)),
                status: 'Pending',
                paymentStatus: 'Pending',
                feeStatus: 'Pending',
                dojangName: 'Individual Competitor',
                dojangId: 'ind-competitor',
                dojangCode: 'IND',
                tournId: body.tournId || 'tourn-state-2026',
                registeredTournaments: [body.tournId || 'tourn-state-2026'],
                createdAt: new Date().toISOString(),
                ...(athIdx >= 0 ? athletes[athIdx] : {}),
                ...body,
                updatedAt: new Date().toISOString()
            };
            if (athIdx >= 0) {
                athletes[athIdx] = savedAth;
            } else {
                athletes.unshift(savedAth);
            }
            saveAthletesServer(athletes);
            return sendJson(res, 201, { success: true, athlete: savedAth });
        } catch (err) {
            return sendJson(res, 500, { success: false, error: 'Failed to save athlete.' });
        }
    }

    // 10. PATCH /api/athletes/:id
    const athPatchMatch = pathname.match(/^\/api\/athletes\/([^\/]+)$/);
    if ((method === 'PATCH' || method === 'PUT') && athPatchMatch) {
        try {
            const targetId = athPatchMatch[1];
            const body = await parseJsonBody(req);
            const athletes = getAthletesServer();
            const idx = athletes.findIndex(a => a.id === targetId || a.athleteId === targetId);
            if (idx === -1) {
                return sendJson(res, 404, { success: false, error: 'Athlete not found.' });
            }
            athletes[idx] = {
                ...athletes[idx],
                ...body,
                updatedAt: new Date().toISOString()
            };
            saveAthletesServer(athletes);
            return sendJson(res, 200, { success: true, athlete: athletes[idx] });
        } catch (err) {
            return sendJson(res, 500, { success: false, error: 'Failed to update athlete.' });
        }
    }

    // 11. GET /api/brackets
    if (method === 'GET' && pathname === '/api/brackets') {
        const brackets = getBracketsServer();
        return sendJson(res, 200, { success: true, brackets, timestamp: _lastSyncTimestamp });
    }

    // 12. POST /api/brackets
    if (method === 'POST' && pathname === '/api/brackets') {
        try {
            const body = await parseJsonBody(req);
            const brackets = body.brackets || body || {};
            saveBracketsServer(brackets);
            return sendJson(res, 200, { success: true, timestamp: _lastSyncTimestamp });
        } catch (err) {
            return sendJson(res, 500, { success: false, error: 'Failed to save brackets.' });
        }
    }

    // 13. GET /api/competitors
    if (method === 'GET' && pathname === '/api/competitors') {
        const competitors = getCompetitorsServer();
        return sendJson(res, 200, { success: true, competitors, timestamp: _lastSyncTimestamp });
    }

    // 14. POST /api/competitors
    if (method === 'POST' && pathname === '/api/competitors') {
        try {
            const body = await parseJsonBody(req);
            const competitors = Array.isArray(body) ? body : (body.competitors || []);
            saveCompetitorsServer(competitors);
            return sendJson(res, 200, { success: true, timestamp: _lastSyncTimestamp });
        } catch (err) {
            return sendJson(res, 500, { success: false, error: 'Failed to save competitors.' });
        }
    }

    // 15. GET /api/courts
    if (method === 'GET' && pathname === '/api/courts') {
        const divisionCourts = getCourtsServer();
        return sendJson(res, 200, { success: true, divisionCourts, timestamp: _lastSyncTimestamp });
    }

    // 16. POST /api/courts
    if (method === 'POST' && pathname === '/api/courts') {
        try {
            const body = await parseJsonBody(req);
            const courts = body.divisionCourts || body || {};
            saveCourtsServer(courts);
            return sendJson(res, 200, { success: true, timestamp: _lastSyncTimestamp });
        } catch (err) {
            return sendJson(res, 500, { success: false, error: 'Failed to save courts.' });
        }
    }

    // 17. GET /api/live-sync
    if (method === 'GET' && pathname === '/api/live-sync') {
        return sendJson(res, 200, {
            success: true,
            brackets: getBracketsServer(),
            competitors: getCompetitorsServer(),
            divisionCourts: getCourtsServer(),
            athletes: getAthletesServer(),
            timestamp: _lastSyncTimestamp,
            clearTimestamp: _lastClearTimestamp
        });
    }

    // 18. POST /api/live-sync
    if (method === 'POST' && pathname === '/api/live-sync') {
        try {
            const body = await parseJsonBody(req);
            const isClearAll = !!(body && body.clearAll === true);
            if (isClearAll) {
                _lastClearTimestamp = Date.now();
                saveBracketsServer({}, true);
                saveCompetitorsServer([], true);
                saveCourtsServer({});
                saveAthletesServer([]);
            } else {
                if (body.brackets) saveBracketsServer(body.brackets, false);
                if (body.competitors) saveCompetitorsServer(body.competitors, false);
                if (body.divisionCourts) saveCourtsServer(body.divisionCourts);
                if (body.athletes) saveAthletesServer(body.athletes);
            }
            return sendJson(res, 200, {
                success: true,
                timestamp: _lastSyncTimestamp,
                clearTimestamp: _lastClearTimestamp,
                brackets: getBracketsServer(),
                competitors: getCompetitorsServer(),
                divisionCourts: getCourtsServer(),
                athletes: getAthletesServer()
            });
        } catch (err) {
            return sendJson(res, 500, { success: false, error: 'Failed to sync live data.' });
        }
    }

    // Fallback 404 for unknown API routes
    return sendJson(res, 404, {
        success: false,
        error: `Endpoint not found: ${method} ${pathname}`
    });
};
