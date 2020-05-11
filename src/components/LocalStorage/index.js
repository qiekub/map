import React from 'react'

import store from 'store'

// const storage_functions = {
// 	set: (key, value) => window.localStorage.setItem(key, value),
// 	get: (key) => window.localStorage.getItem(key),
// 	del: (key) => window.localStorage.removeItem(key),
// 	clear: () => window.localStorage.clear(),
// }

function withLocalStorage(Component) {
	return React.forwardRef(function(props, ref){
		return <Component store={store} ref={ref} {...props} />
	})
}

export { withLocalStorage }