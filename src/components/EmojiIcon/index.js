import React from 'react'

export default class EmojiIcon extends React.Component {
	render() {
		return (
			<div style={{
				width: '1em',
				height: '1em',
				display: 'inline-block',
				fontSize: '1.5rem',
				lineHeight: '1em',
				textAlign: 'center',
			}}>
				{this.props.icon}
			</div>
		)
	}
}
