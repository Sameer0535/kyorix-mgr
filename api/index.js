const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');

const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? os.tmpdir() : path.join(__dirname, '../data');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'payment-settings.json');
const ATHLETES_FILE = path.join(DATA_DIR, 'athletes.json');
const SEED_PAYMENTS_FILE = path.join(__dirname, '../data/payments.json');
const SEED_SETTINGS_FILE = path.join(__dirname, '../data/payment-settings.json');
const SEED_ATHLETES_FILE = path.join(__dirname, '../data/athletes.json');

// In-memory fallback
let _memPayments = [];
let _memAthletes = [];
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

function initStorage() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (!fs.existsSync(PAYMENTS_FILE)) {
            if (fs.existsSync(SEED_PAYMENTS_FILE)) {
                fs.copyFileSync(SEED_PAYMENTS_FILE, PAYMENTS_FILE);
            } else {
                fs.writeFileSync(PAYMENTS_FILE, '[]', 'utf8');
            }
        }
        if (!fs.existsSync(ATHLETES_FILE)) {
            if (fs.existsSync(SEED_ATHLETES_FILE)) {
                fs.copyFileSync(SEED_ATHLETES_FILE, ATHLETES_FILE);
            } else {
                fs.writeFileSync(ATHLETES_FILE, '[]', 'utf8');
            }
        }
        if (!fs.existsSync(SETTINGS_FILE)) {
            if (fs.existsSync(SEED_SETTINGS_FILE)) {
                fs.copyFileSync(SEED_SETTINGS_FILE, SETTINGS_FILE);
            } else {
                fs.writeFileSync(SETTINGS_FILE, JSON.stringify(_memSettings, null, 2), 'utf8');
            }
        }
    } catch (err) {
        console.warn('Init storage error (using memory cache fallback):', err);
    }
}

initStorage();

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

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

module.exports = async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

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
                if (!athData && (body.entityType === 'athlete' || !body.entityType)) {
                    athData = {
                        id: body.entityId || ('ath-' + Date.now().toString(36)),
                        athleteId: body.athleteId || ('ATH-' + Math.floor(100000 + Math.random() * 900000)),
                        name: userName.trim(),
                        phone: (mobile || '').toString().trim(),
                        email: (email || '').toString().trim(),
                        dojangName: 'Individual Competitor',
                        dojangId: 'ind-competitor',
                        dojangCode: 'IND',
                        tournId: body.tournamentId || 'tourn-state-2026',
                        registeredTournaments: [body.tournamentId || 'tourn-state-2026'],
                        status: 'Pending',
                        paymentStatus: 'Pending',
                        feeStatus: 'Pending',
                        utr: utr
                    };
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
        const payments = getPayments();
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
            const athIdx = athletes.findIndex(a => 
                (pay.entityId && (a.id === pay.entityId || a.athleteId === pay.entityId)) ||
                (pay.userName && a.name && a.name.toLowerCase() === pay.userName.toLowerCase()) ||
                (pay.mobile && a.phone && a.phone.includes(pay.mobile))
            );
            if (athIdx >= 0) {
                const targetTourn = pay.tournamentId || athletes[athIdx].tournId || 'tourn-state-2026';
                const curRegs = Array.isArray(athletes[athIdx].registeredTournaments) ? athletes[athIdx].registeredTournaments : [];
                const updatedRegs = Array.from(new Set([...curRegs, targetTourn, 'tourn-state-2026']));
                athletes[athIdx] = {
                    ...athletes[athIdx],
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
                const newAth = {
                    id: pay.entityId || athData.id || ('ath-' + Date.now().toString(36)),
                    athleteId: pay.athleteId || athData.athleteId || ('ATH-' + Math.floor(100000 + Math.random() * 900000)),
                    name: pay.userName || athData.name || 'Competitor',
                    phone: pay.mobile || athData.phone || '',
                    email: pay.email || athData.email || '',
                    dojangName: athData.dojangName || 'Individual Competitor',
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
                    status: 'Passed',
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

    // 9. POST /api/athletes
    if (method === 'POST' && pathname === '/api/athletes') {
        try {
            const body = await parseJsonBody(req);
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

    // Fallback 404 for unknown API routes
    return sendJson(res, 404, {
        success: false,
        error: `Endpoint not found: ${method} ${pathname}`
    });
};
