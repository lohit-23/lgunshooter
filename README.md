# ⚡ CYBER PULSE // Hand Shooter Gun

A futuristic, browser-based hand gesture shooter game powered by **MediaPipe Computer Vision** and **Web Audio API**. 

Aim your index finger like a gun, cock your thumb, and **click your thumb onto your index finger** to fire intense lasers, plasma bolts, fireballs, and lightning arcs with real-time particle physics, recoil shockwaves, and arcade target practice!

---

## 🚀 Host Directly on Render

Deploy your website online for free on **Render**:

👉 **[Open Render Dashboard (Upload / Host Files)](https://dashboard.render.com/)**

Official Render Website: [https://render.com](https://render.com)

---

## 🌟 Features

- 🖐️ **Zero-Hardware Hand Tracking**: Detects natural finger gun gestures with 21 3D hand landmarks via MediaPipe.
- 💥 **Thumb-to-Index Trigger Pull**: Fires automatically when your thumb taps/clicks against your index finger.
- 🎨 **Awesome Firing Animations**:
  - Radiant muzzle flash & expanding shockwave rings
  - High-velocity glowing projectiles with dynamic motion trails
  - Muzzle spark debris & gentle rising gun smoke
  - Screen recoil kick animation
- 🔊 **Zero-Dependency Web Audio Synth**: Synthesized sci-fi blaster sounds, mechanical cocking clicks, and bass explosions—no external sound files required!
- 🎯 **Interactive Arcade Targets**: Shoot floating holographic cyber drones to rack up points and build combo streaks.
- ⚡ **4 Weapon Modes**:
  1. **Cyber Laser**: Rapid-fire neon cyan beam.
  2. **Plasma Bolt**: Pulsating energy orb with devastating shockwave.
  3. **Inferno Blast**: Burning flame burst with blazing embers.
  4. **Volt Discharge**: High-speed electric arc discharge.
- ☁️ **Render-Ready Architecture**: Clean `frontend/` and `backend/` separation with preconfigured `render.yaml`.

---

## 🎮 How to Play

1. Allow camera permissions when prompted.
2. **Point Finger Gun**: Extend your index finger forward while curling your middle, ring, and pinky fingers.
3. **Cock Thumb**: Raise your thumb upwards (the HUD hammer meter will indicate `COCKED / READY`).
4. **Click Thumb to Fire**: Snap or tap your thumb down onto your index finger (trigger pull). An intense blast will shoot directly from your fingertip!
5. **Switch Weapons**: Press keys `1`, `2`, `3`, `4` or click the weapon deck at the bottom.

---

## 📂 Project Structure

```
shooter gun/
├── backend/
│   ├── package.json      # Express dependencies & scripts
│   └── server.js         # Production server with static file hosting & health API
├── frontend/
│   ├── index.html        # Futuristic HUD, camera viewport, weapon dock, modal guides
│   ├── style.css         # Cyberpunk design system, animations, glassmorphism
│   └── app.js           # MediaPipe CV, gesture trigger engine, FX loop & audio synth
├── render.yaml           # Render Blueprint for 1-click automated deployment
├── package.json          # Root package descriptor for Render build process
├── .gitignore            # Git exclusions (node_modules, logs)
└── README.md             # Guide & direct Render link
```

---

## 🌐 How to Host on Render (Step-by-Step)

### Method 1: Connect via GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Hand Shooter Gun"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```
2. Go to **[Render Dashboard](https://dashboard.render.com/)**.
3. Click **New +** in the top right and select **Web Service** (or **Blueprint** to use `render.yaml` automatically).
4. Select your GitHub repository.
5. Configure the service:
   - **Name**: `hand-shooter-gun`
   - **Environment**: `Node`
   - **Build Command**: `npm --prefix backend install`
   - **Start Command**: `node backend/server.js`
   - **Plan**: `Free`
6. Click **Deploy Web Service**!
7. Your game will be live on a free `.onrender.com` URL in 1–2 minutes!

---

## 💻 Running Locally

To run the application locally on your computer:

1. **Install dependencies**:
   ```bash
   npm --prefix backend install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```
   *(or `cd backend && npm start`)*

3. **Open in your browser**:
   ```
   http://localhost:3000
   ```

---

## 🩺 API Endpoints

- `GET /api/health` - Server health check & uptime monitor for Render.
- `GET /api/scores` - Top scores list.
- `POST /api/scores` - Record a new score.
