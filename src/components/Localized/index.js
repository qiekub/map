import React from 'react'
import {
	Localized as LocalizedOriginal,
	withLocalization
} from '@fluent/react'

import {
	Typography,
} from '@material-ui/core'

const Localized = props => (
	<LocalizedOriginal
		{...props}
		elems={{
			br: <br />,
			...props.elems,
		}}
	>
		<React.Fragment>{props.children}</React.Fragment>
	</LocalizedOriginal>
)

export {
	withLocalization,
	Localized,
	Localized as default,
}

/*

import { Localized, withLocalization } from '../Localized/'

<Localized id="translation_id" />
export default withLocalization(componentName)


import Localized from '../Localized/'
<Localized id="translation_id" />

import { withLocalization } from '@fluent/react'
export default withLocalization(componentName)

*/