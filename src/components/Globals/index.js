import React from 'react'

import 'intl-pluralrules'
import { AppLocalizationProvider } from '../../l10n.js'

import local_ip from '../../.env.local_ip.json'

import {
	ApolloClient,
	HttpLink,
	InMemoryCache,
} from '@apollo/client'
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
				? 'http://0.0.0.0:11692/graphql/v1/' // `http://${local_ip}:5000/qiekub/us-central1/graphql/graphql/v1`
				: `https://api2.qiekub.org/graphql/v1/`
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

		this.loadedCountries = false
		this.country_by_iso_a2 = {}
		this.country_by_iso_a3 = {} 
		this.saved_country_callbacks = []

		this.loadCountries = this.loadCountries.bind(this)
		this.getCountryByAlpha2 = this.getCountryByAlpha2.bind(this)
		this.getCountryByAlpha3 = this.getCountryByAlpha3.bind(this)
		this.convert_alpha3_to_alpha2 = this.convert_alpha3_to_alpha2.bind(this)
		this.convert_alpha2_to_alpha3 = this.convert_alpha2_to_alpha3.bind(this)
		this.getCountryByCode = this.getCountryByCode.bind(this)
	}

	componentDidMount(){
		getInitialGlobalState(globalState=>{
			this.setState({
				...globalState,
				getCountryByAlpha2: this.getCountryByAlpha2,
				getCountryByAlpha3: this.getCountryByAlpha3,
				convert_alpha3_to_alpha2: this.convert_alpha3_to_alpha2,
				convert_alpha2_to_alpha3: this.convert_alpha2_to_alpha3,
				getCountryByCode: this.getCountryByCode,
			}, ()=>{
				this.loadCountries()
			})
		})
	}


	loadCountries(callback){
		if (callback) {
			this.saved_country_callbacks.push(callback)
		}

		if (!this.loadedCountries) {
			if (!!this.state.graphql) {
				this.state.graphql.watchQuery({
					fetchPolicy: 'cache-and-network',
					query: query_countries,
					variables: {
						wantedTags: [
							// 'ISO3166-1',
							'ISO3166-1:alpha2',
							'ISO3166-1:alpha3',
							// 'ISO3166-1:numeric',
							// 'timezone',
						],
						languages: navigator.languages,
					},
				})
				.subscribe(({data}) => {
					if (!!data && !!data.countries) {
						const country_by_iso_a2 = {}
						const country_by_iso_a3 = {}
		
						for (const doc of data.countries) {
							let country_key_a2 = doc.properties.tags['ISO3166-1:alpha2']
							if (country_key_a2) {
								country_key_a2 = country_key_a2.toUpperCase()
								country_by_iso_a2[country_key_a2] = doc
							}

							let country_key_a3 = doc.properties.tags['ISO3166-1:alpha3']
							if (country_key_a3) {
								country_key_a3 = country_key_a3.toUpperCase()
								country_by_iso_a3[country_key_a3] = doc
							}
						}
		
						this.country_by_iso_a2 = country_by_iso_a2
						this.country_by_iso_a3 = country_by_iso_a3

						this.loadedCountries = true
	
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

	getCountryByAlpha2(alpha2, callback){
		this.loadCountries(()=>{
			alpha2 = alpha2.toUpperCase()
			callback(this.country_by_iso_a2[alpha2])
		})
	}
	getCountryByAlpha3(alpha3, callback){
		this.loadCountries(()=>{
			alpha3 = alpha3.toUpperCase()
			callback(this.country_by_iso_a3[alpha3])
		})
	}

	convert_alpha3_to_alpha2(alpha3, callback){
		this.getCountryByAlpha3(alpha3, countryDoc=>{
			callback(countryDoc.properties.tags['ISO3166-1:alpha2'])
		})
	}
	convert_alpha2_to_alpha3(alpha2, callback){
		this.getCountryByAlpha2(alpha2, countryDoc=>{
			callback(countryDoc.properties.tags['ISO3166-1:alpha3'])
		})
	}

	getCountryByCode(iso_a3, callback){
		this.getCountryByAlpha3(iso_a3, callback)
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


