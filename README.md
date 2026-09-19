<div align="center">

# ⚡ CYBER PULSE // HAND SHOOTER GUN

### Next-Gen Hand Gesture CV Blaster & Particle FX Synthesizer

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Netlify-00AD9F?style=for-the-badge&logo=netlify&logoColor=white)](https://lshootergun.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![MediaPipe](https://img.shields.io/badge/Vision-MediaPipe%20Hands-007FFF?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![Web Audio](https://img.shields.io/badge/Audio-Web%20Audio%20API-FF6B6B?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Status: Active](https://img.shields.io/badge/Status-Production%20Ready-00f0ff?style=for-the-badge)](#)

<p align="center">
  <b>Point your finger gun at the screen and shake your thumb downward or upward to fire!</b><br />
  Zero extra hardware required — runs 100% in your browser using computer vision and Web Audio synthesis.
</p>

[🎮 Play Live Game](https://lshootergun.netlify.app/) • [🕹️ Controls](#️-controls--gesture-guide) • [✨ Features](#-key-features) • [🛠️ Architecture](#️-technical-architecture) • [🚀 Local Setup](#-getting-started)

---

</div>

## 🌌 Overview

**CYBER PULSE** transforms your standard computer webcam into an augmented reality arcade blaster. Powered by **MediaPipe Hands** computer vision and a custom HTML5 canvas particle synthesizer, the engine tracks your hand's 21 3D skeletal landmarks in real-time at 60 FPS.

By pointing your index finger and **flicking or shaking your thumb downward or upward**, you trigger instantaneous laser, plasma, inferno, or volt discharges with dynamic muzzle blast shockwaves, glowing projectile flight physics, spark ejectors, smoke trails, and physical screen recoil.

---

## 🎮 Play Live Demo

The game is deployed live on Netlify with global edge caching and HTTPS camera security:

👉 **[https://lshootergun.netlify.app](https://lshootergun.netlify.app/)**

---

## 🕹️ Controls & Gesture Guide

| Action | Input / Gesture | Description |
| :--- | :--- | :--- |
| **Aim Blaster** | 👉 Extend Index Finger | Tracks your fingertip and projects an aiming laser sight & reticle |
| **Fire Projectile** | ⚡ Shake Thumb Down / Up | Rapid downward or upward thumb flick triggers instant weapon discharge |
| **Rapid Semi-Auto** | 🔄 Shake Thumb Rapidly | Oscillating thumb motion fires continuous burst shots |
| **Cyber Laser** | Press `1` or click dock | High-velocity neon cyan energy beam with laser sight |
| **Plasma Bolt** | Press `2` or click dock | Heavy pulsating plasma orb with explosive shockwave |
| **Inferno Blast** | Press `3` or click dock | Incendiary flame burst with blazing embers |
| **Volt Discharge** | Press `4` or click dock | High-voltage electric arc stream |
| **Toggle Audio** | Press `M` or click 🔊 | Mute or unmute synthesized sound FX |
| **Toggle Fullscreen**| Press `F` or click ⛶ | Enter full-screen arcade battle mode |
| **Toggle Targets** | Click `TARGETS: ON/OFF` | Enable or disable flying holographic practice drones |

---

## ✨ Key Features

- 🖐️ **Sub-Millisecond Hand Tracking**: Leverages MediaPipe Hands 21-landmark skeletal model running client-side with minimal latency.
- ⚡ **Scale-Invariant Thumb Shake Firing**: Proprietary gesture recognition normalizes thumb coordinates against hand scale and palm anchor vectors—moving your entire hand to aim across the screen will never cause accidental misfires.
- 💥 **Real-Time FX Physics Engine**:
  - Multi-stage expanding shockwave rings
  - Glowing projectile motion trails
  - Directional muzzle blast spark ejectors
  - Ambient rising smoke wisps
  - Kinetic screen recoil kick animation
- 🔊 **100% Zero-Asset Synthesizer**: Uses the native Web Audio API with oscillators, exponential frequency sweeps, noise buffers, and biquad filters to generate sci-fi sound effects directly from code—no audio downloads required.
- 🎯 **Interactive Holographic Target Range**: Floating cyber drones that explode upon impact, boosting score and combo streak multipliers.
- 📱 **Responsive Cyberpunk HUD**: Glassmorphic UI with animated trigger state meters, score trackers, and weapon decks built with Vanilla CSS.

---

## 🛠️ Technical Architecture

### 1. Hand Tracking & Scale Normalization
To prevent false fires while aiming, the engine computes thumb coordinates normalized relative to the hand's palm anchor:

```javascript
// Hand reference anchor (midpoint between wrist and index knuckle)
const refAnchorX = (wrist.x + indexMCP.x) * 0.5;
const refAnchorY = (wrist.y + indexMCP.y) * 0.5;

// Scale-invariant position relative to hand size
const relThumbY = (thumbTip.y - refAnchorY) / handScale;
const relThumbX = (thumbTip.x - refAnchorX) / handScale;
```

### 2. Dynamic Trigger State Machine
- Maintains a 240ms high-frequency rolling motion buffer.
- Evaluates vertical velocity ($v_y$), displacement ($\Delta y$), and transverse displacement along the hand's hammer normal axis.
- Discharges upon detecting a downward flick ($v_y > v_{\text{threshold}}$), upward flick ($v_y < -v_{\text{threshold}}$), or rapid shake oscillation.
- Auto-cocks with a mechanical sound once motion settles (~160ms debounce).

---

## 📂 Project Structure

```
shooter-gun/
├── frontend/
│   ├── index.html        # Viewport, Cyberpunk HUD, modals, and canvas layers
│   ├── style.css         # Neon styling, CRT scanlines, glassmorphism, animations
│   └── app.js           # MediaPipe CV pipeline, gesture engine, FX physics & synth
├── backend/
│   ├── package.json      # Express server dependencies
│   └── server.js         # Production Node.js server (local testing & health monitor)
├── netlify.toml          # Netlify configuration (static publish & camera permissions)
├── package.json          # Root package descriptor
├── .gitignore            # Git exclusions (node_modules, logs)
└── README.md             # Project documentation & guides
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- A modern web browser with webcam access (Chrome, Edge, Firefox, Brave)

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lohit-23/lgunshooter.git
   cd lgunshooter
   ```

2. **Install dependencies**:
   ```bash
   npm --prefix backend install
   ```

3. **Start the local server**:
   ```bash
   npm start
   ```

4. **Open in browser**:
   Visit `http://localhost:3000` and allow camera access.

---

## ☁️ Deployment

### Netlify (Configured)
The repository includes [`netlify.toml`](netlify.toml) configured for static deployment:
- **Publish directory**: `frontend`
- **Permissions-Policy**: `camera=(self)` for webcam security

Live Production URL: **[https://lshootergun.netlify.app](https://lshootergun.netlify.app/)**

---

## 🔒 Privacy & Security

- **100% Client-Side Processing**: Webcam frames are analyzed locally in your browser memory via WebAssembly / WebGL.
- **Zero Data Transmission**: No video feeds, images, or biometric landmark data are ever sent to any remote server or stored.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ⚡ by <a href="https://github.com/lohit-23">lohit-23</a>. Powered by MediaPipe & Web Audio.</sub>
</div>
