document.documentElement.classList.add('js');

// Navigation
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const terminalBody = document.getElementById('terminalBody');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealTargets = document.querySelectorAll('[data-reveal]');
const sectionNavLinks = Array.from(navLinks.querySelectorAll('a[href^="#"]'));
const sectionTargets = sectionNavLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
let lockedScrollbarWidth = 0;
let activeSyncFrame = 0;
let activeSectionId = '';
const projectCarousel = document.querySelector('[data-project-carousel]');

// Mobile menu
function lockBodyScroll() {
  lockedScrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);

  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  if (lockedScrollbarWidth > 0) {
    document.body.style.paddingRight = `${lockedScrollbarWidth}px`;
  }
}

function unlockBodyScroll() {
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  document.body.style.paddingRight = '';
}

function setNavState(isOpen) {
  navLinks.dataset.open = String(isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));

  if (isOpen && window.innerWidth <= 1024) {
    lockBodyScroll();
  } else {
    unlockBodyScroll();
  }
}

function closeNav() {
  if (navLinks.dataset.open !== 'true') {
    return;
  }

  setNavState(false);
}

function getMenuLinks() {
  return Array.from(navLinks.querySelectorAll('a'));
}

function setActiveNavLink(id) {
  if (activeSectionId === id) {
    return;
  }

  activeSectionId = id;

  sectionNavLinks.forEach((link) => {
    if (link.getAttribute('href') === `#${id}`) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function syncActiveNavLink() {
  if (!sectionTargets.length) {
    return;
  }

  const headerOffset = (document.querySelector('.site-header')?.offsetHeight || 76) + 24;
  let currentSection = '';

  sectionTargets.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= headerOffset && rect.bottom > headerOffset) {
      currentSection = section.id;
    }
  });

  if (!currentSection && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
    currentSection = sectionTargets[sectionTargets.length - 1].id;
  }

  setActiveNavLink(currentSection);
}

function queueActiveNavSync() {
  if (activeSyncFrame) {
    return;
  }

  activeSyncFrame = window.requestAnimationFrame(() => {
    activeSyncFrame = 0;
    syncActiveNavLink();
  });
}

// Accessibility
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.dataset.open === 'true';
  setNavState(!isOpen);

  if (!isOpen) {
    const [firstLink] = getMenuLinks();
    if (firstLink) {
      window.requestAnimationFrame(() => firstLink.focus());
    }
  }
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    closeNav();

    const href = link.getAttribute('href') || '';
    if (href.startsWith('#')) {
      const targetId = href.slice(1);
      if (targetId) {
        setActiveNavLink(targetId);
      }
    }
  });
});

document.addEventListener('click', (event) => {
  const isOpen = navLinks.dataset.open === 'true';
  if (!isOpen) {
    return;
  }

  if (!navToggle.contains(event.target) && !navLinks.contains(event.target)) {
    closeNav();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab' && navLinks.dataset.open === 'true') {
    const links = getMenuLinks();

    if (links.length) {
      const firstLink = links[0];
      const lastLink = links[links.length - 1];

      if (event.shiftKey && document.activeElement === firstLink) {
        event.preventDefault();
        lastLink.focus();
      } else if (!event.shiftKey && document.activeElement === lastLink) {
        event.preventDefault();
        firstLink.focus();
      }
    }
  }

  if (event.key === 'Escape') {
    closeNav();
    navToggle.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1024) {
    closeNav();
  }

  queueActiveNavSync();
});

window.addEventListener('scroll', queueActiveNavSync, { passive: true });
window.addEventListener('load', queueActiveNavSync);

if ('IntersectionObserver' in window && sectionTargets.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNavLink(entry.target.id);
      }
    });
  }, {
    rootMargin: '-35% 0px -50% 0px',
    threshold: 0.2,
  });

  sectionTargets.forEach((section) => sectionObserver.observe(section));
} else {
  queueActiveNavSync();
}

// Projects carousel
if (projectCarousel) {
  const projectViewport = document.getElementById('projectCarousel');
  const projectSlides = Array.from(projectViewport.querySelectorAll('[data-carousel-slide]'));
  const projectPrevButton = projectCarousel.querySelector('[data-carousel-prev]');
  const projectNextButton = projectCarousel.querySelector('[data-carousel-next]');
  const projectDots = projectCarousel.querySelector('[data-carousel-dots]');
  const projectState = {
    activeIndex: 0,
    rafId: 0,
    dragging: null,
    suppressClick: false,
  };

  function clampProjectIndex(index) {
    return Math.min(Math.max(index, 0), projectSlides.length - 1);
  }

  function buildProjectDots() {
    projectDots.innerHTML = '';

    projectSlides.forEach((slide, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Go to project ${index + 1} of ${projectSlides.length}`);
      dot.addEventListener('click', () => scrollToProject(index));
      projectDots.appendChild(dot);
    });
  }

  function setProjectState(index) {
    const nextIndex = clampProjectIndex(index);
    projectState.activeIndex = nextIndex;

    projectSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === nextIndex);
    });

    Array.from(projectDots.children).forEach((dot, dotIndex) => {
      if (dotIndex === nextIndex) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });

    projectPrevButton.disabled = nextIndex === 0;
    projectNextButton.disabled = nextIndex === projectSlides.length - 1;
  }

  function getProjectTargetLeft(index) {
    return projectSlides[clampProjectIndex(index)]?.offsetLeft || 0;
  }

  function scrollToProject(index, behavior = reduceMotion ? 'auto' : 'smooth') {
    const nextIndex = clampProjectIndex(index);
    projectViewport.scrollTo({
      left: getProjectTargetLeft(nextIndex),
      behavior,
    });
    setProjectState(nextIndex);
  }

  function getClosestProjectIndex() {
    const viewportCenter = projectViewport.scrollLeft + projectViewport.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    projectSlides.forEach((slide, index) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(slideCenter - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  function syncProjectState() {
    setProjectState(getClosestProjectIndex());
  }

  function queueProjectSync() {
    if (projectState.rafId) {
      return;
    }

    projectState.rafId = window.requestAnimationFrame(() => {
      projectState.rafId = 0;
      syncProjectState();
    });
  }

  function endProjectDrag() {
    if (!projectState.dragging) {
      return;
    }

    const shouldSnap = projectState.dragging.isHorizontal;
    const pointerId = projectState.dragging.pointerId;
    projectState.dragging = null;
    projectViewport.classList.remove('is-dragging');

    try {
      projectViewport.releasePointerCapture(pointerId);
    } catch {
      // Pointer capture may already be released.
    }

    if (shouldSnap) {
      scrollToProject(getClosestProjectIndex());
    }

    window.setTimeout(() => {
      projectState.suppressClick = false;
    }, 0);
  }

  buildProjectDots();
  syncProjectState();

  projectPrevButton.addEventListener('click', () => {
    scrollToProject(projectState.activeIndex - 1);
  });

  projectNextButton.addEventListener('click', () => {
    scrollToProject(projectState.activeIndex + 1);
  });

  projectViewport.addEventListener('scroll', queueProjectSync, { passive: true });

  projectViewport.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();

    if (event.key === 'ArrowLeft') {
      scrollToProject(projectState.activeIndex - 1);
    } else {
      scrollToProject(projectState.activeIndex + 1);
    }
  });

  projectViewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 && event.pointerType === 'mouse') {
      return;
    }

    projectState.suppressClick = false;
    projectState.dragging = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: projectViewport.scrollLeft,
      isHorizontal: false,
    };

    try {
      projectViewport.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is best effort.
    }
  });

  projectViewport.addEventListener('pointermove', (event) => {
    if (!projectState.dragging || event.pointerId !== projectState.dragging.pointerId) {
      return;
    }

    const deltaX = event.clientX - projectState.dragging.startX;
    const deltaY = event.clientY - projectState.dragging.startY;

    if (!projectState.dragging.isHorizontal) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) {
        return;
      }

      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        projectState.dragging = null;
        return;
      }

      projectState.dragging.isHorizontal = true;
      projectViewport.classList.add('is-dragging');
    }

    event.preventDefault();
    projectState.suppressClick = true;
    projectViewport.scrollLeft = projectState.dragging.startScrollLeft - deltaX;
    queueProjectSync();
  });

  projectViewport.addEventListener('pointerup', endProjectDrag);
  projectViewport.addEventListener('pointercancel', endProjectDrag);

  projectViewport.addEventListener('click', (event) => {
    if (!projectState.suppressClick) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    projectState.suppressClick = false;
  }, true);

  window.addEventListener('resize', () => {
    scrollToProject(projectState.activeIndex, 'auto');
    queueProjectSync();
  });

  window.addEventListener('load', () => {
    scrollToProject(projectState.activeIndex, 'auto');
  });
}

// Animations
const terminalLines = [
  '<div class="terminal-line"><span class="prompt">$</span><span class="cmd">curl https://api.nikhil.dev/about</span></div>',
  '<div class="terminal-line"><span class="term-punct">{</span></div>',
  '<div class="terminal-line"><span class="term-key">"name"</span><span class="term-punct">:</span> <span class="term-string">"Nikhil Singh"</span><span class="term-punct">,</span></div>',
  '<div class="terminal-line"><span class="term-key">"role"</span><span class="term-punct">:</span> <span class="term-string">"Full-Stack Developer"</span><span class="term-punct">,</span></div>',
  '<div class="terminal-line"><span class="term-key">"location"</span><span class="term-punct">:</span> <span class="term-string">"Gorakhpur, India"</span><span class="term-punct">,</span></div>',
  '<div class="terminal-line"><span class="term-key">"stack"</span><span class="term-punct">:</span> <span class="term-punct">[</span><span class="term-string">"Node.js"</span><span class="term-punct">,</span> <span class="term-string">"Express"</span><span class="term-punct">,</span> <span class="term-string">"MongoDB"</span><span class="term-punct">]</span><span class="term-punct">,</span></div>',
  '<div class="terminal-line"><span class="term-key">"currentProject"</span><span class="term-punct">:</span> <span class="term-string">"Class Orbit"</span><span class="term-punct">,</span></div>',
  '<div class="terminal-line"><span class="term-key">"founder"</span><span class="term-punct">:</span> <span class="term-string">"Gorakhpur Web Studio"</span><span class="term-punct">,</span></div>',
  '<div class="terminal-line"><span class="term-key">"openToInternships"</span><span class="term-punct">:</span> <span class="term-bool">true</span></div>',
  '<div class="terminal-line"><span class="term-punct">}</span></div>',
  '<div class="status-line"><span class="status-pill">200 OK</span><span class="term-comment">response time: 42ms</span></div>',
];

function renderTerminal() {
  if (!terminalBody) {
    return;
  }

  terminalBody.innerHTML = '';

  if (reduceMotion) {
    terminalBody.innerHTML = terminalLines.join('');
    return;
  }

  let index = 0;
  const cursor = document.createElement('span');
  cursor.className = 'cursor';

  const addNextLine = () => {
    if (index >= terminalLines.length) {
      const existingCursor = terminalBody.querySelector('.cursor');
      if (existingCursor) {
        existingCursor.remove();
      }
      return;
    }

    const existingCursor = terminalBody.querySelector('.cursor');
    if (existingCursor) {
      existingCursor.remove();
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = terminalLines[index];
    const line = wrapper.firstElementChild;

    if (line) {
      line.appendChild(cursor.cloneNode());
      terminalBody.appendChild(line);
    }

    index += 1;
    window.setTimeout(addNextLine, index === 1 ? 260 : 90);
  };

  window.setTimeout(addNextLine, 260);
}

// Scroll effects
function revealSections() {
  if (!revealTargets.length) {
    return;
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((section) => section.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach((section, index) => {
    if (index === 0) {
      section.classList.add('is-visible');
      return;
    }

    observer.observe(section);
  });
}

renderTerminal();
revealSections();

// Utilities
if (prefersReducedMotionQuery.addEventListener) {
  prefersReducedMotionQuery.addEventListener('change', () => {
    window.location.reload();
  });
}
