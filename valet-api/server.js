// // Socket.io client boilerplate
// var socket = require('socket.io-client')(process.env.PARKING_SPOT1 || 'wss://ie-websocket-server-prod.run.aws-usw02-pr.ice.predix.io/consume?routing-key=87f0bbcf-1b39-49c6-bbce-0c7a95ee687b&service-name=ie-parking');
// socket.on('connect', function(){
//   console.log('Connected to Server');
// });
// socket.on('event', function(data){
//   console.log(data);
// });
// socket.on('disconnect', function(){});
var express  = require('express');
var app = express();

var ws = require('nodejs-websocket')

var token = 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiIyNDMzMzBlZi04OWIzLTRkMjItOWEzYS1mNmYxZmIxOTg3MjYiLCJzdWIiOiJwYXJraW5naW5mb3JtYXRpb24iLCJzY29wZSI6WyJ1YWEucmVzb3VyY2UiLCJvcGVuaWQiLCJ1YWEubm9uZSIsImllLXBhcmtpbmcuem9uZXMuZTg0Y2FjYjMtNGM1Yi00YzMyLWI0NzAtY2Y2MzY1Y2I2MTI5LnVzZXIiXSwiY2xpZW50X2lkIjoicGFya2luZ2luZm9ybWF0aW9uIiwiY2lkIjoicGFya2luZ2luZm9ybWF0aW9uIiwiYXpwIjoicGFya2luZ2luZm9ybWF0aW9uIiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInJldl9zaWciOiIyN2I3ZDZlMSIsImlhdCI6MTQ2MzA4MjQ2NCwiZXhwIjoxNDYzMTI1NjY0LCJpc3MiOiJodHRwczovL2UwYzI5NTY5LWI4OGQtNDY5NC04OTRkLTk4YmJjODlhYjM1MS5wcmVkaXgtdWFhLnJ1bi5hd3MtdXN3MDItcHIuaWNlLnByZWRpeC5pby9vYXV0aC90b2tlbiIsInppZCI6ImUwYzI5NTY5LWI4OGQtNDY5NC04OTRkLTk4YmJjODlhYjM1MSIsImF1ZCI6WyJwYXJraW5naW5mb3JtYXRpb24iLCJ1YWEiLCJvcGVuaWQiLCJpZS1wYXJraW5nLnpvbmVzLmU4NGNhY2IzLTRjNWItNGMzMi1iNDcwLWNmNjM2NWNiNjEyOSJdfQ.gMRNxKC_KR_STv5IxrvwNvgIPrXgb5-ylGhowJBfEhHraT4oHXMbfmBSPqqATTcZcgbhYe6OweRTAOJtUD0uotzBwN_X8O9loJkg21Xx8oOrMzZXzwYcIbAv0R2-15PRrsxybECQGfiu_5yCe3ag_AOHloAj_dbKCDCzoPgNYbNnx7zeDuY0U_3KTpqjELnWOQFhTkG5NH_6cAwKvzJQt3GdGhSa9TUsmqfrlhvgyb1_6Uk88OqsoDmtRXuEUg-iF6l0oWmfDL_6nR6Xy9iBI8PUnzC3rZyYLl_q3JPssZs9YJx0dY1uYmd7ZT9UHlYnQf_K-MNmMQxPEyx0tfkmKg'


var options = {
	extraHeaders: {
    'Authorization': token,
    'Predix-Zone-id': 'e84cacb3-4c5b-4c32-b470-cf6365cb6129',
	}
}

var parkingSpace1 = {
  "available": true,
  "address": "601 Eighth Street San Diego, California"
}

var conn = ws.connect('wss://ie-websocket-server-prod.run.aws-usw02-pr.ice.predix.io/consume?routing-key=9864fb2a-cba1-40ed-a204-29e16c61f5a7&service-name=ie-parking',options,
function(){
    console.log("Connected");
    conn.sendText('data');
})

conn.on('text', function(data){
  console.log(data);
  if (data.event-type == "PKOUT"){
    parkingSpace1.available = true
  } else if (data.event-type == "PKIN"){
    parkingSpace1.available = false
  }
})

console.log(conn.readyState);

console.log("This is outside");

var port = process.env.PORT || 3000;
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Please be ready for your parking information');
    next(); // make sure we go to the next routes and don't stop here
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
