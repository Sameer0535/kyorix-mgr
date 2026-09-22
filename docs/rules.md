# Competition, Technical & Governance Rules
## Kyorix Tournament & Event Management Platform (`EvtMgr`)
**Kyorix Sport Technology Private Limited**

---

## 1. World Taekwondo (WT) Official Sparring (Kyorugi) Rules

The Kyorix platform enforces standard World Taekwondo (WT) Olympic competition bylaws, customized for state, national, and open invitational tournaments.

### 1.1. Match Structure & Best-of-3 Round System
- **Rounds**: Every bout is contested under the **Best-of-3 System**.
- **Duration**:
  - Senior & Junior Official: Three 2-minute rounds with 1-minute rest intervals.
  - Cadet & Peewee: Three 1.5-minute rounds with 1-minute rest intervals.
  - Group-4 Grassroots: Three 1-minute rounds with 45-second rest intervals.
- **Round Winner Determination**:
  1. The athlete with the higher score at the end of the round wins that round.
  2. If the round score is tied, the winner is decided by:
     - Most points scored by turning/spinning techniques.
     - If still tied, the athlete with higher-value technical points (Head > Body > Punch).
     - If still tied, the athlete with fewer `Gam-jeom` penalties incurred in that round.
     - If still tied, official referee superiority verdict.
  3. The first competitor to win **2 rounds** is declared the match winner. Round 3 is not contested if a competitor wins Rounds 1 and 2 (`2-0`).

### 1.2. Valid Scoring Techniques & Point Values
| Technique | Target Area | Points Awarded |
| :--- | :--- | :---: |
| **Straight Punch** | Valid Trunk Protector Area | **1 Point** |
| **Standard Kick** | Valid Trunk Protector Area (Dojang Sensor) | **2 Points** |
| **Turning / Spinning Kick** | Valid Trunk Protector Area | **4 Points** |
| **Standard Kick** | Valid Head Protector Area (Headgear Sensor) | **3 Points** |
| **Turning / Spinning Kick** | Valid Head Protector Area | **5 Points** |

### 1.3. Penalties (`Gam-jeom`)
- Any prohibited act results in a `Gam-jeom` declared by the Center Referee.
- **Point Award**: Each `Gam-jeom` awards **+1 point** to the opposing competitor.
- **Automatic Round Forfeiture**: Accumulating **5 `Gam-jeom` penalties** within a single round results in immediate forfeiture of that round to the opponent.
- **Prohibited Acts**:
  - Stepping outside the boundary line (`Boundary Violation`).
  - Falling down to avoid action.
  - Delaying or avoiding the match without intent to engage.
  - Grabbing, holding, pushing, or tackling the opponent.
  - Attacking below the waist (`Low Blow`).
  - Striking the opponent's face with hand/fist.
  - Attacking an opponent after the referee declares `Kal-yeo` (Break).
  - Unsportsmanlike conduct by athlete or coach.

### 1.4. Victory Decision Codes
- **PTF (Win by Final Points)**: Winner decided by accumulated score at round expiration.
- **PTG (Win by Point Gap)**: A lead of **12 or more points** at the conclusion of Round 2 or during Round 3 automatically ends the bout.
- **RSC (Win by Referee Stops Contest)**: Declared if an athlete cannot safely continue due to knockout, injury, or severe mismatch.
- **DQ (Win by Disqualification)**: Declared if an athlete fails weigh-in, uses illegal equipment, or accumulates excessive unsportsmanlike penalties.
- **WDR (Win by Withdrawal / Walkover)**: Declared if a competitor fails to report to the holding area within 2 minutes of the final bout call.

---

## 2. Tournament Bracket & Ring Allocation Rules

### 2.1. Official Single-Elimination Knockout Format
- Brackets are constructed based on the nearest power of 2 ($N = 2^k \in \{2, 4, 8, 16, 32, 64\}$).
- **Seed Seeding**:
  - Number 1 Seed placed at **Top Hong** (Position 1).
  - Number 2 Seed placed at **Bottom Chong** (Position $N$).
  - Remaining seeds placed in opposite bracket halves to prevent early clash.
- **Byes Allocation**:
  - Total byes $B = N - K$ (where $K$ is total competitors).
  - Highest seeds receive byes in Round 1.
  - **Critical Rule**: A bye is an automatic bracket advancement and **must never be scheduled as a ring match**. The Jury Court sheet strictly filters out byes (`status !== 'walkover'`).

### 2.2. Group-4 Grassroots Development Format
- Designed for grassroots, novices, and sub-junior competitors.
- Competitors are grouped into balanced 4-athlete pools based on exact weight and age.
- Guarantees each athlete at least 1–2 competitive matches.
- All 4 participants receive recognition (1st Gold, 2nd Silver, two 3rd Bronze).

### 2.3. Downstream Match Feeder Rules
- In knockout rounds, downstream match slots are dynamically populated with feeder tags (e.g. `Hong: W1`, `Chong: Jin Park`).
- The downstream match remains in a `Pending W1` state (disabled action buttons) until Match 1 concludes.
- Upon completion of Match 1 at the Jury Desk, the winning athlete is automatically written into the downstream match slot, and the action button activates immediately.

---

## 3. Official Weigh-In & Scale Marshal Governance

### 3.1. Scale Inspection & Calibration
- Official weigh-in must occur on calibrated electronic digital scales on the eve of the championship or morning of competition.
- Weigh-in Marshals record weights on the **Official Weigh-In Scale Sheet**.

### 3.2. Weight Allowance & Tolerances
- Competitors must weigh in within their registered weight category limits.
- Unless explicitly announced in tournament bulletins:
  - *Zero Tolerance*: Official State/National Ranking Tournaments (0.00 kg allowance).
  - *0.5 kg Allowance*: Approved open invitationals for minor clothing allowance.
- Competitors exceeding their weight limit are granted **one 60-minute re-weigh opportunity** before the scales close. Failure on re-weigh results in automatic disqualification (`DQ`).

---

## 4. Mandatory Document Verification & Athlete Eligibility

### 4.1. The Dual-Document Mandate
Every registered competitor must submit two separate, legible documents during online registration:
1. **Proof of Identity**: Government Aadhaar Card (or Passport / National ID).
2. **Proof of Age / Category Eligibility**: Birth Certificate issued by Municipal Corporation (or Passport / School Bonafide).

### 4.2. Verification State Machine
```
[Uploaded Document]
        │
        ├──► [Staff Lightbox Review]
        │           │
        │           ├──► APPROVED ──► Status: "Verified" (Eligible for Bout & Pass)
        │           │
        │           └──► REJECTED ──► Status: "Rejected" (Coach must re-upload)
        │
        └──► Status: "Pending Verification" (Ineligible for Ring Scheduling)
```
- **Rule**: Athletes with `Pending Verification` or `Rejected` documents cannot be printed on the Official Scale Sheet or issued physical ID passes.

---

## 5. Financial Compliance & Entry Fee Invoicing

### 5.1. Fee Structure
- **Individual Competitor Entry Fee**: Default ₹1,500 – ₹2,500 per discipline (Kyorugi / Poomsae).
- **Combined Entry Fee (Both)**: Concession bundle rate.
- **Coach / Official Accreditation Fee**: As determined by the tournament organizing committee.

### 5.2. Payment Verification Protocol
- Payments submitted via Direct UPI QR or Bank NEFT must include a verifiable Transaction Reference Number (UTR / Ref ID).
- Tournament Administrators verify incoming funds against bank account statements before marking the registration as `Verified / Paid`.
- Only `Verified / Paid` academies can generate official tax invoices and print bulk accreditation passes.

---

## 6. Access Control & Operational Navigation Rules

### 6.1. Role-Based Permissions
- **Administrator (`admin`)**: Universal read/write/edit access across all modules, settings, draws, fee structures, and certificate publishing.
- **Organizer (`organizer`)**: Full operational access to Weigh-In Desk, Court Allocations, Jury Desk, and ESS Staff Console. Restricted from changing master payment bank credentials.
- **Academy Coach (`dojang`)**: Restricted to own academy athlete roster, document uploading, invoice downloads, and ID card printing.
- **Competitor (`athlete`)**: Read-only access to own profile, document status, bout draw, and verified certificate.
- **Public Guest (`guest`)**: Read-only tournament schedule, live draws showcase, public scoreboard, and certificate QR verification.

### 6.2. Navigation Mode Governance
- **Staff Portals (`admin`, `organizer`)**:
  - The off-canvas 3-lines drawer navigation (`#btn-portal-drawer-toggle`) is permanently enabled across all sections (including `#events`).
  - Top horizontal navigation bar is suppressed to maximize screen real estate for brackets and match tables.
- **Client & Public Portals (`dojang`, `athlete`, `guest`)**:
  - Standard top branded navigation bar is visible.
  - 3-lines drawer button is suppressed.
- **Restricted Route Enforcement**:
  - Any direct URL attempt to access `#jury` or admin endpoints by non-staff immediately renders the **404 Restricted Security Screen**.
