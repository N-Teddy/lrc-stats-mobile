# 🚀 LRC Stats Mobile - Strategic Architecture & Execution Plan

This report follows the **Master Prompt** protocol to deliver a world-class, mobile-native outcome for the **LRC Stats** ecosystem.

---

## 🏗️ 1. Desktop Feature Intelligence Report
*Extraction of product DNA from `lrc-stats`.*

### **A. Feature Categorization**
| Category | Desktop implementation | Internal Logic / Data Dependency |
| :--- | :--- | :--- |
| **Core** | Personnel CRUD, Activity scheduling, Attendance grid. | `dataService.js`, `uuid`, JSON persistence. |
| **Advanced** | **Vitality Intelligence**: 10-session trend analysis & growth forecasting. | `intelligenceService.js` (Last-3 vs Prev-3 sessions). |
| **Sync Engine** | High-precision Supabase sync with 'Last Write Wins' resolution. | `syncService.js` (CamelCase/SnakeCase mapping). |
| **Data Viz** | Recharts (Area, Radar, Pie) for community & person performance. | `StatsModule.jsx`, `PersonDetailModule.jsx`. |
| **Security** | Secure Vault (AES + Gzip) + local master key persistence. | `SettingsModule.jsx` using `crypto-js` and `pako`. |
| **Reporting** | Multi-year PDF Audit Suite (Portrait/Landscape). | `reportService.js` using `jsPDF`. |
| **Admin** | Immutable Audit Logs (1000 logs cap), Trash Recovery system. | `auditService.js`, `RecycleBinModule.jsx`. |
| **System** | Sandbox vs Production mode switching. | `devService.js` (Simulated dataset generation). |

### **B. Workflow & Business Rules**
- **Lock Protocol**: Attendance is "locked" after finalization to prevent tampering.
- **Engagement Thresholds**: `Very Active (>=75%)`, `Active (>=40%)`, `Inactive (<40%)`.
- **Identity Handshake**: Users must provide identity (Name/Email) for audit accountability.
- **Sandbox Protection**: Sync/Cloud operations are strictly blocked in Sandbox mode.

---

## 🔄 2. Mobile Feature Transformation Matrix
*Reimagining the application for the thumb, the pocket, and the move.*

| Desktop Feature | Mobile Transformation | Native Enhancement |
| :--- | :--- | :--- |
| **Attendance Grid** | **Tactical Swipe List**: Rapid toggle via swipe gestures or "Tap-to-Sign" cards. | **Haptic Feedback** on every presence toggle. |
| **Stats Charts** | **Snapshot Cards**: Focused, scrollable metrics with "Deep Dive" drill-downs. | **Dynamic Widgets** on iOS/Android home screens for today's attendance. |
| **Command Palette** | **Floating Action Button (FAB) + Spotlight Search**. | **Voice Commands** ("Check in Jean-Paul"). |
| **PDF Reporting** | **Share Sheet Integration**: Generate and immediately send via WhatsApp/Telegram. | **Local Print** via AirPrint/Android Print. |
| **Sync Status** | **Pull-to-Refresh** + Subtle background sync status in Header. | **Push Notifications** for birthday alerts & unlocked sessions. |
| **Identity Setup** | **Biometric Unlock**: Use FaceID/Fingerprint to access secure vault settings. | **Passkey Support** for frictionless cloud setup. |

---

## 📱 3. Mobile UX Architecture Blueprint
*Designed as a premium, native-first experience.*

### **A. Navigation Paradigm**
- **Bottom Navigation (Main)**:
  - `Dashboard`: The tactical nerve center.
  - `Directory`: Searchable personnel database.
  - `Activities`: Quick access to attendance & planning.
  - `Vault`: Security, settings, and audits.
- **Secondary Interaction**:
  - **The "Quick-Track" FAB**: Centrally placed to immediately initiate attendance for the nearest activity.
  - **Edge-to-Edge Detail Views**: Hero images for personnel with large action buttons.

### **B. Design Language: "Tactical Glass & Neon"**
- **Safe Area Management**: Full compliance with iOS Dynamic Island and Android cutout.
- **Hit Area Budget**: 48px minimum for all interactive icons.
- **One-Handed Strategy**: Interactive elements concentrated in the lower 70% of the screen.

---

## 🌊 4. User Flow Specifications
*Mobile-Native Journey Mapping.*

### **Flow: The "Tactical Checkout" (Attendance)**
1. **Entry**: User taps "Attendance" on Today's Activity card from Dashboard.
2. **State**: Loading (Skeleton) -> Empty (Show "Reach Out" suggestions).
3. **Action**: User scrolls personnel list.
   - **Gesture**: Swipe Right = Present (Green glow + Light Haptic).
   - **Gesture**: Swipe Left = Absent (Subtle Red shimmer).
4. **Conclusion**: Tapping "Finalize" triggers `TacticalModal`.
5. **Success**: Haptic success pattern + Toast notification "Audit Locked".

### **Flow: Vault Handshake (Security)**
1. **Trigger**: Tapping "Export Vault" in Settings.
2. **Challenge**: Biometric Prompt (Native).
3. **Action**: PDF generated in background thread.
4. **Success**: Native Share Sheet opens with file ready to send.

---

## 🎨 5. Figma Design System & Execution Plan

### **B. Implementation Order**
1. **Foundation**: CSS Custom Properties + Safe Area padding.
2. **Molecular**: Tactical Button, Input, BottomTab.
3. **Organism**: AttendanceCard, StatsSnapshot, NotificationToast.
4. **Template**: BaseLayout (Header + Navigation + FAB).

---

## 🛠️ 6. Engineering Implementation Roadmap (pnpm + Vite + React)

### **A. Architecture**
- **Logic Sync**: Use `lrc-stats-mobile/src/services` to mirror `lrc-stats/src/store`.
- **State**: React Context for Themes/Identity; Atomic State (Zustand or local) for attendance arrays.
- **Storage**: Use `tauri-plugin-store` for settings and `@tauri-apps/plugin-fs` for binary-encoded JSON vaults.

### **B. Milestone Breakdown**
- **M1 (Core Sync)**: Database initialization, Sync Engine migration, Sandbox generation.
- **M2 (Shell)**: Navigation, Theming, and Responsive Header.
- **M3 (Personnel)**: Searchable list, Photo capture integration, Detail views.
- **M4 (Tracking)**: Swipe-based attendance, Finalization protocol.
- **M5 (Vault)**: AES Encryption, PDF Sharing, Biometrics.

---

## ✨ 7. Innovation Proposals
*Futuristic features to mesmerize the user.*

1.  **"Handshake Pulse"**: When two users are near each other (Bluetooth LE), the app suggests syncing their local databases if they share the same Community Vault ID.
2.  **"Ocular Audit"**: Using the camera to scan a list of names or physical badges to instantly toggle attendance status (Computer Vision via Tauri Plugin).
3.  **"Predictive Presence"**: Based on historical "Vitality Rank," the app pre-fills attendance for "Very Active" members, requiring only a one-tap verification for the whole group.
