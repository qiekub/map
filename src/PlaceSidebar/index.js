import React from 'react'
import './index.css'

import {gql} from 'apollo-boost'

import {
	Typography,
	Button,

	List,
	ListItem,
	ListItemIcon,
	ListItemText,

	Card,
	CardContent,
	Divider,
	Chip,

	TextField,
} from '@material-ui/core'
import {
	// Phone as PhoneIcon,
	// Mail as MailIcon,

	Link as LinkIcon,
	// Facebook as FacebookIcon,
	// Instagram as InstagramIcon,
	// Twitter as TwitterIcon,
	// YouTube as YouTubeIcon,

	Edit as EditIcon,
	ArrowBack as ArrowBackIcon,
	ArrowForward as ArrowForwardIcon,
} from '@material-ui/icons'
import {
	Autocomplete
} from '@material-ui/lab'

// import {Router,Link} from "@reach/router"
// import reptile from './contemplative-reptile.jpg'


const ListItemLink = props => <ListItem button component="a" {...props} />

const tag_suggestions = ['youthcenter','cafe','bar','education','community-center','youthgroup','group','mediaprojects']
const this_is_a_place_for_suggestions = ['queer','undecided','friends','family','trans','inter','gay','hetero','bi','lesbian','friend']


export default class PlaceSidebar extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			placeID: null,
			place: {},
			changeset: {},
			stage: 'viewing', // viewing editing submitting
		}

		this.loadPlaceData = this.loadPlaceData.bind(this)

		this.edit = this.edit.bind(this)
		this.addComment = this.addComment.bind(this)
		this.submit = this.submit.bind(this)
		this.back = this.back.bind(this)

		this.renderView = this.renderView.bind(this)

			console.log('window.graphql', window.graphql)

		this.updateChangeset = this.updateChangeset.bind(this)
		this.getAgeRangeText = this.getAgeRangeText.bind(this)
		this.setPlaceID = this.setPlaceID.bind(this)
	}


	setPlaceID(newPlaceID){
		if (newPlaceID === 'add') {
			this.setState({
				placeID: null,
				place: {},
				changeset: {},
				stage: 'editing',
			}, ()=>{
				this.props.onSetSearchBarValue('Add Place')
			})
		}else{
			this.setState({
				placeID: newPlaceID,
				place: {},
				changeset: {},
				stage: 'viewing',
			}, ()=>{
				this.loadPlaceData(this.state.placeID)
			})
		}

		if (this.props.onSetSidebarIsOpen) {
			this.props.onSetSidebarIsOpen(newPlaceID!=='')
		}
	}
	componentDidMount() {
		if (this.props.placeID !== this.state.placeID) {
			this.setPlaceID(this.props.placeID)
		}
	}
	componentDidUpdate(prevProps, prevState, snapshot) {
		if (
			this.props.placeID !== prevProps.placeID &&
			this.props.placeID !== this.state.placeID
		) {
			this.setPlaceID(this.props.placeID)
		}
	}

	loadPlaceData(placeID){
		console.log('placeID', placeID)
		if (placeID && placeID !== '' && placeID.length > 1 && /\S/.test(placeID)) {
			window.graphql.query({query: gql`{
				getPlace(_id:"${placeID}"){
					_id
					_type
					name
					address
					min_age
					max_age
					links
					this_is_a_place_for
					tags

					lat
					lng
				}
			}`}).then(result => {
				console.log('getPlace-result', result)
				const place = result.data.getPlace
				if (this.state.placeID === place.name) {
				// if (this.state.placeID === place._id) {
					this.setState({place:place}, ()=>{
						if (this.props.onSetSearchBarValue) {
							this.props.onSetSearchBarValue(place.name)
						}

						// let zoomLevel = (this.props.onGetZoom ? this.props.onGetZoom() : 17)
						// if (zoomLevel < 17) {
						// 	zoomLevel = 17
						// }
						//
						// if (new Date()*1 - window.pageOpenTS*1 < 2000) {
						// 	if (this.props.onSetView) {
						// 		this.props.onSetView([place.lat,place.lng],zoomLevel)
						// 	}
						// }else{
						// 	if (this.props.onFlyTo) {
						// 		this.props.onFlyTo([place.lat,place.lng],zoomLevel)
						// 	}
						// }
					})
				}
			}).catch(error=>{
				console.error(error)
			})
		}
	}

	edit(){
		this.setState({stage:'editing'})
	}
	addComment(){
		this.setState({stage:'submitting'})
	}
	submit(){
		this.setState({stage:'viewing'})

/*
{
	"comment": "d",
	"sources": "s",
	"name": "dHarvey House",
	"address": "2039 W Laskey Rd, dToledo, OH 43612, USA",
	"min_age": "s",
	"max_age": "s",
	"tags": [
		"youthcenter",
		"mediaprojects"
	],
	"links": "shttp://harveyhousenwo.org/s",
	"this_is_a_place_for": [
		"queer",
		"undecided",
		"friends",
		"hetero"
	]
}
*/
		// const changesetTemp = this.state.changeset
		let changesetTemp = {
			...this.state.place,
			...this.state.changeset,
		}
		delete changesetTemp.__typename

		const changesetData = {
			...changesetTemp,
			sources: undefined,
			comment: undefined,
		}
		if (Object.keys(changesetData).length > 0) {
			const changeset = {
				data: changesetData,
				sources: changesetTemp.sources,
				comment: changesetTemp.comment,
				fromBot: false,
				created_by: 'queer.qiekub.com',
				created_at: new Date()*1,
			}

			let changeset_json = JSON.stringify(changeset)
			changeset_json = changeset_json.replace(/"(\w+)"\s*:/g, '$1:')

			window.graphql.mutate({mutation: gql`mutation {
				addChangeset(changeset:${changeset_json})
			}`}).then(result => {
				console.log('mutate-result', result)
			}).catch(error=>{
				console.error('mutate-error', error)
			})
		}else{
			console.log('else')
		}

	}
	back(){
		if (this.state.stage === 'submitting') {
			this.setState({stage:'editing'})
		} else if (this.state.stage === 'editing') {
			this.setState({stage:'viewing'})
		}
	}

	// setPlace(place,callback){
	// 	this.setState({place:place},callback)
	// }
	updateChangeset(newValues){
		this.setState((state, props) => {
			return {changeset: {
				...state.changeset,
				...newValues,
			}}
		})
	}

	getAgeRangeText(min_age,max_age){

		const numbers = [min_age,max_age].sort()

		min_age = Number.parseInt(numbers[0])
		if (Number.isNaN(min_age) || min_age < 0) {
			min_age = null
		}
		max_age = Number.parseInt(numbers[1])
		if (Number.isNaN(max_age) || max_age < 0) {
			max_age = null
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

	renderView(){
		const place = this.state.place
		// const place = {
		// 	...this.state.place,
		// 	...this.state.changeset,
		// }

		if (!(!!place.name) || place.name === '') {
			return ''
		}

		const name = (place.name ? place.name : '')

		const age_range_text = this.getAgeRangeText(place.min_age,place.max_age)

		const links = (place.links ? place.links : '').split('\n')

		return (<React.Fragment key="view">
				{/*<CardMedia
					style={{marginTop:'-86px',height:'240px',background:'black'}}
					title="Contemplative Reptile"
					component="div"
					image={reptile}
				/>*/}

				<CardContent style={{margin:'0 16px'}}>
					<Typography gutterBottom variant="h5" component="h2">
						{name}
					</Typography>

					<Typography gutterBottom variant="body2" component="p" color="textSecondary">{place.address}</Typography>
					
					{age_range_text === '' ? null : <Typography variant="body2" component="p" color="textSecondary">{age_range_text}</Typography>}
				
				</CardContent>
				<CardContent style={{
					padding: '0 32px 16px 32px',
					display: 'flex',
					justifyContent: 'flex-start',
					flexWrap: 'wrap',
				}}>
					{place.tags.map(tag => <Chip key={tag} label={tag} style={{margin:'4px'}}/>)}
				</CardContent>
				<Divider />
				<CardContent>
					<List dense>
						{links.map(link => (
							<ListItemLink target="_blank" key={link} href={link}>
								<ListItemIcon><LinkIcon style={{color:'black'}} /></ListItemIcon>
								<ListItemText primary={link} />
							</ListItemLink>
						))}
					</List>
					{/*<List dense>
						<ListItemLink>
							<ListItemIcon><InstagramIcon style={{color:'black'}} /></ListItemIcon>
							<ListItemText primary="Instagram" />
						</ListItemLink>
						<ListItemLink>
							<ListItemIcon><FacebookIcon style={{color:'black'}} /></ListItemIcon>
							<ListItemText primary="Facebook" />
						</ListItemLink>
						<ListItemLink>
							<ListItemIcon><TwitterIcon style={{color:'black'}} /></ListItemIcon>
							<ListItemText primary="Twitter" />
						</ListItemLink>
					</List>
					<List dense>
						<ListItemLink>
							<ListItemIcon><PhoneIcon style={{color:'black'}} /></ListItemIcon>
							<ListItemText primary="Wi-Fi" />
						</ListItemLink>
						<ListItemLink>
							<ListItemIcon><MailIcon style={{color:'black'}} /></ListItemIcon>
							<ListItemText primary="Wi-Fi" />
						</ListItemLink>
					</List>*/}
				
					<div style={{padding:'16px 0 0 0',textAlign:'center'}}>
						<Button onClick={this.edit} variant="outlined" size="large" className="roundButton" startIcon={<EditIcon style={{color:'black'}} />}>
							Suggest an edit
						</Button>
					</div>

				</CardContent>
		</React.Fragment>)
	}

	renderEdit(){
		const place = {
			...this.state.place,
			...this.state.changeset,
		}

		const inputStyleProps = {
			style: {marginBottom:'16px'},
			variant: 'outlined',
		}
		const commonTextFieldProps = (fieldName) => {
			return {
				...inputStyleProps,
				defaultValue: (place[fieldName] || ''),
				onChange: e => this.updateChangeset({[fieldName]:e.target.value}),
				multiline: true,
				fullWidth: true,
				key: 'TextField_'+fieldName,
			}
		}

		const age_range_text = this.getAgeRangeText(place.min_age,place.max_age)

		return (<React.Fragment key="edit">
			<CardContent style={{margin:'0 16px'}}>
				<Typography gutterBottom variant="h5" component="h2">
					{this.state.placeID === null ? 'Add Place' : 'Edit Place'}
				</Typography>
			</CardContent>
			<Divider />	
			<CardContent>

				<TextField {...commonTextFieldProps('name')} label="Name"/>
				<TextField {...commonTextFieldProps('address')} label="Address"/>

				<fieldset style={{
					padding: '0 16px 8px 16px',
					border: '1px solid rgba(0, 0, 0, 0.23)',
					borderRadius: '3px',
					marginBottom: '16px',
					marginTop: '-10px',
				}}>
					<Typography gutterBottom variant="caption" component="legend" color="textSecondary" style={{
						// background: 'white',
						// marginTop: '-26px',
						// display: 'inline-block',
						// position: 'absolute',
						padding: '0 5px',
					}}>
						Age Range {age_range_text !== '' ? ' — '+age_range_text : ''}
					</Typography>
					<div style={{
						display: 'flex',
						alignItems: 'center',
					}}>
						<Typography variant="body2" color="textSecondary" style={{padding:'0 16px 0 0',height:'21px',lineHeight:'1.1875em'}}>From</Typography>
						<TextField {...commonTextFieldProps('min_age')} placeholder="Minimum" fullWidth={false} variant="standard" style={{width:'50%'}}/>
						<Typography variant="body2" color="textSecondary" style={{padding:'0 16px',height:'21px',lineHeight:'1.1875em'}}>to</Typography>
						<TextField {...commonTextFieldProps('max_age')} placeholder="Maximum" fullWidth={false} variant="standard" style={{width:'50%'}}/>
					</div>
				</fieldset>

				<Autocomplete
					multiple
					freeSolo
					disableClearable
					disableCloseOnSelect={false}
					options={tag_suggestions}
					defaultValue={place.tags || []}
					renderTags={(suggestions, getProps) => {
						return suggestions.map((suggestion, index) => (<Chip key={suggestion} label={suggestion} {...getProps({index})} />))
					}}
					renderInput={params => (<TextField {...params} label="Tags" {...inputStyleProps}/>)}
					onChange={(e,value)=>this.updateChangeset({tags:value})}
				/>

				<Autocomplete
					multiple
					freeSolo
					disableClearable
					disableCloseOnSelect={false}
					options={this_is_a_place_for_suggestions}
					defaultValue={place.this_is_a_place_for || []}
					renderTags={(suggestions, getProps) => {
						return suggestions.map((suggestion, index) => (<Chip key={suggestion} label={suggestion} {...getProps({index})} />))
					}}
					renderInput={params => (<TextField {...params} label="Whom's it for?" {...inputStyleProps}/>)}
					onChange={(e,value)=>this.updateChangeset({this_is_a_place_for:value})}
				/>

				<TextField {...commonTextFieldProps('links')} label="Links" rows={3} rowsMax={99} helperText={'Only links are accepted.'/* Use markdown to add a title. */}/>

				<div style={{padding:'16px 0 0 0',textAlign:'right'}}>
					{this.state.placeID === null ? null : (<Button style={{float:'left'}} onClick={this.back} size="large" className="roundButton" startIcon={<ArrowBackIcon style={{color:'black'}} />}>
						Back
					</Button>)}
					<Button onClick={this.addComment} variant="outlined" size="large" className="roundButton" endIcon={<ArrowForwardIcon style={{color:'black'}} />}>
						Next
					</Button>
				</div>
			</CardContent>
		</React.Fragment>)
	}

	renderSubmitScreen(){
		const allData = JSON.stringify(this.state.changeset,null,'\t')

		// const place = {
		// 	...this.state.place,
		// 	...this.state.changeset,
		// }

		const inputStyleProps = {
			style: {marginBottom:'16px'},
			variant: 'outlined',
		}
		const commonTextFieldProps = (fieldName) => {
			return {
				...inputStyleProps,
				// defaultValue: (place[fieldName] || ''),
				onChange: e => this.updateChangeset({[fieldName]:e.target.value}),
				multiline: true,
				fullWidth: true,
				key: 'TextField_'+fieldName,
			}
		}

		return (<React.Fragment key="submit">
			<CardContent style={{margin:'0 16px'}}>
				<Typography gutterBottom variant="h6" component="h2">
					What did you change
				</Typography>
			</CardContent>
			<Divider />
			<CardContent>

				{/*
					https://wiki.openstreetmap.org/wiki/Good_changeset_comments
				*/}
				
				<TextField {...commonTextFieldProps('comment')} label="Comment" placeholder="Brief description of your contributions" />
				<TextField {...commonTextFieldProps('sources')} label="Sources" placeholder="URLs..." />
				
				<div style={{padding:'16px 0 0 0',textAlign:'right'}}>
					<Button style={{float:'left'}} onClick={this.back} size="large" className="roundButton" startIcon={<ArrowBackIcon style={{color:'black'}} />}>
						Back
					</Button>
					<Button onClick={this.submit} variant="outlined" size="large" className="roundButton" endIcon={<ArrowForwardIcon style={{color:'black'}} />}>
						Suggest
					</Button>
				</div>
			</CardContent>

			<CardContent>
				<TextField disabled value={allData} multiline label="The data we'll upload:" style={{marginBottom:'16px'}} variant="filled" fullWidth/>
			</CardContent>
		</React.Fragment>)
	}

	render() {
		let stageComponent = null
		if (this.state.stage === 'viewing') {
			stageComponent = this.renderView()
		} else if (this.state.stage === 'editing') {
			stageComponent = this.renderEdit()
		} else if (this.state.stage === 'submitting') {
			stageComponent = this.renderSubmitScreen()
		}

		return (<Card elevation={6} className={this.props.className}>
			{stageComponent}
		</Card>)
	}
}