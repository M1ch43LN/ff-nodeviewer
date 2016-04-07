/* global $ */
/* global gMeshviewer */
/* global gLogo */

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
}); 

function loadConfig() {
    if (typeof gLogo !== 'undefined') {
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
        console.log("Nodes: " + strNodesURL);
        $.getJSON(strNodesURL, function(nodes) {
            gNodes = nodes;
            showNodes(nodes);
        });
    });
}

function clearNodesTable() {
    $("#nodes > tbody").empty();
}

function showNodes(nodes) {
    
    var tabNodes = $("table#nodes > tbody");
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
    
    clearNodesTable();
    
    $(".loader").show();
    
    $.each(nodes.nodes, function(id, nodedata) {
        var bolShow = true;
        var strImg;
        var strTechnik = "";
        var strKontakt = "";
        var strUptime = "";
        var strClients = "";
        
        intTotal++;
        if (nodedata.statistics.hasOwnProperty("clients")) {
            intClientsTotal = intClientsTotal + parseInt(nodedata.statistics.clients);
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
            
            //Link zum Node im Meshviewer
            var strMeshLink = gMeshviewer + "#!v:m;n:" + id;
            var strStatLink = gStatsURL.replace("{NODE_ID}", id);
            
            //Zeile zusammenbauen...
            var strTR = "<tr id='" + id + "' " + (nodedata.flags.online === false ? " class='offline'" : "") + ">";
            strTR = strTR + "<td>";
            if (nodedata.flags.online == true) {
                strTR = strTR + "<img src='img/on.png' title='Router ist online' class='onoff' />";
                intOnline++;
            } else {
                strTR = strTR + "<img src='img/off.png' title='Router ist offline' class='onoff' />";
                intOffline++;
            }
            strTR = strTR + "</td>";
            strTR = strTR + "<td class='hostname'>";
            strTR = strTR + nodedata.nodeinfo.hostname;
            strTR = strTR + "<table class='nodeinfo'><tbody><tr>";
            strTR = strTR + "<td>";
            if (nodedata.nodeinfo.network.hasOwnProperty("mesh")) {
                if (nodedata.nodeinfo.network.mesh.hasOwnProperty("bat0")) {
                    if (nodedata.nodeinfo.network.mesh.bat0.interfaces.hasOwnProperty("tunnel")) {
                        strTR = strTR + "<img src='img/vpn.png' title='Mesh-VPN konfiguriert'/>";
                    }
                }
            }
            strTR = strTR + "</td>";
            strTR = strTR + "<td>";
            if (nodedata.nodeinfo.network.hasOwnProperty("mesh")) {
                if (nodedata.nodeinfo.network.mesh.hasOwnProperty("bat0")) {
                    if (nodedata.nodeinfo.network.mesh.bat0.interfaces.hasOwnProperty("wireless") || nodedata.nodeinfo.network.mesh.bat0.interfaces.hasOwnProperty("other")) {
                        strTR = strTR + "<img src='img/mesh.png' title='Mesh-WLAN/LAN/WAN konfiguriert'/>";
                    }
                }
            }
            strTR = strTR + "</td>";
            strTR = strTR + "<td>";
            strTR = strTR + "<a href='" + strMeshLink + "' target='_blank'><img src='img/map.png' title='Router im Meshviewer anzeigen' /></a>";
            strTR = strTR + "</td>";
            strTR = strTR + "<td>";
            if (strStatLink != "") {
                strTR = strTR + "<a href='" + strStatLink + "' target='_blank'><img src='img/stats.png' 'Statistiken des Routers anzeigen' /></a>";
            }
            strTR = strTR + "</td>";
            strTR = strTR + "</tr></tbody></table>";
            strTR = strTR + "</td>";
            strTR = strTR + "<td>" + strClients + "</td>";
            strTR = strTR + "<td>" + strUptime + "</td>";
            strTR = strTR + "<td>" + strTechnik + "</td>";
            strTR = strTR + "<td>" + strKontakt + "</td>";
            strTR = strTR + "</tr>";
            
            //...und der Tabelle hinzufügen.
            tabNodes.append(strTR);
        }
        
    });  
    
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
    
    
    $("#summary").show();
    
    //Tablesorter aktivieren
    $("#nodes").tablesorter({
        sortList: [[1,0]],
        headers: { 
            0: {sorter: false},
            3: {sorter: false}
        } 
    }); 

    $(".loader").hide();
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