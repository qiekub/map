import React from 'react'
// import './index.css'

import { withLocalization, Localized } from '../Localized/'
import { withGlobals } from '../Globals/'
import { navigate } from '@reach/router'

import {
	// Button,
	Link,
	Icon,

	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	ListSubheader,
	Divider,
} from '@material-ui/core'

import {
	HistoryRounded as HistoryIcon,
	PriorityHighRounded as PriorityHighIcon,
	EmailRounded as EmailIcon,
} from '@material-ui/icons'
import { withTheme } from '@material-ui/core/styles'

// import buymeacoffee_green from '../../images/buymeacoffee_green.png'
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

		this.viewChangesets = this.viewChangesets.bind(this)
	}

	async viewChangesets(){
		await navigate('/changesets/')
		if (this.props.onClose) {
			this.props.onClose()
		}
	}

	render() {

		/*
		# QueerMap
		by Qiekub
		
		- About
		- Blog
		- Similar projects
		
		--------------------------
		
		## Settings
		- Language (EN/DE/...)
		- Theme (Dark/Light)
		
		--------------------------
		
		## Contribute
		- Add a place
		- Promote the QueerMap
		- Help translating
		- Help programming
		- Give feedback
		- Donate
		
		## Follow us on...
		- Facebook
		- Instagram
		- Twitter
		- GitHub
		
		## Legal
		- Imprint
		- Privacy Policy
		- Contact
		*/

		return (<>
			<List
				dense
			>
				<ListItem
					style={{
						paddingRight: '64px',
					}}
				>
					<ListItemText
						primary="QueerMap"
						secondary={
							<Localized
								id="by_brandname_link"
								elems={{
									mainlink: <Link style={{color:this.props.theme.palette.text.primary}} target="_blank" href="https://qiekub.org/" />,
								}}
							/>
						}
						primaryTypographyProps={{
							variant: 'h4',
						}}
					/>
				</ListItem>
		
				{/*
				<ListItemLink
					target="_blank"
					href="https://www.qiekub.org/impressum.html"
				>
					<ListItemText inset primary={<Localized id="about" />} />
				</ListItemLink>
				<ListItemLink
					target="_blank"
					href="https://www.qiekub.org/impressum.html"
				>
					<ListItemText inset primary={<Localized id="blog" />} />
				</ListItemLink>
				<ListItemLink
					target="_blank"
					href="https://www.qiekub.org/impressum.html"
				>
					<ListItemText inset primary={<Localized id="similar_projects" />} />
				</ListItemLink>
				*/}
			</List>
		

			{
				!!this.props.globals.profileID
				? (<>
					<Divider />
	
					<List
						dense
					>
						<ListItemLink
							onClick={this.viewChangesets}
						>
							<ListItemIcon>
								<HistoryIcon />
							</ListItemIcon>
							<ListItemText primary={<Localized id="changesets" />} />
						</ListItemLink>
					</List>
				</>)
				: null
			}

			<Divider />
		
		
			<List
				dense
				subheader={
					<ListSubheader disableSticky>
						<Localized id="subheader_follow_us" />
					</ListSubheader>
				}
			>
				<ListItemLink
					target="_blank"
					href="https://www.facebook.com/qiekub/"
					aria-label="Facebook"
					title="Facebook"
				>
					<ListItemIcon>
						<FacebookIcon />
					</ListItemIcon>
					<ListItemText primary="Facebook" />
				</ListItemLink>
				<ListItemLink
					target="_blank"
					href="https://www.instagram.com/qiekub/"
					aria-label="Instagram"
					title="Instagram"
				>
					<ListItemIcon>
						<InstagramIcon />
					</ListItemIcon>
					<ListItemText primary="Instagram" />
				</ListItemLink>
				<ListItemLink
					target="_blank"
					href="https://twitter.com/qiekub"
					aria-label="Twitter"
					title="Twitter"
				>
					<ListItemIcon>
						<TwitterIcon />
					</ListItemIcon>
					<ListItemText primary="Twitter" />
				</ListItemLink>
				<ListItemLink
					target="_blank"
					href="https://github.com/qiekub"
					aria-label="Github"
					title="Github"
				>
					<ListItemIcon>
						<GithubIcon style={{
							fill: this.props.theme.palette.text.primary,
							width: '1.5em',
							height: '1.5em',
						}}/>
					</ListItemIcon>
					<ListItemText primary="Github" />
				</ListItemLink>
			</List>
		
			{/*
			<Divider />
		
		
			<List
				dense
				subheader={<ListSubheader disableSticky>Contribute</ListSubheader>}
			>
				<ListItem>
					<ListItemText inset primary="Add a place" />
				</ListItem>
				<ListItem>
					<ListItemText inset primary="Promote the map" />
				</ListItem>
				<ListItem>
					<ListItemText inset primary="Help Translating" />
				</ListItem>
				<ListItem>
					<ListItemText inset primary="Help Programming" />
				</ListItem>
				<ListItem>
					<ListItemText inset primary="Give feedback" />
				</ListItem>
				<ListItem>
					<ListItemText inset primary="Donate" />
				</ListItem>
			</List>
			*/}
		
			<Divider />
		
		
			<List
				dense
				subheader={
					<ListSubheader disableSticky>
						<Localized id="subheader_legal" />
					</ListSubheader>
				}
			>
				<ListItemLink
					target="_blank"
					href="https://www.qiekub.org/impressum.html"
					aria-label={this.props.getString('imprint')}
					title={this.props.getString('imprint')}
				>
					<ListItemIcon>
						<PriorityHighIcon />
					</ListItemIcon>
					<ListItemText primary={this.props.getString('imprint')} />
				</ListItemLink>
				<ListItemLink
					target="_blank"
					href="https://www.qiekub.org/datenschutz.html"
					aria-label={this.props.getString('privacy_policy')}
					title={this.props.getString('privacy_policy')}
				>
					<ListItemIcon>
						<PriorityHighIcon />
					</ListItemIcon>
					<ListItemText primary={this.props.getString('privacy_policy')} />
				</ListItemLink>
				<ListItemLink
					href="mailto:thomas.rosen@qiekub.org"
					aria-label={this.props.getString('contact')}
					title={this.props.getString('contact')}
				>
					<ListItemIcon>
						<EmailIcon />
					</ListItemIcon>
					<ListItemText primary={this.props.getString('contact')} />
				</ListItemLink>
			</List>
		
			<div style={{paddingBottom:'128px'}}></div>
		
		</>)
		
		/*
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
		*/
	}
}

export default withGlobals(withLocalization(withTheme(MainDrawerContent)))


