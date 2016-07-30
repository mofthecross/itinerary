import React from 'react';
import {Link} from 'react-router';

export default class LandingView extends React.Component {

  constructor (props) {
	  super(props);

	  this.state = {
	    locations: []
		};
	}

  componentDidMount() {
		//public token for mapbox
		L.mapbox.accessToken = 'pk.eyJ1IjoibW9mdGhlY3Jvc3MiLCJhIjoiY2lyNXBkNnliMDA5Z2c4bTFweWJlN2dyaCJ9.dBygwwib3OjYEypyhSMVDg';
		var example = [
			{
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [-77.031952,38.913184]
				}
			},
			{
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [-122.413682,37.775408]
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
					var locations = json.map(function(item) {
						return item.location;
					})
					console.log(locations);
					// this.setState({locations: locations});
          var map = L.mapbox.map('map', 'mapbox.streets')
            .setView([37.8, -96], 4);
          var myLayer = L.mapbox.featureLayer().setGeoJSON(locations).addTo(map);
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
