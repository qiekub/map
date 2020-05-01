import {gql} from 'apollo-boost'

export const getID = gql`
	query{
		id: getID
	}
`

export const loadPlace = gql`
	query($_id: ID, $wantedTags: [String], $languages: [String]){
		getPlace(_id: $_id){
			_id
			properties {
				... on Place {
					name (languages: $languages){
						text
						language
					}
					geometry {
						location {
							lng
							lat
						}
					}
					tags(keys: $wantedTags)
					confidences(keys: $wantedTags)
				}
			}
		}
	}
`

// export const loadPlaces = gql`
// 	query($wantedTags: [String]){
// 		getPlaces{
// 			_id
// 			properties {
// 				... on Place {
// 					geometry {
// 						location {
// 							lng
// 							lat
// 						}
// 					}
// 					tags(keys: $wantedTags)
// 				}
// 			}
// 		}
// 	}
// `

export const loadMarkers = gql`
	query($languages: [String]){
		getMarkers{
			_id
			name (languages: $languages){
				text
				language
			}
			lng
			lat
			preset
		}
	}
`

export const search = gql`
	query($query: String=""){
		search(query: $query){	
			geometry {
				boundingbox {
					northeast {
						lng
						lat
					}
					southwest {
						lng
						lat
					}
				}
			}
		}
	}
`

export const loadQuestions = gql`
	query($languages: [String]){
		questions: getQuestions {
			_id
			properties {
				... on Question {
					question (languages: $languages){
						text
						language
					}
					possibleAnswers {
						inputtype
						parsers
						key
						icon
						title (languages: $languages){
							text
							language
						}
						description (languages: $languages){
							text
							language
						}
						followUpQuestionIDs
						tags
						hidden
					}
				}
			}
		}
	}
`

export const isGeoCoordinateLegal = gql`
	query($lat: Float = 0.0, $lng: Float = 0.0) {
		isGeoCoordinateLegal(lat: $lat, lng: $lng)
	}
`

export const answerQuestion = gql`
	mutation($properties: JSONObject){
		answerQuestion(properties: $properties)
	}
`

export const addSources = gql`
	mutation($properties: Sources_input){
		addSources(properties: $properties)
	}
`

export const addChangeset = gql`
	mutation($properties: Changeset_Input){
		addChangeset(properties: $properties)
	}
`

export const compilePlace = gql`
	mutation($_id: ID){
		compilePlace(_id: $_id)
	}
`


