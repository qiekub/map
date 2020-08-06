/*
Wheelchair accessible / Not wheelchair accessible
*/

import React from 'react'

import {
	Paper,
	Card,
	CardContent,
	Typography,
} from '@material-ui/core'

import {
	changesets as query_changesets,
} from '../../queries.js'

import { withLocalization } from '../Localized/'
import { withGlobals } from '../Globals/'
import { withTheme } from '@material-ui/core/styles'

import Changeset from '../Changeset/index.js'

class SidebarChangesets extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			changesets: [],
			headerText: '',
		}
	}

	componentDidMount(){
		this.loadChangesets()
		this.setHeaderText()
		this.props.onSetSidebarIsOpen(true)
	}

	setHeaderText(){
		this.setState({
			headerText: 'Changesets', // this.props.getString('changesets_heading'),
		}, ()=>{
			if (this.props.onSetSearchBarValue) {
				this.props.onSetSearchBarValue(this.state.headerText)
			}
		})
	}

	loadChangesets(){
		this.props.globals.graphql.query({
			fetchPolicy: 'no-cache',
			query: query_changesets,
		}).then(({data}) => {
			if (!!data && !!data.changesets) {
				this.setState({changesets: data.changesets})
			}else{
				this.setState({changesets: []})
			}
		}).catch(error=>{
			console.error(error)
		})
	}

	render(){

		const headerBackgroundColor = this.props.theme.palette.background.default
		const headerForegroundColor = this.props.theme.palette.getContrastText(headerBackgroundColor)

		return (<>
			<Paper
				elevation={6}
				className={this.props.className}
				style={{
					backgroundColor: headerBackgroundColor,
					display: 'flex',
					alignContent: 'stretch',
					flexDirection: 'column',
				}}
			>

			<Card
				elevation={0}
				style={{
					margin: '0 0 -8px 0',
					borderRadius: '0px',
					padding: '86px 0 8px 0',
					flexShrink: 0,

					background: 'transparent',
				}}
			>
				<CardContent>
					<Typography gutterBottom variant="h4" component="h1" style={{margin:'0 16px',fontWeight:'900',color:headerForegroundColor}}>
						{this.state.headerText}
					</Typography>
				</CardContent>
			</Card>

			<div
				key="sidebarContentCard"
				className="sidebarContentCard"
				style={{
					margin: '0',
				}}
			>
				{
					this.state.changesets && this.state.changesets.length > 0
					? this.state.changesets.map(changeset => <Changeset changeset={changeset} variant="elevation" />)
					: <div style={{margin:'0 32px'}}>No changesets without a place.</div>
				}
			</div>

			</Paper>
		</>)
	}
}

export default withGlobals(withLocalization(withTheme(SidebarChangesets)))


