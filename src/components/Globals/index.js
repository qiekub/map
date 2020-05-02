import React from 'react'

import { CookiesProvider } from 'react-cookie'

import 'intl-pluralrules'
import { AppLocalizationProvider } from '../../l10n.js'

import local_ip from '../../.env.local_ip.json'

import ApolloClient from 'apollo-boost'

import { InMemoryCache } from 'apollo-cache-inmemory'
import { persistCache } from 'apollo-cache-persist'



const isDevEnvironment = (local_ip !== '')



async function getInitialGlobalState(callback){
	const cache = new InMemoryCache()

	try {
		// await before instantiating ApolloClient, else queries might run before the cache is persisted
		await persistCache({
			cache,
			storage: window.localStorage,
		})
	} catch (error) {
		console.error('Error restoring Apollo cache', error)
	}
	
	
	const globalState = {}

	globalState.globalStateFinishedLoading = true

	globalState.graphql = new ApolloClient({
		cache,
		uri: (
			isDevEnvironment
			? `http://${local_ip}:5000/qiekub/us-central1/graphql/graphql/v1`
			: `https://api.qiekub.com/graphql/v1/`
		),
		// uri: 'https://us-central1-qiekub.cloudfunctions.net/graphql/graphql/v1',
	})

	callback(globalState)
}



// ----------------------------------------------------------------

const waitingForConicGradient = []

const GlobalsContext = React.createContext()

class GlobalsProvider extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			globalStateFinishedLoading: false,

			pageOpenTS: new Date(),
	
			isDevEnvironment,
	
			transitionDuration: 300,
			isSmallScreen: true,
			sidebarIsOpen: false,

			mainMapFunctions: undefined,

			cookieOptions: {
				path: '/',
				maxAge: 31557600, // expires in one year // these cookies doesn't exist for ever, cause they are used as a simple spam protection. Even one month would probably be enough.
				...(
					isDevEnvironment
					? undefined
					: {
						domain: '.qiekub.com',
						secure: true,
					}
				)
			},

			userLocales: /*['de'] ||*/ navigator.languages,

			ConicGradient: undefined,
			updateOnConicGradient: this.updateOnConicGradient,

		}
		// this.state = {
		// 	...globalState,
		// 	set: (...attrs) => {
		// 		this.setState(...attrs)
		// 	}
		// }

		getInitialGlobalState(globalState=>{
			this.setState(globalState)
		})

		this.checkForConicGradient()

		this.updateOnConicGradient = this.updateOnConicGradient.bind(this)
		this.checkForConicGradient = this.checkForConicGradient.bind(this)
	}

	updateOnConicGradient(callback){
		if (!!callback) {
			if (!!this.state && !!this.state.ConicGradient) {
				callback()
			}else{
				waitingForConicGradient.push(callback)
			}
		}
	}
	checkForConicGradient(){
		if (false && !!window.ConicGradient) {
			this.setState({ConicGradient: window.ConicGradient})
		} else {
			this.checkForConicGradient_interval = setInterval(()=>{
				if (!!window.ConicGradient) {
					clearInterval(this.checkForConicGradient_interval)

					this.setState({ConicGradient: window.ConicGradient}, ()=>{
						for (const callback of waitingForConicGradient) {
							callback()
						}
					})
				}
			}, 10)
		}
	}

	render() {
		return (
			<GlobalsContext.Provider
				key="GlobalsContext.Provider"
				value={this.state}
			>
				<AppLocalizationProvider key="AppLocalizationProvider" userLocales={this.state.userLocales}>
					<CookiesProvider key="CookiesProvider">
						{
							this.state.globalStateFinishedLoading
							? this.props.children
							: <>Loading cache data…</>
						}
					</CookiesProvider>
				</AppLocalizationProvider>
			</GlobalsContext.Provider>
		)
	}
}

function useGlobals() {
	return React.useContext(GlobalsContext)
}

function withGlobals(Component) {
	return React.forwardRef(function(props, ref){
		const globals = useGlobals()
		return <Component globals={globals} ref={ref} {...props} />
	})
}

export default GlobalsContext

export { GlobalsContext, GlobalsProvider, withGlobals, useGlobals }


