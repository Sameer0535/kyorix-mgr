const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

let PORT = parseInt(process.env.PORT, 10) || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'payment-settings.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(PAYMENTS_FILE)) {
    fs.writeFileSync(PAYMENTS_FILE, '[]', 'utf8');
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
            Kyorix Sport Technology Private Limited
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
            const dirIndex = path.join(filePath, 'index.html');
            if (fs.existsSync(dirIndex)) {
                actualFilePath = dirIndex;
            }
        }

        fs.stat(actualFilePath, (statErr, finalStats) => {
            if (statErr || !finalStats.isFile()) {
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

