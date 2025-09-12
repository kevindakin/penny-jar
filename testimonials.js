function testimonialsSlider() {
    const wrapper = document.querySelector(".testimonials_right");
  
    if (!wrapper) return;
  
    const slider = wrapper.querySelector(".testimonials_cms.swiper");
    const swiperWrapper = slider.querySelector(
      ".testimonials_list.swiper-wrapper"
    );
    const arrowPrev = wrapper.querySelector(".slider_arrow.swiper-prev");
    const arrowNext = wrapper.querySelector(".slider_arrow.swiper-next");
  
    // Get all slides
    const allSlides = Array.from(swiperWrapper.querySelectorAll(".swiper-slide"));
  
    // Function to randomize and filter slides
    function getRandomizedUniqueSlides(slides, maxCount = 5) {
      const seenCompanies = new Set();
      const uniqueSlides = [];
  
      const shuffledSlides = [...slides].sort(() => Math.random() - 0.5);
  
      for (const slide of shuffledSlides) {
        const companyElement = slide.querySelector('[data-element="sub-text"]');
        if (!companyElement) continue;
  
        const companyName = companyElement.textContent.trim().toLowerCase();
  
        if (!seenCompanies.has(companyName)) {
          seenCompanies.add(companyName);
          uniqueSlides.push(slide);
  
          if (uniqueSlides.length >= maxCount) break;
        }
      }
  
      return uniqueSlides;
    }
  
    const selectedSlides = getRandomizedUniqueSlides(allSlides, 5);
  
    allSlides.forEach((slide) => slide.remove());
  
    selectedSlides.forEach((slide) => {
      swiperWrapper.appendChild(slide);
    });
  
    setTimeout(() => {
      let swiper = new Swiper(slider, {
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 300,
        loop: true,
        // autoplay: {
        //   delay: 3000,
        //   pauseOnMouseEnter: true,
        // },
        effect: "fade",
        fadeEffect: {
          crossFade: true,
        },
        watchOverflow: true,
        navigation: {
          nextEl: arrowNext,
          prevEl: arrowPrev,
        },
      });
  
      // Three.js coin drop
      if (typeof initSwiperDrops === "function") {
        initSwiperDrops(swiper);
      }
    }, 100);
  }
  
  window.addEventListener("load", () => {
    testimonialsSlider();
  });  