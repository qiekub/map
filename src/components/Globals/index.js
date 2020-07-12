import React from 'react'

import 'intl-pluralrules'
import { AppLocalizationProvider } from '../../l10n.js'

import local_ip from '../../.env.local_ip.json'

import { ApolloClient } from 'apollo-boost'

import { HttpLink } from 'apollo-link-http'

import { InMemoryCache } from 'apollo-cache-inmemory'
import { persistCache } from 'apollo-cache-persist'

import { withLocalStorage } from '../LocalStorage/'

import {
	whoami as query_whoami,
	countries as query_countries,
} from '../../queries.js'

const isDevEnvironment = (local_ip !== '')


function getCookie(name){
	const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
	if (match) {
		return match[2]
	}
	return null
}

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

	const __session = getCookie('__session')

	globalState.graphql = new ApolloClient({
		cache,
		link: new HttpLink({
			credentials: 'omit',
			headers: {
				'-x-session': __session,
			},
			uri: (
				isDevEnvironment
				? `http://${local_ip}:5000/qiekub/us-central1/graphql/graphql/v1`
				: `https://api.qiekub.org/graphql/v1/`
			),
		})
	})

	if (!!__session) {
		globalState.graphql.query({
			query: query_whoami,
			fetchPolicy: 'cache-first',
		}).then(result => {
			globalState.profileID = result.data.whoami
		}).catch(error => {
			console.error(error)
		}).finally(() => {
			globalState.globalStateFinishedLoading = true
			callback(globalState)
		})
	}else{
		globalState.globalStateFinishedLoading = true
		callback(globalState)
	}
}



// ----------------------------------------------------------------

const GlobalsContext = React.createContext()

class GlobalsProvider extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			globalStateFinishedLoading: false,

			pageOpenTS: new Date(),
			profileID: null,
	
			local_ip,
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
						domain: '.qiekub.org',
						secure: true,
					}
				)
			},

			userLocales: /*['de'] ||*/ navigator.languages,

			emojis: {
				audience_queer_only: '🏳️‍🌈',
				audience_queer_primary: '🌈',
				audience_queer_welcome: '✨',
			},
		}
		// this.state = {
		// 	...globalState,
		// 	set: (...attrs) => {
		// 		this.setState(...attrs)
		// 	}
		// }

		this.country_by_iso = null
		this.saved_country_callbacks = []

		this.getCountryByCode_internal = this.getCountryByCode_internal.bind(this)
		this.getCountryByCode = this.getCountryByCode.bind(this)
	}

	componentDidMount(){
		getInitialGlobalState(globalState=>{
			this.setState({
				...globalState,
				getCountryByCode: this.getCountryByCode,
			}, ()=>{
				this.getCountryByCode()
			})
		})
	}

	getCountryByCode_internal(iso_a3){
		return this.country_by_iso[iso_a3]
	}

	getCountryByCode(iso_a3, callback){
		if (iso_a3 && callback) {
			this.saved_country_callbacks.push(()=>{
				callback(this.getCountryByCode_internal(iso_a3))
			})
		}

		if (this.country_by_iso === null) {
			if (!!this.state.graphql) {
				const ios_tag_key = 'ISO3166-1:alpha3'
				this.state.graphql.watchQuery({
					fetchPolicy: 'cache-and-network',
					query: query_countries,
					variables: {
						wantedTags: [ios_tag_key],
						languages: navigator.languages,
					},
				})
				.subscribe(({data}) => {
					if (this.country_by_iso === null && !!data && !!data.countries) {
						const country_by_iso = {}
		
						for (const doc of data.countries) {
							country_by_iso[doc.properties.tags[ios_tag_key]] = doc
						}
		
						this.country_by_iso = country_by_iso
	
						for (const saved_country_callback of this.saved_country_callbacks) {
							saved_country_callback()
						}
					}
				})
			}
		}else{
			for (const saved_country_callback of this.saved_country_callbacks) {
				saved_country_callback()
			}
		}
	}

	render() {
		return (
			<GlobalsContext.Provider
				key="GlobalsContext.Provider"
				value={this.state}
			>
				<AppLocalizationProvider key="AppLocalizationProvider" userLocales={this.state.userLocales}>
					{
						this.state.globalStateFinishedLoading
						? this.props.children
						: <>Loading cache data…</>
					}
				</AppLocalizationProvider>
			</GlobalsContext.Provider>
		)
	}
}

function useGlobals() {
	return React.useContext(GlobalsContext)
}

function withGlobals(Component) {
	const ComponentWrapped = withLocalStorage(Component)
	
	return React.forwardRef(function(props, ref){
		const globals = useGlobals()
		return <ComponentWrapped globals={globals} ref={ref} {...props} />
	})
}

export default GlobalsContext

export { GlobalsContext, GlobalsProvider, withGlobals, useGlobals }


