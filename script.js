// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

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

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(15, 15, 15, 0.98)';
    } else {
        navbar.style.background = 'rgba(15, 15, 15, 0.95)';
    }
});

// Form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        const submitBtn = contactForm.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.textContent = 'Message Sent!';
            submitBtn.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = 'linear-gradient(135deg, var(--primary-purple) 0%, var(--dark-purple) 100%)';
                contactForm.reset();
            }, 2000);
        }, 1500);
    });
}

// Copy to clipboard function for server IP
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        // Show success feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#10B981';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'var(--primary-purple)';
        }, 2000);
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service-card, .portfolio-item, .team-member').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Button hover effects
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Dynamic floating blocks animation
const blocks = document.querySelectorAll('.block');
blocks.forEach((block, index) => {
    block.addEventListener('mouseenter', () => {
        block.style.animationPlayState = 'paused';
        block.style.transform = 'scale(1.1) rotate(10deg)';
    });
    
    block.addEventListener('mouseleave', () => {
        block.style.animationPlayState = 'running';
        block.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Scroll indicator functionality
const scrollIndicator = document.querySelector('.scroll-indicator');
scrollIndicator.addEventListener('click', () => {
    document.querySelector('#services').scrollIntoView({
        behavior: 'smooth'
    });
});

// Hide scroll indicator when scrolled
window.addEventListener('scroll', () => {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (window.scrollY > 100) {
        scrollIndicator.style.opacity = '0';
    } else {
        scrollIndicator.style.opacity = '1';
    }
});

// Portfolio item hover effects
document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        const image = this.querySelector('.portfolio-image');
        image.style.transform = 'scale(1.05)';
    });
    
    item.addEventListener('mouseleave', function() {
        const image = this.querySelector('.portfolio-image');
        image.style.transform = 'scale(1)';
    });
});

// Service card tilt effect
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});