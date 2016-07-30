import React from 'react';

export let NomadView = (props) => {
  if (props.data.defined) {
    var renderTags = 
      <div className="panel panel-success col-md-6 col-md-offset-3">
        <div className="panel-heading">
          <h1 className="panel-title">Available City Facts</h1>
        </div>
        <div className="padding">
          <i className="fa fa-star" aria-hidden="true"></i> <b>City Rating:</b> {props.data.scores.nomadScore}
          <br></br>
          <i className="fa fa-moon-o" aria-hidden="true"></i> <b>Night Life Rating:</b> {props.data.scores.nightLife}
          <br></br>
          <i className="fa fa-users" aria-hidden="true"></i> <b>Safety Rating:</b> {props.data.scores.safety}
          <br></br>
          <i className="fa fa-sun-o" aria-hidden="true"></i> <b>Current Temperature:</b> {props.data.weather.temperature}
          <br></br>
          <i className="fa fa-bolt" aria-hidden="true"></i> <b>Weather Type:</b> {props.data.weather.type}
          <br></br>
          <i className="fa fa-bed" aria-hidden="true"></i> <b>Average Hotel Cost Per Night:</b> ${props.data.cost.hotel}
          <br></br>
          <i className="fa fa-home" aria-hidden="true"></i> <b>Average AirBnb Cost Per Night:</b> ${props.data.cost.airbnb}
        </div>
      </div>;
  }

  return (
    <div>
      {renderTags}
    </div>
  );
};
