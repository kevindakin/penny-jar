function socialShare() {
    const linkShareButtons = document.querySelectorAll('[data-share="link"]');
  
    const handleLinkCopy = async (button) => {
      const currentUrl = window.location.href;
      const copyIcon = button.querySelector('[data-share="copy"]');
      const copiedIcon = button.querySelector('[data-share="copied"]');
      const tooltip = button.querySelector('[data-share="tooltip"]');
  
      try {
        await navigator.clipboard.writeText(currentUrl);
  
        if (copyIcon && copiedIcon) {
          copiedIcon.style.display = "block";
          setTimeout(() => {
            copiedIcon.classList.add("is-open");
          }, 10);
        }
  
        if (tooltip) {
          tooltip.style.display = "block";
          setTimeout(() => {
            tooltip.classList.add("is-open");
          }, 10);
        }
  
        setTimeout(() => {
          if (copyIcon && copiedIcon) {
            copiedIcon.classList.remove("is-open");
            tooltip.classList.remove("is-open");
  
            setTimeout(() => {
              copiedIcon.style.display = "none";
              tooltip.style.display = "none";
            }, 300);
          }
        }, 2000);
      } catch (err) {
        console.error("Failed to copy URL:", err);
      }
    };
  
    linkShareButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        handleLinkCopy(button);
      });
    });
  }
  
  window.addEventListener("load", () => {
    socialShare();
  });  