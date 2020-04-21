import React from 'react'
import './index.css'

// import {gql} from 'apollo-boost'
import {Router,navigate} from '@reach/router'
import { search as query_search } from '../../queries.js'

// import categories from '../../data/dist/categories.json'
// import presets from '../../data/dist/presets.json'
// import colors from '../../data/dist/colors.json'
// import colorsByPreset from '../../data/dist/colorsByPreset.json'

import { Localized/*, withLocalization*/ } from '../Localized/'

import { createMuiTheme, ThemeProvider, StylesProvider } from '@material-ui/core/styles';
// import { CssBaseline } from '@material-ui/core'

import {
	Link,
	Fab,
	// Drawer,
	Typography,

	Card,
	CardActions,
	// CardActionArea,
	CardContent,
	// Divider,
	Button,
} from '@material-ui/core'
import {
	AddRounded as AddIcon,
	// FilterList as FilterListIcon,
	// ExpandLess as ExpandLessIcon,
} from '@material-ui/icons'

import MainMap from '../MainMap/'
import SearchBar from '../SearchBar/'
import Sidebar from '../Sidebar/'
import FiltersPanelContent from '../FiltersPanelContent/'

import 'typeface-roboto'

const defaultTheme = createMuiTheme({
	palette: {
		type: 'light',
		primary: {
			main: '#fff',
		},
		secondary: {
			main: '#000',
		},
		action: {
			active: '#000',
		},
		background: {
			paper: '#ffffff',
			default: '#f9f9f9',
		},
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

			introIsOpen: true,

			filters: {
				presets: [],
			},
			theme: defaultTheme,

			isSmallScreen: false,
		}

		this.functions = {}

		this.startSearch = this.startSearch.bind(this)
		this.setSearchBarValue = this.setSearchBarValue.bind(this)
		this.setSidebarIsOpen = this.setSidebarIsOpen.bind(this)
		this.addPlace = this.addPlace.bind(this)
		this.filtersChanged = this.filtersChanged.bind(this)
		this.setTheme = this.setTheme.bind(this)
		this.closeIntro = this.closeIntro.bind(this)

		this.check_color_scheme = this.check_color_scheme.bind(this)
		this.check_small_screen = this.check_small_screen.bind(this)

		this.setView = this.setView.bind(this)
		this.flyTo = this.flyTo.bind(this)
		this.getZoom = this.getZoom.bind(this)
	}

	pretendToSearch(){
		this.setSearchBarValue('Los Angeles')
		this.startSearch('Los Angeles',()=>{
			setTimeout(()=>{
				this.functions['MainMap'].zoomIn()
				this.addPlace()
			}, 1500)
		})
	}

	componentDidMount(){
		// this.pretendToSearch()
		// this.addPlace()

		if (!!window.matchMedia) {
			// https://react-theming.github.io/create-mui-theme
			// https://material.io/resources/color/#!/?view.left=0&view.right=0&primary.color=FAFAFA&secondary.color=263238

			this.matcher_color_scheme = window.matchMedia('(prefers-color-scheme: dark)')
			this.matcher_color_scheme.addListener(this.check_color_scheme)
			this.check_color_scheme(this.matcher_color_scheme)

			this.matcher_small_screen = window.matchMedia('(min-width: 800px)')
			this.matcher_small_screen.addListener(this.check_small_screen)
			this.check_small_screen(this.matcher_small_screen)
		}else{
			this.setTheme(false)
		}
	}
	componentWillUnmount(){
		if (!!window.matchMedia) {
			this.matcher_color_scheme.removeListener(this.check_color_scheme)
			this.matcher_small_screen.removeListener(this.check_small_screen)
		}
	}

	setTheme(prefersDarkMode){
		// prefersDarkMode = window.env_local_ip !== '' ? false : prefersDarkMode

		const background_paper = prefersDarkMode ? '#202020' : '#ffffff'
		const background_default = prefersDarkMode ? '#181818' : '#f9f9f9'

		const secondary_main = prefersDarkMode ? '#448aff' : '#2962ff' // A200_A700

		const error_main = prefersDarkMode ? '#f44' : '#e00'

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
				error: {
					main: error_main,
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
						transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
						'&:hover': {
							opacity: 0.8,
							backgroundColor: defaultTheme.palette.getContrastText(background_paper),
							color: background_default,
						},
					},
				},
			},
		})

		this.setState({theme})
	}
	check_color_scheme(event){
		if(event.matches) {
			this.setTheme(true)
		} else {
			this.setTheme(false)
		}
	}
	check_small_screen(event){
		if (event.matches) {
			window.isSmallScreen = false
		}else{
			window.isSmallScreen = true
		}

		this.setState((state, props) => {
			if (window.isSmallScreen !== state.isSmallScreen) {
				return {isSmallScreen: window.isSmallScreen}
			}
			return undefined
		})
		
		// const viewport_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
	}

	closeIntro(){
		this.setState({introIsOpen: false})
	}

	saveFunctions(componentName, functionsObject){
		this.functions[componentName] = functionsObject
	}

	setSearchBarValue(value){
		this.setState({searchBarValue:value})
	}

	setSidebarIsOpen(value){
		// const center = this.functions['MainMap'].getCenter()
		// const zoom = this.functions['MainMap'].getZoom()

		window.sidebarIsOpen = value

		this.setState({
			mapIsResizing: true,
			sidebarIsOpen: value,
		}, ()=>{
			setTimeout(()=>{
				this.setState({mapIsResizing: false})
			}, 300)
			// this.check_small_screen()

			// if (new Date()*1 - window.pageOpenTS*1 > 2000) {
			// 	// this.functions['MainMap'].invalidateSize()
			// 	setTimeout(()=>{
			// 		// const center2 = this.functions['MainMap'].getCenter()
			// 		this.functions['MainMap'].flyTo(center, Math.round(zoom), {
			// 			animate: true,
			// 			duration: 1.5,
			// 		})
			// 		// this.functions['MainMap'].invalidateSize()
			// 	}, 500)
			// }

			// if (new Date()*1 - window.pageOpenTS*1 < 2000) {
			// 	this.functions['MainMap'].panTo(center, {
			// 		animate: true,
			// 		duration: 5,
			// 	})
			// }else{
			// 	this.functions['MainMap'].panTo(
			// 		this.functions['MainMap'].getCenter(), {
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
				variables: {
					// languages: navigator.languages,
					query: queryString,
				},
			}).then(async result => {
				await navigate(`/`)

				this.functions['MainMap'].flyToBounds([
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

				// this.functions['MainMap'].setBounds([
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
		return this.functions['MainMap'].setView(...attr)
	}
	flyTo(...attr){
		return this.functions['MainMap'].flyTo(...attr)
	}
	getZoom(...attr){
		return this.functions['MainMap'].getZoom(...attr)
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

			<Card
				className={`introCard ${this.state.introIsOpen ? 'open' : 'closed'}`}
				elevation={6}
			>
				<CardContent>
					<Typography variant="h6" component="h1" gutterBottom>
						<Localized id="welcome-heading" />
					</Typography>

					<Typography variant="body2" color="textSecondary" gutterBottom>
						<Localized id="project-summary" />
					</Typography>

					<Typography variant="body2" color="textSecondary" style={{marginTop:'8px'}}>
						<Localized
							id="tiny-thanks"
							elems={{
								mapbox_link: <Link href="https://www.mapbox.com/community/" target="_blank" rel="noreferrer"></Link>,
							}}
						></Localized>
					</Typography>
				</CardContent>
				<CardActions>
					<Button onClick={this.closeIntro}>
						<Localized id="close-button" />
					</Button>
				</CardActions>
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

			{
				this.state.isSmallScreen
				? undefined
				: (<Fab
					variant="extended"
					color="secondary"
					className="addNewFab"
					onClick={()=>navigate('/add/')}
				>
					<AddIcon style={{color:'var(--light-green)',marginRight:'8px'}} />
					<Localized id="add-place-fab" />
				</Fab>)
			}

			<div className="filtersPanel">
				<FiltersPanelContent onChange={this.filtersChanged}/>
			</div>

			<Router primary={false}>
				<Sidebar
					path="/place/:docID"
					
					className="Sidebar"

					onSetSearchBarValue={this.setSearchBarValue}
					onSetSidebarIsOpen={this.setSidebarIsOpen}

					onSetView={this.setView}
					onFlyTo={this.flyTo}
					onGetZoom={this.getZoom}
					onFunctions={(...attr)=>{this.saveFunctions('Sidebar',...attr)}}
				/>
			</Router>
			
			<MainMap
				className={`page ${this.state.sidebarIsOpen ? 'sidebarIsOpen' : ''}`}
				onFunctions={(...attr)=>{this.saveFunctions('MainMap',...attr)}}
				filters={this.state.filters}
				mapIsResizing={this.state.mapIsResizing}
				sidebarIsOpen={this.state.sidebarIsOpen}
			/>
			
		</StylesProvider>
		</ThemeProvider>
		</>)
	}
}