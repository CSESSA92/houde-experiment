/* CR-01 - Controllo comune del dispositivo, della visualizzazione e degli eventi tecnici */
(function () {
  "use strict";
  const CONDITIONS_KEY = "CR01_CONDIZIONI_SOMMINISTRAZIONE";
  const EVENTS_KEY = "CR01_EVENTI_TECNICI";
  let currentTask = "NON_DEFINITO", monitoringStarted = false, resizeTimer = null;
  function read(key, fallback) { try { return JSON.parse(sessionStorage.getItem(key) || "null") || fallback; } catch (_) { return fallback; } }
  function write(key, value) { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  function isIOS() { return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
  function supportsFullscreen() { const e=document.documentElement; return Boolean(e.requestFullscreen || e.webkitRequestFullscreen); }
  function isFullscreen() { return Boolean(document.fullscreenElement || document.webkitFullscreenElement); }
  function orientation() { return screen.orientation && screen.orientation.type ? (screen.orientation.type.indexOf("landscape")===0?"ORIZZONTALE":"VERTICALE") : (innerWidth>=innerHeight?"ORIZZONTALE":"VERTICALE"); }
  function deviceType() {
    const ua=navigator.userAgent||"";
    if (/iPhone|iPod|Windows Phone|Android.*Mobile|Mobile/i.test(ua)) return "SMARTPHONE";
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua)&&!/Mobile/i.test(ua)) || (navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1)) return "TABLET";
    if (navigator.maxTouchPoints>1 && Math.min(screen.width||0,screen.height||0)>=600) return "TABLET";
    return "COMPUTER";
  }
  function operatingSystem() {
    const ua=navigator.userAgent||"";
    if (isIOS()) return "iOS/iPadOS";
    if (/Android/i.test(ua)) return "Android";
    if (/Windows/i.test(ua)) return "Windows";
    if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
    if (/CrOS/i.test(ua)) return "ChromeOS";
    if (/Linux/i.test(ua)) return "Linux";
    return "NON_RILEVATO";
  }
  function browserName() {
    const ua=navigator.userAgent||"";
    if (/Edg\//.test(ua)) return "Microsoft Edge";
    if (/OPR\//.test(ua)) return "Opera";
    if (/CriOS\//.test(ua)) return "Chrome iOS";
    if (/FxiOS\//.test(ua)) return "Firefox iOS";
    if (/Chrome\//.test(ua)) return "Chrome";
    if (/Firefox\//.test(ua)) return "Firefox";
    if (/Safari\//.test(ua)) return "Safari";
    return "NON_RILEVATO";
  }
  function snapshot() {
    return {
      tipo_dispositivo:deviceType(), sistema_operativo:operatingSystem(), browser:browserName(),
      viewport_larghezza:Math.round(innerWidth||0), viewport_altezza:Math.round(innerHeight||0),
      schermo_larghezza:Math.round(screen.width||0), schermo_altezza:Math.round(screen.height||0),
      orientamento:orientation(), fullscreen_supportato:supportsFullscreen(), fullscreen_attivo:isFullscreen(),
      modalita_visualizzazione:isIOS()?"ADATTIVA_IOS":(supportsFullscreen()?"FULLSCREEN_DISPONIBILE":"ADATTIVA"),
      rilevato_il:new Date().toISOString()
    };
  }
  function captureInitialConditions() { const old=read(CONDITIONS_KEY,null); if(old) return old; const data=snapshot(); write(CONDITIONS_KEY,data); return data; }
  function recordEvent(type, details) {
    const events=read(EVENTS_KEY,[]), s=snapshot();
    events.push({compito:currentTask,tipo_evento:type,timestamp:new Date().toISOString(),
      viewport_larghezza:s.viewport_larghezza,viewport_altezza:s.viewport_altezza,
      orientamento:s.orientamento,fullscreen_attivo:s.fullscreen_attivo,
      visibilita_pagina:document.visibilityState||"NON_RILEVATA",dettagli:details||""});
    write(EVENTS_KEY,events.slice(-500));
  }
  function startMonitoring(task) {
    currentTask=task||currentTask;
    if(monitoringStarted) return;
    monitoringStarted=true;
    window.addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>recordEvent("RIDIMENSIONAMENTO"),250);});
    window.addEventListener("orientationchange",()=>recordEvent("ROTAZIONE_DISPOSITIVO"));
    document.addEventListener("fullscreenchange",()=>recordEvent("CAMBIO_SCHERMO_INTERO"));
    document.addEventListener("webkitfullscreenchange",()=>recordEvent("CAMBIO_SCHERMO_INTERO"));
    document.addEventListener("visibilitychange",()=>recordEvent(document.hidden?"PAGINA_IN_BACKGROUND":"RITORNO_ALLA_PAGINA"));
  }
  async function requestFullscreen() {
    const e=document.documentElement;
    if(e.requestFullscreen){await e.requestFullscreen();return isFullscreen();}
    if(e.webkitRequestFullscreen){e.webkitRequestFullscreen();await new Promise(r=>setTimeout(r,250));return isFullscreen();}
    return false;
  }
  function createGate(onReady, options) {
    options=options||{}; currentTask=options.task||"COMPITO";
    captureInitialConditions(); startMonitoring(currentTask);
    recordEvent("CONTROLLO_VISUALIZZAZIONE","Avvio controllo preliminare");
    const overlay=document.createElement("div");
    overlay.id="cr01-display-gate";
    overlay.style.cssText="position:fixed;inset:0;z-index:999999;background:#090D16;color:#EDF4FA;display:flex;align-items:center;justify-content:center;padding:22px;font-family:Arial,sans-serif;text-align:center;overflow:auto";
    const card=document.createElement("div");
    card.style.cssText="width:min(100%,520px);padding:24px;background:#111A27;border:1px solid #26384A;border-radius:10px";
    const title=document.createElement("h2"); title.textContent="Preparazione della prova"; title.style.color="#58D9E8";
    const message=document.createElement("p"); message.style.cssText="line-height:1.65;color:#B7C5D1;font-size:14px";
    const status=document.createElement("p"); status.style.cssText="line-height:1.6;color:#91A3B4;font-size:12px";
    const primary=document.createElement("button"); primary.style.cssText="padding:14px 18px;margin:8px 5px;background:#153744;border:1px solid #58D9E8;border-radius:5px;color:#BDF6F8;font-size:13px;font-weight:bold;cursor:pointer";
    const adaptive=document.createElement("button"); adaptive.style.cssText="padding:12px 16px;margin:8px 5px;background:#0A111B;border:1px solid #526477;border-radius:5px;color:#D5E0E8;font-size:12px;cursor:pointer";
    function dimensionsOK(){return innerWidth>=320&&innerHeight>=300;}
    function refresh(){
      const s=snapshot(),ok=dimensionsOK();
      status.textContent="Dispositivo: "+s.tipo_dispositivo.toLowerCase()+" · Area disponibile: "+s.viewport_larghezza+" × "+s.viewport_altezza+" px · Orientamento: "+s.orientamento.toLowerCase()+".";
      if(!ok){message.textContent="L'area di visualizzazione è troppo ridotta per avviare la prova (minimo 320 × 300 px). Ingrandisci la finestra o modifica l'orientamento, quindi riprova.";primary.textContent="RICONTROLLA";adaptive.style.display="none";return;}
      adaptive.style.display="inline-block";
      if(s.fullscreen_attivo){message.textContent="Controllo superato. Lo schermo intero è attivo. Puoi iniziare la prova.";primary.textContent="INIZIA →";adaptive.style.display="none";}
      else if(isIOS()){message.textContent="Controllo preliminare superato. Su questo dispositivo il browser può limitare lo schermo intero: la prova si adatterà all'area disponibile.";primary.textContent="CONTINUA →";adaptive.style.display="none";}
      else if(supportsFullscreen()){message.textContent="Controllo preliminare superato. Puoi attivare lo schermo intero oppure continuare nella visualizzazione adattiva. La modalità adattiva non modifica gli stimoli.";primary.textContent="ATTIVA SCHERMO INTERO";adaptive.textContent="CONTINUA IN MODALITÀ ADATTIVA";}
      else{message.textContent="Controllo preliminare superato. Il browser non supporta lo schermo intero: la prova si adatterà all'area disponibile.";primary.textContent="CONTINUA →";adaptive.style.display="none";}
    }
    function finish(mode){
      const s=snapshot(),data=read(CONDITIONS_KEY,{});
      if(data.fullscreen_attivo_all_avvio===undefined) data.fullscreen_attivo_all_avvio=s.fullscreen_attivo;
      if(data.modalita_visualizzazione==="FULLSCREEN_DISPONIBILE" || data.modalita_visualizzazione==="ADATTIVA_IOS" || !data.modalita_visualizzazione) {
        data.modalita_visualizzazione=mode||(s.fullscreen_attivo?"FULLSCREEN":"ADATTIVA");
      }
      data.ultimo_controllo_il=new Date().toISOString(); write(CONDITIONS_KEY,data);
      recordEvent("AVVIO_COMPITO","Modalità: "+data.modalita_visualizzazione);
      overlay.remove(); if(typeof onReady==="function") onReady(data.modalita_visualizzazione);
    }
    primary.addEventListener("click",async()=>{
      if(!dimensionsOK()){refresh();return;}
      if(supportsFullscreen()&&!isFullscreen()&&!isIOS()){
        primary.disabled=true;primary.textContent="ATTENDI…";
        try{
          const activated=await requestFullscreen();
          if(activated){finish("FULLSCREEN");return;}
          message.textContent="Il browser non ha confermato lo schermo intero. Puoi riprovare oppure continuare in modalità adattiva.";
        }catch(_){message.textContent="Non è stato possibile attivare lo schermo intero. Puoi riprovare oppure continuare in modalità adattiva.";}
        primary.textContent="RIPROVA SCHERMO INTERO";primary.disabled=false;adaptive.style.display="inline-block";return;
      }
      finish(isFullscreen()?"FULLSCREEN":"ADATTIVA");
    });
    adaptive.addEventListener("click",()=>{if(!dimensionsOK()){refresh();return;}finish("ADATTIVA");});
    card.append(title,message,status,primary,adaptive); overlay.appendChild(card); document.body.appendChild(overlay); refresh();
  }
  window.CR01Display={isIOS,supportsFullscreen,isFullscreen,requestFullscreen,createGate,
    getConditions:()=>read(CONDITIONS_KEY,null),getEvents:()=>read(EVENTS_KEY,[]),
    recordEvent,startMonitoring};
})();