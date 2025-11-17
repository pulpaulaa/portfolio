"use strict";

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", mobileMenu);

function mobileMenu() {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
}

// Only for project pages

let getslideshow = document
  .getElementsByTagName("body")[0]
  .className.match("project-slideshow");
let get2slideshows = document
  .getElementsByTagName("body")[0]
  .className.match("project-2slideshows");
let getmodal = document
  .getElementsByTagName("body")[0]
  .className.match("project-modal");

/* -------------------------------- Slideshow ------------------------------- */

var slideIndex = 1;
var slideIndex2 = 1;

if (getslideshow) {
  // ---------------------------------------
  // -------------- Slideshow --------------
  var i;
  var slides = document.getElementsByClassName("slideshow-mySlides");
  var dots = document.getElementsByClassName("slideshow-dot");
  showSlides(slideIndex);

  // 2 ---
  if (get2slideshows) {
    var i2;
    var slides2 = document.getElementsByClassName("slideshow-mySlides2");
    var dots2 = document.getElementsByClassName("slideshow-dot2");
    showSlides2(slideIndex2);
  }
}

function showSlides(n) {
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" slideshow-active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " slideshow-active";
}

function showSlides2(n) {
  if (n > slides2.length) {
    slideIndex2 = 1;
  }
  if (n < 1) {
    slideIndex2 = slides2.length;
  }
  for (i2 = 0; i2 < slides2.length; i2++) {
    slides2[i2].style.display = "none";
  }
  for (i2 = 0; i2 < dots2.length; i2++) {
    dots2[i2].className = dots2[i2].className.replace(" slideshow-active", "");
  }
  slides2[slideIndex2 - 1].style.display = "block";
  dots2[slideIndex2 - 1].className += " slideshow-active";
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides((slideIndex = n));
}

// Next/previous controls
function plusSlides(n) {
  showSlides((slideIndex += n));
}

// Next/previous controls
function plusSlides2(n) {
  showSlides2((slideIndex2 += n));
}

// Thumbnail image controls
function currentSlide2(n) {
  showSlides2((slideIndex2 = n));
}

/* ---------------------------------- Modal --------------------------------- */

function openModal(id) {
  var img = document.getElementById(id);
  modal.style.display = "block";
  modalImg.src = img.src;
  captionText.innerHTML = img.alt;
}

if (getmodal) {
  // ------------ Modal image -------------
  // Get the modal
  var modal = document.getElementById("myModal");

  // Get the image and insert it inside the modal - use its "alt" text as a caption
  var modalImg = document.getElementById("img01");
  var captionText = document.getElementById("caption");

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // Mobile fix: tap outside the image closes the modal
  modal.addEventListener("touchstart", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

// ---------------------------------------

// Close navbar when link is clicked
const navLink = document.querySelectorAll(".nav-link");

navLink.forEach((n) => n.addEventListener("click", closeMenu));

function closeMenu() {
  hamburger.classList.remove("active");
  navMenu.classList.remove("active");
}

// Event Listeners: Handling toggle event
const toggleSwitch = document.querySelector(
  '.theme-switch input[type="checkbox"]'
);

function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
}

toggleSwitch.addEventListener("change", switchTheme, false);

//  Store color theme for future visits

function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark"); //add this
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light"); //add this
  }
}

// Save user preference on load

const currentTheme = localStorage.getItem("theme")
  ? localStorage.getItem("theme")
  : null;

if (currentTheme) {
  document.documentElement.setAttribute("data-theme", currentTheme);

  if (currentTheme === "dark") {
    toggleSwitch.checked = true;
  }
}
