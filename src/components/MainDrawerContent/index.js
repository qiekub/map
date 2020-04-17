import React from 'react'
// import './index.css'

import { withLocalization } from '../Localized/'

import {
	List,
	ListItem,
	// ListItemIcon,
	ListItemText,
	// Divider,
} from '@material-ui/core'

import {
	// HistoryRounded as HistoryIcon,
	// ContactSupportRounded as ContactSupportIcon,
	// FullscreenRounded as FullscreenIcon,
	// FullscreenExitRounded as FullscreenExitIcon,
} from '@material-ui/icons'
import { withTheme } from '@material-ui/core/styles'

import buymeacoffee_green from '../../images/buymeacoffee_green.webp'

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
				<ListItemLink>
					<ListItemText primary={this.props.getString('imprint_and_pp')} />
				</ListItemLink>
				<ListItemLink href="mailto:thomas.rosen@qiekub.com">
					<ListItemText primary={this.props.getString('contact')} />
				</ListItemLink>
			</List>
			{/*<Divider />
			<List>
				{document.fullscreenEnabled ? (<ListItem button onClick={this.toogleFullscreen}>
					<ListItemIcon>
						{this.state.windowIsFullscreen ? <FullscreenExitIcon style={{color:'black'}} /> : <FullscreenIcon style={{color:'black'}} />}
					</ListItemIcon>
					<ListItemText primary={this.state.windowIsFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'} />
				</ListItem>) : null}
			</List>*/}

			<a
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
		</>)
	}
}

export default withLocalization(withTheme(MainDrawerContent))


