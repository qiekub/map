import React from "react"
import { useDrag } from "react-dnd"

import {
	Chip,
} from '@material-ui/core'

const Box = ({ index, type, label, onDelete }) => {
	const item = { index, type }

	const [{ isDragging }, drag] = useDrag({
		item,
		collect: monitor => ({
			isDragging: monitor.isDragging(),
		})
	})

	return (
		<Chip
			ref={drag}
			label={label}
			clickable={!isDragging}
			style={{
				cursor: 'move',
				margin: '0 2px 4px 2px',
				'WebkitTouchCallout': 'none',
				  'WebkitUserSelect': 'none',
				   'KhtmlUserSelect': 'none',
				     'MozUserSelect': 'none',
				      'MsUserSelect': 'none',
				        'userSelect': 'none',
				opacity: isDragging ? 0.4 : 1,
			}}
			onDelete={
				typeof onDelete === 'function'
				? () => onDelete(item)
				: null
			}
		/>
	)
}
export default Box
