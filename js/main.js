(function () {
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const contract = "4pcAtLZuswYExm5HEkwLyP8E3jWnk38Njufxih4rpump";

  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector("#nav-links");
  toggle.addEventListener("click", function () {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  const toast = document.querySelector(".toast");
  let toastTimer = 0;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 1600);
  }

  document.querySelectorAll(".copy-ca").forEach(function (button) {
    button.addEventListener("click", function () {
      const done = function () { showToast("Contract copied"); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(contract).then(done).catch(function () {
          fallbackCopy();
          done();
        });
      } else {
        fallbackCopy();
        done();
      }
    });
  });

  function fallbackCopy() {
    const field = document.createElement("textarea");
    field.value = contract;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-999px";
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }

  document.querySelectorAll(".spot, .social, .token-card").forEach(function (card) {
    card.addEventListener("mousemove", function (event) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", event.clientX - rect.left + "px");
      card.style.setProperty("--my", event.clientY - rect.top + "px");
    });
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    const seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          seen.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    document.querySelectorAll(".reveal").forEach(function (el) { seen.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  const dialog = document.querySelector("#lightbox");
  const shot = dialog.querySelector("img");
  const caption = dialog.querySelector("figcaption");
  document.querySelectorAll(".frame-grid-3 .frame").forEach(function (button) {
    button.addEventListener("click", function () {
      shot.src = button.getAttribute("data-full");
      shot.alt = button.getAttribute("data-cap");
      caption.textContent = button.getAttribute("data-cap");
      dialog.showModal();
    });
  });
  dialog.querySelector(".lightbox-close").addEventListener("click", function () {
    dialog.close();
  });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  if (!finePointer || reduceMotion) return;

  document.body.classList.add("magic-cursor");
  const ring = document.querySelector(".cursor-ring");
  const dot = document.querySelector(".cursor-dot");
  const glow = document.querySelector(".glow-follow");
  const canvas = document.querySelector("#dust");
  const ctx = canvas.getContext("2d");
  const mouse = { x: -9999, y: -9999, on: false };
  const motes = [];
  const sparks = [];
  let width = 0;
  let height = 0;
  let ringX = 0;
  let ringY = 0;
  let aimX = 0;
  let aimY = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    motes.length = 0;
    const count = Math.max(36, Math.min(80, Math.floor((width * height) / 22000)));
    for (let i = 0; i < count; i += 1) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.4,
        v: Math.random() * 0.28 + 0.05,
        wobble: Math.random() * Math.PI * 2
      });
    }
  }

  function burst(x, y) {
    for (let i = 0; i < 18; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.4 + 0.4;
      sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        r: Math.random() * 2.2 + 0.6
      });
    }
  }

  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("mousemove", function (event) {
    aimX = event.clientX;
    aimY = event.clientY;
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.on = true;
    dot.style.transform = "translate(" + aimX + "px," + aimY + "px)";
    glow.style.transform = "translate(" + aimX + "px," + aimY + "px)";
    const hot = event.target.closest("a, button");
    document.body.classList.toggle("cursor-hot", Boolean(hot));
    if (Math.hypot(event.movementX, event.movementY) > 6 && sparks.length < 80) {
      sparks.push({
        x: event.clientX,
        y: event.clientY,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -Math.random() * 0.8 - 0.2,
        life: 0.8,
        r: Math.random() * 1.6 + 0.4
      });
    }
  });

  window.addEventListener("mousedown", function (event) {
    burst(event.clientX, event.clientY);
  });

  window.addEventListener("mouseleave", function () {
    mouse.on = false;
  });

  function paint() {
    ringX += (aimX - ringX) * 0.18;
    ringY += (aimY - ringY) * 0.18;
    ring.style.transform = "translate(" + ringX + "px," + ringY + "px)";

    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < motes.length; i += 1) {
      const mote = motes[i];
      mote.y -= mote.v;
      mote.wobble += 0.01;
      mote.x += Math.sin(mote.wobble) * 0.2;
      if (mote.y < -6) {
        mote.y = height + 6;
        mote.x = Math.random() * width;
      }
      if (mouse.on) {
        const dx = mote.x - mouse.x;
        const dy = mote.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 150 && dist > 0) {
          mote.x += (dx / dist) * 0.45;
          mote.y += (dy / dist) * 0.45;
        }
      }
      ctx.beginPath();
      ctx.fillStyle = "rgba(0, 150, 96, 0.55)";
      ctx.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (mouse.on) {
      const near = [];
      for (let i = 0; i < motes.length; i += 1) {
        if (Math.hypot(motes[i].x - mouse.x, motes[i].y - mouse.y) < 170) near.push(motes[i]);
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < near.length; i += 1) {
        for (let j = i + 1; j < near.length; j += 1) {
          const d = Math.hypot(near[i].x - near[j].x, near[i].y - near[j].y);
          if (d < 110) {
            ctx.strokeStyle = "rgba(0, 150, 96," + ((1 - d / 110) * 0.4) + ")";
            ctx.beginPath();
            ctx.moveTo(near[i].x, near[i].y);
            ctx.lineTo(near[j].x, near[j].y);
            ctx.stroke();
          }
        }
      }
    }

    for (let i = sparks.length - 1; i >= 0; i -= 1) {
      const spark = sparks[i];
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy -= 0.015;
      spark.life -= 0.02;
      if (spark.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.fillStyle = "rgba(0, 168, 106," + spark.life + ")";
      ctx.arc(spark.x, spark.y, spark.r * spark.life, 0, Math.PI * 2);
      ctx.fill();
    }

    window.requestAnimationFrame(paint);
  }

  window.requestAnimationFrame(paint);
})();
