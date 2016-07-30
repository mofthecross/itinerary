import React from 'react';
import ReactDOM from 'react-dom';
import {Router, hashHistory, Route, IndexRoute, IndexRedirect, Home, Link} from 'react-router';
import {App} from './App';
import SignupView from './SignupView';
import LoginView from './LoginView';
import LandingView from './LandingView';
import ChoosePlannerView from './ChoosePlannerView';
import ItineraryView from './ItineraryView';
import UserItineraryView from './UserItineraryView';
import NomadView from './NomadView';

var requireAuth = function() {
  if (!window.user) {
    window.location.hash = 'login';
  }
};

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={Home} />
      <IndexRedirect to="/landing" />
      <Route path='signup' component={SignupView} />
      <Route path='login' component={LoginView} />
      <Route path='landing' component={LandingView} />
      <Route path='choose-planner' component={ChoosePlannerView} />
      <Route path='itineraries' component={ItineraryView} onEnter={requireAuth} />
      <Route path='user-itineraries' component={UserItineraryView} onEnter={requireAuth} />
    </Route>
  </Router>
), document.getElementById('app'));
