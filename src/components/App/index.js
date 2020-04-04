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

import { createMuiTheme, ThemeProvider, StylesProvider } from '@material-ui/core/styles';
// import { CssBaseline } from '@material-ui/core'

import {
	Link,
	// Fab,
	// Drawer,
	Typography,

	Card,
	// CardActions,
	// CardActionArea,
	CardContent,
	// Divider,
	// Button,
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

const defaultTheme = createMuiTheme({
	palette: {
		tonalOffset: 0.05,
	},
})

export default class App extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			searchBarValue: '',
			sidebarIsOpen: false,
			doc: null,
			prefersDarkMode: false,

			filters: {
				presets: [],
			},
			theme: defaultTheme,
		}

		this.functions = {}

		this.startSearch = this.startSearch.bind(this)
		this.setSearchBarValue = this.setSearchBarValue.bind(this)
		this.setSidebarIsOpen = this.setSidebarIsOpen.bind(this)
		this.addPlace = this.addPlace.bind(this)
		this.loadAndViewDoc = this.loadAndViewDoc.bind(this)
		this.filtersChanged = this.filtersChanged.bind(this)
		this.startDarkThemeListener = this.startDarkThemeListener.bind(this)
		this.setTheme = this.setTheme.bind(this)

		this.setView = this.setView.bind(this)
		this.flyTo = this.flyTo.bind(this)
		this.getZoom = this.getZoom.bind(this)
	}

	componentDidMount(){
		this.startDarkThemeListener()
	}

	setTheme(prefersDarkMode){
		// prefersDarkMode = false

		const background_paper = prefersDarkMode ? '#202020' : '#ffffff'
		const background_default = prefersDarkMode ? '#181818' : '#f9f9f9'

		const secondary_main = prefersDarkMode ? '#448aff' : '#2962ff' // A200_A700

		const theme = createMuiTheme({
			palette: {
				type: prefersDarkMode ? 'dark' : 'light',
				primary: {
					main: '#fff', // this.state.prefersDarkMode ? '#000' : '#fff' // '#fff'
				},
				secondary: {
					main: secondary_main,
				},
				action: {
					active: prefersDarkMode ? '#fff' : '#000',
				},
				background: {
					paper: background_paper,
					default: background_default,
				},
				tonalOffset: 0.05,
			},
			shape: {
				borderRadius: 8,
			},
			transitions: {
				duration: {
					complex: 200, // 375,
					enteringScreen: 200, // 225,
					leavingScreen: 200, // 195,
					short: 200, // 250,
					shorter: 200, // 200,
					shortest: 200, // 150,
					standard: 200, // 300,
				},
				easing: {
					easeIn: "ease", // "cubic-bezier(0.4, 0, 1, 1)",
					easeInOut: "ease", // "cubic-bezier(0.4, 0, 0.2, 1)"
					easeOut: "ease", // "cubic-bezier(0.0, 0, 0.2, 1)",
					sharp: "ease", // "cubic-bezier(0.4, 0, 0.6, 1)",
				},
			},
			overrides: {
				MuiLink: {
					root: {
						color: secondary_main,
					}
				},
				MuiFab: {
					root: {
						backgroundColor: background_paper,
						color: defaultTheme.palette.getContrastText(background_paper),
						transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
						'&:hover': {
							backgroundColor: background_default,
							color: defaultTheme.palette.getContrastText(background_paper),
						},
					},
					secondary: {
						backgroundColor: defaultTheme.palette.getContrastText(background_paper),
						color: background_paper,
						transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
						'&:hover': {
							backgroundColor: defaultTheme.palette.getContrastText(background_paper),
							color: background_default,
						},
					},
				},
			},
		})

		this.setState({theme})
	}
	startDarkThemeListener(){
		// https://react-theming.github.io/create-mui-theme
		// https://material.io/resources/color/#!/?view.left=0&view.right=0&primary.color=FAFAFA&secondary.color=263238

		if (!!window.matchMedia) {
			const checker = event => {
				if(event.matches) {
					this.setTheme(true)
				} else {
					this.setTheme(false)
				}
			}
			const matcher = window.matchMedia('(prefers-color-scheme: dark)')
		
			checker(matcher)
			matcher.addListener(checker)
		}else{
			this.setTheme(false)
		}
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
			<ThemeProvider theme={this.state.theme}>
			<StylesProvider injectFirst>
			
			<SearchBar
				className="SearchBar"
				onStartSearch={this.startSearch}
				value={this.state.searchBarValue}
				sidebarIsOpen={this.state.sidebarIsOpen}
				onSetSidebarIsOpen={this.setSidebarIsOpen}
				onSetSearchBarValue={this.setSearchBarValue}
			/>

			<Card className="introCard" elevation={6}>
				<CardContent>
					<Typography variant="h6" component="h1" gutterBottom>Welcome to the QueerMap!</Typography>

					<Typography variant="body2" color="textSecondary" gutterBottom>
						A map of LGBTQ places, collected by people like you.
					</Typography>
					<Typography variant="body2" color="textSecondary">
						Many thanks to <Link href="https://www.mapbox.com/community/" target="_blank" rel="noreferrer">Mapbox</Link> for donating map-resources!
					</Typography>
				</CardContent>
				{/*<CardActions>
					<Button>Learn more</Button> <Button>Add a Place</Button>
				</CardActions>*/}
			</Card>

			{/*<Card>
				Start Info:

				Where can I meet queer people in my town?
				Where is the next queer-youth-center?
				
				Help us answer these questions!

				Add queer-infos about places around you.

				-----

				Info about who supports the project or which services/libraries/tools are used:
				Mapbox, OSM, Overpass, GitHub, Firebase
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
			
		</StylesProvider>
		</ThemeProvider>
		</>)
	}
}