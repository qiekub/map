import React from 'react'
import './index.css'



import { withCookies } from 'react-cookie'
import { Localized, withLocalization } from '../Localized/'
// import { navigate } from '@reach/router'

import {
	loadQuestions as query_loadQuestions,
	answerQuestion as mutation_answerQuestion,
	addSources as mutation_addSources,
	compilePlace as mutation_compilePlace,
} from '../../queries.js'

// import categories from '../../data/dist/categories.json'
// import presets from '../../data/dist/presets.json'
// import colors from '../../data/dist/colors.json'
// import colorsByPreset from '../../data/dist/colorsByPreset.json'
import { uuidv4/*, getPreset, getColorByPreset*/ } from '../../functions.js'

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



// const nextQuestionIDs_templates = {
// 	improve: ['start_improve'],
// 	create: ['name','geo_pos','answer_more'],
// }

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

		this.answerIDs = new Set()
		this.sourcesText = ''

		this.inputValues = {}

		this.renderStage = this.renderStage.bind(this)

		this.answerQuestion = this.answerQuestion.bind(this)
		this.loadQuestions = this.loadQuestions.bind(this)
		this.submitInputs = this.submitInputs.bind(this)

		this.setQuestionAsActive = this.setQuestionAsActive.bind(this)
		this.saveGeoValue = this.saveGeoValue.bind(this)

		this.abort = this.abort.bind(this)
		this.acceptPrivacyPolicy = this.acceptPrivacyPolicy.bind(this)
		this.showQuestions = this.showQuestions.bind(this)
		this.addSources	 = this.addSources.bind(this)
		this.finish = this.finish.bind(this)
		this.saveSourcesText = this.saveSourcesText.bind(this)
	}

	componentDidMount(){
		// skip privacy cosent screen when already agreed
		const accepted_privacy_policy = this.props.cookies.get('accepted_privacy_policy')
		if (accepted_privacy_policy === 'yes') {
			this.setState({stageIndex: 1})
		}

		this.loadQuestions()
	}

	loadQuestions(){
		window.graphql.query({
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

				if (window.isSmallScreen && hasGeoInputField) {
					firstOpenQuestionCounter += 1
				}

				obj[questionDoc._id] = {
					...questionDoc,
					visible: true,
					active: (questionDoc._id === nextQuestionIDs[firstOpenQuestionCounter]),
					answered: false,
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
			if (!questionsById[questionID].answered) {
				questionsById[questionID].active = true
			}

			return {
				questionsById: questionsById,
			}
		})
	}

	answerQuestion(questionID, answerValue){
		let questionGotAnswered = false
		if (Object.keys(answerValue).length > 0) {
			questionGotAnswered = true
		}

		if (questionGotAnswered) {
			window.graphql.mutate({
				mutation: mutation_answerQuestion,
				variables: {
					properties: {
						forID: this.props.doc._id,
						questionID: questionID,
						answer: answerValue,
					}
				}
			}).then(result=>{
				console.log('mutate-result', result.data.answerQuestion)
				this.answerIDs.add(result.data.answerQuestion)
			}).catch(error=>{
				console.error('mutate-error', error)
			})
		}

		this.setState((state, props) => { // start this while mutating
			let questionsById = state.questionsById


			let nextQuestionIDs = [
				...props.startQuestions,
				...state.nextQuestionIDs,
			]

			questionsById[questionID].active = false
			if (questionGotAnswered) {
				questionsById[questionID].answered = true

				const allKeys = Object.keys(answerValue)
				nextQuestionIDs = [...new Set([
					...nextQuestionIDs,
					...(
						questionsById[questionID].properties.possibleAnswers
						.filter(answer => allKeys.includes(answer.key))
						.map(answer => answer.followUpQuestionIDs || [])
						.reduce((result,followUpQuestionIDs) => {
							return [...result, ...followUpQuestionIDs]
						}, [])
						.filter(questionID => !nextQuestionIDs.includes(questionID))
					)
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

			nextQuestionIDs = nextQuestionIDs.filter(id => !props.startQuestions.includes(id))

			if (questionGotAnswered) {
				return {
					nextQuestionIDs: nextQuestionIDs,
					questionsById: questionsById,
					answersByQuestionId: {
						...state.answersByQuestionId,
						[questionID]: answerValue,
					},
				}
			}else{
				return {
					nextQuestionIDs: nextQuestionIDs,
					questionsById: questionsById,
				}
			}
		})
	}

	saveInputValue(questionID, key, value){
		if (!!value && value !== '') {
			if (!this.inputValues[questionID]) {
				this.inputValues[questionID] = {}
			}
			this.inputValues[questionID][key] = value
		}else{
			if (!!this.inputValues[questionID]) {
				delete this.inputValues[questionID][key]
			}
		}
	}
	submitInputs(questionID){
		const tmp_inputValues = this.inputValues[questionID] || {}
		this.inputValues[questionID] = {}
		this.answerQuestion(questionID, tmp_inputValues)
	}
	getInputValue(questionID,key){
		return (this.inputValues[questionID] || {})[key] || ''
	}

	saveGeoValue(questionID,newValue){
		this.saveInputValue(questionID, 'lat', newValue.lat)
		this.saveInputValue(questionID, 'lng', newValue.lng)
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

		if (window.isSmallScreen && hasGeoInputField) {
			return null
		}

		const hasInputField = questionDoc.properties.possibleAnswers.filter(possibleAnswer => {
			return (
				possibleAnswer.inputtype === 'text' ||
				possibleAnswer.inputtype === 'number' ||
				possibleAnswer.inputtype === 'geo'
			)
		}).length > 0

		const isMultiRow = hasInputField || (questionDoc.properties.possibleAnswers && questionDoc.properties.possibleAnswers.length > 2)

		const questionText = window.getTranslation(questionDoc.properties.question)

		const location = this.props.doc.properties.geometry.location

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
					!questionDoc.answered && !questionDoc.active
					? ()=>this.setQuestionAsActive(questionDoc._id)
					: null
				}
			>
				{
					questionText !== ''
					? <Typography variant="body1" className="questionText">{questionText}</Typography>
					: undefined
				}
	
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
								possibleAnswer.inputtype = possibleAnswer.inputtype || ''
								if (possibleAnswer.inputtype === 'geo') {
									return (<GeoInput
										key={possibleAnswerKey}
										marker={{
											center: location,
											zoom: 18,
										}}
										doc={this.props.doc}
										onChange={(newValue)=>this.saveGeoValue(questionDoc._id, newValue)}
										style={{
											margin: '4px 8px',
										}}
									/>)
								}else if (possibleAnswer.inputtype === 'text') {
									return (<TextField
										key={possibleAnswerKey}
										label={possibleAnswer.title[0].text}
										variant="outlined"
										multiline
										color="secondary"
										defaultValue={this.getInputValue(questionDoc._id, possibleAnswerKey)}
										onChange={(event)=>this.saveInputValue(questionDoc._id, possibleAnswerKey, event.target.value)}
										style={{
											margin: '4px 8px',
										}}
									/>)
								}else if (possibleAnswer.inputtype === 'number') {
									return (<TextField
										type="number"
										key={possibleAnswerKey}
										label={possibleAnswer.title[0].text}
										variant="outlined"
										color="secondary"
										defaultValue={this.getInputValue(questionDoc._id, possibleAnswerKey)}
										onChange={(event)=>this.saveInputValue(questionDoc._id, possibleAnswerKey, event.target.value)}
										style={{
											margin: '4px 8px',
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
												isMultiRow
												? (
													<ListItemIcon style={{
														minWidth: '24px',
														margin: '6px 16px 0 0',
														alignSelf: 'flex-start',
													}}>
														{
															!!possibleAnswer.icon
															? (<div className="material-icons-round">{possibleAnswer.icon}</div>)
															: <></>
														}
													</ListItemIcon>
												)
												: undefined
											}
											<ListItemText
												primary={window.getTranslation(possibleAnswer.title)}
												secondary={window.getTranslation(possibleAnswer.description)}
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
		this.props.cookies.set('accepted_privacy_policy', 'yes', window.cookieOptions)
		this.props.cookies.set('uuid', uuidv4(), window.cookieOptions)

		this.showQuestions()
	}
	showQuestions(){
		this.setState({stageIndex:1})
	}
	addSources(){
		this.setState({stageIndex:2})
	}
	finish(){
		const sources = this.sourcesText

		if (this.answerIDs.size > 0) {
			if (sources !== '') {
				window.graphql.mutate({
					mutation: mutation_addSources,
					variables: {
						properties: {
							forIDs: [...this.answerIDs],
							sources: sources,
							dataset: 'qiekub_manual_submisions',
						}
					}
				})
				.then(result=>{
					console.log('mutation_addSources-result', result.data.addSources)
					this.compilePlace(this.props.doc._id)
				})
				.catch(error=>{
					console.error('mutation_addSources-error', error)
					this.compilePlace(this.props.doc._id)
				})
				// TODO can I use .finally() ?
			}else{
				this.compilePlace(this.props.doc._id)
			}
		}

		if (this.props.onFinish) {
			this.props.onFinish()
		}
	}
	compilePlace(docID){
		window.graphql.mutate({
			mutation: mutation_compilePlace,
			variables: {
				_id: docID
			}
		})
	}

	saveSourcesText(event){
		this.sourcesText = event.target.value
		console.log('this.sourcesText', this.sourcesText)
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
							privacy_policy_link: <Link target="_blank" href="https://www.qiekub.com/datenschutz.html"></Link>,
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

					{[
						...this.props.startQuestions,
						...this.state.nextQuestionIDs,
					].map(questionID => this.renderQuestion(questionID))}
	
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
					rows={3}
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

export default withCookies(withLocalization(withTheme(Questions)))

