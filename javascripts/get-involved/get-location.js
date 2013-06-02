function getLocation() {
  if (navigator && navigator.geolocation) {
      // make the request for the user's position
      navigator.geolocation.getCurrentPosition(geo_success, geo_error);
  } else {
      storeGeoCoordinates(geoip_latitude(), geoip_longitude())
  }
}

function geo_success(position) {
  storeGeoCoordinates(position.coords.latitude, position.coords.longitude);
}

// The PositionError object returned contains the following attributes:
// code: a numeric response code
// PERMISSION_DENIED = 1
// POSITION_UNAVAILABLE = 2
// TIMEOUT = 3
// message: Primarily for debugging. It's recommended not to show this error
// to users.
function geo_error(err) {
  if (err.code == 1) {
      console.log('The user denied the request for location information.');
  } else if (err.code == 2) {
      console.log('Your location information is unavailable.');
  } else if (err.code == 3) {
      console.log('The request to get your location timed out.');
  } else {
      console.log('An unknown error occurred while requesting your location.');
  }
}

function storeGeoCoordinates(latitude, longitude) {
  window.geoCoordinates = {}
  window.geoCoordinates.latitude = latitude;
  window.geoCoordinates.longitude = longitude;
}

function getGeoCoordinates() {
  getLocation();
  return window.geoCoordinates;
}
