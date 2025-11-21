// script.js
// -------------------- includeHTML --------------------
function includeHTML(callback) {
  const elements = document.querySelectorAll("[include-html]");
  let remaining = elements.length;

  if (remaining === 0) {
    callback();
    return;
  }

  elements.forEach((el) => {
    const file = el.getAttribute("include-html");

    fetch(file)
      .then((res) => res.text())
      .then((data) => {
        el.innerHTML = data;
        el.removeAttribute("include-html");

        remaining--;
        if (remaining === 0 && typeof callback === "function") callback();
      })
      .catch((err) => {
        console.warn("Error loading: " + file, err);
        remaining--;
        if (remaining === 0 && typeof callback === "function") callback();
      });
  });
}

// -------------------- init --------------------
function init() {
  "use strict";

  /* -------------------------------------------------------------------------- */
  /*                               NAVBAR / MENU                                */
  /* -------------------------------------------------------------------------- */

  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  navLinks.forEach((link) =>
    link.addEventListener("click", () => {
      if (hamburger && navMenu) {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      }
    })
  );

  /* -------------------------------------------------------------------------- */
  /*                                   THEME                                    */
  /* -------------------------------------------------------------------------- */

  const toggleSwitch = document.querySelector(
    '.theme-switch input[type="checkbox"]'
  );

  if (toggleSwitch) {
    const currentTheme = localStorage.getItem("theme");

    if (currentTheme) {
      document.documentElement.setAttribute("data-theme", currentTheme);
      toggleSwitch.checked = currentTheme === "dark";
    }

    toggleSwitch.addEventListener("change", (e) => {
      if (e.target.checked) {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
      }
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                                SLIDESHOW + MAPPING                          */
  /* -------------------------------------------------------------------------- */

  // mapping from data-group name -> { handlerName: "currentSlide" or "currentSlide2", slidesCollection: HTMLCollection }
  const groupToSlideshowHandler = {};

  /**
   * setupSlideshow
   * slideClass: class name for slides (e.g. "slideshow-mySlides")
   * dotClass: class name for dots (e.g. "slideshow-dot")
   * globalSuffix: "" for first slideshow, "2" for second
   *
   * Exposes window.plusSlides<suffix> and window.currentSlide<suffix>
   * Re-wires arrows and dots inside the slideshow container to call the correct global functions
   * Scans for <img data-group="..."> inside slides and registers them in groupToSlideshowHandler
   */
  function setupSlideshow(slideClass, dotClass, globalSuffix) {
    const slides = document.getElementsByClassName(slideClass);
    const dots = document.getElementsByClassName(dotClass);

    if (!slides || slides.length === 0) return null;

    // attempt to find a logical container for this slideshow (useful for wiring arrows)
    const container =
      slides[0].closest(".slideshow-container") || slides[0].parentElement;

    let index = 1;

    function show(n) {
      if (!slides || slides.length === 0) return;

      if (n > slides.length) index = 1;
      if (n < 1) index = slides.length;

      for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
      }
      for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("slideshow-active");
      }

      slides[index - 1].style.display = "block";
      if (dots[index - 1]) dots[index - 1].classList.add("slideshow-active");
    }

    // expose names
    const plusName = "plusSlides" + globalSuffix;
    const currentName = "currentSlide" + globalSuffix;

    // global functions
    window[plusName] = function (n) {
      show((index += n));
    };

    window[currentName] = function (n) {
      show((index = n));
    };

    // Rewire prev/next arrows inside this container so they point to the right handler
    if (container) {
      const prevEl = container.querySelector(".slideshow-prev");
      const nextEl = container.querySelector(".slideshow-next");

      if (prevEl) {
        prevEl.setAttribute("onclick", `${plusName}(-1)`);
      }
      if (nextEl) {
        nextEl.setAttribute("onclick", `${plusName}(1)`);
      }
    }

    // Re-wire dots (in case they were using inline onclicks)
    if (dots && dots.length) {
      for (let d = 0; d < dots.length; d++) {
        dots[d].setAttribute("onclick", `${currentName}(${d + 1})`);
      }
    }

    // Register images with data-group inside these slides so modal can sync to the correct slideshow
    for (let i = 0; i < slides.length; i++) {
      const imgs = slides[i].getElementsByTagName("img");
      for (let j = 0; j < imgs.length; j++) {
        const g = imgs[j].getAttribute("data-group");
        if (g) {
          groupToSlideshowHandler[g] = {
            handlerName: currentName,
            slidesCollection: slides,
          };
        }
      }
    }

    // start
    show(index);

    return { plusName, currentName };
  }

  // initialize both slideshows (will silently skip if a slideshow does not exist)
  setupSlideshow("slideshow-mySlides", "slideshow-dot", "");
  setupSlideshow("slideshow-mySlides2", "slideshow-dot2", "2");

  /* ---------------- CLICKABLE VIDEO HANDLING ---------------- */
  const mediaElements = document.querySelectorAll(".clickable-media");

  mediaElements.forEach((el) => {
    // make sure the element has an id
    if (!el.id) {
      console.warn("clickable-media missing id", el);
      return;
    }

    el.addEventListener("click", (event) => {
      // prevent toggling play/pause on the video element itself
      event.preventDefault();
      event.stopPropagation();

      // open modal (modal logic will render the video inside it)
      if (typeof openModal === "function") {
        openModal(el.id);
      } else {
        // fallback if openModal hasn't been defined yet (rare since this runs before modal init),
        // we can call it later — but typically includeHTML(init) ensures modal code is in init
        console.warn("openModal not defined yet");
      }
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                    MODAL                                   */
  /* -------------------------------------------------------------------------- */

  if (document.body.classList.contains("project-modal")) {
    const modal = document.getElementById("myModal");
    const modalContainer = document.getElementById("modal-content-container");
    const captionText = document.getElementById("caption");

    let groupItems = [];
    let currentIndex = 0;
    let currentGroup = null;

    // Injects either an image OR a video into the modal
    function renderModalContent(element) {
      modalContainer.innerHTML = ""; // Clear previous content

      if (element.tagName.toLowerCase() === "img") {
        const img = document.createElement("img");
        img.className = "modal-content";
        img.src = element.src;
        modalContainer.appendChild(img);
      } else if (element.tagName.toLowerCase() === "video") {
        const video = document.createElement("video");
        video.className = "modal-content";
        video.src = element.querySelector("source")?.src || element.src;
        video.controls = true;
        video.autoplay = true;
        modalContainer.appendChild(video);
      }
    }

    window.openModal = function (id) {
      const el = document.getElementById(id);
      if (!el) return;

      modal.style.display = "block";
      document.body.classList.add("modal-open");

      currentGroup = el.getAttribute("data-group");

      if (currentGroup) {
        // Image + video mixed selection
        groupItems = Array.from(
          document.querySelectorAll(`[data-group="${currentGroup}"]`)
        );

        currentIndex = groupItems.findIndex((item) => item.id === id);

        document.querySelector(".modal-prev").style.display = "flex";
        document.querySelector(".modal-next").style.display = "flex";
      } else {
        groupItems = [el];
        currentIndex = 0;

        document.querySelector(".modal-prev").style.display = "none";
        document.querySelector(".modal-next").style.display = "none";
      }

      renderModalContent(groupItems[currentIndex]);
      captionText.innerHTML = el.alt || "";
    };

    function stopVideoIfAny() {
      const vid = modalContainer.querySelector("video");
      if (vid) vid.pause();
    }

    window.showPrev = function () {
      if (!currentGroup) return;
      stopVideoIfAny();

      currentIndex--;
      if (currentIndex < 0) currentIndex = groupItems.length - 1;

      renderModalContent(groupItems[currentIndex]);
      captionText.innerHTML = groupItems[currentIndex].alt || "";
    };

    window.showNext = function () {
      if (!currentGroup) return;
      stopVideoIfAny();

      currentIndex++;
      if (currentIndex >= groupItems.length) currentIndex = 0;

      renderModalContent(groupItems[currentIndex]);
      captionText.innerHTML = groupItems[currentIndex].alt || "";
    };

    window.closeModal = function () {
      stopVideoIfAny();
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
    };

    window.onclick = function (event) {
      if (event.target === modal) {
        stopVideoIfAny();
        modal.style.display = "none";
        document.body.classList.remove("modal-open");
      }
    };
  }
} // end init

// -------------------- start --------------------
includeHTML(init);
