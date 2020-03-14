import React from 'react'
import './index.css'

import {navigate} from '@reach/router'
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


export default class Sidebar extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			docID: null,
			doc: {},
			changedProperties: {},
			stage: 'viewing', // viewing editing submitting
		}

		this.loadDoc = this.loadDoc.bind(this)

		this.edit = this.edit.bind(this)
		this.addComment = this.addComment.bind(this)
		this.submit = this.submit.bind(this)
		this.back = this.back.bind(this)

		this.renderView = this.renderView.bind(this)

		this.updateChangedProperties = this.updateChangedProperties.bind(this)
		this.getAgeRangeText = this.getAgeRangeText.bind(this)
		this.setDocID = this.setDocID.bind(this)
		this.getChangesetDoc = this.getChangesetDoc.bind(this)
	}


	setDocID(newDocID){
		if (newDocID === 'add') {
			this.setState({
				docID: null,
				doc: {},
				changedProperties: {},
				stage: 'editing',
			}, ()=>{
				this.props.onSetSearchBarValue('Add Place')
			})
		}else{
			this.setState({
				docID: newDocID,
				doc: {},
				changedProperties: {},
				stage: 'viewing',
			}, ()=>{
				this.loadDoc(this.state.docID)
			})
		}

		if (this.props.onSetSidebarIsOpen) {
			this.props.onSetSidebarIsOpen(newDocID!=='')
		}
	}
	componentDidMount() {
		if (this.props.docID !== this.state.docID) {
			this.setDocID(this.props.docID)
		}
	}
	componentDidUpdate(prevProps, prevState, snapshot) {
		if (
			this.props.docID !== prevProps.docID &&
			this.props.docID !== this.state.docID
		) {
			this.setDocID(this.props.docID)
		}
	}

	loadDoc(docID){
		if (docID && docID !== '' && docID.length > 1 && /\S/.test(docID)) {
			window.graphql.query({query: gql`{
				getPlace(_id:"${docID}"){
					_id
					properties {
						... on Place {
							name
							address
							min_age
							max_age
							links
							this_is_a_place_for
							tags
		
							location {
								lng
								lat
							}
						}
					}
				}
			}`}).then(result => {
				const doc = result.data.getPlace
				// if (!!doc && this.state.docID === doc.properties.name) {
				if (!!doc && this.state.docID === doc._id) {
					this.setState({doc:doc}, ()=>{
						if (this.props.onSetSearchBarValue) {
							this.props.onSetSearchBarValue(doc.properties.name)
						}

						// let zoomLevel = (this.props.onGetZoom ? this.props.onGetZoom() : 17)
						// if (zoomLevel < 17) {
						// 	zoomLevel = 17
						// }
						//
						// if (new Date()*1 - window.pageOpenTS*1 < 2000) {
						// 	if (this.props.onSetView) {
						// 		this.props.onSetView([doc.properties.location.lat,doc.properties.location.lng],zoomLevel)
						// 	}
						// }else{
						// 	if (this.props.onFlyTo) {
						// 		this.props.onFlyTo([doc.properties.location.lat,doc.properties.location.lng],zoomLevel)
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
	getChangesetDoc(){
		// const properties = this.state.changedProperties
		let properties = {
			// ...this.state.doc.properties,
			...this.state.changedProperties,
		}
		console.log('properties', properties)

		// START parse age-range
		if (properties.min_age || properties.max_age) {
			let min_age = Number.parseInt(properties.min_age || this.state.doc.properties.min_age)
			let max_age = Number.parseInt(properties.max_age || this.state.doc.properties.max_age)
	
			if (Number.isNaN(min_age) || min_age < 0) {
				min_age = null
			}
			if (Number.isNaN(max_age) || max_age < 0) {
				max_age = null
			}
	
			if (
				!Number.isNaN(min_age) && min_age !== null &&
				!Number.isNaN(max_age) && max_age !== null
			){
				const numbers = [min_age,max_age]
				const numbersSorted = [...numbers].sort((a,b)=>a-b)
	
				min_age = numbersSorted[0]
				max_age = numbersSorted[1]
	
				if (
					numbers[0] === numbersSorted[0] &&
					numbers[1] === numbersSorted[1]
				) {
					if (properties.min_age) {
						properties.min_age = min_age
					}
					if (properties.max_age) {
						properties.max_age = max_age
					}
				}else{
					properties.min_age = min_age
					properties.max_age = max_age
				}
			}else{
				if (properties.min_age && min_age !== null) {
					properties.min_age = min_age
				}
				if (properties.max_age && max_age !== null) {
					properties.max_age = max_age
				}
			}
		}
		// END parse age-range

		const sources = this.state.changedProperties.sources
		const comment = this.state.changedProperties.comment

		if (Object.keys(properties).length > 0) {
			return {
				forDoc: this.state.docID,
				properties: {
					...properties,
					sources: undefined,
					comment: undefined,
					__typename: 'Place',
				},
				sources: sources,
				comment: comment,
				fromBot: false,
				created_by: 'queer.qiekub.com',
				created_at: new Date()*1,
			}
		}else{
			return null
		}
	}
	submit(){
		this.setState({stage:'viewing'})

		const changesetDoc = this.getChangesetDoc()

		if (changesetDoc !== null) {
			let changeset_json = JSON.stringify(changesetDoc)
			changeset_json = changeset_json.replace(/"(\w+)"\s*:/g, '$1:')

			window.graphql.mutate({mutation: gql`mutation {
				addChangeset(changeset:${changeset_json}) {
					_id
					properties {
						... on Changeset {
							forDoc
							properties {
								__typename
							}
						}
					}
				}
			}`}).then(async result => {
				console.info('mutate-result', result)

				if (result.data.addChangeset.properties.forDoc) {
					await navigate(`/place/${result.data.addChangeset.properties.forDoc}/`)
				}
			}).catch(error=>{
				console.error('mutate-error', error)
			})
		}

	}
	back(){
		if (this.state.stage === 'submitting') {
			this.setState({stage:'editing'})
		} else if (this.state.stage === 'editing') {
			this.setState({stage:'viewing'})
		}
	}

	updateChangedProperties(newValues){
		this.setState((state, props) => {
			return {changedProperties: {
				...state.changedProperties,
				...newValues,
			}}
		})
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

		if (!Number.isNaN(min_age) && !Number.isNaN(max_age)){
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

	renderView(){
		const doc = this.state.doc
		const properties = {...doc.properties}
		// const properties = {
		// 	...this.state.doc.properties,
		// 	...this.state.changedProperties,
		// }

		if (!(!!properties.name) || properties.name === '') {
			return ''
		}

		const name = (properties.name ? properties.name : '')

		const age_range_text = this.getAgeRangeText(properties.min_age,properties.max_age)

		const links = (properties.links && properties.links.length > 0 ? properties.links.split('\n') : [])

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

					<Typography gutterBottom variant="body2" component="p" color="textSecondary">{properties.address}</Typography>
					
					{age_range_text === '' ? null : <Typography variant="body2" component="p" color="textSecondary">{age_range_text}</Typography>}
				
				</CardContent>
				<CardContent style={{
					padding: '0 32px 16px 32px',
					display: 'flex',
					justifyContent: 'flex-start',
					flexWrap: 'wrap',
				}}>
					{(properties.tags || []).map(tag => <Chip key={tag} label={tag} style={{margin:'4px'}}/>)}
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
		const properties = {
			...this.state.doc.properties,
			...this.state.changedProperties,
		}

		const inputStyleProps = {
			style: {marginBottom:'16px'},
			variant: 'outlined',
		}
		const commonTextFieldProps = (options) => {
			// const options = {
			//	key: 'min_age', // fieldName
			// 	parser: value => value,
			// }

			return {
				...inputStyleProps,
				defaultValue: (properties[options.key] || ''),
				onChange: e => {
					let value = e.target.value
					// if (options.parser) {
					// 	value = options.parser(value)
					// }
					this.updateChangedProperties({[options.key]:value})
				},
				multiline: true,
				fullWidth: true,
				key: 'TextField_'+options.key,
			}
		}

		const age_range_text = this.getAgeRangeText(properties.min_age, properties.max_age)

		return (<React.Fragment key="edit">
			<CardContent style={{margin:'0 16px'}}>
				<Typography gutterBottom variant="h5" component="h2">
					{this.state.docID === null ? 'Add Place' : 'Edit Place'}
				</Typography>
			</CardContent>
			<Divider />	
			<CardContent>

				<TextField {...commonTextFieldProps({key:'name'})} label="Name"/>
				<TextField {...commonTextFieldProps({key:'address'})} label="Address"/>

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
						<TextField {...commonTextFieldProps({key:'min_age'})} multiline={false} inputProps={{type:"Number"}} placeholder="Minimum" fullWidth={false} variant="standard" style={{width:'50%'}}/>
						<Typography variant="body2" color="textSecondary" style={{padding:'0 16px',height:'21px',lineHeight:'1.1875em'}}>to</Typography>
						<TextField {...commonTextFieldProps({key:'max_age'})} multiline={false} inputProps={{type:"Number"}} placeholder="Maximum" fullWidth={false} variant="standard" style={{width:'50%'}}/>
					</div>
				</fieldset>

				<Autocomplete
					multiple
					freeSolo
					disableClearable
					disableCloseOnSelect={false}
					options={tag_suggestions}
					defaultValue={properties.tags || []}
					renderTags={(suggestions, getProps) => {
						return suggestions.map((suggestion, index) => (<Chip key={suggestion} label={suggestion} {...getProps({index})} />))
					}}
					renderInput={params => (<TextField {...params} label="Tags" {...inputStyleProps}/>)}
					onChange={(e,value)=>this.updateChangedProperties({tags:value})}
				/>

				<Autocomplete
					multiple
					freeSolo
					disableClearable
					disableCloseOnSelect={false}
					options={this_is_a_place_for_suggestions}
					defaultValue={properties.this_is_a_place_for || []}
					renderTags={(suggestions, getProps) => {
						return suggestions.map((suggestion, index) => (<Chip key={suggestion} label={suggestion} {...getProps({index})} />))
					}}
					renderInput={params => (<TextField {...params} label="Whom's it for?" {...inputStyleProps}/>)}
					onChange={(e,value)=>this.updateChangedProperties({this_is_a_place_for:value})}
				/>

				<TextField {...commonTextFieldProps({key:'links'})} label="Links" rows={3} rowsMax={99} helperText={'Only links are accepted.'/* Use markdown to add a title. */}/>

				<div style={{padding:'16px 0 0 0',textAlign:'right'}}>
					{this.state.docID === null ? null : (<Button style={{float:'left'}} onClick={this.back} size="large" className="roundButton" startIcon={<ArrowBackIcon style={{color:'black'}} />}>
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
		const changesetDoc = this.getChangesetDoc()
		if (changesetDoc === null) {
			return (<React.Fragment key="submit">
				<CardContent style={{margin:'0 16px'}}>
					<Typography gutterBottom variant="h6" component="h2">
						Did you change anything?
					</Typography>
				</CardContent>
				<Divider />
				<CardContent>
					<Typography style={{margin:'0 16px'}} gutterBottom variant="body2" component="p">
						Go back to suggest an edit.
					</Typography>
	
					<div style={{padding:'16px 0 0 0',textAlign:'right'}}>
						<Button style={{float:'left'}} onClick={this.back} size="large" className="roundButton" startIcon={<ArrowBackIcon style={{color:'black'}} />}>
							Back
						</Button>
					</div>
				</CardContent>
			</React.Fragment>)
		}

		// const properties = {
		// 	...this.state.doc.properties,
		// 	...this.state.changedProperties,
		// }

		const inputStyleProps = {
			style: {marginBottom:'16px'},
			variant: 'outlined',
		}
		const commonTextFieldProps = (options) => {
			// const options = {
			//	key: 'min_age', // fieldName
			// 	parser: value => value,
			// }

			return {
				...inputStyleProps,
				// defaultValue: (properties[options.key] || ''),
				onChange: e => {
					let value = e.target.value
					// if (options.parser) {
					// 	value = options.parser(value)
					// }
					this.updateChangedProperties({[options.key]:value})
				},
				multiline: true,
				fullWidth: true,
				key: 'TextField_'+options.key,
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
				
				<TextField {...commonTextFieldProps({key:'comment'})} label="Comment" placeholder="Brief description of your contributions" />
				<TextField {...commonTextFieldProps({key:'sources'})} label="Sources" placeholder="URLs..." />
				
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
				<TextField disabled value={JSON.stringify(changesetDoc,null,'\t')} multiline label="The data we'll upload:" style={{marginBottom:'16px'}} variant="filled" fullWidth/>
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