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
var gNeuLaden = 60;

