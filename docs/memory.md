# System Memory, Key Architectural Decisions & Engineering Gotchas
## Kyorix Tournament & Event Management Platform (`EvtMgr`)
**Kyorix Sport Technology Private Limited**

---

## 1. Executive Context & System Purpose
Architectural decisions, historical bug investigations, and strict implementation invariants of the **Kyorix Tournament & Event Management Platform** (`EvtMgr`).

Engineers working on this codebase must adhere strictly to the rules and patterns documented here to avoid reintroducing previously resolved regressions.

---

## 2. Hard-Learned Lessons & Critical Engineering Gotchas

### 2.1. The Print Portal Isolation Rule & Prohibition of `body * { visibility: hidden; }`
- **Historical Issue**: When implementing print styles for the Jury Court Sheet, a global rule was added:
  ```css
  @media print {
      body * { visibility: hidden; }
      #tkd-jury-printable-area, #tkd-jury-printable-area * { visibility: visible; }
  }
  ```
- **Consequence**: Because this rule cascaded from the end of `components.css`, whenever a user printed ID cards, receipts, or rosters, every descendant element inside `.tkd-real-id-pass` (photos, names, ID badges, QR codes, tables, ribbons) inherited `visibility: hidden`. The browser print preview rendered an empty, blank navy rectangle on every page.
- **Strict Invariant**:
  1. **NEVER** use universal selectors (`body *`, `*`) with `visibility: hidden` in any stylesheet.
  2. Scoped print styling must always be isolated inside `#tkd-print-portal`.
  3. When printing ID passes via `executePrintPassHtml()`, the system dynamically injects an explicit `<style id="tkd-pass-print-orientation-style">` into `<head>`:
     ```css
     @media print {
         #app-root, #modal-container, #toast-container, header, footer, nav, .no-print {
             display: none !important;
         }
         #tkd-print-portal {
             display: block !important;
             visibility: visible !important;
         }
         #tkd-print-portal, #tkd-print-portal * {
             visibility: visible !important;
             print-color-adjust: exact !important;
         }
         .tkd-real-id-pass, .tkd-real-id-pass * {
             visibility: visible !important;
             print-color-adjust: exact !important;
         }
     }
     ```
  4. Specialized sheets (like the Jury Court Sheet) must print through `executePrintHtml()` inside `#tkd-print-portal` rather than relying on raw `window.print()` of the active DOM tree.

---

### 2.2. Single & Batch ID Card Pagination Invariants
- **Dimensions**: Physical passes are strictly `320px` wide by `472px` high (exact CR80 vertical badge ratio).
- **Sheet Height & Centering**:
  - The card wrapper (`.tkd-print-card-wrapper`) is styled with `min-height: 240mm !important; break-after: page !important;`.
  - On both A4 (297mm) and US Letter (279.4mm), `240mm` guarantees that exactly one card fits vertically on the sheet without overflowing onto a trailing page.
- **Trailing Blank Page Elimination**:
  - The last card or single card must reset pagination:
    ```css
    .tkd-print-card-wrapper:last-child,
    .tkd-print-card-wrapper:only-child {
        break-after: auto !important;
        page-break-after: auto !important;
    }
    ```
  - This ensures printing 1 card produces **exactly 1 page**, and printing $N$ cards produces **exactly $N$ pages**.

---

### 2.3. Scannable QR Codes: Vector Canvas PNG vs Raw SVG
- **Historical Issue**: Raw inline `<svg>` QR codes occasionally rendered as solid black squares or invisible paths when rasterized by `html2pdf.js` or certain printer drivers.
- **Solution (`generateQrSvg()`)**:
  - If a DOM environment is present, the QR generator renders the QR matrix onto an off-screen HTML5 `<canvas>` with a mandatory white quiet zone margin (`margin = 2`, `cellSize = 6`).
  - Converts canvas to a crisp Base64 PNG data URL (`canvas.toDataURL('image/png')`).
  - Returns `<img src="data:image/png;base64,..." alt="QR Code" style="width:100%;height:100%;object-fit:contain;background:#ffffff;">`.
  - Guarantees 100% scannability across laser printers, inkjet printers, and smartphone cameras.

---

### 2.4. Custom ID Card Templates & Contrast Inversion
- **Behavior**: Tournament directors or academies can upload custom graphic templates (`store.getIdCardTemplateBg()`).
- **Dynamic CSS Adjustments**:
  - When a template is active, `.has-custom-template` is appended to the ID card.
  - The default dark navy gradient is replaced with the custom background graphic (`background-size: 100% 100% !important`).
  - Table backgrounds and backdrops are made completely transparent (`background: transparent !important; backdrop-filter: none !important; border: none !important;`).
  - Text colors switch from white to dark slate (`#0F172A`) with high font weights (`font-black`) to guarantee legible reading over light custom artwork.

---

### 2.5. Byes in Court Scheduling: Tree Branches vs Contested Bouts
- **Historical Issue**: When a 3-competitor division (`Junior Male U-55 kg`) was generated, `draws-app` correctly had 2 matches (Match 1: Semifinal, Match 2: Final with a bye in Semifinal). However, the Jury section displayed 3 rows, listing the bye as an active ring match (`Jin Park vs bye`).
- **Domain Invariant**:
  - A bye is an **automatic bracket advancement**, not an actual contest. It has no court allocation, no round clock, and no referee scoring.
  - The Jury court match list strictly filters out byes:
    ```javascript
    const activeBouts = divisionMatches.filter(m => m.status !== 'walkover' && m.chong?.id !== 'bye' && m.hong?.id !== 'bye');
    ```
  - Total matches in Jury Section must match contested matches in `draws-app` **1:1**.

---

### 2.6. Downstream Feeder Match Synchronization (`W1`, `Winner of Semifinal`)
- Downstream knockout matches depend on the outcome of previous rounds.
- When Match 1 has not yet concluded:
  - Downstream slot is labeled `W1` (`Awaiting previous match`).
  - The `Update` scoring button is disabled (`Pending W1`).
- When Match 1 concludes at the Jury Desk:
  - Winner is dynamically propagated into the downstream match slot.
  - Downstream `Update` button immediately enables.

---

### 2.7. Staff Portal Mode vs Client Navbar Mode
- **Design Rule**: Staff members (`admin`, `organizer`) require maximum vertical working space for brackets and match tables; clients (`dojang`, `athlete`) and guests need a conventional branded top navbar.
- **The Exact Boolean Equation**:
  ```javascript
  const isClientPortal = user && (user.role === 'dojang' || user.role === 'athlete');
  const isStaffUser = Boolean(user && (user.role === 'admin' || user.role === 'organizer'));
  const isPortalMode = !isClientPortal && isStaffUser;
  ```
- **Behavior**:
  - When `isPortalMode === true`: `#btn-portal-drawer-toggle` (3-lines hamburger menu) is visible across all views (including `#events`), and the top navbar is hidden.
  - When `isPortalMode === false`: Top branded horizontal navbar is visible, and the 3-lines drawer toggle is hidden.

---

### 2.8. Zero-Invisible-Text Safeguards
- Tailwind class `.text-[#E0E7F0]` or white text can become unreadable if placed inside light containers.
- `components.css` includes global safeguard overrides that force `#0F172A` on light backgrounds and `#FFFFFF` inside dark badges and card headers.

---

### 2.9. Cache-Busting Version Protocol
- `server.js` serves static assets directly. Browser caching can prevent updated CSS or JS from loading immediately.
- Whenever `components.css` or `tkd-app.js` is modified, bump the query string version in `index.html`:
  ```html
  <link rel="stylesheet" href="css/components.css?v=243">
  <script src="js/tkd-app.js?v=316"></script>
  ```

---

### 2.10. Zero-Data Production Clean State & Version Invariants
- **Data Version**: `DATA_VERSION = 'v12_zero_data_prod'`. When the application initializes in `Store.init()`, if `localStorage.getItem('tkd_data_version') !== DATA_VERSION`, `localStorage.clear()` is called automatically.
- **Clean State**:
  - `SEED_TOURNAMENTS = []`
  - `SEED_DOJANGS = []`
  - `SEED_ATHLETES = []`
  - `SEED_COACHES = []`
  - `SEED_DRAWS = {}`
  - `SEED_RESULTS = { medalStandings: [], podiums: [], completedBouts: [] }`
  - `SEED_FEE_NOTIFICATIONS = []`
  - `data/payments.json = []`
- **Athlete Login Form**:
  - Replaced legacy account select dropdown (`<select id="ath-sel">`) with text input for Athlete ID, email, or mobile number.
  - Removed pre-filled demo passwords and hardcoded placeholder values.
- **Factory Reset Utility**:
  - Administrators can trigger `store.resetAllData()` via "Clear All Stored Browser Data (Factory Reset)" in the Security Manager view to purge any cached browser state.

---

### 2.11. Vercel Serverless Architecture & Ephemeral Storage Invariant
- **Serverless API Function**: `api/index.js` handles all REST endpoints (`/api/payments/submit-utr`, `/api/admin/payments`, `/api/config/bank-details`, etc.) via `vercel.json` rewrite: `{ "source": "/api/(.*)", "destination": "/api/index.js" }`.
- **Ephemeral Storage Invariant**:
  - Vercel Serverless Functions execute in a read-only root environment where writes outside `os.tmpdir()` (`/tmp`) fail (`EROFS`).
  - `api/index.js` initializes storage in `os.tmpdir()` on Vercel (`IS_VERCEL = !!process.env.VERCEL`) and maintains an in-memory cache fallback so payment transactions and settings function without file system errors.

---

## 3. Key Function Dictionary (`js/tkd-app.js`)

| Function Name | Purpose & Location |
| :--- | :--- |
| `renderAthleteIdCardHtml(ath, compTitle)` | Generates complete HTML string for CR80 athlete pass (~L2053) |
| `renderCoachIdCardHtml(coach, compTitle)` | Generates complete HTML string for CR80 coach pass (~L2180) |
| `executePrintPassHtml(htmlContent, isMultiple)` | Injects print portal & dynamic `<style>` to print passes cleanly (~L2318) |
| `executePrintHtml(htmlContent)` | Generic portal printer for rosters, receipts, and jury sheets (~L2362) |
| `printAthleteCard(athleteId, compTitle)` | Single athlete pass print trigger (~L2383) |
| `printCoachCard(coachId, compTitle)` | Single coach pass print trigger (~L2390) |
| `printAllAthleteCards(param, compTitle)` | Bulk batch pass print trigger (~L2397) |
| `printJuryMatchSheet()` | Isolated Jury match sheet print trigger (~L2380) |
| `printWeighInScaleSheet(tournId)` | Weigh-in marshal scales sheet print trigger (~L2437) |
| `printAcademyFeeReceipt(academyId)` | Consolidated academy tax invoice print trigger (~L2490) |
| `renderJurySection(container, court)` | Jury desk view with ring schedule and Best-of-3 scoring (~L13750) |
| `AppController.updateNavVisibility()` | Enforces portal drawer vs top navbar display (~L17050) |
