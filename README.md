# Freifunk Nodeviewer #

## Was ist das? ##

Der Nodeviewer ist eine tabellarische Ansicht von Freifunk-Knoten, basierend 
auf den Daten eines Meshviewers.

## Voraussetzungen / Installation ##

Die Installation sollte auf jedem "handelsüblichen" Webspace funktionieren. 
Voraussetzung ist PHP inkl. cURL-Modul.

Zur Installation einfach alle Dateien auf den Server kopieren. 
Abschließend muss noch die "config.js" im "js"-Verzeichnis editiert werden.

## Konfiguration ##

Einstellungen werden über die Datei "js/config.js" vorgenommen.

    //Überschrift
    var gTitle = "Freifunk Nordwest"
    //URL der Nodedaten.
    var gNodedaten = "https://map.ffnw.de/data/meshviewer.json";
    //URL zum Knoten auf der Map
    var gMapLink = "https://map.ffnw.de/#/en/map/{NODE_ID}"
    //URL zur Statistik des Knotens
    var gStatsLink = "https://grafana.ffnw.de/dashboard/db/single-node-influxdb?orgId=1&refresh=1m&var-Hostname={NODE_NAME}&var-NodeID={NODE_ID}";
    //URL zur Logodatei
    var gLogo = "https://ffnw.de/wp-content/uploads/2016/04/logo-1.png";
    //Daten alle x Sekunden neu laden. Werte unter 60 werden ignoriert.
    var gNeuLaden = 300;

## Filter ##

Die Ansicht des Viewers kann durch zusätzliche URL-Parameter gefiltert werden.
Als Parameter stehen "hostname", ~~"contact"~~, "online" zur Verfügung, die kombiniert werden können ("UND"-Verknüpfung)

~~"**hostname**" ermittelt alle Nodes, die den übergebenen Wert im Hostnamen enthalten. Es wird kein Wildcard-Zeichen benötigt.~~

"**contact**" ermittelt alle Nodes, deren Kontaktinfo dem übergebenen Wert entsprechen. Es wird kein Wildcard-Zeichen unterstützt.

"**online**" schränkt per "0" oder "1" den Online-Status eines Knotens ein.

### Beispiele ###

    index.html?contact=adresse@host.de

~~Zeigt alle Knoten an, deren Kontaktinfo "adresse@host.de" lautet.~~

    index.html?hostname=FF-WEE

Zeigt alle Knoten an, die "FF-WEE" im Hostnamen haben.

    index.html?online=1

Zeigt alle Knoten an, die online sind.