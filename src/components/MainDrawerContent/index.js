import React from 'react'
// import './index.css'

import { withLocalization, Localized } from '../Localized/'

import {
	Button,
	Link,
	Icon,

	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Divider,
} from '@material-ui/core'

import {
	// HistoryRounded as HistoryIcon,
	// ContactSupportRounded as ContactSupportIcon,
	// FullscreenRounded as FullscreenIcon,
	// FullscreenExitRounded as FullscreenExitIcon,
} from '@material-ui/icons'
import { withTheme } from '@material-ui/core/styles'

import buymeacoffee_green from '../../images/buymeacoffee_green.png'
import { ReactComponent as GithubIcon } from '../../images/github_mark_black.svg'

import facebook_icon from '../../images/facebook.png'
import instagram_icon from '../../images/instagram.png'
import twitter_icon from '../../images/twitter.png'

const FacebookIcon		= props => <Icon style={{backgroundImage:'url('+facebook_icon+')',	backgroundSize:'contain',backgroundRepeat:'no-repeat'}}></Icon>
const InstagramIcon		= props => <Icon style={{backgroundImage:'url('+instagram_icon+')',	backgroundSize:'contain',backgroundRepeat:'no-repeat'}}></Icon>
const TwitterIcon		= props => <Icon style={{backgroundImage:'url('+twitter_icon+')',	backgroundSize:'contain',backgroundRepeat:'no-repeat'}}></Icon>



const ListItemLink = props => <ListItem button component="a" {...props} />

class MainDrawerContent extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			windowIsFullscreen: false,
		}

		this.toogleFullscreen = this.toogleFullscreen.bind(this)
	}

	toogleFullscreen(){
		if (document.fullscreenEnabled) {
			if (document.fullscreenElement === null) {
				document.querySelector('body').requestFullscreen().then(()=>{
					this.setState({windowIsFullscreen:true})
				})
			}else{
				document.exitFullscreen().then(()=>{
					this.setState({windowIsFullscreen:false})
				})
			}
		}
	}

	render() {
		return (<>
			<List>
				<ListItemLink target="_blank" href="https://www.qiekub.org/impressum.html" aria-label={this.props.getString('imprint')} title={this.props.getString('imprint')}>
					<ListItemText primary={this.props.getString('imprint')} />
				</ListItemLink>
				<ListItemLink target="_blank" href="https://www.qiekub.org/datenschutz.html" aria-label={this.props.getString('privacy_policy')} title={this.props.getString('privacy_policy')}>
					<ListItemText primary={this.props.getString('privacy_policy')} />
				</ListItemLink>
				<ListItemLink href="mailto:thomas.rosen@qiekub.org" aria-label={this.props.getString('contact')} title={this.props.getString('contact')}>
					<ListItemText primary={this.props.getString('contact')} />
				</ListItemLink>
			</List>

			<Divider />

			<List>
				<ListItemLink
					target="_blank"
					href="https://www.facebook.com/qiekub/"
					aria-label={this.props.getString('follow_button_facebook')}
					title={this.props.getString('follow_button_facebook')}
				>
					<ListItemIcon>
						<FacebookIcon />
					</ListItemIcon>
					<ListItemText primary={this.props.getString('follow_button_facebook')} />
				</ListItemLink>
				<ListItemLink
					target="_blank"
					href="https://www.instagram.com/qiekub/"
					aria-label={this.props.getString('follow_button_instagram')}
					title={this.props.getString('follow_button_instagram')}
				>
					<ListItemIcon>
						<InstagramIcon />
					</ListItemIcon>
					<ListItemText primary={this.props.getString('follow_button_instagram')} />
				</ListItemLink>
				<ListItemLink
					target="_blank"
					href="https://twitter.com/qiekub"
					aria-label={this.props.getString('follow_button_twitter')}
					title={this.props.getString('follow_button_twitter')}
				>
					<ListItemIcon>
						<TwitterIcon />
					</ListItemIcon>
					<ListItemText primary={this.props.getString('follow_button_twitter')} />
				</ListItemLink>
				<ListItemLink
					target="_blank"
					href="https://github.com/qiekub"
					aria-label={this.props.getString('github_button')}
					title={this.props.getString('github_button')}
				>
					<ListItemIcon>
						<GithubIcon style={{
							fill: 'black',
							width: '1.5em',
							height: '1.5em',
						}}/>
					</ListItemIcon>
					<ListItemText primary={this.props.getString('github_button')} />
				</ListItemLink>
			</List>

			<Divider />

			{/*<List>
				{document.fullscreenEnabled ? (<ListItem button onClick={this.toogleFullscreen}>
					<ListItemIcon>
						{this.state.windowIsFullscreen ? <FullscreenExitIcon style={{color:'black'}} /> : <FullscreenIcon style={{color:'black'}} />}
					</ListItemIcon>
					<ListItemText primary={this.state.windowIsFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'} />
				</ListItem>) : null}
			</List>*/}

			<div style={{margin: '16px 0', textAlign: 'center'}}>
			<a
				aria-label="Buy me a coffee"
				title="Buy me a coffee"
				href="https://www.buymeacoffee.com/thomasrosen"
				target="_blank"
				rel="noopener noreferrer"
				style={{
					margin: '16px',
				}}
			>
				<img src={buymeacoffee_green} alt="Buy Me A Coffee" style={{
					width: '200px',
					borderRadius: '8px',
					boxShadow: this.props.theme.shadows[3],
				}} />
			</a>
			</div>
		</>)
	}
}

export default withLocalization(withTheme(MainDrawerContent))


