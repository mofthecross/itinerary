import React from 'react';

export let NomadView = (props) => {
  if (props.data.defined) {
    var renderTags = 
      <div className="panel panel-success">
        <div className="panel-heading">
          <h1 className="panel-title">Available City Facts</h1>
        </div>
        <div>
          <b>City Rating:</b> {props.data.scores.nomadScore}
          <br></br>
          <b>Night Life Rating:</b> {props.data.scores.nightLife}
          <br></br>
          <b>Safety Rating:</b> {props.data.scores.safety}
          <br></br>
          <b>Current Temperature:</b> {props.data.weather.temperature}
          <br></br>
          <b>Weather Type:</b> {props.data.weather.type}
          <br></br>
          <b>Average Hotel Cost Per Night:</b> ${props.data.cost.hotel}
          <br></br>
          <b>Average AirBnb Cost Per Night:</b> ${props.data.cost.airbnb}
        </div>
      </div>;
  }

  return (
    <div>
      {renderTags}
    </div>
  );
};
