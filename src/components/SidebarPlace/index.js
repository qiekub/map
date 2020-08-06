/*
Wheelchair accessible / Not wheelchair accessible
*/

import React from 'react'

import { Localized, withLocalization } from '../Localized/'

import { navigate } from '@reach/router'
import {
	place as query_place,
	id as query_id,
	undecidedChangesets as query_undecidedChangesets,
	countrycode as query_countrycode,
} from '../../queries.js'

// import categories from '../../data/dist/categories.json'
import presets from '../../data/dist/presets.json'
import colors from '../../data/dist/colors.json'
import colorsByPreset from '../../data/dist/colorsByPreset.json'
import { getILGA, getAddressFormat, getTranslation, getTranslationFromArray, getColorByPreset/*, getPreset, getWantedTagsList*/ } from '../../functions.js'

import { withGlobals } from '../Globals/'

import {
	Chip,
	Typography,
	Fab,

	List,
	ListItem,
	ListItemIcon,
	ListItemText,

	Paper,
	Card,
	CardContent,
	Divider,

	Icon,
} from '@material-ui/core'
import {
	WarningRounded as WarningIcon,
	PlaceRounded as PlaceIcon,
	// Block as BlockIcon,
	// Announcement as AnnouncementIcon,
	// CheckRounded as CheckIcon,
	// ChildFriendly as ChildFriendlyIcon,
	// Explicit as ExplicitIcon,

	// Map as MapIcon,
	LinkRounded as LinkIcon,

	PhoneRounded as PhoneIcon,
	// PrintRounded as PrintIcon,
	MailRounded as MailIcon,

	// Facebook as FacebookIcon,
	// Instagram as InstagramIcon,
	// Twitter as TwitterIcon,
	// YouTube as YouTubeIcon,

	EditRounded as EditIcon,
	// Done as DoneIcon,
	// ArrowBack as ArrowBackIcon,
	// ArrowForward as ArrowForwardIcon,
} from '@material-ui/icons'
// import {
// 	Autocomplete
// } from '@material-ui/lab'
import { withTheme } from '@material-ui/core/styles'

import Changeset from '../Changeset/index.js'
import Questions from '../Questions/'
import EmojiIcon from '../EmojiIcon/'
import DiscriminationFacts from '../DiscriminationFacts/'

import yelp_icon from '../../images/yelp.png'
import facebook_icon from '../../images/facebook.png'
import instagram_icon from '../../images/instagram.png'
import youtube_icon from '../../images/youtube.png'
import twitter_icon from '../../images/twitter.png'
import openstreetmap_icon from '../../images/openstreetmap.svg'

const YelpIcon			= props => <Icon style={{backgroundImage:'url('+yelp_icon+')',		backgroundSize:'contain',backgroundRepeat:'no-repeat'}}></Icon>
const FacebookIcon		= props => <Icon style={{backgroundImage:'url('+facebook_icon+')',	backgroundSize:'contain',backgroundRepeat:'no-repeat'}}></Icon>
const InstagramIcon		= props => <Icon style={{backgroundImage:'url('+instagram_icon+')',	backgroundSize:'contain',backgroundRepeat:'no-repeat'}}></Icon>
const YouTubeIcon		= props => <Icon style={{backgroundImage:'url('+youtube_icon+')',	backgroundSize:'contain',backgroundRepeat:'no-repeat'}}></Icon>
const TwitterIcon		= props => <Icon style={{backgroundImage:'url('+twitter_icon+')',	backgroundSize:'contain',backgroundRepeat:'no-repeat'}}></Icon>
const OpenstreetmapIcon	= props => <Icon style={{backgroundImage:'url('+openstreetmap_icon+')',	backgroundSize:'contain',backgroundRepeat:'no-repeat'}}></Icon>


// import opening_hours from '../../scripts/opening_hours.js/index.js'
// import '../../scripts/opening_hours+deps.min.js'

// import opening_hours from 'opening_hours'

      // var oh = new window.opening_hours('do', {}, { 'locale': 'de' });

      // var prettified_value = oh.prettifyValue({
      //   conf: { locale: 'de' },
      // });

const ListItemLink = props => <ListItem button component="a" {...props} />

// const tag_suggestions = ['youthcenter','cafe','bar','education','community-center','youthgroup','group','mediaprojects']
// const this_is_a_place_for_suggestions = ['queer','undecided','friends','family','trans','inter','gay','hetero','bi','lesbian','friend']

class SidebarPlace extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			doc: {},
			page: '', // view edit
			headerText: '',
		}
		this.docCache = null

		this.wantedTagsList = [
			'name',
			'name:en',
			// 'name:',

			'preset',

			'audience:',
			'min_age',
			'max_age',

			// 'wheelchair',

			'addr:',
			'contact:email',
			'contact:phone',

			'contact:website',
			'contact:instagram',
			'contact:facebook',
			'contact:twitter',
			'contact:youtube',
			'contact:yelp',
			'osm_id',
			'wikipedia',
			'wikidata',

			'opening_date',
			'opening_date:',
			'closing_date',
			'closing_date:',

			'ISO3166-1:alpha3',
		]

		this.action = undefined
		this.docID = undefined

		this.editNewDoc = this.editNewDoc.bind(this)
		this.edit = this.edit.bind(this)
		this.view = this.view.bind(this)

		this.renderChangesets = this.renderChangesets.bind(this)
		this.renderSuggestions = this.renderSuggestions.bind(this)
		this.renderView = this.renderView.bind(this)
		this.renderQuestions = this.renderQuestions.bind(this)

		this.getAgeRangeText = this.getAgeRangeText.bind(this)

		this.checkIfDocIdChanged = this.checkIfDocIdChanged.bind(this)
		this.abortEdit = this.abortEdit.bind(this)

		this.chipFunction = this.chipFunction.bind(this)
	}

	componentDidMount(){
		this.checkIfDocIdChanged()
	}
	componentDidUpdate(){
		this.checkIfDocIdChanged()
	}
	componentWillUnmount(){
		if (this.placeQuerySubscription) {
			this.placeQuerySubscription.unsubscribe()
		}
	}
	checkIfDocIdChanged(){
		const { action, docID } = this.props

		if (
			this.action !== action ||
			this.docID !== docID
		) {
			this.action = action
			this.docID = docID

			if (!(!!action) /*|| !(!!docID)*/) {
				this.docCache = null
				this.setState({
					doc: {},
					page: '',
					headerText: '',
				})
			}else{
				if (action === 'add') {
					if (!(!!docID) || docID === '') {
						this.navigateToUnusedID()
					}else{
						this.editNewDoc(docID, 'Place')
					}
				} else if (action === 'country') {
					if (!!docID && docID !== '') {
						this.navigateToPlaceByCountryCode(docID) // docID is the country-code
					}
				}  else if (action === 'view') {
					if (!!docID && docID !== '') {
						this.loadAndViewDoc(docID, ()=>{
							this.setState({page:'view'})
						})
					}
				} else if (action === 'edit') {
					if (!!docID && docID !== '') {
						this.loadAndViewDoc(docID, ()=>{
							this.setState({page:'edit'})
						})
					}
				}
			}
		}
	}
	
	navigateToUnusedID(){
		if (!this.isNavigatingToUnusedID) {
			this.isNavigatingToUnusedID = true
			this.props.globals.graphql.query({
				query: query_id,
				fetchPolicy: 'no-cache',
			}).then(async result => {
				await navigate(`/add/${result.data.id}/`, { replace: true })
			}).catch(error=>{
				console.error(error)
			}).finally(()=>{
				// TODO can I use finally or is 90% browser support to less?
				delete this.isNavigatingToUnusedID
			})
		}
	}
	navigateToPlaceByCountryCode(iso_code){
		if (!this.isNavigatingToPlaceByCountryCode) {
			this.isNavigatingToPlaceByCountryCode = true
			this.props.globals.getCountryByCode(iso_code, async countryDoc => {
				if (!!countryDoc && !!countryDoc._id) {
					await navigate(`/view/${countryDoc._id}/`, { replace: true })
				}
				delete this.isNavigatingToPlaceByCountryCode
			})
		}
	}

	loadAndViewDoc(docID, callback){
		if (!!docID && docID !== '' && docID.length > 1 && /\S/.test(docID)) {
			this.placeQuerySubscription = this.props.globals.graphql.watchQuery({
				fetchPolicy: 'cache-and-network',
				query: query_place,
				variables: {
					languages: navigator.languages,
					_id: docID,
					wantedTags: this.wantedTagsList,
				},
			})
			.subscribe(({data}) => {
				if (!!data && !!data.place) {
					const doc = data.place

					if (
						doc._id === this.docID
						&& (
							this.docCache === null
							|| (this.docCache !== null && doc._id !== this.docCache._id)
						)
					) {
						this.docCache = doc

						this.loadChangesets(doc._id)
					
						if (this.props.onDontFilterTheseIds) {
							this.props.onDontFilterTheseIds([doc._id])
						}

						const preset = doc.properties.tags.preset

						doc.___preset = (
							!!preset && !!presets[preset]
							? {
								key: preset,
								...presets[preset],
							}
							: presets.default
						)
						doc.___color = getColorByPreset(doc.___preset.key,colorsByPreset) || colors.default
	
						this.setState({
							doc: doc,
							// page: 'view',
							headerText: (
								doc &&
								doc.properties &&
								doc.properties.name &&
								doc.properties.name.length > 0
								? getTranslationFromArray(doc.properties.name, this.props.globals.userLocales)
								: ''
							),
						}, ()=>{
							if (typeof callback === 'function') {
								callback()
							}
			
							let zoomLevel = this.props.globals.mainMapFunctions.getZoom()
							if (zoomLevel < 17) {
								zoomLevel = 17
							}
	
							if (!!doc.properties.geometry) {
								if (doc.properties.geometry.location) {
									this.setCountryCode(doc.properties.geometry.location)
								}

								if (new Date()*1 - this.props.globals.pageOpenTS*1 < 2000) {
									if (!!doc.properties.geometry.boundingbox) {
										this.props.globals.mainMapFunctions.fitBounds([
											[
												doc.properties.geometry.boundingbox.southwest.lat,
												doc.properties.geometry.boundingbox.southwest.lng,
											],
											[
												doc.properties.geometry.boundingbox.northeast.lat,
												doc.properties.geometry.boundingbox.northeast.lng,
											]
										])
									} else if (!!doc.properties.geometry.location) {
										this.props.globals.mainMapFunctions.setView(
											(
												this.props.globals.isSmallScreen
												? doc.properties.geometry.location
												: this.props.globals.mainMapFunctions.unproject(this.props.globals.mainMapFunctions.project(doc.properties.geometry.location, zoomLevel).add([-200,0]), zoomLevel) // add sidebar offset
											),
											zoomLevel
										)
									// }else{
									// 	this.props.globals.mainMapFunctions.flyTo(
									// 		[doc.properties.geometry.location.lat,doc.properties.geometry.location.lng],
									// 		zoomLevel,
									// 		{
									// 			animate: true,
									// 			duration: 1,
									// 		}
									// 	)
									}
								}
	
								if (!this.props.globals.isSmallScreen) {
									if (!!doc.properties.geometry.boundingbox) {
										// not implementable
									}else if (!!doc.properties.geometry.location) {
										const docLocation = doc.properties.geometry.location
										const asPixel = this.props.globals.mainMapFunctions.latLngToContainerPoint(docLocation)
										if (asPixel.x < 400) {
											this.props.globals.mainMapFunctions.panTo(
												this.props.globals.mainMapFunctions.unproject(this.props.globals.mainMapFunctions.project(docLocation).add([-200,0])) // add sidebar offset
											)
										}
									}
								}
							}
	
							this.props.onSetSidebarIsOpen(true)
							this.props.onSetSearchBarValue(this.state.headerText)
						})
					}else{
						if (typeof callback === 'function') {
							callback()
						}
					}
				}
			})
		}
	}

	setCountryCode({lng, lat}){
		this.props.globals.graphql.query({
			query: query_countrycode,
			variables: {
				lng,
				lat,
			},
		}).then(result => {
			if (result && result.data && result.data.countrycode) {
				const alpha3code = result.data.countrycode
				this.props.globals.getCountryByCode(alpha3code, countryDoc => {
					this.setState({
						countryCode: alpha3code,
						countryDoc,
					})
				})
			}else{
				this.setState({
					countryCode: null,
					countryDoc: null,
				})
			}
		}).catch(error=>{
			this.setState({
				countryCode: null,
				countryDoc: null,
			})
		})
	}



	loadChangesets(docID){
		if (this.props.globals.profileID === null) {
			this.setState({changesets: []})
		}else{
			this.props.globals.graphql.query({
				fetchPolicy: 'no-cache',
				query: query_undecidedChangesets,
				variables: {
					forID: docID,
				},
			}).then(({data}) => {
				if (!!data && !!data.undecidedChangesets) {
					this.setState({changesets: data.undecidedChangesets})
				}else{
					this.setState({changesets: []})
				}
			}).catch(error=>{
				console.error(error)
			})
		}
	}

	editNewDoc(docID, typename){
		const emptyDoc = {
			__typename: 'Doc',
			_id: docID,
			properties: {
				__typename: typename,
				tags: {},
				geometry: {
					location: {
						lat: 0,
						lng: 0,
					},
				}
			},
		}

		emptyDoc.___preset = presets.default
		emptyDoc.___color = getColorByPreset(emptyDoc.___preset.key,colorsByPreset) || colors.default


		this.setState({
			doc: emptyDoc,
			page: 'edit',
			headerText: this.props.getString('add_new_place_header_text'),
		}, ()=>{
			this.props.onSetSidebarIsOpen(true)
			this.props.onSetSearchBarValue(this.state.headerText)
		})
	}

	edit(){
		navigate(`/edit/${this.state.doc._id}/`)
	}
	view(){
		navigate(`/view/${this.state.doc._id}/`)
	}

	abortEdit(){
		if (this.props.action === 'add') {
			navigate(`/`)
		}else{
			navigate(`/view/${this.state.doc._id}/`)
		}
	}

	chipFunction(label){
		return (<Chip
			size="small"
			style={{
				margin: '0 4px 4px 0',
			}}
			key={label}
			label={this.props.getString(label.replace(/:/g, '_'), null, label)}
		/>)
	}

	renderILGA(tags){
		const alpha3code = tags['ISO3166-1:alpha3'] || this.state.countryCode || null
		if (!!alpha3code) {
			return (<DiscriminationFacts
				key={'d_facts_'+alpha3code}
				countryCode={alpha3code}
				toggleable={tags.preset !== 'boundary/administrative'}
				inline={tags.preset !== 'boundary/administrative'}
			/>)
		}else{
			return null
		}
	}

	getAgeRangeText(min_age,max_age){
		min_age = Number.parseInt(min_age)
		max_age = Number.parseInt(max_age)

		if (Number.isNaN(min_age) || min_age < 0) {
			min_age = null
		}
		if (Number.isNaN(max_age) || max_age < 0) {
			max_age = null
		}

		if (
			!!min_age && !Number.isNaN(min_age) &&
			!!max_age && !Number.isNaN(max_age)
		){
			const numbers = [min_age,max_age].sort((a,b)=>a-b)
			min_age = numbers[0]
			max_age = numbers[1]
		}

		return (
			min_age === null && max_age === null
			? '' // 'Für jedes Alter!'
			: (min_age === null && max_age !== null
			? this.props.getString('max_age_text', {age:max_age}) // 'Bis '+max_age+' Jahre'
			: (min_age !== null && max_age === null
			? this.props.getString('min_age_text', {age:min_age}) // 'Ab '+min_age+' Jahre'
			: (min_age !== null && max_age !== null
			? this.props.getString('age_range_text', {min_age,max_age}) // min_age+' bis '+max_age+' Jahre'
			: ''
		))))
	}

	parseLinks(links){
		// const links = `
		// 	https://www.anyway-koeln.de/
		// 	https://www.instagram.com/anyway_koeln/
		// `

		return [...new Set(links.match(/([a-z0-9]*:[^\s]+)/gmiu))].map(url=>new URL(url)).map(url=>{
			let obj = {
				url,
				href: url.href,
				text: url.href,
				type: 'default',
			}

			if (url.hostname === 'www.instagram.com' || url.hostname === 'instagram.com') {
				obj.type = 'instagram'
			} else if (url.hostname === 'www.facebook.com' || url.hostname === 'facebook.com') {
				obj.type = 'facebook'
			}else if (url.hostname === 'www.twitter.com' || url.hostname === 'twitter.com') {
				obj.type = 'twitter'
			}else if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {
				obj.type = 'youtube'
			}else if (url.protocol === 'tel:') {
				obj.type = 'phonenumber'
				obj.text = url.pathname
			}else if (url.protocol === 'mailto:') {
				obj.type = 'mail'
				obj.text = url.pathname
			}

			return obj
		})
	}

	/*renderOpeningHours(doc){
		const weekdayNames = 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday'.split(' ')

		if (!!doc.properties.tags.opening_hours) {
			const hours = doc.properties.tags.opening_hours

			try {
				const oh = new window.opening_hours(hours, {}, {
					'locale': 'de-DE'
				})
	
				let now = new Date()
				let from = new Date(now.getFullYear(), now.getMonth(), now.getDate()-1, 0, 0, 0, 0)
	
				let days = []
				for (var i = 0; i < 7; i++) {
					const to = new Date(from.getTime()+(86400*1000)) // 86400 = 1 day | 518400 = 6 days
	
					const weekdayName = weekdayNames[from.getDay()]
					const intervals = oh.getOpenIntervals(from, to).map(range=>{
						return `${(range[0].getHours()+'').padStart(2,'0')}:${(range[0].getMinutes()+'').padStart(2,'0')}–${(range[1].getHours()+'').padStart(2,'0')}:${(range[1].getMinutes()+'').padStart(2,'0')}`
					})
	
					days.push(<ListItem key={weekdayName} style={{display:'flex',alignItems:'flex-start'}}>
						<ListItemText style={{width:'100px'}}>{weekdayName}</ListItemText>
						<div>
							{intervals.length === 0 ? <ListItemText>Geschlossen</ListItemText> : intervals.map(text=><ListItemText style={{display:'block'}}>{text}</ListItemText>)}
						</div>
					</ListItem>)
	
					from = to
				}
	
				return days
			}catch(error){
				console.error('Error while parsing opening_hours:', error)
				return null
			}
		}

		return null
	}*/

	getAudience(tags){
		const audience_namespace = 'audience'
		const audience_namespace_length = (audience_namespace+':').length

		const audienceTags = Object.entries(tags)
		.filter(entry => entry[0].startsWith(audience_namespace+':'))
		.map(entry => [entry[0].substring(audience_namespace_length), entry[1]])

		return {
			only: audienceTags.filter(entry => entry[0] !== 'queer' && entry[1] === 'only').map(entry => entry[0]),
			primary: audienceTags.filter(entry => entry[0] !== 'queer' && entry[1] === 'primary').map(entry => entry[0]),
			welcome: audienceTags.filter(entry => entry[0] !== 'queer' && entry[1] === 'welcome').map(entry => entry[0]),
		}
	}

	renderAudience(tags){
		const audience = this.getAudience(tags)

		const audience_queer = tags['audience:queer']

		let audienceHeading = null
		let audienceText = null
		let audienceIcon = null
		if (audience_queer && audience_queer === 'only') {
			audienceHeading = this.props.getString('audience_heading_queer_only')
			audienceText = this.props.getString('audience_text_queer_only')
			audienceIcon = <EmojiIcon icon={this.props.globals.emojis.audience_queer_only} />
		} else if (audience_queer && audience_queer === 'primary') {
			audienceHeading = this.props.getString('audience_heading_queer_primary')
			audienceText = this.props.getString('audience_text_queer_primary')
			audienceIcon = <EmojiIcon icon={this.props.globals.emojis.audience_queer_primary} />
		} else if (audience_queer && audience_queer === 'welcome') {
			audienceHeading = this.props.getString('audience_heading_queer_welcome')
			audienceIcon = <EmojiIcon icon={this.props.globals.emojis.audience_queer_welcome} />
		} else {
			audienceHeading = this.props.getString('audience_heading_be_cautios')
			audienceText = this.props.getString('audience_text_be_cautios')
			audienceIcon = <WarningIcon />

			const alpha3code = tags['ISO3166-1:alpha3']
			if (
				tags.preset === 'boundary/administrative'
				&& alpha3code
			) {
				const ilga = getILGA(alpha3code)
				if (!!ilga && !!ilga.ilga) {
					return null
				}
			}
		}


		const age_range_text = this.getAgeRangeText(tags.min_age, tags.max_age)

		return (
			<List key="Audience" dense>
				<ListItem>
					<ListItemIcon style={
						!!audienceText
						? {
							alignSelf: 'flex-start',
							paddingTop: '12px',
						}
						: {}
					}>
						{audienceIcon}
					</ListItemIcon>
					<ListItemText
						primary={audienceHeading}
						secondary={audienceText}
					/>
				</ListItem>
				
				{
					audience.only.length > 0
					? (
						<ListItem>
							<ListItemText
								style={{marginLeft: '56px'}}
								primaryTypographyProps={{
									component: 'div',
								}}
								primary={<>
									{this.props.getString('audience_only_heading')}&nbsp; {audience.only.map(this.chipFunction)}
								</>}
							/>
						</ListItem>
					)
					: null
				}
				
				{
					audience.primary.length > 0
					? (
						<ListItem>
							<ListItemText
								style={{marginLeft: '56px'}}
								primaryTypographyProps={{
									component: 'div',
								}}
								primary={<>
									{this.props.getString('audience_primary_heading')}&nbsp; {audience.primary.map(this.chipFunction)}
								</>}
							/>
						</ListItem>
					)
					: null
				}

				{
					audience.welcome.length > 0
					? (
						<ListItem>
							<ListItemText
								style={{marginLeft: '56px'}}
								primaryTypographyProps={{
									component: 'div',
								}}
								primary={<>
									{this.props.getString('audience_welcome_heading')}&nbsp; {audience.welcome.map(this.chipFunction)}
								</>}
							/>
						</ListItem>
					)
					: null
				}

				{
					age_range_text === ''
					? null
					: (
						<ListItem>
							<ListItemText
								style={{marginLeft: '56px'}}
								primary={this.props.getString('age_restriction')}
								secondary={age_range_text}
								primaryTypographyProps={{
									style: {
										display: 'inline-block',
										marginRight: '8px',
									},
								}}
								secondaryTypographyProps={{
									style: {
										display: 'inline-block',
									},
								}}
							/>
						</ListItem>
					)
				}
			</List>
		)
	}

	renderGeneral(tags){

		const rows = []

		const address_format = getAddressFormat(tags)
		if (!!address_format) {
			const address = address_format.format.map(part => {
				const mappedParts = part.map(key => !!tags['addr:'+key] ? tags['addr:'+key] : null).filter(v=>v)
				return mappedParts.length > 0 ? mappedParts.join(' ') : null
			}).filter(v=>v).join(', ')

			if (address !== '') {
				rows.push(
					<ListItem target="_blank" key="Address">
						<ListItemIcon><PlaceIcon /></ListItemIcon>
						<ListItemText primary={address} />
					</ListItem>
				)
			}
		}

		const email = tags['contact:email'] || tags['email']
		if (!!email) {
			rows.push(
				<ListItemLink target="_blank" key="Email" href={'mailto:'+email}>
					<ListItemIcon><MailIcon /></ListItemIcon>
					<ListItemText primary={email} />
				</ListItemLink>
			)
		}

		const phonenumber = tags['contact:phone'] || tags['phone']
		if (!!phonenumber) {
			rows.push(
				<ListItemLink target="_blank" key="Phonenumber" href={'tel:'+phonenumber}>
					<ListItemIcon><PhoneIcon /></ListItemIcon>
					<ListItemText primary={phonenumber} />
				</ListItemLink>
			)
		}

		return (
			rows.length === 0
			? null
			: (<List key="General" dense>{rows}</List>)
		)
	}

	renderLinks(tags){
		// https://wiki.openstreetmap.org/wiki/Key:contact
		//
		// properties.links = `
		// 	https://www.anyway-koeln.de/
		// 	https://www.instagram.com/anyway_koeln/
		// 	https://www.facebook.com/anyway_koeln/
		// 	https://www.youtube.com/anyway_koeln/
		// 	https://www.twitter.com/anyway_koeln/
		// 	tel:09234658723
		// 	mailto:kjqhgr@sadf.asdf
		// `

		// eslint-disable-next-line
		const get_username_regexp = /.*\/([^\/]+)\/?/

		const links = []

		const website = tags['contact:website'] || tags['website']
		if (!!website) {
			const matches = website.match(/(?:.*?:\/\/)?(?:www\.)?(?:(.+)\/|(.+))/)
			links.push({
				href: website,
				text: !!matches ? matches[1] || matches[2] : website,
				icon: <LinkIcon />,
			})
		}

		const facebook = tags['contact:facebook'] || tags['facebook']
		if (!!facebook) {
			const matches = facebook.match(get_username_regexp)
			links.push({
				href: !!matches ? facebook : 'https://facebook.com/'+facebook,
				text: !!matches ? '@'+matches[1] : '@'+facebook,
				icon: <FacebookIcon />
			})
		}

		const instagram = tags['contact:instagram'] || tags['instagram']
		if (!!instagram) {
			const matches = instagram.match(get_username_regexp)
			links.push({
				href: !!matches ? instagram : 'https://instagram.com/'+instagram,
				text: !!matches ? '@'+matches[1] : '@'+instagram,
				icon: <InstagramIcon />
			})
		}

		const youtube = tags['contact:youtube'] || tags['youtube']
		if (!!youtube) {
			const matches = youtube.match(get_username_regexp)
			links.push({
				href: !!matches ? youtube : 'https://youtube.com/user/'+youtube,
				text: !!matches ? '@'+matches[1] : '@'+youtube,
				icon: <YouTubeIcon />,
			})
		}

		const twitter = tags['contact:twitter'] || tags['twitter']
		if (!!twitter) {
			const matches = twitter.match(get_username_regexp)
			links.push({
				href: !!matches ? twitter : 'https://twitter.com/'+twitter,
				text: !!matches ? '@'+matches[1] : '@'+twitter,
				icon: <TwitterIcon />,
			})
		}

		const yelp = tags['contact:yelp'] || tags['yelp']
		if (!!yelp) {
			links.push({
				href: yelp,
				text: this.props.getString('view_on_yelp'),
				icon: <YelpIcon />,
			})
		}

		const osm_id = tags['osm_id']
		if (!!osm_id) {
			links.push({
				href: 'https://openstreetmap.org/'+osm_id,
				text: this.props.getString('view_on_osm'),
				icon: <OpenstreetmapIcon />, // <MapIcon />,
			})
		}

		return (
			links.length === 0
			? null
			: (<List key="Links" dense>
				{links.map(link => (
					<ListItemLink target="_blank" key={link.href} href={link.href}>
						<ListItemIcon>{link.icon}</ListItemIcon>
						<ListItemText primary={link.text} />
					</ListItemLink>
				))}
			</List>)
		)
	}

	renderChangesets(changesets){
		if (changesets.length === 0) {
			return null
		}

		return this.state.changesets.map(changeset => <Changeset key={changeset._id} changeset={changeset} variant="outlined" />)
	}

	renderSuggestions(){
		const changesets = this.state.changesets || []

		if (changesets.length === 0) {
			return null
		}

		return (<div style={{
			marginTop: '32px',
		}}>
			<Divider style={{margin:'8px -16px'}} />

			<Typography variant="subtitle1" style={{
				margin: '16px 0',
			}}>Proposed Improvements</Typography>

			{this.renderChangesets(changesets)}
		</div>)
	}

	renderView(doc){
		const properties = doc.properties || {}
		const tags = properties.tags || {}

		return (<React.Fragment key="view">
			<Card
				key="sidebarContentCard"
				elevation={6}
				className="sidebarContentCard"
				style={{
					backgroundColor: this.props.theme.palette.background.paper,
				}}
			>
				<CardContent>

					{
						[
							{key:'Audience', component:this.renderAudience(tags)},
							{key:'ILGA', component:this.renderILGA(tags)},
							{key:'General', component:this.renderGeneral(tags)},
							{key:'Links', component:this.renderLinks(tags)},
						]
						.filter(v=>!!v.component)
						.reduce((parts,value) => {
							parts.push(value.component)
							parts.push(<Divider key={"divider_"+value.key} style={{margin:'8px -16px'}} />)
							return parts
						}, [])
					}

					<div key="improveButtonWrapper" style={{
						display: (tags.preset === 'boundary/administrative' ? 'none' : 'block'),
						marginTop: '32px',
						textAlign: 'center',
					}}>
						<Fab
							key="improveButton"
							variant="extended"
							onClick={this.edit}
							size="large"
							color="secondary"
							className="improveFab"
						>
							<EditIcon className="icon" key="improveButtonIcon"/>
							<Localized id="improve" key="improveButtonLocalized" />
						</Fab>
					</div>

					{this.renderSuggestions()}
				</CardContent>
			</Card>
		</React.Fragment>)
	}
	renderQuestions(doc){
		const startQuestions = (
			this.props.action === 'add'
			? ['preset','geo_pos','name','audience','website','answer_more']
			: ['start_improve']
		)

		return (<React.Fragment key="editing">
			<Card
				key="sidebarContentCard"
				elevation={6}
				className="sidebarContentCard"
				style={{
					backgroundColor: this.props.theme.palette.background.default,
				}}
			>
			<CardContent>
				<Questions
					key="the_questions"
					startQuestions={startQuestions}
					doc={doc}
					onFinish={
						this.props.action === 'add'
						? this.abortEdit
						: this.view
					}
					onAbort={this.abortEdit}
				/>
			</CardContent>
			</Card>
		</React.Fragment>)
	}

	render(){
		const doc = this.state.doc

		if (
			!(!!doc)
			|| !(['view','edit','loading'].includes(this.state.page))
		) {
			return null
		}

		let headerBackgroundColor = ''
		let headerForegroundColor = ''
		if (
			!!doc
			&& !!doc.___color
			&& doc.___color.key !== 'default'
		) {
			headerBackgroundColor = doc.___color.bg
			headerForegroundColor = doc.___color.fg
		}else{
			headerBackgroundColor = this.props.theme.palette.background.default
			headerForegroundColor = this.props.theme.palette.getContrastText(headerBackgroundColor)
		}

		let currentPage = null
		if (this.state.page === 'view') {
			currentPage = this.renderView(doc)
		} else if (this.state.page === 'edit') {
			currentPage = this.renderQuestions(doc)

		let presetTypeHader = null
		if (
			!!doc
			&& !!doc.___preset
			&& doc.___preset.key !== ''
			&& doc.___preset.key !== 'default'
		) {
			presetTypeHader = (
				<ListItem
					style={{
						color: headerForegroundColor,
					}}
				>
					<ListItemIcon>
						<div
							className="material-icons-round"
							style={{
								color: headerForegroundColor,
							}}
						>
							{
								doc.___preset.icon
								? doc.___preset.icon.toLowerCase()
								: 'place'
							}
						</div>
					</ListItemIcon>
					<ListItemText
						primary={
							getTranslation(doc.___preset.name, this.props.globals.userLocales)
						}
					/>
				</ListItem>
			)
		}

		return (<>
			<Paper
				elevation={6}
				className={this.props.className}
				style={{
					backgroundColor: headerBackgroundColor,
					color: headerForegroundColor,
				}}
			>

			<Card
				elevation={0}
				style={{
					margin: '0 0 -8px 0',
					borderRadius: '0px',
					padding: '86px 0 8px 0',
					flexShrink: 0,

					background: 'transparent',
				}}
			>
				<CardContent>
					<Typography gutterBottom variant="h4" component="h1" style={{margin:'0 16px',fontWeight:'900',color:headerForegroundColor}}>
						{this.state.headerText}
					</Typography>
					
					{presetTypeHader}
				</CardContent>
			</Card>

			{currentPage}

			</Paper>
		</>)
	}
}

export default withGlobals(withLocalization(withTheme(SidebarPlace)))


