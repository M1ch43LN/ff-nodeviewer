<?php

//Simples Proxy-Skript zum Laden von json-Dateien

header('Content-Type: application/json');

$url=urldecode($_GET["url"]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$jsondata = curl_exec($ch);
curl_close($ch);

echo $jsondata;

?>