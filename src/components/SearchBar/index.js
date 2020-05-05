import React from 'react'
import './index.css'

import { Localized, withLocalization } from '../Localized/'
import { navigate } from '@reach/router'
import { withGlobals } from '../Globals/'
import { search as query_search } from '../../queries.js'

// import categories from '../../data/dist/categories.json'
import presets from '../../data/dist/presets.json'
import colors from '../../data/dist/colors.json'
import colorsByPreset from '../../data/dist/colorsByPreset.json'
import { getTranslationFromArray, getColorByPreset } from '../../functions.js'

import {
	Paper,
	InputBase,
	IconButton,
	Drawer,

	List,
	ListItem,
	ListItemIcon,
	ListItemText,

	CardContent,
	CardActions,
	Button,
	Typography,
	Link,
} from '@material-ui/core'

import {
	SearchRounded as SearchIcon,
	HourglassEmptyRounded as HourglassEmptyIcon,
	CloseRounded as CloseIcon,
	MenuRounded as MenuIcon,
} from '@material-ui/icons'

import MainDrawerContent from '../MainDrawerContent/'

class SearchBar extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			value: '',
			loadingSearchResult: false,
			isMainDrawerOpen: false,
			searchResults: [],
			showSearchResults: false,
			showWebsiteIntro: true,
		}

		this.searchInputRef = React.createRef()

		this.submitTheSearchQuery = this.submitTheSearchQuery.bind(this)
		this.saveSearchQueryText = this.saveSearchQueryText.bind(this)
		this.searchKeypressed = this.searchKeypressed.bind(this)
		this.closeSidebar = this.closeSidebar.bind(this)
		this.toggleMainDrawer = this.toggleMainDrawer.bind(this)

		this.loadSearchResults = this.loadSearchResults.bind(this)
		this.openSearchResult = this.openSearchResult.bind(this)
		this.closeIntro = this.closeIntro.bind(this)
	}

	componentDidMount() {
		if (this.props.value !== this.state.value) {
			this.setState({value: this.props.value})
		}
	}
	componentDidUpdate(prevProps, prevState, snapshot) {
		if (
			this.props.value !== prevProps.value &&
			this.props.value !== this.state.value
		) {
			this.setState({value: this.props.value})
		}
	}
	saveSearchQueryText(event){
		this.setState({value: event.target.value}, ()=>{
			this.loadSearchResults(this.state.value)
		})
	}

	openSearchResult(searchResult){
		this.setState({showSearchResults: false})

		if (!!searchResult.placeID) {
			navigate(`/view/${searchResult.placeID}/`)
		}

		if (!!searchResult.geometry.boundingbox) {
			this.props.globals.mainMapFunctions.flyToBounds([
				[
					searchResult.geometry.boundingbox.southwest.lat,
					searchResult.geometry.boundingbox.southwest.lng,
				],
				[
					searchResult.geometry.boundingbox.northeast.lat,
					searchResult.geometry.boundingbox.northeast.lng,
				]
			], {
				animate: true,
				duration: 1.5,
			})
			
			// this.props.globals.mainMapFunctions.setBounds([
			// 	[result.data.geocode.boundingbox[0], result.data.geocode.boundingbox[2]],
			// 	[result.data.geocode.boundingbox[1], result.data.geocode.boundingbox[3]]
			// ])
		}else if (!!searchResult.geometry.location) {
			const location = searchResult.geometry.location

			let zoomLevel = this.props.globals.mainMapFunctions.getZoom()
			if (zoomLevel < 17) {
				zoomLevel = 17
			}

			this.props.globals.mainMapFunctions.flyTo(
				(
					this.props.globals.isSmallScreen
					? location
					: this.props.globals.mainMapFunctions.unproject( this.props.globals.mainMapFunctions.project(location,zoomLevel).add([-200,0]), zoomLevel) // add sidebar offset
				),
				zoomLevel,
				{
					animate: true,
					duration: 1.5,
				}
			)
		}
	}

	loadSearchResults(queryString){
		if (queryString && queryString !== '' && queryString.length > 1 && /\S/.test(queryString)) {
			this.props.globals.graphql.query({
				// fetchPolicy: 'no-cache',
				query: query_search,
				variables: {
					query: queryString,
					languages: navigator.languages,
				},
			}).then(async result => {

				const searchResults = result.data.search.map(result => {
					const preset = result.preset
					return {
						...result,
						name_translated: getTranslationFromArray(result.name, this.props.globals.userLocales),
						
						___preset: (
							!!preset && !!presets[preset]
							? {
								key: preset,
								...presets[preset],
							}
							: presets.default
						),
						___color: (!!preset ? getColorByPreset(preset,colorsByPreset) : colors.default),

						key: JSON.stringify(result),
					}
				})

				this.setState({
					showSearchResults: true,
					loadingSearchResult: false,
					searchResults,
				})
			}).catch(error=>{
				this.setState({
					showSearchResults: false,
					loadingSearchResult: false,
					searchResults: [],
				})
				console.error(error)
			})
		}else{
			this.setState({
				showSearchResults: false,
				loadingSearchResult: false,
				searchResults: [],
			})
		}
	}

	submitTheSearchQuery(){
		if (this.props.onStartSearch) {
			this.searchInputRef.current.blur() // unfocus the input element
			this.setState({loadingSearchResult: true}, ()=>{
				this.loadSearchResults(this.state.value)
			})
		}
	}
	searchKeypressed(event){		
		if (event.key === 'Enter') {
			this.submitTheSearchQuery()
		}
	}

	async closeSidebar(){
		await navigate(`/`)

		this.setState({value: ''}, ()=>{
			if (this.props.onSetSidebarIsOpen) {
				this.props.onSetSidebarIsOpen(false)
			}
			if (this.props.onSetSearchBarValue) {
				this.props.onSetSearchBarValue('')
			}
		})
	}

	toggleMainDrawer(){
		this.setState((state,props)=>{
			return {isMainDrawerOpen:!state.isMainDrawerOpen}
		})
	}

	closeIntro(){
		this.setState({showWebsiteIntro: false})
	}

	render() {
		let leftIcon = undefined
		if (this.state.showSearchResults) {
			leftIcon = (
				<IconButton edge="end" style={{margin:'4px',padding:'10px'}} aria-label="close" onClick={this.hideSearchResults}>
					<ArrowBackIcon />
				</IconButton>
			)
		} else {
			leftIcon = (
				<IconButton edge="end" style={{margin:'4px',padding:'10px'}} aria-label="menu" onClick={this.toggleMainDrawer}>
					<MenuIcon />
				</IconButton>
			)
		}


		let rightIcon = undefined
		if (this.props.sidebarIsOpen) {
			rightIcon = (
				<IconButton style={{margin:'4px',padding:'10px'}} aria-label="close" onClick={this.closeSidebar}>
					<CloseIcon />
				</IconButton>
			)
		} else if (this.state.loadingSearchResult) {
			rightIcon = (
				<IconButton type="submit" style={{margin:'4px',padding:'10px'}}>
					<HourglassEmptyIcon />
				</IconButton>
			)
		}

		return (<div className={this.props.className}>
			<Drawer
				open={this.state.isMainDrawerOpen}
				onClose={this.toggleMainDrawer}
			>
				<MainDrawerContent />
			</Drawer>

			<Paper
				className={'header '+(this.props.sidebarIsOpen ? 'sidebarIsOpen' : '')}
				elevation={(this.props.sidebarIsOpen ? 6 : 6)}
				variant="elevation"
			>
				<InputBase
					style={{
						height: '52px',
						padding: '', // '0 4px 0 16px', // '0 4px',
						flex: 1,
					}}
					value={this.state.value}
					placeholder={this.props.getString('search-for-qeerness')}
					onChange={this.saveSearchQueryText}
					onKeyPress={this.searchKeypressed}

					disabled={this.props.sidebarIsOpen}

					inputRef={this.searchInputRef}
				/>
			</Paper>
					{leftIcon}
					{rightIcon}
				<div className="searchResults">
					<List>
					{
						this.state.searchResults.map(result => {
							return (<ListItem button key={result.key} onClick={()=>this.openSearchResult(result)}>
								<ListItemIcon>
									<div
										className="material-icons-round"
										style={{
											color: (result.___preset.icon ? result.___color.fg : ''),
											backgroundColor: (result.___preset.icon ? result.___color.bg : ''),
											borderRadius: '100%',
											width: '40px',
											height: '40px',
											lineHeight: '40px',
											textAlign: 'center',
										}}
									>{result.___preset.icon}</div>
								</ListItemIcon>
								<ListItemText primary={result.name_translated} secondary={result.address}/>
							</ListItem>)
						})
					}
					</List>
				</div>
				<div className="websiteIntro">
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

						{/*
							We're saving some data on your computer. This only data like the map position. We're gonna ask you for permission before saving identifying data that is send to our servers.
						*/}
					</CardContent>
					<CardActions>
						<Button onClick={this.closeIntro}>
							<Localized id="close-button" />
						</Button>
					</CardActions>
					{/*<CardActions>
						<Button>Learn more</Button> <Button>Add a Place</Button>
					</CardActions>*/}
				</div>
			</Paper>
		</div>)
	}
}

export default withGlobals(withLocalization(SearchBar))



/*
	<Card>
	Start Info:

	Where can I meet queer people in my town?
	Where is the next queer-youth-center?
	
	Help us answer these questions!

	Add queer-infos about places around you.

	-----

	Info about who supports the project or which services/libraries/tools are used:
	Mapbox, OSM, Overpass, GitHub, Firebase
	</Card>
*/


