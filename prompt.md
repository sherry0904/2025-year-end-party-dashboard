# Role & Objective
You are a Lead Creative Frontend Developer.
Your task is to build a **High-Fidelity Year-End Party Dashboard** (Weiya) using **Vue 3 (ESM)** without a build step.

**Current Phase:** UI/UX Prototype with Mock Data Simulation.
(Note: Do not implement real API fetching yet. We focus on the visual impact and animation logic first.)

# Architecture: No-Build ES Modules
Do NOT use a single file. Split the code into 3 separate files:
1.  `index.html`: Structure, Resource Links (CDNs), and Import Map.
2.  `style.css`: All styling, CSS Variables, and Animations.
3.  `app.js`: Vue 3 logic, GSAP animations, and tsParticles configuration.

# Tech Stack & Libraries (via CDN)
- **Framework:** Vue 3 (ES Module build).
- **Animation:** GSAP (GreenSock) for complex UI entrance and number counting effects.
- **Visuals:** **tsParticles** for a "Deep Sea Bubbles/Floating Dust" background effect.
- **Fonts:**
  - Headers/Numbers: 'Orbitron' (Google Fonts).
  - Text/Logs: 'Share Tech Mono' (Google Fonts).

# Visual Style: "Naval Command Center"
- **Theme:** Deep Sea / Sci-Fi Dashboard.
- **Color Palette:**
  - Background: Dark Navy (`#020c1b`).
  - Borders/Accents: Cyan (`#64ffda`).
  - Active/Pulse: Radar Green (`#0aff00`).
  - Text: Light Blue / White.
- **UI Element Style (Glassmorphism):**
  - Background: `rgba(17, 34, 64, 0.75)`
  - Border: 1px solid `rgba(100, 255, 218, 0.3)`
  - Effect: `backdrop-filter: blur(12px)`
  - Decor: Add SVG corners or brackets to panels to look like a HUD interface.

# Layout Specification (CSS Grid)
Use a 3-column grid layout with a gap of 20px. Height should be `100vh` (no scroll).
- **Left Panel (25%):** "Crew Manifest" (Access Log).
- **Center Panel (45%):** "Sonar Radar" (Main Status).
- **Right Panel (30%):** "Comm Channel" (Incoming Wishes).

# Component Details & Animation

## 1. Background (tsParticles)
- Config `tsParticles` to create slowly rising bubbles or floating dust particles.
- Opacity should be low to not distract from the data.

## 2. Center Panel: Radar System
- **Visual:** A large CSS/SVG radar circle in the center.
- **Animation:** A scanning gradient line rotating clockwise (infinite).
- **Content:**
  - A huge number displaying `totalCount`.
  - Label: "CREW ONBOARD".
- **Interaction:** When `totalCount` increases, the radar circle should pulse (glow) briefly.

## 3. Left Panel: Access Log
- **Header:** "ACCESS LOG".
- **List:** Show the latest **10** attendees.
- **Format:** `[Time] Dept - Name` (e.g., `[18:30] Captain - Luffy`).
- **Transition:** New items **slide down** from the top. Old items fade out.

## 4. Right Panel: Comm Channel (Wishes)
- **Header:** "INCOMING MESSAGES".
- **List:** Show a stack of **5** message cards.
- **Card Style:** Rectangular glass cards.
- **Transition:** New items **slide up** from the bottom. The stack pushes upwards. The top item fades out.

# Logic Requirements (app.js)

Since we are using Mock Data, implement a **Simulation Engine**:

1.  **Mock Database:** Create a `const mockDB` array with at least 30 diverse entries (Name, Dept, Message).
2.  **State Management:** Use Vue `reactive` or `ref` for:
    - `totalCount` (Start at 0 or a base number).
    - `accessLog` (Array).
    - `wishStack` (Array).
3.  **Simulation Loop:**
    - Use `setInterval` (e.g., every 3000ms).
    - Logic: Randomly pick one user from `mockDB`.
    - Action: Call a function `handleNewCheckIn(user)` which updates the state arrays and increments the count.
    - **Note:** Ensure array limits (Log max 10, Wishes max 5) are maintained to prevent DOM overflow.

# Output Requirement
Please provide the complete code for:
1.  `index.html`
2.  `style.css`
3.  `app.js`