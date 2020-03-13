import React from 'react'
import './index.css'

import {
	Card,
	// CardActions,
	CardActionArea,
	CardContent,
	Typography,
	// Divider,
	// Button,
} from '@material-ui/core'

export default class InfoCard extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			fullview: false,
		}

		this.openFullView = this.openFullView.bind(this)
	}

	openFullView(){
		this.setState({fullview:!this.state.fullview})
		if (this.props.onOpenFullView) {
			this.props.onOpenFullView()
		}
	}

	render() {
		const place = this.props.place
		if (!(!!place.name) || place.name === '') {
			return ""
		}

		const tags_text = place.tags.join(', ')

		const age_text = (
			place.min_age === -1 && place.max_age === -1
			? "Für jedes Alter!"
			: (place.min_age === -1 && place.max_age !== -1
			? "Bis "+place.max_age+" Jahre"
			: (place.min_age !== -1 && place.max_age === -1
			? "Ab "+place.min_age+" Jahre"
			: (place.min_age !== -1 && place.max_age !== -1
			? place.min_age+" bis "+place.max_age+" Jahre"
			: ""
		))))

		return (<div {...this.props}>
			<Card className={'infocard '+(this.state.fullview ? ' fullView' : '')} elevation={6}>
				<CardActionArea onClick={this.openFullView}>
					<CardContent>
						<Typography variant="h6" gutterBottom>{place.name}</Typography>
						
						{tags_text === '' ? null : <Typography variant="body2" component="p" color="textSecondary">{tags_text}</Typography>}
						{age_text === '' ? null : <Typography variant="body2" component="p" color="textSecondary">{age_text}</Typography>}
	
					</CardContent>
				</CardActionArea>
				{/*<Divider />
				<CardActions>
					<Button onClick={this.openFullView}>Bearbeiten</Button>
				</CardActions>*/}
			</Card>
		</div>)
	}
}


/*
	{place.address === '' ? null : <Typography variant="body2" component="p" color="textSecondary" gutterBottom>{place.address}</Typography>}

	{(place.website != "" ? <>Webseite: <a href="{place.website}" target="_blank">{place.website}</a></> : null)}
*/


