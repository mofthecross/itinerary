/* require the modules needed */
var n = require('nonce')();
var request = require('request');
var qs = require('querystring');
var _ = require('lodash');
var db = require('../db');
require('dotenv').config();

/* Function for yelp call
 * ------------------------
 * set_parameters: object with params to search
 * callback: callback(error, response, body)
 */
exports.requestNomad = function(city, callback) {
  /* The type of request */
  var httpMethod = 'GET';

  /* The url we are using for the request */
  var url = 'https://nomadlist.com/api/v2/list/cities/';

  /* Add the query string to the url */
  var apiURL = url + city;

  console.log('This is the apiURL: ' + apiURL.toLowerCase());

  /* Then we use request to send make the API Request */
  request(apiURL.toLowerCase(), function(error, response, body) {
    callback(error, response, body);
    var respJSON = JSON.parse(response.body);
    var newCity = {
      name: respJSON.result[0].info.city.name,
      country: respJSON.result[0].info.country.name,
      latitude: respJSON.result[0].info.location.latitude.toString(),
      longitude: respJSON.result[0].info.location.longitude.toString(),
      imgUrl: respJSON.result[0].media.image['250']
    }

    db.City.findOrCreate({
      where: newCity
    })
    .spread(function(city, created) {
      if (created) {
        console.log('new City', city.dataValues);
      } else {
        console.log('already exists!');
      }
    })
    .catch(function(err) {
      console.log('unable to add city', err);
    });

  });
};
