import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

import local_ip from './.env.local_ip.json'

// import * as serviceWorker from './serviceWorker'

import App from './App/index.js'

import ApolloClient from 'apollo-boost'
// import { InMemoryCache } from 'apollo-cache-inmemory';

// const cache = new InMemoryCache()

window.graphql = new ApolloClient({
	// cache,

	uri: (
		local_ip !== ''
		? `http://${local_ip}:5000/queercenters/us-central1/graphql/graphql/v1`
		: `${window.location.origin}/graphql/v1`
	),
})

window.pageOpenTS = new Date()

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister()
