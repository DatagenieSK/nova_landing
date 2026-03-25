// Preloader Logic
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  
  // Wait 2.2 seconds to allow the shooting star and text reveal to finish beautifully
  setTimeout(() => {
    loader.classList.add('fade-out');
    
    // Remove it from the DOM completely after the CSS fade transition finishes
    setTimeout(() => {
      loader.style.display = 'none';
    }, 800); 
  }, 2200);
});

// Scroll Reveal Logic (Intersection Observer)
document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });
  
  reveals.forEach(reveal => {
    observer.observe(reveal);
  });
});

// Mobile Menu Toggle Logic
document.addEventListener("DOMContentLoaded", () => {
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Toggle menu on button click
  mobileBtn.addEventListener('click', () => {
    mobileBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    // Prevent scrolling on the body when menu is open
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
  });

  // Close menu when a link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  });
});