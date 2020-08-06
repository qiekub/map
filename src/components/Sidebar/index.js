import React from 'react'

import './index.css'

import SidebarPlace from '../SidebarPlace/'
import SidebarChangesets from '../SidebarChangesets/'

const Sidebar = props => {
	if (props.action === 'changesets') {
		return <SidebarChangesets {...props} />
	} else {
		return <SidebarPlace {...props} />
	}
}

export default Sidebar
