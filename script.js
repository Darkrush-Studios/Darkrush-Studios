// Theme Toggle Functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference or default to 'dark-mode'
    const currentTheme = localStorage.getItem('theme') || 'dark-mode';
    
    // Apply saved theme on page load
    if (currentTheme === 'light-mode') {
        document.body.classList.add('light-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        document.body.classList.remove('light-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }

    // Toggle theme on button click (with small icon animation)
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLightMode = document.body.classList.toggle('light-mode');

            // Save preference
            localStorage.setItem('theme', isLightMode ? 'light-mode' : 'dark-mode');

            // Animate icon and swap
            themeIcon.style.transform = 'rotate(-20deg) scale(0.9)';
            setTimeout(() => {
                if (isLightMode) {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                } else {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                }
                themeIcon.style.transform = '';
            }, 180);
        });
    }
}

// Interactive Elements and Animations
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme toggle
    initThemeToggle();
    
    // Newsletter form handler
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[name="email"]').value;
            const btn = this.querySelector('.btn');
            const originalText = btn.textContent;
            
            btn.disabled = true;
            btn.textContent = 'Subscribing...';
            
            // Simulate subscription (in real scenario, send to backend)
            setTimeout(() => {
                btn.textContent = '✓ Subscribed!';
                this.reset();
                
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = originalText;
                }, 2000);
            }, 800);
        });
    }
    
    // ===== CAROUSEL AUTO-SCROLL PAUSE ON HOVER =====
    const carousel = document.getElementById('partnersCarousel');
    if (carousel) {
        // Pause animation on hover
        carousel.addEventListener('mouseenter', () => {
            carousel.style.animationPlayState = 'paused';
        });

        // Resume animation on mouse leave
        carousel.addEventListener('mouseleave', () => {
            carousel.style.animationPlayState = 'running';
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.service-card, .partner-card, .feature-card, .project-card, .stat-box').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Interactive button ripple effect
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            // Remove previous ripple if exists
            const oldRipple = this.querySelector('.ripple');
            if (oldRipple) oldRipple.remove();

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Interactive info items on contact page
    document.querySelectorAll('.info-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px) scale(1.02)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
        });
    });

    // FAQ accordion functionality
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', function() {
            const isActive = this.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
                i.style.maxHeight = 'none';
            });

            if (!isActive) {
                this.classList.add('active');
                this.style.maxHeight = this.scrollHeight + 50 + 'px';
            }
        });
    });

    // Form submission handler using Formspree
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('#submitBtn');
            const originalText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        });
    }

    // Parallax effect on hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrollY = window.pageYOffset;
            hero.style.backgroundPosition = `0 ${scrollY * 0.5}px`;
        });
    }

    // Nav link active state on scroll
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;

        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current page link
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelector(`a[href="${currentPage}"]`)?.classList.add('active');
    });

    // Hover effect on stat boxes
    document.querySelectorAll('.stat-box').forEach(box => {
        box.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.08)';
        });
        box.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Service card cursor tracking effect
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
});

// Add ripple CSS styles dynamically
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: rippleAnimation 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes rippleAnimation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .faq-item.active {
        border-left-color: #b8b8ff;
        background: rgba(138, 43, 226, 0.15) !important;
    }

    /* Smooth transition for all elements */
    * {
        transition: color 0.3s ease, background 0.3s ease;
    }
`;
document.head.appendChild(style);

// Cursor glow effect (optional enhancement)
document.addEventListener('mousemove', function(e) {
    const x = e.clientX;
    const y = e.clientY;

    // Create a subtle glow effect on elements near cursor
    document.querySelectorAll('.service-card').forEach(el => {
        const rect = el.getBoundingClientRect();
        const distance = Math.sqrt(
            Math.pow(x - (rect.left + rect.width / 2), 2) +
            Math.pow(y - (rect.top + rect.height / 2), 2)
        );

        if (distance < 200) {
            const intensity = (200 - distance) / 200;
            el.style.boxShadow = `0 0 ${30 + intensity * 30}px rgba(138, 43, 226, ${0.1 + intensity * 0.3})`;
        } else {
            el.style.boxShadow = '0 0 20px rgba(138, 43, 226, 0.1)';
        }
    });
});