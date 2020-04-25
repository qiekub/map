import React from 'react'

import { withLocalization } from '../Localized/'

import {navigate} from '@reach/router'
import {
	loadMarkers as query_loadMarkers,
} from '../../queries.js'

import './index.css'
// import '../../conic-gradient-polyfill.js'

// import categories from '../../data/dist/categories.json'
import presets from '../../data/dist/presets.json'
import colors from '../../data/dist/colors.json'
import colorsByPreset from '../../data/dist/colorsByPreset.json'
import { getPreset, getColorByPreset, getWantedTagsList } from '../../functions.js'

import { withGlobals } from '../Globals/'

// import {} from '@material-ui/core'
import { withTheme } from '@material-ui/core/styles'

import { Map, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import './leaflet/leaflet.css'

import {PruneCluster, PruneClusterForLeaflet} from './PruneCluster_dist/PruneCluster.js'

PruneCluster.Cluster.ENABLE_MARKERS_LIST = true

class MainMap extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			docs: [],
			bounds: null,
			isGeoChooser: false,
			middleMarkerDoc: undefined,
		}

		this.filters = null

		// this.MarkerLayerRef = React.createRef()
		this.map = null
		this.markers = []

		this.gotMapRef = this.gotMapRef.bind(this)

		this.createPruneCluster = this.createPruneCluster.bind(this)
		this.addMarkersToPruneCluster = this.addMarkersToPruneCluster.bind(this)
		this.filterMarkers = this.filterMarkers.bind(this)
		this.showAllMarkers = this.showAllMarkers.bind(this)

		this.setMapPos = this.setMapPos.bind(this)
		this.viewportChanged = this.viewportChanged.bind(this)
	}

	componentDidMount(){
		this.loadMarkers()

		if (this.props.onFunctions) {
			const functions = {
				setZoom: (...attr) => this.map.setZoom(...attr),
				getZoom: () => this.map.getZoom(),
				getCenter: () => this.map.getCenter(),
				getBounds: () => this.map.getBounds(),
				zoomIn: () => this.map.zoomIn(),
				flyToBounds: (...attr) => this.map.flyToBounds(...attr),
				setView: (...attr) => this.map.setView(...attr),
				panBy: (...attr) => this.map.panBy(...attr),
				panTo: (...attr) => this.map.panTo(...attr),
				flyTo: (...attr) => this.map.flyTo(...attr),
				invalidateSize: (...attr) => this.map.invalidateSize(...attr),
				project: (...attr) => this.map.project(...attr),
				unproject: (...attr) => this.map.unproject(...attr),
				latLngToContainerPoint: (...attr) => this.map.latLngToContainerPoint(...attr),

				useAsGeoChooser: (...attr) => this.useAsGeoChooser(...attr),
			}
			this.props.globals.mainMapFunctions = functions
			this.props.onFunctions(functions)
		}

		window.addEventListener('updateMainMapView', this.setMapPos)
	}
	componentDidUpdate(){
		if (this.props.filters !== this.filters) {
			this.filters = this.props.filters
			this.filterMarkers(this.filters)
		}
	}
	componentWillUnmount(){
		window.removeEventListener('updateMainMapView', this.setMapPos)
	}

	setMapPos(event){
		this.setState({center:this.props.globals.map_center})
	}

	useAsGeoChooser(yesOrNo, middleMarkerDoc){
		if (yesOrNo) {
			this.setState({
				isGeoChooser: true,
				middleMarkerDoc,
			})
			this.hideAllMarkers()
		}else{
			this.setState({
				isGeoChooser: false,
				middleMarkerDoc: undefined,
			})
			this.filterMarkers(this.filters)
		}
	}

	loadMarkers(){
		this.props.globals.graphql.query({
			query: query_loadMarkers,
			variables: {
				languages: navigator.languages,
				wantedTags: ['min_age','max_age',...getWantedTagsList(presets)], // this gets us about 11% reduction in size
			},
		}).then(result => {
			const docs = result.data.getMarkers.map(doc=>{
				doc.___preset = getPreset(doc.tags || {}, presets)
				doc.___color = getColorByPreset(doc.___preset.key,colorsByPreset) || colors.default
				return doc
			})

			this.docs = docs
			this.addMarkersToPruneCluster(docs)

			// 1756241 100%
			// 1556529  80%
			//  679779  40%
			//   69580   4%

		}).catch(error=>{
			console.error(error)
		})
	}

	gotMapRef(Map){
		this.mapRef = Map
		this.map = Map.leafletElement

		this.createPruneCluster()
	}

	getConicGradient(values){
		let stops = []

		const gapColor = 'transparent' // this.props.theme.palette.type === 'dark' ? '#181818' : 'white'

		if (values.length === 1) {
			stops = [values[0][0]+' 0']
		}else{
			let counter = 0
			let currentPos = 0
			for (const pair of values) {
				currentPos += 5
				if (counter === 0) {
					stops.push(gapColor+' '+currentPos+'deg')
				}else{
					stops.push(gapColor+' 0 '+currentPos+'deg')
				}
	
				if (counter === values.length-1) {
					stops.push(pair[0]+' 0')
				}else{
					currentPos += Math.ceil(pair[1]*360)
					stops.push(pair[0]+' 0 '+currentPos+'deg')
				}

				counter += 1
			}
		}
		stops = stops.join(', ')

		var gradient = new window.ConicGradient({
		    stops: stops, // "gold 40%, #f06 0", // required
		    repeating: false, // Default: false
		    size: 100, // Default: Math.max(innerWidth, innerHeight)
		})

		return gradient
	}

	createPruneCluster(){
		this.clusterGroup = new PruneClusterForLeaflet()
		this.clusterGroup.Cluster.Size = 120

		this.clusterGroup.BuildLeafletCluster = (cluster, position)=>{
			const marker = new L.Marker(position, {
				icon: this.clusterGroup.BuildLeafletClusterIcon(cluster),
			})
		
			marker.on('click', ()=>{
				// Compute the cluster bounds (it's slow : O(n))
				const markersArea = this.clusterGroup.Cluster.FindMarkersInArea(cluster.bounds)
				const clusterBounds = this.clusterGroup.Cluster.ComputeBounds(markersArea)
		
				if (clusterBounds) {
					const corner1 = new L.LatLng(clusterBounds.minLat, clusterBounds.maxLng)
					const corner2 = new L.LatLng(clusterBounds.maxLat, clusterBounds.minLng)
					const bounds = new L.LatLngBounds(corner1, corner2)
					const distance = corner1.distanceTo(corner2)
		
					const zoomLevelBefore = this.clusterGroup._map.getZoom()
					const zoomLevelAfter = this.clusterGroup._map.getBoundsZoom(bounds, false, new L.Point(20, 20, null))
		
					// If the zoom level doesn't change
					if (
						distance < 3 // if distance is less than 3 meters
						|| zoomLevelAfter === zoomLevelBefore // or if the zoom level would't change
					) {
						// Send an event for the LeafletSpiderfier
						this.clusterGroup._map.fire('overlappingmarkers', {
							cluster: this.clusterGroup,
							markers: markersArea,
							center: marker.getLatLng(),
							marker: marker,
						})
		
						// this.clusterGroup._map.flyTo(position, zoomLevelAfter, {
						// 	animate: true,
						// 	duration: 0.75,
						// 	paddingTopLeft: [(this.props.sidebarIsOpen ? 400 : 0), 64],
						// 	paddingbottomRight: [0, 0]
						// })
					}else{
						this.clusterGroup._map.flyToBounds(bounds, {
							animate: true,
							duration: 0.75,
							paddingTopLeft: [(this.props.sidebarIsOpen ? 400 : 0), 64],
							paddingbottomRight: [0, 0]
						})
					}
				}
			})
		
			return marker
		}

		this.clusterGroup.PrepareLeafletMarker = (leafletMarker, doc)=>{
			leafletMarker.setIcon(L.divIcon({
				html: `
					<div class="wrapper material-icons-round" style="--bg-color:${doc.___color.bg};--fg-color:${doc.___color.fg};">${doc.___preset.icon ? doc.___preset.icon.toLowerCase() : ''}</div>
				`,
				className: 'marker-custom-icon',
				iconSize: L.point(40, 40, true),
			}))
			
			if (!!doc.name && doc.name.length > 0) {
				leafletMarker.bindTooltip(doc.name[0].text, {
					sticky: true,
					interactive: false,
					opacity: 1,
					permanent: false,
				})
			}
		
			leafletMarker.on('click', () => navigate(`/view/${doc._id}/`) )
		}

		this.clusterGroup.BuildLeafletClusterIcon = cluster=>{
			const colors = Object.entries(cluster.GetClusterMarkers()
				.filter(m=>!!m.data.___color.key && m.data.___color.key !== 'white')
				.map(m=>m.data.___color.bg)
				.reduce((obj,preset_key)=>{
					if (!(!!obj[preset_key])) {
						obj[preset_key] = 0
					}
					obj[preset_key] += 1
					return obj
				},{})
			).sort((a,b)=>a[1]-b[1])
	
			const colors_sum = colors.reduce((sum,pair) => sum+pair[1], 0)
	
			const gradient = this.getConicGradient(colors.map(pair=>{
				return [pair[0] , pair[1]/colors_sum]
			}))
	
			return L.divIcon({
				html: `
					<div class="number">${cluster.population}</div>
					<div class="pieChart" style="background-image:url(${gradient.dataURL});"></div>
				`,
				className: 'marker-cluster-custom-icon',
				iconSize: L.point(48, 48, true),
			})
		}		

		this.map.addLayer(this.clusterGroup)
	}
	addMarkersToPruneCluster(docs){
		this.markers = []
		this.clusterGroup.RemoveMarkers()

		for (const doc of docs) {
			let marker = new PruneCluster.Marker(doc.lat, doc.lng, doc)
			marker.filtered = true
			this.markers.push(marker)
			this.clusterGroup.RegisterMarker(marker)
		}

		this.clusterGroup.ProcessView()
		this.map.invalidateSize(false)

		this.filterMarkers(this.filters)
	}

	hideAllMarkers(){
		const markers_length = this.markers.length
		for (let i = markers_length - 1; i >= 0; i--) {
			this.markers[i].filtered = true
		}
		this.clusterGroup.ProcessView()
	}
	showAllMarkers(){
		const markers_length = this.markers.length
		for (let i = markers_length - 1; i >= 0; i--) {
			this.markers[i].filtered = false
		}
		this.clusterGroup.ProcessView()
	}
	filterMarkers(filters){
		if (this.state.isGeoChooser) {
			this.hideAllMarkers()
		} else if (!!this.filters) {
			const presets = this.filters.presets || []
			// const presets = ['amenity/community_centre']
			const presets_length = presets.length

			const selectedAge = this.filters.selectedAge
			const ageOption = this.filters.ageOption

			if (presets_length > 0 || !!selectedAge) {
				const markers_length = this.markers.length
				for (let i = markers_length - 1; i >= 0; i--) {
					const marker = this.markers[i]

					let isInPresets = true
					if (presets_length > 0) {
						isInPresets = presets.map(preset_key=>{
							return marker.data.___preset.key.startsWith(preset_key)
						}).reduce((bool,value) => (value ? true : bool), false)
					}

					let isInAgeRange = true
					if (!!selectedAge) {
						isInAgeRange = false
						if (ageOption!=='open_end' && !!marker.data.tags.min_age && !!marker.data.tags.max_age) {
							const parsedMin = Number.parseFloat(marker.data.tags.min_age)
							const parsedMax = Number.parseFloat(marker.data.tags.max_age)
							isInAgeRange = (
								   (!Number.isNaN(parsedMin) && parsedMin <= selectedAge)
								&& (!Number.isNaN(parsedMax) && parsedMax >= selectedAge)
							)
						}else{
							if (!!marker.data.tags.min_age) {
								const parsedMin = Number.parseFloat(marker.data.tags.min_age)
								isInAgeRange = (!Number.isNaN(parsedMin) && parsedMin <= selectedAge)
							}
							if (isInAgeRange && !!marker.data.tags.max_age) {
								const parsedMax = Number.parseFloat(marker.data.tags.max_age)
								isInAgeRange = (!Number.isNaN(parsedMax) && parsedMax >= selectedAge)
							}
						}
					}

					this.markers[i].filtered = !(isInPresets && isInAgeRange)
				}
				this.clusterGroup.ProcessView()
			}else{
				this.showAllMarkers()
			}
		}else{
			this.showAllMarkers()
		}
	}

	// getMaxClusterRadius(zoomLevel){
	// 	if (zoomLevel<5) {
	// 		return 80
	// 	} else if (zoomLevel<6) {
	// 		return 120
	// 	}  else if (zoomLevel<9) {
	// 		return 100
	// 	} else if (zoomLevel<11) {
	// 		return 80
	// 	} else if (zoomLevel<16) {
	// 		return 60
	// 	} else if (zoomLevel<22) {
	// 		return 20
	// 	}
	//
	// 	return 80
	// }

	viewportChanged(viewport){
		if (this.props.sidebarIsOpen) { // TODO this.props.sidebarIsOpen isn't enough on small screens
			this.props.globals.map_center = Object.values( this.map.unproject(this.map.project(viewport.center).add([200,0])) ) // map center with sidebar offset
		}else{
			this.props.globals.map_center = viewport.center
		}

		this.props.globals.map_zoom = viewport.zoom
		window.dispatchEvent(new Event('mapViewportUpdated'))
	}

	render() {
		// <ZoomControl position="bottomright" />

		return (<div className={`${this.props.className} ${this.props.mapIsResizing ? 'mapIsResizing' : ''} ${this.props.sidebarIsOpen ? 'sidebarIsOpen' : ''}`}>						
			<div className={`markerInTheMiddel rainbow ${this.state.isGeoChooser ? 'visible' : 'hidden'}`}>
				<div className="leaflet-marker-icon marker-custom-icon">
					{
						!!this.state.middleMarkerDoc &&
						!!this.state.middleMarkerDoc.___color &&
						!!this.state.middleMarkerDoc.___color.bg &&
						!!this.state.middleMarkerDoc.___color.fg &&
						!!this.state.middleMarkerDoc.___preset
						? <div className="wrapper material-icons-round" style={{'--bg-color':this.state.middleMarkerDoc.___color.bg,'--fg-color':this.state.middleMarkerDoc.___color.fg}}>{this.state.middleMarkerDoc.___preset.icon ? this.state.middleMarkerDoc.___preset.icon.toLowerCase() : 'not_listed_location'}</div>
						: <div className="wrapper material-icons-round">not_listed_location</div>
					}
				</div>
			</div>

			<Map
				ref={this.gotMapRef}
				className="map"

				onViewportChanged={this.viewportChanged}

				preferCanvas={true}
				useFlyTo={true}
				bounds={this.state.bounds}
				center={[51,10]}
				minZoom={2}
				zoom={3}
				maxZoom={22}
				zoomSnap={1}
				zoomControl={false}

				fadeAnimation={false}

				worldCopyJump={true}
				maxBoundsViscosity={1.0}

				maxBounds={[[-180,99999],[180,-99999]]}

				style={{
					backgroundColor: (
						this.props.theme.palette.type === 'dark'
						? this.props.theme.palette.background.default
						: '#ebe7e1'
					)
				}}
			>
				{
					this.props.theme.palette.type === 'light'
					? (
						<TileLayer
							key="tilelayer_international_lables_light"
							detectRetina={false}
							tileSize={512}
							zoomOffset={-1}
							attribution={`
								<a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noreferrer">© Mapbox</a>
								<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>
								| <a href="https://www.mapbox.com/map-feedback/" target="_blank" rel="noreferrer">Improve this map</a>
							`}
							url="https://api.mapbox.com/styles/v1/qiekub/ck8aum3p70aa51in4ikxao8ii/tiles/512/{z}/{x}/{y}{r}?access_token=pk.eyJ1IjoicWlla3ViIiwiYSI6ImNrOGF1ZGlpdzA1dDgzamx2ajNua3picmMifQ.OYr_o4fX7vPTvZCWZsUs4g"
						/>
					)
					: (
						<TileLayer
							key="tilelayer_international_lables_dark"
							detectRetina={false}
							tileSize={512}
							zoomOffset={-1}
							attribution={`
								<a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noreferrer">© Mapbox</a>
								<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>
								| <a href="https://www.mapbox.com/map-feedback/" target="_blank" rel="noreferrer">Improve this map</a>
							`}
							url="https://api.mapbox.com/styles/v1/qiekub/ck8ozalln0c1g1iog1mpl8aps/tiles/512/{z}/{x}/{y}{r}?access_token=pk.eyJ1IjoicWlla3ViIiwiYSI6ImNrOGF1ZGlpdzA1dDgzamx2ajNua3picmMifQ.OYr_o4fX7vPTvZCWZsUs4g"
						/>
					)
				}
		
				{/*<TileLayer
					key="tilelayer_english_labels"
					detectRetina={false}
					attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noreferrer">&copy; MapBox</a> <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">&copy; OpenStreetMap contributors</a>'
					url={"https://api.mapbox.com/styles/v1/petacat/ck7h7qgtg4c4b1ikiifin5it7/tiles/256/{z}/{x}/{y}{r}?access_token=pk.eyJ1IjoicGV0YWNhdCIsImEiOiJjaWl0MGpqOHEwM2VhdTZrbmhsNG96MjFrIn0.Uhlmj9xPIaPK_3fLUm4nIw"}
				/>*/}
				{/*<TileLayer
					key="tilelayer_stamen_watercolor"
					maxZoom={19}
					detectRetina={window.devicePixelRatio > 1}
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
					url="https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png"
				/>*/}
				{/*<TileLayer
					key="tilelayer_openstreetmap"
					maxZoom={19}
					detectRetina={window.devicePixelRatio > 1}
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>*/}
				{/*<TileLayer
					key="tilelayer_CartoDB_Voyager"
					maxZoom={19}
					subdomains="abcd"
					detectRetina={false}
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
					url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
				/>*/}
			</Map>
		</div>)
	}
}

export default withGlobals(withLocalization(withTheme(MainMap)))
