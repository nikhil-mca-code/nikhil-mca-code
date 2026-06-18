 // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Typed JSON terminal effect
    const terminalBody = document.getElementById('terminalBody');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finalHTML = `
    <div class="terminal-line"><span class="prompt">$</span><span class="cmd">curl https://api.nikhil.dev/about</span></div>
    <div class="terminal-line" style="margin-top:14px;"><span class="term-punct">{</span></div>
    <div class="terminal-line" style="padding-left:20px;"><span class="term-key">"name"</span><span class="term-punct">:</span> <span class="term-string">"Nikhil Singh"</span><span class="term-punct">,</span></div>
    <div class="terminal-line" style="padding-left:20px;"><span class="term-key">"role"</span><span class="term-punct">:</span> <span class="term-string">"Full-Stack Developer"</span><span class="term-punct">,</span></div>
    <div class="terminal-line" style="padding-left:20px;"><span class="term-key">"location"</span><span class="term-punct">:</span> <span class="term-string">"Gorakhpur, India"</span><span class="term-punct">,</span></div>
    <div class="terminal-line" style="padding-left:20px;"><span class="term-key">"stack"</span><span class="term-punct">:</span> <span class="term-punct">[</span><span class="term-string">"Node.js"</span><span class="term-punct">,</span> <span class="term-string">"Express"</span><span class="term-punct">,</span> <span class="term-string">"MongoDB"</span><span class="term-punct">]</span><span class="term-punct">,</span></div>
    <div class="terminal-line" style="padding-left:20px;"><span class="term-key">"currentProject"</span><span class="term-punct">:</span> <span class="term-string">"Class Orbit"</span><span class="term-punct">,</span></div>
    <div class="terminal-line" style="padding-left:20px;"><span class="term-key">"founder"</span><span class="term-punct">:</span> <span class="term-string">"Gorakhpur Web Studio"</span><span class="term-punct">,</span></div>
    <div class="terminal-line" style="padding-left:20px;"><span class="term-key">"openToInternships"</span><span class="term-punct">:</span> <span class="term-bool">true</span></div>
    <div class="terminal-line"><span class="term-punct">}</span></div>
    <div class="status-line"><span class="status-pill">200 OK</span><span class="term-comment">response time: 42ms</span></div>
  `;

    if (reduceMotion) {
      terminalBody.innerHTML = finalHTML;
    } else {
      // Type out line by line for performance & simplicity
      const lines = [
        '<div class="terminal-line"><span class="prompt">$</span><span class="cmd">curl https://api.nikhil.dev/about</span></div>',
        '<div class="terminal-line" style="margin-top:14px;"><span class="term-punct">{</span></div>',
        '<div class="terminal-line" style="padding-left:20px;"><span class="term-key">"name"</span><span class="term-punct">:</span> <span class="term-string">"Nikhil Singh"</span><span class="term-punct">,</span></div>',
        '<div class="terminal-line" style="padding-left:20px;"><span class="term-key">"role"</span><span class="term-punct">:</span> <span class="term-string">"Full-Stack Developer"</span><span class="term-punct">,</span></div>',
        '<div class="terminal-line" style="padding-left:20px;"><span class="term-key">"location"</span><span class="term-punct">:</span> <span class="term-string">"Gorakhpur, India"</span><span class="term-punct">,</span></div>',
        '<div class="terminal-line" style="padding-left:20px;"><span class="term-key">"stack"</span><span class="term-punct">:</span> <span class="term-punct">[</span><span class="term-string">"Node.js"</span><span class="term-punct">,</span> <span class="term-string">"Express"</span><span class="term-punct">,</span> <span class="term-string">"MongoDB"</span><span class="term-punct">]</span><span class="term-punct">,</span></div>',
        '<div class="terminal-line" style="padding-left:20px;"><span class="term-key">"currentProject"</span><span class="term-punct">:</span> <span class="term-string">"Class Orbit"</span><span class="term-punct">,</span></div>',
        '<div class="terminal-line" style="padding-left:20px;"><span class="term-key">"founder"</span><span class="term-punct">:</span> <span class="term-string">"Gorakhpur Web Studio"</span><span class="term-punct">,</span></div>',
        '<div class="terminal-line" style="padding-left:20px;"><span class="term-key">"openToInternships"</span><span class="term-punct">:</span> <span class="term-bool">true</span></div>',
        '<div class="terminal-line"><span class="term-punct">}</span></div>',
        '<div class="status-line"><span class="status-pill">200 OK</span><span class="term-comment">response time: 42ms</span></div>'
      ];

      let i = 0;
      const cursor = document.createElement('span');
      cursor.className = 'cursor';

      function addLine() {
        if (i < lines.length) {
          // remove previous cursor
          const prevCursor = terminalBody.querySelector('.cursor');
          if (prevCursor) prevCursor.remove();

          const temp = document.createElement('div');
          temp.innerHTML = lines[i];
          const el = temp.firstChild;
          el.appendChild(cursor.cloneNode());
          terminalBody.appendChild(el);
          i++;
          setTimeout(addLine, i === 1 ? 280 : 90);
        } else {
          const prevCursor = terminalBody.querySelector('.cursor');
          if (prevCursor) prevCursor.remove();
        }
      }
      setTimeout(addLine, 400);
    }

    // Scroll-reveal for sections
    if (!reduceMotion && 'IntersectionObserver' in window) {
      const revealEls = document.querySelectorAll('section');
      revealEls.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity .6s ease, transform .6s ease';
      });
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      revealEls.forEach(el => obs.observe(el));
      // First section (hero) reveals immediately
      revealEls[0].style.opacity = '1';
      revealEls[0].style.transform = 'translateY(0)';
    }