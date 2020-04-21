export function uuidv4() {
	// source: https://stackoverflow.com/a/2117523/2387277
	// source: https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	)
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


	return {
		"key": "",
		"tags_length": 0,
		"max_tag_value_length": 0,
		"tags": {},
		"name": {},
		"terms": {}
	}
	// return presets[Object.keys(presets)[0]]
}


export function getColorByPreset(preset_key,colorsByPreset_sorted){
	for (const pair of colorsByPreset_sorted) {
		if (preset_key.startsWith(pair[0])) {
			return pair[1]
			// break
		}
	}
}


export function getWantedTagsList(presets){
	return [...new Set([].concat(...Object.values(presets).map(preset=>Object.keys(preset.tags))))]
}