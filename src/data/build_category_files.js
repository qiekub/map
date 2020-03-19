const fs = require('fs')
const id_presets = require('./iD/data/presets/presets.json')

const supported_langs = ['en','de'] // ,'es','fr'







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

const colors = {
	default: {
		prideFlageMeaning: '',
		prideFlageColorName: '',
		bg: '#263238', // '#607D8B', // blue-grey
		fg: 'white',
		presets: []
	},
	white: {
		prideFlageMeaning: '',
		prideFlageColorName: '',
		bg: 'white', // '#607D8B', // blue-grey
		fg: 'black',
		presets: [
			'office',
			'amenity/place_of_worship',
			'tourism/hotel',
			'tourism/hostel',
			'tourism/apartment',
			'tourism/camp_site',
			'tourism/picnic_site',
			'tourism/guest_house',
			'tourism/information',
		]
	},
	pink: {
		prideFlageMeaning: 'Sex',
		prideFlageColorName: 'Hot pink',
		bg: '#880E4F',
		fg: 'white',
		presets: [
			'shop',
			'shop/erotic',
			'amenity/ice_cream',
		]
	},
	red: {
		prideFlageMeaning: 'Life',
		prideFlageColorName: 'Red',
		bg: '#B71C1C',
		fg: 'white',
		presets: [
			'amenity/bar',
			'amenity/pub',
			'amenity/nightclub',
			'amenity/restaurant',
			'amenity/cafe',
			'leisure/dance',
			'club',
		],
	},
	orange: {
		prideFlageMeaning: 'Healing',
		prideFlageColorName: 'Orange',
		bg: '#E65100',
		fg: 'white',
		presets: [
			'healthcare',
			'leisure/fitness_centre',
			'leisure/sauna',
		]
	},
	yellow: {
		prideFlageMeaning: 'Sunlight',
		prideFlageColorName: 'Yellow',
		bg: '#F57F17',
		fg: 'black',
		presets: []
	},
	green: {
		prideFlageMeaning: 'Nature',
		prideFlageColorName: 'Green',
		bg: '#1B5E20',
		fg: 'white',
		presets: [
			'natural',
		]
	},
	cyan: {
		prideFlageMeaning: 'Magic/Art',
		prideFlageColorName: 'Turquoise',
		bg: '#006064',
		fg: 'white',
		presets: [
			'tourism/museum',
			'amenity/theatre',
			'amenity/library',
			'amenity/arts_centre',
			'tourism/gallery',
			'historic',
		]
	},
	indigo: {
		prideFlageMeaning: 'Serenity',
		prideFlageColorName: 'Indigo',
		bg: '#1A237E',
		fg: 'white',
		presets: []
	},
	purple: {
		prideFlageMeaning: 'Spirit',
		prideFlageColorName: 'Violet',
		bg: '#4A148C',
		fg: 'white',
		presets: [
			'amenity/community_centre',
			'amenity/social_facility',
			'amenity/social_centre',
		]
	},
}
const colorsByPreset = Object.entries(colors).reduce((obj,pair)=>{
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
	'office': {
		icon: 'business_center',
	},
	
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
		icon: 'local_bar', // 'star',
	},
	'leisure/dance': {
		icon: 'local_bar', // 'star',
	},

	'amenity/community_centre': {
		icon: 'people',
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
	'amenity/cafe': {
		icon: 'local_cafe',
	},

	'shop': {
		icon: 'storefront',
	},
	'shop/erotic': {
		icon: 'storefront', // 'toys',
	},
	'amenity/ice_cream': {
		icon: 'storefront',
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

	'tourism/museum': {
		icon: 'museum',
	},
	'tourism/gallery': {
		icon: 'museum',
	},
	'amenity/arts_centre': {
		icon: 'museum',
	},
	'historic': {
		icon: 'museum',
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
	'tourism/camp_site': {
		icon: 'hotel',
	},
	'tourism/picnic_site': {
		icon: 'hotel',
	},
	'tourism/guest_house': {
		icon: 'hotel',
	},

	'amenity/theatre': {
		icon: 'local_play',
	},
	'amenity/cinema': {
		icon: 'local_play',
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

			...get_preset_overwrite(preset_key),
		}
	}
}

const presets_sorted = Object.entries(presets).map(pair=>{
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



fs.writeFileSync('./dist/colors.json', JSON.stringify(colors))
fs.writeFileSync('./dist/colorsByPreset.json', JSON.stringify(colorsByPreset_sorted))
fs.writeFileSync('./dist/presets.json', JSON.stringify(presets_sorted))
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







