import React from 'react'
import './index.css'

import {gql} from 'apollo-boost'
import {Router,navigate} from "@reach/router"

import {
	Fab
} from '@material-ui/core'
import {
	Add as AddIcon,
} from '@material-ui/icons'

import PageMap from '../PageMap/index.js'
import SearchBar from '../SearchBar/index.js'
// import InfoCard from '../InfoCard/index.js'
import PlaceSidebar from '../PlaceSidebar/index.js'

import 'typeface-roboto'

export default class App extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			searchBarValue: '',
			sidebarIsOpen: false,
		}

		this.functions = {}

		this.startSearch = this.startSearch.bind(this)
		this.setSearchBarValue = this.setSearchBarValue.bind(this)
		this.setSidebarIsOpen = this.setSidebarIsOpen.bind(this)
		this.addPlace = this.addPlace.bind(this)

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
		this.setState({sidebarIsOpen:value})
	}

	startSearch(queryString,callback){
		if (queryString && queryString !== '' && queryString.length > 1 && /\S/.test(queryString)) {
			window.graphql.query({query: gql`{
				geocode(search:"${queryString}"){
					lat
					lng
					boundingbox
				}
			}`}).then(async result => {

				await navigate(`/`)

				this.functions['PageMap'].setBounds([
					[result.data.geocode.boundingbox[0], result.data.geocode.boundingbox[2]],
					[result.data.geocode.boundingbox[1], result.data.geocode.boundingbox[3]]
				])
				callback()
			}).catch(error=>{
				console.error(error)
				callback()
			})
		}else{
			callback()
		}
	}

	async addPlace(){
		await navigate(`/place/add/`)
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

	render() {
		return (<>
			<SearchBar
				path="*"
				className="SearchBar"
				onStartSearch={this.startSearch}
				value={this.state.searchBarValue}
				sidebarIsOpen={this.state.sidebarIsOpen}
				onSetSidebarIsOpen={this.setSidebarIsOpen}
			/>

			{/*<InfoCard
				className="InfoCard"
				place={this.state.selectedPlace}
			/>*/}

			<Fab variant="extended" className="addNewFab" onClick={this.addPlace}>
				<AddIcon style={{marginRight:'8px'}} />
				Add a Place
			</Fab>

			<Router primary={false}>
				<PlaceSidebar
					path="/place/:placeID"
					className="Sidebar"
					onSetSearchBarValue={this.setSearchBarValue}
					onSetSidebarIsOpen={this.setSidebarIsOpen}
					onSetView={this.setView}
					onFlyTo={this.flyTo}
					onGetZoom={this.getZoom}
				/>
			</Router>
			
			<PageMap
				className="page"
				onSaveFunctions={(...attr)=>{this.saveFunctions('PageMap',...attr)}}
			/>
		</>)
	}
}