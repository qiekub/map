import React from 'react'
import './index.css'

import { Localized, withLocalization } from '../Localized/'

import {
	Fab,
	Menu,
	MenuItem,
} from '@material-ui/core'

import {
	CheckCircleRounded as CheckIcon,
	ArrowDropDownRounded as ArrowDropDownIcon,
} from '@material-ui/icons'
import { withTheme } from '@material-ui/core/styles'

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'

import { getTranslation } from '../../functions.js'
import _categories_ from '../../data/dist/categories.json'

import { withGlobals } from '../Globals/'

// TODO: Add a filter for "For any or all audience groups." (Trans, BPOC, Gay-Women, ...)

class FiltersPanelContent extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			category: null,
			age: null,
			audience_queer: new Set(['only','primary']), // only primary welcome
			mustHaveUndecidedChangeset: false,
		}

		this.categories = _categories_.map(category => ({
			...category,
			name_translated: getTranslation(category.name, this.props.globals.userLocales),
		}))

		this.audience_queer_values = [
			{
				key: 'everything',
				translation_key: 'menu_text_audience_queer_everything',
				emoji: null,
			},
			{
				key: 'only',
				translation_key: 'menu_text_audience_queer_only',
				emoji: this.props.globals.emojis.audience_queer_only,
			},
			{
				key: 'primary',
				translation_key: 'menu_text_audience_queer_primary',
				emoji: this.props.globals.emojis.audience_queer_primary,
			},
			{
				key: 'welcome',
				translation_key: 'menu_text_audience_queer_welcome',
				emoji: this.props.globals.emojis.audience_queer_welcome,
			},
		]

		this.ages = Array.apply(null, Array(15)).map((v,i)=>i+14)
		this.highest_ages_entry = this.ages[this.ages.length-1]

		this.setValue = this.setValue.bind(this)
		this.getFilterObj = this.getFilterObj.bind(this)
		this.toggleMustHaveUndecidedChangeset = this.toggleMustHaveUndecidedChangeset.bind(this)
	}

	componentDidMount(){
		if (this.props.onChange) {
			this.props.onChange(this.getFilterObj())
		}
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
			
			audienceQueerOptions: this.state.audience_queer.has('eveything') ? [] : [...this.state.audience_queer],
			selectedAge: this.state.age,
			ageOption: (this.state.age === this.highest_ages_entry ? 'open_end' : ''),
			mustHaveUndecidedChangeset: this.state.mustHaveUndecidedChangeset,
		}
	}

	setValue(stateKeyName, value, closeMenuCallback){
		this.setState({[stateKeyName]: (!!value ? value : null)}, ()=>{
			if (typeof closeMenuCallback === 'function') {
				closeMenuCallback()
			}

			if (this.props.onChange) {
				this.props.onChange(this.getFilterObj())
			}
		})
	}

	toogleAudienceQueer(audienceKey){
		this.setState((state, props) => {
			let audience_queer = state.audience_queer

			if (audienceKey === 'everything') {
				if (audience_queer.size === 0) {
					audience_queer = new Set(['only','primary','welcome'])
				}else{
					audience_queer = new Set()
				}
			}else{
				if (audience_queer.has(audienceKey)) {
					audience_queer.delete(audienceKey)
				}else{
					audience_queer.add(audienceKey)
				}
			}

			return {audience_queer}
		}, ()=>{
			if (this.props.onChange) {
				this.props.onChange(this.getFilterObj())
			}
		})
	}

	toggleMustHaveUndecidedChangeset(){
		this.setState((state, props) => ({
			mustHaveUndecidedChangeset: !state.mustHaveUndecidedChangeset
		}), ()=>{
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
							title={this.props.getString('what-to-show')}
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
							title={this.props.getString('for-which-age')}
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
							className="menuBlurredPaperBackground"
						>
							<MenuItem
								key="any_age"
								onClick={()=>this.setValue('age', null, popupState.close)}
							>
								<div className="filterMenuDot hasIcon material-icons-round">
									{(!(!!this.state.age) ? 'check' : '')}
								</div>
								<Localized id="any_age" />
							</MenuItem>
							{this.ages.map(number=>{
								return (
								<MenuItem
									key={number}
									onClick={()=>this.setValue('age', number, popupState.close)}
								>
									<div className="filterMenuDot hasIcon material-icons-round">
										{(!!this.state.age && number === this.state.age ? 'check' : '')}
									</div>
									{number===this.highest_ages_entry ? '≥ '+number : number}
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
							aria-label={this.props.getString('what-to-show')}
							title={this.props.getString('button_audience_queer_default_text')}
						>
							{
								this.state.audience_queer.size > 0
								? (<>
									<Localized id="button_audience_queer_default_text" />
									{
										this.audience_queer_values
										.filter(audience => this.state.audience_queer.has(audience.key))
										.map(audience => {
											return <div key={audience.emoji} style={{margin:'0 -4px 0 8px'}}>{audience.emoji}</div>
										})
									}
								</>)
								: <Localized id="button_audience_queer_default_text" />
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
							{this.audience_queer_values.map(audience => {
								const isSelected = (
									audience.key === 'everything'
									? this.state.audience_queer.size === 0
									: this.state.audience_queer.has(audience.key)
								)

								return (
								<MenuItem
									key={audience.key}
									onClick={()=>this.toogleAudienceQueer(audience.key)}
								>
									<div className={'filterMenuDot hasIcon '+(audience.emoji ? '' : 'material-icons-round')}>
										{
											isSelected
											? (audience.emoji ? audience.emoji : 'check')
											: ''
										}
									</div>
									<div>
										<Localized
											id={audience.translation_key}
											elems={{
												strong: <strong />,
											}}
										/>
									</div>
								</MenuItem>
								)
							})}
						</Menu>
					</React.Fragment>
				)}
			</PopupState>

			{
				!!this.props.globals.profileID
				? (<Fab
					size="small"
					variant="extended"
					className="fab"
					aria-label={this.props.getString('must_have_undecided_changes')}
					title={this.props.getString('must_have_undecided_changes')}
					onClick={this.toggleMustHaveUndecidedChangeset}
				>
					<Localized id="must_have_undecided_changes" />
					{
						!!this.state.mustHaveUndecidedChangeset
						? (<CheckIcon className="ArrowDropDownIcon" style={{
							width:'20px',
							height:'20px',
						}}/>)
						:  <div style={{width:'8px'}}></div>
					}
				</Fab>)
				: null
			}
		</div>)
	}
}

export default withGlobals(withTheme(withLocalization(FiltersPanelContent)))

