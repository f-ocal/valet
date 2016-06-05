// To upgrade node in MAC, please follow type below commands:
// >brew update
// >brew upgrade node

// To upgrade node in Windows, please type below commands:
// >sudo apt-get update node

var express  = require('express');
var app = express();
var ws = require('nodejs-websocket')
var googleMaps = require('googlemaps');

var getParkingCoordinates = function() {
  fakeResponse = {
    "event-uid": "360597e9-3a3d-4f1c-a686-4d575ba11f55",
    "timestamp": 1461019279795,
    "event-type": "PKOUT",
    "device-uid": "HYP1040-75",
    "location-uid": "158-parkingspot",
    "properties": {
      "object-uid": "cf0dfb91-b11e-4d4d-9213-eb057187122f",
      "coordinates":
        "32.711637:-117.15732968838816,32.711637100678395:-117.15736341303291,32.711734:-117.15736427535526,32.711733:-117.15733055071051"
    },
    "measures": [
    {
      "tag": "PKOVLP",
      "value": 100,
      "unit": "PCT"
    }
    ]
  };
  return fakeResponse.properties.coordinates.split(',').map(function(o){ return o.split(':') });
};

var addressLookupFromCoordinates = function(lat, lon) {
  var publicConfig = {
    key: process.env.GOOGLE_MAPS_API_KEY,
    stagger_time: 1000,
    encode_polylines: false,
    secure: true
  };

  var gmAPI = new googleMaps(publicConfig);

  var latlngStr = lat + ',' + lon;

  var lookup = {
    'latlng': latlngStr,
    'language': 'en',
  }

  gmAPI.reverseGeocode(lookup, function(err, result) {
    console.log(result.results[0].formatted_address);
  });
}
var x, y;
[x,y] = getParkingCoordinates()[0];
addressLookupFromCoordinates(x,y);


var predixToken = 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiIyNDMzMzBlZi04OWIzLTRkMjItOWEzYS1mNmYxZmIxOTg3MjYiLCJzdWIiOiJwYXJraW5naW5mb3JtYXRpb24iLCJzY29wZSI6WyJ1YWEucmVzb3VyY2UiLCJvcGVuaWQiLCJ1YWEubm9uZSIsImllLXBhcmtpbmcuem9uZXMuZTg0Y2FjYjMtNGM1Yi00YzMyLWI0NzAtY2Y2MzY1Y2I2MTI5LnVzZXIiXSwiY2xpZW50X2lkIjoicGFya2luZ2luZm9ybWF0aW9uIiwiY2lkIjoicGFya2luZ2luZm9ybWF0aW9uIiwiYXpwIjoicGFya2luZ2luZm9ybWF0aW9uIiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInJldl9zaWciOiIyN2I3ZDZlMSIsImlhdCI6MTQ2MzA4MjQ2NCwiZXhwIjoxNDYzMTI1NjY0LCJpc3MiOiJodHRwczovL2UwYzI5NTY5LWI4OGQtNDY5NC04OTRkLTk4YmJjODlhYjM1MS5wcmVkaXgtdWFhLnJ1bi5hd3MtdXN3MDItcHIuaWNlLnByZWRpeC5pby9vYXV0aC90b2tlbiIsInppZCI6ImUwYzI5NTY5LWI4OGQtNDY5NC04OTRkLTk4YmJjODlhYjM1MSIsImF1ZCI6WyJwYXJraW5naW5mb3JtYXRpb24iLCJ1YWEiLCJvcGVuaWQiLCJpZS1wYXJraW5nLnpvbmVzLmU4NGNhY2IzLTRjNWItNGMzMi1iNDcwLWNmNjM2NWNiNjEyOSJdfQ.gMRNxKC_KR_STv5IxrvwNvgIPrXgb5-ylGhowJBfEhHraT4oHXMbfmBSPqqATTcZcgbhYe6OweRTAOJtUD0uotzBwN_X8O9loJkg21Xx8oOrMzZXzwYcIbAv0R2-15PRrsxybECQGfiu_5yCe3ag_AOHloAj_dbKCDCzoPgNYbNnx7zeDuY0U_3KTpqjELnWOQFhTkG5NH_6cAwKvzJQt3GdGhSa9TUsmqfrlhvgyb1_6Uk88OqsoDmtRXuEUg-iF6l0oWmfDL_6nR6Xy9iBI8PUnzC3rZyYLl_q3JPssZs9YJx0dY1uYmd7ZT9UHlYnQf_K-MNmMQxPEyx0tfkmKg'


var predixConnectionOptions = {
  extraHeaders: {
                  'Authorization': predixToken,
                  'Predix-Zone-id': 'e84cacb3-4c5b-4c32-b470-cf6365cb6129',
                }
}

var parkingSpace1 = {
  "available": true,
  "address": "601 Eighth Street San Diego, California"
}

var predixConnection = ws.connect('wss://ie-websocket-server-prod.run.aws-usw02-pr.ice.predix.io/consume?routing-key=9864fb2a-cba1-40ed-a204-29e16c61f5a7&service-name=ie-parking',predixConnectionOptions,
    function(){
      console.log("Connected");
      predixConnection.sendText('data');
    })

predixConnection.on('text', function(data){
  console.log(data);
  if (data.event-type == "PKOUT"){
    parkingSpace1.available = true
  } else if (data.event-type == "PKIN"){
    parkingSpace1.available = false
  }
})

console.log(predixConnection.readyState);


var port = process.env.PORT || 3000;
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('Please be ready for your parking information');
  next();  //make sure we go to the next routes and don't stop here
});

router.get('/', function(request, response) {
  response.json({ message: 'Welcome to Valet!' });
});

router.get('/parking-spot', function(request, response){
  if (parkingSpace1.available == true){
    response.json({ address: parkingSpace1.address})
  } else if (parkingSpace1.available == false){
    response.json({ address: null})
  }
})
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
