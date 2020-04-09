"use strict";
var ig = require("instagram-private-api");
var _fs = require("fs");
var _util = require("util");
require("dotenv").config();

/* tslint:disable:no-console */
var readFileAsync = (0, _util.promisify)(_fs.readFile);
var ig = new ig.IgApiClient();

async function login() {
  // basic login-procedure
  ig.state.generateDevice(process.env.IG_USERNAME);
  // ig.state.proxyUrl = process.env.IG_PROXY;
  console.log(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
}

(async function() {
  await login().then(
    value => {
      // fulfillment
      console.log("Login done", value);
    },
    reason => {
      console.error("login denied", reason);
    }
  );
  var path = "pics/2019-11-21 20.35.17 2182525345496574274_9179014179.jpg";
  var _latitude$longitude$s = {
      latitude: 0.0,
      longitude: 0.0,
      // not required
      searchQuery: "place"
    },
    latitude = _latitude$longitude$s.latitude,
    longitude = _latitude$longitude$s.longitude,
    searchQuery = _latitude$longitude$s.searchQuery;
  /**
   * Get the place
   * If searchQuery is undefined, you'll get the nearest places to your location
   * this is the same as in the upload (-configure) dialog in the app
   */

  var locations = await ig.search.location(latitude, longitude, searchQuery);
  /**
   * Get the first venue
   * In the real world you would check the returned locations
   */

  var mediaLocation = locations[0];
  console.log(mediaLocation);
  var publishResult = await ig.publish.photo({
    // read the file into a Buffer
    file: await readFileAsync(path),
    // optional, default ''
    caption: "my caption",
    // optional
    location: mediaLocation,
    // optional
    usertags: {
      in: [
        // tag the user 'instagram' @ (0.5 | 0.5)
        await generateUsertagFromName("instagram", 0.5, 0.5)
      ]
    }
  });
  console.log(publishResult);
})();
/**
 * Generate a usertag
 * @param name - the instagram-username
 * @param x - x coordinate (0..1)
 * @param y - y coordinate (0..1)
 */

async function generateUsertagFromName(name, x, y) {
  // constrain x and y to 0..1 (0 and 1 are not supported)
  x = clamp(x, 0.0001, 0.9999);
  y = clamp(y, 0.0001, 0.9999); // get the user_id (pk) for the name

  var _await$ig$user$search = await ig.user.searchExact(name),
    pk = _await$ig$user$search.pk;

  return {
    user_id: pk,
    position: [x, y]
  };
}
/**
 * Constrain a value
 * @param value
 * @param min
 * @param max
 */

var clamp = function clamp(value, min, max) {
  return Math.max(Math.min(value, max), min);
};
