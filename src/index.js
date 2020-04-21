import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

import { CookiesProvider } from 'react-cookie'

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

window.transitionDuration = 300
window.isSmallScreen = true
window.sidebarIsOpen = false

window.cookieOptions = {
	path: '/',
	expires: ( new Date().setFullYear(new Date().getFullYear()+1) ).toUTCString(), // expires in one year // these cookies doesn't exist for ever, cause they are used as a simple spam protection. Even one month would probably be enough.
	domain: '.qiekub.com',
	secure: true,
}

window.getTranslation = (array) => {
	array = array || []
	return (
		array.length > 0
		? (!!array[0].text ? array[0].text : '')
		: ''
	)
}

window.graphql = new ApolloClient({
	// cache,
	uri: (
		window.env_local_ip !== ''
		? `http://${window.env_local_ip}:5000/qiekub/us-central1/graphql/graphql/v1`
		: `https://api.qiekub.com/graphql/v1/`
	),
})

ReactDOM.render(
	<AppLocalizationProvider userLocales={/*['de'] || */navigator.languages}>
		<CookiesProvider>
			<App />
		</CookiesProvider>
	</AppLocalizationProvider>,
	document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister()
