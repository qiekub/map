import React from 'react'
import './index.css'

// import {navigate/*,Router,Link*/} from '@reach/router'
// import {gql} from 'apollo-boost'
import {
	loadQuestions as query_loadQuestions,
	answerQuestion as mutation_answerQuestion,
} from '../queries.js'

// import categories from '../data/dist/categories.json'
// import presets from '../data/dist/presets.json'
// import colors from '../data/dist/colors.json'
// import colorsByPreset from '../data/dist/colorsByPreset.json'
// import {getPreset, getColorByPreset} from '../functions.js'

import {
	Typography,
	Button,
	Fab,
	// Snackbar,
	Paper,

	// List,
	// ListItem,
	// ListItemIcon,
	// ListItemText,
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

/*
const questions = [
	{
		_id: 'tag_wheelchair',
		properties: {
			question: 'Ist dieser Ort mit einem Rollstuhl erreichbar?',
			possibleAnswers: [
				{
					key: 'yes',
					// icon: 'check',
					title: 'Ja',
					tag: {
						wheelchair:'yes',
					},
				},
				{
					key: 'no',
					// icon: 'clear',
					title: 'Nein',
					tag: {
						wheelchair:'no',
					},
				},
			],
		}
	},
	{
		_id: 'tag_toilets',
		properties: {
			question: 'Hat dieser Ort Toiletten?',
			possibleAnswers: [
				{
					key: 'yes',
					title: 'Ja',
					tag: {
						'toilets':'yes',
					},
				},
				{
					key: 'no',
					title: 'Nein',
					tag: {
						'toilets':'no',
					},
				},
			]
		}
	}
]
const questionsById = questions.reduce((obj,questionDoc)=>{
	obj[questionDoc._id] = questionDoc
	return obj
}, {})
const questionIDs = Object.keys(questionsById)
console.log('questionsById', questionsById)
*/

export default class Questions extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			questionsAreLoaded: false,
			answersByQuestionId: {},
			questionDoc: null,
		}
		
		this.inputValues = {}

		this.answerQuestion = this.answerQuestion.bind(this)
		this.finish = this.finish.bind(this)
		this.loadQuestions = this.loadQuestions.bind(this)
		this.submitInputs = this.submitInputs.bind(this)

		this.setQuestionAsActive = this.setQuestionAsActive.bind(this)
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
			// variables: {},
		}).then(result => {
			// this.questions = result.data.questions
			let counter = 0
			this.questionsById = result.data.questions.reduce((obj,questionDoc)=>{
				obj[questionDoc._id] = {
					...questionDoc,
					visible: true,
					active: (counter === 0),
					answered: false,
				}
				counter += 1
				return obj
			}, {})
			// this.questionIDs = Object.keys(this.questionsById)

			this.setState({
				questionsById: this.questionsById,
				questionsAreLoaded: true,
			})
		}).catch(error=>{
			console.error(error)
		})
	}

	setQuestionAsActive(questionID){
		// if (Object.keys(this.inputValues).length > 0) {
		// 	this.answerQuestion(questionDoc, this.inputValues)
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

	answerQuestion(questionDoc, answerValue){
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
						questionID: questionDoc._id,
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

			questionsById[questionDoc._id].active = false
			if (questionGotAnswered) {
				questionsById[questionDoc._id].answered = true
			}

			const questionIDs = Object.keys(state.questionsById)
			const thisIndex = questionIDs.indexOf(questionDoc._id)
			if (thisIndex < questionIDs.length-1) {
				for (let i=thisIndex+1; i<questionIDs.length; i+=1) {
					if (!questionsById[questionIDs[i]].answered) {
						questionsById[questionIDs[i]].active = true
						break;
					}
				}
			}

			if (questionGotAnswered) {
				return {
					questionsById: questionsById,
					answersByQuestionId: {
						...state.answersByQuestionId,
						[questionDoc._id]: answerValue,
					},
				}
			}else{
				return {
					questionsById: questionsById,
				}
			}
		})
	}

	saveInputValue(key, event){
		if (!!event.target.value && event.target.value !== '') {
			this.inputValues[key] = event.target.value
		}else{
			delete this.inputValues[key]
		}
	}
	submitInputs(questionDoc){
		const tmp_inputValues = this.inputValues
		this.inputValues = {}
		this.answerQuestion(questionDoc, tmp_inputValues)
	}

	renderQuestion(questionDoc){
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
				(possibleAnswer.inputtype || '') === 'number'
			)
		}, false)

		if (!questionDoc.visible) {
			return null
		}

		return (
			<Paper
				key={`question_${questionDoc._id}`}
				className={
					'questionCard '
					+(questionDoc.answered ? 'answered ' : '')
					+(questionDoc.active ? 'active ' : '')
					+(hasInputField ? 'hasInputField ' : '')
				}
				elevation={0}
				onClick={
					!questionDoc.answered && !questionDoc.active
					? ()=>this.setQuestionAsActive(questionDoc._id)
					: null
				}
			>
				<Typography variant="body1">{questionDoc.properties.question}</Typography>
	
				<div
					className="possibleAnswers"
					style={{
						flexDirection: (hasInputField ? 'column' : 'row'),
					}}
				>
					{questionDoc.properties.possibleAnswers.map(possibleAnswer=>{
						const possibleAnswerKey = possibleAnswer.key
						// const possibleAnswer = pair[0]
						possibleAnswer.inputtype = possibleAnswer.inputtype || ''
						if (possibleAnswer.inputtype === 'text') {
							return (<TextField
								key={possibleAnswerKey}
								label={possibleAnswer.title}
								variant="outlined"
								multiline
								onChange={(event)=>this.saveInputValue(possibleAnswerKey, event)}
								style={{
									margin: '4px 8px',
								}}
							/>)
						}else if (possibleAnswer.inputtype === 'number') {
							return (<TextField
								type="number"
								key={possibleAnswerKey}
								label={possibleAnswer.title}
								variant="outlined"
								onChange={(event)=>this.saveInputValue(possibleAnswerKey, event)}
								style={{
									margin: '4px 8px',
								}}
							/>)
						}else{
							return (
								<Button
									key={possibleAnswerKey}
									onClick={()=>this.answerQuestion(questionDoc,{[possibleAnswerKey]:true})}
									variant="outlined"
									size="large"
									style={{
										flexGrow: '1',
										border: 'none',
										boxShadow: 'inset 0 0 0 999px rgba(0,0,0,0.04)',
										color: 'inherit',
										margin: '4px 8px',
										padding: (hasInputField ? '16px 8px 16px 16px' : '16px 8px'),
										justifyContent: (hasInputField ? 'flex-start' : 'center'),
									}}
								>
									{
										!!possibleAnswer.icon
										? (<div className="material-icons-round" style={{
											marginRight: '8px',
										}}>{possibleAnswer.icon}</div>)
										: null
									}
									{possibleAnswer.title}
								</Button>
							)
						}
					})}
				</div>
		
				<div className="saveButton">
					<Button
						onClick={()=>this.submitInputs(questionDoc)}
						variant="outlined"
						size="large"
						style={{
							border: 'none',
							boxShadow: 'rgba(0, 0, 0, 0.04) 0px 0px 0px 999px inset',
							color: 'inherit',
							margin: '0',
							padding: '8px 16px 8px 12px',
						}}
					>
						<DoneIcon style={{color:'var(--light-green)',marginRight:'8px'}}/>
						Speichern
					</Button>

					{/*<Fab
						variant="extended"
						onClick={()=>this.submitInputs(questionDoc)}
						size="large"
						style={{
							color: 'white',
							background: 'black',
							borderRadius: '999px',
							padding: '0 16px 0 20px',
						}}
					>
						Weiter <ArrowForwardIcon style={{color:'var(--light-green)',marginLeft:'8px'}}/>
					</Fab>*/}
				</div>
			</Paper>
		)
	}

	render() {
		const doc = this.props.doc

		if (!(
			!!doc &&
			!!doc._id &&
			!!doc.properties &&
			!!doc.properties.tags
		)) {
			return null
		}

		// const properties = doc.properties
		// const tags = properties.tags

		if (!this.state.questionsAreLoaded) {
			return (<div style={{textAlign:'center', margin:'16px'}}>
				<Typography variant="body1" style={{margin:'0 0 32px 0'}}>Die Fragen werden geladen...</Typography>

				<Fab
					variant="extended"
					onClick={this.finish}
					size="large"
					style={{
						color: 'white',
						background: 'black',
						borderRadius: '999px',
						padding: '8px 16px',
					}}
				>
					Abbrechen
				</Fab>
			</div>)
		} else if (!!this.state.questionsById && Object.keys(this.state.questionsById).length > 0) {
			return (<>
				<div className="questionsList">
					{Object.entries(this.state.questionsById).map(pair => this.renderQuestion(pair[1]))}
				</div>

				<div style={{textAlign:'left', margin:'32px 0 64px 0'}}>
					<Fab
						variant="extended"
						onClick={this.finish}
						size="large"
						style={{
							color: 'white',
							background: 'black',
							borderRadius: '999px',
							padding: '8px 16px',
						}}
					>
						<ArrowBackIcon style={{color:'var(--light-green)',marginRight:'8px'}}/>
						Fertig
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
					style={{
						color: 'white',
						background: 'black',
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