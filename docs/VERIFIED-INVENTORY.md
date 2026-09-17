# Project Atlas — Verified Portfolio Inventory

This document provides the authoritative inventory of projects represented in Project Atlas. Each entry states its verified status, implementation evidence, and public source availability.

---

## Evidence Classification Policy

Project Atlas distinguishes strictly between:
- **`verified-source`**: The code or system directly reflects an implemented public repository.
- **`adapted-example`**: The code has been simplified or adapted for portfolio demonstration.
- **`conceptual`**: Architectural designs or mechanics specifications that have not been deployed as shipped applications.
- **`simulation`**: Interactive simulated environments (e.g. simulated terminal consoles).

---

## Project Catalog

### 1. Sonara
- **ID**: `sonara`
- **Status**: `active` (Flagship)
- **Role**: Software Developer & Audio Systems Designer
- **Technologies**: Flutter, Dart, C++, FFI, TagLib, Provider, SQLite
- **Public Repo**: `https://github.com/StretchWave/sonara`
- **Implementation Facts**: Desktop audio library manager and ID3 metadata tag editor with native C++ FFI integration.
- **Evidence Level**: `verified-source`

### 2. Lyrune
- **ID**: `lyrune`
- **Status**: `active` (Flagship)
- **Role**: Creative Technologist & Web Audio Engineer
- **Technologies**: React, TypeScript, Web Audio API, Canvas 2D / FFT, CSS Custom Properties
- **Public Repo**: `https://github.com/StretchWave/lyrune`
- **Implementation Facts**: Web-based procedural audio synthesizer, dual-oscillator FM/AM voice engine, biquad filter sweeps, and real-time FFT visualizer.
- **Evidence Level**: `verified-source`

### 3. Kerala Flood Risk Platform
- **ID**: `kerala-flood-risk-platform`
- **Status**: `in-progress` (Flagship)
- **Role**: Data Systems & Machine Learning Engineer
- **Technologies**: Python, pandas, cuDF / RAPIDS (exploratory), PySpark (benchmarking), XGBoost, FastAPI, BigQuery (cloud blueprint)
- **Public Repo**: `https://github.com/StretchWave/kerala-flood-risk-platform`
- **Implementation Facts**: Disaster decision-support demonstration: synthetic panchayat telemetry generation, exploratory GPU/Spark ETL benchmarks, XGBoost flood-risk scoring, and FastAPI alert endpoints.
- **Evidence Level**: `adapted-example` (Demonstration with synthetic telemetry and cloud architecture blueprint)

### 4. Neerad Store
- **ID**: `neerad-store`
- **Status**: `active` (Featured)
- **Role**: Full-Stack Desktop Developer
- **Technologies**: Flutter, Dart, SQLite, Provider, PDF generation, ESC/POS thermal printing
- **Public Repo**: `https://github.com/StretchWave/neerad-store`
- **Implementation Facts**: Offline-first desktop point-of-sale and retail billing system with inventory tracking, invoice generation, and local database storage.
- **Evidence Level**: `verified-source`

### 5. Lucida-Sync
- **ID**: `lucida-sync`
- **Status**: `active` (Featured)
- **Role**: Systems Programmer
- **Technologies**: Node.js, TypeScript, SHA-256, File System API, CLI
- **Public Repo**: `https://github.com/StretchWave/lucida-sync`
- **Implementation Facts**: Bi-directional directory synchronization utility with content hashing, change detection, and simulated diagnostic console.
- **Evidence Level**: `adapted-example`

### 6. RecoverAI
- **ID**: `recoverai`
- **Status**: `active` (Featured)
- **Role**: Computer Vision Developer
- **Technologies**: Python, OpenCV, PyTorch, NumPy, Pillow, Tesseract OCR
- **Public Repo**: `https://github.com/StretchWave/recoverai`
- **Implementation Facts**: Document image enhancement, geometric dewarping, contrast normalization, and OCR pre-processing pipeline.
- **Evidence Level**: `adapted-example`

### 7. ScrollBrake
- **ID**: `scrollbrake`
- **Status**: `active` (Supporting)
- **Role**: Android Mobile Developer
- **Technologies**: Flutter, Android AccessibilityService, Kotlin, SharedPreferences
- **Public Repo**: `https://github.com/StretchWave/scrollbrake`
- **Implementation Facts**: Android digital wellbeing utility that detects infinite-scroll UI elements and introduces friction interventions.
- **Evidence Level**: `verified-source`

### 8. Stance Combat PvP
- **ID**: `stance-combat-pvp`
- **Status**: `concept` (Design Concept — Excluded from verified project count)
- **Role**: Combat Mechanics Designer
- **Technologies**: Finite State Machines, Frame-Data Design, Deterministic Timings
- **Public Repo**: Conceptual architecture documented in Atlas
- **Implementation Facts**: Conceptual frame-data combat model demonstrating startup, active, recovery, and invulnerability (I-frame) state transitions. **Explicitly labeled as a conceptual design, not shipped game software.**
- **Evidence Level**: `conceptual`

### 9. Main Menu
- **ID**: `main-menu`
- **Status**: `prototype` (Supporting)
- **Role**: 3D UI Developer
- **Technologies**: Three.js, WebGL, GLSL, HTML/CSS
- **Public Repo**: `https://github.com/StretchWave/main-menu`
- **Implementation Facts**: Procedural animated 3D game main menu prototype with shader-driven camera drift and interactive buttons.
- **Evidence Level**: `verified-source`
