/* global $ */
/* global gTitle */
/* global gMapLink */
/* global gStatsLink */
/* global gLogo */
/* global gNeuLaden */
/* global gNodedaten */

var gNodes;
var intOnline = 0;
var intOffline = 0;
var intClients = 0;
var intFilter = 0;
var intTotal = 0;
var intClientsTotal = 0;

$(document).ready(function(){
    loadConfig();
    if (gNeuLaden < 60) { 
        gNeuLaden = 60 ;
    }
}); 

function loadConfig() {
    if (typeof gLogo !== 'undefined' && typeof gNodes === "undefined") {
        $("body").append("<img src='" + gLogo + "' class='logo'/>");
    }
    
    $("title").text("Nodeviewer - " + gTitle);
    $("h1").text(gTitle);
    
    var url = "getjson.php?url=" + encodeURI(gNodedaten);
    console.log("Config: " + url);
    loadNodes(url);
}

function loadNodes(strNodesURL) {
    console.log("Nodes: " + strNodesURL);
    $.getJSON(strNodesURL, function(nodes) {
        showNodes(nodes);
        if (typeof gNodes === "undefined") {
            gNodes = nodes;
            //Tablesorter aktivieren
            $("#nodes").tablesorter({
                sortList: [[1,0]],
                headers: { 
                    0: {sorter: false},
                    3: {sorter: false}
                } 
            }); 
        }
        setTimeout(loadConfig, gNeuLaden * 1000);
    });
}

function showNodes(nodes) {
    
    var arrParms = getParameters();
    var strFilterKontakt = false;
    var strFilterOnline = -1;
    var strFilterHostname = false;
    
    intOnline = 0;
    intOffline = 0;
    intClients = 0;
    intFilter = 0;
    intTotal = 0;
    intClientsTotal = 0;
    
    if (arrParms.hasOwnProperty("contact")) {
        strFilterKontakt = arrParms["contact"].toLowerCase();
    }
    
    if (arrParms.hasOwnProperty("online")) {
        strFilterOnline = arrParms["online"];
    }
    
    if (arrParms.hasOwnProperty("hostname")) {
        strFilterHostname = arrParms["hostname"];
    }

    $(".loader").show();
    
    $.each(nodes.nodes, function(id, nodedata) {
        var bolShow = true;
        
        intTotal++;
        if (nodedata.hasOwnProperty("clients")) {
            intClientsTotal = intClientsTotal + parseInt(nodedata.clients,10);
        }
        
        //Kontaktfilter
        if (strFilterKontakt) {
            if (nodedata.hasOwnProperty("owner")) {
                if (strFilterKontakt != nodedata.owner.toLowerCase()) {
                    bolShow = false;
                }
            } else {
                bolShow = false;
            }    
        }
        
        //Online-Filter
        if (strFilterOnline > -1) {
            if (nodedata.is_online != strFilterOnline) {
                bolShow = false;
            }
        }
        
        //Hostname-Filter
        if (strFilterHostname) {
            if (nodedata.hostname.toLowerCase().indexOf(strFilterHostname.toLowerCase()) === -1) {
                bolShow = false;
            }
        }
        
        if (bolShow) {
            intFilter++;
            console.log("ID:[" + nodedata.node_id + "]");
            initRow(nodedata.node_id);
            populateRow(nodedata.node_id, nodedata);
        }
        
    });  

    if (typeof gNodes != "undefined") {
        refreshTable();
    }
    
    $("#online").text(intOnline);
    $("#offline").text(intOffline);
    if (intClients < intClientsTotal) {
        $("#clients").text(intClients + "/" + intClientsTotal);
    } else {
        $("#clients").text(intClients);
    }
    if (intFilter < intTotal) {
        $("#filter").text(intFilter + "/" + intTotal);
    } else {
        $("#filter").text(intTotal);
    }
    
    var datTimestamp = new Date(nodes.timestamp);
    $("#clock").text(datTimestamp.toLocaleDateString() + " " + datTimestamp.toLocaleTimeString());
    $("#summary").show();
    $(".loader").hide();
}

function initRow(id) {
    var row;
    row = $("#nodes tbody:first #" + id);
    if (row.length === 0) { 
        row = "<tr id='" + id + "'>";
        row = row + "<td class='td-status'></td>";
        row = row + "<td class='td-hostname'></td>";
        row = row + "<td class='td-clients'></td>";
        row = row + "<td class='td-uptime'></td>";
        row = row + "<td class='td-router'></td>";
        row = row + "<td class='td-owner'></td>";
        row = row + "<td class='td-firmware'></td>";
        row = row + "<td class='td-load'></td>";
        row = row + "</tr>";
        $("#nodes tbody:first").append(row);
    } else {
        row = row[0];
    }
    return row;
}

function populateRow(id, nodedata) {
    var strImg;
    var strRouter = "";
    var strFirmware = "";
    var strKontakt = "";
    var strSystemlast = "";
    var strUptime = "";
    var strClients = "";
    var strNodeID = "";
    
    //Hardware
    if (nodedata.hasOwnProperty("model")) {
        strRouter = nodedata.model;
        if (nodedata.hasOwnProperty("firmware")) {
            if (nodedata.firmware.hasOwnProperty("release")) {
                strFirmware = nodedata.firmware.release;
            }
        }
    }
    
    //Kontakt
    if (nodedata.hasOwnProperty("owner")) {
        strKontakt = nodedata.owner;
    } 
    
    //Systemlast
    if (nodedata.hasOwnProperty("loadavg")) {
        strSystemlast = nodedata.loadavg;
    } 
    
    //Uptime
    if (nodedata.hasOwnProperty("uptime")) {
        strUptime = formatUptime(nodedata.uptime);
    }
    
    //Clients
    if (nodedata.hasOwnProperty("clients")) {
        strClients = nodedata.clients;
        intClients = intClients + parseInt(nodedata.clients);
    }
    
    //Node-ID
    if (nodedata.hasOwnProperty("node_id")) {
        strNodeID = nodedata.node_id;
    } 
    
    //Link zum Node im Meshviewer
    var strMeshLink = gMapLink.replace("{NODE_ID}", strNodeID);
    var strStatLink = gStatsLink.replace("{NODE_ID}", strNodeID);
    strStatLink = strStatLink.replace("{NODE_NAME}", nodedata.hostname);
    
    var row = $("#" + id);
    
    $("td",row).empty();
    
    //Online/Offline
    if (nodedata.is_online == true) {
        $(".td-status", row).append("<img src='img/on.png' title='Router ist online' class='onoff' />");
        row.removeClass("offline");
        intOnline++;
    } else {
        $(".td-status", row).append("<img src='img/off.png' title='Router ist offline' class='onoff' />");
        row.addClass("offline");
        intOffline++;
    }
    
    //Hostname
    $(".td-hostname", row).append(nodedata.hostname);
    
    //Hostinfos und Menü
    var tabInfo = "<table class='nodeinfo'><tbody><tr>";
    tabInfo = tabInfo + "<td>";
    tabInfo = tabInfo + "<a href='" + strMeshLink + "' target='_blank'><img src='img/map.png' title='Router im Meshviewer anzeigen' /></a>";
    tabInfo = tabInfo + "</td>";
    tabInfo = tabInfo + "<td>";
    if (strStatLink != "") {
        tabInfo = tabInfo + "<a href='" + strStatLink + "' target='_blank'><img src='img/stats.png' title='Statistiken des Routers anzeigen' /></a>";
    }
    tabInfo = tabInfo + "</td>";
    tabInfo = tabInfo + "</tr></tbody></table>";
    $(".td-hostname", row).append(tabInfo);
    
    //Clients
    $(".td-clients", row).append(strClients);
    
    //Uptime
    $(".td-uptime", row).append(strUptime);
    
    //Router
    $(".td-router", row).append(strRouter);
    
    //Firmware
    $(".td-firmware", row).append(strFirmware);
    
    //Systemlast
    $(".td-load", row).append(strSystemlast);
    if (strSystemlast > 1) {
        $(".td-load", row).addClass("highload");
    } else {
        $(".td-load", row).removeClass("highload");
    }
    
    //Kontakt 
    $(".td-owner", row).append(strKontakt);
    
    return row;
}

function refreshTable() {
    $("#nodes").trigger("update");
    $("#nodes").trigger("sorton", [$("#nodes").get(0).config.sortList]);
}

function getParameters () {
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");

    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
    } else if (typeof query_string[pair[0]] === "string") {
          var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
          query_string[pair[0]] = arr;
        } else {
          query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    } 
    return query_string;
}

function formatUptime(uptime) {
    
    var dUpSince = Date.parse(uptime);
    var dNow = Date.now();
    var dUptime = (dNow - dUpSince) / 1000;
    
    var sec_num = parseInt(dUptime, 10); 
    var days    = Math.floor(sec_num / 3600 / 24);
    sec_num = sec_num - (days * 3600 * 24);
    var hours   = Math.floor(sec_num /3600);
    sec_num = sec_num - (hours * 3600);
    var minutes = Math.floor(sec_num / 60);
    sec_num = sec_num - (minutes * 60);
    var seconds = sec_num;

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time = "";
    if (days > 0) { time = days + "T "; }
    time = time + hours + ':' + minutes + ':' + seconds;
    return time;
}