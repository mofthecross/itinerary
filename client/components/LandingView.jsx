import React from 'react';
import {Link} from 'react-router';

export default class LandingView extends React.Component {

  constructor (props) {
	  super(props);

	  this.state = {
	    locations: []
		};
	}

  componentWillMount() {
		//public token for mapbox
		L.mapbox.accessToken = 'pk.eyJ1IjoibW9mdGhlY3Jvc3MiLCJhIjoiY2lyNXBkNnliMDA5Z2c4bTFweWJlN2dyaCJ9.dBygwwib3OjYEypyhSMVDg';
		var example = [
  {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [-77.031952,38.913184]
    },
    "properties": {
      "title": "Mapbox DC",
      "description": "1714 14th St NW, Washington DC",
      "image": "https://farm9.staticflickr.com/8604/15769066303_3e4dcce464_n.jpg",
      "icon": {
          "iconUrl": "",
          "iconSize": [50, 50], // size of the icon
          "iconAnchor": [25, 25], // point of the icon which will correspond to marker's location
          "popupAnchor": [0, -25], // point from which the popup should open relative to the iconAnchor
          "className": "dot"
      }
    }
  }
];
		// mapGeo.scrollWheelZoom.enable();

		this.serverRequest = function ajax(url, data) {
			fetch(url, {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				credentials: 'same-origin',
        method: 'POST',
        body: JSON.stringify(data)
			}, this)
				.then(res => {
					return res.json();
				})
				.then(json => {
          var geoIds = json;
          return geoIds
          // json.forEach(function(itinerary) {
          //   var geoId = {
          //     "type": "Feature",
          //     "geometry": {
          //       "type": "Point",
          //       "coordinates": [itinerary.City.latitude, itinerary.City.longitude]
          //     },
          //     "properties": {
          //       "title": itinerary.City.name,
          //       "description": "from " + itinerary.startDate + " to " + itinerary.endDate,
          //       "image": itinerary.City.imgUrl,
          //       "icon": {
          //         "iconUrl": itinerary.City.imgUrl,
          //         "iconSize": [50, 50],
          //         "iconAnchor": [25, 25],
          //         "popupAnchor": [0, -25],
          //         "className": "dot"
          //       }
          //     }
          //   }
          //   geoIds.push(geoId);
          // });

				})
        .then(geoIds => {
          var map = L.mapbox.map('map', 'mapbox.streets')
            .setView([37.8, -96], 4);

          var myLayer = L.mapbox.featureLayer().addTo(map);

          myLayer.on('layeradd', function(e) {
            console.log("e eee ", e)
            var marker = e.layer,
              feature = marker.feature;
            marker.setIcon(L.icon(feature.properties.icon));
            var content = '<h2>'+ feature.properties.title+'<\/h2>' + '<p>' + feature.properties.description + '<\/p>' + '<img src="'+feature.properties.image+'" alt="">';
            marker.bindPopup(content);
          });

          myLayer.setGeoJSON(geoIds);
          map.scrollWheelZoom.disable();
        })
				.catch(err => {
					console.log(err);
				});
		}.bind(this)('/classes/userItineraries', {user: window.user});
	}

	render() {
		return (
			<div className='container'>
				<div className='jumbotron'>
					<h1 className='ole'>esc <i className='fa fa-paper-plane-o smLogo' aria-hidden='true'></i></h1>
					<Link to='/choose-planner' className='btn btn-success'>Create Itinerary</Link><span>   </span>
					<Link to='/itineraries' className='btn btn-success'>View All Itineraries</Link><span>   </span>
					<Link to='/user-itineraries' className='btn btn-success'>View My Itineraries</Link>
				</div>
				<div className='mapsize' id='map'></div>
			</div>
		);
	}
}
