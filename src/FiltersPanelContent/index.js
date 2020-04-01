import React from 'react'
import './index.css'

import {
	// ListSubheader,
	// List,
	// ListItem,
	// ListItemText,
	// ListItemIcon,
	// ListItemSecondaryAction,

	// Checkbox,

	Fab,
	Menu,
	MenuItem,
} from '@material-ui/core'

import {
	ArrowDropDownRounded as ArrowDropDownIcon,
} from '@material-ui/icons'
// import {
// 	ToggleButton,
// 	ToggleButtonGroup,
// } from '@material-ui/lab'

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'

import _categories_ from '../data/dist/categories.json'
console.log('_categories_', _categories_)

export default class FiltersPanelContent extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			category: null,
			age: null,
		}

		this.ages = Array.apply(null, Array(15)).map((v,i)=>i+14)
		this.highest_ages_entry = this.ages[this.ages.length-1]

		this.setValue = this.setValue.bind(this)
		this.getFilterObj = this.getFilterObj.bind(this)
	}

	componentDidMount(){
		// setTimeout(()=>{
			// this.setValue('age', 27, ()=>{})
		// }, 1000)
	}

	getFilterObj(){

		// const tags = {}
		// if (!!this.state.age) {
		// 	// gte = Matches values that are greater than or equal to a specified value. #mongodb
		// 	// lte = Matches values that are less than or equal to a specified value. #mongodb

		// 	if (this.state.age === this.highest_ages_entry) {
		// 		tags.min_age = {gte: this.state.age}
		// 		tags.max_age = {lte: this.state.age}
		// 	}else{				
		// 		tags.min_age = {gte: this.state.age}
		// 		tags.max_age = {lte: this.state.age}
		// 	}
		// }

		return {
			presets: (!!this.state.category ? this.state.category.presets : []),
			
			selectedAge: this.state.age,
			ageOption: (this.state.age === this.highest_ages_entry ? 'open_end' : '')
		}
	}

	setValue(stateKeyName, value, closeMenuCallback){
		this.setState({[stateKeyName]: (!!value ? value : null)}, ()=>{
			closeMenuCallback()

			if (this.props.onChange) {
				this.props.onChange(this.getFilterObj())
			}
		})
	}

	render() {
		return (<div className="filterMenuInner">
			<PopupState variant="popover">
				{popupState => (
					<React.Fragment>
						<Fab
							{...bindTrigger(popupState)}
							size="small"
							variant="extended"
							className="fab"
						>
							{
								!!this.state.category
								? (<>
									<div className="filterMenuDot" style={{margin:'0 8px 0 -4px',background:this.state.category.color.bg}}></div>
									{this.state.category.name}
								</>)
								: 'What to show?'
							}
							<ArrowDropDownIcon className="ArrowDropDownIcon"/>
						</Fab>
						<Menu
							{...bindMenu(popupState)}
							transitionDuration={0}
							anchorOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
						>
							<MenuItem value="" onClick={()=>this.setValue('category', null,popupState.close)}>
								<div className="filterMenuDot" style={{background:'transparent'}}></div>
								Everything
							</MenuItem>
							{_categories_.map(category=>{
								const isSelected = (!!this.state.category && category.name === this.state.category.name)
								return (
								<MenuItem
									key={category.name}
									value={category.name}
									onClick={()=>this.setValue('category', category,popupState.close)}
									selected={isSelected}
									style={{
										background: (isSelected ? category.color.bg : ''),
										color: (isSelected ? category.color.fg : category.color.bg),
									}}
								>
									<div className="filterMenuDot" style={{background:(isSelected ? category.color.fg : category.color.bg)}}></div>
									{category.name}
								</MenuItem>
								)
							})}
						</Menu>
					</React.Fragment>
				)}
			</PopupState>

			<PopupState variant="popover">
				{popupState => (
					<React.Fragment>
						<Fab
							{...bindTrigger(popupState)}
							size="small"
							variant="extended"
							className="fab"
						>
							{
								!!this.state.age
								? (this.state.age===this.highest_ages_entry ? 'For age '+this.state.age+' and up' : 'For age '+this.state.age)
								: 'For which age?'
							}
							<ArrowDropDownIcon className="ArrowDropDownIcon"/>
						</Fab>
						<Menu
							{...bindMenu(popupState)}
							transitionDuration={0}
							anchorOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							MenuListProps={{
								style:{
									minWidth:'200px'
								}
							}}
						>
							<MenuItem value="" onClick={()=>this.setValue('age', null, popupState.close)}>Any Age</MenuItem>
							{this.ages.map(number=>{
								return (
								<MenuItem
									key={number}
									value={number}
									onClick={()=>this.setValue('age', number, popupState.close)}
									selected={!!this.state.age && number === this.state.age}
								>
									{number===this.highest_ages_entry ? '≥ '+number : number}
								</MenuItem>
								)
							})}
						</Menu>
					</React.Fragment>
				)}
			</PopupState>

			{/*<List dense>
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
			</List>*/}

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



