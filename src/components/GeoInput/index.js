import React from 'react'
// import './index.css'


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
			map_center: window.map_center || [0,0],
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
		this.setState({map_center: window.map_center})

		if (this.props.onChange) {
			this.props.onChange({
				lat: window.map_center[0],
				lng: window.map_center[1],
			})
		}
	}

	render() {
		const pos = this.state.map_center.map(number => Number.parseFloat(number.toFixed(6)))
		
		return (<div {...this.props}>
			<Typography variant="body1" gutterBottom>
				<Localized id="instructions" />
			</Typography>
			<Typography variant="body1" style={{opacity:0.6}}>
				<Localized id="lat" vars={{lat:pos[0]+''}} />
			</Typography>
			<Typography variant="body1" style={{opacity:0.6}}>
				<Localized id="lng" vars={{lng:pos[1]+''}} />
			</Typography>
		</div>)
	}
}


/*

- klick "add a place"
- hide all icon and all UI
- add a new icon in the middle of the screen (it stays in the middle even when the map is moved)
- the icon should be an input field for lat+lng
- add a submit-button and a heading "Where is the place located?"

*/