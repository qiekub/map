import React from 'react'
import './index.css'

import {
	TextField,
	Typography,
} from '@material-ui/core'
// import {
// 	AddRounded as AddIcon,
// } from '@material-ui/icons'

import { withLocalization } from '../Localized/'
import { withGlobals } from '../Globals/'

class DateInput extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			year: '',
			month: '',
			date: '',
		}

		this.formated = {
			year: null,
			month: null,
			date: null,
		}

		this.parseDateString = this.parseDateString.bind(this)
		this.setValue = this.setValue.bind(this)
	}

	componentDidMount(){
		this.parseDateString()
	}
	componentDidChange(){
		this.parseDateString()
	}
	parseDateString(){
		const defaultValue = this.props.defaultValue

		let parts = []
		if (!!defaultValue) {
			if (!!defaultValue['']) {
				parts = defaultValue[''].match(/(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?/)
			} else if (typeof defaultValue === 'string') {
				parts = defaultValue.match(/(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?/)
			}
		}

		let year = ''
		if (
			!(
				defaultValue.hasOwnProperty('year:is_set') &&
				defaultValue['year:is_set'] === false
			)
			&& (defaultValue['year'] || parts[1])
		) {
			year = (defaultValue['year'] || parts[1])
		}

		let month = ''
		if (
			!(
				defaultValue.hasOwnProperty('month:is_set') &&
				defaultValue['month:is_set'] === false
			)
			&& (defaultValue['month'] || parts[2])
		) {
			month = (defaultValue['month'] || parts[2])
		}

		let day = ''
		if (
			!(
				defaultValue.hasOwnProperty('day:is_set') &&
				defaultValue['day:is_set'] === false
			)
			&& (defaultValue['day'] || parts[3])
		) {
			day = (defaultValue['day'] || parts[3])
		}

		this.setState({year, month, day}, ()=>{
			this.formated = {
				year: this.getFormatedValue('year', year),
				month: this.getFormatedValue('month', month),
				day: this.getFormatedValue('day', day),
			}
		})
	}

	getFormatedValue(formatKey,value){
		const real = value
		let isSet = false
		let asString = ''
		value *= 1

		if (formatKey === 'year') {
			if (value > 99999) {
				value = 99999
			} else {
				isSet = true
			}
			asString = (value+'').padStart(4,'0')
		} else if (formatKey === 'month') {
			if (value > 12) {
				value = 12
			} else if (value < 1) {
				value = 1
			} else {
				isSet = true
			}
			asString = (value+'').padStart(2,'0')
		} else if (formatKey === 'day') {
			let daysInMonth = 31
			if (
				this.formated.year &&
				this.formated.year.isSet &&
				this.formated.month &&
				this.formated.month.isSet
			) {
				daysInMonth = new Date(this.formated.year.value, this.formated.month.value, 0).getDate()
			}

			if (value > daysInMonth) {
				value = daysInMonth
			} else if (value < 1) {
				value = 1
			} else {
				isSet = true
			}
			asString = (value+'').padStart(2,'0')
		}

		return {
			asString,
			value,
			isSet,
			real,
		}
	}

	setValue(formatKey,value){
		this.formated[formatKey] = this.getFormatedValue(formatKey,value)
		if (formatKey !== 'day') {
			this.formated.day = this.getFormatedValue('day',this.formated.day.real)
		}

		const values = Object.fromEntries(Object.entries(this.formated).map(entry => [
			entry[0],
			entry[1].value,
		]))
		const isSet = Object.fromEntries(Object.entries(this.formated).map(entry => [
			entry[0]+':is_set',
			entry[1].isSet,
		]))

		if (this.props.onChange) {
			this.props.onChange({
				'': this.formated.year.asString+'-'+this.formated.month.asString+'-'+this.formated.day.asString,
				...values,
				...isSet,
			})
		}
	}

	render() {
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
	}
}

export default withGlobals(withLocalization(DateInput))


