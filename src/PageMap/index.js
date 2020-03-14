import React from 'react'
import { Map, TileLayer, Marker, Tooltip, LayerGroup} from 'react-leaflet'

import {navigate} from '@reach/router'
import {gql} from 'apollo-boost'

import './index.css'

import L from 'leaflet'
import './leaflet/leaflet.css'
import image_markerIcon1x from './marker_icon/dot_pinlet-2-medium-1x.png'
import image_markerIcon2x from './marker_icon/dot_pinlet-2-medium-2x.png'

export const markerIcon = new L.Icon({
	// https://www.google.com/maps/vt/icon/name=assets/icons/poi/tactile/pinlet_shadow_v3-2-medium.png,assets/icons/poi/tactile/pinlet_outline_v3-2-medium.png,assets/icons/poi/tactile/pinlet_v3-2-medium.png,assets/icons/poi/quantum/pinlet/dot_pinlet-2-medium.png&highlight=ff000000,ffffff,607D8B,ffffff?scale=4
	iconUrl: image_markerIcon1x,
	iconRetinaUrl: image_markerIcon2x,
	iconSize: [23, 32],
	iconAnchor: [12.5, 32],
	popupAnchor: [0, -32],
})

export default class PageMap extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			docs: [],
			bounds: null,
		}

		this.viewportChangedTimeout = null;

		this.MarkerLayerRef = React.createRef()
		this.MapRef = React.createRef()

		this.onViewportChanged = this.onViewportChanged.bind(this)
		this.showPlace = this.showPlace.bind(this)
	}

	componentDidMount(){
		this.loadMarkers()

		if (this.props.onSaveFunctions) {
			this.props.onSaveFunctions({
				getZoom: () => this.map.leafletElement.getZoom(),
				getBounds: () => this.map.leafletElement.getBounds(),
				setBounds: bounds => this.map.leafletElement.flyToBounds(bounds),
				setView: (...attr) => this.map.leafletElement.setView(...attr),
				flyTo: (...attr) => this.map.leafletElement.flyTo(...attr),
			})
		}
	}
	componentWillUnmount(){
		clearTimeout(this.viewportChangedTimeout)
	}

	onViewportChanged(viewport){
		// clearTimeout(this.viewportChangedTimeout)
		// this.viewportChangedTimeout = setTimeout(()=>{		
		// 	const mapViewport = {
		// 		// ...viewport,
		// 		bounds: this.map.leafletElement.getCenter(),
		// 		zoom: this.map.leafletElement.getZoom(),
		// 		bounds: this.map.leafletElement.getBounds().toBBoxString(),
		// 		location: window.location+''
		// 	}
		// 	// could be used to send stats to the server
		// 	// but we probably shouldnt
		// }, 500)
	}


	loadMarkers(){
		window.graphql.query({query: gql`{
		  	getAllPlaces {
				_id
				properties {
					... on Place {
						name
						
						location {
							lng
							lat
						}
						address
				
						min_age
						max_age
						links
						this_is_a_place_for
						tags
					}
				}
			}
		}`}).then(result => {
			this.setState({docs: result.data.getAllPlaces})

			// for (const doc of result.data.getAllPlaces) {
			// 	break
			//
			// 	const changeset = {
			// 		forDoc: null,
			// 		properties: doc.properties,
			// 		sources: 'https://thomasrosen.github.io/queer-centers/',
			// 		comment: '',
			// 		fromBot: true,
			// 		created_by: 'queer.qiekub.com',
			// 		created_at: new Date()*1,
			// 	}
			//
			// 	let changeset_json = JSON.stringify(changeset)
			// 	changeset_json = changeset_json.replace(/"(\w+)"\s*:/g, '$1:')
			//
			// 	window.graphql.mutate({mutation: gql`mutation {
			// 		addChangeset(changeset:${changeset_json}) {
			// 			_id
			// 			properties {
			// 				... on Changeset {
			// 					forDoc
			// 				}
			// 			}
			// 		}
			// 	}`}).then(result => {
			// 		console.info('mutate-result', result)
			// 	}).catch(error=>{
			// 		console.error('mutate-error', error)
			// 	})
			// }

		}).catch(error=>{
			console.error(error)
		})
	}

	async showPlace(doc,thisMarkerRef) {
		// await navigate(`/place/${doc.properties.name}/`)
		await navigate(`/place/${doc._id}/`)
	}

	render() {
		// <ZoomControl position="bottomright" />

		return (<div className={this.props.className}>
			<Map
				ref={Map => this.map = Map}
				className="map"
				useFlyTo={true}
				bounds={this.state.bounds}
				center={[51,10]}
				minZoom={2}
				zoom={1}
				maxZoom={21}
				zoomControl={false}
				onViewportChanged={this.onViewportChanged}

				worldCopyJump={true}
				maxBoundsViscosity={1.0}

				maxBounds={[[-180,99999],[180,-99999]]}
			>
				{/*<TileLayer
					attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>*/}
				{/*<TileLayer
					attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
					url="https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=JdjEr7nrztG6lZV91e7l"
				/>*/}
				{<TileLayer
					attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; MapBox</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
					url="https://api.mapbox.com/styles/v1/petacat/ck7h7qgtg4c4b1ikiifin5it7/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicGV0YWNhdCIsImEiOiJjaWl0MGpqOHEwM2VhdTZrbmhsNG96MjFrIn0.Uhlmj9xPIaPK_3fLUm4nIw"
				/>}
				{/*<TileLayer
					attribution='href="https://www.mapbox.com/about/maps/" target="_blank">&copy; MapBox</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
					url="https://api.mapbox.com/styles/v1/petacat/cixrvkhut001a2rnts6cgmkn5/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicGV0YWNhdCIsImEiOiJjaWl0MGpqOHEwM2VhdTZrbmhsNG96MjFrIn0.Uhlmj9xPIaPK_3fLUm4nIw"
				/>*/}







				<LayerGroup ref={this.MarkerLayerRef}>
					{this.state.docs.map(doc=>{
						const thisMarkerRef = React.createRef()
						const location = doc.properties.location || {}
						if (location.lng && location.lat) {
							return (<Marker
								key={doc.properties.name}
								position={[location.lat,location.lng]} 
								icon={markerIcon}
								ref={thisMarkerRef}
								onClick={()=>this.showPlace(doc,thisMarkerRef)}
							>
								<Tooltip
									sticky={true}
									interactive={false}
									opacity={1}
									permanent={false}
								>
									{doc.properties.name}
								</Tooltip>
							</Marker>)
						}
						return null
					})}
				</LayerGroup>
			</Map>
		</div>)
	}
}
