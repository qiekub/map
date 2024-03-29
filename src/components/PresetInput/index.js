import React from 'react'
// import './index.css'

import {
	Paper,
	TextField,

	ListItem,
	ListItemIcon,
	ListItemText,
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import matchSorter from 'match-sorter'

import { withLocalization } from '../Localized/'
import { withGlobals } from '../Globals/'

import { getTranslation } from '../../functions.js'

import categories from '../../data/dist/categories.json'
import _presets_ from '../../data/dist/presets.json'
import colors from '../../data/dist/colors.json'



class PresetInput extends React.Component {
	constructor(props) {
		super(props)

		this.filterOptions = (options, {inputValue}) => matchSorter(options, inputValue, {
			threshold: matchSorter.rankings.CONTAINS,
			keys: ['name_translated' ,'terms_translated','category_name_translated','key','color.key']
		})

		this._options_ = [].concat(
			...(
				categories
				.map(category =>
					Object.values(_presets_)
					.filter(preset => category.presets.some(
						presetKey => preset.key === presetKey || preset.key.startsWith(presetKey+'/')
					))
					.map(preset => this.preset4options({
						...preset,
						category_name_translated: getTranslation(category.name, this.props.globals.userLocales),
						color: category.color,
					}))
					.sort(this.presetSorter)
				)
			),
			...(
				Object.values(_presets_)
				.filter(preset => !categories.some(
					category => category.presets.some(
						presetKey => (
							preset.key === presetKey
							|| preset.key.startsWith(presetKey+'/')
						)
					)
				))
				.map(preset => this.preset4options({
					...preset,
					category_name_translated: props.getString('category_more'),
					color: colors.default,
				}))
				.sort(this.presetSorter)
			)
		)

		this.presetChanged = this.presetChanged.bind(this)
	}


	presetSorter(a, b){
		const icon_compare = b.icon.localeCompare(a.icon)
		const name_compare = -b.name_translated.localeCompare(a.name_translated)
		return icon_compare === 0 ? name_compare : icon_compare
	}

	preset4options(preset){
		return {
			...preset,
			name_translated: getTranslation(preset.name, this.props.globals.userLocales),
			terms_translated: getTranslation(preset.terms, this.props.globals.userLocales),
			icon: preset.icon ? preset.icon.toLowerCase() : '',
		}
	}

	presetChanged(event, value){
		if (this.props.onChange) {
			this.props.onChange(value && value.key ? value.key : null)
		}
	}

	render() {

		let defaultValue = undefined
		if (this.props.defaultValue && _presets_[this.props.defaultValue]) {
			defaultValue = this.preset4options({
				..._presets_[this.props.defaultValue],
				category_name_translated: '', // isn't really needed
				color: colors.default, // isn't really needed
			})
		}

		return (<div style={this.props.style}>
			<Autocomplete
				options={this._options_}
				groupBy={preset => preset.category_name_translated || ''}
				getOptionLabel={preset => preset.name_translated}
				getOptionSelected={(preset, value) => !!value && value.key === preset.key}
			
				renderOption={(preset) => (<ListItem
					component="div"
					style={{
						margin: '-6px -16px -6px -24px',
					}}
				>
					<ListItemIcon>
						<div
							className="material-icons-round"
							style={{
								color: (
									preset.icon
									? (
										preset.color.key === 'default'
										? preset.color.bg
										: preset.color.fg
									)
									: ''
								),
								backgroundColor: (
									preset.icon
									? (
										preset.color.key === 'default'
										? ''
										: preset.color.bg
									)
									: ''
								),
								borderRadius: '100%',
								width: '40px',
								height: '40px',
								lineHeight: '40px',
								textAlign: 'center',
							}}
						>{preset.icon}</div>
					</ListItemIcon>
					<ListItemText primary={preset.name_translated}/>
				</ListItem>)}

				ListboxProps={{
					style: {
						WebkitOverflowScrolling: 'touch',
					},
				}}
				PaperComponent={Paper}
				
				blurOnSelect
				openOnFocus
			
				clearText="nextQuestionIDs"
				closeText="Close"
				noOptionsText="No options"
				openText="Open"
			
				filterOptions={this.filterOptions}
				defaultValue={defaultValue}
				onChange={this.presetChanged}
			
				renderInput={(params) => (<TextField
					{...params}
			
					label={this.props.label || ''}
					variant="outlined"
					color="secondary"
				/>)}
			/>
		</div>)
	}
}

export default withGlobals(withLocalization(PresetInput))



