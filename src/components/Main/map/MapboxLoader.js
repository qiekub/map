import React from 'react'

import mapboxgl from 'mapbox-gl'
import './mapbox-gl.v1.12.0.css' // https://api.tiles.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css

mapboxgl.accessToken = 'pk.eyJ1IjoicWlla3ViIiwiYSI6ImNrOTFwdGRxajAwODIzaXFwaG02ODlteTMifQ.n4y40LbSaVs_oJcR-czHGg'

// mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.0/mapbox-gl-rtl-text.js')

class MapboxLoader extends React.Component {
	constructor(props) {
		super(props)
		this.loaded = false

		this.gotMapRef = this.gotMapRef.bind(this)
	}
	
	gotMapRef(ref){
		if (!!ref && !this.loaded && this.props.onLoad) {
			this.props.onLoad({ref, mapboxgl})
		}
	}

	render() {
		return (<div ref={this.gotMapRef} {...this.props}></div>)
	}
}

export default MapboxLoader
