// --- 1. PRELOADER LOGIC ---
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('fade-out');
    setTimeout(() => { loader.style.display = 'none'; }, 800); 
  }, 2200);
});

// --- 2. SCROLL REVEAL LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(reveal => observer.observe(reveal));
});

// --- 3. MOBILE MENU LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  mobileBtn.addEventListener('click', () => {
    mobileBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  });
});

// --- 4. DYNAMIC TYPEWRITER EFFECT ---
document.addEventListener("DOMContentLoaded", () => {
  const textElement = document.getElementById("typewriter");
  const words = ["Event Operations.", "VIP Logistics.", "Secure Entry.", "Live Analytics."];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
      textElement.innerText = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      textElement.innerText = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
      typeSpeed = 2000; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 500; // Pause before new word
    }
    setTimeout(type, typeSpeed);
  }
  
  // Start typing after preloader finishes
  setTimeout(type, 2800);
});

// --- 5. CUSTOM TRAILING CURSOR ---
document.addEventListener("DOMContentLoaded", () => {
  const dot = document.querySelector(".cursor-dot");
  const outline = document.querySelector(".cursor-outline");
  
  // Only run if desktop device (detects fine pointer)
  if(window.matchMedia("(pointer: fine)").matches) {
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Instant snap for the inner dot
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    });

    // Request animation frame for smooth trailing outline
    function animateCursor() {
      let distX = mouseX - outlineX;
      let distY = mouseY - outlineY;
      outlineX += distX * 0.15; // The easing speed
      outlineY += distY * 0.15;
      outline.style.left = `${outlineX}px`;
      outline.style.top = `${outlineY}px`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on clickable items
    const clickables = document.querySelectorAll('a, button, .gallery-item, .3d-card');
    clickables.forEach(el => {
      el.addEventListener('mouseenter', () => outline.classList.add('hover-active'));
      el.addEventListener('mouseleave', () => outline.classList.remove('hover-active'));
    });
  }
});

// --- 6. 3D MAGNETIC HOVER CARDS ---
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll('.3d-card');
  
  // Only apply 3D physics on desktop to prevent glitching on mobile scroll
  if(window.matchMedia("(pointer: fine)").matches) {
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -8; // Max rotation 8deg
        const rotateY = ((x - centerX) / centerX) * 8;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        card.style.transition = `none`; // Remove CSS transition to follow mouse instantly
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) translateY(0)`;
        card.style.transition = `transform 0.5s ease, box-shadow 0.3s ease`; // Snap back smoothly
      });
    });
  }
});