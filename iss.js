const request = require('request');

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function(callback) {
  // use request to fetch IP address from JSON API
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) {
      return callback(error, null);
    }
    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
      return;
    } else {
      const data = JSON.parse(body).ip;
      callback(null,data);

    }
  });
};
const fetchCoordsByIP = function(ip,callback) {
  request('https://ipvigilante.com/' + ip, (error, response, body) => {
    if (error) {
      return callback(error, null);
    }
    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`), null);
      return;
    } else {
      const data = JSON.parse(body);
      let result = {latitude : data["data"]["latitude"], longitude : data["data"]["longitude"]};
      callback(null,result);

    }
  });


};
const fetchISSFlyOverTimes = function(coords, callback) {
  request(`http://api.open-notify.org/iss-pass.json?lat=${coords["latitude"]}&lon=${coords["longitude"]}`, (error, response, body) => {
    if (error) {
      return callback(error, null);
    }
    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times. Response: ${body}`), null);
      return;
    } else {
      const data = JSON.parse(body).response;
      callback(null,data);

    }
  });
  
};
const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    } else {
      fetchCoordsByIP(ip, (error, coords) => {
        if (error) {
          return callback(error, null);
        } else {
          fetchISSFlyOverTimes(coords, (error, passTimes) => {
            if (error) {
              return callback(error, null);
            } else {
              callback(null, passTimes);
            }
          });  
        }
      });

    }
 
  });

  
}

module.exports = { nextISSTimesForMyLocation };