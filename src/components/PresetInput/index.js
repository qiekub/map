import React from 'react'
// import './index.css'

import {
	Typography,
} from '@material-ui/core'
// import {
// 	AddRounded as AddIcon,
// } from '@material-ui/icons'

import { Localized/*, withLocalization*/ } from '../Localized/'

export default class PresetInput extends React.Component {
	constructor(props) {
		super(props)

		this.presetChanged = this.presetChanged.bind(this)
	}

	presetChanged(event){
		const lng = map_center[1]
		const lat = map_center[0]

		if (this.props.onChange) {
			this.props.onChange({
				lng,
				lat,
			})
		}
	}

	render() {		
		return (<div style={this.props.style}>
			<Typography variant="body2" gutterBottom>
				<Localized id="instructions" />
			</Typography>
			<Typography variant="body2" style={{opacity:0.6}}>
				<Localized id="lat" vars={{ lat: '' }} />
			</Typography>
		</div>)
	}
}
