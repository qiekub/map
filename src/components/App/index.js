import React from 'react'
import './index.css'

import { Router, navigate } from '@reach/router'

// import categories from '../../data/dist/categories.json'
// import presets from '../../data/dist/presets.json'
// import colors from '../../data/dist/colors.json'
// import colorsByPreset from '../../data/dist/colorsByPreset.json'

import { Localized/*, withLocalization*/ } from '../Localized/'

import { withGlobals } from '../Globals/'

import { createMuiTheme, ThemeProvider, StylesProvider } from '@material-ui/core/styles';
// import { CssBaseline } from '@material-ui/core'

import {
	Fab,
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

class App extends React.Component {
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

		this.setSearchBarValue = this.setSearchBarValue.bind(this)
		this.setSidebarIsOpen = this.setSidebarIsOpen.bind(this)
		this.filtersChanged = this.filtersChanged.bind(this)
		this.setTheme = this.setTheme.bind(this)

		this.check_color_scheme = this.check_color_scheme.bind(this)
		this.check_small_screen = this.check_small_screen.bind(this)

		this.setView = this.setView.bind(this)
		this.flyTo = this.flyTo.bind(this)
		this.getZoom = this.getZoom.bind(this)

		this.dontFilterTheseIds = this.dontFilterTheseIds.bind(this)
	}

	componentDidMount(){
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
			this.props.globals.isSmallScreen = false
		}else{
			this.props.globals.isSmallScreen = true
		}

		this.setState((state, props) => {
			if (this.props.globals.isSmallScreen !== state.isSmallScreen) {
				return {isSmallScreen: this.props.globals.isSmallScreen}
			}
			return undefined
		})
		
		// const viewport_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
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

		this.props.globals.sidebarIsOpen = value

		this.setState({
			mapIsResizing: true,
			sidebarIsOpen: value,
		}, ()=>{
			setTimeout(()=>{
				this.setState({mapIsResizing: false})
			}, 300)
			// this.check_small_screen()

			// if (new Date()*1 - this.props.globals.pageOpenTS*1 > 2000) {
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

			// if (new Date()*1 - this.props.globals.pageOpenTS*1 < 2000) {
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
				value={this.state.searchBarValue}
				sidebarIsOpen={this.state.sidebarIsOpen}
				onSetSidebarIsOpen={this.setSidebarIsOpen}
				onSetSearchBarValue={this.setSearchBarValue}
			/>

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
					path="/:action/*docID"
					
					className="Sidebar"

					onSetSearchBarValue={this.setSearchBarValue}
					onSetSidebarIsOpen={this.setSidebarIsOpen}

					onSetView={this.setView}
					onFlyTo={this.flyTo}
					onGetZoom={this.getZoom}
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

export default withGlobals(App)