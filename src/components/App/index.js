import React, { useEffect, lazy, Suspense } from 'react'
import './index.css'

import { Router, navigate } from '@reach/router'

// import categories from '../../data/dist/categories.json'
// import presets from '../../data/dist/presets.json'
// import colors from '../../data/dist/colors.json'
// import colorsByPreset from '../../data/dist/colorsByPreset.json'

import { /*Localized,*/ withLocalization } from '../Localized/'

import { withGlobals } from '../Globals/'

import { createMuiTheme, ThemeProvider, StylesProvider } from '@material-ui/core/styles'
// import { CssBaseline } from '@material-ui/core'

import {
	Fab,
	Drawer,
} from '@material-ui/core'
import {
	CloseRounded as CloseIcon,
	MenuRounded as MenuIcon,
	// FilterList as FilterListIcon,
	// ExpandLess as ExpandLessIcon,
} from '@material-ui/icons'

import MainMap from '../MainMap/'
// import SearchBar from '../SearchBar/'
// import Sidebar from '../Sidebar/'
// import MainDrawerContent from '../MainDrawerContent/'


// const MainMap = lazy(() => import('../MainMap'))
const SearchBar = lazy(() => import('../SearchBar'))
const Sidebar = lazy(() => import('../Sidebar'))
const MainDrawerContent = lazy(() => import('../MainDrawerContent'))





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

function HandlePath(props) {
	const action = props.action || ''
	const docID = props.docID || ''
	const onPathChanged = props.onPathChanged

	useEffect(function(){
		if (!!onPathChanged) {
			onPathChanged({
				action,
				docID,
			})
		}
	}, [action, docID, onPathChanged])

	return null
}

class App extends React.Component {
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

			isSmallScreen: false,

			action: '',
			docID: '',

			isMainDrawerOpen: false,
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
		this.onPathChanged = this.onPathChanged.bind(this)

		this.closeMainDrawer = this.closeMainDrawer.bind(this)
		this.toggleMainDrawer = this.toggleMainDrawer.bind(this)

		this.closeSidebar = this.closeSidebar.bind(this)
	}

	componentDidMount(){
		if (!!window.matchMedia) {
			// https://react-theming.github.io/create-mui-theme
			// https://material.io/resources/color/#!/?view.left=0&view.right=0&primary.color=FAFAFA&secondary.color=263238

			this.matcher_color_scheme = window.matchMedia('(prefers-color-scheme: dark)')
			this.matcher_color_scheme.addListener(this.check_color_scheme)
			this.check_color_scheme(this.matcher_color_scheme)

			this.matcher_small_screen = window.matchMedia('(min-width: 600px)')
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
			typography: {
				fontFamily: [
					'Ubuntu',
					'Helvetica',
					'Arial',
					'sans-serif',
					'"Apple Color Emoji"',
					'"Segoe UI Emoji"',
					'"Segoe UI Symbol"',
				].join(','),
				h1: {
					fontSize: '98px',
					fontWeight: 'light',
					letterSpacing: '-1.5px',
				},
				h2: {
					fontSize: '61px',
					fontWeight: 'light',
					letterSpacing: '-0.5px',
				},
				h3: {
					fontSize: '49px',
					fontWeight: 'normal',
					letterSpacing: '0px',
				},
				h4: {
					fontSize: '35px',
					fontWeight: 'normal',
					letterSpacing: '0.25px',
				},
				h5: {
					fontSize: '24px',
					fontWeight: 'normal',
					letterSpacing: '0px',
				},
				h6: {
					fontSize: '20px',
					fontWeight: 'medium',
					letterSpacing: '0.015px',
					// letterSpacing: '0.15px',
				},
				subtitle1: {
					fontSize: '16px',
					fontWeight: 'normal',
					letterSpacing: '0.15px',
				},
				subtitle2: {
					fontSize: '14px',
					fontWeight: 'medium',
					letterSpacing: '0.1px',
				},
				body1: {
					fontSize: '16px',
					fontWeight: 'normal',
					letterSpacing: '0.01px',
					// letterSpacing: '0.5px',
				},
				body2: {
					fontSize: '14px',
					fontWeight: 'normal',
					letterSpacing: '0.01px',
					// letterSpacing: '0.25px',
				},
				button: {
					fontSize: '14px',
					fontWeight: 'medium',
					letterSpacing: '0.25px',
					// letterSpacing: '1.25px',
				},
				caption: {
					fontSize: '12px',
					fontWeight: 'normal',
					letterSpacing: '0.4px',
				},
				overline: {
					fontSize: '10px',
					fontWeight: 'normal',
					letterSpacing: '1.5px',
				},
			},
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
				MuiInputLabel: {
					'root': {
						textOverflow: 'ellipsis',
						overflow: 'hidden',
						whiteSpace: 'nowrap',
						right: '16px',
						height: '100%',
					},
				},
				
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
		// this.setState({searchBarValue:value})
	}

	setSidebarIsOpen(value){
		// const center = this.functions['MainMap'].getCenter()
		// const zoom = this.functions['MainMap'].getZoom()

		this.props.globals.sidebarIsOpen = value

		this.functions['MainMap'].setPadding({
			left: (value ? 400 : 0),
		})

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
		this.setState((state, props) => ({
			filters:{
				...state.filters,
				...newFilters,
			}
		}))
	}

	dontFilterTheseIds(ids){
		this.setState((state, props) => ({
			filters:{
				...state.filters,
				ids,
			}
		}))
	}

	onPathChanged(pathVars){
		this.setState(pathVars)
	}

	closeMainDrawer(){
		this.setState({isMainDrawerOpen:false})
	}
	toggleMainDrawer(){
		this.setState((state,props)=>{
			return {isMainDrawerOpen:!state.isMainDrawerOpen}
		})
	}

	async closeSidebar(){
		await navigate(`/`)
		this.dontFilterTheseIds([])
		this.setSidebarIsOpen(false)
	}

	render() {
		return (<div
			className={
				'appClassWrapper '
				+(this.state.sidebarIsOpen ? 'sidebarIsOpen ' : 'sidebarIsClosed')
			}
		>
			<ThemeProvider theme={this.state.theme}>
			<StylesProvider injectFirst>

			<Router primary={false}>
				<HandlePath
					path="/:action/*docID"
					onPathChanged={this.onPathChanged}
				/>
				<HandlePath
					path="/"
					onPathChanged={this.onPathChanged}
				/>
			</Router>


			<Drawer
				open={this.state.isMainDrawerOpen}
				onClose={this.toggleMainDrawer}
			>
				<Suspense fallback={this.props.globals.renderLazyLoader()}>
					<MainDrawerContent onClose={this.closeMainDrawer}/>
				</Suspense>
			</Drawer>

			{/*<Fab
				aria-label={this.props.getString('open_menu_aria_label')}
				title={this.props.getString('open_menu_aria_label')}
				variant="extended"
				className="mainMenuFab"
				onClick={this.toggleMainDrawer}
			>
				<MenuIcon style={{marginRight:'8px'}} />
				QueerMap <Localized
					id="by_brandname_link"
					elems={{
						mainlink: null,
					}}
				/>
			</Fab>*/}


			<Fab
				aria-label={this.props.getString('open_menu_aria_label')}
				title={this.props.getString('open_menu_aria_label')}
				variant="round"
				size="medium"
				className="mainMenuFab"
				onClick={this.toggleMainDrawer}
			>
				<MenuIcon />
			</Fab>

			<Fab
				aria-label={this.props.getString('close_sidebar_aria_label')}
				title={this.props.getString('close_sidebar_aria_label')}
				variant="extended"
				className="closeSidebarFab"
				onClick={this.closeSidebar}
				style={{
					display: (this.state.sidebarIsOpen ? 'flex' : 'none'),
				}}
			>
				<CloseIcon />
			</Fab>


			<Suspense fallback={this.props.globals.renderLazyLoader()}>

			<SearchBar
				className="SearchBar"
				value={this.state.searchBarValue}
				sidebarIsOpen={this.state.sidebarIsOpen}
				onSetSidebarIsOpen={this.setSidebarIsOpen}
				onSetSearchBarValue={this.setSearchBarValue}
				onDontFilterTheseIds={this.dontFilterTheseIds}
			/>

			<Sidebar
				action={this.state.action}
				docID={this.state.docID}

				className="Sidebar"

				onSetSearchBarValue={this.setSearchBarValue}
				onSetSidebarIsOpen={this.setSidebarIsOpen}

				onSetView={this.setView}
				onFlyTo={this.flyTo}
				onGetZoom={this.getZoom}

				onDontFilterTheseIds={this.dontFilterTheseIds}
			/>
			
			</Suspense>
			
			<MainMap
				className={`page ${this.state.sidebarIsOpen ? 'sidebarIsOpen' : ''}`}
				onFunctions={(...attr)=>{this.saveFunctions('MainMap',...attr)}}
				filters={this.state.filters}
				mapIsResizing={this.state.mapIsResizing}
				sidebarIsOpen={this.state.sidebarIsOpen}
				onFiltersChanged={this.filtersChanged}
			/>

		</StylesProvider>
		</ThemeProvider>
		</div>)
	}
}

export default withGlobals(withLocalization(App))