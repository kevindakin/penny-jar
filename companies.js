function filterDropdowns() {
    const wrap = document.querySelector(".companies-grid_filters");
    const dropdowns = document.querySelectorAll(".filter_wrap");
    const triggers = document.querySelectorAll(".filter_trigger");
    const optionsLists = document.querySelectorAll(".filter_options");
    const icons = document.querySelectorAll(".filter_icon");
    const resetElement = document.querySelector(".companies-grid_filter-clear");
  
    if (!wrap || dropdowns.length === 0) {
      return;
    }
  
    let currentOpenDropdown = null;
  
    function updateFilterVisualState(dropdown) {
      const selectedOption = dropdown.querySelector(
        'input[type="radio"]:checked'
      );
  
      if (selectedOption && selectedOption.value !== "") {
        dropdown.classList.add("is-filtered");
      } else {
        dropdown.classList.remove("is-filtered");
      }
    }
  
    function updateResetButton() {
      if (!resetElement) return;
  
      const hasActiveFilters = Array.from(dropdowns).some((dropdown) => {
        const selected = dropdown.querySelector('input[type="radio"]:checked');
        return selected && selected.value !== "";
      });
  
      if (hasActiveFilters) {
        resetElement.style.display = "block";
      } else {
        resetElement.style.display = "none";
      }
    }
  
    function openDropdown(dropdown, options, icon) {
      if (currentOpenDropdown && currentOpenDropdown !== dropdown) {
        closeDropdown(currentOpenDropdown);
      }
  
      gsap.set(options, { display: "block" });
  
      gsap.to(options, {
        opacity: 1,
        duration: 0.2,
        ease: "power2.inOut",
      });
  
      gsap.to(icon, {
        rotation: 135,
        duration: 0.4,
        ease: "power4.inOut",
      });
  
      currentOpenDropdown = dropdown;
      dropdown.classList.add("is-open");
    }
  
    function closeDropdown(dropdown) {
      const options = dropdown.querySelector(".filter_options");
      const icon = dropdown.querySelector(".filter_icon");
  
      gsap.to(options, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(options, { display: "none" });
        },
      });
  
      gsap.to(icon, {
        rotation: 0,
        duration: 0.4,
        ease: "power4.inOut",
      });
  
      if (currentOpenDropdown === dropdown) {
        currentOpenDropdown = null;
      }
      dropdown.classList.remove("is-open");
    }
  
    function closeAllDropdowns() {
      dropdowns.forEach((dropdown) => {
        if (dropdown.classList.contains("is-open")) {
          closeDropdown(dropdown);
        }
      });
    }
  
    dropdowns.forEach((dropdown) => {
      updateFilterVisualState(dropdown);
    });
    updateResetButton();
  
    triggers.forEach((trigger, index) => {
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
  
        const dropdown = dropdowns[index];
        const options = optionsLists[index];
        const icon = icons[index];
  
        if (dropdown.classList.contains("is-open")) {
          closeDropdown(dropdown);
        } else {
          openDropdown(dropdown, options, icon);
        }
      });
    });
  
    dropdowns.forEach((dropdown) => {
      const radioButtons = dropdown.querySelectorAll('input[type="radio"]');
      radioButtons.forEach((radio) => {
        radio.addEventListener("change", () => {
          updateFilterVisualState(dropdown);
          updateResetButton();
        });
      });
    });
  
    document.addEventListener("click", (e) => {
      let clickedInsideDropdown = false;
  
      dropdowns.forEach((dropdown) => {
        if (dropdown.contains(e.target)) {
          clickedInsideDropdown = true;
        }
      });
  
      if (!clickedInsideDropdown) {
        closeAllDropdowns();
      }
    });
  
    optionsLists.forEach((options) => {
      options.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });
  
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAllDropdowns();
      }
    });
  }
  
  function filterTags() {
    const tagContainer = document.getElementById("custom-tags-container");
    const tagTemplate = document.getElementById("tag-template");
  
    function createTag(field, value) {
      const tag = tagTemplate.cloneNode(true);
      tag.removeAttribute("id");
      tag.style.display = "flex";
      tag.setAttribute("data-field", field);
      tag.setAttribute("data-value", value);
      tag.classList.add("companies_filter-tag");
  
      tag.querySelector(".companies_filter-field").textContent = field;
      tag.querySelector(".companies_filter-operator").textContent = ":";
      tag.querySelector(".tag_main_text.is-filter-tag").textContent = value;
  
      tag.querySelector(".tag_main_remove").addEventListener("click", () => {
        const checkbox = document.querySelector(
          `input[fs-list-field="${field}"][fs-list-value="${value}"]`
        );
        if (checkbox) {
          checkbox.checked = false;
          checkbox.dispatchEvent(new Event("input", { bubbles: true }));
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
  
          setTimeout(() => {
            if (window.fsAttributes && window.fsAttributes["list"]) {
              window.fsAttributes["list"].refresh();
            }
          }, 10);
  
          tag.remove();
        }
      });
  
      tagContainer.appendChild(tag);
      return tag;
    }
  
    function handleCheckboxChange(checkbox) {
      const field = checkbox.getAttribute("fs-list-field");
      const value = checkbox.getAttribute("fs-list-value");
      const selector = `[data-field="${field}"][data-value="${value}"]`;
      const existingTag = tagContainer.querySelector(selector);
  
      if (checkbox.checked) {
        if (!existingTag) {
          createTag(field, value);
        }
      } else {
        if (existingTag) {
          existingTag.remove();
        }
  
        // Force refresh Finsweet's filter when unchecking
        setTimeout(() => {
          if (window.fsAttributes && window.fsAttributes["list"]) {
            window.fsAttributes["list"].refresh();
          }
        }, 10);
      }
    }
  
    document.addEventListener("change", (e) => {
      if (e.target.matches('input[type="checkbox"][fs-list-value]')) {
        handleCheckboxChange(e.target);
      }
    });
  
    document.addEventListener("DOMContentLoaded", () => {
      document
        .querySelectorAll('input[type="checkbox"][fs-list-value]:checked')
        .forEach(handleCheckboxChange);
    });
  }
  
  function companyHover() {
    const cards = gsap.utils.toArray(".card_company_wrap");
    if (!cards.length) return;
  
    const dimOthers = (active) => {
      gsap.to(cards, {
        opacity: 0.3,
        duration: durationFast,
        ease: "power2.inOut",
        overwrite: "auto",
      });
      gsap.to(active, {
        opacity: 1,
        duration: durationFast,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    };
  
    const undimAll = () => {
      gsap.to(cards, {
        opacity: 1,
        duration: durationFast,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    };
  
    cards.forEach((card) => {
      const bg = card.querySelector(".card_company_bg");
      const wrap = card.querySelector(".card_company_text-wrap");
      const logo = card.querySelector(".card_company_logo");
      const logoHover = card.querySelector(".card_company_hover");
  
      card.addEventListener("mouseenter", () => {
        dimOthers(card);
  
        if (!card._tl) {
          card._tl = gsap
            .timeline({
              defaults: { duration: 0.5, ease: "power4.inOut" },
              paused: true,
            })
            .to(bg, { opacity: 1, overwrite: "auto" })
            .to(wrap, { y: "0rem", opacity: 1, overwrite: "auto" }, "<");
          if (logo) {
            card._tl.to(logo, { opacity: 0, overwrite: "auto" }, "<");
          }
          if (logoHover) {
            card._tl.to(logoHover, { opacity: 1, overwrite: "auto" }, "<");
          }
        }
        card._tl.play();
      });
  
      card.addEventListener("mouseleave", (e) => {
        const toEl =
          e.relatedTarget && e.relatedTarget.closest
            ? e.relatedTarget.closest(".card_company_wrap")
            : null;
  
        if (!toEl || !cards.includes(toEl)) {
          undimAll();
        }
        card._tl?.reverse();
      });
    });
  }
  
  function stealthLogos() {
    const cards = document.querySelectorAll(".card_company_wrap");
  
    function randomOpacity() {
      const opacity = [0, 0.1, 0.2, 0.3, 0.5, 0.7, 0.8];
      return opacity[Math.floor(Math.random() * opacity.length)];
    }
  
    function randomize(grid) {
      const pixels = grid.querySelectorAll(".card_company_pixel");
      const outer = [1, 15, 16, 30, 31, 45];
      const low = [0, 0.1, 0.2];
      const high = [0, 0.1, 0.2, 0.3, 0.5, 0.7, 0.8];
  
      pixels.forEach((pixel, index) => {
        const position = index + 1;
  
        if (outer.includes(position)) {
          pixel.style.opacity = low[Math.floor(Math.random() * low.length)];
        } else {
          pixel.style.opacity = high[Math.floor(Math.random() * high.length)];
        }
      });
    }
  
    function hoverAnim(grid) {
      let count = 0;
      const number = 4; // Number of random cycles
      const speed = 80; // Speed in milliseconds
  
      const interval = setInterval(() => {
        randomize(grid);
        count++;
  
        if (count >= number) {
          clearInterval(interval);
          randomize(grid);
        }
      }, speed);
    }
  
    cards.forEach((card) => {
      const stealth = card.querySelector(".card_company_stealth");
  
      if (!stealth) return;
  
      randomize(stealth);
  
      card.addEventListener("mouseenter", () => {
        hoverAnim(stealth);
      });
    });
  }
  
  filterDropdowns();
  filterTags();
  stealthLogos();
  
  gsap.matchMedia().add("(min-width: 992px)", () => {
    companyHover();
  });  