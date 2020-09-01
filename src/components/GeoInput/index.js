import React from 'react'
// import './index.css'

import {
	countrycode as query_countrycode,
} from '../../queries.js'

import {
	Typography,
} from '@material-ui/core'
// import {
// 	AddRounded as AddIcon,
// } from '@material-ui/icons'

import { Localized/*, withLocalization*/ } from '../Localized/'
import { withGlobals } from '../Globals/'
import { withTheme } from '@material-ui/core/styles'
import { getILGA } from '../../functions.js'

import DiscriminationFacts from '../DiscriminationFacts/'

class GeoInput extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			lng: NaN,
			lat: NaN,
			countryCode: null,
			legalityStatusNumber: null,
		}

		this.initialMapViewport = undefined
		this.usedMarker = undefined

		this.setStateGeoPos = this.setStateGeoPos.bind(this)
		this.getStatusColor = this.getStatusColor.bind(this)
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

	getLegalityNumber(alpha3code){
		const ilga = getILGA(alpha3code)
		if (ilga) {
			return ilga.overview.statusNumber
		}

		return null
	}

	setCountryCode(lng, lat){
		this.props.globals.graphql.query({
			query: query_countrycode,
			variables: {
				lng,
				lat,
			},
		}).then(result => {
			if (result && result.data && result.data.countrycode) {
				this.setState({
					countryCode: result.data.countrycode,
					legalityStatusNumber: this.getLegalityNumber(result.data.countrycode),
				})
			}else{
				this.setState({
					countryCode: null,
					legalityStatusNumber: null,
				})
			}
		}).catch(error=>{
			this.setState({
				countryCode: null,
				legalityStatusNumber: null,
			})
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
				({lng, lat} = this.getGeo())
			}

			let markerPos = {lng,lat}
			let newZoom = this.props.store.get('map_zoom') || 3

			if (this.props.globals.mainMapFunctions.getMapType() === 'mapbox') {
				this.props.globals.mainMapFunctions.flyTo({
					center: markerPos,
					zoom: newZoom,
					padding: {
						left: (this.props.globals.sidebarIsOpen ? 400 : 0),
					},
					duration: this.props.globals.transitionDuration,
				})
			}else{
				if (this.props.globals.sidebarIsOpen) { // TODO this.props.globals.sidebarIsOpen isn't enough on small screens
					markerPos = this.props.globals.mainMapFunctions.unproject(this.props.globals.mainMapFunctions.project(markerPos, newZoom).add([-200,0]), newZoom) // map center with sidebar offset
				}
				this.props.globals.mainMapFunctions.flyTo(markerPos, newZoom, {
					duration: this.props.globals.transitionDuration * 0.001,
				})
			}

			setTimeout(()=>{
				this.props.globals.mainMapFunctions.useAsGeoChooser(true, this.props.doc)
			}, this.props.globals.transitionDuration)
		}
	}

	getGeo(storeKey){
		const map_center_fake = this.props.store.get('map_center_fake')

		let lng = 0
		let lat = 0

		if (Array.isArray(map_center_fake)) {
			lng = Number.parseFloat(map_center_fake[0].toFixed(6)) // WHY: just 6 decimal points: https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude
			lat = Number.parseFloat(map_center_fake[1].toFixed(6))
		} else if (!!map_center_fake) {
			lng = Number.parseFloat(map_center_fake.lng.toFixed(6))
			lat = Number.parseFloat(map_center_fake.lat.toFixed(6))
		}

		return {lng, lat}
	}

	setStateGeoPos(event){
		const {lng,lat} = this.getGeo()

		this.setState({lng,lat})
		this.setCountryCode(lng, lat)
	
		if (this.props.onChange) {
			this.props.onChange({
				lng,
				lat,
			})
		}
	}

	getStatusColor(status){
		if (status === 'great' || status === 1) {
			return this.props.theme.palette.success.main
		} else if (status === 'ok' || status === 2) {
			return this.props.theme.palette.warning.main
		} else if (status === 'bad' || status === 3) {
			return this.props.theme.palette.error.main
		}
		return this.props.theme.palette.background.default
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
				this.state.legalityStatusNumber === 3
				? (
					<Typography
						key="geoInputErrorMessage_NotLegal"
						variant="body2"
						style={{
							marginTop: '16px',
							color: this.getStatusColor(this.state.legalityStatusNumber),
						}}
					>
						<Localized id="legality_message_geo_not_legal" />
					</Typography>
				)
				: undefined
			}

			<Typography
				key="geoInputInfoMessage_BeCautious"
				variant="body2"
				style={{
					marginTop: '16px',
				}}
			>
				<Localized id="legality_message_be_cautious" />
			</Typography>

			{
				!!this.state.countryCode
				? (
					<div
						style={{
							display: 'block',
							margin: '16px 0 0',
							background: this.props.theme.palette.background.default,
							borderRadius: '8px',
							// border: '1px solid '+this.props.theme.palette.divider,
							overflow: 'hidden',
						}}
					>
						<DiscriminationFacts
							key={'d_facts_'+this.state.countryCode}
							countryCode={this.state.countryCode}
							toggleable={true}
						/>
					</div>
				)
				: undefined
			}
		</div>)
	}
}

export default withGlobals(withTheme(GeoInput))

// You can't use this position as it's illegal to be queer there. (Or we aren't sure.)

/*

- klick "add a place"
- hide all icon and all UI
- add a new icon in the middle of the screen (it stays in the middle even when the map is moved)
- the icon should be an input field for lat+lng
- add a submit-button and a heading "Where is the place located?"

*/