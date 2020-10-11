import React, {lazy, Suspense} from 'react'

import { withLocalization } from '../Localized/'

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

class MainMapMapbox extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			docs: [],
		}

		// objects for caching and keeping track of HTML marker objects (for performance)
		this.mapbox_markers = {}
		this.mapbox_markersOnScreen = {}

		this.filters = null

		this.undecidedPlaces = []

		this.filterMarkers = this.filterMarkers.bind(this)
		this.showAllMarkers = this.showAllMarkers.bind(this)

		this.loadMarkers = this.loadMarkers.bind(this)
		this.loadUndecidedPlaces = this.loadUndecidedPlaces.bind(this)

		this.filtersChanged = this.filtersChanged.bind(this)
	}

	componentDidMount(){
		this.loadMarkers()
		this.loadUndecidedPlaces()

		if (this.props.onFunctions) {
			const functions = {
				useAsGeoChooser: (...attr) => this.useAsGeoChooser(...attr),
				refetchMarkers: () => this.refetchMarkers(),
			}
			this.props.globals.mainMapFunctions = functions
			this.props.onFunctions(functions)
		}
	}
	componentDidUpdate(){
		if (this.props.filters !== this.filters) {
			this.filters = this.props.filters
			this.filterMarkers(this.filters)
		}
	}
	componentWillUnmount(){	
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

		 
	updateMarkers(options){
		options = options || {}

		if (
			!(!!this.clusterGroup)
			|| !(!!this.mapboxgl)
		) {
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
				marker = this.mapbox_markers[id] = new this.mapboxgl.Marker({
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

	filterMarkers(filters){
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
				}else{
					this.showAllMarkers()
				}
			}else{
				this.showAllMarkers()
			}
	}

	filtersChanged(...attr){
		if (this.props.onFiltersChanged) {
			this.props.onFiltersChanged(...attr)
		}
	}
	
	render() {
		return (<div className={`${this.props.className} ${this.props.sidebarIsOpen ? 'sidebarIsOpen' : ''}`}>						

			<div className="filtersPanel">
				<FiltersPanelContent onChange={this.filtersChanged}/>
			</div>

			<Suspense fallback={this.props.globals.renderLazyLoader()}>
				<MapboxLoader
					onLoad={this.loadedMapbox}
					className={
						'map'
						+(this.state.isGeoChooser ? ' isGeoChooser' : '')
					}
				/>
			</Suspense>

			<div className=""></div>

		</div>)
	}
}

export default withGlobals(withLocalization(withTheme(MainMapMapbox)))
