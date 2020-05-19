import React from 'react'

import { useTheme } from '@material-ui/core/styles'

import { useDrop } from 'react-dnd'
import Box from './Box.js'

import {
	FormControl,
	InputLabel,
} from '@material-ui/core'

const Dustbin = ({ label, accept, items, onDrop, onRemoveItem }) => {
	const theme = useTheme()

	const [{ isOver, canDrop }, drop] = useDrop({
		accept,
		drop: onDrop,
		collect: monitor => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop()
		})
	})

	const isActive = isOver && canDrop
	const hasItems = items.length > 0
	const activeHelperText = '' // (isActive ? ' — Release to drop' : '')

	return (
		<FormControl
			ref={drop}
			variant="outlined"
			color="secondary"
			fullWidth
			style={{
				transition: 'margin-top 0.2s ease',
				marginTop: (hasItems ? '16px' : '8px'),
			}}
		>
			<InputLabel focused={hasItems && isActive} shrink={hasItems}>
				{label}{activeHelperText}
			</InputLabel>
		<fieldset
			style={{
				display: 'block',
				width: 'auto',
				minHeight: '1.1875em',
				padding: (isActive ? '18.5px 7px 16.5px 7px' : '18.5px 8px'),
				borderWidth: (isActive ? '2px' : '1px'),
				borderStyle: 'solid',
				borderColor: (
					isActive
					? theme.palette.secondary.main
					: (
						theme.palette.type === 'dark'
						? 'rgba(255,255,255,0.23)'
						: 'rgba(0,0,0,0.23)'
					)
				),
				transition: 'border-color 200ms ease 0ms',
				borderRadius: '8px',
				marginTop: '-5px',
			}}
		>
			<legend
				style={{
					width: 'auto',
					height: '11px',
					display: 'block',
					padding: '0',
					fontSize: '0.75em',
					textAlign: 'left',
					visibility: 'hidden',

					...(
						hasItems
						? {
							maxWidth: '1000px',
							transition: 'max-width 100ms ease 50ms',
						}
						: {
							maxWidth: '0.01px',
							transition: 'max-width 50ms ease 0ms',
						}
					)
				}}
			>
				<span style={{padding: '0 5px'}}>{label}{activeHelperText}</span>
			</legend>

			<div style={{margin: '-13px 0 -14px 0'}}>
				{items.map(item => (
					<Box
						key={item.index}
						index={item.index}
						label={item.label}
						type={item.type}
						onDelete={onRemoveItem}
					/>
				))}
			</div>
		</fieldset>
		</FormControl>
	)
}
export default Dustbin

	
