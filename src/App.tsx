import { useEffect, useRef, useCallback } from 'react';
import './styles/liquid-glass.css';

// ============================================
// LIQUID GLASS PORTFOLIO - Main Application
// ============================================

function App() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<HTMLSpanElement>(null);

  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const spotlightPos = useRef({ x: 0, y: 0 });
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    
    if (!cursor || !dot) return;

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;
    let animId: number;

    const animate = () => {
      cursorPos.current.x = lerp(cursorPos.current.x, mousePos.current.x, 0.12);
      cursorPos.current.y = lerp(cursorPos.current.y, mousePos.current.y, 0.12);
      cursor.style.left = `${cursorPos.current.x}px`;
      cursor.style.top = `${cursorPos.current.y}px`;

      dotPos.current.x = lerp(dotPos.current.x, mousePos.current.x, 0.25);
      dotPos.current.y = lerp(dotPos.current.y, mousePos.current.y, 0.25);
      dot.style.left = `${dotPos.current.x}px`;
      dot.style.top = `${dotPos.current.y}px`;

      spotlightPos.current.x = lerp(spotlightPos.current.x, mousePos.current.x, 0.08);
      spotlightPos.current.y = lerp(spotlightPos.current.y, mousePos.current.y, 0.08);
      if (spotlightRef.current) {
        spotlightRef.current.style.left = `${spotlightPos.current.x}px`;
        spotlightRef.current.style.top = `${spotlightPos.current.y}px`;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

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
      cancelAnimationFrame(animId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  // Ripple effect on click
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

  // Magnetic buttons
  useEffect(() => {
    const buttons = document.querySelectorAll('.magnetic-btn');
    const handleMagnetic = (e: MouseEvent) => {
      buttons.forEach((btn) => {
        const rect = (btn as HTMLElement).getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        const distX = e.clientX - btnCenterX;
        const distY = e.clientY - btnCenterY;
        const dist = Math.sqrt(distX * distX + distY * distY);

        if (dist < 100) {
          const strength = (1 - dist / 100) * 0.4;
          (btn as HTMLElement).style.transform = `translate(${distX * strength}px, ${distY * strength}px)`;
        } else {
          (btn as HTMLElement).style.transform = 'translate(0, 0)';
        }
      });
    };
    document.addEventListener('mousemove', handleMagnetic);
    return () => document.removeEventListener('mousemove', handleMagnetic);
  }, []);

  // Tilt cards
  useEffect(() => {
    const cards = document.querySelectorAll('.project-card');
    const handleTilt = (e: MouseEvent) => {
      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const isInBounds =
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom;

        const inner = card.querySelector('.project-card-inner') as HTMLElement;
        if (!inner) return;

        if (isInBounds) {
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -8;
          const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8;
          inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
          const lightX = ((e.clientX - rect.left) / rect.width) * 100;
          const lightY = ((e.clientY - rect.top) / rect.height) * 100;
          inner.style.background = `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.06) 0%, transparent 50%)`;
        } else {
          inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
          inner.style.background = 'transparent';
        }
      });
    };
    document.addEventListener('mousemove', handleTilt);
    return () => document.removeEventListener('mousemove', handleTilt);
  }, []);

  // Mouse trail particles
  useEffect(() => {
    let lastParticleTime = 0;
    const handleTrail = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastParticleTime < 50) return;
      lastParticleTime = now;
      const particle = document.createElement('div');
      particle.className = 'mouse-particle';
      particle.style.left = `${e.clientX}px`;
      particle.style.top = `${e.clientY}px`;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    };
    document.addEventListener('mousemove', handleTrail);
    return () => document.removeEventListener('mousemove', handleTrail);
  }, []);

  // Parallax blobs
  useEffect(() => {
    const blobElements = blobsRef.current?.querySelectorAll('.liquid-blob, .glass-orb');
    if (!blobElements) return;

    const depths = [0.02, 0.04, 0.06, 0.03, 0.05, 0.02, 0.04];
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

    let parallaxId: number;
    const animateParallax = () => {
      blobElements.forEach((el, i) => {
        const htmlEl = el as HTMLElement;
        currentPositions[i].x += (targetPositions[i].x - currentPositions[i].x) * 0.05;
        currentPositions[i].y += (targetPositions[i].y - currentPositions[i].y) * 0.05;
        htmlEl.style.transform = `translate(${currentPositions[i].x}px, ${currentPositions[i].y}px)`;
      });
      parallaxId = requestAnimationFrame(animateParallax);
    };
    document.addEventListener('mousemove', handleParallax);
    parallaxId = requestAnimationFrame(animateParallax);

    return () => {
      cancelAnimationFrame(parallaxId);
      document.removeEventListener('mousemove', handleParallax);
    };
  }, []);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (scrollProgressRef.current) {
        scrollProgressRef.current.style.height = `${progress}%`;
      }
      const nav = document.querySelector('.nav');
      if (nav) {
        nav.classList.toggle('scrolled', scrollTop > 50);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Skill bars animation
  useEffect(() => {
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    skillBars.forEach((bar) => bar.classList.add('animate'));
  }, []);

  // Particles canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 20 : 50;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }[] = [];
    let animId: number;

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
      animId = requestAnimationFrame(animate);
    };

    resize();
    initParticles();
    animate();
    window.addEventListener('resize', () => { resize(); initParticles(); });

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Typing animation
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

    timeout = setTimeout(type, 500);
    return () => clearTimeout(timeout);
  }, []);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <>
      {/* Background */}
      <div className="bg-gradient-animated" />
      <div className="noise-overlay" />
      <canvas ref={canvasRef} className="particles-canvas" aria-hidden="true" />

      {/* Cursor - always rendered, hidden on mobile via CSS */}
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />
      <div ref={cursorDotRef} className="custom-cursor-dot" aria-hidden="true" />

      {/* Spotlight */}
      <div ref={spotlightRef} className="spotlight" aria-hidden="true" />

      {/* Blobs */}
      <div ref={blobsRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 4 }} aria-hidden="true">
        <div className="liquid-blob liquid-blob--cyan" style={{ width: '400px', height: '400px', top: '10%', left: '10%' }} />
        <div className="liquid-blob liquid-blob--purple" style={{ width: '350px', height: '350px', top: '60%', right: '10%' }} />
        <div className="liquid-blob liquid-blob--pink" style={{ width: '300px', height: '300px', bottom: '10%', left: '40%' }} />
        <div className="glass-orb" style={{ width: '80px', height: '80px', top: '20%', right: '20%' }} />
        <div className="glass-orb" style={{ width: '50px', height: '50px', top: '70%', left: '15%' }} />
        <div className="glass-orb" style={{ width: '120px', height: '120px', top: '40%', right: '30%' }} />
      </div>

      {/* Scroll Progress */}
      <div className="scroll-progress" aria-hidden="true">
        <div ref={scrollProgressRef} className="scroll-progress-fill" style={{ height: '0%' }} />
      </div>

      {/* Nav */}
      <nav className="nav" role="navigation" aria-label="Main navigation">
        <a href="#hero" className="nav-logo" onClick={(e) => handleNavClick(e, 'hero')}>A<span>.</span>R</a>
        <ul className="nav-links">
          <li><a href="#about" className="nav-link" onClick={(e) => handleNavClick(e, 'about')}>About</a></li>
          <li><a href="#portfolio" className="nav-link" onClick={(e) => handleNavClick(e, 'portfolio')}>Work</a></li>
          <li><a href="#experience" className="nav-link" onClick={(e) => handleNavClick(e, 'experience')}>Experience</a></li>
          <li><a href="#contact" className="nav-link" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a></li>
        </ul>
      </nav>

      {/* Hero */}
      <section id="hero" className="hero">
        <h1 className="hero-title glass-text">Alex Rivera</h1>
        <p className="hero-tagline">
          <span ref={typingRef}></span>
          <span className="typing-cursor" />
        </p>
        <div className="hero-buttons">
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

      {/* Wave */}
      <div className="wave-divider" aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill="rgba(0, 212, 255, 0.03)" />
          <path d="M0,50 C240,20 480,70 720,50 C960,30 1200,60 1440,50 L1440,80 L0,80 Z" fill="rgba(123, 47, 247, 0.03)" />
        </svg>
      </div>

      {/* About */}
      <section id="about" className="section">
        <h2 className="section-title">About Me</h2>
        <p className="section-subtitle">A passionate developer who transforms ideas into immersive digital experiences.</p>
        <div className="about-grid">
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div className="about-photo"><span role="img" aria-label="Developer">👨‍💻</span></div>
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                With over 7 years of experience in web development, I specialize in creating visually stunning and highly interactive websites. My passion lies at the intersection of design and technology.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                From startups to enterprise clients, I've helped businesses elevate their online presence with cutting-edge technologies and creative solutions.
              </p>
            </div>
          </div>
          <div>
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-primary)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Skills & Expertise</h3>
              <div className="skill-bar">
                <div className="skill-bar-label"><span>React / Next.js</span><span>95%</span></div>
                <div className="skill-bar-track"><div className="skill-bar-fill" style={{ width: '95%' }} /></div>
              </div>
              <div className="skill-bar">
                <div className="skill-bar-label"><span>TypeScript</span><span>90%</span></div>
                <div className="skill-bar-track"><div className="skill-bar-fill" style={{ width: '90%' }} /></div>
              </div>
              <div className="skill-bar">
                <div className="skill-bar-label"><span>CSS / Animations</span><span>92%</span></div>
                <div className="skill-bar-track"><div className="skill-bar-fill" style={{ width: '92%' }} /></div>
              </div>
              <div className="skill-bar">
                <div className="skill-bar-label"><span>Node.js / Backend</span><span>85%</span></div>
                <div className="skill-bar-track"><div className="skill-bar-fill" style={{ width: '85%' }} /></div>
              </div>
              <div className="skill-bar">
                <div className="skill-bar-label"><span>UI/UX Design</span><span>88%</span></div>
                <div className="skill-bar-track"><div className="skill-bar-fill" style={{ width: '88%' }} /></div>
              </div>
            </div>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>Tech Stack</h3>
              <div className="tech-chips">
                {['React', 'Next.js', 'TypeScript', 'Node.js', 'GraphQL', 'Tailwind CSS', 'Framer Motion', 'Three.js', 'PostgreSQL', 'AWS', 'Docker', 'Figma'].map((tech) => (
                  <span key={tech} className="tech-chip">{tech}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="section">
        <h2 className="section-title">Featured Work</h2>
        <p className="section-subtitle">A selection of projects that showcase my expertise in building modern, interactive web experiences.</p>
        <div className="portfolio-grid">
          {[
            { title: 'Nebula Dashboard', desc: 'A real-time analytics dashboard with 3D data visualization and liquid glass UI components.', tags: ['React', 'Three.js', 'D3.js', 'WebSocket'], icon: '🌌', gradient: 'linear-gradient(135deg, #0a0a2e, #1a0a3e)' },
            { title: 'Prism E-Commerce', desc: 'Luxury fashion marketplace with immersive product showcases and AR try-on features.', tags: ['Next.js', 'Stripe', 'Prisma', 'AWS'], icon: '💎', gradient: 'linear-gradient(135deg, #1a0a2e, #2a0a1e)' },
            { title: 'Flux Social Platform', desc: 'Next-gen social platform with real-time messaging, stories, and AI-powered content curation.', tags: ['React', 'GraphQL', 'Redis', 'OpenAI'], icon: '⚡', gradient: 'linear-gradient(135deg, #0a1a2e, #0a2a1e)' },
            { title: 'Aether Design System', desc: 'Comprehensive design system with 200+ components, glassmorphism tokens, and accessibility built-in.', tags: ['TypeScript', 'Storybook', 'CSS-in-JS', 'A11y'], icon: '🎨', gradient: 'linear-gradient(135deg, #1a1a0e, #0a1a2e)' },
          ].map((project) => (
            <div key={project.title} className="project-card">
              <div className="project-card-inner glass-card" style={{ padding: '1.5rem' }}>
                <div className="project-thumbnail" style={{ background: project.gradient }}>
                  <div className="project-thumbnail-icon">{project.icon}</div>
                </div>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.desc}</p>
                <div className="project-tags">
                  {project.tags.map((tag) => <span key={tag} className="project-tag">{tag}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="section">
        <h2 className="section-title">Experience</h2>
        <p className="section-subtitle">My professional journey through the world of web development.</p>
        <div className="timeline">
          {[
            { date: '2022 - Present', title: 'Senior Creative Developer', company: 'Nexus Digital Agency', desc: 'Leading the frontend team in building award-winning interactive experiences for global brands.' },
            { date: '2020 - 2022', title: 'Full Stack Developer', company: 'Quantum Labs', desc: 'Built scalable SaaS products serving 100K+ users. Architected microservices infrastructure.' },
            { date: '2018 - 2020', title: 'Frontend Developer', company: 'Pixel Perfect Studio', desc: 'Crafted pixel-perfect responsive websites and progressive web apps.' },
            { date: '2017 - 2018', title: 'Junior Developer', company: 'StartUp Hub', desc: 'Started my journey building MVPs for early-stage startups.' },
          ].map((item) => (
            <div key={item.title} className="timeline-item glass-card">
              <div className="timeline-node" />
              <div className="timeline-date">{item.date}</div>
              <h3 className="timeline-title">{item.title}</h3>
              <div className="timeline-company">{item.company}</div>
              <p className="timeline-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section">
        <h2 className="section-title">Let's Connect</h2>
        <p className="section-subtitle">Have a project in mind? I'd love to hear about it. Let's create something extraordinary together.</p>
        <div className="contact-grid">
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
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
          <div>
            <div className="glass-card" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.3rem', marginBottom: '1rem' }}>Get in Touch</h3>
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">© 2024 Alex Rivera. Crafted with 💜 and liquid glass.</p>
      </footer>
    </>
  );
}

export default App;
