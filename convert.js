const fs = require('fs')
const jobs = require('./job_list.json')

const features = jobs.map(({ latitude, longitude }) => ({
  type: "Feature",
  properties: {},
  geometry: {
    type: "Point",
    coordinates: [longitude, latitude]
  }
}))

const result = {
  type: "FeatureCollection",
  features
}

fs.writeFile('jobs.geojson', JSON.stringify(result), 'utf8', console.log)