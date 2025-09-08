// Schneefall – www.perplex.click
(function() {
  const canvas = document.getElementById('snow');
  const ctx = canvas.getContext('2d');

  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let width = 0, height = 0;

  const state = {
    flakes: [],
    targetCount: 0,
    running: true,
    lastTs: 0,
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  function resize() {
    width  = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width  = Math.floor(width  * DPR);
    canvas.height = Math.floor(height * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const area = width * height;
    const base = Math.max(80, Math.floor(area / 12000));
    state.targetCount = Math.min(400, base);
    adjustFlakeCount();
  }

  class Flake {
    constructor() { this.reset(true); }
    reset(spawnTop = false) {
      this.x = Math.random() * width;
      this.y = spawnTop ? (Math.random() * -height * 0.2) : (Math.random() * height);
      const size = Math.random() * 2.2 + 0.8; // 0.8–3.0 px
      this.r = size;
      this.speedY = size * (Math.random() * 0.6 + 0.5);
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.angle = Math.random() * Math.PI * 2;
      this.angularSpeed = (Math.random() - 0.5) * 0.02;
      this.opacity = Math.min(1, 0.6 + Math.random() * 0.4);
    }
    update(dt) {
      this.angle += this.angularSpeed * dt;
      this.x += (this.speedX + Math.sin(this.angle) * 0.2) * dt;
      this.y += this.speedY * dt;
      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      if (this.y > height + 10) this.reset(true);
    }
    draw(ctx) {
      ctx.globalAlpha = this.opacity;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function adjustFlakeCount() {
    const diff = state.targetCount - state.flakes.length;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) state.flakes.push(new Flake());
    } else if (diff < 0) {
      state.flakes.length = state.targetCount;
    }
  }

  function drawBackground() {
    const grd = ctx.createRadialGradient(width*0.1, height*0.1, 0, width*0.1, height*0.1, Math.max(width, height));
    grd.addColorStop(0, 'rgba(180,200,255,0.03)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);
  }

  function loop(ts) {
    if (!state.running) return;
    const dt = Math.min(0.033, (ts - (state.lastTs || ts)) / 1000);
    state.lastTs = ts;

    ctx.clearRect(0, 0, width, height);
    drawBackground();

    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < state.flakes.length; i++) {
      const f = state.flakes[i];
      f.update(state.reduced ? 0.6 : 1.0);
      f.draw(ctx);
    }
    requestAnimationFrame(loop);
  }

  document.addEventListener('visibilitychange', () => {
    state.running = !document.hidden;
    if (state.running) {
      state.lastTs = 0;
      requestAnimationFrame(loop);
    }
  });

  try {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', (e) => {
      state.reduced = e.matches;
    });
  } catch {}

  resize();
  window.addEventListener('resize', resize, { passive: true });
  requestAnimationFrame(loop);
})();