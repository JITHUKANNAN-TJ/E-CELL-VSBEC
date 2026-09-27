/* ProfileCard vanilla port — adapted from React Bits (JS + CSS variant) for static site */
(function () {
  'use strict';

  const DEFAULT_INNER_GRADIENT = 'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)';
  // E-Cell VSBEC orange theme fallback
  const ECELL_GRADIENT = 'linear-gradient(145deg,#2563EB8c 0%,#111111 100%)';

  const ANIMATION_CONFIG = {
    INITIAL_DURATION: 1200,
    INITIAL_X_OFFSET: 70,
    INITIAL_Y_OFFSET: 60,
    DEVICE_BETA_OFFSET: 20,
    ENTER_TRANSITION_MS: 180
  };

  const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
  const round = (v, precision = 3) => parseFloat(v.toFixed(precision));
  const adjust = (v, fMin, fMax, tMin, tMax) => round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

  function createTiltEngine(wrap, shell, opts) {
    const enableTilt = opts.enableTilt !== false;
    if (!enableTilt) return null;

    let rafId = null;
    let running = false;
    let lastTs = 0;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const DEFAULT_TAU = 0.14;
    const INITIAL_TAU = 0.6;
    let initialUntil = 0;

    function setVarsFromXY(x, y) {
      if (!shell || !wrap) return;
      const width = shell.clientWidth || 1;
      const height = shell.clientHeight || 1;
      const percentX = clamp((100 / width) * x);
      const percentY = clamp((100 / height) * y);
      const centerX = percentX - 50;
      const centerY = percentY - 50;
      const properties = {
        '--pointer-x': percentX + '%',
        '--pointer-y': percentY + '%',
        '--background-x': adjust(percentX, 0, 100, 35, 65) + '%',
        '--background-y': adjust(percentY, 0, 100, 35, 65) + '%',
        '--pointer-from-center': clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1),
        '--pointer-from-top': percentY / 100,
        '--pointer-from-left': percentX / 100,
        '--rotate-x': round(-(centerX / 5)) + 'deg',
        '--rotate-y': round(centerY / 4) + 'deg'
      };
      for (const k in properties) wrap.style.setProperty(k, properties[k]);
    }

    function step(ts) {
      if (!running) return;
      if (lastTs === 0) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
      const k = 1 - Math.exp(-dt / tau);
      currentX += (targetX - currentX) * k;
      currentY += (targetY - currentY) * k;
      setVarsFromXY(currentX, currentY);
      const stillFar = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;
      if (stillFar) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
        lastTs = 0;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      }
    }

    function start() {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    }

    return {
      setImmediate: function (x, y) { currentX = x; currentY = y; setVarsFromXY(currentX, currentY); },
      setTarget: function (x, y) { targetX = x; targetY = y; start(); },
      toCenter: function () { if (!shell) return; this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2); },
      beginInitial: function (durationMs) { initialUntil = performance.now() + durationMs; start(); },
      getCurrent: function () { return { x: currentX, y: currentY, tx: targetX, ty: targetY }; },
      cancel: function () { if (rafId) cancelAnimationFrame(rafId); rafId = null; running = false; lastTs = 0; }
    };
  }

  function getOffsets(evt, el) {
    const rect = el.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  }

  function initCard(wrapper) {
    const shell = wrapper.querySelector('.pc-card-shell');
    if (!shell) return;

    const enableTilt = wrapper.dataset.enableTilt !== 'false';
    const enableMobileTilt = wrapper.dataset.enableMobileTilt === 'true';
    const mobileTiltSensitivity = parseFloat(wrapper.dataset.mobileTiltSensitivity || '5');

    // apply cardStyle vars if provided via dataset
    // allow inline style already set; supplement defaults
    if (!wrapper.style.getPropertyValue('--inner-gradient')) {
      const g = wrapper.dataset.innerGradient || ECELL_GRADIENT;
      wrapper.style.setProperty('--inner-gradient', g);
    }
    if (!wrapper.style.getPropertyValue('--behind-glow-color')) {
      wrapper.style.setProperty('--behind-glow-color', wrapper.dataset.behindGlowColor || 'rgba(37, 99, 235, 0.55)');
    }
    if (!wrapper.style.getPropertyValue('--behind-glow-size')) {
      wrapper.style.setProperty('--behind-glow-size', wrapper.dataset.behindGlowSize || '50%');
    }
    if (!wrapper.style.getPropertyValue('--icon')) {
      wrapper.style.setProperty('--icon', wrapper.dataset.iconUrl ? 'url(' + wrapper.dataset.iconUrl + ')' : 'none');
    }
    if (!wrapper.style.getPropertyValue('--grain')) {
      wrapper.style.setProperty('--grain', wrapper.dataset.grainUrl ? 'url(' + wrapper.dataset.grainUrl + ')' : 'none');
    }

    const tiltEngine = createTiltEngine(wrapper, shell, { enableTilt: enableTilt });
    if (!enableTilt || !tiltEngine) return;

    let enterTimer = null;
    let leaveRaf = null;

    function handlePointerMove(e) {
      const off = getOffsets(e, shell);
      tiltEngine.setTarget(off.x, off.y);
    }
    function handlePointerEnter(e) {
      shell.classList.add('active');
      shell.classList.add('entering');
      wrapper.classList.add('active');
      if (enterTimer) clearTimeout(enterTimer);
      enterTimer = setTimeout(function () { shell.classList.remove('entering'); }, ANIMATION_CONFIG.ENTER_TRANSITION_MS);
      const off = getOffsets(e, shell);
      tiltEngine.setTarget(off.x, off.y);
    }
    function handlePointerLeave() {
      tiltEngine.toCenter();
      const checkSettle = function () {
        const cur = tiltEngine.getCurrent();
        const settled = Math.hypot(cur.tx - cur.x, cur.ty - cur.y) < 0.6;
        if (settled) {
          shell.classList.remove('active');
          wrapper.classList.remove('active');
          leaveRaf = null;
        } else {
          leaveRaf = requestAnimationFrame(checkSettle);
        }
      };
      if (leaveRaf) cancelAnimationFrame(leaveRaf);
      leaveRaf = requestAnimationFrame(checkSettle);
    }
    function handleDeviceOrientation(e) {
      const beta = e.beta, gamma = e.gamma;
      if (beta == null || gamma == null) return;
      const centerX = shell.clientWidth / 2;
      const centerY = shell.clientHeight / 2;
      const x = clamp(centerX + gamma * mobileTiltSensitivity, 0, shell.clientWidth);
      const y = clamp(centerY + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity, 0, shell.clientHeight);
      tiltEngine.setTarget(x, y);
    }

    shell.addEventListener('pointerenter', handlePointerEnter);
    shell.addEventListener('pointermove', handlePointerMove);
    shell.addEventListener('pointerleave', handlePointerLeave);

    function handleClickForMotion() {
      if (!enableMobileTilt || location.protocol !== 'https:') return;
      const anyMotion = window.DeviceMotionEvent;
      if (anyMotion && typeof anyMotion.requestPermission === 'function') {
        anyMotion.requestPermission().then(function (state) {
          if (state === 'granted') window.addEventListener('deviceorientation', handleDeviceOrientation);
        }).catch(function () {});
      } else {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
      }
    }
    shell.addEventListener('click', handleClickForMotion);

    // initial animation
    const initialX = (shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
    tiltEngine.setImmediate(initialX, initialY);
    tiltEngine.toCenter();
    tiltEngine.beginInitial(ANIMATION_CONFIG.INITIAL_DURATION);

    // handle contact button
    const contactBtn = wrapper.querySelector('.pc-contact-btn');
    if (contactBtn) {
      const raw = contactBtn.getAttribute('data-contact');
      if (raw) {
        contactBtn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          // allow custom handler via dataset onContact
          const handlerName = wrapper.dataset.onContact;
          if (handlerName && window[handlerName] && typeof window[handlerName] === 'function') {
            window[handlerName](wrapper, ev);
          } else if (raw && raw.indexOf('@') !== -1) {
            // mailto fallback if looks like email
            window.location.href = 'mailto:' + raw;
          } else {
            // default: log
            console.log('Contact clicked for', wrapper.dataset.name || 'user');
          }
        });
      } else {
        contactBtn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          const n = wrapper.dataset.name || 'member';
          console.log('Contact clicked:', n);
        });
      }
    }

    // cleanup on removal (not needed for static but keep reference)
    wrapper._pcCleanup = function () {
      shell.removeEventListener('pointerenter', handlePointerEnter);
      shell.removeEventListener('pointermove', handlePointerMove);
      shell.removeEventListener('pointerleave', handlePointerLeave);
      shell.removeEventListener('click', handleClickForMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      if (enterTimer) clearTimeout(enterTimer);
      if (leaveRaf) cancelAnimationFrame(leaveRaf);
      tiltEngine.cancel();
      shell.classList.remove('entering');
    };
  }

  function initAll() {
    const wrappers = document.querySelectorAll('.pc-card-wrapper');
    wrappers.forEach(initCard);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // expose for dynamic creation
  window.ProfileCard = {
    init: initAll,
    initCard: initCard,
    DEFAULT_GRADIENT: DEFAULT_INNER_GRADIENT,
    ECELL_GRADIENT: ECELL_GRADIENT
  };
})();
