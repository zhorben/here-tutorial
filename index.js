const here = {
  apiKey: "qkkSwLqu_LPmIZ1Wtp1tjh8HwXQhrRhQLJ2ovPOK21k",
};

const map = L.map("map", {
  center: [44.98856, -93.42091],
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

let startCoordinates = [];

document.getElementById("clear").onclick = clearMap;
document.getElementById("change-start").onclick = addStartingMarker;
document.getElementById("add-car").onclick = addCar;
addStartingMarker();

async function geocode(query) {
  const url =
    "https://geocoder.ls.hereapi.com/6.2/geocode.json" +
    `?apiKey=${here.apiKey}` +
    `&searchtext=${query}`;

  const response = await fetch(url);
  const data = await response.json();
  return await data.Response.View[0].Result[0].Location.NavigationPosition[0];
}

async function route(start, end) {
  const mode = document.querySelector('input[name="routing-mode"]:checked')
    .value;
  
  const url = `https://route.ls.hereapi.com/routing/7.2/calculateroute.json`
   + `?apiKey=${here.apiKey}`
   + `&waypoint0=geo!${start}`
   + `&waypoint1=geo!${end}`
   + `&mode=fastest;${mode};traffic:disabled`
   + `&routeattributes=shape`

  const response = await fetch(url);
  const data = await response.json();
  return await data.response.route[0];
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

async function addStartingMarker() {
  clearMap();
  document.querySelectorAll(".start")
    .forEach(async ({ value: startAddress }) => {
      const response = await geocode(startAddress);
      startCoordinates.push(response)
      const startingCircle = L.marker(
        [response.Latitude, response.Longitude],
        { alt: "start" }
      ).addTo(map);
    })
}

async function onMapClick(selection) {
  if (selection.feature) {
    const endCoordinates = `${selection.leaflet_event.latlng.lat},${selection.leaflet_event.latlng.lng}`;
    startCoordinates.forEach(async ({ Latitude, Longitude }) => {
      const routeData = await route(
        `${Latitude},${Longitude}`,
        endCoordinates
      );
      const shape = routeData.shape.map((x) => x.split(","));
      const poly = L.polyline(shape).addTo(map).snakeIn();
    })

  }
}

function addCar() {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "start";
  document.getElementById("actions").appendChild(input);
}
