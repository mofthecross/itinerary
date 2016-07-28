import React from 'react';
import {PlannerView} from './PlannerView';
import Geosuggest from 'react-geosuggest';

export default class ChoosePlannerView extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      user: window.user,
      location: '',
      startDate: '',
      endDate: '',
      numDays: 0,
      showList: false,
      listLocation: '',
      yelpEvents: [],
      events: [],
      day: '1',
      slot: '1',
      selected: '',
      itineraryId: null,
      selectedCity: null,
      nomadData: null,
      filters: []
    };
  }

  handleInputChange(event) {
    var targetID = event.target.id;
    var targetValue = event.target.value;

    var newState = {};
    newState[targetID] = targetValue;

    // Calculate the number of days in the itinerary
    this.setState(newState, function() {
      if (targetID === 'startDate' || targetID === 'endDate') {
        this.setState({numDays: this.getDateDiff()});
      }        
    });
  }


  getDateDiff() {
    var start = this.state.startDate;
    var end = this.state.endDate;
    var dayInMilliseconds = 1000 * 60 * 60 * 24;
    if (start && end) {
      var startDate = new Date(start);
      var endDate = new Date(end);
      //If the start and end dates are the same day
      //It still implies that the user will be in the city for 1 day
      var numDays = 1 + (endDate.getTime() - startDate.getTime()) / dayInMilliseconds;
    }

    return (numDays && numDays > 0) ? numDays : 0;
  }

  serverRequest(url, data, callback) {
    // If second parameter is empty function performs a GET request
    var method = data === undefined ? 'GET' : 'POST';
    fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      method: method,
      body: JSON.stringify(data)
    })
    .then(res => {
      console.log('Successful clientside POST-request');
      return res.json();
    })
    .then(json => {
      callback(json);
    })
    .catch(err => {
      console.log(err);
    });
  }

  getItinerary() {
    console.log('getting itinerary')
    let data = {
      location: this.state.location,
      filters: this.state.filters
    }
    this.serverRequest('/classes/events', data, this.formatYelpData.bind(this));
  }

  swap() {
    var day = parseInt(this.state.day, 10) - 1;
    var slot = parseInt(this.state.slot, 10) - 1;

    var index = 3 * day + slot;
    var target = _.find(this.state.events, event => {
      return event.name === this.state.selected;
    });
    var targetIdx = _.findIndex(this.state.events, event => {
      return event.name === this.state.selected;
    });
    var newEvents = this.state.events.slice();
    var temp = newEvents[index];
    newEvents[index] = target;
    newEvents[targetIdx] = temp;
    this.setState({events: newEvents});
  }

  handleChange(event) {
    var newState = {};
    newState[event.target.id] = event.target.value;
    this.setState(newState);
  }

  formatYelpData(data) {
    // Make the events from yelp nice
    var formattedYelp = _.map(data.eventsFromYelp, function(yelpEvent) {
      var formatted = {
        name: yelpEvent['name'],
        image: yelpEvent['image_url'],
        url: yelpEvent['url'],
        snippet: yelpEvent['snippet_text'],
        rating: yelpEvent['rating_img_url'],
        address: yelpEvent['location']['display_address'][0] + ', ' + yelpEvent['location']['display_address'][1]
      };

      formatted['categories'] = _.map(yelpEvent['categories'], function(cat) {
        return cat[0];
      }).join(', ');

      return formatted;
    });

        
    var newState = {
      events: formattedYelp, 
      yelpEvents: formattedYelp,
      selected: formattedYelp[0].name
    };
      
    this.setState(newState);
    window.fromItinId = undefined;
  }

  saveItinerary() {
    console.log('in the intinerary save');
    event.preventDefault();
    //Check if user is logged in
    if (!window.user) {
      window.location.hash = 'login';
    } else {
      var eventsToSave = _.map(this.state.events, (e, index) => {
        var eventToSave = {
          day: (Math.floor(index / 3) + 1),
          location: this.state.location,
          name: e.name,
          slot: (index % 3),
          image: e.image,
          url: e.url,
          snippet: e.snippet,
          categories: e.categories,
          address: e.address
        };
        return eventToSave;
      });

      var data = {
        id: this.state.itineraryId,
        events: eventsToSave,
        user: this.state.user,
        location: this.state.location,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        numDays: this.state.numDays
      };
      this.serverRequest('/classes/itineraries', data, (json) => {
        this.setState({
          itineraryId: json.id
        });
      });
    }
  }

  onSuggestSelect(suggest) {
    //we receive the information as, "Sacramento, CA, United States"
    //we split it so everything is its own string
    var citySplit = suggest.label.split(', ');
    var cityData = {
      name: citySplit[0],
      lat: suggest.location.lat,
      lng: suggest.location.lng
    };

    if (citySplit.length > 2) {
      if (citySplit[2] === 'United States') {
        cityData.state = citySplit[1];
      }
      cityData.country = citySplit[2];
    }

    this.setState({
      selectedCity: cityData,
      location: cityData.name + ', ' + cityData.country
    });
    console.log('This is the selectedCity state: ', this.state.selectedCity);
  }

  // serverRequest2(url, data) {
  //   fetch(url, {
  //     method: 'POST',
  //     headers: {
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(data)
  //   })
  //   .then(res => {
  //     console.log('Successful serverRequest2 POST-request', res);
  //     return res.json();
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   });
  // }

  getNomad() {
    console.log('getting nomad');
    this.serverRequest(
      '/classes/city',
      this.state.selectedCity, this.formatNomadData.bind(this)
    );
  }

  getData() {
    console.log('getting getData');
    this.getItinerary();
    this.getNomad();
  }

  formatNomadData(data) {
    this.setState({
      nomadData: data.result[0].info.weather.type
    });
  }

  toggleFilter(event) {
    event.preventDefault();
    debugger
    let yelpFilter = event.target.id
    //Check if filter needs to be added or removed from state
    let foundFilter = _.indexOf(this.state.filters, yelpFilter)
    if (foundFilter === -1) {
      //Highlight button that was pressed
      event.target.className = event.target.className.concat(' btn-primary');
      this.setState({
        filters: this.state.filters.concat(yelpFilter)
      });
    } else {
      //Remove highlight of button
      event.target.className = event.target.className.replace('btn-primary', '');
      let filters = this.state.filters.slice()
      filters.splice(foundFilter, 1);
      this.setState({
        filters: filters
      })
    }
  }

  render() {
    return (
      <div>
        <div className="container centerText">
          <form>
            <h1>{this.state.filters}</h1>
            <h2>Where will your travels take you?</h2>
            <div className='row'>
              <label>
                Destination:
                <div>
                  <Geosuggest className='geosuggest' placeholder='Search a city' onSuggestSelect={this.onSuggestSelect.bind(this)} />
                </div>

              </label>
              <br/>
              <label>
                Start Date:
                <input type='date' value={this.state.start} onChange={this.handleInputChange.bind(this)} id="startDate"></input>
              </label>
              <br/>
              <label>
                End Date:
                <input type='date' value={this.state.end} onChange={this.handleInputChange.bind(this)} id="endDate"></input>
              </label>
            </div>
          </form>
          <br/>
          <FilterButtons toggleFilter={this.toggleFilter.bind(this)}/>
          <br/>
          <div className='planner-prefs'>
            <button className="btn btn-success" onClick={this.getData.bind(this)}>Create</button>
          </div>
        </div>

        <h2>City Facts</h2>
        <div>{this.state.nomadData}</div>

        <div>
          <PlannerView 
            location={this.state.location} 
            numDays={this.state.numDays} 
            yelpEvents={this.state.yelpEvents} 
            events={this.state.events} 
            swap={this.swap.bind(this)}
            handleChange={this.handleChange.bind(this)}
            saveItinerary={this.saveItinerary.bind(this)}
          />
        </div>
      </div>
    );
  }

}
