import React from 'react'
// import './index.css'


import {
	Typography,
} from '@material-ui/core'
// import {
// 	AddRounded as AddIcon,
// } from '@material-ui/icons'

export default class GeoInput extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			map_center: window.map_center || [0,0],
		}

		this.setGeoPos = this.setGeoPos.bind(this)
	}

	componentDidMount(){
		window.addEventListener('mapViewportUpdated', this.setGeoPos)
		window.dispatchEvent(new Event('showGeoChooser'))
	}
	componentWillUnmount(){
		window.removeEventListener('mapViewportUpdated', this.setGeoPos)
		setTimeout(()=>{
			window.dispatchEvent(new Event('hideGeoChooser'))
		}, 1)
	}

	setGeoPos(event){
		this.setState({map_center: window.map_center})

		if (this.props.onChange) {
			this.props.onChange({
				lat: window.map_center[0],
				lng: window.map_center[1],
			})
		}
	}

	render() {
		return <Typography variant="body1" {...this.props}>{this.state.map_center.join(', ')}</Typography>
	}
}


/*

- klick "add a place"
- hide all icon and all UI
- add a new icon in the middle of the screen (it stays in the middle even when the map is moved)
- the icon should be an input field for lat+lng
- add a submit-button and a heading "Where is the place located?"

*/