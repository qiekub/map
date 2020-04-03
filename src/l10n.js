import React from 'react'

// https://projectfluent.org/play/

// import {LocalizationProvider,Localized} from '@fluent/react' // '@fluent/react/compat'
import { LocalizationProvider } from '@fluent/react'
import { FluentBundle, FluentResource } from '@fluent/bundle'
import { negotiateLanguages } from '@fluent/langneg'

const _supportedLocales_ = ['en','de']
const _defaultLocale_ = 'en'

async function fetchMessages(locale) {
	// import('./locales/en.ftl').then(Text => {
	// 	console.log('Text', Text)
	// })

	const path = await import('./locales/'+locale+'.ftl')

	const response = await fetch(path.default)
	const messages = await response.text()

	return { [locale]: new FluentResource(messages) }
}

async function createMessagesGenerator(currentLocales) {
	const fetched = await Promise.all(
		currentLocales.map(fetchMessages)
	)
	const messages = fetched.reduce(
		(obj, cur) => Object.assign(obj, cur)
	)

	return function* generateBundles() {
		for (const locale of currentLocales) {
			const bundle = new FluentBundle(locale)
			bundle.addResource(messages[locale])
			yield bundle
		}
	}
}

export class AppLocalizationProvider extends React.Component {
	constructor(props) {
		super(props)
		this.state = {}
	}

	async componentDidMount() {
		const currentLocales = negotiateLanguages(
			this.props.userLocales,
			_supportedLocales_,
			{ defaultLocale: _defaultLocale_ }
		)

		const generateBundles  = await createMessagesGenerator(currentLocales)
		this.setState({ bundles: generateBundles() })
	}

	render() {
		const { children } = this.props
		const { bundles } = this.state

		if (!bundles) {
			// Show a loader.
			return <div>…</div>
		}

		return (
			<LocalizationProvider bundles={bundles}>
				{children}
			</LocalizationProvider>
		)
	}
}