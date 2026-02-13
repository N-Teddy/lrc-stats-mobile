# 📋 LRC Stats Mobile - Todo List

## 🏗️ Phase 1: Core Architecture & Setup
- [x] **M1.1: Design System Foundation**
    - [x] Port CSS variables from Desktop to Mobile.
    - [x] Implement Safe Area utilities for iOS/Android notches.
    - [x] Setup Space Grotesk and Inter fonts.
- [x] **M1.2: Global Store & Services**
    - [x] Port `dataService.ts` (Adapt for `@tauri-apps/plugin-fs` v2).
    - [x] Port `syncService.ts` (Supabase logic).
    - [x] Port `intelligenceService.ts` (Vitality forecasting).
    - [x] Port `ThemeContext.tsx` (Lab Mode & Accents).
    - [x] Setup i18n Protocol (EN/FR parity).
    - [x] Setup CI/CD (GitHub Actions) for Android builds.

- [x] **M2.1: Navigation**
    - [x] Implement Tactical Bottom Navigation Bar.
    - [x] Create Mobile Header with environment status (Sandbox/Prod).
- [x] **M2.2: Global Components**
    - [x] Port `NotificationOverlay` (Tactical Toasts).
    - [x] Implement Mobile-native `TacticalModal` and `TacticalPrompt`.

## 📂 Phase 3: Personnel & Directory
- [x] **M3.1: People Directory**
    - [x] High-performance scrollable list with Vitality indicators.
    - [x] Spotlight search.
- [x] **M3.2: Person Detail View**
    - [x] Edge-to-edge profile view.
    - [x] Performance Radar/Area charts.
    - [x] Mobile-native `PersonForm`.

## 🕒 Phase 4: Activity & Attendance Tracking
- [x] **M4.1: Activity Management**
    - [x] Activity list/calendar view optimized for mobile.
- [x] **M4.2: Tactical Attendance**
    - [x] Swipe-to-Presence list interaction.
    - [x] Haptic feedback implementation.
    - [x] Finalization & Lock protocol.

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
