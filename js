document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Particles Background Effect ---
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    const numberOfParticles = 80;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        draw() {
            ctx.fillStyle = 'rgba(112, 0, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
            
            // Connect lines if close enough
            for (let j = i; j < particlesArray.length; j++) {
                const dx = particlesArray[i].x - particlesArray[j].x;
                const dy = particlesArray[i].y - particlesArray[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) {
                    ctx.strokeStyle = `rgba(112, 0, 255, ${1 - distance/150})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    init();
    animate();

    // --- 2. Header & Scroll Effects ---
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up, .reveal-left').forEach(el => observer.observe(el));
});



document.addEventListener('DOMContentLoaded', () => {
    // Particle Engine
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    const init = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        for(let i=0; i<100; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }
    };

    const draw = () => {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.fillStyle = 'rgba(112,0,255,0.3)';
            ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
        });

        // Draw connecting lines
        for(let i=0; i<particles.length; i++) {
            for(let j=i+1; j<particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if(dist < 150) {
                    ctx.strokeStyle = `rgba(112,0,255,${1 - dist/150})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    };

    init(); draw();
    window.addEventListener('resize', init);

    // Scroll Reveal
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
});



/* Append this to the end of your existing JS file.
   It consolidates behaviors, avoids duplicate listeners, adds FAQ toggles,
   debounced resize, reduced-motion respect, and small UX helpers.
*/

(() => {
  // --- Config ---
  const PARTICLE_COUNT = 90;
  const CONNECT_DISTANCE = 150;
  const PARTICLE_COLOR = '112,0,255'; // used as rgba(r,g,b,a)
  const FRAME_RATE_LIMIT = 60; // not strict, used for potential throttling

  // --- Utilities ---
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const debounce = (fn, wait = 120) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

  // Respect reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Particle System (single instance) ---
  const canvas = document.getElementById('particleCanvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let rafId = null;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = (count = PARTICLE_COUNT) => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          r: Math.random() * 1.8 + 0.6
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // draw points
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // wrap-around with slight bounce feel
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        ctx.fillStyle = `rgba(${PARTICLE_COLOR},0.32)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DISTANCE) {
            const alpha = clamp(1 - dist / CONNECT_DISTANCE, 0, 0.9) * 0.7;
            ctx.strokeStyle = `rgba(${PARTICLE_COLOR},${alpha})`;
            ctx.lineWidth = 0.45;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (prefersReducedMotion) {
        // draw once and stop animation for reduced motion users
        drawParticles();
        return;
      }
      drawParticles();
      rafId = requestAnimationFrame(animate);
    };

    // initialize
    const initParticles = () => {
      cancelAnimationFrame(rafId);
      resizeCanvas();
      createParticles(PARTICLE_COUNT);
      if (rafId) cancelAnimationFrame(rafId);
      animate();
    };

    // debounce resize to avoid thrash
    const onResize = debounce(() => {
      initParticles();
    }, 160);

    window.addEventListener('resize', onResize, { passive: true });
    initParticles();
  }

  // --- Header scroll behavior (single handler) ---
  const header = document.querySelector('.header');
  if (header) {
    const onScrollHeader = () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', debounce(onScrollHeader, 40), { passive: true });
    onScrollHeader();
  }

  // --- Intersection Observer for reveal animations ---
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up, .reveal-left, .reveal-grid, .bento-card').forEach(el => {
    revealObserver.observe(el);
  });

  // --- FAQ toggle using .open class (keeps CSS in sync) ---
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    const ans = item.querySelector('.faq-a');
    if (!btn || !ans) return;

    // initialize ARIA
    const id = `faq-${Math.random().toString(36).slice(2, 9)}`;
    ans.id = id;
    btn.setAttribute('aria-controls', id);
    btn.setAttribute('aria-expanded', 'false');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) {
        ans.style.display = 'block';
      } else {
        ans.style.display = 'none';
      }
    });
  });

  // --- Smooth scroll for nav links that target anchors ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    // ignore links that are just '#'
    if (a.getAttribute('href') === '#') return;
    a.addEventListener('click', (e) => {
      const targetId = a.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // update focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  // --- Small enhancement: collapse mobile nav when link clicked (if you have a toggled nav) ---
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      const nav = document.querySelector('.nav-container');
      // if you implement a mobile toggle, close it here; placeholder for custom logic
      // Example: document.body.classList.remove('nav-open');
    });
  });

  // --- Clean up on unload (optional) ---
  window.addEventListener('beforeunload', () => {
    // cancel any running animation frames if present
    try { cancelAnimationFrame && cancelAnimationFrame(); } catch (e) { /* noop */ }
  });
})();




