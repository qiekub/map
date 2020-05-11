import React from 'react'
import './index.css'

import { Localized, withLocalization} from '../Localized/'

import {
	// ListSubheader,
	// List,
	// ListItem,
	// ListItemText,
	// ListItemIcon,
	// ListItemSecondaryAction,

	// Checkbox,

	Fab,
	// Paper,
	// Button,

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
import { withTheme } from '@material-ui/core/styles'

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'

import { getTranslation } from '../../functions.js'
import _categories_ from '../../data/dist/categories.json'

import { withGlobals } from '../Globals/'



class FiltersPanelContent extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			category: null,
			age: null,
		}

		this.categories = _categories_.map(category => ({
			...category,
			name_translated: getTranslation(category.name, this.props.globals.userLocales),
		}))

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
							aria-label={this.props.getString('what-to-show')}
						>
							{
								!!this.state.category
								? (<>
									<div className="filterMenuDot" style={{margin:'0 8px 0 -4px',background:this.state.category.color.bg}}></div>
									{this.state.category.name_translated}
								</>)
								: <Localized id="what-to-show" />
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
							className="menuBlurredPaperBackground"
						>
							<MenuItem
								key="everything"
								value=""
								onClick={()=>this.setValue('category', null, popupState.close)}
								selected={!(!!this.state.category)}
							>
								<div className="filterMenuDot" style={{background:'transparent'}}></div>
								<Localized id="show-everything" />
							</MenuItem>
							{this.categories.map(category=>{
								const isSelected = (!!this.state.category && category.name_translated === this.state.category.name_translated)
								return (
								<MenuItem
									key={category.name_translated}
									value={category.name_translated}
									onClick={()=>this.setValue('category', category,popupState.close)}
									selected={isSelected}
									style={{
										background: (isSelected ? category.color.bg : ''),
										...(
											this.props.theme.palette.type === 'light'
											? {color: (isSelected ? category.color.fg : category.color.bg)}
											: undefined
										),
										// color: (isSelected ? category.color.fg : category.color.bg),
									}}
								>
									<div className="filterMenuDot" style={{background:(isSelected ? category.color.fg : category.color.bg)}}></div>
									{category.name_translated}
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
							aria-label={this.props.getString('for-which-age')}
						>
							{
								!!this.state.age
								? (
									this.state.age===this.highest_ages_entry
									? <Localized id="for-age-x-and-up" vars={{age:this.state.age}}/>
									: <Localized id="for-age-x" vars={{age:this.state.age}} />
								)
								: <Localized id="for-which-age" />
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
							className="menuBlurredPaperBackground"
						>
							<MenuItem
								key="any_age"
								value=""
								onClick={()=>this.setValue('age', null, popupState.close)}
								selected={!(!!this.state.age)}
							>
								<Localized id="any_age" />
							</MenuItem>
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

export default withGlobals(withTheme(withLocalization(FiltersPanelContent)))

