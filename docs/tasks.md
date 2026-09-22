# Task Tracking, Verification Matrix & Roadmap
## Kyorix Tournament & Event Management Platform (`EvtMgr`)
**Kyorix Sport Technology Private Limited**

---

## 1. Completed Milestones & Delivered Capabilities

### Milestone 1: Core Tournament Engine & Multi-Role Architecture
- [x] Multi-role authentication & session state (`admin`, `organizer`, `dojang`, `athlete`, `guest`).
- [x] Observable state management store (`state.js`) with instant `localStorage` persistence.
- [x] Node.js backend server (`server.js`) with REST APIs for payment transactions & settings.
- [x] Dynamic tournament creation, editing, category configuration, and date scheduling.

### Milestone 2: Athlete Registration & Compliance Verification
- [x] Academy athlete roster entry with WT age divisions and weight category sanitation.
- [x] Division formats: Official Single-Elimination Knockout vs Group-4 Grassroots Pools.
- [x] Mandatory document compliance: Aadhaar Card (ID) + Birth Certificate (Age).
- [x] Full-screen Document Lightbox supporting high-res images and embedded multi-page PDFs.
- [x] Verification state transitions (`Pending`, `Verified`, `Rejected`) with instant badge updates.

### Milestone 3: Finance, Direct UPI QR & Invoicing
- [x] Direct UPI QR code generator encoding merchant VPA, payee name, and dynamic entry fee amounts.
- [x] NEFT / IMPS / RTGS bank transfer details display with instant copy triggers.
- [x] Automated UPI deep-link intent trigger for mobile devices (`upi://pay?...`).
- [x] Consolidated Academy Master Tax Invoice generation with itemized athlete rosters.
- [x] Individual Athlete Fee Payment Receipt for reimbursement claims.

### Milestone 4: Accreditation ID Pass & High-Fidelity Printing
- [x] Standard CR80 proportional physical pass layout (320px x 472px).
- [x] Side-by-side header: Athlete photo (66x80px), name & ID badge, and vector QR code plate.
- [x] Scannable QR code generation containing full athlete bio payload.
- [x] Custom Tournament Template Studio (`store.getIdCardTemplateBg()`) with auto-contrast tables.
- [x] Isolated `#tkd-print-portal` print pipeline.
- [x] Single ID card print: Guaranteed exactly 1 sheet of paper with zero blank overflow pages.
- [x] Batch ID card print: Exactly N sheets of paper (1 pass per sheet) for all registered competitors.

### Milestone 5: Tournament Brackets & Draws Engine (`draws-app`)
- [x] Automated single-elimination knockout tree generation for 2, 4, 8, 16, 32, 64 athletes.
- [x] Seed distribution: #1 Top Hong, #2 Bottom Chong, balanced remaining seeds.
- [x] Bye handling: Byes advance competitors without creating active contested bouts.
- [x] Dynamic downstream winner feeder tags (`W1`, `Winner of Semifinal`).

### Milestone 6: Official Jury Section & Best-of-3 Court Desk
- [x] Role-restricted route protection: Strictly accessible only to `admin` and `organizer`.
- [x] 404 Security Barrier screen for unauthorized guest/athlete access attempts.
- [x] Ring Court Filtering (Court 01, Court 02, Court 03, Court 04, All Courts).
- [x] Elimination of byes from ring match schedules (only contested bouts are scheduled).
- [x] Best-of-3 live bout scoring desk with Point Gap (`PTG`), Final Points (`PTF`), RSC, DQ, WDR.
- [x] Real-time downstream feeder advancement: Scoring Match 1 immediately advances winner into Match 2.
- [x] Isolated Jury Match Sheet printing (`printJuryMatchSheet()`).

### Milestone 7: Navigation Uniformity & Menu Bar Retention
- [x] Staff portals (`admin`, `organizer`) retain 3-lines drawer menu bar across all views (including `#events`).
- [x] Drawer item active state highlighting synchronized with current hash route.
- [x] Client/Guest views (`dojang`, `athlete`, `guest`) retain clean top branded navbar.

### Milestone 8: Electronic Scoring System (ESS - `ess-app`)
- [x] Real-time referee scoring console with round timers, rest intervals, and timeout controls.
- [x] Technical points scoring: Punch (1 pt), Body Kick (2 pts), Turning Body (4 pts), Head Kick (3 pts), Turning Head (5 pts).
- [x] Penalty logic: `Gam-jeom` counters (+1 to opponent; 5 Gam-jeom = round forfeiture).
- [x] Arena Scoreboard display mode for stadium projectors and ring monitors.

### Milestone 9: Certificate Studio & Verification Engine
- [x] Official World Taekwondo (WT) gold border restoration.
- [x] Dynamic generation of Merit Certificates (1st, 2nd, 3rd) and Participation Certificates.
- [x] Tamper-proof verification QR codes encoding `#verify-cert?certId=XYZ`.
- [x] Client-side A4 Landscape PDF export.

### Milestone 10: Production Clean State & Vercel Serverless Deployment
- [x] All mock athletes, mock coaches, mock draws, mock results, and dummy payments purged.
- [x] Zero-tournament default shell: platform boots to 100% clean state ready for real championship creation.
- [x] Athlete login modal updated: removed dropdown selector, replaced with Athlete ID/email/phone input field; removed default/demo passwords.
- [x] Admin, Organizer, and Academy auth forms updated: removed hardcoded credentials, replaced with clean placeholder prompts.
- [x] Added "Clear All Stored Browser Data (Factory Reset)" button in Admin Security Manager.
- [x] Created `package.json`, `vercel.json` rewrite configuration, and `api/index.js` serverless function handler.

---

## 2. Verification Test Matrix

| Verification Item | Test Procedure | Expected Outcome | Status |
| :--- | :--- | :--- | :---: |
| **ID Card Print (Single)** | Click "Print Pass" on athlete row | Exactly 1 sheet of paper; photo, name, QR, table 100% visible | ✅ Passed |
| **ID Card Print (Batch)** | Click "Print All ID Cards" on roster of 10 | Exactly 10 sheets of paper (1 pass per page); 0 blank pages | ✅ Passed |
| **Print CSS Universal Clean** | Audit computed styles under print media | No elements match `body * { visibility: hidden; }` | ✅ Passed |
| **Jury Match Schedule Alignment** | 3-competitor division (`Junior Male U-55 kg`) | Exactly 2 matches on court schedule; byes filtered out | ✅ Passed |
| **Jury Feeder Propagation** | Score Semifinal Match 1 (2-0 PTG) | Winner (`Liam Zhang`) advances to Match 2; `Update` button enables | ✅ Passed |
| **Jury Security Barrier** | Navigate to `/#jury` as guest or athlete | Custom 404 Restricted security screen displayed | ✅ Passed |
| **Organizer Navigation Bar** | Navigate to `#events` / Tournaments as Organizer | 3-lines menu bar retained; top navbar hidden | ✅ Passed |
| **Admin Navigation Bar** | Navigate to `#events` / Tournaments as Admin | 3-lines menu bar retained; top navbar hidden | ✅ Passed |
| **Client Navbar Retention** | Navigate as Coach or Athlete | Top branded navbar visible; 3-lines drawer button hidden | ✅ Passed |
| **Document Lightbox** | Click document badge on athlete row | High-res image or multi-page PDF renders in full modal | ✅ Passed |
| **UPI QR Payment** | Open payment modal for Academy | Dynamic QR displays correct amount & Kotak bank VPA | ✅ Passed |
| **Server Persistence** | Record payment and restart server | Payment record persists in `data/payments.json` | ✅ Passed |
| **Certificate QR Verification** | Scan QR code on generated certificate | Opens `#verify-cert` with verified athlete credentials | ✅ Passed |
| **Production Data Purge** | Fresh app boot & version check | 0 athletes, 0 clubs, 0 tournaments, 0 payments | ✅ Passed |
| **Vercel Serverless Function** | Load `/api/index.js` with Node runtime | Loads cleanly as valid HTTP handler function | ✅ Passed |

---

## 3. Active & Short-Term Tasks
- [x] Remove conflicting global print rules in `components.css`.
- [x] Implement isolated `printJuryMatchSheet()` function in `tkd-app.js`.
- [x] Create project mandatory documentation set (`prd.md`, `architecture.md`, `rules.md`, `design.md`, `tasks.md`, `memory.md`).
- [x] Purge test data, update athlete login form, and configure Vercel deployment.
- [ ] Implement browser print dialog auto-trigger bypass in unit test runners.
- [ ] Add bulk athlete CSV import template for academy coaches.

---

## 4. Product Roadmap (Future Phases)

### Phase 2: Live Arena Telemetry & Network Sync
- [ ] **Multi-Mat WebSocket Synchronization**:
  - Central server relay broadcasting court bout scores to spectator arena screens in real time.
- [ ] **Corner Judge Wireless Remote Integration**:
  - Mobile web app for corner judges (Blue/Red clickers) over local Wi-Fi.

### Phase 3: Athlete Experience & Communication
- [ ] **WhatsApp / SMS Automated Bout Calls**:
  - Automatic notification to coaches when an athlete's bout is 2 matches away from being called to the holding area.
- [ ] **Live Video Replay (IVR) System**:
  - Integration with USB webcams for Jury review of challenged head kicks.

### Phase 4: Federation Analytics & Records
- [ ] **Championship Medal Tally**:
  - Real-time aggregation of Gold, Silver, and Bronze points by academy dojang.
- [ ] **Permanent Athlete Digital Passbook**:
  - Longitudinal fight record tracking across multiple state and national championships.
