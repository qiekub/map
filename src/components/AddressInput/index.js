import React from 'react'
import './index.css'

import {
	countrycode as query_countrycode,
} from '../../queries.js'

import {
	TextField,
	Typography,
	FormControlLabel,
	Switch,
} from '@material-ui/core'
// import {
// 	AddRounded as AddIcon,
// } from '@material-ui/icons'

import { withLocalization } from '../Localized/'
import { withGlobals } from '../Globals/'
import { withTheme } from '@material-ui/core/styles'
import { getAddressFormatByCountryCode } from '../../functions.js'

class AddressInput extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			value: {},
			showAllFields: false,
		}

		this.newValue = {}

		this.parseDefaultValue = this.parseDefaultValue.bind(this)
		this.setValue = this.setValue.bind(this)
		this.toggleShowAllFields = this.toggleShowAllFields.bind(this)
	}

	componentDidMount(){
		this.parseDefaultValue()
	}
	componentDidChange(){
		this.parseDefaultValue()
	}
	parseDefaultValue(){
		this.setState({
			value: this.props.defaultValue || {}
		}, ()=>{
			this.newValue = JSON.parse(JSON.stringify(this.state.value))
			this.publishChanges()

			this.setCountryCode()
		})
	}

	setCountryCode(){
		const lng = this.props.tags.lng
		const lat = this.props.tags.lat

		this.props.globals.graphql.query({
			query: query_countrycode,
			variables: {
				lng,
				lat,
			},
		}).then(result => {
			if (result && result.data && result.data.countrycode) {
				const alpha3code = result.data.countrycode

				this.props.globals.convert_alpha3_to_alpha2(alpha3code, (alpha2code)=>{
					this.setValue('country',alpha2code)
				})
			}else{
				this.setValue('country',null)
			}
		}).catch(error=>{
			this.setValue('country',null)
		})
	}

	setValue(formatKey,value){
		this.newValue[formatKey] = value
		this.publishChanges()
	}
	publishChanges(){
		if (this.props.onChange) {
			let changedValues = {}
			for (const key of Object.keys(this.newValue)) {
				if (this.state.value[key] !== this.newValue[key]) {
					changedValues[key] = this.newValue[key]
				}
			}

			this.props.onChange(changedValues)
		}
	}

	getAddressInputStyles(addressFormat, formatKey) {
		if (addressFormat.widths[formatKey]) {
			return {
				width: (addressFormat.widths[formatKey]*100)+'%',
			}
		}

		return {
			width: 'auto',
			flexShrink: '2',
		}
	}

	toggleShowAllFields(event){
		this.setState((state, props) => ({
			showAllFields: !state.showAllFields
		}))
	}

	render() {
		const countryCode = this.state.value.country || null
		const countryCodeLowerCase = (countryCode || '').toLowerCase()
		const addressFormat = getAddressFormatByCountryCode(countryCode, this.state.showAllFields)

		return (<div
			className="AddressInput"
			style={this.props.style}
		>

			<div>
			{
				addressFormat.format.map(row => {
					return <div
						key={JSON.stringify(row)}
						className="TextFields"
					>{
						row.map(formatKey => {
							const value = this.state.value[formatKey]
							const label = this.props.getString(
								`label_${formatKey}_${countryCodeLowerCase}`, null,
								this.props.getString(
									`label_${formatKey}`,null,
									formatKey
								)
							)

							return (
							<TextField
								className="TextField"
								type="text"
								key={formatKey}
								label={label}
								title={label}
								variant="outlined"
								size="small"
								color="secondary"
								defaultValue={value}
								onChange={event => this.setValue(formatKey,event.target.value)}
								style={this.getAddressInputStyles(addressFormat,formatKey)}
							/>
							)
						})
					}</div>
				})
			}
			</div>

			<FormControlLabel
				style={{
					display: (countryCode === '_ALL_FIELDS_' ? 'none' : 'flex'),
					margin: '8px 0 0',
					width: 'auto',
					padding: '0 8px 0 0',
					boxShadow: `inset 0 0 0 999px ${this.props.theme.palette.divider}`,
					borderRadius: `${this.props.theme.shape.borderRadius}px`,
				}}
				control={
					<Switch
						checked={this.state.showAllFields}
						onChange={this.toggleShowAllFields}
						inputProps={{
							'aria-label': this.props.getString('show_all_fields'),
						}}
					/>
				}
				label={this.props.getString('show_all_fields')}
			/>

			{
				!!this.props.helperText
				? <Typography className="helperText" variant="caption">{this.props.helperText}</Typography>
				: null
			}
		</div>)

		/*
		const dateInputOrder = this.props.getString('date-input-order', null, '').split('-').filter(v=>!!v && v !== ' ') // year-month-day

		return (<div
			className="DateInput"
			style={this.props.style}
		>
			<div className="TextFields">
				{
					dateInputOrder.map((formatKey,index) => (<TextField
						autoFocus={formatKey === 'year'}
						className="TextField"
						type="number"
						key={formatKey+'_'+this.state[formatKey]}
						label={this.props.getString(`${formatKey}-label`, null, formatKey)}
						variant="outlined"
						color="secondary"
						defaultValue={this.state[formatKey]}
						onChange={event => this.setValue(formatKey,event.target.value)}
					/>))
				}
			</div>

			{
				!!this.props.helperText
				? <Typography className="helperText" variant="caption">{this.props.helperText}</Typography>
				: null
			}
		</div>)
		*/
	}
}

export default withGlobals(withLocalization(withTheme(AddressInput)))


