// Ultra-Interactive Liquid Glass Portfolio - Main JavaScript
(function() {
    'use strict';

    // Main Application Namespace
    const LiquidGlass = {
        // Configuration
        config: {
            cursorSpeed: 0.12,
            magneticRadius: 100,
            particleCount: 50,
            mobileParticleCount: 20,
            rippleDuration: 600,
            scrollThreshold: 100,
            tiltStrength: 20,
            parallaxLayers: 3,
            parallaxIntensity: 0.05
        },

        // State Management
        state: {
            mouseX: 0,
            mouseY: 0,
            lastMouseX: 0,
            lastMouseY: 0,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            isScrolling: false,
            scrollProgress: 0,
            particles: [],
            ripples: []
        },

        // DOM Elements
        elements: {
            cursor: null,
            cursorDot: null,
            rippleContainer: null,
            particleCanvas: null,
            canvasCtx: null,
            magneticButtons: [],
            tiltCards: [],
            skillBars: [],
            portfolioGrid: null,
            sections: [],
            progressIndicator: null
        },

        // Initialize Application
        init: function() {
            this.setupDOMElements();
            this.setupEventListeners();
            this.initializeComponents();
            this.startAnimations();

            if (!this.state.isTouchDevice && !this.state.reducedMotion) {
                this.hideNativeCursor();
            }

            console.log('Liquid Glass Portfolio initialized successfully!');
        },

        // Setup DOM References
        setupDOMElements: function() {
            this.elements.cursor = document.getElementById('cursor');
            this.elements.cursorDot = document.getElementById('cursor-dot');
            this.elements.rippleContainer = document.getElementById('ripple-container');
            this.elements.particleCanvas = document.getElementById('particleCanvas');
            this.elements.canvasCtx = this.elements.particleCanvas.getContext('2d');

            this.elements.magneticButtons = document.querySelectorAll('.magnetic-btn');
            this.elements.tiltCards = document.querySelectorAll('.tilt-card');
            this.elements.skillBars = document.querySelectorAll('.skill-progress');
            this.elements.portfolioGrid = document.querySelector('.portfolio-grid');
            this.elements.sections = document.querySelectorAll('.section');

            // Set canvas size
            this.resizeCanvas();
        },

        // Initialize Components
        initializeComponents: function() {
            this.initTypingAnimation();
            this.initSkillBars();
            this.initScrollReveal();
            this.initParticles();
            this.initParallaxBlobs();
            this.setupSmoothScroll();
            this.setupProgressIndicator();
        },

        // Start Animation Loop
        startAnimations: function() {
            const animate = () => {
                this.updateCursor();
                this.updateMagneticButtons();
                this.updateTiltCards();
                this.updateParticles();
                this.updateRipples();
                this.updateParallax();
                this.updateScrollProgress();

                requestAnimationFrame(animate);
            };

            animate();
        },

        // Update Mouse Position
        updateMousePosition: function(e) {
            this.state.mouseX = e.clientX;
            this.state.mouseY = e.clientY;
        },

        // Update Custom Cursor
        updateCursor: function() {
            if (this.state.isTouchDevice || this.state.reducedMotion) return;

            const cursor = this.elements.cursor;
            const cursorDot = this.elements.cursorDot;

            if (cursor && cursorDot) {
                // Smooth cursor movement using lerp
                const newX = this.lerp(cursor.style.left ? parseFloat(cursor.style.left) : this.state.mouseX, this.state.mouseX, this.config.cursorSpeed);
                const newY = this.lerp(cursor.style.top ? parseFloat(cursor.style.top) : this.state.mouseY, this.state.mouseY, this.config.cursorSpeed);

                cursor.style.transform = `translate(${newX}px, ${newY}px)`;
                cursorDot.style.transform = `translate(${this.state.mouseX}px, ${this.state.mouseY}px)`;

                // Update state for other calculations
                this.state.lastMouseX = newX;
                this.state.lastMouseY = newY;
            }
        },

        // Linear interpolation helper
        lerp: function(start, end, factor) {
            return start + (end - start) * factor;
        },

        // Magnetic Button Effect
        updateMagneticButtons: function() {
            if (this.state.isTouchDevice) return;

            this.elements.magneticButtons.forEach(button => {
                const rect = button.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const distance = Math.sqrt(
                    Math.pow(this.state.mouseX - centerX, 2) +
                    Math.pow(this.state.mouseY - centerY, 2)
                );

                if (distance < this.config.magneticRadius) {
                    const force = (this.config.magneticRadius - distance) / this.config.magneticRadius;
                    const angle = Math.atan2(this.state.mouseY - centerY, this.state.mouseX - centerX);

                    const moveX = Math.cos(angle) * force * 20;
                    const moveY = Math.sin(angle) * force * 20;

                    button.style.transform = `translate(${moveX}px, ${moveY}px)`;
                } else {
                    button.style.transform = 'translate(0px, 0px)';
                }
            });
        },

        // 3D Tilt Card Effect
        updateTiltCards: function() {
            if (this.state.isTouchDevice) return;

            this.elements.tiltCards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const mouseX = this.state.mouseX;
                const mouseY = this.state.mouseY;

                const rotateX = (mouseY - centerY) / (rect.height / 2) * this.config.tiltStrength;
                const rotateY = (centerX - mouseX) / (rect.width / 2) * this.config.tiltStrength;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`;

                // Update reflection based on mouse position
                const lightX = (mouseX - rect.left) / rect.width;
                const lightY = (mouseY - rect.top) / rect.height;

                const reflectionStyle = `
                    radial-gradient(circle at ${lightX * 100}% ${lightY * 100}%,
                    rgba(255, 255, 255, 0.3) 0%,
                    transparent 50%)
                `;

                card.style.background = `linear-gradient(45deg,
                    rgba(255, 255, 255, 0.05),
                    rgba(255, 255, 255, 0.03)
                )`;
            });
        },

        // Glass Ripple Effect
        createRipple: function(x, y) {
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.backgroundColor = 'rgba(0, 212, 255, 0.3)';
            ripple.style.border = '2px solid rgba(0, 212, 255, 0.5)';

            this.elements.rippleContainer.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, this.config.rippleDuration);
        },

        // Update Ripples
        updateRipples: function() {
            // Ripples are handled by CSS animations, so we just ensure cleanup
            const ripples = this.elements.rippleContainer.querySelectorAll('.ripple');
            ripples.forEach(ripple => {
                if (parseFloat(ripple.style.opacity) <= 0) {
                    ripple.remove();
                }
            });
        },

        // Particle System
        initParticles: function() {
            const particleCount = this.state.windowWidth < 768 ? this.config.mobileParticleCount : this.config.particleCount;

            for (let i = 0; i < particleCount; i++) {
                this.state.particles.push({
                    x: Math.random() * this.state.windowWidth,
                    y: Math.random() * this.state.windowHeight,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.5 + 0.1,
                    color: this.getRandomAccentColor()
                });
            }
        },

        getRandomAccentColor: function() {
            const colors = ['#00d4ff', '#7b2ff7', '#ff2d95'];
            return colors[Math.floor(Math.random() * colors.length)];
        },

        updateParticles: function() {
            if (!this.elements.canvasCtx) return;

            const ctx = this.elements.canvasCtx;
            ctx.clearRect(0, 0, this.state.windowWidth, this.state.windowHeight);

            // Draw particles
            this.state.particles.forEach(particle => {
                // Move particle
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Wrap around edges
                if (particle.x < 0) particle.x = this.state.windowWidth;
                if (particle.x > this.state.windowWidth) particle.x = 0;
                if (particle.y < 0) particle.y = this.state.windowHeight;
                if (particle.y > this.state.windowHeight) particle.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.opacity;
                ctx.fill();

                // Draw connections to nearby particles
                this.state.particles.forEach(otherParticle => {
                    const distance = Math.sqrt(
                        Math.pow(particle.x - otherParticle.x, 2) +
                        Math.pow(particle.y - otherParticle.y, 2)
                    );

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = particle.color;
                        ctx.globalAlpha = 0.1 * (1 - distance / 100);
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });

            ctx.globalAlpha = 1;
        },

        // Parallax Effect for Blobs
        initParallaxBlobs: function() {
            // Blobs are already in HTML, we'll update their positions via CSS
        },

        updateParallax: function() {
            if (this.state.isTouchDevice) return;

            const blobs = document.querySelectorAll('.blob');
            blobs.forEach((blob, index) => {
                const speed = this.config.parallaxIntensity * (index + 1);
                const offsetX = (this.state.mouseX - this.state.windowWidth / 2) * speed;
                const offsetY = (this.state.mouseY - this.state.windowHeight / 2) * speed;

                blob.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            });
        },

        // Typing Animation
        initTypingAnimation: function() {
            const typingElement = document.getElementById('typing-text');
            const phrases = [
                'Creative Developer',
                'UI/UX Designer',
                'Frontend Specialist',
                'Problem Solver'
            ];

            let phraseIndex = 0;
            let charIndex = 0;
            let isDeleting = false;
            let typingSpeed = 100;

            const type = () => {
                const currentPhrase = phrases[phraseIndex];

                if (isDeleting) {
                    typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
                    charIndex--;
                    typingSpeed = 50;
                } else {
                    typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
                    charIndex++;
                    typingSpeed = 100;
                }

                if (!isDeleting && charIndex === currentPhrase.length) {
                    isDeleting = true;
                    typingSpeed = 2000; // Pause at end
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    typingSpeed = 200; // Pause before typing next
                }

                setTimeout(type, typingSpeed);
            };

            type();
        },

        // Skill Bar Animation
        initSkillBars: function() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const progressBar = entry.target;
                        const targetPercent = parseInt(progressBar.dataset.skill);
                        this.animateSkillBar(progressBar, targetPercent);
                        observer.unobserve(entry.target);
                    }
                });
            });

            this.elements.skillBars.forEach(bar => {
                observer.observe(bar);
            });
        },

        animateSkillBar: function(element, targetPercent) {
            let currentPercent = 0;
            const increment = targetPercent / 50; // Animate over 50 frames

            const animate = () => {
                currentPercent += increment;
                if (currentPercent >= targetPercent) {
                    currentPercent = targetPercent;
                    element.style.width = targetPercent + '%';
                } else {
                    element.style.width = currentPercent + '%';
                    requestAnimationFrame(animate);
                }
            };

            animate();
        },

        // Scroll Reveal Animation
        initScrollReveal: function() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // Observe all sections and cards
            document.querySelectorAll('.section, .glass-card, .portfolio-card').forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                observer.observe(element);
            });
        },

        // Smooth Scroll Setup
        setupSmoothScroll: function() {
            // Add smooth scrolling behavior
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        },

        // Progress Indicator
        setupProgressIndicator: function() {
            // Create progress indicator if needed
            const progressIndicator = document.createElement('div');
            progressIndicator.id = 'progress-indicator';
            progressIndicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 0%;
                height: 3px;
                background: linear-gradient(90deg, var(--accent-cyan), var(--accent-purple));
                z-index: 9999;
                transition: width 0.1s ease-out;
            `;
            document.body.appendChild(progressIndicator);
            this.elements.progressIndicator = progressIndicator;
        },

        updateScrollProgress: function() {
            if (!this.elements.progressIndicator) return;

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;

            this.elements.progressIndicator.style.width = scrollPercent + '%';
        },

        // Event Listeners
        setupEventListeners: function() {
            // Mouse Events
            document.addEventListener('mousemove', (e) => {
                this.updateMousePosition(e);
            });

            document.addEventListener('click', (e) => {
                if (!this.state.isTouchDevice) {
                    this.createRipple(e.clientX, e.clientY);
                }
            });

            // Touch Events for Mobile
            if (this.state.isTouchDevice) {
                document.addEventListener('touchmove', (e) => {
                    const touch = e.touches[0];
                    this.updateMousePosition({ clientX: touch.clientX, clientY: touch.clientY });
                }, { passive: true });
            }

            // Window Resize
            window.addEventListener('resize', () => {
                this.state.windowWidth = window.innerWidth;
                this.state.windowHeight = window.innerHeight;
                this.resizeCanvas();
                this.resetParticles();
            });

            // Scroll Events
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                this.state.isScrolling = true;

                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    this.state.isScrolling = false;
                }, 150);
            });

            // Keyboard Navigation Support
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.elements.cursor.style.display = 'none';
                    this.elements.cursorDot.style.display = 'none';
                }
            });

            document.addEventListener('focusin', () => {
                if (document.activeElement !== document.body) {
                    this.elements.cursor.style.display = 'none';
                    this.elements.cursorDot.style.display = 'none';
                }
            });

            document.addEventListener('focusout', () => {
                if (this.elements.cursor && this.elements.cursorDot) {
                    this.elements.cursor.style.display = 'block';
                    this.elements.cursorDot.style.display = 'block';
                }
            });
        },

        // Canvas Resize
        resizeCanvas: function() {
            if (this.elements.particleCanvas) {
                this.elements.particleCanvas.width = this.state.windowWidth;
                this.elements.particleCanvas.height = this.state.windowHeight;
                this.elements.particleCanvas.style.position = 'fixed';
                this.elements.particleCanvas.style.top = '0';
                this.elements.particleCanvas.style.left = '0';
                this.elements.particleCanvas.style.zIndex = '1';
                this.elements.particleCanvas.style.pointerEvents = 'none';
            }
        },

        // Reset Particles on Resize
        resetParticles: function() {
            this.state.particles = [];
            this.initParticles();
        },

        // Hide Native Cursor
        hideNativeCursor: function() {
            document.body.style.cursor = 'none';
        },

        // Show Native Cursor
        showNativeCursor: function() {
            document.body.style.cursor = 'auto';
        },

        // Utility Functions
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            LiquidGlass.init();
        });
    } else {
        LiquidGlass.init();
    }

    // Expose to global scope if needed for debugging
    window.LiquidGlass = LiquidGlass;

})();
