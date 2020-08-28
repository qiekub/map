import ilga_dataset from './data/dist/ilga_2019.json'

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



export function addAddressFormatDefaults(addressFormat){
	// format-defaults from ID
	addressFormat.format = addressFormat.format || [
		['housenumber', 'street'],
		['city', 'postcode']
	]

	// widths-defaults from ID
	addressFormat.widths = addressFormat.widths || {
		housenumber: 1/3, street: 2/3, unit: 1/3,
		city: 2/3, state: 1/3, postcode: 1/3,
		// housenumber: 1/3, street: 2/3,
		// city: 2/3, state: 1/4, postcode: 1/3,
	}

	addressFormat.keys = addressFormat.keys || [].concat(...addressFormat.format)

	return addressFormat
}

export function getAddressFormatDefault(){
	for (const addressFormat of addressFormats) {
		if (addressFormat.countryCodes.length === 0) {
			return addAddressFormatDefaults(addressFormat)
		} 
	}

	return null
}

export function getAddressFormatByCountryCode(countryCode, showAllFields){
	countryCode = (countryCode || '').toUpperCase()

	let addressFormat2return = null

	for (const addressFormat of addressFormats) {
		if (addressFormat.countryCodes.includes(countryCode)) {
			addressFormat2return = addAddressFormatDefaults(addressFormat)
			break
		}
	}

	if (addressFormat2return === null) {
		addressFormat2return = getAddressFormatDefault()
	}

	addressFormat2return = JSON.parse(JSON.stringify(addressFormat2return)) // clone the object as we are using push afterwards

	if (showAllFields && addressFormat2return !== null) {
		const alreadInUseKeys = addressFormat2return.keys

		for (const addressFormat of addressFormats) {
			if (addressFormat.countryCodes.includes('_ALL_FIELDS_')) {
				const missingKeys = addressFormat.keys
				
				const keys2add = missingKeys.filter(key => !alreadInUseKeys.includes(key))
				for (const key of keys2add) {
					addressFormat2return.format.push([key])
					addressFormat2return.widths[key] = 1
				}

				break
			}
		}
	}

	return addressFormat2return
}

export function getAddressFormatByTags(tags) {
	const addr_keys = Object.keys(tags)
	.filter(key => key.startsWith('addr:'))
	.map(key => key.split('addr:')[1])

	return getAddressFormatBySubkeys(addr_keys)
}

export function getAddressFormatBySubkeys(addr_keys) {
	let lastMatchCount = 0
	let lastAddressFormat = null
	for (const addressFormat of addressFormats) {
		if (!addressFormat.countryCodes.includes('_ALL_FIELDS_')) {
			const thisMatchCount = addr_keys.filter(value => addressFormat.keys.includes(value)).length
			
			if (thisMatchCount >= lastMatchCount) {
				lastMatchCount = thisMatchCount
				lastAddressFormat = addressFormat
			}
		}
	}
	
	if (!!lastAddressFormat) {
		return addAddressFormatDefaults(lastAddressFormat)
	}
	
	return null
}


export function getWantedTagsList(presets){
	return [...new Set([].concat(...Object.values(presets).map(preset=>Object.keys(preset.tags))))]
}


export function getILGA(alpha3code){
		const TR = {} // TR means "to return"

		if (!(!!alpha3code)) {
			return null
		}
		
		
		const ilga = ilga_dataset[alpha3code]

		if (!(!!ilga)) {
			return null
		}
		
		TR.ilga = ilga


		// ### criminalisation:legality
		const legality_values = [
			'legal_for_all',
			'legal_for_males',
			'legal_for_female',
			'illegal_for_all',
			'illegal_for_males',
			'illegal_for_female',
			'unknown',
		]

		const legality_key = 'criminalisation:legality'
		const gender_key = 'criminalisation:legality:by_gender'

		TR.criminalisation = {}
		TR.criminalisation.description = 'criminalisation:legality:unknown'
		if (
			ilga.hasOwnProperty(gender_key)
			&& legality_values.includes(ilga[gender_key])
		) {
			TR.criminalisation.description = 'criminalisation:legality:'+ilga[gender_key]
		} else if (ilga.hasOwnProperty(legality_key)) {
			if (ilga[legality_key] === true) {
				TR.criminalisation.description = 'criminalisation:legality:legal_for_all'
			} else if (ilga[legality_key] === false) {
				TR.criminalisation.description = 'criminalisation:legality:illegal_for_all'
			}
		}

		TR.criminalisation.status = null
		if (TR.criminalisation.description === 'criminalisation:legality:legal_for_all') {
			TR.criminalisation.status = 'great'
		} else if (TR.criminalisation.description === 'criminalisation:legality:illegal_for_all') {
			TR.criminalisation.status = 'bad'
		} else if (TR.criminalisation.description !== 'criminalisation:legality:unknown') {
			TR.criminalisation.status = 'ok'
		}

		TR.criminalisation.description = [TR.criminalisation.description]


		// ### criminalisation:penalty
		TR.penalty = {}
		TR.penalty.description = []
		TR.penalty.vars = {}
		const penalty_keys = Object.keys(ilga)
		.filter(key => key.startsWith('criminalisation:penalty:max:'))
		.sort((a, b) => a-b)
			
		for (const key of penalty_keys) {
			if (ilga[key] === true) {
				TR.penalty.description.push(key)
			} else if (!isNaN(ilga[key]) && ilga[key] > 0) {
				TR.penalty.description.push('criminalisation:penalty:max:years')
				TR.penalty.vars.years = ilga[key]
			}
		}

		TR.penalty.status = null
		if (TR.penalty.description.length === 0) {
			TR.penalty.status = 'great'
			TR.penalty.description.push('criminalisation:penalty:none')
		} else if (TR.penalty.description.length > 0) {
			if (
				TR.penalty.description.includes('criminalisation:penalty:max:death')
				|| TR.penalty.description.includes('criminalisation:penalty:max:lifetime')
			) {
				TR.penalty.status = 'bad'
			}else{
				TR.penalty.status = 'ok'
			}
		}


		// ### protection
		TR.protection = {}
		TR.protection.description = []
		const protection_keys = Object.keys(ilga)
		.filter(key => key.startsWith('protection:'))
		.sort((a, b) => a-b)
			
		for (const key of protection_keys) {
			if (ilga[key] === true) {
				TR.protection.description.push(key)
			}
		}

		TR.protection.status = null
		if (
			TR.protection.description.includes('protection:constitutional')
			|| TR.protection.description.length >= 6 // max is 6
		) {
			TR.protection.status = 'great'
		} else if (TR.protection.description.length > 0) {
			TR.protection.status = 'ok'
		} else {
			TR.protection.status = 'bad'
		}

		if (TR.protection.description.length === 0) {
			TR.protection.description.push('protection:none')
		}


		// ### recognition
		TR.recognition = {}
		TR.recognition.description = []
		const recognition_keys = Object.keys(ilga)
		.filter(key => key.startsWith('recognition:'))
		.sort((a, b) => a-b)
			
		for (const key of recognition_keys) {
			if (ilga[key] === true) {
				TR.recognition.description.push(key)
			}
		}

		TR.recognition.status = null
		if (
			TR.recognition.description.includes('recognition:marriage')
			|| TR.recognition.description.length >= 4 // max is 4
		) {
			TR.recognition.status = 'great'
		} else if (TR.recognition.description.length > 0) {
			TR.recognition.status = 'ok'
		} else {
			TR.recognition.status = 'bad'
		}

		if (TR.recognition.description.length === 0) {
			TR.recognition.description.push('recognition:none')
		}


		TR.overview = {}
		TR.overview.statusNumber = -1
		if (
			TR
			&& TR.criminalisation
			&& TR.criminalisation.status
			&& TR.penalty
			&& TR.penalty.status
			&& TR.protection
			&& TR.protection.status
			&& TR.recognition
			&& TR.recognition.status
		) {
			const getStatusNumber = status => {
				if (status === 'great') {
					return 1
				} else if (status === 'ok') {
					return 2
				} else if (status === 'bad') {
					return 3
				}
				return -1
			}

			TR.overview.statusNumber = Math.max(...[
				getStatusNumber(TR.criminalisation.status),
				getStatusNumber(TR.penalty.status),
				getStatusNumber(TR.protection.status),
				getStatusNumber(TR.recognition.status),
			])
		}


		return TR
}

export function getCountryCode(properties){
	let country_code = null
	if (properties.ISO_A3 && properties.ISO_A3 !== '-99') {
		country_code = properties.ISO_A3
	} else if (properties.ISO_A3_EH && properties.ISO_A3_EH !== '-99') {
		country_code = properties.ISO_A3_EH
	} else if (properties.ADM0_A3 && properties.ADM0_A3 !== '-99') {
		country_code = properties.ADM0_A3
	}

	return country_code
}


