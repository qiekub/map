import React from 'react'
// import './index.css'

import {
	isGeoCoordinateLegal as query_isGeoCoordinateLegal,
} from '../../queries.js'

import {
	Typography,
} from '@material-ui/core'
// import {
// 	AddRounded as AddIcon,
// } from '@material-ui/icons'

import { Localized/*, withLocalization*/ } from '../Localized/'

import { withGlobals } from '../Globals/'

class GeoInput extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			isLegal: true,
			lng: NaN,
			lat: NaN,
		}

		this.initialMapViewport = undefined
		this.usedMarker = undefined

		this.setStateGeoPos = this.setStateGeoPos.bind(this)
	}

	componentDidMount(){
		window.addEventListener('mapViewportUpdated', this.setStateGeoPos)

		if (this.usedMarker !== this.props.marker) {
			this.markerChanged(this.props.marker)
		}
	}
	componentDidChange(){
		if (this.usedMarker !== this.props.marker) {
			this.markerChanged(this.props.marker)
		}
	}
	componentWillUnmount(){
		window.removeEventListener('mapViewportUpdated', this.setStateGeoPos)
		setTimeout(()=>{
			this.props.globals.mainMapFunctions.useAsGeoChooser(false, undefined)
		}, 1)
	}

	checkIfLegal(callback){
		this.props.globals.graphql.query({
			query: query_isGeoCoordinateLegal,
			variables: {
				lng: this.state.map_center.lng,
				lat: this.state.map_center.lat,
			},
		}).then(result => {
			callback(result && result.data && result.data.isGeoCoordinateLegal)
		}).catch(error=>{
			callback(false)
		})
	}

	markerChanged(marker){
		if (
			marker && 
			marker.center &&
			marker.zoom
		) {
			this.usedMarker = marker

			let lat = marker.center.lat || 0
			let lng = marker.center.lng || 0

			if (lat === 0 && lng === 0) {
				const mapCenter = (this.props.store.get('map_center_fake') || [NaN,NaN])
				.map(number => Number.parseFloat(number.toFixed(6))) // WHY just 6 decimal points: https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude

				lng = mapCenter[1]
				lat = mapCenter[0]
			}

			let markerPos = {lng,lat}
			let newZoom = this.props.store.get('map_zoom') || 3

			if (this.props.globals.sidebarIsOpen) { // TODO this.props.globals.sidebarIsOpen isn't enough on small screens
				markerPos = this.props.globals.mainMapFunctions.unproject(this.props.globals.mainMapFunctions.project(markerPos, newZoom).add([-200,0]), newZoom) // map center with sidebar offset
			}
			this.props.globals.mainMapFunctions.flyTo(markerPos, newZoom, {
				duration: this.props.globals.transitionDuration * 0.001,
			})
			setTimeout(()=>{
				this.props.globals.mainMapFunctions.useAsGeoChooser(true, this.props.doc)
			}, this.props.globals.transitionDuration)
		}
	}

	getGeo(){
		const mapCenter = (this.props.store.get('map_center_fake') || [NaN,NaN])
		.map(number => Number.parseFloat(number.toFixed(6))) // WHY just 6 decimal points: https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude

		const lng = mapCenter[1]
		const lat = mapCenter[0]

		return {lng, lat}
	}

	setStateGeoPos(event){
		const {lng,lat} = this.getGeo()

		this.setState({lng,lat})
	
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
				<Localized id="lat" vars={{ lat: (this.state.lat+'' || '') }} />
			</Typography>
			<Typography variant="body2" style={{opacity:0.6}}>
				<Localized id="lng" vars={{ lng: (this.state.lng+'' || '') }} />
			</Typography>

			{
				!this.state.isLegal
				? (
					<Typography
						key="geoInputErrorMessage_NotLegal"
						variant="body2"
						color="error"
						style={{
							marginTop: '16px'
						}}
					>
						<Localized id="error_message_geo_not_legal" />
					</Typography>
				)
				: undefined
			}
		</div>)
	}
}

export default withGlobals(GeoInput)

// You can't use this position as it's illegal to be queer there. (Or we aren't sure.)

/*

- klick "add a place"
- hide all icon and all UI
- add a new icon in the middle of the screen (it stays in the middle even when the map is moved)
- the icon should be an input field for lat+lng
- add a submit-button and a heading "Where is the place located?"

*/