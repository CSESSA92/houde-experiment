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

  function isFullscreen() {
    return Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement
    );
  }

  function getMode() {
    if (isIOS()) {
      return "ios-adaptive";
    }

    return supportsFullscreen() ? "fullscreen" : "adaptive";
  }

  function saveMode(mode) {
    sessionStorage.setItem(STORAGE_KEY, mode);
  }

  function getSavedMode() {
    return sessionStorage.getItem(STORAGE_KEY);
  }

  async function requestFullscreen() {
    const element = document.documentElement;

    if (element.requestFullscreen) {
      await element.requestFullscreen();
      return isFullscreen();
    }

    if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
      return isFullscreen();
    }

    return false;
  }

  function createGate(onReady) {
    const mode = getMode();

    const overlay = document.createElement("div");
    overlay.id = "cr01-display-gate";

    overlay.style.cssText = [
      "position:fixed",
      "inset:0",
      "z-index:999999",
      "background:#090D16",
      "color:#EDF4FA",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "padding:24px",
      "font-family:Arial,sans-serif",
      "text-align:center"
    ].join(";");

    const content = document.createElement("div");
    content.style.maxWidth = "480px";

    const title = document.createElement("h2");
    title.textContent = "Preparazione della prova";
    title.style.color = "#58D9E8";

    const message = document.createElement("p");
    message.style.lineHeight = "1.7";
    message.style.color = "#B7C5D1";

    const button = document.createElement("button");
    button.textContent = "CONTINUA →";
    button.style.cssText =
      "padding:15px 28px;margin-top:20px;background:#153744;" +
      "border:1px solid #58D9E8;border-radius:5px;color:#BDF6F8;" +
      "font-size:14px;font-weight:bold;cursor:pointer";

    if (mode === "ios-adaptive") {
      message.textContent =
        "La prova si adatterà allo spazio disponibile sul dispositivo. " +
        "Per una visualizzazione più immersiva, puoi aprire CR-01 " +
        "dalla schermata Home, se hai aggiunto questa pagina come web app.";
    } else if (mode === "fullscreen") {
      message.textContent =
        "Per svolgere la prova è necessario attivare la modalità a schermo intero. " +
        "Premi CONTINUA per attivarla.";
    } else {
      message.textContent =
        "Il browser non supporta la modalità a schermo intero. " +
        "La prova verrà visualizzata adattandosi allo spazio disponibile.";
    }

    button.addEventListener("click", async function () {
      button.disabled = true;
      button.textContent = "ATTENDI...";

      if (mode === "fullscreen") {
        try {
          const activated = await requestFullscreen();

          if (!activated) {
            message.textContent =
              "Non è stato possibile attivare lo schermo intero. " +
              "Controlla le impostazioni del browser e riprova.";
            button.disabled = false;
            button.textContent = "RIPROVA";
            return;
          }
        } catch (error) {
          message.textContent =
            "Il browser non ha autorizzato lo schermo intero. " +
            "Premi RIPROVA oppure verifica le impostazioni.";
          button.disabled = false;
          button.textContent = "RIPROVA";
          return;
        }
      }

      saveMode(mode);
      overlay.remove();

      if (typeof onReady === "function") {
        onReady(mode);
      }
    });

    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(button);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
  }

  window.CR01Display = {
    getMode,
    isFullscreen,
    requestFullscreen,
    saveMode,
    getSavedMode,
    createGate
  };
})();
