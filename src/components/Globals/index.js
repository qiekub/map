import React from 'react'

import { CookiesProvider } from 'react-cookie'

import 'intl-pluralrules'
import { AppLocalizationProvider } from '../../l10n.js'

import local_ip from '../../.env.local_ip.json'

import ApolloClient from 'apollo-boost'
// import { InMemoryCache } from 'apollo-cache-inmemory';
// const cache = new InMemoryCache()

const globalState = {}

globalState.pageOpenTS = new Date()

globalState.env_local_ip = local_ip
globalState.isDevEnvironment = (local_ip !== '')

globalState.transitionDuration = 300
globalState.isSmallScreen = true
globalState.sidebarIsOpen = false

globalState.cookieOptions = {
	path: '/',
	maxAge: 31557600, // expires in one year // these cookies doesn't exist for ever, cause they are used as a simple spam protection. Even one month would probably be enough.
	...(
		globalState.isDevEnvironment
		? undefined
		: {
			domain: '.qiekub.com',
			secure: true,
		}
	)
}

globalState.graphql = new ApolloClient({
	// cache,
	uri: (
		globalState.isDevEnvironment
		? `http://${globalState.env_local_ip}:5000/qiekub/us-central1/graphql/graphql/v1`
		: `https://api.qiekub.com/graphql/v1/`
	),
})

globalState.mainMapFunctions = undefined

globalState.userLocales = /*['de'] ||*/ navigator.languages





















// ----------------------------------------------------------------





















const GlobalsContext = React.createContext()

class GlobalsProvider extends React.Component {
	constructor(props) {
		super(props)

		this.state = globalState
		// this.state = {
		// 	...globalState,
		// 	set: (...attrs) => {
		// 		this.setState(...attrs)
		// 	}
		// }
	}

	render() {
		return (
			<GlobalsContext.Provider
				key="GlobalsContext.Provider"
				value={this.state}
			>
				<AppLocalizationProvider key="AppLocalizationProvider" userLocales={this.state.userLocales}>
					<CookiesProvider key="CookiesProvider">
						{this.props.children}
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


