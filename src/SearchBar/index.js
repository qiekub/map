import React from 'react'
import './index.css'

import {navigate} from '@reach/router'

import {
	Paper,
	InputBase,
	IconButton,
	Drawer,
} from '@material-ui/core'

import {
	Search as SearchIcon,
	HourglassEmpty as HourglassEmptyIcon,
	Close as CloseIcon,
	Menu as MenuIcon,
} from '@material-ui/icons'

import MainDrawerContent from '../MainDrawerContent/index.js'

export default class SearchBar extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			value: '',
			loadingSearchResult: false,
		}

		this.submitTheSearchQuery = this.submitTheSearchQuery.bind(this)
		this.saveSearchQueryText = this.saveSearchQueryText.bind(this)
		this.searchKeypressed = this.searchKeypressed.bind(this)
		this.closeSidebar = this.closeSidebar.bind(this)
		this.toggleMainDrawer = this.toggleMainDrawer.bind(this)
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

	render() {
		return (<div className={this.props.className}>
			<Drawer open={this.state.isMainDrawerOpen} onClose={this.toggleMainDrawer}>
				<MainDrawerContent />
			</Drawer>
			<Paper className={'header '+(this.props.sidebarIsOpen ? 'sidebarIsOpen' : '')} elevation={(this.props.sidebarIsOpen ? 0 : 6)} variant={(this.props.sidebarIsOpen ? 'elevation'/*'outlined'*/ : 'elevation')}>
				<IconButton edge="end" style={{margin:'4px',padding:'10px'}} aria-label="menu" onClick={this.toggleMainDrawer}>
					<MenuIcon style={{color:'black'}} />
				</IconButton>
				<InputBase
					style={{
						height: '52px',
						padding: '', // '0 4px 0 16px', // '0 4px',
						flex: 1,
					}}
					value={this.state.value}
					placeholder="Search For Queerness!"
					inputProps={{'aria-label': 'search input'}}
					onChange={this.saveSearchQueryText}
					onKeyPress={this.searchKeypressed}

					disabled={this.props.sidebarIsOpen}
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
							<HourglassEmptyIcon style={{color:'black'}} />
							:
							<SearchIcon style={{color:'black'}} />
						)}
					</IconButton>
				)}
			</Paper>

			{/*<Card className="header">
				<CardContent>

					<div style={{
						margin: '-16px -16px 0 -16px',
						padding: '2px 4px',
						display: 'flex',
						alignItems: 'center',
					}}>
						<IconButton style={{padding:'10px'}} aria-label="menu">
							<MenuIcon />
						</IconButton>
						<InputBase
							style={{flex: 1}}
							placeholder="Search Google Maps"
							inputProps={{'aria-label': 'search google maps'}}
						/>
						<IconButton type="submit" style={{padding:'10px'}} aria-label="search" onClick={this.submitTheSearchQuery}>
							<SearchIcon />
						</IconButton>
					</div>

					<Typography variant="h4" component="h1" gutterBottom>QueerCenters</Typography>
				</CardContent>
				<CardActions>
					<Button size="small">Learn More</Button>
				</CardActions>
			</Card>*/}
		</div>)
	}
}


// <a className="infoLink" rel="noopener noreferrer" href="https://github.com/thomasrosen/queer-centers" target="_blank">Infos / Ort hinzufügen</a>