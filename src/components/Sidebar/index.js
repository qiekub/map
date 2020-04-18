/*
Wheelchair accessible / Not wheelchair accessible
*/

import React from 'react'
import './index.css'

import { Localized } from '../Localized/'

// import {navigate/*,Router,Link*/} from '@reach/router'
// import {gql} from 'apollo-boost'
// import {loadPlace as query_loadPlace} from '../../queries.js'

import {
	getID as query_getID,
} from '../../queries.js'

// import categories from '../../data/dist/categories.json'
import presets from '../../data/dist/presets.json'
import colors from '../../data/dist/colors.json'
import colorsByPreset from '../../data/dist/colorsByPreset.json'
import {getPreset, getColorByPreset} from '../../functions.js'

import {
	Typography,
	Fab,

	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	ListSubheader,

	Paper,
	Card,
	CardContent,

	Icon,
} from '@material-ui/core'
import {
	// Block as BlockIcon,
	// Announcement as AnnouncementIcon,
	CheckRounded as CheckIcon,
	// ChildFriendly as ChildFriendlyIcon,
	// Explicit as ExplicitIcon,

	// Map as MapIcon,
	LinkRounded as LinkIcon,

	PhoneRounded as PhoneIcon,
	PrintRounded as PrintIcon,
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

import Questions from '../Questions/'

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

class Sidebar extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			isNewDoc: false,
			doc: {},
			stage: 'viewing', // viewing editing submitting
			headerText: '',
		}

		this.editNewDoc = this.editNewDoc.bind(this)
		this.setDoc = this.setDoc.bind(this)
		this.edit = this.edit.bind(this)
		this.view = this.view.bind(this)
		// this.submit = this.submit.bind(this)
		// this.back = this.back.bind(this)

		this.renderView = this.renderView.bind(this)
		this.renderQuestions = this.renderQuestions.bind(this)

		this.getAgeRangeText = this.getAgeRangeText.bind(this)

		this.checkIfDocIdChanged = this.checkIfDocIdChanged.bind(this)
	}

	componentDidMount(){
		if (this.props.onFunctions) {
			this.props.onFunctions({
				editNewDoc: this.editNewDoc,
				setDoc: (...attr)=>this.setDoc(...attr),
				getWantedTagsList: ()=>{
					return [
						'min_age',
						'max_age',

						'wheelchair',

						'contact:',

						'website',
						'email',
						'phone',
						'fax',

						'instagram',
						'facebook',
						'twitter',
						'youtube',
						'yelp',
					]
				}
			})
		}

		this.checkIfDocIdChanged()
	}
	componentDidUpdate(){
		this.checkIfDocIdChanged()
	}
	async checkIfDocIdChanged(){
		const docID = this.props.docID
		if (!!docID && docID !== this.state.doc._id && this.props.onViewDoc) {
			// await navigate(`/place/${doc._id}/`)
			if (docID !== 'add') {
				this.props.onViewDoc(docID)
			}
		}
	}

	editNewDoc(typename){
		window.graphql.query({
			query: query_getID,
		}).then(async result => {
			const emptyDoc = {
				__typename: 'Doc',
				_id: result.data.id,
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

			emptyDoc.___preset = getPreset(emptyDoc.properties.tags || {}, presets)
			emptyDoc.___color = getColorByPreset(emptyDoc.___preset.key,colorsByPreset) || colors.default

			this.setState({
				isNewDoc: true,
				doc: emptyDoc,
				stage: 'editing',
				headerText: 'Add a new place'
			}, ()=>{
				this.props.onSetSidebarIsOpen(true)
				this.props.onSetSearchBarValue(this.state.headerText)
			})
		}).catch(error=>{
			console.error(error)
		})
	}
	setDoc(newDoc) {
		if (newDoc !== null && newDoc._id !== null) {
			newDoc.___preset = getPreset(newDoc.properties.tags || {}, presets)
			newDoc.___color = getColorByPreset(newDoc.___preset.key,colorsByPreset) || colors.default

			this.setState({
				isNewDoc: false,
				doc: newDoc,
				stage: 'viewing',
				headerText: (
					newDoc &&
					newDoc.properties &&
					newDoc.properties.name &&
					newDoc.properties.name.length > 0
					? newDoc.properties.name[0].text
					: ''
				),
			}, ()=>{

				if (!window.isSmallScreen) {
					const docLocation = newDoc.properties.geometry.location
					const asPixel = window.mainMapFunctions.latLngToContainerPoint(docLocation)
					if (asPixel.x < 400) {
						window.mainMapFunctions.panTo(
							window.mainMapFunctions.unproject(window.mainMapFunctions.project(docLocation).add([-200,0])) // map center with sidebar offset
						)
					}
				}

				this.props.onSetSidebarIsOpen(true)
				this.props.onSetSearchBarValue(this.state.headerText)
			})
		}
	}

	edit(){
		this.setState({stage:'editing'})
	}
	view(){
		this.setState({stage:'viewing'})
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
			? 'Bis '+max_age+' Jahre'
			: (min_age !== null && max_age === null
			? 'Ab '+min_age+' Jahre'
			: (min_age !== null && max_age !== null
			? min_age+' bis '+max_age+' Jahre'
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

	renderView(doc){
		const properties = doc.properties
		const tags = properties.tags

		const age_range_text = this.getAgeRangeText(tags.min_age, tags.max_age)

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

		// const links = this.parseLinks(properties.links && properties.links.length > 0 ? properties.links : [])
		

		const link_tags = {
			website: tags['contact:website'] || tags['website'],
			yelp: tags['contact:yelp'] || tags['yelp'],

			facebook: tags['contact:facebook'] || tags['facebook'],
			instagram: tags['contact:instagram'] || tags['instagram'],
			twitter: tags['contact:twitter'] || tags['twitter'],
			youtube: tags['contact:youtube'] || tags['youtube'],

			email: tags['contact:email'] || tags['email'],
			phonenumber: tags['contact:phone'] || tags['phone'],
			faxnumber: tags['contact:fax'] || tags['fax'],
		}

		// eslint-disable-next-line
		const get_username_regexp = /.*\/([^\/]+)\/?/

		const links = []

		if (!!link_tags.website) {
			const matches = link_tags.website.match(/(?:.*?:\/\/)?(?:www\.)?(?:(.+)\/|(.+))/)
			links.push({
				type: 'website',
				href: link_tags.website,
				text: !!matches ? matches[1] || matches[2] : link_tags.website,
			})
		}

		if (!!link_tags.email) {
			links.push({
				type: 'email',
				href: 'mailto:'+link_tags.email,
				text: link_tags.email,
			})
		}

		if (!!link_tags.phonenumber) {
			links.push({
				type: 'phonenumber',
				href: 'tel:'+link_tags.phonenumber,
				text: link_tags.phonenumber,
			})
		}

		if (!!link_tags.faxnumber) {
			links.push({
				type: 'faxnumber',
				href: 'fax:'+link_tags.faxnumber,
				text: link_tags.faxnumber,
			})
		}

		if (!!link_tags.facebook) {
			const matches = link_tags.facebook.match(get_username_regexp)
			links.push({
				type: 'facebook',
				href: !!matches ? link_tags.facebook : 'https://facebook.com/'+link_tags.facebook,
				text: !!matches ? '@'+matches[1] : '@'+link_tags.facebook,
			})
		}

		if (!!link_tags.instagram) {
			const matches = link_tags.instagram.match(get_username_regexp)
			links.push({
				type: 'instagram',
				href: !!matches ? link_tags.instagram : 'https://instagram.com/'+link_tags.instagram,
				text: !!matches ? '@'+matches[1] : '@'+link_tags.instagram,
			})
		}

		if (!!link_tags.youtube) {
			const matches = link_tags.youtube.match(get_username_regexp)
			links.push({
				type: 'youtube',
				href: !!matches ? link_tags.youtube : 'https://youtube.com/user/'+link_tags.youtube,
				text: !!matches ? '@'+matches[1] : '@'+link_tags.youtube,
			})
		}

		if (!!link_tags.twitter) {
			const matches = link_tags.twitter.match(get_username_regexp)
			links.push({
				type: 'twitter',
				href: !!matches ? link_tags.twitter : 'https://twitter.com/'+link_tags.twitter,
				text: !!matches ? '@'+matches[1] : '@'+link_tags.twitter,
			})
		}

		if (!!link_tags.yelp) {
			links.push({
				type: 'yelp',
				href: link_tags.yelp,
				text: 'View on Yelp',
			})
		}

		if (!!properties.osmID) {
			links.push({
				type: 'osm',
				href: 'https://openstreetmap.org/'+properties.osmID,
				text: 'View on OpenStreetMap',
			})
		}


		const linkIcons = {
			default: (<LinkIcon />),

			osm: <OpenstreetmapIcon />, // (<MapIcon />),
			yelp: <YelpIcon />,

			phonenumber: (<PhoneIcon />),
			faxnumber: (<PrintIcon />),
			email: (<MailIcon />),

			youtube: <YouTubeIcon />,
			twitter: <TwitterIcon />,
			facebook: <FacebookIcon />,
			instagram: <InstagramIcon />,
		}
		const contact = links.filter(link=>
			link.type==='website' ||
			link.type==='phonenumber' ||
			link.type==='faxnumber' ||
			link.type==='email'
		)
		const socialMedia = links.filter(link=>
			link.type==='youtube' ||
			link.type==='twitter' ||
			link.type==='facebook' ||
			link.type==='instagram' ||
			link.type==='yelp' ||
			link.type==='osm'
		)

		const openingHoursComponent = null // this.renderOpeningHours(doc)

		/*
			<Typography gutterBottom variant="body2" component="p">{properties.address}</Typography>			
			{altName.length === 0 ? null : <Typography gutterBottom variant="body2" component="p">{altName}</Typography>}
			{age_range_text === '' ? null : <Typography variant="body2" component="p">{age_range_text}</Typography>}
		*/

		return (<React.Fragment key="viewing">
				<CardContent>
					{
						age_range_text === ''
						? null
						: (
							<List dense>
								<ListItem>
									<ListItemIcon><CheckIcon /></ListItemIcon>
									<ListItemText primary={'Altersbeschränkung: '+age_range_text} />
								</ListItem>
							</List>
						)
					}

					{
						//  subheader={<ListSubheader>Contact</ListSubheader>}
						contact.length === 0
						? null
						: (<List dense>
							{contact.map(link => (
								<ListItemLink target="_blank" key={link.href} href={link.href}>
									<ListItemIcon>{(!!linkIcons[link.type] ? linkIcons[link.type] : linkIcons.default)}</ListItemIcon>
									<ListItemText primary={link.text} />
								</ListItemLink>
							))}
						</List>)
					}

					{
						// subheader={<ListSubheader>Social Media</ListSubheader>}
						socialMedia.length === 0
						? null
						: (<List dense>
							{socialMedia.map(link => (
								<ListItemLink target="_blank" key={link.href} href={link.href}>
									<ListItemIcon>{(!!linkIcons[link.type] ? linkIcons[link.type] : linkIcons.default)}</ListItemIcon>
									<ListItemText primary={link.text} />
								</ListItemLink>
							))}
						</List>)
					}
				
					{!!openingHoursComponent ? (<List dense subheader={<ListSubheader>Opening Hours</ListSubheader>}>
						{openingHoursComponent}
					</List>) : null}

					<div style={{
						marginTop: '32px',
						textAlign: 'center',
					}}>
						<Fab
							variant="extended"
							onClick={this.edit}
							size="large"
							color="secondary"
							className="improveFab"
						>
							<EditIcon className="icon"/>
							<Localized id="improve" />
						</Fab>
					</div>
				</CardContent>
		</React.Fragment>)
	}
	renderQuestions(doc){
		return (<React.Fragment key="editing">
			<CardContent>
				<Questions key="the_questions" startQuestions={
					this.state.isNewDoc
					? ['geo_pos','name','answer_more']
					: ['start_improve']
				} doc={doc} onFinish={this.view}/>
			</CardContent>
		</React.Fragment>)
	}

	// this.props.theme.palette.background.default

	render(){
		const doc = this.state.doc

		if (!(
			!!doc &&
			!!doc._id // &&
			// !!doc.properties &&
			// !!doc.properties.tags
		)) {
			return null
		}

		const headerBackgroundColor = (
			doc.___color.key === 'default'
			? this.props.theme.palette.background.default
			: doc.___color.bg
		)

		const headerForegroundColor = (
			doc.___color.key === 'default'
			? this.props.theme.palette.getContrastText(headerBackgroundColor)
			: doc.___color.fg
		)

		return (<>
			<Paper
				elevation={6}
				className={this.props.className}
				style={{
					backgroundColor: headerBackgroundColor,
					background: `linear-gradient(180deg, ${headerBackgroundColor} 50%, ${
						this.state.stage === 'viewing'
						? this.props.theme.palette.background.paper
						: this.props.theme.palette.background.default
					} 50%)`,
					display: 'flex',
					alignContent: 'stretch',
					flexDirection: 'column',
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
					/*...(
						doc.___color.key !== 'default'
						? {
							color: doc.___color.fg,
							background: headerBackgroundColor,
						}
						: undefined
					)*/
				}}
			>
				<CardContent>
					<Typography gutterBottom variant="h4" component="h1" style={{margin:'0 16px',fontWeight:'900',color:headerForegroundColor}}>
						{this.state.headerText}
					</Typography>
					
					{
						doc.___preset.key !== ''
						? (<ListItem style={{m_argin:'0 -32px',color:headerForegroundColor}}>
								<ListItemIcon style={{m_inWidth:'auto',m_arginRight:'16px'}}>
									<div className="material-icons-round" style={{color:doc.___color.fg}}>{doc.___preset.icon ? doc.___preset.icon.toLowerCase() : ''}</div>
								</ListItemIcon>
								<ListItemText primary={doc.___preset.name.en}/>
							</ListItem>
						)
						: null
					}
				</CardContent>
			</Card>

			<Card
				elevation={6}
				className="sidebarContentCard"
				style={{
					backgroundColor: (
						this.state.stage === 'viewing'
						? this.props.theme.palette.background.paper
						: this.props.theme.palette.background.default
					),
				}}
			>
				{
					this.state.stage === 'viewing'
					? this.renderView(doc)
					: this.renderQuestions(doc)
				}
			</Card>

			</Paper>
		</>)
	}
}

export default withTheme(Sidebar)