import React from 'react'
import './index.css'

// import {gql} from 'apollo-boost'
import {Router,navigate} from '@reach/router'
import {
	loadPlace as query_loadPlace,
	search as query_search,
} from '../../queries.js'

// import categories from '../../data/dist/categories.json'
import presets from '../../data/dist/presets.json'
// import colors from '../../data/dist/colors.json'
// import colorsByPreset from '../../data/dist/colorsByPreset.json'
import {getWantedTagsList} from '../../functions.js'

import {
	// Fab,
	// Drawer,

	// Card,
	// CardActions,
	// CardActionArea,
	// CardContent,
	// Typography,
	// Divider,
	// Button,
	// Checkbox,

	// List,
	// ListItem,
	// ListItemText,
	// ListItemIcon,
	// ListItemSecondaryAction,
} from '@material-ui/core'
import {
	// AddRounded as AddIcon,
	// FilterList as FilterListIcon,
	// ExpandLess as ExpandLessIcon,
} from '@material-ui/icons'

import PageMap from '../PageMap/'
import SearchBar from '../SearchBar/'
import Sidebar from '../Sidebar/'
import FiltersPanelContent from '../FiltersPanelContent/'

import 'typeface-roboto'



export default class App extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			searchBarValue: '',
			sidebarIsOpen: false,
			doc: null,

			filters: {
				presets: []
			}
		}

		this.functions = {}

		this.startSearch = this.startSearch.bind(this)
		this.setSearchBarValue = this.setSearchBarValue.bind(this)
		this.setSidebarIsOpen = this.setSidebarIsOpen.bind(this)
		this.addPlace = this.addPlace.bind(this)
		this.loadAndViewDoc = this.loadAndViewDoc.bind(this)
		this.filtersChanged = this.filtersChanged.bind(this)

		this.setView = this.setView.bind(this)
		this.flyTo = this.flyTo.bind(this)
		this.getZoom = this.getZoom.bind(this)
	}

	saveFunctions(componentName, functionsObject){
		this.functions[componentName] = functionsObject
	}

	setSearchBarValue(value){
		this.setState({searchBarValue:value})
	}
	
	setSidebarIsOpen(value){
		// const center = this.functions['PageMap'].getCenter()
		// const zoom = this.functions['PageMap'].getZoom()

		this.setState({sidebarIsOpen:value}, ()=>{
			// if (new Date()*1 - window.pageOpenTS*1 > 2000) {
			// 	// this.functions['PageMap'].invalidateSize()
			// 	setTimeout(()=>{
			// 		// const center2 = this.functions['PageMap'].getCenter()
			// 		console.log('center', center, zoom)
			// 		// console.log('center2', center2)
			// 		this.functions['PageMap'].flyTo(center, Math.round(zoom), {
			// 			animate: true,
			// 			duration: 1.5,
			// 		})
			// 		// this.functions['PageMap'].invalidateSize()
			// 	}, 500)
			// }

			// if (new Date()*1 - window.pageOpenTS*1 < 2000) {
			// 	console.log('center-2', center)
			// 	this.functions['PageMap'].panTo(center, {
			// 		animate: true,
			// 		duration: 5,
			// 	})
			// }else{
			// 	this.functions['PageMap'].panTo(
			// 		this.functions['PageMap'].getCenter(), {
			// 		animate: true,
			// 		duration: 5,
			// 	})
			// }
		})
	}

	startSearch(queryString,callback){
		if (queryString && queryString !== '' && queryString.length > 1 && /\S/.test(queryString)) {
			window.graphql.query({
				query: query_search,
				variables: {query: queryString},
			}).then(async result => {
				await navigate(`/`)

				this.functions['PageMap'].flyToBounds([
					[
						result.data.search.geometry.boundingbox.southwest.lat,
						result.data.search.geometry.boundingbox.southwest.lng,
					],
					[
						result.data.search.geometry.boundingbox.northeast.lat,
						result.data.search.geometry.boundingbox.northeast.lng,
					]
				], {
					animate: true,
					duration: 1.5,
				})

				// this.functions['PageMap'].setBounds([
				// 	[result.data.geocode.boundingbox[0], result.data.geocode.boundingbox[2]],
				// 	[result.data.geocode.boundingbox[1], result.data.geocode.boundingbox[3]]
				// ])
				callback()
			}).catch(error=>{
				console.error(error)
				callback()
			})
		}else{
			callback()
		}
	}

	loadAndViewDoc(docID){
		if (docID && docID !== '' && docID.length > 1 && /\S/.test(docID)) {
			window.graphql.query({
				query: query_loadPlace,
				variables: {
					_id: docID,
					wantedTags: [
						...this.functions['Sidebar'].getWantedTagsList(),
						...getWantedTagsList(presets),
					],
				},
			}).then(async result=>{
				const doc = result.data.getPlace
		
				if (doc !== null) {
					this.functions['Sidebar'].setDoc(doc)
		
					let zoomLevel = this.functions['PageMap'].getZoom()
					if (zoomLevel < 17) {
						zoomLevel = 17
					}

					if (new Date()*1 - window.pageOpenTS*1 < 2000) {
						this.functions['PageMap'].setView(
							[doc.properties.geometry.location.lat,doc.properties.geometry.location.lng],
							zoomLevel
						)
					// }else{
					// 	this.functions['PageMap'].flyTo(
					// 		[doc.properties.geometry.location.lat,doc.properties.geometry.location.lng],
					// 		zoomLevel,
					// 		{
					// 			animate: true,
					// 			duration: 1,
					// 		}
					// 	)
					}
				}
			}).catch(error=>{
				console.error(error)
			})
		}
	}

	async addPlace(){

		await navigate(`/place/add/`)
		setTimeout(()=>{
			this.functions['Sidebar'].editNewDoc('Place')
		}, 100)

		// this.setState({doc:{
		// 	_id: null,
		// 	properties: {
		// 		__typename: 'Place',
		// 	},
		// }}, async ()=>{
		// 	await navigate(`/place/add/`)
		// })
	}

	setView(...attr){
		return this.functions['PageMap'].setView(...attr)
	}
	flyTo(...attr){
		return this.functions['PageMap'].flyTo(...attr)
	}
	getZoom(...attr){
		return this.functions['PageMap'].getZoom(...attr)
	}

	filtersChanged(newFilters){
		this.setState({filters:newFilters})
	}

	render() {
		return (<>
			{/*<Localized id="hello" $name={"Thomas"} $date={new Date()} />*/}

			<SearchBar
				className="SearchBar"
				onStartSearch={this.startSearch}
				value={this.state.searchBarValue}
				sidebarIsOpen={this.state.sidebarIsOpen}
				onSetSidebarIsOpen={this.setSidebarIsOpen}
				onSetSearchBarValue={this.setSearchBarValue}
			/>

			{/*<Card>
				Start Info:

				Where can I meet queer people in my town?
				Where is the next queer-youth-center?
				
				Help us answer these questions!

				Add queer-infos about places around you.
			</Card>*/}

			{/*<Fab variant="extended" className="addNewFab" onClick={this.addPlace}>
				<AddIcon style={{color:'var(--light-green)',marginRight:'8px'}} />
				Add a Place
			</Fab>*/}

			<div className="filtersPanel">
				<FiltersPanelContent onChange={this.filtersChanged}/>
			</div>

			<Router primary={false}>
				<Sidebar
					path="/place/:docID"
					
					className="Sidebar"

					onViewDoc={this.loadAndViewDoc}
					onSetSearchBarValue={this.setSearchBarValue}
					onSetSidebarIsOpen={this.setSidebarIsOpen}

					onSetView={this.setView}
					onFlyTo={this.flyTo}
					onGetZoom={this.getZoom}
					onFunctions={(...attr)=>{this.saveFunctions('Sidebar',...attr)}}
				/>
			</Router>
			
			<PageMap
				className={'page'+(this.state.sidebarIsOpen ? ' sidebarIsOpen' : '')}
				onViewDoc={this.loadAndViewDoc}
				onFunctions={(...attr)=>{this.saveFunctions('PageMap',...attr)}}
				filters={this.state.filters}
			/>
			
		</>)
	}
}