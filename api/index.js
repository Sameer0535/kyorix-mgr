const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');

const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? os.tmpdir() : path.join(__dirname, '../data');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'payment-settings.json');
const SEED_PAYMENTS_FILE = path.join(__dirname, '../data/payments.json');
const SEED_SETTINGS_FILE = path.join(__dirname, '../data/payment-settings.json');

// In-memory fallback
let _memPayments = [];
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

            payments.unshift(newPayment);
            savePayments(payments);

            return sendJson(res, 201, {
                success: true,
                message: 'Payment proof submitted successfully! Verification in progress.',
                payment: newPayment
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

        return sendJson(res, 200, {
            success: true,
            message: 'Payment approved successfully.',
            payment: payments[index]
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

    // Fallback 404 for unknown API routes
    return sendJson(res, 404, {
        success: false,
        error: `Endpoint not found: ${method} ${pathname}`
    });
};
