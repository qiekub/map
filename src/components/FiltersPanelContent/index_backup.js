import React from 'react'
import './index.css'

import {
	// ListSubheader,
	List,
	ListItem,
	ListItemText,
	ListItemIcon,
	// ListItemSecondaryAction,

	Checkbox,
} from '@material-ui/core'

import {
	// History as HistoryIcon,
	// ContactSupport as ContactSupportIcon,
	// Fullscreen as FullscreenIcon,
	// FullscreenExit as FullscreenExitIcon,
} from '@material-ui/icons'
// import {
// 	ToggleButton,
// 	ToggleButtonGroup,
// } from '@material-ui/lab'

import categories from '../data/dist/categories.json'
console.log('categories', categories)

export default class FiltersPanelContent extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			windowIsFullscreen: false,

			values: {},
		}

		this.presetCategories = [
			{title: 'Community Centers', presets: ['amenity/community_center']},
			{title: 'Going Out', presets: ['']},
			{title: 'Culture', presets: ['']},
			{title: 'Eating', presets: ['']},
			{title: 'Tourism', presets: ['']},
		]

		// this.forWhom = [
		// 	{title: 'Women'},
		// 	{title: 'Men'},
		// 	{title: 'Bears'},
		// 	{title: 'Trans'},
		// 	{title: 'Inter'},
		// ]
		// this.handleGroup = this.handleGroup.bind(this)

		this.handleClick = this.handleClick.bind(this)
	}

	// handleGroup(forWhomItem, newValue){
	// 	this.setState((state,props)=>{
	// 		let forWhomValues = state.forWhomValues
	// 		console.log(forWhomValues)
	// 		return {
	// 			forWhomValues: (this.state.value === newValue ? '' : newValue)
	// 		}
	// 	})
	// }

	handleClick(item){
		this.setState((state,props)=>{
			let values = state.values

			if (values[item.title]) {
				values[item.title] = false
			}else{
				values[item.title] = true
			}

			console.log(values)

			return {values}
		})
	}

	render() {
		// subheader={<ListSubheader>What?</ListSubheader>}
		// style={{width:'250px'}}
		return (<div>
			<List dense>
				{this.presetCategories.map(item=>{
					const thisValue = !!this.state.values.hasOwnProperty(item.title) ? this.state.values[item.title] : true
					return (<ListItem button key={item.title}>
						<ListItemIcon style={{minWidth:'0px'}}>
							<Checkbox
								checked={thisValue}
								edge="start"
								onChange={()=>this.handleClick(item)}
							/>
						</ListItemIcon>
						<ListItemText primary={item.title} />
					</ListItem>)
				})}
			</List>

			{/*<List subheader={<ListSubheader>For Whom?</ListSubheader>}>
				{this.forWhom.map(item=>{
					return (<ListItem button key={item.title}>
					<ListItemText primary={item.title} />

					<ListItemSecondaryAction>
						<ToggleButtonGroup
							value={this.state.value}

							onChange={(event,value)=>this.handleGroup(item,value)}
							className="myToggleButtonGroup"
							size="small"
							exclusive
						>
							<ToggleButton value="only">
								Only
							</ToggleButton>
							<ToggleButton value="primary">
								Primary
							</ToggleButton>
						</ToggleButtonGroup>
					</ListItemSecondaryAction>
					</ListItem>)
				})}
			</List>*/}
		</div>)
	}
}



