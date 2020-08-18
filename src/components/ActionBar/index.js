import React from 'react'

import { Localized } from '../Localized/'
import { withGlobals } from '../Globals/'

import {
	Paper,
	Chip,
} from '@material-ui/core'



class ActionBar extends React.Component {
	render() {
		return (
			<Paper
				className="blurredBG"
				elevation={6}
				variant="elevation"
				style={{
					margin: '8px 0 0 0',
					borderRadius: '24px',
					overflow: 'hidden',
					...this.props.style,
				}}
			>
				<div
					style={{
						overflow: 'auto',
						whiteSpace: 'nowrap',
						WebkitOverflowScrolling: 'touch',
						padding: '8px',
					}}
				>
					{
						(this.props.actions || []).map(action => {
							return <Chip
								key={action.title}
								icon={action.icon}
								label={<Localized id={action.title} />}
								onClick={action.onClick}
								style={{
									marginRight: '8px',
								}}
							/>
						})
					}
				</div>
			</Paper>
		)
	}
}

export default withGlobals(ActionBar)


