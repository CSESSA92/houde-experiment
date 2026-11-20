# VPT-B — prototipo geometrico autonomo

Questa cartella contiene il primo prototipo tecnico della Sezione B del compito di Visual Perspective Taking.

## Stato

**Prototipo di verifica, non pronto per la somministrazione.**

La versione iniziale contiene esclusivamente lo stimolo B1 (libro rosso) e serve a verificare:
- costruzione di una scena tridimensionale comune;
- generazione delle quattro viste da quattro telecamere;
- selezione di una vista e indicazione della sicurezza;
- funzionamento responsive di base.

Non invia dati a Google Sheets o Apps Script. La risposta dimostrativa resta nella pagina.

## Avvio

Aprire `index.html` tramite un server HTTP locale o tramite GitHub Pages dopo aver configurato la pubblicazione della cartella. Three.js viene caricato dalla CDN jsDelivr, quindi è necessaria una connessione Internet.

Per mostrare la diagnostica delle telecamere aggiungere `?debug=1` all'URL. La diagnostica espone l'associazione tra lettere delle alternative e identificativi camera.

## Geometria provvisoria

- Piano del banco: 1,20 × 0,80 m.
- Altezza del piano: 0,75 m.
- Centro dell'oggetto: centro del banco.
- Altezza delle telecamere: 1,25 m.
- Distanza orizzontale dal centro: 1,50 m.
- Campo visivo verticale: 40°.
- Inclinazione risultante rispetto all'orizzontale: circa 17,7° (calcolata da quota camera, quota del punto di mira e distanza orizzontale).
- Punto di mira: (0, 0, 0,765).
- Sistema di coordinate: X larghezza, Y profondità, Z verticale.
- C0: lato del partecipante (Y negativo).
- C180: lato dell'altro osservatore (Y positivo).
- C90 e C270: lati corti del banco.

Le quattro telecamere condividono altezza, distanza, inclinazione risultante, FOV e punto di mira; cambia l'azimut. L'inclinazione di circa 17,7° è ancora da verificare: potrebbe essere troppo bassa per rendere leggibili i dettagli sulla copertina del libro.

## Avvertenze metodologiche

1. La chiave C180 è una chiave geometrica provvisoria e deve essere controllata nella resa effettiva prima di considerare valida la prova.
2. Le viste laterali non sono automaticamente distrattori equivalenti: visibilità, occlusioni e salienza dei dettagli vanno esaminate.
3. La randomizzazione dell'ordine delle alternative nel prototipo non costituisce ancora una procedura di randomizzazione sperimentale documentata.
4. I tempi registrati sono tempi tecnici della demo, non misure validate.
5. Non utilizzare questo prototipo per raccogliere dati di ricerca.

## Prossimi passaggi

1. Verificare in browser che le quattro viste siano renderizzate correttamente.
2. Controllare visivamente e geometricamente l'orientamento del libro da C0, C90, C180 e C270.
3. Rivedere la posizione e la dimensione del simbolo asimmetrico.
4. Solo dopo la verifica, progettare e aggiungere B2–B6.
5. Definire il formato dati definitivo e il collegamento al sistema di raccolta generale.
