# 📋 LRC Stats Mobile - Todo List

## 🏗️ Phase 1: Core Architecture & Setup
- [x] **M1.1: Design System Foundation**
    - [x] Port CSS variables from Desktop to Mobile.
    - [x] Implement Safe Area utilities for iOS/Android notches.
    - [x] Setup Space Grotesk and Inter fonts.
- [ ] **M1.2: Global Store & Services**
    - [ ] Port `dataService.js` (Adapt for `@tauri-apps/plugin-fs` v2).
    - [ ] Port `syncService.js` (Supabase logic).
    - [ ] Port `intelligenceService.js` (Vitality forecasting).
    - [x] Port `ThemeContext.tsx` (Lab Mode & Accents).
    - [x] Setup i18n Protocol (EN/FR parity).

## 📱 Phase 2: User Interface Shell
- [ ] **M2.1: Navigation**
    - [ ] Implement Tactical Bottom Navigation Bar.
    - [ ] Create Mobile Header with environment status (Sandbox/Prod).
- [ ] **M2.2: Global Components**
    - [ ] Port `NotificationOverlay` (Tactical Toasts).
    - [ ] Implement Mobile-native `TacticalModal` and `TacticalPrompt`.

## 📂 Phase 3: Personnel & Directory
- [ ] **M3.1: People Directory**
    - [ ] High-performance scrollable list with Vitality indicators.
    - [ ] Spotlight search.
- [ ] **M3.2: Person Detail View**
    - [ ] Edge-to-edge profile view.
    - [ ] Performance Radar/Area charts.
    - [ ] Mobile-native `PersonForm`.

## 🕒 Phase 4: Activity & Attendance Tracking
- [ ] **M4.1: Activity Management**
    - [ ] Activity list/calendar view optimized for mobile.
- [ ] **M4.2: Tactical Attendance**
    - [ ] Swipe-to-Presence list interaction.
    - [ ] Haptic feedback implementation.
    - [ ] Finalization & Lock protocol.

## 🔐 Phase 5: Security & Admin
- [ ] **M5.1: The Vault**
    - [ ] Biometric Unlock (FaceID/Fingerprint).
    - [ ] AES + Gzip backup/export logic.
    - [ ] Native Share Sheet integration for PDF reports.
- [ ] **M5.2: Auditing**
    - [ ] Log viewer for the 1000-log local buffer.
    - [ ] Maintenance & Trash recovery.

## ✨ Specialized Mobile Features
- [ ] [FUTURISTIC] Handshake Pulse (BLE Sync).
- [ ] [FUTURISTIC] Ocular Audit (Camera Badging).
- [ ] Predictive Presence system.
