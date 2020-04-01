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
	ArrowForwardRounded as ArrowForwardIcon,
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

		this.setNextQuestionDoc = this.setNextQuestionDoc.bind(this)
		this.answerQuestion = this.answerQuestion.bind(this)
		this.finish = this.finish.bind(this)
		this.loadQuestions = this.loadQuestions.bind(this)
		this.submitInputs = this.submitInputs.bind(this)
		this.directlySubmitInputValue = this.directlySubmitInputValue.bind(this)
	}

	componentDidMount(){
		this.loadQuestions()
	}
	componentDidUpdate(){
		this.setNextQuestionDoc()
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
			this.questions = result.data.questions
			this.questionsById = this.questions.reduce((obj,questionDoc)=>{
				obj[questionDoc._id] = questionDoc
				return obj
			}, {})
			this.questionIDs = Object.keys(this.questionsById)

			this.setState({questionsAreLoaded:true})
		}).catch(error=>{
			console.error(error)
		})
	}

	answerQuestion(questionDoc, answerValue){
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
			console.info('mutate-result', result)
		}).catch(error=>{
			console.error('mutate-error', error)
		})

		this.setState((state,props)=>{ // start this while mutating
			return {
				answersByQuestionId: {
					...state.answersByQuestionId,
					[questionDoc._id]: answerValue,
				},
			}
		})
	}

	directlySubmitInputValue(questionDoc, answerKey, answerValue){
		this.answerQuestion(questionDoc, {
			[answerKey]: answerValue
		})
	}
	saveInputValue(key, event){
		this.inputValues[key] = event.target.value
	}
	submitInputs(questionDoc){
		this.answerQuestion(questionDoc, this.inputValues)
	}

	setNextQuestionDoc(){
		if (this.state.questionsAreLoaded) {
			const answeredQuestionIDs = Object.keys(this.state.answersByQuestionId)
		
			let nextQuestionDoc = null
			if (answeredQuestionIDs.length < 7) { 
				const questionIDs_NotAsked = (
					answeredQuestionIDs.length === 0
					? this.questionIDs
					: this.questionIDs.filter(id=>!answeredQuestionIDs.includes(id))
				)

				if (questionIDs_NotAsked.length > 0) {
					// nextQuestionDoc = this.questionsById[questionIDs_NotAsked[0]]
					nextQuestionDoc = this.questionsById[questionIDs_NotAsked[ Math.random() * questionIDs_NotAsked.length >> 0 ]] // get a random item // source: https://stackoverflow.com/questions/5915096/get-random-item-from-javascript-array
				}
			}
			
			this.setState((state,props)=>{
				if (nextQuestionDoc !== state.questionDoc) {
					this.inputValues = {}
					return {questionDoc: nextQuestionDoc}
				}
				return null
			})
		}
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

		return (<React.Fragment key="question">
			<div style={{margin:'16px'}}>
				<Typography variant="h6">{questionDoc.properties.question}</Typography>

				<div style={{
					display: 'flex',
					alignItems: 'stretch',
					alignContent: 'stretch',
					justifyContent: 'space-between',
					margin: '24px -8px -8px -8px',
					flexDirection: (hasInputField ? 'column' : 'row'),
				}}>
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
									onClick={()=>this.directlySubmitInputValue(questionDoc,possibleAnswerKey,true)}
									variant="outlined"
									size="large"
									style={{
										flexGrow: '1',
										border: 'none',
										boxShadow: 'inset 0 0 0 999px rgba(0,0,0,0.04)',
										color: 'inherit',
										margin: '4px 8px',
										padding: '16px 8px',
									}}
								>
									{
										!!possibleAnswer.icon
										? (<div className="material-icons" style={{
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

				<div style={{
					margin: (hasInputField ? '32px 0 0 -16px' : '64px -16px 0 -16px'),
					padding: '0',
					display: 'flex',
					justifyContent: (hasInputField ? 'space-between' : 'end'),
				}}>
					<Button
						variant="text"
						onClick={()=>this.answerQuestion(questionDoc,'skipped')}
						size="large"
						style={{
							color: 'inherit',
							borderRadius: '999px',
							padding: '8px 16px',
						}}
					>
						Überspringen {hasInputField ? null : <ArrowForwardIcon style={{color:'inherit',marginLeft:'8px'}}/>}
					</Button>

					{
						hasInputField
						? (<Fab
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
						</Fab>)
						: null
					}
				</div>
			</div>
		</React.Fragment>)
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

		const questionDoc = this.state.questionDoc

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
		} else if (!!questionDoc) {
			return this.renderQuestion(questionDoc)
		}else{
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
		}
	}
}