function featuredHover() {
    const link = document.querySelector(".card_featured_wrap");
    if (!link) return;
  
    const image = link.querySelector(".u-cover-absolute");
    const btn = link.querySelector(".btn_main_wrap");
    const text = btn.querySelectorAll(".btn_main_text");
    const bg = btn.querySelector(".btn_main_bg");
    const border = btn.querySelector(".btn_main_border");
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
            defaults: {
              duration: durationBase,
              ease: easeBase,
            },
            paused: true,
          })
          .to(image, { scale: 1.05, overwrite: "auto", duration: 1 })
          .to(bg, { top: "0%", overwrite: "auto", duration: 0.6 }, "<")
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
            btn,
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
  }
  
  window.addEventListener("load", () => {
    featuredHover();
  });  