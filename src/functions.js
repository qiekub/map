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

    return presets[Object.keys(presets)[0]]
}

export function getColorByPreset(preset_key,colorsByPreset_sorted){
	for (const pair of colorsByPreset_sorted) {
		if (preset_key.startsWith(pair[0])) {
			return pair[1]
			// break
		}
	}
}