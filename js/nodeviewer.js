/* global $ */
/* global gMeshviewer */
/* global gLogo */
/* global gNeuLaden */
/* global gNodedaten */

var gNodes;
var gStatsURL = "";
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
    
    var url = "getjson.php?url=" + encodeURI(gMeshviewer + "config.json");
    console.log("Config: " + url);
    $.getJSON(url, function(meshconfig) {
        $("title").text("Nodeviewer - " + meshconfig.siteName);
        $("h1").text(meshconfig.siteName);
        
        var strDataPath;
        if( typeof meshconfig.dataPath === 'string' ) {
            strDataPath = meshconfig.dataPath;
        } else {
            strDataPath = meshconfig.dataPath[0];
        }
        if (strDataPath.indexOf("//") === -1) {
            strDataPath = gMeshviewer + "/" + strDataPath;
        }
        
        if (meshconfig.hasOwnProperty("nodeInfos")) {
            gStatsURL = meshconfig.nodeInfos[0].href;
        }
        
        var strNodesURL = "getjson.php?url=" + encodeURI(strDataPath + "nodes.json");
        
        if (typeof gNodedaten !== 'undefined') {
            strNodesURL = "getjson.php?url=" + encodeURI(gNodedaten + "nodes.json");
        }
        
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
        if (nodedata.statistics.hasOwnProperty("clients")) {
            intClientsTotal = intClientsTotal + parseInt(nodedata.statistics.clients,10);
        }
        
        //Kontaktfilter
        if (strFilterKontakt) {
            if (nodedata.nodeinfo.hasOwnProperty("owner")) {
                if (strFilterKontakt != nodedata.nodeinfo.owner.contact.toLowerCase()) {
                    bolShow = false;
                }
            } else {
                bolShow = false;
            }    
        }
        
        //Online-Filter
        if (strFilterOnline > -1) {
            if (nodedata.flags.online != strFilterOnline) {
                bolShow = false;
            }
        }
        
        //Hostname-Filter
        if (strFilterHostname) {
            if (nodedata.nodeinfo.hostname.toLowerCase().indexOf(strFilterHostname.toLowerCase()) === -1) {
                bolShow = false;
            }
        }
        
        if (bolShow) {
            intFilter++;
            console.log("ID:[" + nodedata.nodeinfo.node_id + "]");
            initRow(nodedata.nodeinfo.node_id);
            populateRow(nodedata.nodeinfo.node_id, nodedata);
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
        row = row + "<td class='td-technik'></td>";
        row = row + "<td class='td-kontakt'></td>";
        row = row + "</tr>";
        $("#nodes tbody:first").append(row);
    } else {
        row = row[0];
    }
    return row;
}

function populateRow(id, nodedata) {
    var strImg;
    var strTechnik = "";
    var strKontakt = "";
    var strUptime = "";
    var strClients = "";
    var strNodeID = "";
    
    //Hardware
    if (nodedata.nodeinfo.hasOwnProperty("hardware")) {
        if (nodedata.nodeinfo.hardware.hasOwnProperty("model")) {
            strTechnik = nodedata.nodeinfo.hardware.model;
        }
        if (nodedata.nodeinfo.hasOwnProperty("software")) {
            if (strTechnik != "") strTechnik = strTechnik + "<br/>";
            if (nodedata.nodeinfo.software.hasOwnProperty("firmware")) {
                if (nodedata.nodeinfo.software.firmware.hasOwnProperty("base")) {
                    strTechnik = strTechnik + nodedata.nodeinfo.software.firmware.base + " / ";
                }
                if (nodedata.nodeinfo.software.firmware.hasOwnProperty("release")) {
                    strTechnik = strTechnik + nodedata.nodeinfo.software.firmware.release;
                }
            }
        }
    }
    
    //Kontakt
    if (nodedata.nodeinfo.hasOwnProperty("owner")) {
        strKontakt = nodedata.nodeinfo.owner.contact;
    } 
    
    //Uptime
    if (nodedata.statistics.hasOwnProperty("uptime")) {
        strUptime = formatUptime(nodedata.statistics.uptime);
    }
    
    //Clients
    if (nodedata.statistics.hasOwnProperty("clients")) {
        strClients = nodedata.statistics.clients;
        intClients = intClients + parseInt(nodedata.statistics.clients);
    }
    
    //Node-ID
    if (nodedata.nodeinfo.hasOwnProperty("node_id")) {
        strNodeID = nodedata.nodeinfo.node_id;
    } 
    
    //Link zum Node im Meshviewer
    var strMeshLink = gMeshviewer + "#!v:m;n:" + strNodeID;
    var strStatLink = gStatsURL.replace("{NODE_ID}", strNodeID);
    var strStatLink = gStatsURL.replace("{NODE_NAME}", nodedata.nodeinfo.hostname);
    
    var row = $("#" + id);
    
    $("td",row).empty();
    
    //Online/Offline
    if (nodedata.flags.online == true) {
        $(".td-status", row).append("<img src='img/on.png' title='Router ist online' class='onoff' />");
        row.removeClass("offline");
        intOnline++;
    } else {
        $(".td-status", row).append("<img src='img/off.png' title='Router ist offline' class='onoff' />");
        row.addClass("offline");
        intOffline++;
    }
    
    //Hostname
    $(".td-hostname", row).append(nodedata.nodeinfo.hostname);
    
    //Hostinfos und Menü
    var tabInfo = "<table class='nodeinfo'><tbody><tr>";
    tabInfo = tabInfo + "<td>";
    if (nodedata.nodeinfo.network.hasOwnProperty("mesh")) {
        if (nodedata.nodeinfo.network.mesh.hasOwnProperty("bat0")) {
            if (nodedata.nodeinfo.network.mesh.bat0.interfaces.hasOwnProperty("tunnel")) {
                tabInfo = tabInfo + "<img src='img/vpn.png' title='Mesh-VPN konfiguriert'/>";
            }
        }
    }
    tabInfo = tabInfo + "</td>";
    tabInfo = tabInfo + "<td>";
    if (nodedata.nodeinfo.network.hasOwnProperty("mesh")) {
        if (nodedata.nodeinfo.network.mesh.hasOwnProperty("bat0")) {
            if (nodedata.nodeinfo.network.mesh.bat0.interfaces.hasOwnProperty("wireless") || nodedata.nodeinfo.network.mesh.bat0.interfaces.hasOwnProperty("other")) {
                tabInfo = tabInfo + "<img src='img/mesh.png' title='Mesh-WLAN/LAN/WAN konfiguriert'/>";
            }
        }
    }
    tabInfo = tabInfo + "</td>";
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
    
    //Technik
    $(".td-technik", row).append(strTechnik);
    
    //Kontakt 
    $(".td-kontakt", row).append(strKontakt);
    
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
    var sec_num = parseInt(uptime, 10); 
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