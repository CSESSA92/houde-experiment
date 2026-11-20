# VPT-B — prototipo geometrico autonomo

Questa cartella contiene il primo prototipo tecnico della Sezione B del compito di Visual Perspective Taking.

## Stato

**Prototipo di verifica, non pronto per la somministrazione.**

La versione iniziale contiene esclusivamente lo stimolo B1 (libro rosso) e serve a verificare:
- costruzione di una scena tridimensionale comune;
- generazione di quattro alternative dalla stessa telecamera C180;
- variazione dell'orientamento del libro nella scena 3D per costruire tre distrattori;
- selezione di una vista e indicazione della sicurezza;
- funzionamento responsive di base.

Non invia dati a Google Sheets o Apps Script. La risposta dimostrativa resta nella pagina.

## Avvio

Aprire `index.html` tramite un server HTTP locale o tramite GitHub Pages dopo aver configurato la pubblicazione della cartella. Three.js viene caricato dalla CDN jsDelivr, quindi è necessaria una connessione Internet.

Per mostrare la diagnostica delle alternative aggiungere `?debug=1` all'URL. La diagnostica espone l'associazione tra lettere, varianti di orientamento e angoli di rotazione.

## Geometria provvisoria

- Piano del banco: 1,20 × 0,80 m.
- Altezza del piano: 0,75 m.
- Centro dell'oggetto: centro del banco.
- Altezza delle telecamere: 1,25 m.
- Distanza orizzontale dal centro: 1,50 m.
- Campo visivo verticale: 40°.
- Inclinazione risultante rispetto all'orizzontale: circa 17,9° (calcolata da quota camera, quota del punto di mira e distanza orizzontale).
- Punto di mira: (0, 0, 0,765).
- Posizione del marcatore dell'altro osservatore: (0, 1,50, 0), allineata con la posizione della telecamera C180.
- Sistema di coordinate: X larghezza, Y profondità, Z verticale.
- C0: lato del partecipante (Y negativo).
- C180: lato dell'altro osservatore (Y positivo).
- C90 e C270: lati corti del banco.

Le quattro telecamere condividono altezza, distanza, inclinazione risultante, FOV e punto di mira; cambia l'azimut. Il marcatore dell'altro osservatore è stato allineato con la posizione geometrica della telecamera C180. Il pavimento è collocato a Z=0; il piano del banco è a Z=0,75 m. Il libro è appoggiato sul piano del banco (quota inferiore del modello coincidente con Z=0,7675 m). L'inclinazione di circa 17,9° resta da verificare visivamente: potrebbe essere troppo bassa per rendere leggibili i dettagli sulla copertina.

## Nuova logica delle alternative B1

Le quattro alternative sono ora renderizzate tutte dalla stessa telecamera C180, collocata sul lato opposto rispetto al partecipante. La scena, la camera e i parametri di ripresa restano invariati; cambia soltanto la rotazione dell'oggetto libro attorno all'asse verticale:
- R0: 0° — orientamento originale, chiave prevista;
- R30: +30°;
- R-30: −30°;
- R60: +60°.

Le rotazioni sono applicate al modello 3D prima del rendering. Non vengono ruotate immagini già prodotte. L'ordine delle quattro alternative è mescolato a ogni avvio della prova.

## Avvertenze metodologiche

1. Questa modifica cambia la natura specifica della Sezione B: la prova non confronta più quattro posizioni di osservazione, ma richiede di riconoscere l'orientamento dell'oggetto dalla medesima posizione dell'altro osservatore. È quindi una misura più circoscritta di trasformazione/riconoscimento dell'orientamento dell'oggetto.
2. Gli angoli dei distrattori (+30°, −30°, +60°) sono parametri iniziali di progettazione, non ancora calibrati. La difficoltà effettiva deve essere verificata visivamente; non si può ancora concludere che la prova sia più difficile o psicometricamente adeguata.
3. La chiave R0 è geometrica: rappresenta il libro non ruotato nella scena. Va comunque controllata nella resa effettiva da C180.
4. La randomizzazione dell'ordine delle alternative nel prototipo non costituisce ancora una procedura di randomizzazione sperimentale documentata.
5. Il tempo di selezione viene calcolato dal momento in cui le quattro alternative sono state renderizzate e rese disponibili, non dall'avvio del rendering. Il tempo di indicazione della sicurezza è registrato separatamente. Sono tempi tecnici della demo, non misure validate.
6. Non utilizzare questo prototipo per raccogliere dati di ricerca.

## Prossimi passaggi

1. Verificare in browser che le quattro viste siano renderizzate correttamente.
2. Controllare visivamente e geometricamente l'orientamento del libro da C0, C90, C180 e C270.
3. Rivedere la posizione e la dimensione del simbolo asimmetrico.
4. Solo dopo la verifica, progettare e aggiungere B2–B6.
5. Definire il formato dati definitivo e il collegamento al sistema di raccolta generale.
