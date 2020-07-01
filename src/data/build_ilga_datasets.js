const fs = require('fs')





// START country code

const synonyms = {
	'North Korea': "Korea (Democratic People's Republic of)",
	'South Korea': "Korea (Republic of)",
	'São Tome & Principe': "Sao Tome and Principe",
	'North Macedonia': "Macedonia (the former Yugoslav Republic of)", // TODO: Is this correct?
	'Democratic Republic of Congo': "Congo",
	'Cape Verde': "Cabo Verde", // TODO: Is this correct?

	// from 2019:
	'Eswatini': 'Swati', // War früher Swasiland.
	'St Kitts & Nevis': 'Saint Kitts and Nevis',
	'St Lucia': 'Saint Lucia',
	'St Vincent & the Grenadines': 'Saint Vincent and the Grenadines',
	'Palestine (1)': 'Palestine',
	'Indonesia (2)': 'Indonesia',
	'Syria': 'Syrian Arab Republic',
	'Czechia': 'Czech Republic',
	'Vatican City': 'Holy See',

	// from 2017 and 2016:
	'Gaza (in the Occupied Palestinian Territory)': null,
	'Indonesia (most)': 'Indonesia',
	'South Sumatra and Aceh Provinces (Indonesia)': null,
	'West Bank in the Occupied Palestinian Territory': null,
	'Macedonia (FYROM)': 'Macedonia (the former Yugoslav Republic of)', // TODO: Is this correct?
	'United Kingdom (and associates)': 'United Kingdom of Great Britain and Northern Ireland',
	'Cook Islands (associates to New Zealand)': 'Cook Islands',
}

const alpha3codes = require('./countries/all_countries.json')
.reduce((obj,entry) => {
	obj[entry.name] = entry.alpha3Code
	obj[entry.nativeName] = entry.alpha3Code
	obj[entry.demonym] = entry.alpha3Code

	for (const language in entry.translations) {
		obj[entry.translations[language]] = entry.alpha3Code
	}
	for (const language in entry.altSpellings) {
		obj[entry.altSpellings[language]] = entry.alpha3Code
	}

	return obj
}, {})

function getCountryCode(countryName){
	countryName = countryName.trim()

	if (countryName === '') {
		return null
	}

	if (alpha3codes[countryName]) {
		return alpha3codes[countryName]
	} else if (synonyms[countryName] && alpha3codes[synonyms[countryName]]) {
		return alpha3codes[synonyms[countryName]]
	}

	return null
}

// END country code



	

const keys_in_namespaces = {
	'legality': 'criminalisation',
	'legality:by_gender': 'criminalisation',
	'legality:for_male': 'criminalisation',
	'legality:for_female': 'criminalisation',
	'penalty:max:years': 'criminalisation',
	'penalty:max:lifetime': 'criminalisation',
	'penalty:max:death': 'criminalisation',
	'constitutional': 'protection',
	'broad_protections': 'protection',
	'employment': 'protection',
	'hate_crime': 'protection',
	'incitement': 'protection',
	'ct_ban': 'protection',
	'marriage': 'recognition',
	'civil_unions': 'recognition',
	'joint_adoption': 'recognition',
	'second_parent_adoption': 'recognition',
}

function build_2019(){

	const last_values = {}

	const country_key = 'alpha3code'

	const key_synonyms = {
		'COUNTRY': 'alpha3code',
		'CRIMINALISATION CONSENSUAL SAME-SEX SEXUAL ACTS Legal?': 'legality',
		'CRIMINALISATION GENDER Gender/s': 'legality:by_gender',
		'CRIMINALISATION MAX PENALTY Years in Prison / Other': 'penalty:max',
		'PROTECTION PROTECTION AGAINST DISCRIMINATION Constitutional': 'constitutional',
		'PROTECTION PROTECTION AGAINST DISCRIMINATION Broad Protections': 'broad_protections',
		'PROTECTION PROTECTION AGAINST DISCRIMINATION Employment': 'employment',
		'PROTECTION CRIMINALISATION OF VIOLENCE/DISCRIMINATION Hate Crime / Aggr. Circs.': 'hate_crime',
		'PROTECTION CRIMINALISATION OF VIOLENCE/DISCRIMINATION Incitement to Hatred / Violence': 'incitement',
		'PROTECTION CTs Ban on CTs': 'ct_ban',
		'RECOGNITION SAME SEX MARRIAGE Marriage': 'marriage',
		'RECOGNITION CIVIL UNIONS Civil Unions': 'civil_unions',
		'RECOGNITION JOINT ADOPTION Joint Adoption': 'joint_adoption',
		'RECOGNITION SECOND PARENT ADOPTION Second Parent Adoption': 'second_parent_adoption',
	}

	const yes_no_keys = [
		'legality',
		'constitutional',
		'broad_protections',
		'employment',
		'hate_crime',
		'incitement',
		'ct_ban',
		'marriage',
		'civil_unions',
		'joint_adoption',
		'second_parent_adoption',
	]

	let data = fs.readFileSync('./ILGA-datasets/csv/2019.csv', 'utf-8')
	.replace(/\r/g, '')
	.split('\n')
	.map(row => {
		const items = row.split(';')
		let key = items.slice(0, 3).map((item,index) => {
			if (item !== '') {
				last_values[index] = item
			}
			return last_values[index] || item
		}).join(' ').trim()

		key = key_synonyms[key] || key

		let last = items.slice(3, -1).map((value,index) => {
			if (key === country_key) {
				return getCountryCode(value)
			}else if (
				key === 'legality:by_gender'
			) {
				if (value === 'DOES NOT APPLY') {
					return 'legal_for_all'
				} else if (value === 'ANY GENDER') {
					return 'illegal_for_all'
				} else if (value === 'MALE ONLY' || value === 'M ONLY') {
					return 'illegal_for_males'
				}
			}else if (
				key === 'penalty:max'
			) {
				if (!isNaN(value)) {
					return {k:'penalty:max:years',v:value*1}
				} else if (value === 'DOES NOT APPLY') {
					return null
				} else if (value === 'FOR LIFE') {
					return {k:'penalty:max:lifetime',v:true}
				} else if (value === 'DEATH') {
					return {k:'penalty:max:death',v:true}
				} else if (value === 'DEATH (NOT)') {
					return {k:'penalty:max:death',v:true}
				} else if (value === 'DEATH (REG)') {
					return {k:'penalty:max:death',v:true}
				} else if (value === 'UNDETERMINED') {
					// return 'UNDETERMINED'
					return null
				}

				return null
			} else if (yes_no_keys.includes(key)) {
				if (value === 'YES' || value === 'Y') {
					return true
				} else {
					return false
				}
			}

			return null
		})

		if (
			key === 'N'
			|| key === 'CN'
			|| key === 'CONTINENT'
		) {
			key = null
		}

		if (key) {
			return {[key]: last}
		}

		return null
	})
	.filter(v=>!!v)
	.reduce((obj,value)=>({
		...obj,
		...value,
	}), {})

	const data_by_country = {}
	for (let [index, alpha3code] of data[country_key].entries()) {
		const new_object = {}

		const keys = Object.keys(data)
		for (const key of keys) {
			if (key !== country_key) {
				const value = data[key][index]
				if (value !== null) {
					if (
						typeof value === 'object'
						&& value.k
						&& value.v !== null
					) {
						new_object[value.k] = value.v
					}else{
						new_object[key] = value
					}
				}
			}
		}

		new_object['penalty:max:years'] = new_object['penalty:max:years'] || -1
		new_object['penalty:max:lifetime'] = new_object['penalty:max:lifetime'] = false
		new_object['penalty:max:death'] = new_object['penalty:max:death'] || false

		for (const key of Object.keys(new_object)) {
			if (keys_in_namespaces[key]) {
				new_object[keys_in_namespaces[key]+':'+key] = new_object[key]
				delete new_object[key]
			}
		}

		data_by_country[alpha3code] = new_object
	}
	
	return data_by_country
}

function build_2017(){

	const last_values = {}

	const country_key = 'alpha3code'

	const key_synonyms = {
		// 'Continent': '',
		// 'Non-State': '',
		'Country': 'alpha3code',
		'Legal All genders': 'legality',
		// 'Age of consent Equal': '',
		// 'Age of consent Unequal': '',
		'Illegal Male': 'legality:for_male',
		'Illegal Female': 'legality:for_female',
		// 'Penalising text Sexual act': '',
		// 'Penalising text Sodomy': '',
		// 'Penalising text Against nature': '',
		// 'Penalising text Buggery': '',
		// 'Penalising text Indecency/other': '',
		// 'Promotion/Morality Penal code': '',
		// 'Promotion/Morality Morality code': '',
		'Ma.x Sentences (M)onths and (Y)ears 1 M - 2 Y': 'penalty:max:2y',
		'Ma.x Sentences (M)onths and (Y)ears 3 Y - 7 Y': 'penalty:max:7y',
		'Ma.x Sentences (M)onths and (Y)ears 8 Y - 13 Y': 'penalty:max:13y',
		'Ma.x Sentences (M)onths and (Y)ears 14-Y - Life': 'penalty:max:life',
		'Ma.x Sentences (M)onths and (Y)ears Death': 'penalty:max:death',
		// 'Arrests in past 3 years? Yes': '',
		// 'Ban on NGOs Yes': '',
		// 'NRHI - SO-inclusive?  Yes': '',
		// 'NRHI - SO-inclusive?  No': '',
		// 'NRHI - SO-inclusive?  Unclear': '',
		// 'NRHI - SO-inclusive?  None': '',
		'Protection Const-itution': 'constitutional',
		'Protection Employ-ment': 'employment',
		'Protection Other': 'broad_protections',
		'Protection Hate Crime': 'hate_crime',
		'Protection Incite-menrt': 'incitement',
		'Protection CT Ban': 'ct_ban',
		'Relationship recognition Marriage': 'marriage',
		'Relationship recognition Civil recognition': 'civil_unions',
		'Relationship recognition Joint adoption': 'joint_adoption',
		'Relationship recognition 2nd parent adoption': 'second_parent_adoption',
	}

	const yes_no_keys = [
		'legality',
		'constitutional',
		'broad_protections',
		'employment',
		'hate_crime',
		'incitement',
		'ct_ban',
		'marriage',
		'civil_unions',
		'joint_adoption',
		'second_parent_adoption',
	]

	let data = fs.readFileSync('./ILGA-datasets/csv/2017.csv', 'utf-8')
	.replace(/\r/g, '')
	.split('\n')
	.map(row => {
		const items = row.split(';')
		let key = items.slice(0, 2).map((item,index) => {
			if (item !== '') {
				last_values[index] = item
			}
			return last_values[index] || item
		}).join(' ').trim()

		key = key_synonyms[key] || null

		if (key !== null) {
			let last = items.slice(3, -1).map((value,index) => {
				if (key === country_key) {
					return getCountryCode(value)
				}else if (key === 'legality:for_male') {
					if (value !== '') {
						return 'illegal_for_males'
					} else {
						return 'legal_for_males'
					}
				}else if (key === 'legality:for_female') {
					if (value !== '') {
						return 'illegal_for_females'
					} else {
						return 'legal_for_females'
					}
				}else if (key === 'penalty:max:2y') {
					return {k:'penalty:max:years',v:2}
				}else if (key === 'penalty:max:7y') {
					return {k:'penalty:max:years',v:7}
				}else if (key === 'penalty:max:13y') {
					return {k:'penalty:max:years',v:13}
				}else if (key === 'penalty:max:lifetime') {
					if (value === '') {
						return false
					} else {
						return true
					}
				}else if (key === 'penalty:max:death') {
					if (value === '') {
						return false
					} else {
						return true
					}
				} else if (yes_no_keys.includes(key)) {
					if (value !== '') {
						return true
					} else {
						return false
					}
				}
	
				return null
			})

			return {[key]: last}
		}

		return null
	})
	.filter(v=>!!v)
	.reduce((obj,value)=>({
		...obj,
		...value,
	}), {})

	const data_by_country = {}
	for (let [index, alpha3code] of data[country_key].entries()) {
		const new_object = {}

		const keys = Object.keys(data)
		for (const key of keys) {
			if (key !== country_key) {
				const value = data[key][index]
				if (value !== null) {
					if (
						typeof value === 'object'
						&& value.k
						&& value.v !== null
					) {
						new_object[value.k] = value.v
					}else{
						new_object[key] = value
					}
				}
			}
		}

		if (
			new_object['legality:for_male'] === 'legal_for_males'
			&& new_object['legality:for_female'] === 'legal_for_females'
		) {
			new_object['legality:by_gender'] = 'legal_for_all'
		} else if (new_object['legality:for_male'] === 'legal_for_males') {
			new_object['legality:by_gender'] = 'legal_for_males'
		} else if (new_object['legality:for_female'] === 'legal_for_females') {
			new_object['legality:by_gender'] = 'legal_for_females'
		} else {
			new_object['legality:by_gender'] = 'illegal_for_all'
		}

		delete new_object['legality:for_male']
		delete new_object['legality:for_female']

		new_object['penalty:max:years'] = new_object['penalty:max:years'] || -1
		new_object['penalty:max:lifetime'] = new_object['penalty:max:lifetime'] = false
		new_object['penalty:max:death'] = new_object['penalty:max:death'] || false

		for (const key of Object.keys(new_object)) {
			if (keys_in_namespaces[key]) {
				new_object[keys_in_namespaces[key]+':'+key] = new_object[key]
				delete new_object[key]
			}
		}

		data_by_country[alpha3code] = new_object
	}

	return data_by_country
}

function build_2016(){

	const last_values = {}

	const country_key = 'alpha3code'

	const key_synonyms = {
		// 'Continent': '',
		// 'Continent': '',
		'Country': 'alpha3code',
		'Legal All genders': 'legality',
		// 'Age of consent Equal': '',
		// 'Age of consent Unequal': '',
		'Illegal Male': 'legality:for_male',
		'Illegal Female': 'legality:for_female',
		// 'Penalising text Sexual act': '',
		// 'Penalising text Sodomy': '',
		// 'Penalising text Against nature': '',
		// 'Penalising text Buggery': '',
		// 'Penalising text Indecency/other': '',
		// 'Promotion/Morality Penal code': '',
		// 'Promotion/Morality Sharia codes': '',
		'Ma.x Sentences (M)onths and (Y)ears 1 M - 2 Y': 'penalty:max:2y',
		'Ma.x Sentences (M)onths and (Y)ears 3 Y - 7 Y': 'penalty:max:7y',
		'Ma.x Sentences (M)onths and (Y)ears 8 Y - 14 Y': 'penalty:max:14y',
		'Ma.x Sentences (M)onths and (Y)ears 15-Y - Life': 'penalty:max:lifetime',
		'Ma.x Sentences (M)onths and (Y)ears Death': 'penalty:max:death',
		// 'Arrests, prosecutions, etc Yes': '',
		// 'Arrests, prosecutions, etc No': '',
		// 'Arrests, prosecutions, etc Unknown': '',
		// 'NRHI - SO-inclusive?  Yes': '',
		// 'NRHI - SO-inclusive?  No': '',
		// 'NRHI - SO-inclusive?  Unclear': '',
		// 'NRHI - SO-inclusive?  None': '',
		'Discrimination protection Employ-ment': 'employment',
		'Discrimination protection Const-itution': 'constitutional',
		'Discrimination protection Other': 'broad_protections',
		'Discrimination protection Hate Crime': 'hate_crime',
		'Discrimination protection Incite-menrt': 'incitement',
		'Relationship recognition Marriage': 'marriage',
		'Relationship recognition Civil recognition': 'civil_unions',
		'Relationship recognition Minimal CP': '',
		'Relationship recognition Joint adoption': 'joint_adoption',
		'Relationship recognition 2nd parent adoption': 'second_parent_adoption',
	}

	const yes_no_keys = [
		'legality',
		'constitutional',
		'broad_protections',
		'employment',
		'hate_crime',
		'incitement',
		'ct_ban',
		'marriage',
		'civil_unions',
		'joint_adoption',
		'second_parent_adoption',
	]

	let data = fs.readFileSync('./ILGA-datasets/csv/2016.csv', 'utf-8')
	.replace(/\r/g, '')
	.split('\n')
	.map(row => {
		const items = row.split(';')
		let key = items.slice(0, 2).map((item,index) => {
			if (item !== '') {
				last_values[index] = item
			}
			return last_values[index] || item
		}).join(' ').trim()

		key = key_synonyms[key] || null

		if (key !== null) {
			let last = items.slice(3, -1).map((value,index) => {
				if (key === country_key) {
					return getCountryCode(value)
				}else if (key === 'legality:for_male') {
					if (value !== '') {
						return 'illegal_for_males'
					} else {
						return 'legal_for_males'
					}
				}else if (key === 'legality:for_female') {
					if (value !== '') {
						return 'illegal_for_females'
					} else {
						return 'legal_for_females'
					}
				}else if (key === 'penalty:max:2y') {
					return {k:'penalty:max:years',v:2}
				}else if (key === 'penalty:max:7y') {
					return {k:'penalty:max:years',v:7}
				}else if (key === 'penalty:max:14y') {
					return {k:'penalty:max:years',v:14}
				}else if (key === 'penalty:max:lifetime') {
					if (value === '') {
						return false
					} else {
						return true
					}
				}else if (key === 'penalty:max:death') {
					if (value === '') {
						return false
					} else {
						return true
					}
				} else if (yes_no_keys.includes(key)) {
					if (value !== '') {
						return true
					} else {
						return false
					}
				}
	
				return null
			})

			return {[key]: last}
		}

		return null
	})
	.filter(v=>!!v)
	.reduce((obj,value)=>({
		...obj,
		...value,
	}), {})

	
	const data_by_country = {}
	for (let [index, alpha3code] of data[country_key].entries()) {
		const new_object = {}

		const keys = Object.keys(data)
		for (const key of keys) {
			if (key !== country_key) {
				const value = data[key][index]
				if (value !== null) {
					if (
						typeof value === 'object'
						&& value.k
						&& value.v !== null
					) {
						new_object[value.k] = value.v
					}else{
						new_object[key] = value
					}
				}
			}
		}

		if (
			new_object['legality:for_male'] === 'legal_for_males'
			&& new_object['legality:for_female'] === 'legal_for_females'
		) {
			new_object['legality:by_gender'] = 'legal_for_all'
		} else if (new_object['legality:for_male'] === 'legal_for_males') {
			new_object['legality:by_gender'] = 'legal_for_males'
		} else if (new_object['legality:for_female'] === 'legal_for_females') {
			new_object['legality:by_gender'] = 'legal_for_females'
		} else {
			new_object['legality:by_gender'] = 'illegal_for_all'
		}

		delete new_object['legality:for_male']
		delete new_object['legality:for_female']

		new_object['penalty:max:years'] = new_object['penalty:max:years'] || -1
		new_object['penalty:max:lifetime'] = new_object['penalty:max:lifetime'] = false
		new_object['penalty:max:death'] = new_object['penalty:max:death'] || false

		for (const key of Object.keys(new_object)) {
			if (keys_in_namespaces[key]) {
				new_object[keys_in_namespaces[key]+':'+key] = new_object[key]
				delete new_object[key]
			}
		}

		data_by_country[alpha3code] = new_object
	}

	return data_by_country
}





const distPath = './dist/'
if (!fs.existsSync(distPath)){
	fs.mkdirSync(distPath)
}

fs.writeFileSync(distPath+'ilga_2019.json', JSON.stringify(build_2019()))
fs.writeFileSync(distPath+'ilga_2017.json', JSON.stringify(build_2017()))
fs.writeFileSync(distPath+'ilga_2016.json', JSON.stringify(build_2016()))




