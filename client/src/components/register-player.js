import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PlayerForm from './player-form';
import Back from './back';

export function RegisterPlayer(props) {
	if (!props.loggedIn) {
		return <Redirect to="/" />;
	}

	return (
		<div>
			<main className="home">
				<PlayerForm authToken={props.authToken} />
				{/*Player registration temporarily down.*/}
			</main>
			<footer>
			{ props.loggedIn ? <Back /> : '' }
			</footer>
		</div>
	)
}

const mapStateToProps = state => ({
	loggedIn: state.auth.currentUser !== null,
	authToken: state.auth.authToken,
});

export default connect(mapStateToProps)(RegisterPlayer);