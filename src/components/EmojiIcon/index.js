import React from 'react'

export default class EmojiIcon extends React.Component {
	render() {
		return (
			<div
				key={this.props.key || this.props.icon}
				style={{
					width: '1em',
					height: '1em',
					display: 'inline-block',
					fontSize: '1.5rem',
					lineHeight: '1em',
					textAlign: 'center',
					...this.props.style,
				}}
			>
				{this.props.icon}
			</div>
		)
	}
}
