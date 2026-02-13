# 📱 LRC Stats Mobile - Strategic Development Plan

This document outlines the tactical roadmap for porting the **LRC Stats Desktop Application** to a mobile environment using **Tauri 2.0 (Android/iOS)**.

## 🎯 Primary Objectives
1.  **Parity**: Maintain 100% data and logic parity with the desktop version.
2.  **Optimization**: Redesign the interface for high-precision thumb-driven interaction.
3.  **Efficiency**: Maximize logic reuse from the existing React/JavaScript codebase.
4.  **Security**: Port the secure Vault (AES + Gzip) encryption system.

---

## 🏗️ Phase 1: Foundation & Identity
**Goal**: Establish the "High-Precision Technical" design system for mobile.

- **Step 1.1: Core Styles (`index.css`)**
    - Port CSS variables (Colors, Transitions, Glassmorphism).
    - Add mobile-specific utilities (Safe areas, touch-friendly hit areas).
- **Step 1.2: Identity & Theme**
    - Port `ThemeContext.jsx` for Accent Color and Lab Mode (Dark/Light).
    - Port `i18n` configuration and localization files (`en/common.json`, `fr/common.json`).

---

## 📦 Phase 2: Logic Porting (The "Store")
**Goal**: Migrate the engine of the application.

- **Step 2.1: Data Service (`dataService.js`)**
    - Adapt for mobile filesystem or secure storage (using Tauri's new `fs` and `store` plugins).
    - Ensure local persistence of People, Activities, and Attendance.
- **Step 2.2: Sync Service (`syncService.js`)**
    - Implement Supabase synchronization.
    - Ensure high-precision conflict resolution for mobile network constraints.
- **Step 2.3: Tactical Notification Suite**
    - Port the `notificationService.js` and in-app overlay logic developed for desktop.
    - Ensure `TacticalModal` and `TacticalPrompt` are mobile-responsive.

---

## 🎨 Phase 3: High-Precision Mobile UI
**Goal**: Implement the shell and navigation.

- **Step 3.1: Global Layout**
    - Replace the Sidebar with a **Tactical Bottom Navigation Bar**.
    - Implement a mobile-optimized Header with status indicators (Sync/Encryption).
- **Step 3.2: Module Shells**
    - Create responsive containers for all functional modules.

---

## 🛠️ Phase 4: Functional Modules
**Goal**: Feature-by-feature migration.

- **Step 4.1: Dashboard & Stats**
    - Optimized Recharts for smaller screens.
    - Tactical summaries (Activity counts, Active members).
- **Step 4.2: Directory (People)**
    - Implement a high-performance scrollable list.
    - Mobile-optimized `PersonForm`.
- **Step 4.3: Activity Management**
    - Calendar/List view for activities.
    - **Step 4.3.1: Attendance Tracker**: The core attendance interface redesigned for high-occupancy mobile input (large buttons, rapid toggle).
- **Step 4.4: Settings & Vault**
    - Port Export/Import and Backup features.
    - Implement the "Maintenance" mode for mobile.

---

## 🧪 Phase 5: Mobile Specialization
**Goal**: Add features native to mobile devices.

- **Step 5.1: Biometric Handshake** (Optional/Future)
    - Use system biometrics instead of manual password prompts where available.
- **Step 5.2: Offline Protocol**
    - Enhance offline persistence for areas with low connectivity (very common for mobile use).
- **Step 5.3: Haptic Feedback**
    - Add meaningful haptics for successful saves or tactical errors.

---

## 🚦 Current Status: [READY TO COMMENCE]
Waiting for further instructions to begin **Phase 1**.
