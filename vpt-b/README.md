# VPT-B — prototipi geometrici autonomi

Questa cartella contiene prototipi tecnici autonomi per gli stimoli della Sezione B.

## Stato

**Prototipi di verifica, non pronti per la somministrazione.**

- `index.html`: B1, libro rosso.
- `b2.html`: B2, quaderno blu con spirale metallica.

Entrambi servono a verificare la costruzione della scena tridimensionale, la generazione delle quattro alternative dalla stessa telecamera C180, la selezione di una vista, la sicurezza dichiarata e il funzionamento responsive di base.

Non inviano dati a Google Sheets o Apps Script. La risposta dimostrativa resta nella pagina.

## Avvio

Aprire il file desiderato tramite un server HTTP locale o tramite GitHub Pages dopo aver configurato la pubblicazione della cartella. Three.js viene caricato dalla CDN jsDelivr, quindi è necessaria una connessione Internet.

Per mostrare la diagnostica delle alternative aggiungere `?debug=1` all'URL. La diagnostica espone l'associazione tra lettere, varianti di orientamento e angoli di rotazione.

## Geometria comune provvisoria

- Piano del banco: 1,20 × 0,80 m.
- Altezza del piano: 0,75 m.
- Centro dell'oggetto: centro del banco.
- Altezza delle telecamere: 1,25 m.
- Distanza orizzontale dal centro: 1,50 m.
- Campo visivo verticale: 40°.
- Inclinazione risultante rispetto all'orizzontale: circa 17,9°.
- Punto di mira: (0, 0, 0,765).
- Posizione del marcatore dell'altro osservatore: (0, 1,50, 0), allineata con la posizione della telecamera C180.
- Sistema di coordinate: X larghezza, Y profondità, Z verticale.
- C0: lato del partecipante (Y negativo).
- C180: lato dell'altro osservatore (Y positivo).

Il pavimento è collocato a Z=0; il piano del banco è a Z=0,75 m. I modelli sono appoggiati sul piano del banco. L'inclinazione e la leggibilità dei dettagli devono ancora essere controllate visivamente.

## Logica delle alternative

Le quattro alternative sono renderizzate tutte dalla stessa telecamera C180, collocata sul lato opposto rispetto al partecipante. La scena, la camera e i parametri di ripresa restano invariati; cambia soltanto la rotazione dell'oggetto attorno all'asse verticale:

- R0: 0° — orientamento originale, chiave prevista;
- R30: +30°;
- R-30: −30°;
- R60: +60°.

Le rotazioni sono applicate al modello 3D prima del rendering. Non vengono ruotate immagini già prodotte. L'ordine delle quattro alternative è mescolato a ogni avvio della prova.

## Specifiche degli stimoli

### B1 — Libro rosso

Copertina rossa neutra, senza titolo, autore, logo o riferimenti editoriali, con un piccolo simbolo geometrico asimmetrico sulla copertina.

### B2 — Quaderno blu

Quaderno rettangolare blu, con spirale metallica lungo un lato lungo e un piccolo simbolo giallo asimmetrico. Non sono presenti scritte o decorazioni identificative.

## Avvertenze metodologiche e tecniche

1. Questa configurazione non confronta quattro posizioni di osservazione: richiede di riconoscere l'orientamento dell'oggetto dalla medesima posizione dell'altro osservatore. È quindi una prova circoscritta di trasformazione/riconoscimento dell'orientamento dell'oggetto, non una misura generale di visual perspective taking.
2. Gli angoli dei distrattori (+30°, −30°, +60°) sono parametri iniziali, non calibrati. Non si può ancora concludere che la difficoltà sia adeguata o psicometricamente validata.
3. La chiave R0 rappresenta l'oggetto non ruotato nella scena. Va controllata nella resa effettiva da C180.
4. La randomizzazione dell'ordine delle alternative nel prototipo non costituisce ancora una procedura di randomizzazione sperimentale documentata.
5. Il tempo di selezione viene calcolato dal momento in cui le quattro alternative sono state renderizzate e rese disponibili; il tempo di indicazione della sicurezza è registrato separatamente. Sono tempi tecnici della demo, non misure validate.
6. I prototipi non devono essere utilizzati per raccogliere dati di ricerca.

## Prossimi passaggi

1. Verificare in browser le quattro viste di B1 e B2.
2. Controllare visivamente e geometricamente l'orientamento degli oggetti e la leggibilità dei rispettivi dettagli.
3. Progettare B3–B6 mantenendo esplicita la distinzione tra prospettiva spaziale e riconoscimento dell'orientamento.
4. Definire il formato dati definitivo e il collegamento al sistema di raccolta generale.
