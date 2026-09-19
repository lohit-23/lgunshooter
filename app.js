/**
 * CYBER PULSE // Hand Shooter Gun
 * MediaPipe Hands CV Engine & Particle FX Synthesizer
 */

(function () {
  'use strict';

  // --- Canvas & Video Setup ---
  const video = document.getElementById('webcam');
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const gameContainer = document.getElementById('game-container');

  // --- HUD Elements ---
  const hudStatusText = document.getElementById('hud-status-text');
  const triggerMeterBar = document.getElementById('trigger-meter-bar');
  const triggerStateLabel = document.getElementById('trigger-state-label');
  const hudScoreEl = document.getElementById('hud-score');
  const hudComboEl = document.getElementById('hud-combo');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnStartCamera = document.getElementById('btn-start-camera');
  const cameraOverlay = document.getElementById('camera-overlay');
  const helpModal = document.getElementById('help-modal');
  const btnHelpModal = document.getElementById('btn-help-modal');
  const btnCloseHelp = document.getElementById('btn-close-help');
  const btnGotIt = document.getElementById('btn-got-it');
  const btnToggleTargets = document.getElementById('btn-toggle-targets');
  const impactAnnouncer = document.getElementById('impact-announcer');
  const sliderSensitivity = document.getElementById('slider-sensitivity');
  const sensitivityValue = document.getElementById('sensitivity-value');
  const weaponCards = document.querySelectorAll('.weapon-card');

  // --- Game & Weapon Configuration ---
  const WEAPONS = {
    laser: {
      name: 'CYBER LASER',
      color: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.8)',
      speed: 46,
      size: 5,
      trailLength: 8,
      blastSparks: 22,
      spread: 0.05
    },
    plasma: {
      name: 'PLASMA BOLT',
      color: '#ff007f',
      glow: 'rgba(255, 0, 127, 0.9)',
      speed: 34,
      size: 14,
      trailLength: 6,
      blastSparks: 30,
      spread: 0.08
    },
    inferno: {
      name: 'INFERNO BLAST',
      color: '#ff5500',
      glow: 'rgba(255, 100, 0, 0.85)',
      speed: 30,
      size: 10,
      trailLength: 10,
      blastSparks: 35,
      spread: 0.12
    },
    volt: {
      name: 'VOLT DISCHARGE',
      color: '#00e5ff',
      glow: 'rgba(120, 0, 255, 0.85)',
      speed: 52,
      size: 6,
      trailLength: 12,
      blastSparks: 28,
      spread: 0.06
    }
  };

  let currentWeapon = 'laser';
  let soundEnabled = true;
  let targetsEnabled = true;
  let sensitivityLevel = 2; // 1: tight, 2: balanced, 3: sensitive
  let score = 0;
  let combo = 1;
  let comboTimer = null;

  // --- Gesture & Trigger State Machine ---
  let triggerState = 'COCKED'; // 'COCKED' or 'FIRED'
  let lastFireTime = 0;
  let handDetected = false;
  let handPoseActive = false;
  let lastIndexTip = null;
  let lastIndexPIP = null;
  let lastLandmarks = null;
  const thumbHistory = []; // Rolling buffer for thumb shake & flick detection

  // Thumb shake sensitivity thresholds
  // disp: required displacement, vel: required velocity, shake: oscillation amplitude
  const THRESHOLDS = {
    1: { disp: 0.22, vel: 2.5, shake: 0.24 }, // Tight
    2: { disp: 0.15, vel: 1.8, shake: 0.16 }, // Balanced
    3: { disp: 0.10, vel: 1.2, shake: 0.11 }  // Sensitive
  };

  // --- FX Engine Entities ---
  const projectiles = [];
  const particles = [];
  const shockwaves = [];
  const targets = [];
  const smokeParticles = [];

  // --- Web Audio Synthesizer ---
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSound(type) {
    if (!soundEnabled || !audioCtx) return;

    try {
      const now = audioCtx.currentTime;

      if (type === 'laser') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.14);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'plasma') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.22);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
      } else if (type === 'inferno') {
        // Fireblast noise simulation
        const bufferSize = audioCtx.sampleRate * 0.2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, now);
        filter.frequency.exponentialRampToValueAtTime(220, now + 0.2);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        noise.start(now);
        noise.stop(now + 0.2);
      } else if (type === 'volt') {
        // Electric arc zap
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.16);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.17);
      } else if (type === 'cock') {
        // Subtle mechanical hammer click
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.04);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      } else if (type === 'explode') {
        // Target explosion
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      }
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  }

  // --- Resize Canvas to Match Window ---
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // --- Spawning Floating Targets ---
  class CyberTarget {
    constructor(x, y) {
      this.x = x || Math.random() * (canvas.width * 0.7) + canvas.width * 0.15;
      this.y = y || Math.random() * (canvas.height * 0.45) + canvas.height * 0.15;
      this.baseY = this.y;
      this.radius = 32;
      this.vx = (Math.random() - 0.5) * 1.8;
      this.angle = 0;
      this.bobOffset = Math.random() * Math.PI * 2;
      this.health = 1;
      this.color = Math.random() > 0.5 ? '#00f0ff' : '#ff007f';
      this.scale = 0;
      this.targetScale = 1;
    }

    update() {
      if (this.scale < this.targetScale) {
        this.scale += 0.08;
      }
      this.x += this.vx;
      if (this.x < this.radius * 2 || this.x > canvas.width - this.radius * 2) {
        this.vx *= -1;
      }
      this.bobOffset += 0.035;
      this.y = this.baseY + Math.sin(this.bobOffset) * 18;
      this.angle += 0.02;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scale, this.scale);

      // Outer rotating ring
      ctx.save();
      ctx.rotate(this.angle);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 1.6);
      ctx.stroke();

      // Crosshair notches
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(this.radius - 4, 0);
        ctx.lineTo(this.radius + 6, 0);
        ctx.stroke();
      }
      ctx.restore();

      // Inner pulsating core
      const pulse = 1 + Math.sin(this.bobOffset * 2) * 0.2;
      ctx.fillStyle = this.color === '#00f0ff' ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 0, 127, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, (this.radius * 0.45) * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function ensureTargets() {
    if (!targetsEnabled) return;
    while (targets.length < 3) {
      targets.push(new CyberTarget());
    }
  }

  // --- Particle Systems ---
  class Projectile {
    constructor(origin, dir, weaponKey) {
      this.weapon = WEAPONS[weaponKey];
      this.x = origin.x;
      this.y = origin.y;
      this.dirX = dir.x;
      this.dirY = dir.y;
      this.speed = this.weapon.speed;
      this.history = [];
      this.alive = true;
      this.life = 0;
      this.maxLife = 65;
    }

    update() {
      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > this.weapon.trailLength) {
        this.history.shift();
      }

      this.x += this.dirX * this.speed;
      this.y += this.dirY * this.speed;
      this.life++;

      // Check collision with targets
      if (targetsEnabled) {
        for (let i = targets.length - 1; i >= 0; i--) {
          const t = targets[i];
          const dist = Math.hypot(this.x - t.x, this.y - t.y);
          if (dist < t.radius + this.weapon.size) {
            this.explodeTarget(t, i);
            this.alive = false;
            break;
          }
        }
      }

      // Check screen bounds
      if (
        this.x < -50 ||
        this.x > canvas.width + 50 ||
        this.y < -50 ||
        this.y > canvas.height + 50 ||
        this.life > this.maxLife
      ) {
        this.alive = false;
      }
    }

    explodeTarget(t, index) {
      playSound('explode');
      targets.splice(index, 1);

      // Spawn target explosion shards
      for (let i = 0; i < 35; i++) {
        particles.push(new SparkParticle(t.x, t.y, t.color, true));
      }
      shockwaves.push(new Shockwave(t.x, t.y, t.color, 90));

      // Calculate score
      const addedScore = 100 * combo;
      score += addedScore;
      hudScoreEl.textContent = String(score).padStart(4, '0');

      // Update combo
      combo++;
      hudComboEl.textContent = `x${combo}`;
      if (comboTimer) clearTimeout(comboTimer);
      comboTimer = setTimeout(() => {
        combo = 1;
        hudComboEl.textContent = 'x1';
      }, 3500);

      // Announce floating score
      showFloatingScore(t.x, t.y, `+${addedScore}!`);
      ensureTargets();
    }

    draw(ctx) {
      ctx.save();

      // Draw glowing trail
      if (this.history.length > 1) {
        ctx.beginPath();
        ctx.moveTo(this.history[0].x, this.history[0].y);
        for (let i = 1; i < this.history.length; i++) {
          ctx.lineTo(this.history[i].x, this.history[i].y);
        }
        ctx.strokeStyle = this.weapon.glow;
        ctx.lineWidth = this.weapon.size;
        ctx.lineCap = 'round';
        ctx.shadowColor = this.weapon.color;
        ctx.shadowBlur = 18;
        ctx.stroke();
      }

      // Draw head
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = this.weapon.color;
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.weapon.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  class SparkParticle {
    constructor(x, y, color, isExplosion = false, baseDir = null) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = Math.random() * 3 + 1.5;
      this.alpha = 1;
      this.decay = Math.random() * 0.03 + 0.02;

      let angle = Math.random() * Math.PI * 2;
      let speed = Math.random() * 7 + 2;

      if (!isExplosion && baseDir) {
        const spread = (Math.random() - 0.5) * 0.7;
        const mainAngle = Math.atan2(baseDir.y, baseDir.x);
        angle = mainAngle + spread;
        speed = Math.random() * 12 + 4;
      }

      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.95;
      this.vy *= 0.95;
      this.alpha -= this.decay;
    }

    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class Shockwave {
    constructor(x, y, color, maxRadius = 70) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = 10;
      this.maxRadius = maxRadius;
      this.alpha = 1;
    }

    update() {
      this.radius += (this.maxRadius - this.radius) * 0.22 + 2;
      this.alpha -= 0.055;
    }

    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  class SmokeWisp {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = Math.random() * 6 + 4;
      this.alpha = 0.5;
      this.vy = -(Math.random() * 1.5 + 0.8);
      this.vx = (Math.random() - 0.5) * 0.8;
      this.growth = 0.4;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.radius += this.growth;
      this.alpha -= 0.018;
    }

    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = 'rgba(210, 225, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function showFloatingScore(x, y, text) {
    const el = document.createElement('div');
    el.className = 'floating-score';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.textContent = text;
    impactAnnouncer.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, 900);
  }

  // --- Firing Action ---
  function triggerFire(tipPos, pipPos) {
    const now = performance.now();
    if (now - lastFireTime < 140) return; // Cooldown debounce
    lastFireTime = now;

    // Trigger visual screen recoil
    gameContainer.classList.remove('recoil-active');
    void gameContainer.offsetWidth; // Trigger reflow
    gameContainer.classList.add('recoil-active');

    // Direction vector of the index finger
    let dx = tipPos.x - pipPos.x;
    let dy = tipPos.y - pipPos.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;

    const origin = { x: tipPos.x, y: tipPos.y };
    const dir = { x: dx, y: dy };
    const weaponConfig = WEAPONS[currentWeapon];

    // Spawn Projectile
    projectiles.push(new Projectile(origin, dir, currentWeapon));

    // Spawn Muzzle Blast Sparks
    for (let i = 0; i < weaponConfig.blastSparks; i++) {
      particles.push(new SparkParticle(origin.x, origin.y, weaponConfig.color, false, dir));
    }

    // Spawn Shockwave
    shockwaves.push(new Shockwave(origin.x, origin.y, weaponConfig.color, 75));

    // Spawn Smoke Wisps
    for (let i = 0; i < 4; i++) {
      smokeParticles.push(new SmokeWisp(origin.x, origin.y));
    }

    // Play synthesized sound
    playSound(currentWeapon);

    // Update Trigger UI
    triggerStateLabel.textContent = 'FIRED!';
    triggerStateLabel.classList.add('fired');
  }

  // --- Aiming Reticle & Laser Sight Rendering ---
  function drawAimingSight(ctx, tip, pip) {
    const dx = tip.x - pip.x;
    const dy = tip.y - pip.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len;
    const ny = dy / len;

    const weapon = WEAPONS[currentWeapon];

    // Laser Sight Beam
    ctx.save();
    ctx.strokeStyle = weapon.glow;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.shadowColor = weapon.color;
    ctx.shadowBlur = 10;

    const targetX = tip.x + nx * 900;
    const targetY = tip.y + ny * 900;

    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    // Fingertip Muzzle Reticle
    ctx.setLineDash([]);
    ctx.strokeStyle = weapon.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = weapon.color;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- Hand Gesture Recognition Pipeline ---
  function onResults(results) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render Mirrored Webcam Stream
    if (results.image) {
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      handDetected = true;
      const rawLandmarks = results.multiHandLandmarks[0];

      // Mirror landmarks horizontally to match canvas mirror
      const landmarks = rawLandmarks.map((lm) => ({
        x: (1 - lm.x) * canvas.width,
        y: lm.y * canvas.height,
        z: lm.z
      }));

      // Landmarks of interest
      const wrist = landmarks[0];
      const thumbTip = landmarks[4];
      const indexMCP = landmarks[5];
      const indexPIP = landmarks[6];
      const indexDIP = landmarks[7];
      const indexTip = landmarks[8];
      const middlePIP = landmarks[10];
      const middleTip = landmarks[12];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];

      // Hand scale reference (wrist to index MCP distance)
      const handScale = Math.hypot(wrist.x - indexMCP.x, wrist.y - indexMCP.y) || 100;

      // 1. Check if Index Finger is extended (not folded in palm)
      const distMCPToTip = Math.hypot(indexTip.x - indexMCP.x, indexTip.y - indexMCP.y);
      const distMCPToPIP = Math.hypot(indexPIP.x - indexMCP.x, indexPIP.y - indexMCP.y);
      const distWristToIndexTip = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
      const isIndexExtended = distMCPToTip > distMCPToPIP * 1.05 || distWristToIndexTip > handScale * 1.1;

      handPoseActive = isIndexExtended;

      if (handPoseActive) {
        lastIndexTip = indexTip;
        lastIndexPIP = indexPIP;

        // Draw futuristic hand skeleton overlay
        drawCyberSkeleton(ctx, landmarks, handPoseActive);

        // Draw aiming beam & reticle
        drawAimingSight(ctx, indexTip, indexPIP);

        // --- Scale-Invariant Thumb Shake & Flick Detection ---
        // Hand reference anchor (midpoint between wrist and index knuckle)
        const refAnchorX = (wrist.x + indexMCP.x) * 0.5;
        const refAnchorY = (wrist.y + indexMCP.y) * 0.5;

        // Normalized relative thumb position (subtracts out whole-hand aiming movement)
        const relThumbY = (thumbTip.y - refAnchorY) / handScale;
        const relThumbX = (thumbTip.x - refAnchorX) / handScale;

        // Hand transverse axis (perpendicular to aiming direction)
        const aimDx = indexTip.x - indexMCP.x;
        const aimDy = indexTip.y - indexMCP.y;
        const aimLen = Math.hypot(aimDx, aimDy) || 1;
        const perpX = -aimDy / aimLen;
        const perpY = aimDx / aimLen;
        const relThumbPerp = ((thumbTip.x - indexMCP.x) * perpX + (thumbTip.y - indexMCP.y) * perpY) / handScale;

        const now = performance.now();

        // Maintain rolling history of thumb motion within the last 240ms
        thumbHistory.push({
          t: now,
          y: relThumbY,
          perp: relThumbPerp
        });
        while (thumbHistory.length > 0 && now - thumbHistory[0].t > 240) {
          thumbHistory.shift();
        }

        // Analyze thumb dynamics across recent window (35ms - 160ms ago)
        let maxDownDisp = 0;
        let maxUpDisp = 0;
        let maxDownVel = 0;
        let maxUpVel = 0;
        let maxPerpDisp = 0;
        let maxPerpVel = 0;
        let minY = relThumbY;
        let maxY = relThumbY;

        for (let i = 0; i < thumbHistory.length - 1; i++) {
          const h = thumbHistory[i];
          const dt = (now - h.t) / 1000;
          if (h.y < minY) minY = h.y;
          if (h.y > maxY) maxY = h.y;

          if (dt >= 0.035 && dt <= 0.16) {
            const dy = relThumbY - h.y; // Positive = moved down, Negative = moved up
            const vy = dy / dt;
            const dPerp = Math.abs(relThumbPerp - h.perp);
            const vPerp = dPerp / dt;

            if (dy > maxDownDisp) maxDownDisp = dy;
            if (-dy > maxUpDisp) maxUpDisp = -dy;
            if (vy > maxDownVel) maxDownVel = vy;
            if (-vy > maxUpVel) maxUpVel = -vy;
            if (dPerp > maxPerpDisp) maxPerpDisp = dPerp;
            if (vPerp > maxPerpVel) maxPerpVel = vPerp;
          }
        }

        const yRange = maxY - minY;
        const currentThresholds = THRESHOLDS[sensitivityLevel];

        // Detection conditions:
        // 1. Downward flick: thumb rapidly shakes / moves down
        const isDownFlick = (maxDownDisp >= currentThresholds.disp && maxDownVel >= currentThresholds.vel);
        // 2. Upward flick: thumb rapidly shakes / moves up
        const isUpFlick = (maxUpDisp >= currentThresholds.disp && maxUpVel >= currentThresholds.vel);
        // 3. Hand-relative flick along hammer axis
        const isPerpFlick = (maxPerpDisp >= currentThresholds.disp * 1.15 && maxPerpVel >= currentThresholds.vel * 1.15);
        // 4. Rapid shake oscillation (fast back-and-forth movement)
        const isShake = (yRange >= currentThresholds.shake && (maxDownVel >= currentThresholds.vel * 0.75 || maxUpVel >= currentThresholds.vel * 0.75));

        const shakeDetected = isDownFlick || isUpFlick || isPerpFlick || isShake;

        // Visual HUD Thumb Shake Activity Meter
        const currentSpeed = Math.max(maxDownVel, maxUpVel, maxPerpVel, (yRange / currentThresholds.shake) * currentThresholds.vel);
        const activityRatio = Math.min(1.0, currentSpeed / currentThresholds.vel);
        const meterPercent = Math.min(100, Math.max(5, Math.round(activityRatio * 100)));
        triggerMeterBar.style.width = `${meterPercent}%`;

        // Responsive State Machine - Fires IMMEDIATELY on thumb shake/flick (downward or upward)
        if (triggerState === 'COCKED') {
          if (shakeDetected && (now - lastFireTime > 160)) {
            triggerState = 'FIRED';
            triggerFire(indexTip, indexPIP);
            thumbHistory.length = 0; // Clear history to prevent duplicate trigger from same stroke
          }
        } else if (triggerState === 'FIRED') {
          const timeSinceFire = now - lastFireTime;
          const isSettled = currentSpeed < currentThresholds.vel * 0.4;
          if ((timeSinceFire > 160 && isSettled) || timeSinceFire > 260) {
            triggerState = 'COCKED';
            playSound('cock');
            triggerStateLabel.textContent = 'READY';
            triggerStateLabel.classList.remove('fired');
          }
        }

        hudStatusText.textContent = 'TARGET LOCKED // READY';
      } else {
        hudStatusText.textContent = 'POINT FINGER GUN';
        thumbHistory.length = 0;
      }
    } else {
      handDetected = false;
      hudStatusText.textContent = 'SEARCHING FOR HAND...';
      triggerMeterBar.style.width = '0%';
      thumbHistory.length = 0;
      if (triggerState === 'FIRED') {
        triggerState = 'COCKED';
        triggerStateLabel.textContent = 'READY';
        triggerStateLabel.classList.remove('fired');
      }
    }

    // --- Update and Draw Entities ---
    updateAndDrawFX(ctx);
  }

  // --- Cybernetic Hand Skeleton Wireframe ---
  function drawCyberSkeleton(ctx, lm, isArmed) {
    ctx.save();
    ctx.strokeStyle = isArmed ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],     // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],     // Index
      [5, 9], [9, 10], [10, 11], [11, 12], // Middle
      [9, 13], [13, 14], [14, 15], [15, 16], // Ring
      [13, 17], [17, 18], [18, 19], [19, 20], [0, 17] // Pinky & Palm
    ];

    ctx.beginPath();
    connections.forEach(([i, j]) => {
      ctx.moveTo(lm[i].x, lm[i].y);
      ctx.lineTo(lm[j].x, lm[j].y);
    });
    ctx.stroke();

    // Glowing joints
    ctx.fillStyle = isArmed ? '#00f0ff' : '#ffffff';
    lm.forEach((pt, idx) => {
      if (idx === 4 || idx === 8) {
        ctx.fillStyle = idx === 8 ? WEAPONS[currentWeapon].color : '#ffaa00';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  }

  // --- FX Physics & Drawing Loop ---
  function updateAndDrawFX(ctx) {
    // 1. Targets
    ensureTargets();
    if (targetsEnabled) {
      targets.forEach((t) => {
        t.update();
        t.draw(ctx);
      });
    }

    // 2. Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.update();
      p.draw(ctx);
      if (!p.alive) {
        projectiles.splice(i, 1);
      }
    }

    // 3. Shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.update();
      sw.draw(ctx);
      if (sw.alpha <= 0) {
        shockwaves.splice(i, 1);
      }
    }

    // 4. Spark Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const sp = particles[i];
      sp.update();
      sp.draw(ctx);
      if (sp.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    // 5. Smoke Wisps
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
      const sm = smokeParticles[i];
      sm.update();
      sm.draw(ctx);
      if (sm.alpha <= 0) {
        smokeParticles.splice(i, 1);
      }
    }
  }

  // --- MediaPipe Hands Initialization ---
  let camera = null;
  let hands = null;

  async function startTracking() {
    try {
      hudStatusText.textContent = 'STARTING CAMERA...';

      hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      // Use modelComplexity 0 (Lite model) for instant, low-latency 60fps hand tracking
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.55,
        minTrackingConfidence: 0.55
      });

      hands.onResults(onResults);

      let isProcessing = false;
      camera = new Camera(video, {
        onFrame: async () => {
          if (isProcessing) return; // Drop frame backlog to eliminate queue delay
          isProcessing = true;
          try {
            await hands.send({ image: video });
          } catch (e) {
            console.error('Frame processing error:', e);
          } finally {
            isProcessing = false;
          }
        },
        width: 960,
        height: 540
      });

      await camera.start();
      cameraOverlay.classList.remove('visible');
      hudStatusText.textContent = 'CAMERA CONNECTED';
    } catch (err) {
      console.error('Camera initialization failed:', err);
      hudStatusText.textContent = 'CAMERA ERROR: ' + (err.message || 'Permission denied');
      alert('Camera permission is required to track your hand gesture. Please allow camera access and refresh!');
    }
  }

  // --- Event Listeners & UI Controls ---

  // Start Camera on user click
  btnStartCamera.addEventListener('click', () => {
    initAudio();
    startTracking();
  });

  // Sound Toggle
  btnSoundToggle.addEventListener('click', () => {
    initAudio();
    soundEnabled = !soundEnabled;
    soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    btnSoundToggle.style.borderColor = soundEnabled ? 'var(--neon-cyan)' : 'var(--text-muted)';
  });

  // Fullscreen Toggle
  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Weapon Switcher
  function selectWeapon(weaponKey) {
    if (!WEAPONS[weaponKey]) return;
    currentWeapon = weaponKey;
    weaponCards.forEach((card) => {
      card.classList.toggle('active', card.dataset.weapon === weaponKey);
    });
    playSound('cock');
  }

  weaponCards.forEach((card) => {
    card.addEventListener('click', () => {
      initAudio();
      selectWeapon(card.dataset.weapon);
    });
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    initAudio();
    if (e.key === '1') selectWeapon('laser');
    if (e.key === '2') selectWeapon('plasma');
    if (e.key === '3') selectWeapon('inferno');
    if (e.key === '4') selectWeapon('volt');
    if (e.key === 'm' || e.key === 'M') btnSoundToggle.click();
    if (e.key === 'f' || e.key === 'F') btnFullscreen.click();
  });

  // Toggle Target Practice
  btnToggleTargets.addEventListener('click', () => {
    targetsEnabled = !targetsEnabled;
    btnToggleTargets.classList.toggle('toggle-active', targetsEnabled);
    btnToggleTargets.innerHTML = `<span class="btn-dot"></span> TARGETS: ${targetsEnabled ? 'ON' : 'OFF'}`;
    if (!targetsEnabled) {
      targets.length = 0;
    }
  });

  // Sensitivity Slider
  sliderSensitivity.addEventListener('input', (e) => {
    sensitivityLevel = parseInt(e.target.value, 10);
    const labels = { 1: 'Tight', 2: 'Balanced', 3: 'Sensitive' };
    sensitivityValue.textContent = labels[sensitivityLevel];
  });

  // Help Modal
  btnHelpModal.addEventListener('click', () => {
    helpModal.classList.add('visible');
  });

  btnCloseHelp.addEventListener('click', () => {
    helpModal.classList.remove('visible');
  });

  btnGotIt.addEventListener('click', () => {
    helpModal.classList.remove('visible');
  });

  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.classList.remove('visible');
    }
  });
})();
