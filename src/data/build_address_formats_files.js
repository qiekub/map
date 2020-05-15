const fs = require('fs')

let id_address_formats = require('./iD/data/address_formats.json')
id_address_formats = id_address_formats.map(item => ({
	...item,
	countryCodes: (item.countryCodes || []).map(item => item.toUpperCase()),
	// keys: [].concat(...item.format),
}))

const distPath = './dist/'
if (!fs.existsSync(distPath)){
	fs.mkdirSync(distPath)
}

fs.writeFileSync(distPath+'address_formats.json', JSON.stringify(id_address_formats))


