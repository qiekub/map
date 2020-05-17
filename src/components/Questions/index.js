import React from 'react'
import './index.css'



import { Localized, withLocalization } from '../Localized/'
// import { navigate } from '@reach/router'

import {
	loadQuestions as query_loadQuestions,
	addChangeset as mutation_addChangeset,
} from '../../queries.js'

// import categories from '../../data/dist/categories.json'
import _presets_ from '../../data/dist/presets.json'
// import colors from '../../data/dist/colors.json'
// import colorsByPreset from '../../data/dist/colorsByPreset.json'
import { uuidv4, getTranslationFromArray/*, getPreset, getColorByPreset*/ } from '../../functions.js'

import { withGlobals } from '../Globals/'

import {
	Link,
	Typography,
	Button,
	Fab,
	Paper,

	ListItem,
	ListItemIcon,
	ListItemText,

	TextField,
} from '@material-ui/core'
import {
	DoneRounded as DoneIcon,
	ArrowBackRounded as ArrowBackIcon,
	ArrowForwardRounded as ArrowForwardIcon,
} from '@material-ui/icons'
// import {
// 	Autocomplete
// } from '@material-ui/lab'
import { withTheme } from '@material-ui/core/styles'

import GeoInput from '../GeoInput/'
import PresetInput from '../PresetInput/'
import DateInput from '../DateInput/'



// const nextQuestionIDs_templates = {
// 	improve: ['start_improve'],
// 	create: ['name','geo_pos','answer_more'],
// }

/*
const _parsers_ = {
	urls: function(value){
		let urls = value.match(/[^\s]+(?:\.|:|\/).+(?=\s|$)/iumg)
		// This is not a good regexp but it work okayish.
		// A comment on url matching: https://stackoverflow.com/questions/827557/how-do-you-validate-a-url-with-a-regular-expression-in-python/827621#827621

		urls = [...new Set(urls.filter(v=>v))]

		if (urls.length === 1) {
			return {urls: urls[0]}
		} else if (urls.length > 1) {
			return {urls: urls}
		}

		return undefined
	},
	socialmedia: function(value){
		// https://wiki.openstreetmap.org/wiki/Key:contact

		let keys = {
			'instagram.com': 'instagram',
			'facebook.com': 'facebook',
			'twitter.com': 'twitter',
			'youtube.com': 'youtube',
			't.me': 'telegram',
			'foursquare.com': 'foursquare',
		}

		let tags = Array.from(value.matchAll(
			/[^\s]*?([^.\s]+\.[^.\s/]+)\/[^\s]+/iumg
		), match => match)
		.reduce((tags,match) => {
			const key = keys[match[1]]
			if (key) {
				if (!tags[key]) {
					tags[key] = []
				}
				tags[key].push(match[0])
			}
			return tags
		}, {})

		for (const key in tags) {
			if (tags[key].length === 1) {
				tags[key] = tags[key][0]
			}
			tags['contact:'+key] = tags[key]
		}

		console.log('tags', tags)

		// usernames = [...new Set(usernames.filter(v=>v))]

		// if (usernames.length === 1) {
		// 	return {
		// 		instagram: usernames[0],
		// 		'contact:instagram': usernames[0],
		// 	}
		// } else if (usernames.length > 1) {
		// 	return {
		// 		instagram: usernames,
		// 		'contact:instagram': usernames,
		// 	}
		// }

		return undefined
	},
	wikidata: function(value){
		// http://www.wikidata.org/wiki/Q9141

		let ids = Array.from(value.matchAll(
			/wikidata\.org\/wiki\/([A-Z0-9]+)(?=\s|$)/gmiu
		), m => m[1])

		ids = [...new Set(ids.filter(v=>v))]

		if (ids.length === 1) {
			return {wikidata: ids[0]}
		} else if (ids.length > 1) {
			return {wikidata: ids}
		}

		return undefined
	},
	wikipedia: function(value){
		let ids = Array.from(value.matchAll(
			/(?:([a-z]+)\.)?wikipedia\.org\/wiki\/([^/\s]+)(?=\s|$)/iugm
		), m => (!!m[1] ? m[1]+':' : '')+m[2])

		ids = [...new Set(ids.filter(v=>v))]

		if (ids.length === 1) {
			return {wikidata: ids[0]}
		} else if (ids.length > 1) {
			return {wikidata: ids}
		}

		return undefined
	},
}
*/

// console.log(
// 	_parsers_.socialmedia(`
// 		instagram.com/thomasrosen
// 		https://www.instagram.com/thomasrosen/
// 	`)
// )

class Questions extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			questionsAreLoaded: false,
			answersByQuestionId: {},

			questionsById: {},
			nextQuestionIDs: [], // nextQuestionIDs_templates.create,

			stageIndex: 0, // 0=privacy -> 1=questions -> 2=sources
		}

		// this.answerIDs = new Set()
		this.sourcesText = ''
		this.answer_tags = {}
		this.tagsFromTheDoc = {}

		this.inputValues = {}

		this.renderStage = this.renderStage.bind(this)

		this.answerQuestion = this.answerQuestion.bind(this)
		this.loadQuestions = this.loadQuestions.bind(this)
		this.submitInputs = this.submitInputs.bind(this)

		this.setQuestionAsActive = this.setQuestionAsActive.bind(this)
		this.savePresetValue = this.savePresetValue.bind(this)
		this.saveValueByKey = this.saveValueByKey.bind(this)

		this.abort = this.abort.bind(this)
		this.acceptPrivacyPolicy = this.acceptPrivacyPolicy.bind(this)
		this.showQuestions = this.showQuestions.bind(this)
		this.addSources	 = this.addSources.bind(this)
		this.finish = this.finish.bind(this)
		this.saveSourcesText = this.saveSourcesText.bind(this)
	}

	componentDidMount(){
		// skip privacy consent screen when already agreed
		const privacy_contented_to_tracking = this.props.store.getPrivacy('tracking')
		if (privacy_contented_to_tracking) {
			this.setState({stageIndex: 1})
		}

		this.setState((state, props) => {
			if (this.state.nextQuestionIDs.length === 0 && this.props.startQuestions.length > 0) {
				return {nextQuestionIDs: this.props.startQuestions}
			}
		})

		this.loadQuestions()
	}
	componentDidUpdate(){
		if (
			!!this.props.doc &&
			// !!this.props.doc._id &&
			!!this.props.doc.properties &&
			!!this.props.doc.properties.tags &&
			this.props.doc.properties.tags !== this.tagsFromTheDoc
		) {
			this.tagsFromTheDoc = this.props.doc.properties.tags
		}
	}

	loadQuestions(){
		this.props.globals.graphql.query({
			query: query_loadQuestions,
			variables: {
				languages: navigator.languages,
			},
		}).then(result => {

			const nextQuestionIDs = [
				...this.props.startQuestions,
				...this.state.nextQuestionIDs,
			]

			let firstOpenQuestionCounter = 0
			const questionsById = result.data.questions.reduce((obj,questionDoc)=>{

				const hasGeoInputField = questionDoc.properties.possibleAnswers.filter(possibleAnswer => possibleAnswer.inputtype === 'geo').length > 0

				if (this.props.globals.isSmallScreen && hasGeoInputField) {
					firstOpenQuestionCounter += 1
				}

				questionDoc.properties.question_translated = getTranslationFromArray(questionDoc.properties.question, this.props.globals.userLocales)

				questionDoc.properties.in_one_word_translated = getTranslationFromArray(questionDoc.properties.in_one_word, this.props.globals.userLocales)

				questionDoc.properties.possibleAnswers = questionDoc.properties.possibleAnswers.map(answer => ({
					...answer,
					title_translated: getTranslationFromArray(answer.title, this.props.globals.userLocales),
					description_translated: getTranslationFromArray(answer.description, this.props.globals.userLocales),
				}))

				obj[questionDoc._id] = {
					...questionDoc,
					
					visible: true,
					active: (questionDoc._id === nextQuestionIDs[firstOpenQuestionCounter]),
					answered: false,

					possibleAnswersByKey: questionDoc.properties.possibleAnswers.reduce((possibleAnswersByKey,possibleAnswer) => {
						possibleAnswersByKey[possibleAnswer.key] = possibleAnswer
						return possibleAnswersByKey
					}, {}),
				}

				return obj
			}, {})

			this.setState({
				questionsById,
				questionsAreLoaded: true,
			}/*, ()=>{
				this.setQuestionAsActive(nextQuestionIDs[0])
			}*/)
		}).catch(error=>{
			console.error(error)
		})
	}

	setQuestionAsActive(questionID){
		// if (Object.keys(this.inputValues).length > 0) {
		// 	this.answerQuestion(questionDoc._id, this.inputValues)
		// }

		this.setState((state, props) => {
			const questionIDs = Object.keys(state.questionsById)

			let questionsById = state.questionsById
			for (const questionID of questionIDs) {
				questionsById[questionID].active = false
			}
			// if (!questionsById[questionID].answered) {
				questionsById[questionID].active = true
			// }

			return {
				questionsById: questionsById,
			}
		})
	}

	answer2tags(questionID, answerKey, answerValue, tags = {}){
		const question_doc = this.state.questionsById[questionID]

		if (!!question_doc && !!question_doc.possibleAnswersByKey) {
			const possibleAnswer = question_doc.possibleAnswersByKey[answerKey]

			if (!!possibleAnswer) {
				if (
					!!possibleAnswer.tags
					&& typeof possibleAnswer.tags === "object"
					&& Object.keys(possibleAnswer.tags).length > 0
				) {
					if (typeof answerValue === "boolean") {
						if (answerValue === true) {
							tags = {
								...tags,
								...possibleAnswer.tags,
							}
						}
					// } else if (typeof doc.answerValue === "object") {
					// 	for (const key in possibleAnswer.tags) {
					// 		if (doc.answerValue[key]) {
					// 			tags[key] = doc.answerValue[key]
					// 		}
					// 	}
					} else {
						for (const key in possibleAnswer.tags) {
							tags[key] = answerValue
						}
					}
				}
	
				// add tags from the preset:
				if (tags.preset && typeof tags.preset === 'string' && _presets_[tags.preset] && _presets_[tags.preset].tags) {
					tags = {
						...tags,
						..._presets_[tags.preset].tags,
					}
				}


				// console.log()
				// console.log('- parser -----------------------------')
				// console.log()

				// if (
				// 	!!possibleAnswer.parsers
				// 	&& possibleAnswer.parsers.length > 0
				// ) {
				// 	console.log('possibleAnswer.parsers', possibleAnswer.parsers)

				// 	for (const parserKey of possibleAnswer.parsers) {
				// 		if (_parsers_[parserKey]) {
				// 			tags = {
				// 				...tags,
				// 				..._parsers_[parserKey](answerValue),
				// 			}
				// 		}
				// 	}
				// 	console.log('tags', tags)
				// }


			}
		}

		return tags
	}

	answerQuestion(questionID, answerValue){
		let questionGotAnswered = false
		if (Object.keys(answerValue).length > 0) {
			questionGotAnswered = true
		}

		if (questionGotAnswered) {
			this.answer_tags = {
				...this.answer_tags,
				...(Object.entries(answerValue).reduce((tags,entry) => {
					return this.answer2tags(questionID, entry[0], entry[1], tags)
				}, {}))
			}
		}

		this.setState((state, props) => { // start this while mutating
			let questionsById = state.questionsById
			let nextQuestionIDs = state.nextQuestionIDs

			questionsById[questionID].active = false
			if (questionGotAnswered) {
				questionsById[questionID].answered = true

				const currentQuestionPos = nextQuestionIDs.indexOf(questionID)
				const nextQuestionIDs_start_part = nextQuestionIDs.slice(0, currentQuestionPos+1)
				const nextQuestionIDs_end_part = nextQuestionIDs.slice(currentQuestionPos)

				const allKeys = Object.keys(answerValue)
				const newQuestionIDs = questionsById[questionID].properties.possibleAnswers
				.filter(answer => allKeys.includes(answer.key))
				.map(answer => answer.followUpQuestionIDs || [])
				.reduce((result,followUpQuestionIDs) => {
					return [...result, ...followUpQuestionIDs]
				}, [])
				.filter(questionID => !nextQuestionIDs_start_part.includes(questionID))
				
				nextQuestionIDs = [...new Set([
					...nextQuestionIDs_start_part,
					...newQuestionIDs,
					...nextQuestionIDs_end_part.filter(questionID => !newQuestionIDs.includes(questionID))
				])]
			}

			const thisIndex = nextQuestionIDs.indexOf(questionID)
			if (thisIndex < nextQuestionIDs.length-1) {
				for (let i=thisIndex+1; i<nextQuestionIDs.length; i+=1) {
					if (!questionsById[nextQuestionIDs[i]].answered) {
						questionsById[nextQuestionIDs[i]].active = true
						break;
					}
				}
			}

			if (questionGotAnswered) {
				return {
					nextQuestionIDs,
					questionsById,
					answersByQuestionId: {
						...state.answersByQuestionId,
						[questionID]: answerValue,
					},
				}
			}else{
				return {
					nextQuestionIDs,
					questionsById,
				}
			}
		})
	}

	saveInputValue(questionID, key, value){
		if (!this.inputValues[questionID]) {
			this.inputValues[questionID] = {}
		}
		this.inputValues[questionID][key] = value
	}
	submitInputs(questionID){
		const tmp_inputValues = this.inputValues[questionID] || {}
		this.inputValues[questionID] = {}
		this.answerQuestion(questionID, tmp_inputValues)
	}
	getInputValueByNamespace(questionID,namespace){
		let toReturn = {}
		const namespaceWithColon = namespace+':'
		const namespaceWithColonLenght = namespaceWithColon.length


		// get the unsaved value  
		if (this.inputValues[questionID]) {
			const tags = this.inputValues[questionID]
			const tagKeys = Object.keys(tags)
			for (const key of tagKeys) {
				if (key === namespace) {
					toReturn[''] = tags[key]
				} else if (key.startsWith(namespaceWithColon)) {
					toReturn[key.substring(namespaceWithColonLenght)] = tags[key]
				}
			}
			if (Object.keys(toReturn).lenght > 0) {
				return toReturn
			}
		}


		// get a value from the documents tags
		if (this.answer_tags) {
			const tags = this.answer_tags
			const tagKeys = Object.keys(tags)
			for (const key of tagKeys) {
				if (key === namespace) {
					toReturn[''] = tags[key]
				} else if (key.startsWith(namespaceWithColon)) {
					toReturn[key.substring(namespaceWithColonLenght)] = tags[key]
				}
			}
			if (Object.keys(toReturn).lenght > 0) {
				return toReturn
			}
		}


		// get a value from the documents tags
		if (this.tagsFromTheDoc) {
			const tags = this.tagsFromTheDoc
			const tagKeys = Object.keys(tags)
			for (const key of tagKeys) {
				if (key === namespace) {
					toReturn[''] = tags[key]
				} else if (key.startsWith(namespaceWithColon)) {
					toReturn[key.substring(namespaceWithColonLenght)] = tags[key]
				}
			}
			if (Object.keys(toReturn).lenght > 0) {
				return toReturn
			}
		}


		return toReturn
	}
	getInputValue(questionID,answerKey){

		// get the unsaved value  
		if (this.inputValues[questionID] && this.inputValues[questionID][answerKey]) {
			return this.inputValues[questionID][answerKey]
		}

		// get a value from the given answers
		const question_doc = this.state.questionsById[questionID]
		const possibleAnswer = question_doc.possibleAnswersByKey[answerKey]
		const tagKeys = Object.keys(possibleAnswer.tags || {})

		for (const key of tagKeys) {
			if (this.answer_tags.hasOwnProperty(key)) {
				return this.answer_tags[key]
			}
		}

		// get a value from the documents tags
		for (const key of tagKeys) {
			if (this.tagsFromTheDoc.hasOwnProperty(key)) {
				return this.tagsFromTheDoc[key]
			}
		}

		return ''
	}

	savePresetValue(questionID,newValue){
		this.saveInputValue(questionID, 'preset', newValue.preset)
	}
	saveValueByKey(questionID,newValue,namespace){
		const keys = Object.keys(newValue)
		for (const key of keys) {
			this.saveInputValue(questionID, (
				!!namespace
				? (key === '' ? namespace : namespace+':'+key)
				: key
			), newValue[key])
		}
	}

	renderQuestion(questionID){
		const questionDoc = this.state.questionsById[questionID]

		if (!(
			!!questionDoc &&
			!!questionDoc._id &&
			!!questionDoc.properties
		)) {
			return null
		}

		if (!questionDoc.visible) {
			return null
		}

		const hasGeoInputField = questionDoc.properties.possibleAnswers.filter(possibleAnswer => possibleAnswer.inputtype === 'geo').length > 0

		if (this.props.globals.isSmallScreen && hasGeoInputField) {
			return null
		}

		const hasInputField = questionDoc.properties.possibleAnswers.filter(possibleAnswer => {
			return (
				possibleAnswer.inputtype === 'text' ||
				possibleAnswer.inputtype === 'number' ||
				possibleAnswer.inputtype === 'geo' ||
				possibleAnswer.inputtype === 'preset' ||
				possibleAnswer.inputtype === 'date'
			)
		}).length > 0

		const isMultiRow = hasInputField || (questionDoc.properties.possibleAnswers && questionDoc.properties.possibleAnswers.length > 2)

		const location = this.props.doc.properties.geometry.location

		let heading = ''
		if (questionDoc.active) {
			if (questionDoc.properties.question_translated !== '') {
				heading = questionDoc.properties.question_translated
			} else if (questionDoc.properties.in_one_word_translated !== '') {
				heading = questionDoc.properties.in_one_word_translated
			}
		}else{
			if (questionDoc.properties.in_one_word_translated !== '') {
				heading = questionDoc.properties.in_one_word_translated
			} else if (questionDoc.properties.question_translated !== '') {
				heading = questionDoc.properties.question_translated
			}
		}

		return (
			<Paper
				key={`question_${questionDoc._id}`}
				className={
					'questionCard '
					+(questionDoc.answered ? 'answered ' : '')
					+(questionDoc.active ? 'active ' : '')
					+(hasInputField ? 'hasInputField ' : '')
					+(isMultiRow ? 'isMultiRow ' : '')
				}
				variant="outlined"
				elevation={0}
				onClick={
					/*!questionDoc.answered &&*/ !questionDoc.active
					? ()=>this.setQuestionAsActive(questionDoc._id)
					: null
				}
			>
				<ListItem dense disableGutters className="questionText">
					{
						questionDoc.properties.icon
						? (
							<ListItemIcon>
								<div
									className="material-icons-round"
									style={{
										color: 'inherit',
										width: '40px',
										height: '40px',
										lineHeight: '40px',
										textAlign: 'center',
									}}
								>{questionDoc.properties.icon}</div>
							</ListItemIcon>
						)
						: null
					}
					<ListItemText primary={heading} primaryTypographyProps={{
						variant: 'body1',
						// className: 'questionText',
					}}/>
				</ListItem>				

				<div
					className="possibleAnswers"
					style={{
						flexDirection: (isMultiRow ? 'column' : 'row'),
					}}
				>
					{
						!questionDoc.active
						? undefined
						: (questionDoc.properties.possibleAnswers.map(possibleAnswer=>{
							if (possibleAnswer.hidden) {
								return undefined
							}else{
								const possibleAnswerKey = possibleAnswer.key
								const possibleAnswerNamespace = possibleAnswer.namespace
								possibleAnswer.inputtype = possibleAnswer.inputtype || ''
								if (possibleAnswer.inputtype === 'date') {
									return (<DateInput
										key={possibleAnswerKey}
										label={possibleAnswer.title_translated}
										helperText={possibleAnswer.description_translated}
										defaultValue={this.getInputValueByNamespace(questionDoc._id,possibleAnswerNamespace)}
										onChange={newValue=>this.saveValueByKey(questionDoc._id, newValue, possibleAnswerKey)}
									/>)
								}else if (possibleAnswer.inputtype === 'geo') {
									return (<GeoInput
										key={possibleAnswerKey}
										marker={{
											center: location,
											zoom: 18,
										}}
										doc={this.props.doc}
										onChange={newValue=>this.saveValueByKey(questionDoc._id, newValue, null)}
									/>)
								}else if (possibleAnswer.inputtype === 'preset') {
									return (<PresetInput
										key={possibleAnswerKey}
										label={possibleAnswer.title_translated}
										defaultValue={this.getInputValue(questionDoc._id, possibleAnswerKey)}
										onChange={newValue=>this.saveInputValue(questionDoc._id, possibleAnswerKey, newValue)}
									/>)
								}else if (possibleAnswer.inputtype === 'text') {
									return (<TextField
										type="text"
										multiline
										key={possibleAnswerKey}
										label={possibleAnswer.title_translated}
										variant="outlined"
										color="secondary"
										defaultValue={this.getInputValue(questionDoc._id, possibleAnswerKey)}
										onChange={event=>this.saveInputValue(questionDoc._id, possibleAnswerKey, event.target.value)}
										style={{
											margin: '8px 8px 4px 8px',
										}}
									/>)
								}else if (possibleAnswer.inputtype === 'number') {
									return (<TextField
										type="number"
										key={possibleAnswerKey}
										label={possibleAnswer.title_translated}
										variant="outlined"
										color="secondary"
										defaultValue={this.getInputValue(questionDoc._id, possibleAnswerKey)}
										onChange={event=>this.saveInputValue(questionDoc._id, possibleAnswerKey, event.target.value)}
										style={{
											margin: '8px 8px 4px 8px',
										}}
									/>)
								}else{
									return (
										<ListItem
											button
											key={possibleAnswerKey}
											onClick={()=>this.answerQuestion(questionDoc._id, {[possibleAnswerKey]:true})}
											variant="outlined"
											size="large"
											style={{
												flexGrow: '1',
												border: 'none',
												color: 'inherit',
												margin: '4px 8px',
												padding: (isMultiRow ? '10px 16px' : '16px 8px'),
												justifyContent: (isMultiRow ? 'flex-start' : 'center'),
												textAlign: (isMultiRow ? 'inherit' : 'center'),
												boxShadow: `inset 0 0 0 999px ${this.props.theme.palette.divider}`,
												// boxShadow: `inset 0 0 0 999px ${this.props.theme.palette.background.default}`,
												width: 'auto',
												borderRadius: `${this.props.theme.shape.borderRadius}px`,
											}}
										>
											{
												isMultiRow && !!possibleAnswer.icon
												? (
													<ListItemIcon style={{
														minWidth: '24px',
														margin: '6px 16px 0 0',
														alignSelf: 'flex-start',
													}}>
														<div className="material-icons-round">{possibleAnswer.icon}</div>
													</ListItemIcon>
												)
												: undefined
											}
											<ListItemText
												primary={possibleAnswer.title_translated}
												secondary={possibleAnswer.description_translated}
											/>
										</ListItem>
									)
								}
							}
						}))
					}
				</div>
		
				<div className="saveButton">
					<Button
						onClick={()=>this.submitInputs(questionDoc._id)}
						variant="outlined"
						size="large"
						style={{
							border: 'none',
							boxShadow: `inset 0 0 0 999px ${this.props.theme.palette.divider}`,
							// boxShadow: `inset 0 0 0 999px ${this.props.theme.palette.background.default}`,
							// boxShadow: 'rgba(0, 0, 0, 0.04) 0px 0px 0px 999px inset',
							color: 'inherit',
							margin: '0',
							padding: '8px 16px 8px 12px',
						}}
					>
						<DoneIcon style={{color:'var(--light-green)',marginRight:'8px'}}/>
						<Localized id="save" />
					</Button>

					{/*<Fab
						variant="extended"
						onClick={()=>this.submitInputs(questionDoc._id)}
						size="large"
						style={{
							color: 'white',
							background: 'black',
							borderRadius: '999px',
							padding: '0 16px 0 20px',
						}}
					>
						<Localized id="next" />
						<ArrowForwardIcon style={{color:'var(--light-green)',marginLeft:'8px'}}/>
					</Fab>*/}
				</div>
			</Paper>
		)
	}

	abort(){
		if (this.props.onAbort) {
			this.props.onAbort()
		}
	}
	acceptPrivacyPolicy(){
		this.props.store.setPrivacy('tracking', true).finally(()=>{
			this.props.store.setPrivacy(null, true).finally(()=>{
				this.props.store.set('uuid', uuidv4(), 'tracking')
				this.showQuestions()
			})
		})
	}
	showQuestions(){
		this.setState({stageIndex:1})
	}
	addSources(){
		this.setState({stageIndex:2})
	}
	finish(){
		if (Object.keys(this.answer_tags).length > 0) {
			this.props.globals.graphql.mutate({
				mutation: mutation_addChangeset,
				variables: {
					properties: {
						forID: this.props.doc._id,
						tags: this.answer_tags,
						sources: this.sourcesText || '',
						fromBot: false,
						dataset: 'qiekub',
						antiSpamUserIdentifier: this.props.store.get('uuid') || '',
					}
				}
			})
			.catch(error=>{
				console.error('mutation_addChangeset-error', error)
			})
		}

		if (this.props.onFinish) {
			this.props.onFinish()
		}
	}

	saveSourcesText(event){
		this.sourcesText = event.target.value
	}

	renderStage(){
		const {stageIndex} = this.state

		if (stageIndex === 0) { // privacy
			return (<div style={{padding: '16px'}}>
				<Typography variant="h6" gutterBottom>
					<Localized id="headings_privacy_stage" />
				</Typography>

				<Typography variant="body1" gutterBottom>
					<Localized
						id="privacy_info"
						elems={{
							privacy_policy_link: <Link target="_blank" href="https://www.qiekub.org/datenschutz.html"></Link>,
						}}
					></Localized>
				</Typography>
	
				<div style={{
					display: 'flex',
					justifyContent: 'space-between',
					margin: '32px 0 64px 0'
				}}>
					<Fab
						onClick={this.abort}
						variant="extended"
						size="large"
						style={{
							boxShadow: 'none',
						}}
					>
						<ArrowBackIcon style={{marginRight:'8px'}}/>
						<Localized id="abort" />
					</Fab>
					<Fab
						onClick={this.acceptPrivacyPolicy}
						variant="extended"
						size="large"
						color="secondary"
					>
						<Localized id="agree" />
						<ArrowForwardIcon style={{color:'var(--light-green)',marginLeft:'8px'}}/>
					</Fab>
				</div>
			</div>)
		} else if (stageIndex === 1) { // questions
			if (!this.state.questionsAreLoaded) {
				return (<div style={{margin:'16px'}}>
					<Typography variant="h6" gutterBottom>
						<Localized id="headings_questions_stage" />
					</Typography>

					<Typography variant="body1" style={{margin:'0 0 32px 0'}}>
						<Localized id="questions_are_loading" />
					</Typography>
	
					<Fab
						onClick={this.abort}
						variant="extended"
						size="large"
						color="secondary"
					>
						<ArrowBackIcon style={{marginRight:'8px'}}/>
						<Localized id="abort" />
					</Fab>
				</div>)
			} else if (!!this.state.questionsById && Object.keys(this.state.questionsById).length > 0) {
				return (<>
					<Typography variant="h6" gutterBottom style={{margin:'16px 16px 32px 16px'}}>
						<Localized id="headings_questions_stage" />
					</Typography>

					<React.Fragment key="questions">
						{this.state.nextQuestionIDs.map(questionID => this.renderQuestion(questionID))}
					</React.Fragment>
	
					<div style={{
						textAlign: 'right',
						margin: '32px 16px 64px 16px'
					}}>
						<Fab
							onClick={this.addSources}
							variant="extended"
							size="large"
							color="secondary"
						>
							<Localized id="next" />
							<ArrowForwardIcon style={{color:'var(--light-green)',marginLeft:'8px'}}/>
						</Fab>
					</div>
				</>)
			}
		} else if (stageIndex === 2) { // sources
			return (<div style={{padding: '16px'}}>
				<Typography variant="h6" gutterBottom>
					<Localized id="headings_sources_stage" />
				</Typography>

				<Typography variant="body1" gutterBottom>
					<Localized id="sources_info" />
				</Typography>

				<TextField
					style={{marginTop: '16px'}}
					variant="outlined"
					color="secondary"
					fullWidth
					multiline
					autoFocus={false}
					placeholder={this.props.getString('sources_placeholder')}
					onChange={this.saveSourcesText}
				/>
	
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						margin: '32px 0 64px 0'
					}}>
						<Fab
							onClick={this.showQuestions}
							variant="extended"
							size="large"
							style={{
								boxShadow: 'none',
							}}
						>
							<ArrowBackIcon style={{marginRight:'8px'}}/>
							<Localized id="back" />
						</Fab>
						<Fab
							onClick={this.finish}
							variant="extended"
							size="large"
							color="secondary"
						>
							<Localized id="finish" />
							<DoneIcon style={{color:'var(--light-green)',marginLeft:'8px'}}/>
						</Fab>
					</div>
			</div>)
		}

		return null
	}

	render() {
		const doc = this.props.doc

		if (!(
			!!doc &&
			!!doc._id
		)) {
			return null
		}

		return this.renderStage()
	}
}

export default withGlobals(withLocalization(withTheme(Questions)))

