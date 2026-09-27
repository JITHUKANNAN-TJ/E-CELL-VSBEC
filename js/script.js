(function() {
  'use strict';

  var navbar = document.getElementById('navbar');
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');
  var revealElements = document.querySelectorAll('.reveal');
  var staggerItems = document.querySelectorAll('.stagger-item');

  // Scroll-based navbar
  function handleScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Mobile Navigation Toggle
  function toggleMobileNav() {
    var isOpen = navMobile.classList.contains('active');
    navMobile.classList.toggle('active');
    navToggle.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', !isOpen);
    if (isOpen) {
      document.body.classList.remove('nav-open');
    } else {
      document.body.classList.add('nav-open');
    }
  }
  navToggle.addEventListener('click', toggleMobileNav);
  navMobile.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      navMobile.classList.remove('active');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    });
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navMobile.classList.contains('active')) {
      toggleMobileNav();
    }
  });

  // Active navigation link on scroll
  var sections = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('.nav__links a');
  function updateActiveNav() {
    var scrollPos = window.scrollY + 120;
    sections.forEach(function(section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navAnchors.forEach(function(a) {
          a.classList.remove('active');
          if (a.getAttribute('href') === '#' + id) {
            a.classList.add('active');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // Scroll Reveal Animation
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealElements.forEach(function(el) { revealObserver.observe(el); });

  // Stagger Item Animation
  var staggerObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var delay = entry.target.getAttribute('data-delay');
        var d = delay ? parseInt(delay, 10) * 0.15 : 0;
        setTimeout(function() {
          entry.target.classList.add('active');
        }, d * 1000);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  staggerItems.forEach(function(el) { staggerObserver.observe(el); });

  // Hero parallax effect
  var heroImage = document.querySelector('.eureka-hero__image');
  var heroSection = document.querySelector('.eureka-hero');
  if (heroImage && heroSection) {
    window.addEventListener('scroll', function() {
      var scrollY = window.scrollY;
      var heroHeight = heroSection.offsetHeight;
      if (scrollY < heroHeight) {
        heroImage.style.transform = 'translateY(' + (scrollY * 0.2) + 'px)';
        heroImage.style.opacity = String(Math.max(0.04, 0.06 - scrollY * 0.00004));
      }
    }, { passive: true });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var offsetTop = target.offsetTop - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });


  // Back to Top button
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Countdown to the workshop
  var countdown = document.getElementById('countdown');
  if (countdown) {
    // 14 Oct 2026, 09:00 IST
    var eventDate = new Date('2026-10-14T09:00:00+05:30').getTime();
    var pad = function(n) { return (n < 10 ? '0' : '') + n; };
    var tick = function() {
      var diff = eventDate - Date.now();
      if (diff <= 0) {
        countdown.classList.add('countdown--over');
        countdown.querySelectorAll('[data-countdown]').forEach(function(el) {
          el.textContent = '00';
        });
        return;
      }
      var secs = Math.floor(diff / 1000);
      var days = Math.floor(secs / 86400);
      var hours = Math.floor((secs % 86400) / 3600);
      var mins = Math.floor((secs % 3600) / 60);
      countdown.querySelector('[data-countdown="days"]').textContent = pad(days);
      countdown.querySelector('[data-countdown="hours"]').textContent = pad(hours);
      countdown.querySelector('[data-countdown="minutes"]').textContent = pad(mins);
      countdown.querySelector('[data-countdown="seconds"]').textContent = pad(secs % 60);
    };
    tick();
    setInterval(tick, 1000);
  }

})();
