import React, { Component } from 'react';
import {connect} from 'react-redux';
import {Route, withRouter} from 'react-router-dom';

import LandingPage from './components/landing-page';
import Dashboard from './components/dashboard';
import LoginPage from './components/login-page';
import RegisterPage from './components/register-page';
import RegisterPlayer from './components/register-player';
import Player from './components/player';
import PassResetPage from './components/pass-reset-page';
import AdminCreate from './components/admin-create';
import Navbar from './components/navbar';
import Schedule from './components/schedule';
import Team from './components/team';
import Footer from './components/footer';
import AdminPage from './components/admin-page';
import PlayerPage from './components/player-page';
import ResetPage from './components/reset-page';
import LeaguePage from './components/league-page';
import GamePage from './components/game-page';
import CustomNavbar from './components/custom-navbar';
import StandingsPage from './components/standings-page';
import TeamAssign from './components/team-assign'
import PlayerTeam from './components/player-team';
import Results from './components/results';
import RulesPage from './components/rules-page';
import ShetlandRules from './components/shetland-rules';
import PintoRules from './components/pinto-rules';
import MustangRules from './components/mustang-rules';
import BroncoRules from './components/bronco-rules';
import NewsPage from './components/news-page';
import DivisionSchedule from './components/division-schedule';
import GameTable from './components/game-table';

export class App extends Component {

  render() {
    return (
      <div className="App">
        <Navbar />
        {/*<CustomNavbar />*/}
        <div>
          <Route exact path="/" component={LandingPage} />
          <Route exact path="/register" component={RegisterPage} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path='/league' component={LeaguePage} />
          <Route exact path='/schedule' component={Schedule} />
          <Route exact path='/schedule/:division' component={DivisionSchedule} />
          <Route exact path="/register-player" component={RegisterPlayer} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/player/:id" component={PlayerPage} />
          <Route exact path='/news' component={NewsPage} />
          <Route path="/team/:id" component={Team} />
          {/*<Route path='/game/:id' component={GamePage} />*/}
          <Route exact path='/standings' component={StandingsPage} />
          <Route path="/create" component={AdminCreate} />
          <Route path='/gametable' component={GameTable} />
          <Route path="/admin" component={AdminPage} />
          <Route exact path='/reset' component={ResetPage} />
          <Route path='/reset/:hash' component={PassResetPage} />
          <Route path='/teamassign' component={TeamAssign} />
          <Route path='/team2' component={PlayerTeam} />
          <Route path='/results' component={Results} />
          <Route exact path='/rules' component={RulesPage} />
          <Route exact path='/rules/shetland' component={ShetlandRules} />
          <Route exact path='/rules/pinto' component={PintoRules} />
          <Route exact path='/rules/mustang' component={MustangRules} />
          <Route exact path='/rules/bronco' component={BroncoRules} />
        </div>
        <Footer/>
      </div>
    );
  }
}

const mapStateToProps = state => ({
	hasAuthToken: state.auth.authToken !== null,
	loggedIn: state.auth.currentUser !== null
})

export default withRouter(connect(mapStateToProps)(App));
