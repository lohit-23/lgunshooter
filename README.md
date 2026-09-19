# ⚡ CYBER PULSE // Hand Shooter Gun

A futuristic, browser-based hand gesture shooter game powered by **MediaPipe Computer Vision** and **Web Audio API**. 

Aim your index finger like a gun, cock your thumb, and **shake or flick your thumb downward or upward** to fire intense lasers, plasma bolts, fireballs, and lightning arcs with real-time particle physics, recoil shockwaves, and arcade target practice!

---

## 🚀 Host on Netlify (Fast & Free)

Deploy your website online for free on **Netlify**:

👉 **[Open Netlify Drop (Instant Drag & Drop)](https://app.netlify.com/drop)**

👉 **[Open Netlify Dashboard](https://app.netlify.com/)**

Official Netlify Website: [https://www.netlify.com](https://www.netlify.com)

---

## 🌟 Features

- 🖐️ **Zero-Hardware Hand Tracking**: Detects natural finger gun gestures with 21 3D hand landmarks via MediaPipe.
- ⚡ **Thumb Shake / Flick Firing**: Fires automatically when you shake or flick your thumb downward or upward (no finger touching needed).
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
- ☁️ **Netlify-Ready Architecture**: Configured with `netlify.toml` for instant static publishing and explicit camera permission headers.

---

## 🎮 How to Play

1. Allow camera permissions when prompted.
2. **Point Finger Gun**: Extend your index finger forward while curling your middle, ring, and pinky fingers.
3. **Aim**: Move your index finger to target holographic drones on screen.
4. **Shake Thumb to Fire**: Flick or shake your thumb downward or upward to blast projectiles! Rapid shaking enables semi-auto fire.
5. **Switch Weapons**: Press keys `1`, `2`, `3`, `4` or click the weapon deck at the bottom.

---

## 📂 Project Structure

```
shooter gun/
├── frontend/
│   ├── index.html        # Futuristic HUD, camera viewport, weapon dock, modal guides
│   ├── style.css         # Cyberpunk design system, animations, glassmorphism
│   └── app.js           # MediaPipe CV, gesture trigger engine, FX loop & audio synth
├── backend/
│   ├── package.json      # Express server dependencies
│   └── server.js         # Optional local development server
├── netlify.toml          # Netlify configuration (publish directory & security headers)
├── package.json          # Project descriptor
├── .gitignore            # Git exclusions (node_modules, logs)
└── README.md             # Guide & deployment documentation
```

---

## 🌐 How to Deploy on Netlify (Step-by-Step)

### Method 1: Instant Drag & Drop (10 Seconds, No Git Needed!)

1. Open **[Netlify Drop](https://app.netlify.com/drop)** in your browser.
2. Drag and drop the **`frontend`** folder from your project directly onto the browser page.
3. Done! Netlify immediately deploys your website on a free, live HTTPS URL (e.g., `https://cyber-pulse.netlify.app`).

---

### Method 2: Connect via GitHub (Automatic Updates)

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Configure Netlify deployment"
   git push origin main
   ```
2. Go to **[Netlify Dashboard](https://app.netlify.com/)** and click **Add new site** > **Import an existing project**.
3. Select **GitHub** and choose your `lgunshooter` repository.
4. Netlify will automatically detect `netlify.toml`:
   - **Publish directory**: `frontend`
5. Click **Deploy Site**!

---

## 💻 Running Locally

To run the application locally on your computer:

1. **Start the local server**:
   ```bash
   npm start
   ```
   *(or open `frontend/index.html` directly in your browser)*

2. **Open in your browser**:
   ```
   http://localhost:3000
   ```
