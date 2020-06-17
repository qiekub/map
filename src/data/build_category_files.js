const fs = require('fs')
const id_presets = require('./iD/data/presets/presets.json')

const supported_langs = ['en','de'] // ,'es','fr'





/*
(  ) Community Centers (Community Centres, Social Facilities)
(  ) Going Out (Bars, Pubs, Nightclubs, …)
(  ) Culture (Museums, Theatres, Historical, Libraries)
(  ) Eating (Cafes, Restaurants)
(  ) Tourism (Hotels, …)
*/

const categories = [
	// This is not used in the backend. It's here as a reference for the frontend. Copy it to where it's needed.
	{
		name: {
			en: 'Community Centers',
			de: 'Gemeinde Zentren',
		},
		presets: [
			'amenity/community_centre',
			'amenity/social_centre',
			'amenity/social_facility',
		],
		color: {
			key: 'purple',
			prideFlageMeaning: 'Spirit',
			prideFlageColorName: 'Violet',
			// bg: '#4A148C', // 900
			bg: '#6A1B9A', // 800
			// bg: '#9C27B0', // 500
			fg: 'white',
		},
	},
	{
		name: {
			en: 'Going Out',
		},
		presets: [
			'amenity/bar',
			'amenity/pub',
			'amenity/nightclub',
			'leisure/dance',
			// 'club',
		],
		color: {
			key: 'red',
			prideFlageMeaning: 'Life',
			prideFlageColorName: 'Red',
			// bg: '#B71C1C', // 900
			bg: '#C62828', // 800
			// bg: '#F44336', // 500
			fg: 'white',
		},
	},
	{
		name: {
			en: 'Culture',
			de: 'Kultur',
		},
		presets: [
			'amenity/cinema',
			'tourism/museum',
			'amenity/theatre',
			'amenity/library',
			'amenity/arts_centre',
			'tourism/gallery',
			'historic',
			'tourism/artwork/statue',
			'tourism/attraction',
		],
		color: {
			key: 'cyan',
			prideFlageMeaning: 'Magic/Art',
			prideFlageColorName: 'Turquoise',
			// bg: '#006064', // 900
			bg: '#00695C', // 800
			// bg: '#009688', // 500
			fg: 'white',
		},
	},
	{
		name: {
			en: 'Eating',
			de: 'Essen',
		},
		presets: [
			'amenity/cafe',
			'amenity/restaurant',
			'amenity/ice_cream',
			'amenity/marketplace',
			'amenity/fast_food',
		],
		color: {
			key: 'orange',
			prideFlageMeaning: 'Healing',
			prideFlageColorName: 'Orange',
			bg: '#E65100', // 900
			fg: 'white',
		},
	},
	{
		name: {
			en: 'Fun', // "Fun"
			de: 'Fun',
		},
		presets: [
			'shop/erotic',
			'amenity/swingerclub',
			'leisure/sauna',
			'amenity/brothel',
			'natural/beach/fkk',
			'amenity/cruising_area',
		],
		color: {
			key: 'pink',
			prideFlageMeaning: 'Sex',
			prideFlageColorName: 'Hot pink',
			// bg: '#880E4F', // 900
			bg: '#AD1457', // 800
			// bg: '#E91E63', // 500
			fg: 'white',
		},
	},
	{
		name: {
			en: 'Tourism',
			de: 'Tourismus',
		},
		presets: [
			'building/hotel',

			'tourism/hotel',
			'tourism/hostel',
			'tourism/apartment',
			'tourism/camp_site',
			'tourism/camp_pitch',
			'tourism/caravan_site',

			'tourism/picnic_site',
			'tourism/guest_house',
			'tourism/chalet',
			'tourism/information',
			// 'attraction/train',
			// 'tourism/theme_park',
			'natural/beach',
			'place/neighbourhood',
			'shop/travel_agency',
		],
		color: {
			key: 'indigo',
			prideFlageMeaning: 'Serenity',
			prideFlageColorName: 'Indigo',
			// bg: '#1A237E', // 900
			bg: '#283593', // 800
			// bg: '#3F51B5', // 500
			fg: 'white',
		},
	},
	{
		name: {
			en: 'Organizations',
			de: 'Organisationen',
		},
		presets: [
			'office/ngo',
			'office/association',
			'office',
			// 'shop/books',
			// 'shop/gift',
			// 'shop/video',
			// 'shop/clothes',
			// 'shop/kiosk',
			// 'shop/massage',
			// 'building/commercial',
			// 'amenity/place_of_worship'
		],
		color: {
			key: 'gray',
			prideFlageMeaning: '',
			prideFlageColorName: '',
			bg: '#424242', // 800
			fg: 'white',
		},
	},
]


// 'healthcare',
// 'amenity/dentist',
// 'leisure/fitness_centre/yoga',
// 'leisure/pitch/volleyball',
// 'amenity/place_of_worship/taoist'


const colors = {
	default: {
		prideFlageMeaning: '',
		prideFlageColorName: '',
		// bg: '#263238', // 900 blue-grey
		// bg: '#37474F', // 800 blue-grey
		// bg: '#607D8B', // 500 blue-grey
		// fg: 'white',

		bg: 'white',
		fg: 'black',

		presets: [
			'shop',
			'office',
			'amenity/place_of_worship',
			'address',
		]
	},

	...(
		categories.reduce((obj,category)=>{
			category.color.presets = category.presets
			obj[category.color.key] = category.color
			return obj
		},{})
	),

	// white: {
	// 	prideFlageMeaning: '',
	// 	prideFlageColorName: '',
	// 	bg: 'white', // '#607D8B', // blue-grey
	// 	fg: 'black',
	// 	presets: []
	// },
	// orange: {
	// 	prideFlageMeaning: 'Healing',
	// 	prideFlageColorName: 'Orange',
	// 	// bg: '#E65100', // 900
	// 	bg: '#FF9800', // 500
	// 	fg: 'white',
	// 	presets: [
	// 		'leisure/fitness_centre',
	// 	]
	// },
	// yellow: {
	// 	prideFlageMeaning: 'Sunlight',
	// 	prideFlageColorName: 'Yellow',
	// 	// bg: '#F57F17', // 900
	// 	bg: '#FFEB3B', // 500
	// 	fg: 'black',
	// 	presets: []
	// },
	// green: {
	// 	prideFlageMeaning: 'Nature',
	// 	prideFlageColorName: 'Green',
	// 	// bg: '#1B5E20', // 900
	// 	bg: '#43A047', // 600
	// 	fg: 'white',
	// 	presets: [
	// 		'natural',
	// 	]
	// },
	// indigo: {
	// 	prideFlageMeaning: 'Serenity',
	// 	prideFlageColorName: 'Indigo',
	// 	// bg: '#1A237E', // 900
	// 	bg: '#3F51B5', // 500
	// 	fg: 'white',
	// 	presets: []
	// },
}

const colorsWithKey = Object.entries(colors).reduce((obj,pair) => {
	obj[pair[0]] = {
		key: pair[0],
		...pair[1]
	}
	return obj
}, {})

const colorsByPreset = Object.entries(colorsWithKey).reduce((obj,pair)=>{
	const key = pair[0]
	const color = pair[1]
	for (const preset_key of color.presets) {
		obj[preset_key] = {
			key,
			...color,
		}
	}
	return obj
},{})
const colorsByPreset_sorted = Object.entries(colorsByPreset).sort((a,b)=>b[0].length-a[0].length)

// function getColorByPreset(preset_key){
// 	for (const pair of colorsByPreset_sorted) {
// 		if (preset_key.startsWith(pair[0])) {
// 			return pair[1]
// 			break
// 		}
// 	}
// }

/*
	Colors of the Pride Flag:
	Hot pink 		Sex				shop/yes
	Red 			Life			amenity/community_centre
	Orange 			Healing			healthcare/yes
	Yellow 			Sunlight
	Green 			Nature
	Turquoise 		Magic/Art		tourism/museum | amenity/theatre
	Indigo 			Serenity
	Violet 			Spirit			amenity/place_of_worship
	
	flag-meaning	name		500			what
	----------------------------------------------------
					blue-grey	#607D8B	w	default
	Sex				pink		#E91E63	w	shop/yes
	Life			red			#E53935	w	amenity/bar amenity/pub amenity/nightclub
	Healing			orange		#FF9800	w	healthcare/yes leisure/fitness_centre
	Sunlight		yellow		#FFEB3B	b	amenity/restaurant amenity/cafe
	Nature			green		#4CAF50	b	
	Magic/Art		cyan		#00BCD4	b	tourism/museum amenity/theatre
	Serenity		indigo		#3F51B5	w	
	Spirit			purple		#9C27B0	w	amenity/community_centre amenity/place_of_worship
	// hex-colors are from: https://material.io/design/color/the-color-system.html#tools-for-picking-colors


	// source: https://www.crwflags.com/fotw/flags/qq-rb_h.html
    red: light;
    orange: healing;
    yellow: sun;
    green: calmness;
    blue: art;
    lilac: the spirit;
*/




const iD_locales_path = './iD/dist/locales/'

const files = fs.readdirSync(iD_locales_path)
const translations = {}
for (const filename of files) {
	const lang = filename.split('.')[0]

	if (supported_langs.includes(lang)) {
		const data = require(iD_locales_path+lang+'.json')[lang]
	
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
	'address': {
		icon: 'place',
	},

	'office': {
		icon: 'business_center',
	},

	// amenity/cruising_area
	
	'club': {
		icon: 'local_bar',
	},
	'amenity/bar': {
		icon: 'local_bar',
	},
	'amenity/pub': {
		icon: 'local_bar',
	},
	'amenity/nightclub': {
		icon: 'star',
	},
	'leisure/dance': {
		icon: 'star',
	},
	'amenity/swingerclub': {
		icon: 'toys',
		tags: {
			'amenity': 'swingerclub',
		},
		name: {
			"en": "Swingerclub",
			"de": "Swingerclub",
		},
		terms: {
			"en": "",
			'de': '',
		},
	},
	'amenity/brothel': {
		icon: 'toys',
		tags: {
			'amenity': 'brothel',
		},
		name: {
			"en": "Brothel",
			"de": "Bordel",
		},
		terms: {
			"en": "",
			'de': '',
		},
	},
	'amenity/cruising_area': {
		icon: 'toys',
		tags: {
			'amenity': 'cruising_area',
		},
		name: {
			"en": "Cruising Area",
			"de": "Cruising Gebiet",
		},
		terms: {
			"en": "",
			'de': '',
		},
	},

	'amenity/community_centre': {
		icon: 'people',
		name: {
			"en": "Community Centre",
			"de": "Gemeinschaftszentrum",
		},
	},
	'amenity/social_facility': {
		icon: 'people',
	},
	'amenity/social_centre': {
		icon: 'people',
	},

	'amenity/restaurant': {
		icon: 'restaurant',
	},
	'amenity/fast_food': {
		icon: 'restaurant',
	},
	'amenity/cafe': {
		icon: 'local_cafe',
	},

	'building/commercial': {
		icon: 'storefront',
	},
	'shop': {
		icon: 'storefront',
	},
	'shop/erotic': {
		icon: 'toys',
	},
	// 'shop/erotic/video/lgbtq': {		
	// 	icon: 'toys',
	// 	tags: {
	// 		'shop': 'video',
	// 		'gay': 'yes'
	// 	},
	// 	name: {
	// 		"en": "LGBTQ Video Store",
	// 		"en": "LGBTQ Video Geschäft",
	// 	},
	// 	terms: {
	// 		"en": "",
	// 	},
	// },
	'amenity/ice_cream': {
		icon: 'restaurant',
	},

	'leisure/sauna': {
		icon: 'hot_tub',
	},
	'natural': {
		icon: 'nature',
	},
	'natural/beach': {
		icon: 'beach_access',
	},
	'natural/beach/fkk': {
		icon: 'beach_access',
		tags: {
			'natural': 'beach',
			'nudism': 'permissive',
		},
		name: {
			"en": "Naturist Beach",
			"de": "FKK Strand",
		},
		terms: {
			"en": "",
			'de': '',
		},
	},

	'tourism/museum': {
		icon: 'museum',
	},
	'tourism/gallery': {
		icon: 'museum',
	},
	'amenity/arts_centre': {
		icon: 'museum', // brush | palette | museum
	},
	'tourism/attraction': {
		icon: 'local_see',
	},
	'historic': {
		icon: 'local_see', // local_see | place | museum
	},
	'historic/memorial/statue': {
		icon: 'local_see',
		tags: {
			'historic': 'memorial',
			'memorial': 'statue',
		},
		name: {
			'de': 'Statue',
			'en': 'Statue',
		},
		terms: {
			'de': 'Statue, Standbild',
			'en': 'sculpture, figure, carving',
		},
	},

	'tourism/information': {
		icon: 'info',
	},
	'building/hotel': {
		icon: 'hotel',
	},
	'tourism/hotel': {
		icon: 'hotel',
	},
	'tourism/hostel': {
		icon: 'hotel',
	},
	'tourism/apartment': {
		icon: 'hotel',
	},
	'tourism/guest_house': {
		icon: 'hotel',
	},
	'tourism/chalet': {
		icon: 'hotel',
	},
	'tourism/camp_site': {
		icon: 'outdoor_grill', // 'fireplace',
	},
	'amenity/bbq': {
		icon: 'outdoor_grill',
	},
	'tourism/picnic_site': {
		icon: 'deck',
	},

	'amenity/theatre': {
		icon: 'local_play',
	},
	'amenity/cinema': {
		icon: 'local_movies',
	},

	'amenity/library': {
		icon: 'local_library',
	},
	'healthcare': {
		icon: 'local_hospital', // 'healing',
	},
}
const preset_overwrites_sorted = Object.entries(preset_overwrites).sort((a,b)=>b[0].length-a[0].length)

function get_preset_overwrite(preset_key){
	for (const pair of preset_overwrites_sorted) {
		if (preset_key.startsWith(pair[0])) {
			return pair[1]
			// break
		}
	}
}

/*
	# Material Icons:
	LocalBar
	LocalCafe
	LocalDining
	Restaurant
	School
	Sports
	SportsEsports
	House
	Star
	BeachAccess
	Business
	People
*/

const presets = {}
for (const preset_key in id_presets) {
	const preset = id_presets[preset_key]

	if (
		(
			preset_key.includes('address') ||
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
		const preset_translations = translations[preset_key] || {}
		presets[preset_key] = {
			tags: preset.tags || {},
			// fields: preset.fields || [],
			// moreFields: preset.moreFields || [],

			name: preset_translations.name || {'en':preset.name},
			terms: preset_translations.terms || preset.terms.join(' ') || '',

			...get_preset_overwrite(preset_key),
		}
	}
}

for (const preset_key in preset_overwrites) {
	if (!presets[preset_key] && preset_overwrites[preset_key].tags) {
		const preset_translations = translations[preset_key] || {}
		presets[preset_key] = {
			tags: {},
			name: preset_translations.name || {en:''},
			terms: preset_translations.terms || '',
	
			...presets[preset_key],
			...preset_overwrites[preset_key],
		}
	}
}

presets.default = {
	key: 'default',
	tags_length: 0,
	max_tag_value_length: 0,
	tags: {},
	name: {},
	terms: {},
	icon: '',
}

const presets_sorted = Object.entries(presets)
.filter(pair => !pair[0].endsWith('/lgbtq'))
// Filter out lgbtq specific tags. The frontend should show this information based on "audience:queer". 
// amenity/community_centre/lgbtq
// amenity/nightclub/lgbtq
// amenity/pub/lgbtq
// shop/erotic/lgbtq
// amenity/bar/lgbtq
.map(pair=>{
	return {
    	key: pair[0],
        tags_length: Object.keys(pair[1].tags).length,
		max_tag_value_length: Math.max(...Object.values(pair[1].tags).map(v=>v.length)),
        ...pair[1],
    }
}).sort((a,b)=>b.tags_length-a.tags_length || b.max_tag_value_length-a.max_tag_value_length).reduce((obj,preset)=>{
	obj[preset.key] = preset
	return obj
},{})



const distPath = './dist/'
if (!fs.existsSync(distPath)){
	fs.mkdirSync(distPath)
}

fs.writeFileSync(distPath+'colors.json', JSON.stringify(colorsWithKey))
fs.writeFileSync(distPath+'colorsByPreset.json', JSON.stringify(colorsByPreset_sorted))
fs.writeFileSync(distPath+'presets.json', JSON.stringify(presets_sorted))
fs.writeFileSync(distPath+'categories.json', JSON.stringify(categories))



/*
	
	https://raw.githubusercontent.com/openstreetmap/iD/2.x/data/presets/presets.json
	
	https://taginfo.openstreetmap.org/api/4/tag/wiki_pages?key=amenity&value=community_centre
	
	https://taginfo.openstreetmap.org/api/4/key/values?key=amenity&lang=de&page=1&rp=10&sortname=count_ways&sortorder=desc
	
	Categories for map.qiekub.org
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







