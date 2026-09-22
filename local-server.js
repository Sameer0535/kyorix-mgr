const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

let PORT = parseInt(process.env.PORT, 10) || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'payment-settings.json');
const ATHLETES_FILE = path.join(DATA_DIR, 'athletes.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(PAYMENTS_FILE)) {
    fs.writeFileSync(PAYMENTS_FILE, '[]', 'utf8');
}
if (!fs.existsSync(ATHLETES_FILE)) {
    fs.writeFileSync(ATHLETES_FILE, '[]', 'utf8');
}
if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({
        enablePaymentPage: true,
        qrImageUrl: '/payment-qr.png',
        accountName: 'DARSHAN A',
        upiId: '9482797451@kotakbank',
        paymentInstructions: 'Please mention student name and program while making payment',
        accountHolderName: 'DARSHAN A',
        accountNumber: '0047818057',
        ifscCode: 'KKBK0008094',
        bankName: 'Kotak Mahindra Bank'
    }, null, 2), 'utf8');
}

// Helper to read payments
function getPayments() {
    try {
        const raw = fs.readFileSync(PAYMENTS_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        console.error('Error reading payments:', e);
        return [];
    }
}

// Helper to read payment settings
function getPaymentSettings() {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        }
    } catch (e) {
        console.error('Error reading settings:', e);
    }
    return {
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
}

function savePaymentSettings(settings) {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('Error saving settings:', e);
        return false;
    }
}

// Helper to save payments
function savePayments(payments) {
    try {
        fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('Error saving payments:', e);
        return false;
    }
}

// Helper to get athletes
function getAthletesServer() {
    try {
        if (fs.existsSync(ATHLETES_FILE)) {
            const raw = fs.readFileSync(ATHLETES_FILE, 'utf8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error('Error reading athletes:', e);
    }
    return [];
}

// Helper to save athletes
function saveAthletesServer(athletes) {
    try {
        fs.writeFileSync(ATHLETES_FILE, JSON.stringify(athletes, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('Error saving athletes:', e);
        return false;
    }
}

// Helper to parse JSON request body
function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > 10 * 1024 * 1024) { // 10MB limit for base64 images
                req.destroy();
                reject(new Error('Request entity too large'));
            }
        });
        req.on('end', () => {
            try {
                if (!body.trim()) {
                    resolve({});
                } else {
                    resolve(JSON.parse(body));
                }
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

// Helper for JSON responses
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

// MIME types map
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

// Main Server
const server = http.createServer(async (req, res) => {
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

    // =========================================================================
    // API ROUTES
    // =========================================================================

    // 1. POST /api/payments/submit-utr
    if (method === 'POST' && pathname === '/api/payments/submit-utr') {
        try {
            const body = await parseJsonBody(req);
            let { utr, userName, mobile, email, purpose, amount, notes, metadata } = body;

            // Strict Validation: UTR must be exactly 12 numeric digits
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

            // Check if UTR already exists
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

    // 5. GET /api/payments/user-history (fetch user payment records)
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

    // 5B. GET /api/payments/:id (check status by ID or UTR)
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

// Custom 404 Error Page
function render404Html(requestPath) {
    const cleanPath = String(requestPath || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found • Kyorix Tournament Platform</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #070F26;
            background-image: radial-gradient(circle at 50% 20%, #152C63 0%, #070F26 70%);
            color: #F8FAFC;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }
        .error-container {
            background: #ffffff;
            color: #0F172A;
            border-radius: 28px;
            padding: 44px 36px;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        .error-tag {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #FEE2E2;
            color: #DC2626;
            padding: 5px 14px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 20px;
        }
        .error-code {
            font-size: 80px;
            font-weight: 900;
            line-height: 1;
            letter-spacing: -3px;
            color: #0052FF;
            margin-bottom: 8px;
        }
        .error-title {
            font-size: 22px;
            font-weight: 800;
            color: #0F172A;
            margin-bottom: 12px;
        }
        .error-desc {
            font-size: 13px;
            line-height: 1.6;
            color: #64748B;
            margin-bottom: 22px;
        }
        .error-endpoint {
            background: #F1F5F9;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 10px 14px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 12px;
            color: #EF4444;
            font-weight: 600;
            margin-bottom: 28px;
            word-break: break-all;
        }
        .actions-wrap {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .btn-primary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: #0052FF;
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            padding: 13px 24px;
            border-radius: 14px;
            text-decoration: none;
            box-shadow: 0 4px 12px rgba(0, 82, 255, 0.3);
            transition: all 0.15s ease;
        }
        .btn-primary:hover {
            background: #0040CC;
            transform: translateY(-1px);
        }
        .footer-brand {
            margin-top: 24px;
            font-size: 11px;
            font-weight: 600;
            color: #94A3B8;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-tag">
            <i class="fa-solid fa-triangle-exclamation"></i>
            404 Error • Resource Not Found
        </div>
        <div class="error-code">404</div>
        <h1 class="error-title">Page Not Found</h1>
        <p class="error-desc">
            The requested path does not exist on this server. Direct URL paths such as administrative routes cannot be accessed directly in the address bar and must be opened through verified portal login.
        </p>
        <div class="error-endpoint">
            Cannot GET ${cleanPath}
        </div>
        <div class="actions-wrap">
            <a href="/" class="btn-primary">
                <i class="fa-solid fa-house"></i> Return to Tournament Platform
            </a>
        </div>
        <div class="footer-brand">
            Kyorix Sports Technology
        </div>
    </div>
</body>
</html>`;
}

    // =========================================================================
    // STATIC FILE SERVING
    // =========================================================================
    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') {
        safePath = 'index.html';
    } else if (safePath.startsWith('/') || safePath.startsWith('\\')) {
        safePath = safePath.slice(1);
    }
    if (safePath.startsWith('app/') || safePath.startsWith('app\\')) {
        safePath = 'ess-' + safePath;
    }

    const filePath = path.join(__dirname, safePath);

    fs.stat(filePath, (err, stats) => {
        let actualFilePath = filePath;
        if (!err && stats.isDirectory()) {
            if (!pathname.endsWith('/')) {
                res.writeHead(301, { Location: pathname + '/' + (parsedUrl.search || '') });
                res.end();
                return;
            }
            const dirIndex = path.join(filePath, 'index.html');
            if (fs.existsSync(dirIndex)) {
                actualFilePath = dirIndex;
            }
        }

        fs.stat(actualFilePath, (statErr, finalStats) => {
            if (statErr || !finalStats.isFile()) {
                // If this is a SPA navigation route without a file extension (e.g. /organizer, /admin, /dashboard), serve index.html
                const cleanExt = path.extname(pathname);
                if (!cleanExt) {
                    const indexPath = path.join(__dirname, 'index.html');
                    if (fs.existsSync(indexPath)) {
                        res.writeHead(200, {
                            'Content-Type': 'text/html; charset=utf-8',
                            'Cache-Control': 'no-cache, must-revalidate'
                        });
                        fs.createReadStream(indexPath).pipe(res);
                        return;
                    }
                }

                // Return custom 404 page immediately with HTTP status 404
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(render404Html(pathname));
                return;
            }

            const ext = path.extname(actualFilePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';

            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, must-revalidate'
            });

            const stream = fs.createReadStream(actualFilePath);
            stream.pipe(res);
        });
    });
});

function startServer(portToTry) {
    server.listen(portToTry, () => {
        console.log(`[Kyorix API & Web Server] running on http://localhost:${portToTry}`);
    });
}

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.warn(`[Kyorix API & Web Server] Port ${PORT} is in use, trying port ${PORT + 1}...`);
        PORT += 1;
        startServer(PORT);
    } else {
        console.error('[Kyorix API & Web Server] Server error:', err);
    }
});

startServer(PORT);

