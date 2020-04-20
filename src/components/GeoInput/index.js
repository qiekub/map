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

export default class GeoInput extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			map_center: window.map_center || {lng:NaN,lat:NaN},
			isLegal: true,
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
		// reset map viewport to original state
		if (
			this.initialMapViewport &&
			this.initialMapViewport.center &&
			this.initialMapViewport.zoom
		) {
			window.mainMapFunctions.flyTo(this.initialMapViewport.center, this.initialMapViewport.zoom, {
				duration: window.transitionDuration * 0.001
			})
		}

		window.removeEventListener('mapViewportUpdated', this.setStateGeoPos)
		setTimeout(()=>{
			window.mainMapFunctions.useAsGeoChooser(false, undefined)
		}, 1)
	}

	checkIfLegal(callback){
		window.graphql.query({
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

			const currentCenter = window.mainMapFunctions.getCenter()
			const currentZoom = window.mainMapFunctions.getZoom()

			this.initialMapViewport = {
				center: currentCenter,
				zoom: currentZoom,
			}

		
			let markerPos = {
				lng: marker.center.lng, 
				lat: marker.center.lat,
			}

			let newZoom = currentZoom > 18 ? currentZoom : 18
			if (markerPos.lat === 0 && markerPos.lng === 0) {
				newZoom = 3
				markerPos = {
					lng: -35, 
					lat: 40,
				}
			}


			if (window.sidebarIsOpen) { // TODO window.sidebarIsOpen isn't enough on small screens
				markerPos = window.mainMapFunctions.unproject(window.mainMapFunctions.project(markerPos, newZoom).add([-200,0]), newZoom) // map center with sidebar offset
			}
			window.mainMapFunctions.flyTo(markerPos, newZoom, {
				duration: window.transitionDuration * 0.001,
			})
			setTimeout(()=>{
				window.mainMapFunctions.useAsGeoChooser(true, this.props.doc)
			}, window.transitionDuration)
		}
	}

	setStateGeoPos(event){
		const map_center = window.map_center.map(number => Number.parseFloat(number.toFixed(6))) // WHY: https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude

		const lng = map_center[1]
		const lat = map_center[0]

		this.setState({
			map_center: {
				lng,
				lat,
			}
		}, ()=>{
			this.checkIfLegal(isLegal => {
				this.setState({isLegal})
				// if (this.props.onChange) {
				// 	if (isLegal) {
				// 		this.props.onChange({
				// 			lng,
				// 			lat,
				// 		})
				// 	}else{
				// 		this.props.onChange({
				// 			lng: NaN,
				// 			lat: NaN,
				// 		})
				// 	}
				// }
			})
		})

		if (this.props.onChange) {
			this.props.onChange({
				lng,
				lat,
			})
		}
	}

	render() {
		const map_center = this.state.map_center
		
		return (<div style={this.props.style}>
			<Typography variant="body2" gutterBottom>
				<Localized id="instructions" />
			</Typography>
			<Typography variant="body2" style={{opacity:0.6}}>
				<Localized id="lat" vars={{ lat: (map_center.lat+'' || '') }} />
			</Typography>
			<Typography variant="body2" style={{opacity:0.6}}>
				<Localized id="lng" vars={{ lng: (map_center.lng+'' || '') }} />
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

// You can't use this position as it's illegal to be queer there. (Or we aren't sure.)

/*

- klick "add a place"
- hide all icon and all UI
- add a new icon in the middle of the screen (it stays in the middle even when the map is moved)
- the icon should be an input field for lat+lng
- add a submit-button and a heading "Where is the place located?"

*/