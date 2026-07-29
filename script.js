document.documentElement.classList.add('js');

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const terminalBody = document.getElementById('terminalBody');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealTargets = document.querySelectorAll('[data-reveal]');

function setNavState(isOpen) {
  navLinks.dataset.open = String(isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
}

function closeNav() {
  setNavState(false);
}

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.dataset.open === 'true';
  setNavState(!isOpen);
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeNav);
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
  if (event.key === 'Escape') {
    closeNav();
    navToggle.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 860) {
    closeNav();
  }
});

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

if (prefersReducedMotionQuery.addEventListener) {
  prefersReducedMotionQuery.addEventListener('change', () => {
    window.location.reload();
  });
}
