import { negotiateLanguages } from '@fluent/langneg'
import address_formats from './data/dist/address_formats.json'
const addressFormats = address_formats.map(item => ({
	...item,
	keys: [].concat(...item.format),
}))


export function uuidv4() {
	// source: https://stackoverflow.com/a/2117523/2387277
	// source: https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		// eslint-disable-next-line
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	)
}



export function getTranslation(texts, userLocales = []) {
	// texts = {
	// 	en: 'hello world'
	// }

	if (typeof texts === 'object') {
		const keys = Object.keys(texts)
		if (keys.length > 0) {
			const currentLocales = negotiateLanguages(
				userLocales,
				keys,
				{}
			)

			if (currentLocales.length > 0) {
				return texts[currentLocales[0]]
			}
			return texts[keys[0]]
		}
	}

	return ''
}
export function getTranslationFromArray(texts_array, ...attrs) {
	// texts_array = [
	// 	language: 'en',
	// 	text: 'hello world',
	// ]

	if (!Array.isArray(texts_array)) {
		return ''
	}

	const text_object = {}
	for (const text of texts_array) {
		text_object[text.language || ''] = text.text
	}

	return getTranslation(text_object, ...attrs)
}



export function getPreset(tags,presets) {
	const tags_keys = Object.keys(tags)
	for (const preset_key in presets) {
		const preset_tags = presets[preset_key].tags
		const preset_tags_keys = Object.keys(preset_tags)

		const common_keys = preset_tags_keys.filter(key => tags_keys.includes(key))

		if (common_keys.length === preset_tags_keys.length) {
			const okay_keys = common_keys.filter(key => preset_tags[key] === '*' || tags[key].includes(preset_tags[key]))
			if (okay_keys.length === preset_tags_keys.length) {
				return {
					key: preset_key,
					...presets[preset_key],
				}
			}
		}
	}


	return presets.default
}


export function getColorByPreset(preset_key,colorsByPreset_sorted){
	for (const pair of colorsByPreset_sorted) {
		if (preset_key.startsWith(pair[0])) {
			return pair[1]
			// break
		}
	}
}


export function getAddressFormat(tags) {

	// if (!!tags['addr:format']) {
	// 	const format_country_code = tags['addr:format'].toUpperCase()
	// 	for (const addressFormat of addressFormats) {
	// 		if (addressFormat.countryCodes.includes(format_country_code)) {
	// 			return addressFormat
	// 		}
	// 	}
	// }

	// TODO: The following code is not getting the correct address format.

	const addr_keys = Object.keys(tags)
	.filter(key => key.startsWith('addr:'))
	.map(key => key.split('addr:')[1])
	
	// const addr_keys_length = addr_keys.length
	
	let lastMatchCount = 0 // 99999
	let lastAddressFormat = null
	for (const addressFormat of addressFormats) {
		const thisMatchCount = addr_keys.filter(value => addressFormat.keys.includes(value)).length
		// const length_difference = Math.abs(addressFormat.keys.length - addr_keys_length) / addr_keys_length
		// const existing_keys_difference = Math.ceil((1 - (thisMatchCount / addr_keys_length))*100)*0.01
		// const sum_difference = length_difference + existing_keys_difference
		
		if (thisMatchCount >= lastMatchCount) { // if (sum_difference <= lastMatchCount) {
			lastMatchCount = thisMatchCount // sum_difference
			lastAddressFormat = addressFormat
		}
	}

	if (!!lastAddressFormat) {
		return lastAddressFormat
	}


	return address_formats[0]
}


export function getWantedTagsList(presets){
	return [...new Set([].concat(...Object.values(presets).map(preset=>Object.keys(preset.tags))))]
}