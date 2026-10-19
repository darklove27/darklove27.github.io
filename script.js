(function () {
  "use strict";

  var THEMES = [
    { id: "light", name: "Светлая", sw: ["#DF5C3C", "#F3F1EC", "#211F1B"], bg: "#F3F1EC" },
    { id: "dark", name: "Тёмная", sw: ["#FF8057", "#131211", "#F3EEE5"], bg: "#131211" },
    { id: "graphite", name: "Графит", sw: ["#8FAEFF", "#1D1F23", "#EEF1F5"], bg: "#1D1F23" },
    { id: "sand", name: "Песочная", sw: ["#B65F35", "#EFE5D3", "#342D23"], bg: "#EFE5D3" },
    { id: "ocean", name: "Океан", sw: ["#5DD6D1", "#0D1A22", "#E9F3F5"], bg: "#0D1A22" },
    { id: "amoled", name: "AMOLED", sw: ["#D6FA57", "#000000", "#F5F5F2"], bg: "#000000" }
  ];

  var STORAGE = {
    theme: "milart-site-theme",
    banner: "milart-site-banner",
    sound: "milart-site-sound"
  };

  var root = document.documentElement;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.classList.add("js-ready");

  function store(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      return;
    }
  }

  function read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function icon(id) {
    return '<svg class="icon"><use href="#i-' + id + '"/></svg>';
  }

  function themeById(id) {
    for (var i = 0; i < THEMES.length; i += 1) {
      if (THEMES[i].id === id) {
        return THEMES[i];
      }
    }
    return THEMES[1];
  }

  var themeButton = document.getElementById("themeButton");
  var themePopover = document.getElementById("themePopover");
  var themePopoverList = document.getElementById("themePopoverList");
  var themeDot = document.getElementById("themeDot");
  var themeGrid = document.getElementById("themeGrid");
  var mobileThemeList = document.getElementById("mobileThemeList");
  var miniThemeName = document.getElementById("miniThemeName");
  var heroShot = document.getElementById("heroShot");
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  var siteHeader = document.getElementById("siteHeader");
  var menuButton = document.getElementById("menuButton");
  var mobileMenu = document.getElementById("mobileMenu");
  var soundToggle = document.getElementById("soundToggle");
  var aiBanner = document.getElementById("aiBanner");
  var aiBannerClose = document.getElementById("aiBannerClose");
  var sourceButton = document.getElementById("sourceButton");
  var downloadModal = document.getElementById("downloadModal");
  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightboxImage");
  var lightboxTitle = document.getElementById("lightboxTitle");
  var lightboxMeta = document.getElementById("lightboxMeta");
  var lightboxPrev = document.getElementById("lightboxPrev");
  var lightboxNext = document.getElementById("lightboxNext");
  var toast = document.getElementById("toast");
  var soundClick = document.getElementById("soundClick");
  var soundWhoosh = document.getElementById("soundWhoosh");

  var currentTheme = read(STORAGE.theme) || "dark";
  var soundEnabled = read(STORAGE.sound) === "on";
  var toastTimer = null;
  var lastFocused = null;

  function applyTheme(id, withSound) {
    var theme = themeById(id);
    currentTheme = theme.id;

    function commit() {
      root.setAttribute("data-theme", theme.id);
      if (metaTheme) {
        metaTheme.setAttribute("content", theme.bg);
      }
      if (themeDot) {
        themeDot.style.background = theme.sw[0];
      }
      if (heroShot) {
        heroShot.src = "assets/shots/home-" + theme.id + ".webp";
      }
      if (miniThemeName) {
        miniThemeName.textContent = theme.name;
      }
      document.querySelectorAll("[data-theme-choice]").forEach(function (button) {
        var active = button.getAttribute("data-theme-choice") === theme.id;
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    if (withSound) {
      playSound("whoosh");
    }

    if (!prefersReduced && document.startViewTransition) {
      document.startViewTransition(commit);
    } else {
      commit();
    }

    store(STORAGE.theme, theme.id);
  }

  function buildThemeControls() {
    if (themePopoverList) {
      themePopoverList.innerHTML = THEMES.map(function (theme) {
        return '<button class="theme-option" type="button" data-theme-choice="' + theme.id + '" aria-pressed="false">' +
          '<span class="theme-option__swatch" style="--sw-bg:' + theme.sw[1] + ';--sw-1:' + theme.sw[0] + ';--sw-2:' + theme.sw[2] + ';--sw-3:' + theme.sw[0] + '"><i></i><i></i><i></i></span>' +
          '<span class="theme-option__name">' + theme.name + '</span>' +
          '<span class="theme-option__check">' + icon("check") + '</span>' +
          '</button>';
      }).join("");
    }

    if (themeGrid) {
      themeGrid.innerHTML = THEMES.map(function (theme) {
        return '<button class="theme-card" type="button" data-theme-choice="' + theme.id + '" aria-pressed="false">' +
          '<span class="theme-card__preview" style="--sw-bg:' + theme.sw[1] + ';--sw-1:' + theme.sw[0] + ';--sw-2:' + theme.sw[2] + ';--sw-3:' + theme.sw[0] + '"><i></i><i></i><i></i></span>' +
          '<span class="theme-card__name">' + theme.name + icon("check") + '</span>' +
          '</button>';
      }).join("");
    }

    if (mobileThemeList) {
      mobileThemeList.innerHTML = THEMES.map(function (theme) {
        return '<button class="theme-pill" type="button" data-theme-choice="' + theme.id + '" aria-pressed="false" style="--sw-1:' + theme.sw[0] + '">' +
          '<i></i>' + theme.name + '</button>';
      }).join("");
    }
  }

  function playSound(kind) {
    if (!soundEnabled) {
      return;
    }
    var audio = kind === "whoosh" ? soundWhoosh : soundClick;
    if (!audio) {
      return;
    }
    try {
      audio.currentTime = 0;
      audio.volume = kind === "whoosh" ? 0.32 : 0.28;
      var promise = audio.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    } catch (error) {
      return;
    }
  }

  function showToast(message) {
    if (!toast) {
      return;
    }
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, 2800);
  }

  function openModal(modal) {
    if (!modal) {
      return;
    }
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    var close = modal.querySelector(".modal__close");
    if (close) {
      close.focus();
    }
  }

  function closeModal(modal) {
    if (!modal || modal.hidden) {
      return;
    }
    modal.hidden = true;
    if (downloadModal.hidden && lightbox.hidden) {
      document.body.classList.remove("modal-open");
    }
    if (lastFocused && lastFocused.focus) {
      lastFocused.focus();
    }
  }

  function closeThemePopover() {
    if (themePopover && !themePopover.hidden) {
      themePopover.hidden = true;
      themeButton.setAttribute("aria-expanded", "false");
    }
  }

  function closeMobileMenu() {
    if (mobileMenu && !mobileMenu.hidden) {
      mobileMenu.hidden = true;
      menuButton.setAttribute("aria-expanded", "false");
      var use = menuButton.querySelector("use");
      if (use) {
        use.setAttribute("href", "#i-menu");
      }
    }
  }

  function syncSoundButton() {
    if (!soundToggle) {
      return;
    }
    soundToggle.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
    soundToggle.title = soundEnabled ? "Звуки интерфейса: включены" : "Звуки интерфейса: выключены";
  }

  buildThemeControls();
  applyTheme(currentTheme, false);
  syncSoundButton();

  if (read(STORAGE.banner) === "closed" && aiBanner) {
    aiBanner.hidden = true;
  }

  if (aiBannerClose) {
    aiBannerClose.addEventListener("click", function () {
      if (!aiBanner) {
        return;
      }
      aiBanner.classList.add("is-hiding");
      store(STORAGE.banner, "closed");
      window.setTimeout(function () {
        aiBanner.hidden = true;
      }, 300);
    });
  }

  document.addEventListener("click", function (event) {
    var choice = event.target.closest("[data-theme-choice]");
    if (choice) {
      applyTheme(choice.getAttribute("data-theme-choice"), true);
      closeThemePopover();
      closeMobileMenu();
      return;
    }

    if (event.target.closest("[data-sound]")) {
      playSound("click");
    }

    var closer = event.target.closest("[data-close]");
    if (closer) {
      var modal = closer.closest(".modal");
      if (modal) {
        closeModal(modal);
      }
    }
  });

  if (themeButton) {
    themeButton.addEventListener("click", function () {
      var willOpen = themePopover.hidden;
      themePopover.hidden = !willOpen;
      themeButton.setAttribute("aria-expanded", willOpen ? "true" : "false");
      if (willOpen) {
        playSound("click");
      }
    });
  }

  if (menuButton) {
    menuButton.addEventListener("click", function () {
      var willOpen = mobileMenu.hidden;
      mobileMenu.hidden = !willOpen;
      menuButton.setAttribute("aria-expanded", willOpen ? "true" : "false");
      var use = menuButton.querySelector("use");
      if (use) {
        use.setAttribute("href", willOpen ? "#i-close" : "#i-menu");
      }
      playSound("click");
    });
  }

  if (mobileMenu) {
    mobileMenu.addEventListener("click", function (event) {
      if (event.target.closest(".mobile-menu__link")) {
        closeMobileMenu();
      }
    });
  }

  if (soundToggle) {
    soundToggle.addEventListener("click", function () {
      soundEnabled = !soundEnabled;
      store(STORAGE.sound, soundEnabled ? "on" : "off");
      syncSoundButton();
      if (soundEnabled) {
        playSound("click");
      }
    });
  }

  document.addEventListener("click", function (event) {
    if (themePopover && !themePopover.hidden && !event.target.closest(".theme-menu")) {
      closeThemePopover();
    }
    if (mobileMenu && !mobileMenu.hidden && !event.target.closest("#mobileMenu") && !event.target.closest("#menuButton")) {
      closeMobileMenu();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeThemePopover();
      closeMobileMenu();
      if (downloadModal && !downloadModal.hidden) {
        closeModal(downloadModal);
      }
      if (lightbox && !lightbox.hidden) {
        closeModal(lightbox);
      }
    }
  });

  if (siteHeader) {
    var onScroll = function () {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  document.querySelectorAll("[data-download]").forEach(function (link) {
    link.addEventListener("click", function () {
      showToast("Загрузка Milart.exe началась");
    });
  });

  if (sourceButton) {
    sourceButton.addEventListener("click", function () {
      openModal(downloadModal);
    });
  }

  var works = Array.prototype.slice.call(document.querySelectorAll("#worksGrid .work"));
  var workIndex = 0;

  function showWork(index) {
    if (!works.length) {
      return;
    }
    workIndex = (index + works.length) % works.length;
    var work = works[workIndex];
    var image = work.querySelector("img");
    var title = work.getAttribute("data-title") || "Работа";
    var kind = work.getAttribute("data-kind") || "Milart";
    var size = work.getAttribute("data-size") || "";
    lightboxImage.src = work.getAttribute("data-src");
    lightboxImage.alt = image ? image.alt || title : title;
    lightboxTitle.textContent = title;
    lightboxMeta.textContent = size ? kind + " · " + size : kind;
  }

  works.forEach(function (work, index) {
    work.addEventListener("click", function () {
      showWork(index);
      openModal(lightbox);
      playSound("whoosh");
    });
  });

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", function () {
      showWork(workIndex - 1);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", function () {
      showWork(workIndex + 1);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (lightbox && !lightbox.hidden) {
      if (event.key === "ArrowLeft") {
        showWork(workIndex - 1);
      }
      if (event.key === "ArrowRight") {
        showWork(workIndex + 1);
      }
    }
  });

  var faqItems = Array.prototype.slice.call(document.querySelectorAll("#faqList .faq__item"));
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) {
        return;
      }
      faqItems.forEach(function (other) {
        if (other !== item) {
          other.open = false;
        }
      });
    });
  });

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    document.querySelectorAll("[data-reveal]").forEach(function (element) {
      if (prefersReduced) {
        element.classList.add("is-revealed");
      } else {
        revealObserver.observe(element);
      }
    });

    var navTargets = ["features", "formats", "gallery", "themes", "faq"];
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        var id = entry.target.id;
        if (navTargets.indexOf(id) === -1) {
          return;
        }
        document.querySelectorAll(".nav__link, .mobile-menu__link").forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    navTargets.forEach(function (id) {
      var section = document.getElementById(id);
      if (section) {
        navObserver.observe(section);
      }
    });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(function (element) {
      element.classList.add("is-revealed");
    });
  }

  var pixelCanvas = document.getElementById("pixelCanvas");
  var pixelGrid = document.getElementById("pixelGrid");
  var pixelStatus = document.getElementById("pixelStatus");
  var pixelCount = document.getElementById("pixelCount");
  var swatchList = document.getElementById("swatchList");
  var gridToggle = document.getElementById("gridToggle");
  var pixelDownload = document.getElementById("pixelDownload");
  var pixelClear = document.getElementById("pixelClear");
  var toolButtons = Array.prototype.slice.call(document.querySelectorAll("[data-tool]"));

  var PIXEL_SIZE = 24;
  var PALETTE = ["#1F1D1A", "#FFFFFF", "#FF8057", "#F2A24A", "#F2D35C", "#6BBF72", "#4FA9A5", "#4F86D9", "#7C68C9", "#D569A4"];
  var pixels = [];
  var pixelCtx = pixelCanvas ? pixelCanvas.getContext("2d") : null;
  var currentTool = "brush";
  var currentColor = "#FF8057";
  var isDrawing = false;

  function plural(count, one, few, many) {
    var mod10 = count % 10;
    var mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) {
      return one;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return few;
    }
    return many;
  }

  function seedPixels() {
    pixels = [];
    for (var y = 0; y < PIXEL_SIZE; y += 1) {
      for (var x = 0; x < PIXEL_SIZE; x += 1) {
        var nx = (x + 0.5 - 12) / 9;
        var ny = (11 - (y + 0.5)) / 9;
        var value = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny;
        pixels[y * PIXEL_SIZE + x] = value <= 0 ? "#FF8057" : null;
      }
    }
  }

  function pixelCountValue() {
    var total = 0;
    for (var i = 0; i < pixels.length; i += 1) {
      if (pixels[i]) {
        total += 1;
      }
    }
    return total;
  }

  function renderPixels() {
    if (!pixelCtx) {
      return;
    }
    pixelCtx.clearRect(0, 0, PIXEL_SIZE, PIXEL_SIZE);
    for (var y = 0; y < PIXEL_SIZE; y += 1) {
      for (var x = 0; x < PIXEL_SIZE; x += 1) {
        var color = pixels[y * PIXEL_SIZE + x];
        if (color) {
          pixelCtx.fillStyle = color;
          pixelCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    var total = pixelCountValue();
    if (pixelCount) {
      pixelCount.textContent = total + " " + plural(total, "пиксель", "пикселя", "пикселей");
    }
  }

  function updatePixelStatus() {
    if (!pixelStatus) {
      return;
    }
    if (currentTool === "eraser") {
      pixelStatus.textContent = "Ластик · " + PIXEL_SIZE + "×" + PIXEL_SIZE;
    } else {
      pixelStatus.textContent = "Кисть · " + currentColor.toUpperCase();
    }
  }

  function paintAt(event) {
    if (!pixelCanvas || !pixels.length) {
      return;
    }
    var rect = pixelCanvas.getBoundingClientRect();
    var x = Math.floor(((event.clientX - rect.left) / rect.width) * PIXEL_SIZE);
    var y = Math.floor(((event.clientY - rect.top) / rect.height) * PIXEL_SIZE);
    if (x < 0 || y < 0 || x >= PIXEL_SIZE || y >= PIXEL_SIZE) {
      return;
    }
    pixels[y * PIXEL_SIZE + x] = currentTool === "eraser" ? null : currentColor;
    renderPixels();
  }

  if (pixelCanvas) {
    seedPixels();
    renderPixels();
    updatePixelStatus();

    pixelCanvas.addEventListener("pointerdown", function (event) {
      isDrawing = true;
      pixelCanvas.setPointerCapture(event.pointerId);
      paintAt(event);
      playSound("click");
    });

    pixelCanvas.addEventListener("pointermove", function (event) {
      if (isDrawing) {
        paintAt(event);
      }
    });

    function stopDrawing(event) {
      isDrawing = false;
      if (event.pointerId !== undefined && pixelCanvas.hasPointerCapture(event.pointerId)) {
        pixelCanvas.releasePointerCapture(event.pointerId);
      }
    }

    pixelCanvas.addEventListener("pointerup", stopDrawing);
    pixelCanvas.addEventListener("pointercancel", stopDrawing);
  }

  toolButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentTool = button.getAttribute("data-tool");
      toolButtons.forEach(function (other) {
        var active = other === button;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", active ? "true" : "false");
      });
      updatePixelStatus();
    });
  });

  if (swatchList) {
    swatchList.innerHTML = PALETTE.map(function (color, index) {
      return '<button class="swatch' + (index === 2 ? " is-active" : "") + '" type="button" data-color="' + color + '" style="background:' + color + '" aria-label="Цвет ' + color + '" aria-pressed="' + (index === 2 ? "true" : "false") + '"></button>';
    }).join("");

    swatchList.addEventListener("click", function (event) {
      var swatch = event.target.closest("[data-color]");
      if (!swatch) {
        return;
      }
      currentColor = swatch.getAttribute("data-color");
      currentTool = "brush";
      toolButtons.forEach(function (button) {
        var active = button.getAttribute("data-tool") === "brush";
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      swatchList.querySelectorAll(".swatch").forEach(function (item) {
        var active = item === swatch;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });
      updatePixelStatus();
      playSound("click");
    });
  }

  if (gridToggle) {
    gridToggle.addEventListener("click", function () {
      var willShow = pixelGrid.hidden;
      pixelGrid.hidden = !willShow;
      gridToggle.classList.toggle("is-active", willShow);
      gridToggle.setAttribute("aria-pressed", willShow ? "true" : "false");
      playSound("click");
    });
  }

  if (pixelClear) {
    pixelClear.addEventListener("click", function () {
      pixels = new Array(PIXEL_SIZE * PIXEL_SIZE).fill(null);
      renderPixels();
      showToast("Холст очищен");
    });
  }

  if (pixelDownload) {
    pixelDownload.addEventListener("click", function () {
      var scale = 20;
      var exportCanvas = document.createElement("canvas");
      exportCanvas.width = PIXEL_SIZE * scale;
      exportCanvas.height = PIXEL_SIZE * scale;
      var exportCtx = exportCanvas.getContext("2d");
      for (var y = 0; y < PIXEL_SIZE; y += 1) {
        for (var x = 0; x < PIXEL_SIZE; x += 1) {
          var color = pixels[y * PIXEL_SIZE + x];
          if (color) {
            exportCtx.fillStyle = color;
            exportCtx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }
      var link = document.createElement("a");
      link.download = "milart-pixel.png";
      link.href = exportCanvas.toDataURL("image/png");
      link.click();
      showToast("PNG сохранён · 480×480");
    });
  }

  window.addEventListener("load", function () {
    THEMES.forEach(function (theme) {
      if (theme.id === currentTheme) {
        return;
      }
      var image = new Image();
      image.src = "assets/shots/home-" + theme.id + ".webp";
    });
  });
})();
