import React from 'react'

import { withLocalization } from '../Localized/'
import { withConicGradient } from '../ConicGradient/'

import { navigate } from '@reach/router'
import {
	markers as query_markers,
	undecidedPlaces as query_undecidedPlaces,
} from '../../queries.js'

import './index.css'

import presets from '../../data/dist/presets.json'
import colors from '../../data/dist/colors.json'
import colorsByPreset from '../../data/dist/colorsByPreset.json'
import { getColorByPreset, getTranslationFromArray, getCountryCode, getILGA /*, getPreset, getWantedTagsList*/ } from '../../functions.js'

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

// import { Map, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import './leaflet/leaflet.css'

import mapboxgl from 'mapbox-gl'
import './mapbox-gl.v1.12.0.css' // https://api.tiles.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css

import { PruneCluster, PruneClusterForLeaflet } from './PruneCluster_dist/PruneCluster.js'

PruneCluster.Cluster.ENABLE_MARKERS_LIST = true

mapboxgl.accessToken = 'pk.eyJ1IjoicWlla3ViIiwiYSI6ImNrOTFwdGRxajAwODIzaXFwaG02ODlteTMifQ.n4y40LbSaVs_oJcR-czHGg'

// mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.0/mapbox-gl-rtl-text.js')

class MainMapMapbox extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			docs: [],
			isGeoChooser: false,
			middleMarkerDoc: undefined,
			lng: 5,
			lat: 34,
			zoom: 2
		}

		this.currentStyleURL = null

		this.clusterGroup = null
		this.defaultClusterSize = 120

		// objects for caching and keeping track of HTML marker objects (for performance)
		this.mapbox_markers = {}
		this.mapbox_markersOnScreen = {}

		this.filters = null

		// this.MarkerLayerRef = React.createRef()
		this.leaflet_map = null
		this.map = null
		this.borderGotLoaded = false
		this.prune_markers = []
		this.undecidedPlaces = []

		this.ConicGradient = null

		this.gotMapRef = this.gotMapRef.bind(this)
		this.gotMapRefLeaflet = this.gotMapRefLeaflet.bind(this)

		this.syncViewport = this.syncViewport.bind(this)
		this.addMarkersToPruneCluster = this.addMarkersToPruneCluster.bind(this)
		this.filterMarkers = this.filterMarkers.bind(this)
		this.showAllMarkers = this.showAllMarkers.bind(this)
		this.showAllMarkersButMiddleMarker = this.showAllMarkersButMiddleMarker.bind(this)

		// this.setMapPos = this.setMapPos.bind(this)
		this.viewportChanged = this.viewportChanged.bind(this)
		this.zoomIn = this.zoomIn.bind(this)
		this.zoomOut = this.zoomOut.bind(this)

		this.loadMarkers = this.loadMarkers.bind(this)
		this.loadUndecidedPlaces = this.loadUndecidedPlaces.bind(this)

		this.filtersChanged = this.filtersChanged.bind(this)
	}

	componentDidMount(){
		this.loadMarkers()
		this.loadUndecidedPlaces()

		if (this.props.conic_gradient) {
			this.props.conic_gradient.onReady(()=>{
				this.ConicGradient = this.props.conic_gradient.getConicGradient()
				// this.clusterGroup.RedrawIcons()
				this.updateMarkers({forceRedraw:true})
			})
		}

		if (this.props.onFunctions) {
			const functions = {
				getMapType: () => 'mapbox',
				setPadding: (...attr) => this.map.setPadding(...attr),
				setZoom: (...attr) => this.map.setZoom(...attr),
				getZoom: () => this.map.getZoom(),
				getCenter: () => this.map.getCenter(),
				getBounds: () => this.map.getBounds(),
				zoomIn: () => this.map.zoomIn(),
				fitBounds: (...attr) => this.map.fitBounds(...attr),
				flyToBounds: (...attr) => this.map.fitBounds(...attr),
				// setView: (...attr) => {
				// 	this.map.setCenter(attr.center)
				// 	this.map.setZoom(attr.zoom)
				// }, // this.map.setView(...attr),
				setView: (...attr) => this.map.jumpTo(...attr),
				panBy: (...attr) => this.map.panBy(...attr),
				panTo: (...attr) => this.map.panTo(...attr),
				flyTo: (...attr) => this.map.flyTo(...attr),
				invalidateSize: (...attr) => this.leaflet_map.invalidateSize(...attr),
				project: (...attr) => this.leaflet_map.project(...attr),
				unproject: (...attr) => this.leaflet_map.unproject(...attr),
				latLngToContainerPoint: (...attr) => this.leaflet_map.latLngToContainerPoint(...attr),

				useAsGeoChooser: (...attr) => this.useAsGeoChooser(...attr),
				refetchMarkers: () => this.refetchMarkers(),
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

		const newStyleURL = this.getStyleUrl()
		if (!!this.map && this.currentStyleURL !== newStyleURL) {
			this.currentStyleURL = newStyleURL
			this.map.setStyle(newStyleURL)
		}
	}
	componentWillUnmount(){
		window.removeEventListener('updateMainMapView', this.setMapPos)
	
		if (this.markerQuerySubscription) {
			this.markerQuerySubscription.unsubscribe()
		}
	}

	refetchMarkers(){
		this.props.globals.graphql.query({
			fetchPolicy: 'network-only',
			query: query_markers,
			variables: {
				languages: navigator.languages,
			},
		})
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

	loadUndecidedPlaces(){
		if (!!this.props.globals.profileID) {
			this.markerQuerySubscription = this.props.globals.graphql.watchQuery({
				fetchPolicy: 'cache-and-network',
				query: query_undecidedPlaces,
				variables: {},
			})
			.subscribe(({data}) => {
				if (!!data && !!data.undecidedPlaces) {
					this.undecidedPlaces = data.undecidedPlaces.map(doc=>doc._id)
					this.filterMarkers(this.filters)
				}
			})
		}
	}
	
	async showBorders(){
		if (!this.borderGotLoaded) {
			this.borderGotLoaded = true
			const borders_path = await import('./border-files/borders_1to110m_p2.geojson')
			const borders_response = await fetch(borders_path.default)
			const borders = await borders_response.json()
		
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
		
			borders.features = borders.features.map(feature => {
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
					geometry: feature.geometry,
					properties: {
						...feature.properties,
						color,
					},
				}
			})

			this.map.addSource('borders', {
				type: 'geojson',
				data: borders,
			})

			// this.map.on('load', ()=>{
			// 	// this.showBorders()
			// })
		}

		const layers = this.map.getStyle().layers
		// Find the index of the first symbol layer in the map style
		let firstSymbolId = null
		for (const layer of layers) {
			if (layer.type === 'symbol') {
				firstSymbolId = layer.id
				break
			}
		}
	
		this.map.addLayer({
			'id': 'borders',
			'type': 'fill',
			'source': 'borders',
			'layout': {},
			'paint': {
				'fill-color': ['get', 'color'],
				'fill-opacity': 0.15,
			},
		}, firstSymbolId)
	}
	hideBorders(){
		if (!!this.map && this.map.getLayer('borders')) {
			this.map.removeLayer('borders')
		}
	}

	getStyleUrl(){
		if (this.props.theme.palette.type === 'light') {
			return 'mapbox://styles/qiekub/ck8aum3p70aa51in4ikxao8ii' // ?optimize=true
		}else{
			return 'mapbox://styles/qiekub/ck8ozalln0c1g1iog1mpl8aps' // ?optimize=true
		}
	}

	getInitCenter(){
		let center = this.props.store.get('map_center_fake')

		if (!(!!center)) {
			center = {
				lat: 51,
				lng: 10,
			}
		}
		if (!(!!center.lat) || center.lat <= -90 || center.lat >= 90) {
			center.lat = 51
		}
		if (!(!!center.lng)) {
			center.lng = 10
		}

		return center
	}

	gotMapRefLeaflet(element){
		if (!!element && this.leaflet_map === null) {
			this.leaflet_map = new L.Map(element, {
				center: this.getInitCenter(),
				zoom: (this.props.store.get('map_zoom') || 3)+1,
				zoomSnap: 0,
				zoomAnimation: false,
				fadeAnimation: false,
				markerZoomAnimation: false,
				scrollWheelZoom: false,
				minZoom: 1,
				maxZoom: 22,
			})
	
			// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			// 	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			// }).addTo(this.leaflet_map);
	
			// L.tileLayer('https://api.mapbox.com/styles/v1/qiekub/ck8ozalln0c1g1iog1mpl8aps/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicWlla3ViIiwiYSI6ImNrOGF1ZGlpdzA1dDgzamx2ajNua3picmMifQ.OYr_o4fX7vPTvZCWZsUs4g', {
			// 	attribution: ''
			// }).addTo(this.leaflet_map)
	
			this.clusterGroup = new PruneClusterForLeaflet()
			this.clusterGroup.Cluster.Size = this.defaultClusterSize
			this.leaflet_map.addLayer(this.clusterGroup)
			setTimeout(() => {
				this.syncViewport()
			}, 100)
		}
	}
	gotMapRef(element){
		if (!!element && this.map === null) {
			this.currentStyleURL = this.getStyleUrl()

			const center = this.getInitCenter()
	
			this.map = new mapboxgl.Map({
				container: element,
				style: this.currentStyleURL,
				center: new mapboxgl.LngLat(center.lng, center.lat),
				zoom: this.props.store.get('map_zoom') || 3,
				bearing: 0, // this.props.store.get('map_bearing') || 0,
				pitch: 0, // this.props.store.get('map_pitch') || 0,
				hash: false, // 'map',
				refreshExpiredTiles: true,
				minZoom: 1,
				maxZoom: 22,
				bearingSnap: 7,
				pitchWithRotate: true,
				dragPan: true,
				dragRotate: true,
				touchZoomRotate: true,
				touchPitch: true,
				scrollZoom: true,
				boxZoom: false,
				doubleClickZoom: false,
			})

			// this.map.showPadding = true

			let currentMapboxStylesheetID = null
			this.map.on('styledata', event => {
				const newMapboxStylesheetID = event.style.stylesheet.id
				if (event.style._loaded && currentMapboxStylesheetID !== newMapboxStylesheetID) {
					currentMapboxStylesheetID = event.style.stylesheet.id
					this.localizeTheMap()
				}
			})
	
			this.map.on('move', this.syncViewport)
			this.map.on('moveend', this.syncViewport)
			this.map.on('zoom', this.syncViewport)
			this.map.on('zoomend', this.syncViewport)
	
			this.syncViewport()
		}
	}
	syncViewport() {
		if (!!this.map) {
			this.viewportChanged({
				center: this.map.getCenter(),
				zoom: this.map.getZoom(),
				bearing: this.map.getBearing(),
				pitch: this.map.getPitch(),
			})
		}
	}

	localizeTheMap(){
		const language = this.props.getString('map_language')

		const layerIDs = this.map.getStyle().layers
		.filter(layer => (
			layer.hasOwnProperty('layout')
			&& layer.layout.hasOwnProperty('text-field')
			&& layer.layout['text-field'].flat().includes('name')
		))
		.map(layer => layer.id)

		for (const layerID of layerIDs) {
			this.map.setLayoutProperty(layerID, 'text-field', [
				'coalesce',
				['get', 'name_'+language],
				['get', 'name_en'],
				['get', 'name'],
			])
		}	
	}


		 
	updateMarkers(options){
		options = options || {}

		if (!(!!this.clusterGroup)) {
			return null
		}

		const newMarkers = {}



		if (options.forceRedraw) {
			for (const id in this.mapbox_markers) {
				this.mapbox_markers[id].remove()
			}
			this.mapbox_markers = {}
			this.mapbox_markersOnScreen = {}
		}


		// for every cluster on the screen, create an HTML marker for it (if we didn't yet), and add it to the map if it's not there already
		for (const feature of this.clusterGroup._objectsOnMap) {
			const averagePosition = feature.averagePosition
			const id = feature.hashCode
	
			let marker = this.mapbox_markers[id]
			if (!marker) {
				marker = this.mapbox_markers[id] = new mapboxgl.Marker({
					element: (
						feature.population === 1
						? this.createPoiMarker(feature)
						: this.createClusterMarker(feature)
					)
				})
				.setLngLat(averagePosition)
			}
			newMarkers[id] = marker
					 
			if (!this.mapbox_markersOnScreen[id]) {
				marker.addTo(this.map)
			}
		}

		// for every marker we've added previously, remove those that are no longer visible
		for (const id in this.mapbox_markersOnScreen) {
			if (!newMarkers[id]) {
				this.mapbox_markersOnScreen[id].remove()
			}
		}
		this.mapbox_markersOnScreen = newMarkers
	}
	updateMarkersAfterPruneClusterUpdate(){
		setTimeout(() => {
			this.updateMarkers()
		}, 100)
	}

	createPoiMarker(options){
		const doc = options.lastMarker.data

		const element = document.createElement('div')
		element.classList.add('marker-custom-icon')
		element.style.cursor = 'pointer'
		element.style.width = '40px'
		element.style.height = '40px'

		element.addEventListener('click', event=>{
			if (!this.state.isGeoChooser) {
				navigate(`/view/${doc._id}/`)
			}
		})

		element.innerHTML =`
			<div
				class="wrapper material-icons-round"
				style="
					--bg-color:${doc.___color.bg};
					--fg-color:${doc.___color.fg};
				"
			>
				${doc.___preset.icon ? doc.___preset.icon.toLowerCase() : 'place'}
			</div>
			<div
				class="mapboxTooltip marker-custom-tooltip"
				style="
					--bg-color:${doc.___color.bg};
					--fg-color:${doc.___color.fg};
				"
			>
				${(
					doc.name &&
					doc.name.length > 0
					? getTranslationFromArray(doc.name, this.props.globals.userLocales)
					: ''
				)}
			</div>
		`
		
		return element
	}
	createClusterMarker(options){
		const colors = Object.entries(
			options._clusterMarkers
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

		const element = document.createElement('div')
		element.classList.add('marker-cluster-custom-icon')
		element.style.cursor = 'pointer'
		element.style.width = '48px'
		element.style.height = '48px'

		element.innerHTML = `
			<div class="number">${options.population || ''}</div>
			<div class="pieChart" style="background-image:url(${!!gradient ? gradient.dataURL : ''});"></div>
		`

		
		element.addEventListener('click', event=>{
			let padding = 128
			if (this.props.globals.isSmallScreen) {
				padding = 64
			}

			// const o_bounds = options.bounds
			//
			// const minLngLat = new mapboxgl.LngLat(o_bounds.minLng, o_bounds.minLat);
			// const maxLngLat = new mapboxgl.LngLat(o_bounds.maxLng, o_bounds.maxLat);
			// const distance = minLngLat.distanceTo(maxLngLat)*0.5
			// const middle = options.position
			//
			// const bounds = new mapboxgl.LngLat(middle.lng, middle.lat).toBounds(distance)
			//
			// this.map.fitBounds(bounds, {
			// 	padding: {
			// 		top: padding,
			// 		right: padding,
			// 		bottom: 116+padding,
			// 		left: (this.props.sidebarIsOpen ? 400+padding : padding)
			// 	},
			// })

			this.map.flyTo({
				center: options.position, // .averagePosition,
				zoom: this.map.getZoom()+1,
				padding: {
					top: padding,
					right: padding,
					bottom: 116+padding,
					left: (this.props.sidebarIsOpen ? 400+padding : padding)
				},
				duration: 750,
			})
		})
		
		return element
	}

	getConicGradient(values){
		if (!(!!this.ConicGradient)) {
			return null
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

		const gradient = new this.ConicGradient({
		    stops: stops, // "gold 40%, #f06 0", // required
		    repeating: false, // Default: false
		    size: 100, // Default: Math.max(innerWidth, innerHeight)
		})

		return gradient
	}

	addMarkersToPruneCluster(docs){
		this.prune_markers = []
		this.clusterGroup.RemoveMarkers()

		for (const doc of docs) {
			let marker = new PruneCluster.Marker(doc.lat, doc.lng, doc)
			marker.filtered = true
			this.prune_markers.push(marker)
			this.clusterGroup.RegisterMarker(marker)
		}

		this.clusterGroup.ProcessView()
		this.leaflet_map.invalidateSize(false)

		this.filterMarkers(this.filters)
	}

	hideAllMarkers(){
		const markers_length = this.prune_markers.length
		for (let i = markers_length - 1; i >= 0; i--) {
			this.prune_markers[i].filtered = true
		}
		this.clusterGroup.ProcessView()
		this.updateMarkersAfterPruneClusterUpdate()
	}
	showAllMarkers(){
		const markers_length = this.prune_markers.length
		for (let i = markers_length - 1; i >= 0; i--) {
			this.prune_markers[i].filtered = false
		}
		this.clusterGroup.ProcessView()
		this.updateMarkersAfterPruneClusterUpdate()
	}
	showAllMarkersButMiddleMarker(){
		const middleMarkerID = this.state.middleMarkerDoc._id

		const markers_length = this.prune_markers.length
		for (let i = markers_length - 1; i >= 0; i--) {
			if (middleMarkerID === this.prune_markers[i].data._id) {
				this.prune_markers[i].filtered = true
			}else{
				this.prune_markers[i].filtered = false
			}
		}

		this.clusterGroup.ProcessView()
		this.updateMarkersAfterPruneClusterUpdate()
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
					const markers_length = this.prune_markers.length
					for (let i = markers_length - 1; i >= 0; i--) {
						const marker = this.prune_markers[i]
	
						if (ids.includes(marker.data._id)) {
							this.prune_markers[i].filtered = false
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
									hasUndecidedChangesets = this.undecidedPlaces.includes(marker.data._id)
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
	
							this.prune_markers[i].filtered = !(publishedFilter && hasUndecidedChangesets && isInPresets && matchesAudienceQueer && isInAgeRange)
						}
					}
					this.clusterGroup.ProcessView()
					this.updateMarkersAfterPruneClusterUpdate()
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
	

	setGlobalMapCenter(){
		const viewport = this.mapViewport
		
		if (!(!!viewport && !!viewport.center && !!viewport.zoom)) {
			return
		}

		let mapCenter = viewport.center || {lng:0,lat:0}
		// if (this.props.sidebarIsOpen) { // TODO this.props.sidebarIsOpen isn't enough on small screens
		// 	const p1 = this.map.project(mapCenter)
		// console.log('p1', p1)
		// 	const {x, y} = p1
		// 	mapCenter = this.map.unproject({
		// 		x: x+200,
		// 		y,
		// 	}) // map center with sidebar offset
		//
		// 	if (Array.isArray(mapCenter)) {
		// 		mapCenter = {
		// 			lng: mapCenter[1],
		// 			lat: mapCenter[0],
		// 		}
		// 	}
		// }

		let mapZoom = viewport.zoom || 2
		if (this.clusterGroup) {
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
		}

		this.props.store.set('map_center_fake', mapCenter)
		this.props.store.set('map_center_real', viewport.center)
		this.props.store.set('map_zoom', mapZoom)
		// this.props.store.set('map_bearing', viewport.bearing || 0)
		// this.props.store.set('map_pitch', viewport.pitch || 0)

		window.dispatchEvent(new Event('mapViewportUpdated'))
	}

	viewportChanged(viewport){
		if (this.leaflet_map) {
			this.leaflet_map.setView(
				viewport.center,
				viewport.zoom+1,
				{
					animate: false,
					duration: 0,
				}
			)
			this.updateMarkers()
		}

		this.mapViewport = viewport
		this.setGlobalMapCenter()
	}

	zoomIn(){
		this.map.zoomIn({duration: 200})
	}
	zoomOut(){
		this.map.zoomOut({duration: 200})
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

			<div
				ref={this.gotMapRef}
				className={
					'map'
					+(this.state.isGeoChooser ? ' isGeoChooser' : '')
				}
			></div>

			<div
				ref={this.gotMapRefLeaflet}
				className='map leaflet'
			></div>

		</div>)
	}
}

export default withConicGradient(withGlobals(withLocalization(withTheme(MainMapMapbox))))
