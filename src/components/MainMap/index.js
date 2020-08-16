import React from 'react'

import { withLocalization } from '../Localized/'
import { withConicGradient } from '../ConicGradient/'

import { navigate } from '@reach/router'
import {
	markers as query_markers,
	placesWithUndecidedChangesets as query_placesWithUndecidedChangesets,
} from '../../queries.js'

import './index.css'

// import categories from '../../data/dist/categories.json'
import presets from '../../data/dist/presets.json'
import colors from '../../data/dist/colors.json'
import colorsByPreset from '../../data/dist/colorsByPreset.json'
import { getColorByPreset, getTranslationFromArray, getCountryCode, getILGA/*, getPreset, getWantedTagsList*/ } from '../../functions.js'

import { withGlobals } from '../Globals/'

import {
	Fab,
} from '@material-ui/core'
import {
	AddRounded as ZoomInIcon, // ZoomInRounded
	RemoveRounded as ZoomOutIcon, // ZoomOutRounded
} from '@material-ui/icons'
import { withTheme } from '@material-ui/core/styles'

import FiltersPanelContent from '../FiltersPanelContent/'

import { Map, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import './leaflet/leaflet.css'

import { PruneCluster, PruneClusterForLeaflet } from './PruneCluster_dist/PruneCluster.js'

PruneCluster.Cluster.ENABLE_MARKERS_LIST = true

class MainMap extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			docs: [],
			isGeoChooser: false,
			middleMarkerDoc: undefined,
		}

		this.defaultClusterSize = 120

		this.filters = null

		// this.MarkerLayerRef = React.createRef()
		this.map = null
		this.borderGeojson = null
		this.markers = []
		this.placesWithUndecidedChangesets = []

		this.ConicGradient = null

		this.gotMapRef = this.gotMapRef.bind(this)

		this.createPruneCluster = this.createPruneCluster.bind(this)
		this.addMarkersToPruneCluster = this.addMarkersToPruneCluster.bind(this)
		this.filterMarkers = this.filterMarkers.bind(this)
		this.showAllMarkers = this.showAllMarkers.bind(this)
		this.showAllMarkersButMiddleMarker = this.showAllMarkersButMiddleMarker.bind(this)

		this.setMapPos = this.setMapPos.bind(this)
		this.viewportChanged = this.viewportChanged.bind(this)
		this.zoomIn = this.zoomIn.bind(this)
		this.zoomOut = this.zoomOut.bind(this)

		this.loadMarkers = this.loadMarkers.bind(this)
		this.loadPlacesWithUndecidedChangesets = this.loadPlacesWithUndecidedChangesets.bind(this)

		this.filtersChanged = this.filtersChanged.bind(this)
	}

	componentDidMount(){
		this.loadMarkers()
		this.loadPlacesWithUndecidedChangesets()
		this.loadBorders()

		if (this.props.conic_gradient) {
			this.props.conic_gradient.onReady(()=>{
				this.ConicGradient = this.props.conic_gradient.getConicGradient()
				this.clusterGroup.RedrawIcons()
			})
		}

		if (this.props.onFunctions) {
			const functions = {
				setZoom: (...attr) => this.map.setZoom(...attr),
				getZoom: () => this.map.getZoom(),
				getCenter: () => this.map.getCenter(),
				getBounds: () => this.map.getBounds(),
				zoomIn: () => this.map.zoomIn(),
				fitBounds: (...attr) => this.map.fitBounds(...attr),
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

		this.mapViewport = {
			center: this.props.store.get('map_center_real') || [51,10],
			zoom: this.props.store.get('map_zoom') || 3,
		}
	}
	componentDidUpdate(){
		if (this.props.filters !== this.filters) {
			this.filters = this.props.filters
			this.filterMarkers(this.filters)
		}
	}
	componentWillUnmount(){
		window.removeEventListener('updateMainMapView', this.setMapPos)
	
		if (this.markerQuerySubscription) {
			this.markerQuerySubscription.unsubscribe()
		}
	}

	setMapPos(event){
		this.setState({center:this.props.globals.map_center})
	}

	useAsGeoChooser(yesOrNo, middleMarkerDoc){
		if (yesOrNo) {
			this.setState({
				isGeoChooser: true,
				middleMarkerDoc,
			}, ()=>{
				this.filterMarkers(this.filters)
				this.setGlobalMapCenter()
			})
		}else{
			this.setState({
				isGeoChooser: false,
				middleMarkerDoc: undefined,
			}, ()=>{
				this.filterMarkers(this.filters)
				this.setGlobalMapCenter()
			})
		}
	}

	loadMarkers(){
		this.markerQuerySubscription = this.props.globals.graphql.watchQuery({
			fetchPolicy: 'cache-and-network',
			query: query_markers,
			variables: {
				languages: navigator.languages,
				// wantedTags: ['min_age','max_age',...getWantedTagsList(presets)], // this gets us about 11% reduction in size
			},
		})
		.subscribe(({data}) => {
			if (!!data && !!data.markers) {
				const docs = JSON.parse(JSON.stringify(data.markers)).map(doc=>{
					doc.___preset = (
						!!doc.preset && !!presets[doc.preset]
						? {
							key: doc.preset,
							...presets[doc.preset],
						}
						: presets.default
					)
					doc.___color = getColorByPreset(doc.___preset.key,colorsByPreset) || colors.default

					return doc
				})

				this.docs = docs
				this.addMarkersToPruneCluster(docs)
			}
		})
	}

	loadPlacesWithUndecidedChangesets(){
		this.markerQuerySubscription = this.props.globals.graphql.watchQuery({
			fetchPolicy: 'cache-and-network',
			query: query_placesWithUndecidedChangesets,
			variables: {},
		})
		.subscribe(({data}) => {
			if (!!data && !!data.placesWithUndecidedChangesets) {
				this.placesWithUndecidedChangesets = data.placesWithUndecidedChangesets.map(doc=>doc._id)
				this.filterMarkers(this.filters)
			}
		})
	}

	async loadBorders(){
		const borders_path = await import('./border-files/borders_1to110m_p2.geojson')
		const borders_response = await fetch(borders_path.default)
		const borders = await borders_response.json()
		this.borderGeojson = borders

		// this.showBorders()
	}
	
	showBorders(){
		if (!!this.map && !!this.borderGeojson) {
			if (!(!!this.borderGeojsonLayer)) {

			const getStatusColor = status => {
				if (status === 'great' || status === 1) {
					return this.props.theme.palette.success.main
				} else if (status === 'ok' || status === 2) {
					return this.props.theme.palette.warning.main
				} else if (status === 'bad' || status === 3) {
					return this.props.theme.palette.error.main
				}
				return this.props.theme.palette.background.default
			}

				this.borderGeojsonLayer = L.geoJSON(this.borderGeojson, {
					style: feature => {
						const country_code = getCountryCode(feature.properties)
						const ilga = getILGA(country_code)
						const color = getStatusColor(
							ilga
							&& ilga.overview
							&& ilga.overview.statusNumber
							? ilga.overview.statusNumber
							: -1
						)

						return {
							interactive: false,
							color: color,
							fillColor: color,
							weight: 0,
							opacity: 0.1,
							fillOpacity: 0.1,
						}
					}
				})
				// .addEventListener('click', event => {
				// 	const properties = event.sourceTarget.feature.properties
				// 	const country_code = getCountryCode(properties)
				// 	if (country_code) {
				// 		navigate(`/country/${country_code}/`)
				// 	}else{
				// 		navigate('')
				// 	}
				// })
			}

			this.map.addLayer(this.borderGeojsonLayer)
		}
	}
	hideBorders(){
		if (!!this.map && !!this.borderGeojsonLayer) {
			this.map.removeLayer(this.borderGeojsonLayer)
		}
	}

	gotMapRef(Map){
		if (!!Map && !!Map.leafletElement) {
			this.mapRef = Map
			this.map = Map.leafletElement

			this.createPruneCluster()
		}
	}

	getConicGradient(values){
		if (!(!!this.ConicGradient)) {
			return ''
		}

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

		var gradient = new this.ConicGradient({
		    stops: stops, // "gold 40%, #f06 0", // required
		    repeating: false, // Default: false
		    size: 100, // Default: Math.max(innerWidth, innerHeight)
		})

		return gradient
	}

	createPruneCluster(){
		this.clusterGroup = new PruneClusterForLeaflet()
		this.clusterGroup.Cluster.Size = this.defaultClusterSize

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
						let padding = 128
						if (this.props.globals.isSmallScreen) {
							padding = 64
						}

						this.clusterGroup._map.flyToBounds(bounds, {
							animate: true,
							duration: 0.75,
							paddingTopLeft: [(this.props.sidebarIsOpen ? 400+padding : padding), padding],
							paddingBottomRight: [padding, padding]
						})
					}
				}
			})
		
			return marker
		}


		this.clusterGroup.PrepareLeafletMarker = (leafletMarker, doc)=>{
			leafletMarker.setIcon(L.divIcon({
				html: `
					<div
						class="wrapper material-icons-round"
						style="${
							// doc.___color.key !== 'default'
							// ?
							`
								--bg-color:${doc.___color.bg};
								--fg-color:${doc.___color.fg};
							`
							// : ''
						}"
					>
						${doc.___preset.icon ? doc.___preset.icon.toLowerCase() : 'place'}
					</div>
				`,
				className: 'marker-custom-icon',
				iconSize: L.point(40, 40, true),
			}))
			
			if (
				!(!!leafletMarker.tooltipGotSet) // prevent duplicate tooltips
				&& !!doc.name
				&& doc.name.length > 0
			) {
				leafletMarker.tooltipGotSet = true // prevent duplicate tooltips

				leafletMarker.bindTooltip(`
					<div
						class="marker-custom-tooltip"
						style="${`
							--bg-color:${doc.___color.bg};
							--fg-color:${doc.___color.fg};
						`}"
					>
						${(
							doc.name &&
							doc.name.length > 0
							? getTranslationFromArray(doc.name, this.props.globals.userLocales)
							: ''
						)}
					</div>
				`, {
					sticky: false,
					interactive: false,
					opacity: 1,
					permanent: false,
					direction: 'bottom',
				})
			}
		
			leafletMarker.on('click', () => {
				if (!this.state.isGeoChooser) {
					navigate(`/view/${doc._id}/`)
				}
			})
		}

		this.clusterGroup.BuildLeafletClusterIcon = cluster=>{
			const colors = Object.entries(
				cluster.GetClusterMarkers()
				.filter(m => !!m.data.___color.key)
				.map(m => 
					// m.data.___color.key === 'default'
					// ? 'transparent'
					// :
					m.data.___color.bg
				)
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
	showAllMarkersButMiddleMarker(){
		const middleMarkerID = this.state.middleMarkerDoc._id

		const markers_length = this.markers.length
		for (let i = markers_length - 1; i >= 0; i--) {
			if (middleMarkerID === this.markers[i].data._id) {
				this.markers[i].filtered = true
			}else{
				this.markers[i].filtered = false
			}
		}

		this.clusterGroup.ProcessView()
	}
	filterMarkers(filters){
		if (this.state.isGeoChooser) {
			this.showBorders()
			this.showAllMarkersButMiddleMarker()
		}else{
			this.hideBorders()

			if (!!this.filters) {
				const ids = this.filters.ids || []
	
				const presets = this.filters.presets || []
				// const presets = ['amenity/community_centre']
				const presets_length = presets.length
	
				const selectedAge = this.filters.selectedAge
				const ageOption = this.filters.ageOption
				const audienceQueerOptions = this.filters.audienceQueerOptions || []
				const checkAudienceQueerOptions = audienceQueerOptions.length > 0
				const mustHaveUndecidedChangeset = this.filters.mustHaveUndecidedChangeset || false
				const published = (
					this.filters.published === false || this.filters.published === true
					? this.filters.published
					: null
				)
	
				if (
					presets_length > 0
					|| checkAudienceQueerOptions
					|| !!selectedAge
					|| mustHaveUndecidedChangeset
					|| published === true
					|| published === false
				) {
					const markers_length = this.markers.length
					for (let i = markers_length - 1; i >= 0; i--) {
						const marker = this.markers[i]
	
						if (ids.includes(marker.data._id)) {
							this.markers[i].filtered = false
						}else{
							
							let publishedFilter = false
							if (published === true) {
								publishedFilter = marker.data.tags.published === true
							}else if (published === false) {
								publishedFilter = marker.data.tags.published !== true
							}else if (published === null) {
								publishedFilter = true
							}
	
							let hasUndecidedChangesets = true
							if (mustHaveUndecidedChangeset) {
								if (marker.data.status === 'undecided') {
									hasUndecidedChangesets = true
								}else{
									hasUndecidedChangesets = this.placesWithUndecidedChangesets.includes(marker.data._id)
								}
							}
							
							let isInPresets = true
							if (presets_length > 0) {
								isInPresets = presets.map(preset_key=>{
									return marker.data.___preset.key.startsWith(preset_key)
								}).reduce((bool,value) => (value ? true : bool), false)
							}
	
							let matchesAudienceQueer = true
							if (checkAudienceQueerOptions) {
								if (!audienceQueerOptions.includes(marker.data.tags.audience_queer)) {
									matchesAudienceQueer = false
								}
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
	
							this.markers[i].filtered = !(publishedFilter && hasUndecidedChangesets && isInPresets && matchesAudienceQueer && isInAgeRange)
						}
					}
					this.clusterGroup.ProcessView()
				}else{
					this.hideBorders()
					this.showAllMarkers()
				}
			}else{
				this.hideBorders()
				this.showAllMarkers()
			}
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

	setGlobalMapCenter(){
		const viewport = this.mapViewport
		
		if (!(!!viewport && !!viewport.center && !!viewport.zoom)) {
			return
		}

		let mapCenter = viewport.center || [NaN,NaN]
		if (this.props.sidebarIsOpen) { // TODO this.props.sidebarIsOpen isn't enough on small screens
			mapCenter = Object.values(this.map.unproject(this.map.project(mapCenter).add([200,0])) ) // map center with sidebar offset
		}

		let mapZoom = viewport.zoom || NaN
		if (mapZoom >= 18) {
			this.clusterGroup.Cluster.Size = 10
		} else if (mapZoom >= 16) {
			this.clusterGroup.Cluster.Size = 20
		} else if (mapZoom >= 14) {
			this.clusterGroup.Cluster.Size = 60
		} else if (mapZoom >= 8) {
			this.clusterGroup.Cluster.Size = 80
		} else {
			this.clusterGroup.Cluster.Size = this.defaultClusterSize
		}

		this.props.store.set('map_center_fake', mapCenter)
		this.props.store.set('map_center_real', viewport.center)
		this.props.store.set('map_zoom', mapZoom)

		window.dispatchEvent(new Event('mapViewportUpdated'))
	}

	viewportChanged(viewport){
		this.mapViewport = viewport
		this.setGlobalMapCenter()
	}

	zoomIn(){
		this.map.setZoom(this.map.getZoom()+1)
	}
	zoomOut(){
		this.map.setZoom(this.map.getZoom()-1)
	}

	filtersChanged(...attr){
		if (this.props.onFiltersChanged) {
			this.props.onFiltersChanged(...attr)
		}
	}
	
	render() {
		// <ZoomControl position="bottomright" />

		return (<div className={`${this.props.className} ${this.props.mapIsResizing ? 'mapIsResizing' : ''} ${this.props.sidebarIsOpen ? 'sidebarIsOpen' : ''}`}>						

			<div className="filtersPanel">
				<FiltersPanelContent onChange={this.filtersChanged}/>
			</div>

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

			<div className="zoomButtons">
				<Fab
					aria-label={this.props.getString('zoom_in_aria_label')}
					title={this.props.getString('zoom_in_aria_label')}
					style={{
						pointerEvents: 'auto',
						padding: '0',
						width: '32px',
						height: '32px',
						minHeight: '32px',
						borderRadius: '8px',
						// borderBottomRightRadius: '2px',
						// borderBottomLeftRadius: '2px',
						marginBottom: '4px',
					}}
					size="small"
					onClick={this.zoomIn}
				>
					<ZoomInIcon />
				</Fab>
				<br />
				<Fab
					aria-label={this.props.getString('zoom_out_aria_label')}
					title={this.props.getString('zoom_out_aria_label')}
					style={{
						pointerEvents: 'auto',
						padding: '0',
						width: '32px',
						height: '32px',
						minHeight: '32px',
						borderRadius: '8px',
						// borderTopLeftRadius: '2px',
						// borderTopRightRadius: '2px',
					}}
					size="small"
					onClick={this.zoomOut}
				>
					<ZoomOutIcon />
				</Fab>
			</div>

			<Map
				ref={this.gotMapRef}
				className={
					'map'
					+(this.state.isGeoChooser ? ' isGeoChooser' : '')
				}

				onViewportChanged={this.viewportChanged}

				preferCanvas={true}
				useFlyTo={true}
				center={this.props.store.get('map_center_real') || [51,10]}
				minZoom={2}
				zoom={this.props.store.get('map_zoom') || 3}
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
								| <a href="https://www.mapbox.com/map-feedback/" target="_blank" rel="noreferrer">${this.props.getString('improve_this_map')}</a>
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
								| <a href="https://www.mapbox.com/map-feedback/" target="_blank" rel="noreferrer">${this.props.getString('improve_this_map')}</a>
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

export default withConicGradient(withGlobals(withLocalization(withTheme(MainMap))))
