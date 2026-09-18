import { useEffect, useRef, useCallback } from 'react';
import './styles/liquid-glass.css';

// ============================================
// LIQUID GLASS PORTFOLIO - Main Application
// Pure CSS + Vanilla JS interactivity
// ============================================

function App() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);

  // Mouse position state (refs for performance)
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const spotlightPos = useRef({ x: 0, y: 0 });
  const isTouchDevice = useRef(false);
  const animFrameRef = useRef<number>(0);

  // Check if touch device & enable JS animations
  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    document.body.classList.add('js-enabled');
  }, []);

  // === Custom Cursor with Spring Physics ===
  useEffect(() => {
    if (isTouchDevice.current) return;

    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !dot) return;

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animateCursor = () => {
      // Spring physics for outer cursor
      cursorPos.current.x = lerp(cursorPos.current.x, mousePos.current.x, 0.12);
      cursorPos.current.y = lerp(cursorPos.current.y, mousePos.current.y, 0.12);
      cursor.style.left = `${cursorPos.current.x}px`;
      cursor.style.top = `${cursorPos.current.y}px`;

      // Faster follow for dot
      dotPos.current.x = lerp(dotPos.current.x, mousePos.current.x, 0.25);
      dotPos.current.y = lerp(dotPos.current.y, mousePos.current.y, 0.25);
      dot.style.left = `${dotPos.current.x}px`;
      dot.style.top = `${dotPos.current.y}px`;

      // Spotlight follow
      spotlightPos.current.x = lerp(spotlightPos.current.x, mousePos.current.x, 0.08);
      spotlightPos.current.y = lerp(spotlightPos.current.y, mousePos.current.y, 0.08);
      if (spotlightRef.current) {
        spotlightRef.current.style.left = `${spotlightPos.current.x}px`;
        spotlightRef.current.style.top = `${spotlightPos.current.y}px`;
      }

      animFrameRef.current = requestAnimationFrame(animateCursor);
    };

    animFrameRef.current = requestAnimationFrame(animateCursor);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    // Hover detection for interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.magnetic-btn, .nav-link, .social-link, .tech-chip, .project-card, a, button')) {
        cursor.classList.add('hovering');
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.magnetic-btn, .nav-link, .social-link, .tech-chip, .project-card, a, button')) {
        cursor.classList.remove('hovering');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  // === Mouse Parallax on Background Blobs ===
  useEffect(() => {
    if (isTouchDevice.current) return;

    const blobs = blobsRef.current;
    if (!blobs) return;

    const blobElements = blobs.querySelectorAll('.liquid-blob, .glass-orb');
    const depths = [0.02, 0.04, 0.06, 0.03, 0.05];

    let parallaxFrame: number;
    const targetPositions: { x: number; y: number }[] = [];
    const currentPositions: { x: number; y: number }[] = [];

    blobElements.forEach((_, i) => {
      targetPositions.push({ x: 0, y: 0 });
      currentPositions.push({ x: 0, y: 0 });
    });

    const handleParallax = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const moveX = (e.clientX - centerX) / centerX;
      const moveY = (e.clientY - centerY) / centerY;

      blobElements.forEach((_, i) => {
        const depth = depths[i % depths.length];
        targetPositions[i].x = moveX * depth * 100;
        targetPositions[i].y = moveY * depth * 100;
      });
    };

    const animateParallax = () => {
      blobElements.forEach((el, i) => {
        const htmlEl = el as HTMLElement;
        currentPositions[i].x += (targetPositions[i].x - currentPositions[i].x) * 0.05;
        currentPositions[i].y += (targetPositions[i].y - currentPositions[i].y) * 0.05;
        htmlEl.style.transform = `translate(${currentPositions[i].x}px, ${currentPositions[i].y}px)`;
      });
      parallaxFrame = requestAnimationFrame(animateParallax);
    };

    document.addEventListener('mousemove', handleParallax);
    parallaxFrame = requestAnimationFrame(animateParallax);

    return () => {
      document.removeEventListener('mousemove', handleParallax);
      cancelAnimationFrame(parallaxFrame);
    };
  }, []);

  // === Magnetic Buttons ===
  useEffect(() => {
    if (isTouchDevice.current) return;

    const buttons = document.querySelectorAll('.magnetic-btn');
    const radius = 100;

    const handleMove = (e: MouseEvent) => {
      buttons.forEach((btn) => {
        const rect = (btn as HTMLElement).getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        const distX = e.clientX - btnCenterX;
        const distY = e.clientY - btnCenterY;
        const dist = Math.sqrt(distX * distX + distY * distY);

        if (dist < radius) {
          const strength = (1 - dist / radius) * 0.4;
          const moveX = distX * strength;
          const moveY = distY * strength;
          (btn as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px)`;
        } else {
          (btn as HTMLElement).style.transform = 'translate(0, 0)';
        }
      });
    };

    document.addEventListener('mousemove', handleMove);
    return () => document.removeEventListener('mousemove', handleMove);
  }, []);

  // === Glass Ripple Effect on Click ===
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const ripple = document.createElement('div');
      ripple.className = 'ripple';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 800);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // === Tilt Cards Effect ===
  useEffect(() => {
    if (isTouchDevice.current) return;

    const cards = document.querySelectorAll('.project-card');

    const handleMove = (e: MouseEvent) => {
      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const isInBounds =
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom;

        if (isInBounds) {
          const inner = card.querySelector('.project-card-inner') as HTMLElement;
          if (!inner) return;

          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -8;
          const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8;

          inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

          // Dynamic light reflection
          const lightX = ((e.clientX - rect.left) / rect.width) * 100;
          const lightY = ((e.clientY - rect.top) / rect.height) * 100;
          inner.style.background = `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.06) 0%, transparent 50%)`;
        } else {
          const inner = card.querySelector('.project-card-inner') as HTMLElement;
          if (inner) {
            inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            inner.style.background = 'transparent';
          }
        }
      });
    };

    document.addEventListener('mousemove', handleMove);
    return () => document.removeEventListener('mousemove', handleMove);
  }, []);

  // === Mouse Trail Particles ===
  useEffect(() => {
    if (isTouchDevice.current) return;

    let lastParticleTime = 0;
    const throttleMs = 50;

    const handleMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastParticleTime < throttleMs) return;
      lastParticleTime = now;

      const particle = document.createElement('div');
      particle.className = 'mouse-particle';
      particle.style.left = `${e.clientX}px`;
      particle.style.top = `${e.clientY}px`;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    };

    document.addEventListener('mousemove', handleMove);
    return () => document.removeEventListener('mousemove', handleMove);
  }, []);

  // === Scroll Progress Indicator ===
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      if (scrollProgressRef.current) {
        scrollProgressRef.current.style.height = `${progress}%`;
      }

      // Nav scroll state
      const nav = document.querySelector('.nav');
      if (nav) {
        if (scrollTop > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // === Scroll Reveal Animations ===
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));

    // Fallback: force show all reveals after 3 seconds if not triggered
    const fallbackTimeout = setTimeout(() => {
      reveals.forEach((el) => {
        if (!el.classList.contains('visible')) {
          el.classList.add('visible');
        }
      });
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  // === Skill Bar Animation ===
  useEffect(() => {
    const skillBars = document.querySelectorAll('.skill-bar-fill');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      { threshold: 0.5 }
    );

    skillBars.forEach((bar) => observer.observe(bar));
    return () => observer.disconnect();
  }, []);

  // === Floating Particles Canvas ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 20 : 50;

    let particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      particles = [];
      const colors = ['rgba(0, 212, 255,', 'rgba(123, 47, 247,', 'rgba(255, 45, 149,'];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.opacity})`;
        ctx.fill();

        // Draw connections
        particles.forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.05 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    resize();
    initParticles();
    animate();

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    return () => window.removeEventListener('resize', resize);
  }, []);

  // === Typing Animation ===
  const typingRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const phrases = [
      'Crafting Digital Experiences',
      'Building Liquid Interfaces',
      'Designing the Future of Web',
      'Creating Glass Morphism Magic',
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const type = () => {
      const current = phrases[phraseIndex];
      if (typingRef.current) {
        if (!isDeleting) {
          typingRef.current.textContent = current.substring(0, charIndex + 1);
          charIndex++;
          if (charIndex === current.length) {
            isDeleting = true;
            timeout = setTimeout(type, 2000);
            return;
          }
        } else {
          typingRef.current.textContent = current.substring(0, charIndex - 1);
          charIndex--;
          if (charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
          }
        }
        timeout = setTimeout(type, isDeleting ? 30 : 80);
      }
    };

    timeout = setTimeout(type, 1000);
    return () => clearTimeout(timeout);
  }, []);

  // === Device Orientation for Mobile Parallax ===
  useEffect(() => {
    if (!isTouchDevice.current) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const blobs = blobsRef.current;
      if (!blobs) return;
      const blobElements = blobs.querySelectorAll('.liquid-blob');
      const gamma = (e.gamma || 0) / 45; // left-right tilt
      const beta = (e.beta || 0) / 45; // front-back tilt

      blobElements.forEach((el, i) => {
        const depth = (i + 1) * 0.02;
        const htmlEl = el as HTMLElement;
        htmlEl.style.transform = `translate(${gamma * depth * 50}px, ${beta * depth * 50}px)`;
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // === Smooth Scroll for Nav Links ===
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <>
      {/* Background Elements */}
      <div className="bg-gradient-animated" />
      <div className="noise-overlay" />
      <canvas ref={canvasRef} className="particles-canvas" aria-hidden="true" />

      {/* Custom Cursor */}
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />
      <div ref={cursorDotRef} className="custom-cursor-dot" aria-hidden="true" />

      {/* Spotlight */}
      <div ref={spotlightRef} className="spotlight" aria-hidden="true" />

      {/* Liquid Blobs Background */}
      <div ref={blobsRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 4 }} aria-hidden="true">
        <div className="liquid-blob liquid-blob--cyan" style={{ width: '400px', height: '400px', top: '10%', left: '10%', animationDelay: '0s' }} />
        <div className="liquid-blob liquid-blob--purple" style={{ width: '350px', height: '350px', top: '60%', right: '10%', animationDelay: '-5s' }} />
        <div className="liquid-blob liquid-blob--pink" style={{ width: '300px', height: '300px', bottom: '10%', left: '40%', animationDelay: '-10s' }} />
        <div className="glass-orb" style={{ width: '80px', height: '80px', top: '20%', right: '20%', animationDelay: '-2s' }} />
        <div className="glass-orb" style={{ width: '50px', height: '50px', top: '70%', left: '15%', animationDelay: '-4s' }} />
        <div className="glass-orb" style={{ width: '120px', height: '120px', top: '40%', right: '30%', animationDelay: '-6s' }} />
        <div className="glass-orb" style={{ width: '40px', height: '40px', top: '80%', right: '40%', animationDelay: '-3s' }} />
      </div>

      {/* Scroll Progress */}
      <div className="scroll-progress" aria-hidden="true">
        <div ref={scrollProgressRef} className="scroll-progress-fill" style={{ height: '0%' }} />
      </div>

      {/* Navigation */}
      <nav className="nav" role="navigation" aria-label="Main navigation">
        <a href="#hero" className="nav-logo" onClick={(e) => handleNavClick(e, 'hero')}>
          A<span>.</span>R
        </a>
        <ul className="nav-links">
          <li><a href="#about" className="nav-link" onClick={(e) => handleNavClick(e, 'about')}>About</a></li>
          <li><a href="#portfolio" className="nav-link" onClick={(e) => handleNavClick(e, 'portfolio')}>Work</a></li>
          <li><a href="#experience" className="nav-link" onClick={(e) => handleNavClick(e, 'experience')}>Experience</a></li>
          <li><a href="#contact" className="nav-link" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a></li>
        </ul>
      </nav>

      {/* === HERO SECTION === */}
      <section id="hero" className="hero">
        <h1 className="hero-title glass-text reveal">Alex Rivera</h1>
        <p className="hero-tagline reveal reveal-delay-1">
          <span ref={typingRef}></span>
          <span className="typing-cursor" />
        </p>
        <div className="hero-buttons reveal reveal-delay-2">
          <a href="#portfolio" className="magnetic-btn" onClick={(e) => handleNavClick(e, 'portfolio')}>
            <span>View My Work</span>
          </a>
          <a href="#contact" className="magnetic-btn" onClick={(e) => handleNavClick(e, 'contact')}>
            <span>Get In Touch</span>
          </a>
        </div>
        <div className="scroll-indicator" aria-hidden="true">
          <span>Scroll</span>
          <div className="scroll-indicator-line" />
        </div>
      </section>

      {/* Wave Divider */}
      <div className="wave-divider" aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
            fill="rgba(0, 212, 255, 0.03)"
          />
          <path
            d="M0,50 C240,20 480,70 720,50 C960,30 1200,60 1440,50 L1440,80 L0,80 Z"
            fill="rgba(123, 47, 247, 0.03)"
          />
        </svg>
      </div>

      {/* === ABOUT SECTION === */}
      <section id="about" className="section">
        <h2 className="section-title reveal">About Me</h2>
        <p className="section-subtitle reveal reveal-delay-1">
          A passionate developer who transforms ideas into immersive digital experiences.
        </p>
        <div className="about-grid">
          <div className="glass-card reveal reveal-delay-2" style={{ padding: '2rem' }}>
            <div className="about-photo">
              <span role="img" aria-label="Developer avatar">👨‍💻</span>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                With over 7 years of experience in web development, I specialize in creating 
                visually stunning and highly interactive websites. My passion lies at the 
                intersection of design and technology, where I craft digital experiences that 
                captivate and engage users.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                From startups to enterprise clients, I've helped businesses elevate their 
                online presence with cutting-edge technologies and creative solutions.
              </p>
            </div>
          </div>

          <div className="reveal reveal-delay-3">
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-primary)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
                Skills & Expertise
              </h3>
              <div className="skill-bar">
                <div className="skill-bar-label">
                  <span>React / Next.js</span><span>95%</span>
                </div>
                <div className="skill-bar-track">
                  <div className="skill-bar-fill" style={{ width: '95%' }} />
                </div>
              </div>
              <div className="skill-bar">
                <div className="skill-bar-label">
                  <span>TypeScript</span><span>90%</span>
                </div>
                <div className="skill-bar-track">
                  <div className="skill-bar-fill" style={{ width: '90%' }} />
                </div>
              </div>
              <div className="skill-bar">
                <div className="skill-bar-label">
                  <span>CSS / Animations</span><span>92%</span>
                </div>
                <div className="skill-bar-track">
                  <div className="skill-bar-fill" style={{ width: '92%' }} />
                </div>
              </div>
              <div className="skill-bar">
                <div className="skill-bar-label">
                  <span>Node.js / Backend</span><span>85%</span>
                </div>
                <div className="skill-bar-track">
                  <div className="skill-bar-fill" style={{ width: '85%' }} />
                </div>
              </div>
              <div className="skill-bar">
                <div className="skill-bar-label">
                  <span>UI/UX Design</span><span>88%</span>
                </div>
                <div className="skill-bar-track">
                  <div className="skill-bar-fill" style={{ width: '88%' }} />
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>
                Tech Stack
              </h3>
              <div className="tech-chips">
                {['React', 'Next.js', 'TypeScript', 'Node.js', 'GraphQL', 'Tailwind CSS', 'Framer Motion', 'Three.js', 'PostgreSQL', 'AWS', 'Docker', 'Figma'].map((tech) => (
                  <span key={tech} className="tech-chip">{tech}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === PORTFOLIO SECTION === */}
      <section id="portfolio" className="section">
        <h2 className="section-title reveal">Featured Work</h2>
        <p className="section-subtitle reveal reveal-delay-1">
          A selection of projects that showcase my expertise in building modern, interactive web experiences.
        </p>
        <div className="portfolio-grid">
          {[
            {
              title: 'Nebula Dashboard',
              desc: 'A real-time analytics dashboard with 3D data visualization and liquid glass UI components.',
              tags: ['React', 'Three.js', 'D3.js', 'WebSocket'],
              icon: '🌌',
              gradient: 'linear-gradient(135deg, #0a0a2e, #1a0a3e)',
            },
            {
              title: 'Prism E-Commerce',
              desc: 'Luxury fashion marketplace with immersive product showcases and AR try-on features.',
              tags: ['Next.js', 'Stripe', 'Prisma', 'AWS'],
              icon: '💎',
              gradient: 'linear-gradient(135deg, #1a0a2e, #2a0a1e)',
            },
            {
              title: 'Flux Social Platform',
              desc: 'Next-gen social platform with real-time messaging, stories, and AI-powered content curation.',
              tags: ['React', 'GraphQL', 'Redis', 'OpenAI'],
              icon: '⚡',
              gradient: 'linear-gradient(135deg, #0a1a2e, #0a2a1e)',
            },
            {
              title: 'Aether Design System',
              desc: 'Comprehensive design system with 200+ components, glassmorphism tokens, and accessibility built-in.',
              tags: ['TypeScript', 'Storybook', 'CSS-in-JS', 'A11y'],
              icon: '🎨',
              gradient: 'linear-gradient(135deg, #1a1a0e, #0a1a2e)',
            },
          ].map((project, i) => (
            <div key={project.title} className={`project-card reveal reveal-delay-${i + 1}`}>
              <div className="project-card-inner glass-card" style={{ padding: '1.5rem' }}>
                <div className="project-thumbnail" style={{ background: project.gradient }}>
                  <div className="project-thumbnail-icon">{project.icon}</div>
                </div>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.desc}</p>
                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="project-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === EXPERIENCE SECTION === */}
      <section id="experience" className="section">
        <h2 className="section-title reveal">Experience</h2>
        <p className="section-subtitle reveal reveal-delay-1">
          My professional journey through the world of web development.
        </p>
        <div className="timeline">
          {[
            {
              date: '2022 - Present',
              title: 'Senior Creative Developer',
              company: 'Nexus Digital Agency',
              desc: 'Leading the frontend team in building award-winning interactive experiences for global brands. Implemented design systems that reduced development time by 40%.',
            },
            {
              date: '2020 - 2022',
              title: 'Full Stack Developer',
              company: 'Quantum Labs',
              desc: 'Built scalable SaaS products serving 100K+ users. Architected microservices infrastructure and mentored junior developers.',
            },
            {
              date: '2018 - 2020',
              title: 'Frontend Developer',
              company: 'Pixel Perfect Studio',
              desc: 'Crafted pixel-perfect responsive websites and progressive web apps. Specialized in performance optimization and animation.',
            },
            {
              date: '2017 - 2018',
              title: 'Junior Developer',
              company: 'StartUp Hub',
              desc: 'Started my journey building MVPs for early-stage startups. Learned agile methodologies and rapid prototyping.',
            },
          ].map((item, i) => (
            <div key={item.title} className={`timeline-item glass-card reveal reveal-delay-${i + 1}`}>
              <div className="timeline-node" />
              <div className="timeline-date">{item.date}</div>
              <h3 className="timeline-title">{item.title}</h3>
              <div className="timeline-company">{item.company}</div>
              <p className="timeline-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === CONTACT SECTION === */}
      <section id="contact" className="section">
        <h2 className="section-title reveal">Let's Connect</h2>
        <p className="section-subtitle reveal reveal-delay-1">
          Have a project in mind? I'd love to hear about it. Let's create something extraordinary together.
        </p>
        <div className="contact-grid">
          <form className="contact-form reveal reveal-delay-2" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <input type="text" className="form-input" placeholder=" " aria-label="Your name" />
              <label className="form-label">Your Name</label>
            </div>
            <div className="form-group">
              <input type="email" className="form-input" placeholder=" " aria-label="Your email" />
              <label className="form-label">Your Email</label>
            </div>
            <div className="form-group">
              <textarea className="form-input" placeholder=" " aria-label="Your message" />
              <label className="form-label">Your Message</label>
            </div>
            <button type="submit" className="magnetic-btn" style={{ alignSelf: 'flex-start' }}>
              <span>Send Message ✨</span>
            </button>
          </form>

          <div className="reveal reveal-delay-3">
            <div className="glass-card" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.3rem', marginBottom: '1rem' }}>
                Get in Touch
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
              </p>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Email</p>
                <p style={{ color: 'var(--accent-cyan)' }}>alex@rivera.dev</p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Location</p>
                <p style={{ color: 'var(--text-secondary)' }}>San Francisco, CA</p>
              </div>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="GitHub">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="social-link" aria-label="Dribbble">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.81zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.29zm10.335 3.483c-.218.29-1.91 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="footer">
        <p className="footer-text">
          © 2024 Alex Rivera. Crafted with 💜 and liquid glass.
        </p>
      </footer>
    </>
  );
}

export default App;
