const fs = require('fs')
const id_presets = require('./iD/data/presets/presets.json')

const supported_langs = ['en','de'] // ,'es','fr'


const files = fs.readdirSync('./iD/dist/locales/')
const translations = {}
for (const filename of files) {
	const lang = filename.split('.')[0]

	if (supported_langs.includes(lang)) {
		const data = require('./iD/dist/locales/'+lang+'.json')[lang]
	
		if (data && data.presets && data.presets.presets) {
			const presets = data.presets.presets
	
			for (const preset_key in presets) {
				if (!translations[preset_key]) {
					translations[preset_key] = {}
				}
	
				for (const key in presets[preset_key]) {
					if (!translations[preset_key][key]) {
						translations[preset_key][key] = {}
					}
					translations[preset_key][key][lang] = presets[preset_key][key]
				}
			}
		}
	}
}


const preset_overwrites = {
	'amenity/bar': {
		icon: 'LocalBar',
	},
}

const presets = {}
for (const preset_key in id_presets) {
	const preset = id_presets[preset_key]

	if (
		(
			preset_key.includes('amenity') ||
			preset_key.includes('attraction') ||
			preset_key.includes('club') ||
			preset_key.includes('healthcare') ||
			preset_key.includes('historic') ||
			preset_key.includes('leisure') ||
			preset_key.includes('natural') ||
			preset_key.includes('office') ||
			preset_key.includes('place') ||
			preset_key.includes('shop') ||
			preset_key.includes('tourism')
		) &&
		preset.tags &&
		preset.geometry &&
		!(preset.searchable===false) &&
		preset.geometry.includes('point') &&
		!Object.keys(preset.tags).includes('brand:wikidata')
	) {
		presets[preset_key] = {
			tags: preset.tags,
			// fields: preset.fields || [],
			// moreFields: preset.moreFields || [],

			name: translations[preset_key].name || {'en':preset.name},
			terms: translations[preset_key].terms || preset.terms.join(' ') || '',

			...preset_overwrites[preset_key],
		}
	}
}


const categories = [
	// This is not used in the backend. It's here as a reference for the frontend. Copy it to where it's needed.
	{
		icon: 'Restaurant',
		name: {
			en: 'Food & Drink',
			de: 'Essen & Trinken',
		},
		presets: [
			'amenity/bar',
			// 'amenity/pub',
			'amenity/restaurant',
			'amenity/cafe',
		],
	},
	{
		icon: 'LocalActivity',
		name: {
			en: 'Things to do',
			de: 'Aktivitäten',
		},
		presets: [
			'amenity/nightclub',
			'tourism/museum',
			'amenity/theatre',
			'leisure/fitness_centre',
		],
	},
	{
		icon: 'People',
		name: {
			en: 'Services',
			de: 'Services',
		},
		presets: [
			'amenity/community_centre',
			'healthcare/yes',
			'shop/yes',
			'amenity/place_of_worship',
			// 'tourism/hotel',
		],
	},
	{
		icon: 'More',
		name: {
			en: 'More',
			de: 'Weiteres',
		},
		presets: [],
	},
]

fs.writeFileSync('./dist/presets.json', JSON.stringify(presets))
fs.writeFileSync('./dist/categories.json', JSON.stringify(categories))





/*
	
	https://raw.githubusercontent.com/openstreetmap/iD/2.x/data/presets/presets.json
	
	https://taginfo.openstreetmap.org/api/4/tag/wiki_pages?key=amenity&value=community_centre
	
	https://taginfo.openstreetmap.org/api/4/key/values?key=amenity&lang=de&page=1&rp=10&sortname=count_ways&sortorder=desc
	
	Categories for queer.qiekub.com
		Food & Drink
			Bars					(amenity=bar)
			Restaurants				(amenity=restaurant)
			Cafes					(amenity=cafe)
			// Pubs						(amenity=pub)
		Things to do
			Nightclubs				(amenity=nightclub)
			Museums					(tourism=museum)
			Theatre					(amenity=theatre)
			Gyms					(leisure=fitness_centre)
		Services
			Community Centres		(amenity=community_centre)
			Healthcare Facilities	(healthcare=yes)
			Shops					(shop=yes)
			Places of Worship		(amenity=place_of_worship)
			// Hotels					(tourism=hotel)
		Other type of place
			(search for any type in OSM-iD)
	
	
	Categories on Google Maps
		Food & Drink
			Restaurants
			Bars
			Coffee
			Delivery
			Takeout
		Things to do
			Parks
			Gyms
			Art
			Attractions
			Nightlife
			Live music
			Movies
			Museums
			Libraries
		Services
			Hotels
			ATMs
			Beauty salons
			Car rental
			Car repair
			Car wash
			Dry cleaning
			Electic vehicle charging
			Gas
			Hospitals & clinics
			Mail & shipping
			Parking
			Pharmacies
*/







