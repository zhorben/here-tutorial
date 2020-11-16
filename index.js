const here = {
  apiKey: "BytYNGQ4ED13zitbJvZ--Zn2qcTHQzty1x_rq6MpdYQ",
};

const map = L.map("map", {
  center: [-93.4956,44.9593],
  zoom: 13,
  layers: [
    Tangram.leafletLayer({
      scene: "scene.yaml",
      events: {
        click: onMapClick,
      },
    }),
  ],
  zoomControl: false,
});

let startCoordinates = "";

document.getElementById("clear").onclick = clearMap;
document.getElementById("change-start").onclick = addStartingMarker;
addStartingMarker();

async function addStartingMarker() {
  clearMap();
  const startAddress = document.getElementById("start").value;
  startCoordinates = await geocode(startAddress);
  console.log(startCoordinates, "--- startCoordinates")
  const startingCircle = L.marker(
    [startCoordinates.Latitude, startCoordinates.Longitude],
    { alt: "start" }
  ).addTo(map);
}

function clearMap() {
  map.eachLayer((layer) => {
    if (
      !layer.hasOwnProperty("_updating_tangram") &&
      !layer.options.hasOwnProperty("alt")
    ) {
      map.removeLayer(layer);
    }
  });
}

async function onMapClick(selection) {
  if (selection.feature) {
     const endCoordinates = `${selection.leaflet_event.latlng.lat},${selection.leaflet_event.latlng.lng}`;
     const routeData = await route(`${startCoordinates.Latitude},${startCoordinates.Longitude}`, endCoordinates);
     const shape = routeData.shape.map(x => x.split(","));
     const poly = L.polyline(shape).addTo(map).snakeIn();
  }
}

async function geocode(query) {
  const url = `https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=${here.apiKey}&searchtext=${query}`;
  const response = await fetch(url);
  const data = await response.json();
  return await data.Response.View[0].Result[0].Location.NavigationPosition[0];
}

async function route(start, end) {
  const mode = document.querySelector('input[name="routing-mode"]:checked')
    .value;
  const url = `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=${here.apiKey}&waypoint0=geo!${start}&waypoint1=geo!${end}&mode=fastest;${mode};traffic:disabled&routeattributes=shape`;
  const response = await fetch(url);
  const data = await response.json();
  return await data.response.route[0];
}
