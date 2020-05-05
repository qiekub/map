import React from 'react'
import './index.css'

import { withLocalization } from '../Localized/'
import {navigate} from '@reach/router'

import {
	Paper,
	InputBase,
	IconButton,
	Drawer,

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
			showWebsiteIntro: true,
		}

		this.searchInputRef = React.createRef()

		this.submitTheSearchQuery = this.submitTheSearchQuery.bind(this)
		this.saveSearchQueryText = this.saveSearchQueryText.bind(this)
		this.searchKeypressed = this.searchKeypressed.bind(this)
		this.closeSidebar = this.closeSidebar.bind(this)
		this.toggleMainDrawer = this.toggleMainDrawer.bind(this)

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
		this.setState({value: event.target.value})
	}

	submitTheSearchQuery(){
		if (this.props.onStartSearch) {
			this.searchInputRef.current.blur() // unfocus the input element
			this.setState({loadingSearchResult:true}, ()=>{
				this.props.onStartSearch(this.state.value, ()=>{
					this.setState({loadingSearchResult:false})
				})
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
				<IconButton edge="end" style={{margin:'4px',padding:'10px'}} aria-label="menu" onClick={this.toggleMainDrawer}>
					<MenuIcon />
				</IconButton>
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
				{(
					this.props.sidebarIsOpen
					?
					<IconButton style={{margin:'4px',padding:'10px'}} aria-label="close" onClick={this.closeSidebar}>
						<CloseIcon />
					</IconButton>
					:
					<IconButton type="submit" style={{margin:'4px',padding:'10px'}} aria-label="search" onClick={this.submitTheSearchQuery}>
						{(
							this.state.loadingSearchResult
							?
							<HourglassEmptyIcon />
							:
							<SearchIcon />
						)}
					</IconButton>
				)}
			</Paper>
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

export default withLocalization(SearchBar)



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


