# System Architecture Document
## Kyorix Tournament & Event Management Platform (`EvtMgr`)
**Kyorix Sport Technology Private Limited**

---

## 1. High-Level Architecture Overview
The Kyorix Event Manager (`EvtMgr`) is engineered as a **hybrid local-first Single-Page Application (SPA)** with embedded modular micro-applications (`draws-app`, `ess-app`) and a lightweight Node.js persistence daemon (`server.js`).

The platform is designed to run reliably in both cloud-hosted environments and offline arena local-area networks (LAN) where internet connectivity cannot be guaranteed during active championship bouts.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             BROWSER RUNTIME                                  │
│                                                                             │
│  ┌─────────────────────────┐  ┌───────────────────────┐  ┌───────────────┐  │
│  │   Core Tournament App   │  │   Draws Engine App    │  │  ESS Scoring  │  │
│  │     (tkd-app.js)        │  │     (draws-app/)      │  │  (ess-app/)   │  │
│  └────────────┬────────────┘  └───────────┬───────────┘  └───────┬───────┘  │
│               │                           │                      │          │
│               ▼                           ▼                      ▼          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │           Global Reactive State Store (Store / state.js)              │  │
│  │    (Athletes, Dojangs, Tournaments, Draws, ESS, Payments, Certs)      │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│                         ┌────────────┴────────────┐                         │
│                         ▼                         ▼                         │
│               ┌───────────────────┐     ┌───────────────────┐               │
│               │   localStorage    │     │ #tkd-print-portal │               │
│               │ (Offline Cache)   │     │  (Print Engine)   │               │
│               └───────────────────┘     └───────────────────┘               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            NODE.JS BACKEND (server.js)                      │
│   Endpoints:                                                                │
│   • POST /api/payments/submit-utr   • GET /api/admin/payments               │
│   • GET /api/payments/user-history  • GET/POST /api/config/bank-details     │
│   • Static Asset Server (Port 3001) • Data Persistence (data/*.json)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure & Key Artifacts
```text
EvtMgr/
├── index.html                  # Single-page application entry point & root DOM
├── server.js                   # Node.js backend HTTP server & REST API
├── data/                       # Server-side persistent storage
│   ├── payments.json           # Record of recorded fee transactions
│   └── payment-settings.json   # UPI VPA, QR image, Bank details
├── css/                        # Olympic Federation design stylesheets
│   ├── main.css                # Base variables, typography, reset
│   ├── components.css          # Badges, buttons, modals, cards, ID pass, print rules
│   ├── brackets.css            # Tournament bracket visualization styles
│   └── scoreboard.css          # Arena ESS electronic scoreboard styles
├── js/                         # Client-side runtime logic
│   ├── tkd-app.js              # Master controller, views, forms, modals (17k+ LOC)
│   ├── state.js                # Observable store pattern & persistent state manager
│   ├── tkdConstants.js         # WT belts, weight classes, age divisions, poomsae
│   ├── mockData.js             # Initial bootstrap dataset for tournaments & athletes
│   ├── qrcode.min.js           # QR code matrix generation engine
│   └── html2pdf.bundle.min.js  # Client-side PDF export wrapper (jspdf + html2canvas)
├── draws-app/                  # Dedicated tournament tree & knockout bracket micro-app
│   ├── index.html              # Standalone bracket viewer
│   └── assets/                 # Bracket bundle scripts & SVGs
├── ess-app/                    # Electronic Scoring System micro-app
│   ├── index.html              # Standalone referee court scoring console
│   └── assets/                 # ESS audio cues, sensor hooks & scoreboard CSS
└── images/                     # Official brand logos, badges, and template assets
```

---

## 3. State Management & Data Flow Architecture

### 3.1. The Store Singleton (`state.js`)
All operational data is managed through a centralized, reactive observable store class instantiated as `store` and exposed globally via `window.store`.

```javascript
class Store {
    constructor() {
        this.tournaments = [];
        this.athletes = [];
        this.dojangs = [];
        this.coaches = [];
        this.draws = {};
        this.essMatches = [];
        this.currentUser = null;
        this.selectedTournamentId = null;
        this.paymentSettings = {};
        this.certificates = [];
        this.idCardTemplateBg = null;
        this.init();
    }
}
```

### 3.2. Two-Tier Persistence Pipeline
1. **Tier 1 — Client Storage (`localStorage`)**:
   - Keys: `tkd_tournaments`, `tkd_athletes`, `tkd_dojangs`, `tkd_draws`, `tkd_certs`, `tkd_user`.
   - Guaranteed immediate read/write with zero network latency.
2. **Tier 2 — Server REST Storage (`server.js`)**:
   - Automatic sync on startup: `store.syncWithServerPayments()` queries `/api/payments`.
   - Payment transactions and bank settings are committed to atomic server JSON files: `data/payments.json` and `data/payment-settings.json`.

---

## 4. Navigation & Route Guard Architecture

### 4.1. Hash-Based Client Routing
The application uses hash-based client routing handled by `AppController.navigate(view, param)`.
Supported route paths:
- `#events` / `#tournaments`: Tournament listings & event management.
- `#dashboard`: Academy athlete roster, document verification badges, actions.
- `#draws`: Interactive single-elimination tournament tree viewer.
- `#jury`: Ring court schedule, Best-of-3 scoring desk, and ring assignments.
- `#ess`: Electronic Scoring System referee console and public arena scoreboard.
- `#weighin`: Weigh-in marshals scale sheet and category roster.
- `#certificates`: Merit and participation certificate studio.
- `#verify-cert?certId=XYZ`: Public tamper-proof credential verification.

### 4.2. Portal Mode vs. Top Navbar Mode
The navigation system dynamically adapts based on the active role and route:
```javascript
const isClientPortal = user && (user.role === 'dojang' || user.role === 'athlete');
const isStaffUser = Boolean(user && (user.role === 'admin' || user.role === 'organizer'));
const isPortalMode = !isClientPortal && isStaffUser;
```
- **Staff Users (`admin`, `organizer`)**: `isPortalMode === true` everywhere (including `#events`).
  - Top horizontal navigation bar is hidden.
  - `#btn-portal-drawer-toggle` (3-lines hamburger menu) is permanently visible.
  - Off-canvas drawer `#tkd-portal-drawer` controls navigation across all modules.
- **Client & Public Users (`dojang`, `athlete`, `guest`)**: `isPortalMode === false`.
  - Standard branded horizontal navbar is visible.
  - Drawer toggle is hidden.

### 4.3. Route Security & Access Control Matrix
| Hash Route | `admin` | `organizer` | `dojang` | `athlete` | `guest` (Public) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `#events` | Full Access | Full Access | View Only | View Only | View Only |
| `#dashboard` | Full Access | Full Access | Own Academy | Own Profile | Restricted (404) |
| `#draws` | Edit / Seed | Edit / Seed | View Brackets | View Brackets | View Brackets |
| `#jury` | Full Access | Full Access | Restricted (404) | Restricted (404) | Restricted (404) |
| `#ess` | Full Console | Full Console | Scoreboard Only | Scoreboard Only | Scoreboard Only |
| `#weighin` | Full Desk | Full Desk | View Roster | Restricted (404) | Restricted (404) |
| `#certificates` | Issue / Edit | Issue / Edit | Download Own | Download Own | Verify QR Only |

---

## 5. Print Pipeline & Isolation Architecture

### 5.1. The Isolated `#tkd-print-portal` Strategy
Standard browser printing often fails in complex SPAs due to cascading styles, position wrappers, and overflow clipping. EvtMgr uses an isolated DOM print portal:

```
[User Clicks "Print ID Pass"]
           │
           ▼
1. Render HTML component into dedicated `#tkd-print-portal`
           │
           ▼
2. Add class `tkd-printing-idpass` to <body>
           │
           ▼
3. Inject dynamic scoped <style id="tkd-pass-print-orientation-style"> to <head>:
   - @page { size: portrait !important; margin: 0 !important; }
   - Hide #app-root, #modal-container, #toast-container, header, nav
   - Set #tkd-print-portal { display: block !important; visibility: visible !important; }
   - Set .tkd-real-id-pass, .tkd-real-id-pass * { visibility: visible !important; }
           │
           ▼
4. window.print() triggers browser native print dialog
           │
           ▼
5. 'afterprint' event listener fires:
   - Removes dynamic <style>
   - Clears #tkd-print-portal.innerHTML
   - Removes body.tkd-printing-idpass
```

### 5.2. Critical CSS Safeguards
- **Prohibition of Global `body * { visibility: hidden; }`**: Never place universal hiding rules in print stylesheets. Children inside portals will inherit or be suppressed by universal selectors.
- **Exact Pagination Rules**:
  - `.tkd-print-card-wrapper`: `min-height: 240mm !important; break-after: page !important;`
  - `.tkd-print-card-wrapper:last-child`, `.tkd-print-card-wrapper:only-child`: `break-after: auto !important;` (guarantees zero blank trailing sheets).
- **Exact Color Preservation**: `-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;`.

---

## 6. Sub-Applications & Integration Interfaces

### 6.1. Tournament Draws Engine (`draws-app`)
- **Seeding Algorithm**:
  - Automatically computes smallest enclosing power of 2 ($N = 2^{\lceil \log_2 K \rceil}$).
  - Computes byes: $B = N - K$.
  - Assigns top seeds to opposite bracket poles (Hong top, Chong bottom).
  - Walkovers are marked with `status = 'walkover'`.
- **Downstream Match Feeder Synchronization**:
  - Bouts have feeder dependencies (e.g. `Hong: W1`, `Chong: Jin Park`).
  - Feeder winner resolution updates downstream participants in real time.

### 6.2. Electronic Scoring System (`ess-app`)
- **State Machine**:
  - States: `STOPPED`, `ROUND_ACTIVE`, `INTERVAL`, `TIMEOUT`, `SUDDEN_DEATH`, `COMPLETED`.
  - High-precision 100ms interval timer with pause/resume debouncing.
- **Penalty Logic**:
  - Accumulation of 5 `Gam-jeom` penalties within a single round immediately triggers an automatic round win for the opponent.
- **Point Gap (`PTG`) Rules**:
  - A lead of 12+ points at the end of Round 2 or Round 3 automatically ends the match by point gap.

---

## 7. Security, QR Cryptography & Document Integrity
- **Physical ID Pass QR Code**:
  - Generated using local vector canvas PNG data URLs with a mandatory quiet zone.
  - Encodes a JSON payload:
    ```json
    {
      "athleteId": "ATH-849201",
      "fullName": "Jin Park",
      "competition": "State Level Open Taekwondo Championship 2026",
      "category": "Junior (15–17 yrs)",
      "weightDivision": "Junior Male U-55 kg",
      "dob": "2009-04-12",
      "age": 17,
      "phone": "+91 98765 43210",
      "academy": "Dragon Fist TKD Academy"
    }
    ```
- **Certificate Verification Endpoint**:
  - Every certificate encodes `#verify-cert?certId=${cert.id}`.
  - Scanning with any smartphone opens the public verification screen validating the competitor name, rank, category, event date, and digital tournament seal.
