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
	Icon,
	Paper,
	InputBase,
	IconButton,

	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	ListSubheader,

	CardActions,
	Button,
	Typography,
	Link,
} from '@material-ui/core'

import {
	AlternateEmailRounded as AlternateEmailIcon,
	AddRounded as AddIcon,
	SearchRounded as SearchIcon,
	HourglassEmptyRounded as HourglassEmptyIcon,
	ArrowBackRounded as ArrowBackIcon,
} from '@material-ui/icons'

import ActionBar from '../ActionBar/'



class SearchBar extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			value: '',
			loadingSearchResult: false,
			searchResults_poi: [],
			searchResults_administratives: [],
			searchResults_address: [],
			showSearchResults: false,
			showWebsiteIntro: true,
			searchBarIsFocused: false,
		}

		this.actions = [
			{
				icon: <AddIcon />,
				title: 'add_place',
				onClick: () => {
					navigate('/add/')
				}
			},
			{
				icon: <AlternateEmailIcon />,
				title: 'give_feedback',
				onClick: () => {
					window.open('mailto:thomas.rosen@qiekub.org', '_self')
				}
			},
		]

		this.searchInputRef = React.createRef()

		this.saveSearchQueryText = this.saveSearchQueryText.bind(this)
		this.searchKeypressed = this.searchKeypressed.bind(this)

		this.loadSearchResults = this.loadSearchResults.bind(this)
		this.openSearchResult = this.openSearchResult.bind(this)

		this.acceptEssentialPrivacyAndCloseIntro = this.acceptEssentialPrivacyAndCloseIntro.bind(this)
		this.hideSearchResults = this.hideSearchResults.bind(this)

		this.startSearchFromIcon = this.startSearchFromIcon.bind(this)

		this.gainedFocus = this.gainedFocus.bind(this)
		this.lostFocus = this.lostFocus.bind(this)

		this.focusSearchField = this.focusSearchField.bind(this)
	}

	componentDidMount() {
		if (this.props.value !== this.state.value) {
			this.setState({value: this.props.value})
		}

		const privacy_consent_essentials = this.props.store.getPrivacy(null)
		const showWebsiteIntro = this.props.store.get('showWebsiteIntro')
		if (privacy_consent_essentials && !showWebsiteIntro) {
			this.setState({showWebsiteIntro: false})
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
			if (this.props.globals.mainMapFunctions.getMapType() === 'mapbox') {

				let padding = 128
				if (this.props.globals.isSmallScreen) {
					padding = 64
				}

				this.props.globals.mainMapFunctions.fitBounds([
					[
						searchResult.geometry.boundingbox.southwest.lng,
						searchResult.geometry.boundingbox.southwest.lat,
					],
					[
						searchResult.geometry.boundingbox.northeast.lng,
						searchResult.geometry.boundingbox.northeast.lat,
					]
				], {
					padding: {
						top: padding,
						right: padding,
						bottom: 116+padding,
						left: (this.props.sidebarIsOpen ? 400+padding : padding)
					},
				})

			}else{
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
			}
		}else if (!!searchResult.geometry.location) {
			const location = searchResult.geometry.location

			let zoomLevel = this.props.globals.mainMapFunctions.getZoom()
			if (zoomLevel < 17) {
				zoomLevel = 17
			}

			if (this.props.globals.mainMapFunctions.getMapType() === 'mapbox') {
				this.props.globals.mainMapFunctions.flyTo({
					center: location,
					zoom: zoomLevel,
					padding: {
						left: (this.props.globals.isSmallScreen ? 0 : 400),
					},
				})
			}else{
				this.props.globals.mainMapFunctions.flyTo(
					(
						this.props.globals.isSmallScreen
						? location
						: this.props.globals.mainMapFunctions.unproject(
								this.props.globals.mainMapFunctions
								.project(location,zoomLevel)
								.add([-200,0]),
								zoomLevel
							) // add sidebar offset
					),
					zoomLevel,
					{
						animate: true,
						duration: 1.5,
					},
				)
			}
		}
	}

	loadSearchResults(queryString){
		return new Promise((resolve,reject) => {
			if (queryString && queryString !== '' && queryString.length > 1 && /\S/.test(queryString)) {
				this.props.globals.graphql.query({
					// fetchPolicy: 'no-cache',
					query: query_search,
					variables: {
						query: queryString,
						languages: navigator.languages,
					},
				}).then(async result => {
					if (result.data.search.query === this.state.value) {
						const searchResults = JSON.parse(JSON.stringify(result.data.search.results)).map(result => {
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

						const searchResults_poi = searchResults.filter(result =>
							result.preset !== 'address'
							&& result.preset !== 'boundary/administrative'
						)
						const searchResults_administratives = searchResults.filter(result => result.preset === 'boundary/administrative')
						const searchResults_address = searchResults.filter(result => result.preset === 'address')

						this.setState({
							showSearchResults: true,
							loadingSearchResult: false,
							searchResults_poi,
							searchResults_administratives,
							searchResults_address,
						}, () => resolve() )
					}else{
						reject(new Error('The search-result was received slower than typed!'))
					}
				}).catch(error => {
					this.setState({
						showSearchResults: false,
						loadingSearchResult: false,
						searchResults_poi: [],
						searchResults_administratives: [],
						searchResults_address: [],
					}, () => reject(error))
				})
			}else{
				this.setState({
					showSearchResults: false,
					loadingSearchResult: false,
					searchResults_poi: [],
					searchResults_administratives: [],
					searchResults_address: [],
				}, () => reject('Error in loadSearchResults(): The state could not be set.'))
			}
		})
		.catch(error => console.warn(error))
	}

	searchKeypressed(event){
		if (event.key === 'Enter') {
			this.searchInputRef.current.blur() // unfocus the input element
			this.setState({loadingSearchResult: true}, ()=>{
				this.loadSearchResults(this.state.value).finally(()=>{
					if (this.state.searchResults_address.length > 0) {
						this.openSearchResult(this.state.searchResults_address[0])
					} else if (this.state.searchResults_poi.length > 0) {
						this.openSearchResult(this.state.searchResults_poi[0])
					} else if (this.state.searchResults_administratives.length > 0) {
						this.openSearchResult(this.state.searchResults_administratives[0])
					}
				})
			})
		}
	}

	acceptEssentialPrivacyAndCloseIntro(){
		this.props.store.setPrivacy(null, true).finally(()=>{
			this.props.store.set('showWebsiteIntro', false)
			this.setState({showWebsiteIntro: false})
		})
	}

	hideSearchResults(){
		this.setState({showSearchResults: false})
	}

	focusSearchField(){
		this.searchInputRef.current.focus()
	}

	startSearchFromIcon(){
		this.searchInputRef.current.blur() // unfocus the input element
		this.setState({loadingSearchResult: true}, ()=>{
			this.loadSearchResults(this.state.value).finally(()=>{
				if (this.state.searchResults_address.length > 0) {
					this.openSearchResult(this.state.searchResults_address[0])
				} else if (this.state.searchResults_poi.length > 0) {
					this.openSearchResult(this.state.searchResults_poi[0])
				} else if (this.state.searchResults_administratives.length > 0) {
					this.openSearchResult(this.state.searchResults_administratives[0])
				}
			})
		})
	}

	gainedFocus(event){
		this.setState({searchBarIsFocused: true})
		this.saveSearchQueryText(event)
	}
	lostFocus(){
		this.setState({searchBarIsFocused: false})
	}

	render() {
		let leftIcon = undefined
		if (this.state.showSearchResults) {
			leftIcon = (
				<IconButton edge="end" style={{margin:'4px',padding:'10px'}} onClick={this.hideSearchResults} aria-label={this.props.getString('close_search_results_aria_label')} title={this.props.getString('close_search_results_aria_label')}>
					<ArrowBackIcon />
				</IconButton>
			)
		} else {
			leftIcon = (
				<IconButton edge="end" style={{margin:'4px',padding:'10px'}} onClick={this.focusSearchField}>
					<SearchIcon />
				</IconButton>
			)
		}


		let rightIcon = (
			<div style={{
				width: '16px',
			}}></div>
		)
		if (this.state.loadingSearchResult) {
			rightIcon = (
				<Icon style={{margin:'4px',padding:'10px'}}>
					<HourglassEmptyIcon />
				</Icon>
			)
		}

		const showingSearchResults = (
			this.state.showSearchResults
			&& (
				this.state.searchResults_poi.length > 0
				|| this.state.searchResults_administratives.length > 0
				|| this.state.searchResults_address.length > 0
			)
		)

		const showingWebsiteIntro = (
			!this.state.showSearchResults
			&& this.state.showWebsiteIntro
		)

		return (<div className={this.props.className}>

			<Paper
				className={
					'header blurredBG '
					+(showingWebsiteIntro ? 'showingWebsiteIntro' : '')
				}
				elevation={6}
				variant="elevation"
				style={{
					margin: '8px 0 0 0',

					display: (
						showingWebsiteIntro
						? 'block'
						: 'none'
					),
				}}
			>
				<div className="scrollWrapper websiteIntro">
					<List>
						<ListItem alignItems="flex-start">
							<ListItemIcon>
								<div className="emojiIcon">{this.props.getString('welcome_emoji_icon')}</div>
							</ListItemIcon>
							<ListItemText
								primary={this.props.getString('welcome_heading')}
								secondary={this.props.getString('project-summary')}
							/>
						</ListItem>

						<ListItem alignItems="flex-start">
							<ListItemIcon>
								<div className="emojiIcon">{this.props.getString('thanks_emoji_icon')}</div>
							</ListItemIcon>
							<ListItemText
								primary={this.props.getString('thanks_heading')}
								secondary={
									<Localized
										id="thanks_text"
										elems={{
											mapbox_link: <Link href="https://www.mapbox.com/community/" target="_blank" rel="noreferrer"></Link>,
										}}
									/>
								}
							/>
						</ListItem>

						<ListItem alignItems="flex-start">
							<ListItemIcon>
								<div className="emojiIcon">{this.props.getString('privacy_emoji_icon')}</div>
							</ListItemIcon>
							<ListItemText
								primary={this.props.getString('privacy_essential_data_heading')}
								secondary={
									<Localized
										id="privacy_essential_data_info"
										elems={{
											p: <Typography variant="body2" color="textSecondary" gutterBottom />,
										}}
									/>
								}
								secondaryTypographyProps={{
									component: 'div',
								}}
							/>
						</ListItem>
					</List>
					<CardActions style={{justifyContent: 'flex-end'}}>
						<Button onClick={this.acceptEssentialPrivacyAndCloseIntro}>
							<Localized id="okay-button" />
						</Button>
					</CardActions>
				</div>
			</Paper>

			<Paper
				className={
					'header blurredBG '
					+(
						showingSearchResults
						? 'showingSearchResults'
						: ''
					)
				}
				elevation={6}
				variant="elevation"
				style={{
					margin: '8px 0 0 0',

					display: (
						showingSearchResults
						? 'block'
						: 'none'
					),
				}}
			>
				<div className="scrollWrapper searchResults">
					{
						this.state.searchResults_poi.length === 0
						? null
						: (
							<List
								subheader={
									<ListSubheader disableSticky>
										<Localized id="places_listheading" />
									</ListSubheader>
								}
							>
							{
								this.state.searchResults_poi.map(result => {
									return (<ListItem
											button
											alignItems={
												result.name_translated !== '' && result.address !== ''
												? 'flex-start'
												: 'center'
											}
											key={result.key}
											onClick={()=>this.openSearchResult(result)}
										>
										<ListItemIcon>
											<div
												className="material-icons-round"
												style={{
													color: (
														result.___preset.icon
														&& !!result.___color
														? (
															result.___color.key === 'default'
															? result.___color.bg
															: result.___color.fg
														)
														: ''
													),
													backgroundColor: (
														result.___preset.icon
														&& !!result.___color
														? (
															result.___color.key === 'default'
															? ''
															: result.___color.bg
														)
														: ''
													),
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
						)
					}
					{
						this.state.searchResults_administratives.length === 0
						? null
						: (
							<List
								subheader={
									<ListSubheader disableSticky>
										<Localized id="countries_listheading" />
									</ListSubheader>
								}
							>
							{
								this.state.searchResults_administratives.map(result => {
									return (<ListItem
											button
											alignItems={
												result.name_translated !== '' && result.address !== ''
												? 'flex-start'
												: 'center'
											}
											key={result.key}
											onClick={()=>this.openSearchResult(result)}
										>
										<ListItemIcon>
											<div
												className="material-icons-round"
												style={{
													color: (
														result.___preset.icon
														&& !!result.___color
														? (
															result.___color.key === 'default'
															? result.___color.bg
															: result.___color.fg
														)
														: ''
													),
													backgroundColor: (
														result.___preset.icon
														&& !!result.___color
														? (
															result.___color.key === 'default'
															? ''
															: result.___color.bg
														)
														: ''
													),
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
						)
					}
					
					{
						this.state.searchResults_address.length === 0
						? null
						: (
							<List
								subheader={
									<ListSubheader disableSticky>
										<Localized id="addresses_listheading" />
									</ListSubheader>
								}
							>
							{
								this.state.searchResults_address.map(result => {
									return (<ListItem
											button
											alignItems={
												result.name_translated !== '' && result.address !== ''
												? 'flex-start'
												: 'center'
											}
											key={result.key}
											onClick={()=>this.openSearchResult(result)}
										>
										<ListItemIcon>
											<div
												className="material-icons-round"
												style={{
													color: (
														result.___preset.icon
														? (
															result.___color.key === 'default'
															? result.___color.bg
															: result.___color.fg
														)
														: ''
													),
													backgroundColor: (
														result.___preset.icon
														? (
															result.___color.key === 'default'
															? ''
															: result.___color.bg
														)
														: ''
													),
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
						)
					}
				</div>
			</Paper>


			<ActionBar
				actions={this.actions}
				style={{
					display: (
						this.state.showSearchResults
						|| this.state.showWebsiteIntro
						? 'none'
						: 'block'
					),
				}}
			/>

			<Paper
				className={
					'header blurredBG '
					+(this.state.searchBarIsFocused ? 'focused ' : '')
				}
				elevation={6}
				variant="elevation"
				style={{
					margin: '8px 0 0 0',
					borderRadius: '16px',
				}}
			>
				<div className="searchBar">
					{leftIcon}
					<InputBase
						className="searchInput"
						value={this.state.value}
						placeholder={this.props.getString('search-for-queerness')}
						onFocus={this.gainedFocus}
						onBlur={this.lostFocus}

						onChange={this.saveSearchQueryText}
						onKeyPress={this.searchKeypressed}

						inputRef={this.searchInputRef}

						inputProps={{
							title: this.props.getString('search-for-queerness'),
							'aria-label': this.props.getString('search-for-queerness')
						}}
					/>
					{rightIcon}
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


