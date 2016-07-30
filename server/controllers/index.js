var db = require('../db');
var util = require('../lib/util.js');
var parser = require('body-parser');
// var express = require('express');
// var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var requestYelp = require('./yelp').requestYelp;
var requestNomad = require('./nomad').requestNomad;
var cipher = Promise.promisify(bcrypt.hash);

// var createSession = function(req, res, newUser) {
//   return req.session.regenerate(function() {
//     console.log(req.session);
//     req.session.user = newUser;
//     res.redirect('/');
//   })
// }

module.exports = {

  /************************************************
  // Requests to /users
  ************************************************/
  users: {
    login: function(req, res) {
      db.User.findOne({ where: { name: req.body.username } })
      .then(function(user) {
        if (!user) {
          console.log('user does not exist!');
          return;
        }
        bcrypt.compare(req.body.password, user.dataValues.password, function(err, match) {
          if (match) {
            console.log('login successful');
            util.createSession(req, res, user);
          } else {
            console.log('password incorrect');
          }
        });
      });
    },

    signup: function(req, res) {
      cipher(req.body.password, null, null)
      .then(function(hashPassword) {
        db.User.findOrCreate({
          where: {name: req.body.username },
          defaults: {
            name: req.body.username,
            password: hashPassword
          }
        })
        .spread(function(user, created) {
          if(created) {
            console.log('created');
            util.createSession(req, res, user);
            // Redirect to index?
          } else {
            console.log('user already exists!', user);
            res.sendStatus(403);
            // Possible redirection?
          }
        });
      })
      .catch(function(err) {
        if (err) {
          console.log('didn\'t work!', err);
        }
      }); // Needed?
    },

    logout: function(req, res) {
      req.session.destroy(function(err) {
        if (err) { console.log(err); }
        else {
          console.log('logout', req.session);
          console.log('logout successful');
          res.sendStatus(200);
        }
      });
    }
  },


  /************************************************
  // Requests to /itineraries
  ************************************************/
  itineraries: {
    get: function(req, res) {
      db.Itinerary.findAll({include: [db.User]})
      .then(function(itineraries) {
        res.json(itineraries);
      });
    },
    post: function(req, res) {

      console.log('Incoming post request!', req.body.geoId);
      //Check if user exists
      db.User.findOne({
        where: {
          name: req.body.user
        }
      })
      .then(function(user) {
        db.City.findOne({
          where: {
            geoId: req.body.geoId
          }
        })
        .then(function(city) {
          return db.Itinerary.findOrCreate({
            where: {
              geoId: req.body.geoId,
              UserId: user.dataValues.id,
              numDays: req.body.numDays,
              startDate: req.body.startDate,
              endDate: req.body.endDate,
              CityId: city.dataValues.id
            }
          });
        })
        .spread(function(itinerary, created) {
            //If the itinerary is new
            if (created) {
              req.body.events.forEach(function(event) {
                return db.Event.create({
                  day: event.day,
                  location: event.location,
                  name: event.name,
                  slot: event.slot,
                  image: event.image,
                  url: event.url,
                  snippet: event.snippet,
                  categories: event.categories,
                  address: event.address,
                  ItineraryId: itinerary.dataValues.id
                });
              });
            } else {
              db.Event.destroy({
                where: {
                  ItineraryId: itinerary.dataValues.id
                }
              })
              .then(function() {
              // Then saves new event configuration
                req.body.events.forEach(function(event) {
                  return db.Event.create({
                    day: event.day,
                    location: event.location,
                    name: event.name,
                    slot: event.slot,
                    image: event.image,
                    url: event.url,
                    snippet: event.snippet,
                    categories: event.categories,
                    address: event.address,
                    ItineraryId: itinerary.dataValues.id
                  });
                });
              })
            }
            var resObj = {
              id: itinerary.dataValues.id
            };
            res.send(resObj);
          });

        //find and upate or create new itinerary

      })

    },
    getUserItineraries: function(req, res) {
      db.User.findOne({
        where: {
          name: req.body.user
        }
      })
      .then(function(user) {
        db.Itinerary.findAll({
          where: {
            UserId: user.dataValues.id
          },
          include: [db.User, db.City]
        })
        .then(function(itineraries) {
          //
          var newOb = itineraries.map(function(item) {
            for (var key in item.dataValues.startDate) {
              console.log('INSIDE OF THE FOR IN LOOP');
              console.log('This is the key: ', key);
            }
            return {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [item.dataValues.City.longitude, item.dataValues.City.latitude],
              },
              "properties": {
                "title": item.dataValues.City.name,
                "description": "from " + item.dataValues.startDate + " to " + item.dataValues.endDate,
                "image": "https://nomadlist.com" + item.dataValues.City.imgUrl,
                "icon": {
                  "iconUrl": "http://www.freeiconspng.com/uploads/blue-star-ball-favorites-icon-png-0.png",
                  "iconSize": [20, 20], // size of the icon
                  "iconAnchor": [25, 25], // point of the icon which will correspond to marker's location
                  "popupAnchor": [0, -25], // point from which the popup should open relative to the iconAnchor
                  "className": "dot"
                }
              }
            }
          })
          res.json(newOb);
        })
      })
    },
    getLocationItineraries: function(req, res) {
      db.Itinerary.findAll({
        where: {
          location: req.body.location
        },
        include: [db.User]
      })
      .then(function(itineraries) {

        res.json(itineraries);
      })
    }
  },

  /************************************************
  // Requests to /itinerary
  ************************************************/
  itinerary: {
    post: function(req, res) {
      db.Itinerary.findOne({where: {id: req.body.id}})
      .then(function(itinerary) {
        res.json(itinerary);
      });
    }
  },

  /************************************************
  // Requests to /events
  ************************************************/
  events: {
    get: function(req, res) {
      db.Event.findAll({}).then(function(events) {
        res.json(events);
      });
    },
    post: function(req, res) {
      var response = {};
      var location = req.body.location.trim().split(' ').join('+');
      console.log(location);
      var filterStrings = req.body.filters.toString();
      console.log('the filter strings:', filterStrings);
      filterStrings = filterStrings || 'arts,restaurants,landmarks,tours,parks'
      var options = {
        location: location,
        limit: 20,
        category_filter: filterStrings
      };
      requestYelp(options, function(err, resp, body) {
        response.eventsFromYelp = JSON.parse(body).businesses;
        db.Event.findAll({where: {location: req.body.location}})
        .then(function(dbEvents) {
          response.eventsFromDb = dbEvents.dataValues;
          res.json(response);
        });
      });
    },
    getItineraryEvents: function(req, res) {
      db.Itinerary.findOne({
        where: {
          id: req.body.id
        }
      })
      .then(function(itinerary) {
        db.Event.findAll({
          where: {
            ItineraryId: itinerary.dataValues.id
          }
        })
        .then(function(events) {
          res.json(events);
        });
      })
    }
  },

  /************************************************
    // Requests to /city
    ************************************************/
  city: {
    getNomad: function(req, res) {
      var cityData = req.body;

      //split the city into an array
      //[San Franciso, CA, United States]

      //san-francisco-ca-united-states

      //{name: "Oakland", lat: 37.8043637, lng: -122.2711137, state: "CA", country: "United States"}
      // var city = req.body;
      //
      // var completeCity = '';
      //
      // if (city.state) {
      //   completeCity = city.name.replace(/\s+/g, '-') + '-' + city.state + '-' + city.country.replace(/\s+/g, '-');
      // } else {
      //   completeCity = city.name.replace(/\s+/g, '-') + '-' + city.country.replace(/\s+/g, '-');
      // }
      requestNomad(cityData, function(err, data, body) {
        // console.log('this is the data.body in getNomad in index.js: ', data.body);
        res.send(data.body);
      });
    }
  },

  /************************************************
  // Requests to /save
  ************************************************/
  save: {
    post: function(req, res) {
      db.Itinerary.findOne({where: {id: req.body.id}})
      .then(function(itinerary) {
        // First clears existing events
        db.Event.destroy({
          where: {
            ItineraryId: itinerary.dataValues.id
          }
        })
        .then(function() {
          // Then saves new event configuration
          req.body.events.forEach(function(event) {
            return db.Event.create({
              day: event.day,
              location: event.location,
              name: event.name,
              slot: event.slot,
              image: event.image,
              url: event.url,
              snippet: event.snippet,
              categories: event.categories,
              address: event.address,
              ItineraryId: itinerary.dataValues.id
            });
          });
        })
        .then(function() {
          res.send('Events posted!');
        });
      })
    }
  }
};
