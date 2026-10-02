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
      if (targetId === '#' || this.hasAttribute('data-join-modal')) return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var offsetTop = target.offsetTop - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });

  // Join E-Cell → roles-full modal
  var joinModal = document.getElementById('joinModal');
  if (joinModal) {
    var joinModalClose = document.getElementById('joinModalClose');
    var joinModalOk = document.getElementById('joinModalOk');
    var joinModalContact = document.getElementById('joinModalContact');
    function openJoinModal(e) {
      if (e) e.preventDefault();
      joinModal.classList.add('active');
      joinModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeJoinModal() {
      joinModal.classList.remove('active');
      joinModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    document.querySelectorAll('[data-join-modal]').forEach(function(btn) {
      btn.addEventListener('click', openJoinModal);
    });
    joinModalClose.addEventListener('click', closeJoinModal);
    joinModalOk.addEventListener('click', closeJoinModal);
    joinModal.addEventListener('click', function(e) {
      if (e.target === joinModal) closeJoinModal();
    });
    if (joinModalContact) {
      joinModalContact.addEventListener('click', closeJoinModal);
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && joinModal.classList.contains('active')) {
        closeJoinModal();
      }
    });
  }


  // Contact modal — builds the mail with our address in the To field
  var CONTACT_EMAIL = 'vsbecell@gmail.com';
  var contactModal = document.getElementById('contactModal');
  if (contactModal) {
    var contactClose = document.getElementById('contactModalClose');
    var contactMailApp = document.getElementById('contactMailApp');
    var contactGmail = document.getElementById('contactGmail');
    var contactCopy = document.getElementById('contactCopy');
    var contactStatus = document.getElementById('contactStatus');
    var contactName = document.getElementById('contactName');
    var contactEmail = document.getElementById('contactEmail');
    var contactMessage = document.getElementById('contactMessage');

    function setContactStatus(msg) {
      contactStatus.textContent = msg || '';
    }

    function buildBody() {
      var lines = ['Hi E-Cell Team,', ''];
      if (contactName.value.trim()) lines.push('My name is: ' + contactName.value.trim());
      if (contactEmail.value.trim()) lines.push('My email is: ' + contactEmail.value.trim());
      if (lines.length === 2) lines.push('My name is:');
      lines.push('');
      lines.push(contactMessage.value.trim() || 'My query is:');
      lines.push('');
      lines.push('Thank you.');
      return lines.join('\n');
    }

    function syncLinks() {
      var subject = encodeURIComponent('Query for E-Cell VSBEC');
      var body = encodeURIComponent(buildBody());
      contactGmail.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' +
        encodeURIComponent(CONTACT_EMAIL) + '&su=' + subject + '&body=' + body;
      contactMailApp.dataset.mailto = 'mailto:' + encodeURIComponent(CONTACT_EMAIL) +
        '?subject=' + subject + '&body=' + body;
    }

    function openContactModal(e) {
      if (e) e.preventDefault();
      document.body.style.overflow = 'hidden';
      contactModal.classList.add('active');
      contactModal.setAttribute('aria-hidden', 'false');
      syncLinks();
      setContactStatus('');
      if (contactName) contactName.focus();
    }

    function closeContactModal() {
      contactModal.classList.remove('active');
      contactModal.setAttribute('aria-hidden', 'true');
      if (!joinModal || !joinModal.classList.contains('active')) {
        document.body.style.overflow = '';
      }
    }

    document.querySelectorAll('[data-contact-modal]').forEach(function(btn) {
      btn.addEventListener('click', openContactModal);
    });

    contactClose.addEventListener('click', closeContactModal);
    contactModal.addEventListener('click', function(e) {
      if (e.target === contactModal) closeContactModal();
    });

    [contactName, contactEmail, contactMessage].forEach(function(field) {
      field.addEventListener('input', syncLinks);
    });

    contactGmail.addEventListener('click', function() {
      setContactStatus('Opening Gmail in a new tab — press Send there.');
    });

    contactMailApp.addEventListener('click', function() {
      syncLinks();
      window.location.href = contactMailApp.dataset.mailto;
      setContactStatus('No mail app opened? Use OPEN IN BROWSER instead.');
    });

    contactCopy.addEventListener('click', function() {
      var fallback = function() {
        var temp = document.createElement('textarea');
        temp.value = CONTACT_EMAIL;
        temp.setAttribute('readonly', '');
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        try {
          document.execCommand('copy');
          setContactStatus('Copied ' + CONTACT_EMAIL + ' — paste it in your mail app.');
        } catch (err) {
          setContactStatus('Copy failed. Please email us at ' + CONTACT_EMAIL);
        }
        document.body.removeChild(temp);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(CONTACT_EMAIL).then(function() {
          setContactStatus('Copied ' + CONTACT_EMAIL + ' — paste it in your mail app.');
        })['catch'](fallback);
      } else {
        fallback();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && contactModal.classList.contains('active')) {
        closeContactModal();
      }
    });
  }


  // Resources "Explore" — coming soon modal
  var soonModal = document.getElementById('soonModal');
  if (soonModal) {
    var soonClose = document.getElementById('soonModalClose');
    var soonOk = document.getElementById('soonModalOk');
    var soonText = document.getElementById('soonModalText');
    var DEFAULT_SOON_TEXT = soonText ? soonText.innerHTML : '';

    function openSoonModal(e) {
      if (e) e.preventDefault();
      var card = e && e.currentTarget.closest('.resource-card');
      var title = card ? card.querySelector('.resource-card__title') : null;
      soonText.innerHTML = title
        ? '<strong>' + title.textContent.trim() + '</strong> resources are being compiled and will be live here soon.'
        : DEFAULT_SOON_TEXT;
      document.body.style.overflow = 'hidden';
      soonModal.classList.add('active');
      soonModal.setAttribute('aria-hidden', 'false');
    }

    function closeSoonModal() {
      soonModal.classList.remove('active');
      soonModal.setAttribute('aria-hidden', 'true');
      if (!joinModal || !joinModal.classList.contains('active')) {
        if (!contactModal || !contactModal.classList.contains('active')) {
          document.body.style.overflow = '';
        }
      }
    }

    document.querySelectorAll('[data-soon-modal]').forEach(function(btn) {
      btn.addEventListener('click', openSoonModal);
    });
    soonClose.addEventListener('click', closeSoonModal);
    soonOk.addEventListener('click', closeSoonModal);
    soonModal.addEventListener('click', function(e) {
      if (e.target === soonModal) closeSoonModal();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && soonModal.classList.contains('active')) {
        closeSoonModal();
      }
    });
  }


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
