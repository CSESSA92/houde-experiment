/* CR-01 - Gestione modalità schermo */
(function () {
  "use strict";

  const STORAGE_KEY = "CR01_DISPLAY_MODE";

  function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function supportsFullscreen() {
    return Boolean(
      document.documentElement.requestFullscreen ||
      document.documentElement.webkitRequestFullscreen
    );
  }

  function getMode() {
    if (isIOS() && !supportsFullscreen()) {
      return "ios-adaptive";
    }
    return "fullscreen";
  }

  function requestFullscreen() {
    const element = document.documentElement;

    if (element.requestFullscreen) {
      return element.requestFullscreen();
    }

    if (element.webkitRequestFullscreen) {
      return element.webkitRequestFullscreen();
    }

    return Promise.reject(new Error("Fullscreen non disponibile"));
  }

  function isFullscreen() {
    return Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement
    );
  }

  function saveMode(mode) {
    sessionStorage.setItem(STORAGE_KEY, mode);
  }

  function getSavedMode() {
    return sessionStorage.getItem(STORAGE_KEY);
  }

  window.CR01Display = {
    getMode,
    requestFullscreen,
    isFullscreen,
    saveMode,
    getSavedMode
  };
})();
