# tm-forecast
Libreria javascript che permette di inserire le previsioni di TorinoMeteo all'interno di siti esterni utilizzando semplici tag.

La libreria consuma le nuove API REST di TorinoMeteo (ancora in una versione beta), sviluppate con django REST framework.

La libreria permette di renderizzare codice html nel posto desiderato all'interno del documento. La nuova section inclusa nel documento può essere stilizzata a piacere agendo sulle classi css utilizzate. Se si desidera avere un controllo fine della visualizzazione dei dati è consigliabile consumare direttamente le API per ottenere oggetti JSON manipolabili a piacere.

[Demo](http://codepen.io/abidibo/pen/EjrzMb)

## Utilizzo
La libreria necessita jquery, versione 1.x.

Includere la libreria jquery e tmforecast:

        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
        <script src="https://raw.githubusercontent.com/TorinoMeteo/tm-forecast/master/js/tmforecast.js"></script>

Inserire quindi all'interno del documento nel punto desiderato uno dei tag supportati dalla libreria.

Al momento è stata sviluppata anche la libreria utilizzabile con Mootools >= 1.4, ma non sarà supportata in futuro, in questo caso:

        <script src="https://ajax.googleapis.com/ajax/libs/mootools/1.5.1/mootools-yui-compressed.js"></script>
        <script src="https://raw.githubusercontent.com/TorinoMeteo/tm-forecast/master/js/tmforecast-mootools.js"></script>

## Tag supportati

### tmforecast

Ultimo bollettino emesso che comprende un andamento generale più le singoli previsioni per i 3 giorni a venire

    <tmforecast></tmforecast>

### tmdayforecast

Previsione completa per il giorno selezionato tramite attributo tm-date. La data deve essere nel formato YYYY-MM-DD.

    <tmdayforecast tm-date="2015-08-07"></tmdayforecast>

## TODO

- supportare altri tipi di tag, per le previsioni singole
- aggiungere attributi ed opzioni ad ogni tag
- bootstrap?

