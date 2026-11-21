/**
 * CR-01 – ricevitore dati per il nuovo archivio.
 * Da aggiungere al progetto Apps Script "CR-01 – Sistema di raccolta".
 * Non sostituisce setupArchivioCR01() e non accede al vecchio archivio.
 *
 * Dopo aver incollato: salva, esegui setupArchivioCR01() (se già eseguito,
 * la funzione verifica/integra le intestazioni senza cancellare le righe),
 * quindi distribuisci come Web App.
 */

const CR01_RECEIVER_SPREADSHEET_ID = "1qxPdQZMr1lTweLO7QkMeTGWW2h5DkaJ1xjXeJyi3Szk";
const CR01_RECEIVER_TASKS = ["ALMOST", "HOUDE", "STROOP", "VPT"];
const CR01_RECEIVER_HEADERS = {
  PARTECIPANTI: [
    "ID_PARTECIPANTE","DATA_REGISTRAZIONE","ETA","SESSO","ANNI_SERVIZIO",
    "ORDINE_SCOLASTICO","TITOLO_STUDIO","ABILITAZIONE_CLASSE_CONCORSO",
    "ABILITAZIONE_SOSTEGNO","ANNO_CONSEGUIMENTO_TITOLO","ANNO_INSERIMENTO_GPS_GAE",
    "TOKEN_CLIENT","PROFILO_JSON"
  ],
  SESSIONI: ["ID_SESSIONE","ID_PARTECIPANTE","DATA_INIZIO","DATA_FINE","STATO","NOTE"],
  ORDINE_COMPITI: ["ID_PARTECIPANTE","ORDINE_ASSEGNATO","DATA_ASSEGNAZIONE"],
  HOUDE_PROVE: ["ID_PARTECIPANTE","ID_SESSIONE","NUMERO_PROVA","STIMOLO","RISPOSTA","RISPOSTA_CORRETTA","ACCURATEZZA","TEMPO_RISPOSTA_MS","TIMESTAMP"],
  STROOP_PROVE: ["ID_PARTECIPANTE","ID_SESSIONE","NUMERO_PROVA","CONDIZIONE","STIMOLO","RISPOSTA","ACCURATEZZA","TEMPO_RISPOSTA_MS","TIMESTAMP"],
  VPT_PROVE: ["ID_PARTECIPANTE","ID_SESSIONE","NUMERO_PROVA","SESSIONE_VPT","STIMOLO","RISPOSTA","ACCURATEZZA","TEMPO_RISPOSTA_MS","TIMEOUT","ORIENTAMENTO","INTERRUZIONE_ORIENTAMENTO","TIMESTAMP"],
  ALMOST_EVENTI: ["ID_PARTECIPANTE","ID_SESSIONE","NUMERO_EVENTO","TEMPO_VIDEO_MS","TIMESTAMP_PRESSIONE"],
  ALMOST_RIEPILOGO: ["ID_PARTECIPANTE","ID_SESSIONE","DURATA_VIDEO_MS","NUMERO_PRESSIONI","PAUSE","ANOMALIE","TIMESTAMP"],
  GIUDIZIO_PROVE: [
    "ID_PARTECIPANTE","ID_SESSIONE","NUMERO_PROVA","ID_STIMOLO",
    "DIMENSIONE_TEORICA","TESTO_STIMOLO","ORDINE_PRESENTAZIONE",
    "D1_RICONOSCIMENTO_ETICHETTAMENTO","D1_TEMPO_RISPOSTA_MS",
    "D2_SENSIBILITA_CONSEGUENZE_INCLUSIVE","D2_TEMPO_RISPOSTA_MS",
    "TIMESTAMP_D1","TIMESTAMP_D2","TIMESTAMP_COMPLETAMENTO"
  ]
};

function cr01ReceiverBook_() {
  return SpreadsheetApp.openById(CR01_RECEIVER_SPREADSHEET_ID);
}
function cr01ReceiverSheet_(name) {
  const ss = cr01ReceiverBook_();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  const required = CR01_RECEIVER_HEADERS[name];
  if (required) {
    const width = Math.max(sh.getLastColumn(), required.length);
    const existing = width ? sh.getRange(1,1,1,width).getValues()[0] : [];
    const headers = existing.filter(String);
    required.forEach(h => { if (headers.indexOf(h) === -1) headers.push(h); });
    sh.getRange(1,1,1,headers.length).setValues([headers]);
  }
  return sh;
}
function cr01ReceiverEnsureSchema_() {
  Object.keys(CR01_RECEIVER_HEADERS).forEach(cr01ReceiverSheet_);
  const log = cr01ReceiverBook_().getSheetByName("_RICEZIONI_CR01") || cr01ReceiverBook_().insertSheet("_RICEZIONI_CR01");
  if (log.getLastRow() === 0) log.appendRow(["SUBMISSION_ID","ID_PARTECIPANTE","TIPO","DATA_RICEZIONE"]);
}
function cr01ReceiverJson_(obj, callback) {
  const json = JSON.stringify(obj);
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$\.]{0,80}$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + json + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
function doGet(e) {
  const p = (e && e.parameter) || {};
  const action = p.action || "";
  if (action === "nuovoPartecipante") return cr01ReceiverNewParticipant_(p);
  if (action === "verificaInvio") return cr01ReceiverVerify_(p);
  return cr01ReceiverJson_({success:true,service:"CR-01",version:"1.0"});
}
function cr01ReceiverNewParticipant_(p) {
  const callback = p.callback || "";
  const token = String(p.token || "").trim();
  if (!token) return cr01ReceiverJson_({success:false,error:"Token partecipante mancante."}, callback);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    cr01ReceiverEnsureSchema_();
    const sh = cr01ReceiverSheet_("PARTECIPANTI");
    const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
    const tokenCol = headers.indexOf("TOKEN_CLIENT") + 1;
    let participant = "";
    if (sh.getLastRow() > 1 && tokenCol > 0) {
      const tokens = sh.getRange(2,tokenCol,sh.getLastRow()-1,1).getDisplayValues().flat();
      const idx = tokens.indexOf(token);
      if (idx >= 0) participant = String(sh.getRange(idx+2,headers.indexOf("ID_PARTECIPANTE")+1).getDisplayValue());
    }
    if (!participant) {
      const props = PropertiesService.getScriptProperties();
      const next = Number(props.getProperty("CR01_NEXT_PARTICIPANT") || "1");
      participant = "CR01-" + String(next).padStart(5,"0");
      props.setProperty("CR01_NEXT_PARTICIPANT", String(next+1));
      const now = new Date();
      const row = headers.map(h => ({
        ID_PARTECIPANTE:participant, DATA_REGISTRAZIONE:now, TOKEN_CLIENT:token
      }[h] !== undefined ? ({
        ID_PARTECIPANTE:participant, DATA_REGISTRAZIONE:now, TOKEN_CLIENT:token
      }[h]) : ""));
      sh.appendRow(row);
      const tasks = CR01_RECEIVER_TASKS.slice();
      for (let i=tasks.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [tasks[i],tasks[j]]=[tasks[j],tasks[i]]; }
      cr01ReceiverSheet_("ORDINE_COMPITI").appendRow([participant,JSON.stringify(tasks.concat(["GIUDIZIO"])),now]);
      cr01ReceiverSheet_("SESSIONI").appendRow([participant+"-main",participant,now,"","AVVIATA",""]);
    }
    const orderSheet = cr01ReceiverSheet_("ORDINE_COMPITI");
    const orderRows = orderSheet.getDataRange().getValues();
    let tasks = CR01_RECEIVER_TASKS.slice();
    for (let i=1;i<orderRows.length;i++) if (String(orderRows[i][0])===participant) {
      try { tasks=JSON.parse(orderRows[i][1]); } catch (_) {}
      break;
    }
    return cr01ReceiverJson_({success:true,participant_id:participant,tasks:tasks.slice(0,4),sequence:tasks.join("|")},callback);
  } catch (err) {
    return cr01ReceiverJson_({success:false,error:String(err.message || err)},callback);
  } finally { lock.releaseLock(); }
}
function doPost(e) {
  try {
    cr01ReceiverEnsureSchema_();
    let raw = "";
    if (e && e.parameter && e.parameter.payload) raw = e.parameter.payload;
    else if (e && e.postData && e.postData.contents) raw = e.postData.contents;
    if (!raw) throw new Error("Payload vuoto.");
    let data = JSON.parse(raw);
    if (data.payload && typeof data.payload === "string") data = JSON.parse(data.payload);
    const result = cr01ReceiverSave_(data);
    return cr01ReceiverJson_(result);
  } catch (err) {
    return cr01ReceiverJson_({success:false,error:String(err.message || err)});
  }
}
function cr01ReceiverSave_(d) {
  const participant = String(d.participant_id || "").trim();
  if (!participant) throw new Error("ID partecipante mancante.");
  const participantSheet = cr01ReceiverSheet_("PARTECIPANTI");
  const participantHeaders = participantSheet.getRange(1,1,1,participantSheet.getLastColumn()).getValues()[0];
  const participantIdCol = participantHeaders.indexOf("ID_PARTECIPANTE")+1;
  const knownIds = participantSheet.getLastRow()>1 ? participantSheet.getRange(2,participantIdCol,participantSheet.getLastRow()-1,1).getDisplayValues().flat() : [];
  if (knownIds.indexOf(participant)<0) throw new Error("ID partecipante non riconosciuto.");
  const submissionId = String(d.submission_id || (d.session && d.session.session_id ? "FINAL_"+participant+"_"+d.session.session_id : "SUB_"+participant));
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const log = cr01ReceiverBook_().getSheetByName("_RICEZIONI_CR01");
    const seen = log.getLastRow()>1 ? log.getRange(2,1,log.getLastRow()-1,1).getDisplayValues().flat() : [];
    if (seen.indexOf(submissionId)>=0) return {success:true,duplicate:true,submission_id:submissionId};
    if (d.profile) cr01ReceiverSaveProfile_(participant,d.profile);
    if (d.session) cr01ReceiverSaveSession_(participant,d.session);
    cr01ReceiverSaveHoude_(participant,d.reasoning || []);
    cr01ReceiverSaveStroop_(participant,d.stroop || []);
    cr01ReceiverSaveVpt_(participant,d.vpt || []);
    if (d.almost) cr01ReceiverSaveAlmost_(participant,d.almost);
    cr01ReceiverSaveGiudizio_(participant,d.giudizio || []);
    log.appendRow([submissionId,participant,d.profile?"PROFILE":"SESSION_DATA",new Date()]);
    return {success:true,submission_id:submissionId};
  } finally { lock.releaseLock(); }
}
function cr01ReceiverAppendByHeader_(sheetName, objects) {
  if (!objects || !objects.length) return;
  const sh = cr01ReceiverSheet_(sheetName);
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const rows = objects.map(o => headers.map(h => o[h] !== undefined ? o[h] : ""));
  sh.getRange(sh.getLastRow()+1,1,rows.length,headers.length).setValues(rows);
}
function cr01ReceiverSaveProfile_(id,p) {
  const sh=cr01ReceiverSheet_("PARTECIPANTI"),headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const idCol=headers.indexOf("ID_PARTECIPANTE")+1, rowNum=sh.getLastRow()>1?sh.getRange(2,idCol,sh.getLastRow()-1,1).getDisplayValues().flat().indexOf(id)+2:0;
  const vals={
    ETA:p.age||"",SESSO:p.sex||"",ANNI_SERVIZIO:p.experience||"",
    ORDINE_SCOLASTICO:Array.isArray(p.schools)?p.schools.join("; "):(p.schools||""),
    TITOLO_STUDIO:p.qualification||"",ABILITAZIONE_CLASSE_CONCORSO:p.habilitationClasses||p.habilitation||"",
    ABILITAZIONE_SOSTEGNO:p.supportSpecialization||"",ANNO_CONSEGUIMENTO_TITOLO:p.degreeYear||"",
    PROFILO_JSON:JSON.stringify(p)
  };
  if (!rowNum) throw new Error("Partecipante non presente nell'archivio: "+id);
  const row=sh.getRange(rowNum,1,1,headers.length).getValues()[0];
  headers.forEach((h,i)=>{if(vals[h]!==undefined)row[i]=vals[h];});
  sh.getRange(rowNum,1,1,headers.length).setValues([row]);
}
function cr01ReceiverSaveSession_(id,s) {
  const sh=cr01ReceiverSheet_("SESSIONI"),sid=String(s.session_id||id+"-main");
  const vals=[sid,id,s.started_at||"",s.submitted_at||new Date(),"COMPLETATA",JSON.stringify({task_order:s.task_order||"",task_order_assigned_at:s.task_order_assigned_at||"",task_block_order:s.task_block_order||"",task_block_order_assigned_at:s.task_block_order_assigned_at||""})];
  sh.appendRow(vals);
}
function cr01ReceiverSaveHoude_(id,rows) {
  cr01ReceiverAppendByHeader_("HOUDE_PROVE",rows.map((r,i)=>({
    ID_PARTECIPANTE:id,ID_SESSIONE:id+"-main",NUMERO_PROVA:r.presentation_order||i+1,
    STIMOLO:r.item_id||"",RISPOSTA:r.response===1?"SI":r.response===0?"NO":r.response||"",
    RISPOSTA_CORRETTA:r.response_correct===1?"SI":"NO",ACCURATEZZA:r.response_correct||0,
    TEMPO_RISPOSTA_MS:r.response_time_ms||"",TIMESTAMP:r.completed_at||""
  })));
}
function cr01ReceiverSaveStroop_(id,rows) {
  cr01ReceiverAppendByHeader_("STROOP_PROVE",rows.map((r,i)=>({
    ID_PARTECIPANTE:id,ID_SESSIONE:id+"-main",NUMERO_PROVA:r.trial||r.presentation_order||i+1,
    CONDIZIONE:r.condition||r.congruency||"",STIMOLO:r.stimulus||r.word||"",
    RISPOSTA:r.response||"",ACCURATEZZA:r.correct||0,TEMPO_RISPOSTA_MS:r.response_time_ms||"",TIMESTAMP:r.completed_at||""
  })));
}
function cr01ReceiverSaveVpt_(id,rows) {
  cr01ReceiverAppendByHeader_("VPT_PROVE",rows.map((r,i)=>({
    ID_PARTECIPANTE:id,ID_SESSIONE:id+"-main",NUMERO_PROVA:r.trial||i+1,
    SESSIONE_VPT:r.session||"",STIMOLO:r.layout||"",RISPOSTA:r.response_bank||"",
    ACCURATEZZA:r.correct||0,TEMPO_RISPOSTA_MS:r.response_time_ms||"",
    TIMEOUT:r.timed_out||0,ORIENTAMENTO:r.orientation||"",INTERRUZIONE_ORIENTAMENTO:r.orientation_interruptions||"",TIMESTAMP:r.completed_at||""
  })));
}
function cr01ReceiverSaveAlmost_(id,a) {
  const presses=Array.isArray(a.presses)?a.presses:[];
  cr01ReceiverAppendByHeader_("ALMOST_EVENTI",presses.map((r,i)=>({
    ID_PARTECIPANTE:id,ID_SESSIONE:id+"-main",NUMERO_EVENTO:r.event_number||i+1,
    TEMPO_VIDEO_MS:Math.round(Number(r.video_time_s||0)*1000),TIMESTAMP_PRESSIONE:r.wall_time||""
  })));
  cr01ReceiverAppendByHeader_("ALMOST_RIEPILOGO",[{
    ID_PARTECIPANTE:id,ID_SESSIONE:id+"-main",DURATA_VIDEO_MS:Math.round(Number(a.video_duration_s||0)*1000),
    NUMERO_PRESSIONI:a.press_count||presses.length,PAUSE:a.pause_attempts||0,
    ANOMALIE:a.seek_anomalies||0,TIMESTAMP:a.completed_at||""
  }]);
}
function cr01ReceiverSaveGiudizio_(id,rows) {
  cr01ReceiverAppendByHeader_("GIUDIZIO_PROVE",rows.map((r,i)=>({
    ID_PARTECIPANTE:id,ID_SESSIONE:id+"-main",NUMERO_PROVA:i+1,ID_STIMOLO:r.stimulus_id||"",
    DIMENSIONE_TEORICA:r.dimensione_teorica||"",TESTO_STIMOLO:r.testo_stimolo||"",
    ORDINE_PRESENTAZIONE:r.ordine_presentazione||i+1,
    D1_RICONOSCIMENTO_ETICHETTAMENTO:r.D1_riconoscimento_etichettamento||"",
    D1_TEMPO_RISPOSTA_MS:r.D1_tempo_risposta_ms||"",
    D2_SENSIBILITA_CONSEGUENZE_INCLUSIVE:r.D2_sensibilita_conseguenze_inclusive||"",
    D2_TEMPO_RISPOSTA_MS:r.D2_tempo_risposta_ms||"",
    TIMESTAMP_D1:r.timestamp_d1||"",TIMESTAMP_D2:r.timestamp_d2||"",
    TIMESTAMP_COMPLETAMENTO:r.completed_at||""
  })));
}
function cr01ReceiverVerify_(p) {
  const callback=p.callback||"",submission=String(p.submission_id||"");
  const sh=cr01ReceiverBook_().getSheetByName("_RICEZIONI_CR01");
  const vals=sh && sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,1).getDisplayValues().flat():[];
  return cr01ReceiverJson_({success:vals.indexOf(submission)>=0},callback);
}


/** Eseguire una volta dall'editor per integrare le intestazioni del nuovo archivio. */
function preparaRicevitoreCR01() {
  cr01ReceiverEnsureSchema_();
  Logger.log('Ricevitore CR-01 pronto: intestazioni verificate senza cancellare dati.');
}
