function founderCarousel() {
    const wrapper = document.querySelector(".founders_wrap");
  
    if (!wrapper) return;
  
    const slider = wrapper.querySelector(".founders_cms.swiper");
    const swiperWrapper = slider.querySelector(".founders_list.swiper-wrapper");
    const arrowPrev = wrapper.querySelector(".slider_arrow.swiper-prev");
    const arrowNext = wrapper.querySelector(".slider_arrow.swiper-next");
  
    // Get all slides
    const allSlides = Array.from(swiperWrapper.querySelectorAll(".swiper-slide"));
  
    // Function to randomize and filter slides
    function getRandomizedUniqueSlides(slides, maxCount = 6) {
      const seenCompanies = new Set();
      const uniqueSlides = [];
  
      // Create a shuffled copy of the slides array
      const shuffledSlides = [...slides].sort(() => Math.random() - 0.5);
  
      // Filter for unique companies
      for (const slide of shuffledSlides) {
        const companyElement = slide.querySelector('[data-element="company"]');
  
        if (!companyElement) continue;
  
        const companyName = companyElement.textContent.trim().toLowerCase();
  
        if (!seenCompanies.has(companyName)) {
          seenCompanies.add(companyName);
          uniqueSlides.push(slide);
  
          // Stop when we have enough slides
          if (uniqueSlides.length >= maxCount) break;
        }
      }
  
      return uniqueSlides;
    }
  
    // Get randomized unique slides
    const selectedSlides = getRandomizedUniqueSlides(allSlides, 6);
  
    // Remove all slides from the DOM
    allSlides.forEach((slide) => slide.remove());
  
    // Add only the selected slides back to the swiper-wrapper
    selectedSlides.forEach((slide) => {
      swiperWrapper.appendChild(slide);
    });
  
    // Small delay to ensure DOM is fully settled before Swiper initialization
    setTimeout(() => {
      let swiper = new Swiper(slider, {
        slidesPerView: "auto",
        spaceBetween: 12,
        speed: 500,
        loop: true,
        watchOverflow: true,
        autoplay: {
          delay: 3000,
          pauseOnMouseEnter: true,
        },
        navigation: {
          nextEl: arrowNext,
          prevEl: arrowPrev,
        },
        breakpoints: {
          992: {
            spaceBetween: 16,
          },
        },
      });
    }, 100);
  }
  
  window.addEventListener("load", () => {
    founderCarousel();
  });  