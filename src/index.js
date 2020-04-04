import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

import 'intl-pluralrules'
import { AppLocalizationProvider } from './l10n.js';

import local_ip from './.env.local_ip.json'

// import * as serviceWorker from './serviceWorker'

import App from './components/App/'

import ApolloClient from 'apollo-boost'
// import { InMemoryCache } from 'apollo-cache-inmemory';
// const cache = new InMemoryCache()

window.pageOpenTS = new Date()
window.env_local_ip = local_ip

window.graphql = new ApolloClient({
	// cache,
	uri: (
		window.env_local_ip !== ''
		? `http://${window.env_local_ip}:5000/queercenters/us-central1/graphql/graphql/v1`
		: `${window.location.origin}/graphql/v1`
	),
})

ReactDOM.render(
	<AppLocalizationProvider userLocales={navigator.languages}>
		<App />
	</AppLocalizationProvider>,
	document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister()
