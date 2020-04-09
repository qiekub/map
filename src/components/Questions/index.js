import React from 'react'
import './index.css'

import { Localized } from '../Localized/'

// import {navigate/*,Router,Link*/} from '@reach/router'
// import {gql} from 'apollo-boost'
import {
	loadQuestions as query_loadQuestions,
	answerQuestion as mutation_answerQuestion,
} from '../../queries.js'

// import categories from '../../data/dist/categories.json'
// import presets from '../../data/dist/presets.json'
// import colors from '../../data/dist/colors.json'
// import colorsByPreset from '../../data/dist/colorsByPreset.json'
// import {getPreset, getColorByPreset} from '../../functions.js'

import {
	Typography,
	Button,
	Fab,
	// Snackbar,
	Paper,

	// List,
	ListItem,
	ListItemIcon,
	ListItemText,
	// ListSubheader,

	// Card,
	// CardContent,
	// Divider,
	// Chip,

	// Icon,

	TextField,
} from '@material-ui/core'
import {
	// Map as MapIcon,
	// Link as LinkIcon,

	// Phone as PhoneIcon,
	// Print as PrintIcon,
	// Mail as MailIcon,

	// Facebook as FacebookIcon,
	// Instagram as InstagramIcon,
	// Twitter as TwitterIcon,
	// YouTube as YouTubeIcon,

	// Edit as EditIcon,
	DoneRounded as DoneIcon,
	ArrowBackRounded as ArrowBackIcon,
	// ArrowForwardRounded as ArrowForwardIcon,
} from '@material-ui/icons'
// import {
// 	Autocomplete
// } from '@material-ui/lab'
import { withTheme } from '@material-ui/core/styles'

import GeoInput from '../GeoInput/'



const nextQuestionIDs_templates = {
	improve: ['start_improve'],
	create: ['name','geo_pos','answer_more'],
}

class Questions extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			questionsAreLoaded: false,
			answersByQuestionId: {},
			questionDoc: null,

			questionsById: {},
			nextQuestionIDs: nextQuestionIDs_templates.create,
		}

		this.inputValues = {}

		this.answerQuestion = this.answerQuestion.bind(this)
		this.finish = this.finish.bind(this)
		this.loadQuestions = this.loadQuestions.bind(this)
		this.submitInputs = this.submitInputs.bind(this)

		this.setQuestionAsActive = this.setQuestionAsActive.bind(this)
		this.saveGeoValue = this.saveGeoValue.bind(this)
	}

	componentDidMount(){
		this.loadQuestions()
	}

	finish(){
		if (this.props.onFinish) {
			this.props.onFinish()
		}
	}

	loadQuestions(){
		window.graphql.query({
			query: query_loadQuestions,
			variables: {
				languages: navigator.languages,
			},
		}).then(result => {
			// this.questions = result.data.questions
			// let counter = 0
			const questionsById = result.data.questions.reduce((obj,questionDoc)=>{
				obj[questionDoc._id] = {
					...questionDoc,
					visible: true,
					// active: (counter === 0),
					active: (questionDoc._id === this.state.nextQuestionIDs[0]),
					// active: false,
					answered: false,
				}
				// counter += 1
				return obj
			}, {})
			// this.questionIDs = Object.keys(questionsById)

			this.setState({
				questionsById,
				questionsAreLoaded: true,
			}/*, ()=>{
				this.setQuestionAsActive(this.state.nextQuestionIDs[0])
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
				// console.info('mutate-result', result)
			}).catch(error=>{
				console.error('mutate-error', error)
			})
		}

		this.setState((state, props) => { // start this while mutating
			let questionsById = state.questionsById

			let nextQuestionIDs = state.nextQuestionIDs

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

		const hasInputField = questionDoc.properties.possibleAnswers.reduce((bool,possibleAnswer)=>{
			return (
				bool ||
				(possibleAnswer.inputtype || '') === 'text' ||
				(possibleAnswer.inputtype || '') === 'number' ||
				(possibleAnswer.inputtype || '') === 'geo'
			)
		}, false)

		const isMultiRow = hasInputField || (questionDoc.properties.possibleAnswers && questionDoc.properties.possibleAnswers.length > 2)

		if (!questionDoc.visible) {
			return null
		}

		const questionText = window.getTranslation(questionDoc.properties.question)

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
				elevation={0}
				onClick={
					!questionDoc.answered && !questionDoc.active
					? ()=>this.setQuestionAsActive(questionDoc._id)
					: null
				}
				variant="outlined"
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
										defaultValue={this.getInputValue(questionDoc._id, possibleAnswerKey)}
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
									/*return (
										<Button
											key={possibleAnswerKey}
											onClick={()=>this.answerQuestion(questionDoc._id, {[possibleAnswerKey]:true})}
											variant="outlined"
											size="large"
											style={{
												flexGrow: '1',
												border: 'none',
												color: 'inherit',
												margin: '4px 8px',
												padding: (hasInputField ? '16px 8px 16px 16px' : '16px 8px'),
												justifyContent: (hasInputField ? 'flex-start' : 'center'),
												boxShadow: `inset 0 0 0 999px ${this.props.theme.palette.divider}`,
											}}
										>
											{
												!!possibleAnswer.icon
												? (<div className="material-icons-round" style={{
													marginRight: '8px',
												}}>{possibleAnswer.icon}</div>)
												: null
											}
											{possibleAnswer.title[0].text}
										</Button>
									)*/
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

	render() {
		const doc = this.props.doc

		if (!(
			!!doc &&
			!!doc._id
		)) {
			return null
		}

		if (!this.state.questionsAreLoaded) {
			return (<div style={{textAlign:'center', margin:'16px'}}>
				<Typography variant="body1" style={{margin:'0 0 32px 0'}}>
					<Localized id="questions_are_loading" />
				</Typography>

				<Fab
					variant="extended"
					onClick={this.finish}
					size="large"
					color="secondary"
					style={{
						// color: 'white',
						// background: 'black',
						borderRadius: '999px',
						padding: '8px 16px',
					}}
				>
					<Localized id="stop_loading" />
				</Fab>
			</div>)
		} else if (!!this.state.questionsById && Object.keys(this.state.questionsById).length > 0) {
			return (<>
				<div className="questionsList">
					{this.state.nextQuestionIDs.map(questionID => this.renderQuestion(questionID))}
				</div>

				<div style={{textAlign:'left', margin:'32px 0 64px 0'}}>
					<Fab
						variant="extended"
						onClick={this.finish}
						size="large"
						color="secondary"
						style={{
							// color: 'white',
							// background: 'black',
							borderRadius: '999px',
							padding: '8px 16px',
						}}
					>
						<ArrowBackIcon style={{color:'var(--light-green)',marginRight:'8px'}}/>
						<Localized id="back_to_viewing" />
					</Fab>
				</div>
			</>)
		}
		/*else{
			return (<div style={{textAlign:'center', margin:'16px'}}>
				<Typography variant="body1" style={{margin:'0 0 32px 0'}}>Du hast alle Fragen beantwortet!<br />Vielen Dank!!!</Typography>

				<Fab
					variant="extended"
					onClick={this.finish}
					size="large"
					color="secondary"
					style={{
						// color: 'white',
						// background: 'black',
						borderRadius: '999px',
						padding: '8px 16px',
					}}
				>
					<DoneIcon style={{color:'var(--light-green)',marginRight:'8px'}}/> Fertig
				</Fab>
			</div>)
		}*/
	}
}

export default withTheme(Questions)

