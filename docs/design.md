# UI/UX Design System & Style Guide
## Kyorix Tournament & Event Management Platform (`EvtMgr`)
**Kyorix Sport Technology Private Limited**  
*Olympic Federation Aesthetics & High-Fidelity Print Systems*

---

## 1. Brand Identity & Visual Language
The Kyorix visual identity embodies the discipline, speed, and precision of Olympic Taekwondo. The design marries **clean championship minimalism** with **high-contrast Olympic federation depth**, featuring rich royal blues, deep obsidian navies, crisp white surfaces, and metallic accents.

### 1.1. Core Color Palette & Design Tokens

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PRIMARY BRAND COLORS                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ #0052FF      │  │ #2563EB      │  │ #0B1B3D      │  │ #071228      │    │
│  │ Kyorix Blue  │  │ Electric Blue│  │ Olympic Navy │  │ Midnight Navy│    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                             │
│  SURFACE & BACKGROUND CANVASES                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ #F8FAFC      │  │ #FFFFFF      │  │ #F1F5F9      │  │ #E2E8F0      │    │
│  │ Canvas Slate │  │ Pure White   │  │ Surface Light│  │ Border Muted │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                             │
│  COMPETITION STATUS & CATEGORY ACCENTS                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ #10B981      │  │ #F59E0B      │  │ #EF4444      │  │ #3B82F6      │    │
│  │ Hong (Red)   │  │ Chong (Blue) │  │ Gold Merit   │  │ Verified Grn │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Token Name | Hex Code | Purpose & Usage |
| :--- | :---: | :--- |
| `--color-brand-blue` | `#0052FF` | Official Kyorix primary brand accent, logos, active tabs |
| `--color-electric-blue` | `#2563EB` | Primary interactive buttons, highlight borders, call-to-actions |
| `--color-olympic-navy` | `#0B1B3D` | Dark accreditation badges, top gradient header, jury cards |
| `--color-midnight-navy`| `#071228` | Bottom gradient endpoint, deep contrast card backdrops |
| `--color-bg-canvas` | `#F8FAFC` | Primary light page background |
| `--color-surface-white`| `#FFFFFF` | Main card surfaces, modal bodies, table containers |
| `--color-hong-red` | `#EF4444` | WT Hong (Red corner), round defeat, penalties, warnings |
| `--color-chong-blue` | `#3B82F6` | WT Chong (Blue corner), athlete accreditation pass ribbons |
| `--color-gold-merit` | `#F59E0B` | Coach pass ribbons, 1st place medals, championship awards |
| `--color-verified-green`| `#10B981` | Document verified badges, fee paid status, system seals |

---

## 2. Typography & Font Hierarchy

### 2.1. Typefaces
- **Primary Headings & Branding**: `Outfit`, `Plus Jakarta Sans`, sans-serif (Bold, 700–900).
- **Body & UI Controls**: `Inter`, system-ui, sans-serif (Medium, 500–600).
- **Match Clock & Live Scores**: `Space Grotesk`, monospace (Black, 800–900).
- **Accreditation Codes & Weights**: `JetBrains Mono`, `font-mono` (Bold, 600–700).

### 2.2. Type Scale
| Level | Font Size | Line Height | Weight | Application |
| :--- | :---: | :---: | :---: | :--- |
| **Hero / Arena Score**| `4.5rem` (72px) | `1.0` | `900` | ESS match clock, arena score display |
| **Page Title (H1)** | `1.75rem` (28px) | `1.2` | `800` | Section headers, tournament title |
| **Card Header (H2)** | `1.25rem` (20px) | `1.3` | `700` | Modal headers, court schedule cards |
| **Subhead (H3)** | `1.0rem` (16px) | `1.4` | `600` | Athlete names on ID pass, team titles |
| **Body Standard** | `0.875rem` (14px)| `1.5` | `500` | Data table rows, descriptive text |
| **Micro / Badges** | `0.6875rem` (11px)| `1.2` | `700` | Category badges, ID codes, timestamps |

---

## 3. Component Design System

### 3.1. Buttons (`.tkd-btn`)
- **Primary Brand Button** (`.tkd-btn-primary`, `.tkd-btn-blue`):
  - Background: `linear-gradient(135deg, #0052FF 0%, #2563EB 100%)`.
  - Color: `#FFFFFF` (Font weight: `700`).
  - Border radius: `0.5rem` (8px).
  - Hover effect: Subtle lift (`transform: translateY(-1px)`), elevated box-shadow (`0 4px 12px rgba(37, 99, 235, 0.3)`).
- **Secondary Outline Button** (`.tkd-btn-outline`):
  - Background: `#FFFFFF`.
  - Border: `1.5px solid #CBD5E1`.
  - Color: `#0F172A`.
  - Hover effect: Background transitions to `#F1F5F9`.
- **Destructive / Red Button** (`.tkd-btn-danger`):
  - Background: `#EF4444`.
  - Color: `#FFFFFF`.

### 3.2. Status Badges (`.tkd-badge`)
- **Verified Green** (`.tkd-badge-green`): Background `#ECFDF5`, text `#065F46`, border `#A7F3D0`.
- **Pending Amber** (`.tkd-badge-amber`): Background `#FFFBEB`, text `#92400E`, border `#FDE68A`.
- **Rejected Red** (`.tkd-badge-red`): Background `#FEF2F2`, text `#991B1B`, border `#FECACA`.
- **Accreditation Blue** (`.tkd-badge-blue`): Background `#EFF6FF`, text `#1E40AF`, border `#BFDBFE`.

### 3.3. Modals & Lightbox Overlays
- **Backdrop**: `rgba(15, 23, 42, 0.75)` with `backdrop-filter: blur(8px)`.
- **Modal Frame**: Rounded `1.25rem` (20px), white background `#FFFFFF`, deep elevation shadow `0 25px 50px -12px rgba(0, 0, 0, 0.25)`.
- **Header**: Flex layout with high-contrast title and dedicated close button (`fa-xmark`).

---

## 4. Accreditation ID Pass Design Specification

The physical ID pass is designed to standard CR80 vertical badge proportions.

```
┌──────────────────────────────────────────────┐ ◄── 320px
│             [   Lanyard Slot   ]             │
│  ══════════ Hologram Strip ════════════════  │
│                                              │
│     STATE LEVEL OPEN TAEKWONDO CHAMPIONSHIP  │
│  ──────────────────────────────────────────  │
│  ┌──────────┐  Jin Park         ┌──────────┐ │
│  │          │  ATH-849201       │  ┌────┐  │ │
│  │  Photo   │  Dragon Fist TKD  │  │ QR │  │ │
│  │ (66x80)  │  Academy          │  └────┘  │ │
│  └──────────┘                   └──────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Discipline:      Kyorugi               │  │
│  │ Format / Div:    OFFICIAL Junior       │  │
│  │ Weight Division: Junior Male U-55 kg   │  │
│  │ DOB / Age:       2009-04-12 (17y)      │  │
│  │ Contact Phone:   +91 98765 43210       │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ══════════════════════════════════════════  │
│               ATHLETE PASS                   │ ◄── Blue / Gold / Green Ribbon
└──────────────────────────────────────────────┘ ◄── 472px
```

### 4.1. Visual Elements & Anatomy
1. **Dimensions**: `width: 320px !important; height: 472px !important;` (Exact CR80 aspect ratio).
2. **Top Slot & Strip**: Rounded pill cutout (`54px x 6px`) and multi-spectrum holographic foil simulation.
3. **3-Column Athlete Header**:
   - *Left*: Athlete photo (`66px x 80px`) with rounded border and subtle drop shadow.
   - *Center*: Full name (`16px font-black text-white`), ID badge pill, and academy name.
   - *Right*: High-contrast scannable QR code (`66px x 66px`) on clean white plate with quiet zone.
4. **Verified Specification Table**: 5 clean rows detailing discipline, format, weight class, birth date/age, and emergency contact phone.
5. **Bottom Accreditation Ribbon**: Full-width colored banner (Athlete = Royal Blue, Coach = Amber Gold, Official = Emerald Green).

### 4.2. Dual Theme Support
- **Default Championship Theme**: Deep obsidian navy gradient (`linear-gradient(165deg, #0B1B3D 0%, #071228 100%)`) with electric blue border and white text.
- **Custom Uploaded Template Theme** (`.has-custom-template`):
  - Background image applied via `background-size: 100% 100%`.
  - Table backgrounds, borders, and text colors dynamically transition to dark slate (`#0F172A`) with translucent backings to prevent ugly black boxes.

---

## 5. Zero-Invisible-Text Safeguards

To prevent low-contrast accessibility failures across light/dark backgrounds:
```css
/* Safeguard: Inverted Contrast Overrides */
.text-\[\#E0E7F0\] {
    color: #0F172A !important;
}
.tkd-header .text-\[\#E0E7F0\],
.tkd-real-id-pass .text-\[\#E0E7F0\],
.bg-\[\#0B1B3D\] .text-\[\#E0E7F0\],
.bg-\[\#020717\]\/90 .text-\[\#E0E7F0\],
.bg-\[\#020717\] .text-\[\#E0E7F0\] {
    color: #FFFFFF !important;
}
```

---

## 6. High-Fidelity Print CSS Specifications

Printing ID passes, fee receipts, scale sheets, and certificates requires deterministic layout rules:

1. **Page Size & Margins**:
   ```css
   @page {
       size: portrait !important;
       margin: 0 !important;
   }
   ```
2. **Card Centering & Pagination**:
   - Each card is placed inside `.tkd-print-card-wrapper` with `min-height: 240mm !important; break-after: page !important;`.
   - The final card (`:last-child` or `:only-child`) has `break-after: auto !important;` to eliminate blank trailing sheets.
3. **Color Accuracy**:
   - Mandatory inclusion of `-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;`.
4. **Child Visibility Isolation**:
   - Explicit `.tkd-real-id-pass, .tkd-real-id-pass * { visibility: visible !important; }`.
   - Never use global `body * { visibility: hidden; }`.
