import React from 'react'
import {
	Localized as LocalizedOriginal,
	withLocalization
} from '@fluent/react'

const Localized = props => (<LocalizedOriginal {...props}>
	<React.Fragment>{props.children}</React.Fragment>
</LocalizedOriginal>)

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