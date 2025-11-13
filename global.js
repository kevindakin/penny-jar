// GLOBAL VARIABLES
const durationFast = 0.4;
const durationBase = 0.7;
const durationSlow = 1.2;
const easeBase = "power4.inOut";

// GENERAL

function lenisScroll() {
  (lenis = new Lenis({
    lerp: 0.12,
  })),
    lenis.on("scroll", ScrollTrigger.update),
    gsap.ticker.add((e) => {
      lenis.raf(1e3 * e);
    }),
    gsap.ticker.lagSmoothing(0);
}

function disableScrolling() {
  document.body.classList.add("no-scroll");
}

function enableScrolling() {
  document.body.classList.remove("no-scroll");
}

function isMenuOpen() {
  const menu = document.querySelector(".nav_menu");
  return menu && menu.getAttribute("aria-hidden") === "false";
}

function copyright() {
  const copyrightDate = document.querySelector(
    '[data-element="copyright-date"]'
  );

  if (copyrightDate) {
    const currentYear = new Date().getFullYear();
    copyrightDate.textContent = currentYear;
  }
}

// LOAD ANIMATION

function splitText({
  target,
  type = "lines, words",
  mask = "lines",
  linesClass = "line",
}) {
  const element = target.querySelector("h1, h2, h3, h4, h5, h6, p") || target;
  const split = new SplitText(element, { type, mask, linesClass });
  const parts = {
    lines: split.lines,
    words: split.words,
    chars: split.chars,
  };
  gsap.set(target, { visibility: "visible" });
  return { split, ...parts };
}

function loader() {
  const transition = document.querySelector(".transition_wrap");
  const blocks = transition
    ? transition.querySelectorAll(".transition_block")
    : null;
  const nav = document.querySelector('[data-menu="nav"]');
  const heading = document.querySelector('[data-load="heading"]');
  const description = document.querySelector('[data-load="description"]');
  const fades = Array.from(document.querySelectorAll('[data-load="fade"]'));

  const hasBlocks = blocks && blocks.length > 0;

  const navDelay = hasBlocks ? 0.6 : 0.1;
  const headingDelay = hasBlocks ? 0.5 : 0;
  const descriptionDelay = hasBlocks ? 0.9 : 0.4;
  const fadesDelay = hasBlocks ? 1.1 : 0.6;

  gsap.set(description, { opacity: 0 });

  const headingSplit = heading ? splitText({ target: heading }) : null;
  const descriptionSplit = description
    ? splitText({ target: description, type: "lines" })
    : null;

  if (headingSplit?.words?.length) {
    gsap.set(headingSplit.words, { yPercent: 110 });
  }

  if (descriptionSplit?.lines?.length) {
    gsap.set(descriptionSplit.lines, { yPercent: 100 });
  }

  const tl = gsap.timeline({
    defaults: { duration: durationSlow, ease: easeBase },
    onComplete: () => {
      ScrollTrigger.refresh();
      if (transition) {
        transition.style.display = "none";
        blocks.forEach((block) => {
          block.style.backgroundColor = "var(--swatch--light)";
        });
      }
    },
  });

  if (hasBlocks) {
    tl.to(
      blocks,
      {
        opacity: 0,
        duration: 0.001,
        ease: "none",
        stagger: {
          amount: 0.7,
          from: "random",
        },
      },
      0.1
    );
  }

  if (nav) {
    tl.to(nav, { opacity: 1 }, navDelay);
  }

  if (headingSplit?.words?.length) {
    tl.to(headingSplit.words, { yPercent: 0, stagger: 0.08 }, headingDelay);
  }

  if (description) {
    tl.to(description, { opacity: 1, duration: 1 }, descriptionDelay);
  }

  if (descriptionSplit?.lines?.length) {
    tl.to(
      descriptionSplit.lines,
      { yPercent: 0, stagger: 0.1 },
      descriptionDelay
    );
  }

  if (fades.length) {
    tl.to(fades, { opacity: 1, stagger: 0.1, duration: 1.5 }, fadesDelay);
  }
}

function pageTransition() {
  const links = document.querySelectorAll(
    'a[href]:not([href^="#"]):not([href^="http"]):not([href^="mailto:"]):not([href^="tel:"]):not([target="_blank"])'
  );
  let isTransitioning = false;

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      if (isTransitioning) return;

      const transition = document.querySelector(".transition_wrap");
      if (!transition) return;

      // Check if the URL contains pagination parameters
      const url = this.href;
      const urlObj = new URL(url, window.location.origin);
      const hasPageParam = Array.from(urlObj.searchParams.keys()).some(
        (key) => key.includes("_page") || key === "page"
      );

      // Skip transition for pagination URLs
      if (hasPageParam) return;

      const blocks = transition.querySelectorAll(".transition_block");

      e.preventDefault();
      isTransitioning = true;

      transition.style.display = "grid";

      gsap.to(blocks, {
        opacity: 1,
        duration: 0.001,
        ease: "none",
        stagger: {
          amount: 0.7,
          from: "random",
        },
        onComplete: () => {
          window.location = url;
        },
      });
    });
  });
}

function scrollIndicator() {
  const scroll = document.querySelector(".hero_home_scroll");
  if (!scroll) return;

  gsap.to(scroll, {
    y: 8,
    repeat: -1,
    yoyo: true,
    duration: 0.8,
    ease: "power1.inOut",
  });
}

// SCROLL ANIMATIONS

function createSplitText(target, type = "lines", options = {}) {
  const element = target.querySelector("h1, h2, h3, h4, h5, h6, p") || target;

  const split = new SplitText(element, {
    type,
    mask: "lines",
    linesClass: "line",
    autoSplit: true,
    deepSplit: true,
    reduceWhiteSpace: false,
    preserveWhitespace: false,
    ...options,
  });

  return {
    split,
    lines: split.lines,
    words: split.words,
    chars: split.chars,
  };
}

function wordsScroll() {
  const headings = document.querySelectorAll('[data-scroll="words"]');
  if (!headings.length) return;

  headings.forEach((heading) => {
    const { words } = createSplitText(heading, "lines, words");
    if (!words?.length) return;

    gsap.set(words, { yPercent: 110 });
    gsap.set(heading, { visibility: "visible" });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: heading,
          start: "top bottom",
          toggleActions: "play none none reset",
        },
        defaults: {
          duration: durationSlow,
          ease: easeBase,
        },
      })
      .to(words, {
        yPercent: 0,
        stagger: 0.08,
      });
  });
}

function linesScroll() {
  const headings = document.querySelectorAll('[data-scroll="lines"]');
  if (!headings.length) return;

  headings.forEach((heading) => {
    const { lines } = createSplitText(heading, "lines");
    if (!lines?.length) return;

    gsap.set(lines, { yPercent: 110 });
    gsap.set(heading, { visibility: "visible" });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: heading,
          start: "top 85%",
          toggleActions: "play none none none",
        },
        defaults: {
          duration: durationSlow,
          ease: easeBase,
        },
      })
      .to(lines, {
        yPercent: 0,
        stagger: 0.08,
        delay: 0.1,
      });
  });
}

function charsScroll() {
  const headings = document.querySelectorAll('[data-scroll="chars"]');
  if (!headings.length) return;

  headings.forEach((heading) => {
    const { chars } = createSplitText(heading, "lines, chars");
    if (!chars?.length) return;

    gsap.set(chars, { yPercent: 110 });
    gsap.set(heading, { visibility: "visible" });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: heading,
          start: "top bottom",
          toggleActions: "play none none reset",
        },
        defaults: {
          duration: durationSlow,
          ease: easeBase,
        },
      })
      .to(chars, {
        yPercent: 0,
        stagger: 0.05,
      });
  });
}

function descriptionScroll() {
  const descriptions = document.querySelectorAll('[data-scroll="description"]');
  if (!descriptions.length) return;

  descriptions.forEach((description) => {
    const { lines } = createSplitText(description, "lines");
    if (!lines?.length) return;

    gsap.set(lines, { yPercent: 110 });
    gsap.set(description, { visibility: "visible" });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: description,
          start: "top bottom",
          toggleActions: "play none none reset",
        },
        defaults: {
          duration: durationSlow,
          ease: easeBase,
        },
      })
      .to(lines, {
        yPercent: 0,
        stagger: 0.15,
      });
  });
}

function fadeScroll() {
  const fades = document.querySelectorAll('[data-scroll="fade"]');

  if (!fades.length) return;

  fades.forEach((fade) => {
    const tl = gsap.timeline({
      defaults: {
        duration: durationSlow,
        ease: "power4.inOut",
      },
      scrollTrigger: {
        trigger: fade,
        start: "top bottom",
        toggleActions: "play none none reset",
      },
      paused: true,
    });

    tl.to(
      fade,
      {
        opacity: 1,
      },
      0.1
    );
  });
}

function getConciergeWidget() {
  // Get the last element in body
  const lastElement = document.body.lastElementChild;

  // Validate it's actually the concierge widget by checking structure
  if (
    lastElement &&
    lastElement.querySelector("form") &&
    lastElement.querySelector("dialog")
  ) {
    return lastElement;
  }

  return null;
}

function conciergeAnimation() {
  const chat = getConciergeWidget();
  if (!chat) return;

  const wrap = chat.children[1];
  const button = wrap.querySelector("button");
  const pill = wrap.querySelector("form");
  const dialog = wrap.querySelector("dialog");
  const footer = document.querySelector(".footer_wrap");

  gsap.set(chat, { pointerEvents: "auto" });
  gsap.set(wrap, { pointerEvents: "auto" });
  gsap.set(button, { display: "inline-block", pointerEvents: "auto" });
  gsap.set(pill, { opacity: 1, pointerEvents: "auto" });
  gsap.set(dialog, { pointerEvents: "auto" });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: footer,
      start: "top bottom",
      toggleActions: "play none none reverse",
    },
  });

  tl.to(pill, {
    opacity: 0,
    duration: durationFast,
    ease: "power2.out",
  })
    .to(button, {
      opacity: 0,
      duration: durationFast,
      ease: "power2.out",
    })
    .set(chat, { pointerEvents: "none" })
    .set(wrap, { pointerEvents: "none" })
    .set(button, { display: "none", pointerEvents: "none" })
    .set(pill, { pointerEvents: "none" })
    .set(dialog, { pointerEvents: "auto" });
}

function conciergeScroll() {
  const observer = new MutationObserver(() => {
    const modal = getConciergeWidget();

    if (modal) {
      modal.addEventListener("mouseenter", () => {
        if (window.lenis) {
          window.lenis.stop();
        }
      });

      modal.addEventListener("mouseleave", () => {
        if (window.lenis) {
          window.lenis.start();
        }
      });

      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// MOBILE MENU

function mobileMenu() {
  const nav = document.querySelector('[data-menu="nav"]');
  const menu = nav.querySelector(".nav_menu");
  const links = menu.querySelectorAll(".nav_link");
  const button = nav.querySelector('[data-menu="button"]');
  const text = button.querySelector(".nav_button-text");
  const overlay = nav.querySelector(".nav_overlay");

  gsap.set(menu, { x: "2rem" });
  gsap.set(links, { x: "2rem", opacity: 0 });

  let menuOpen = gsap.timeline({
    paused: true,
    defaults: {
      duration: 1,
      ease: "power4.out",
    },
    onStart: () => {
      text.textContent = "Close";
      gsap.set(menu, { display: "flex" });
      gsap.set(overlay, { display: "block" });
      nav.classList.add("is-open");
      disableScrolling();
      button.style.pointerEvents = "none";
    },
    onComplete: () => {
      button.style.pointerEvents = "auto";
    },
  });

  let menuClose = gsap.timeline({
    paused: true,
    defaults: {
      duration: 0.5,
      ease: "power4.out",
    },
    onStart: () => {
      text.textContent = "Menu";
      button.style.pointerEvents = "none";
    },
    onComplete: () => {
      gsap.set(menu, { display: "none" });
      gsap.set(overlay, { display: "none" });
      nav.classList.remove("is-open");
      enableScrolling();
      button.style.pointerEvents = "auto";
    },
  });

  menuOpen
    .to(overlay, { opacity: 1 }, 0)
    .to(text, { color: "var(--swatch--brand)", duration: 0.2 }, 0)
    .to(menu, { x: "0rem", opacity: 1 }, 0)
    .to(links, { x: "0rem", opacity: 1, stagger: 0.08 }, 0.15);

  menuClose
    .to(links, { x: "0rem", opacity: 0 }, 0)
    .to(text, { color: "var(--_theme---text)", duration: 0.2 }, 0)
    .to(menu, { x: "1rem", opacity: 0 }, 0.15)
    .to(overlay, { opacity: 0 }, 0.15);

  let isMenuOpen = false;

  button.addEventListener("click", () => {
    if (!isMenuOpen) {
      menuOpen.restart();
      isMenuOpen = true;
    } else {
      menuClose.restart();
      isMenuOpen = false;
    }
  });

  overlay.addEventListener("click", () => {
    if (isMenuOpen) {
      menuClose.restart();
      isMenuOpen = false;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen) {
      menuClose.restart();
      isMenuOpen = false;
    }
  });
}

// HOVER ANIMATION

function charHover() {
  const links = document.querySelectorAll('[data-hover="split-chars"]');
  if (!links.length) return;

  links.forEach((link) => {
    const text = link.querySelectorAll('[data-split="text"]');
    if (!text.length) return;

    const splitTexts = [];
    text.forEach((textEl, index) => {
      const split = new SplitText(textEl, {
        type: "chars",
        tag: "span",
        charsClass: "char",
      });
      splitTexts.push(split);
    });

    link.addEventListener("mouseenter", () => {
      if (!link._tl) {
        link._tl = gsap
          .timeline({
            defaults: { duration: 0.5, ease: easeBase },
            paused: true,
          })
          .to(splitTexts[0].chars, {
            yPercent: -100,
            stagger: 0.017,
            overwrite: "auto",
          })
          .to(
            splitTexts[1].chars,
            {
              yPercent: -100,
              stagger: 0.017,
              overwrite: "auto",
            },
            "<"
          );
      }
      link._tl.play();
    });

    link.addEventListener("mouseleave", () => {
      link._tl?.reverse();
    });
  });
}

function buttonHover() {
  const links = document.querySelectorAll(".btn_main_wrap");
  if (!links.length) return;

  links.forEach((link) => {
    const text = link.querySelectorAll(".btn_main_text");
    const bg = link.querySelector(".btn_main_bg");
    const border = link.querySelector(".btn_main_border");
    if (!text.length) return;

    gsap.set(bg, { top: "100%" });

    const splitTexts = [];
    text.forEach((textEl, index) => {
      const split = new SplitText(textEl, {
        type: "chars",
        tag: "span",
        charsClass: "char",
      });
      splitTexts.push(split);
    });

    link.addEventListener("mouseenter", () => {
      if (!link._tl) {
        link._tl = gsap
          .timeline({
            defaults: { duration: durationBase, ease: easeBase },
            paused: true,
          })
          .to(bg, { top: "0%", overwrite: "auto", duration: 0.6 })
          .to(border, { width: "100%", overwrite: "auto", duration: 0.6 }, "<")
          .to(
            splitTexts[0].chars,
            {
              yPercent: -100,
              stagger: 0.012,
              overwrite: "auto",
            },
            "<"
          )
          .to(
            splitTexts[1].chars,
            {
              yPercent: -100,
              stagger: 0.012,
              overwrite: "auto",
            },
            "<"
          )
          .to(
            link,
            {
              color: "var(--_button-style---text-hover)",
              duration: 0.3,
            },
            "<0.2"
          );
      }
      link._tl.play();
    });

    link.addEventListener("mouseleave", () => {
      link._tl?.reverse();
    });
  });
}

function scrambleHover() {
  const cards = document.querySelectorAll('[data-hover="card"]');

  if (!cards.length) return;

  // Characters used for scrambling effect
  const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  cards.forEach((card) => {
    const defaultText = card.querySelector(".card_image_text");
    const hoverText = card.querySelector(".card_image_text-hover");

    if (!defaultText || !hoverText) return;

    const originalText = defaultText.textContent;
    const targetText = hoverText.textContent;

    let isAnimating = false;
    let currentInterval = null;

    function scrambleText(finalText, duration = 300) {
      // Clear any existing animation
      if (currentInterval) {
        clearInterval(currentInterval);
      }

      isAnimating = true;

      const textLength = finalText.length;
      const iterations = Math.floor(duration / 50); // 50ms per frame
      let currentIteration = 0;

      currentInterval = setInterval(() => {
        let scrambledText = "";

        for (let i = 0; i < textLength; i++) {
          if (currentIteration > iterations * (i / textLength)) {
            // Start revealing the final character
            scrambledText += finalText[i] || "";
          } else {
            // Show random character
            scrambledText +=
              scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          }
        }

        defaultText.textContent = scrambledText;
        currentIteration++;

        if (currentIteration >= iterations + textLength) {
          clearInterval(currentInterval);
          defaultText.textContent = finalText;
          isAnimating = false;
          currentInterval = null;
        }
      }, 50);

      return currentInterval;
    }

    function scrambleTextThenSwap(currentText, finalText, duration = 300) {
      // Clear any existing animation
      if (currentInterval) {
        clearInterval(currentInterval);
      }

      isAnimating = true;

      const textLength = currentText.length;
      const iterations = Math.floor(duration / 50); // 50ms per frame
      let currentIteration = 0;

      currentInterval = setInterval(() => {
        let scrambledText = "";

        // Scramble all characters
        for (let i = 0; i < textLength; i++) {
          scrambledText +=
            scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }

        defaultText.textContent = scrambledText;
        currentIteration++;

        if (currentIteration >= iterations) {
          clearInterval(currentInterval);
          // After scrambling is done, immediately show the final text
          defaultText.textContent = finalText;
          isAnimating = false;
          currentInterval = null;
        }
      }, 50);

      return currentInterval;
    }

    // Hover in
    card.addEventListener("mouseenter", () => {
      // Immediately show the target text length and start scrambling
      defaultText.textContent = targetText;
      scrambleText(targetText, 300);
    });

    // Hover out
    card.addEventListener("mouseleave", () => {
      // Scramble the current hover text, then show original text
      const currentText = defaultText.textContent;
      scrambleTextThenSwap(currentText, originalText, 300);
    });
  });
}

window.addEventListener("load", () => {
  lenisScroll();
  copyright();
  conciergeAnimation();
  conciergeScroll();
  loader();
  pageTransition();
  scrollIndicator();
  wordsScroll();
  linesScroll();
  charsScroll();
  descriptionScroll();
  fadeScroll();

  gsap.matchMedia().add("(min-width: 992px)", () => {
    charHover();
    buttonHover();
    scrambleHover();
  });

  gsap.matchMedia().add("(max-width: 767px)", () => {
    mobileMenu();
  });
});