const fs = require('fs')

let id_address_formats = require('./iD/data/address_formats.json')
id_address_formats = id_address_formats.map(item => {
	delete item.dropdowns
	return {
		...item,
		countryCodes: (item.countryCodes || []).map(item => item.toUpperCase()),
		// keys: [].concat(...item.format),
	}
})

id_address_formats.push({
	countryCodes: ['_ALL_FIELDS_'],
	format: [
		['housename'],
		['street', 'housenumber'],
		['postcode', 'city'],

		['hamlet'],
		['suburb'],
		['subdistrict'],
		['district'],
		['province'],
		['state'],

		['quarter'],
		['neighbourhood'],
		// ['place'],

		// ['door'],
		['unit'],
		// ['flats'],
		['floor'],
		['block_number'], // ['block'],
		// ['conscriptionnumber'],
	],
	width: null
})

const distPath = './dist/'
if (!fs.existsSync(distPath)){
	fs.mkdirSync(distPath)
}

fs.writeFileSync(distPath+'address_formats.json', JSON.stringify(id_address_formats))


