/* Sequenza CR-01: primi quattro compiti in ordine assegnato; GIUDIZIO sempre ultimo. */
(function(){
 const pages={ALMOST:"almost.html",HOUDE:"compito-houde.html",STROOP:"compito-stroop.html",VPT:"decentramento-prospettive-12.html",GIUDIZIO:"giudizio.html"};
 window.cr01AdvanceTask=function(completedTask){
  let order=[];try{order=JSON.parse(sessionStorage.getItem("CR01_TASK_ORDER")||"[]");}catch(e){}
  let index=Number(sessionStorage.getItem("CR01_TASK_INDEX")||"0");
  if(!Array.isArray(order)||order.length!==5||order[4]!=="GIUDIZIO"||!order.every(task=>Object.prototype.hasOwnProperty.call(pages,task))){alert("Sequenza sperimentale non valida. I risultati restano salvati su questo dispositivo; contatta il ricercatore.");return;}
  if(order[index]!==completedTask){alert("La sequenza dei compiti non corrisponde allo stato della sessione. Non proseguire e avvisa il ricercatore.");return;}
  index++;sessionStorage.setItem("CR01_TASK_INDEX",String(index));
  if(index<order.length)window.location.href=pages[order[index]];else window.location.href="esporta-dati.html";
 };
})();