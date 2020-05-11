import React from 'react'

import store from 'store'



const default_privacy_level_key = 'essentials'
const privacy_level_keys = {
	essentials: 'privacy_consent_essentials',
	tracking: 'privacy_consent_tracking',
}



const storage_functions = {
	get: (...args) => {
		return store.get(...args)
	},

	set: (key, value, privacy_level_key) => {
		// this is a wrapper to check if the user consented to storing data on their device
		if (!(!!privacy_level_keys[key])) { // prevent overwriting of privacy settings
			if (!(!!privacy_level_key)) {
				privacy_level_key = default_privacy_level_key // use a default if no privacy_level_key is provided
			}

			if (privacy_level_keys[privacy_level_key]) {
				const privacy_level_consent = store.get(privacy_level_keys[privacy_level_key])
				if (privacy_level_consent === true) { // check if the user consented
					store.set(key, value)
				}
			}
		}
	},
	setPrivacy: (privacy_level_key, value) => {
		return new Promise((resolve,reject)=>{
			if (!(!!privacy_level_key)) {
				privacy_level_key = default_privacy_level_key // use a default if no privacy_level_key is provided
			}

			if (privacy_level_keys[privacy_level_key]) {
				store.set(privacy_level_keys[privacy_level_key], !!value) // store as boolean
				resolve()
			} else {
				reject()
			}
		})
	},
	getPrivacy: (privacy_level_key) => {
		if (!(!!privacy_level_key)) {
			privacy_level_key = default_privacy_level_key // use a default if no privacy_level_key is provided
		}

		if (privacy_level_keys[privacy_level_key]) {
			return store.get(privacy_level_keys[privacy_level_key]) === true
		}
		return false
	},
}

function withLocalStorage(Component) {
	return React.forwardRef(function(props, ref){
		return <Component store={storage_functions} ref={ref} {...props} />
	})
}

export { withLocalStorage }