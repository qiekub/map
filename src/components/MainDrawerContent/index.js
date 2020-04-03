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
				<ListItemLink>
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
		</>)
	}
}

export default withLocalization(MainDrawerContent)


