import React, { useState, useCallback, useEffect } from 'react'

import { DndProvider } from 'react-dnd'
import Backend from 'react-dnd-html5-backend'
import update from 'immutability-helper'

import Dustbin from './Dustbin.js'
import Box from './Box.js'

import Localized from '../Localized/'

const AudienceInput = ({ defaultValue, onChange }) => {
	return (
		<DndProvider backend={Backend}>
			<Example defaultValue={defaultValue} onChange={onChange} />
		</DndProvider>
	)
}

export default AudienceInput





////////////////////////////////////////////////////////////////





const accept_type = 'box'

const Example = ({ defaultValue, onChange }) => {
	const [dustbins] = useState([
		{ value: 'only', label: <Localized id="audience_input_label_only" /> },
		{ value: 'primary', label: <Localized id="audience_input_label_primary" /> },
		{ value: 'welcome', label: <Localized id="audience_input_label_welcome" /> },
		{ value: 'no', label: <Localized id="audience_input_label_no" /> }
	])
	const [items, setItems] = useState([])

	useEffect(()=>{
		setItems(
			[
				'queer',
				'youth',
				'trans',
				'inter',
				'sexuality:bi',
				'sexuality:lesbian',
				'sexuality:gay',
				'allies',
				'cis',
				'men',
				'women',
			]
			.map(key => ({
				key: key,
				label: <Localized id={key.replace(/:/g, '_')} />,
				value: defaultValue[key] || null,
				defaultValue: defaultValue[key] || null,
				type: accept_type,
			}))
		)
	}, [defaultValue])

	const handleDrop = useCallback(
		(value, item) => {
			const newItems = update(items, {
				[item.index]: {
					value: {
						$set: value
					}
				}
			})

			setItems(newItems)

			const changedItems = Object.fromEntries(
				newItems
				.filter(item => item.hasOwnProperty('value') && item.value !== item.defaultValue)
				.map(item => [item.key, item.value || false])
			)

			onChange(changedItems)
		},
		[items, onChange]
	)

	return (
		<div style={{margin:'0 8px'}}>
			<div>
				{items
					.map((item, index) => ({ ...item, index }))
					.filter(item => item.value === null)
					.map(item => (
						<Box
							key={item.index}
							index={item.index}
							label={item.label}
							type={item.type}
						/>
					))}
			</div>

			{dustbins.map(({ value, label }) => (
				<Dustbin
					key={value}
					label={label}
					accept={[accept_type]}
					items={items
						.map((item, index) => ({ ...item, index }))
						.filter(item => item.value === value)}
					onDrop={item => handleDrop(value, item)}
					onRemoveItem={item => handleDrop(null, item)}
				/>
			))}
		</div>
	)
}