const presets = require('./presets.json')


const ui_categories = [
	// This is not used in the backend. It's here as a reference for the frontend. Copy it to where it's needed.
	{
		icon: 'Restaurant',
		name: {
			en: 'Food & Drink',
			de: 'Essen & Trinken',
		},
		presets: ['amenity/bar'],
	},
	{
		icon: 'LocalActivity',
		name: {
			en: 'Things to do',
			de: 'Aktivitäten',
		},
		presets: [],
	},
	{
		icon: 'People',
		name: {
			en: 'Services',
			de: 'Services',
		},
		presets: [],
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

const preset_overwrites = {
	'amenity/bar': {
		icon: 'LocalBar',
		names: {
			en: 'Bar',
			de: 'Bar',
		},
	},
}

for (const preset_key in preset_overwrites) {
	presets[preset_key] = {
		...presets[preset_key],
		...preset_overwrites[preset_key],
	}
}

const filteredPresets = Object.entries(presets).filter(pair=>{
	const preset_key = pair[0]
	return !!preset_overwrites[preset_key]
}).reduce((obj,pair)=>{
	obj[pair[0]] = pair[1]
	return obj
}, {})

console.log(JSON.stringify(filteredPresets,null,4))




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