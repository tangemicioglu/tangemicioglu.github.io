"use strict";
const mapHost = document.getElementById('garden-map');
loadGarden(mapHost).then(data => {
  window.gardenMap = new SiteMap(mapHost, data);
}).catch(() => gardenUnavailable(mapHost));
