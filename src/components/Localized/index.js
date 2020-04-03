import React from 'react'
import { Localized as LocalizedOriginal } from '@fluent/react'

const Localized = props => (<LocalizedOriginal {...props}>
	<React.Fragment>{props.children}</React.Fragment>
</LocalizedOriginal>)

export default Localized