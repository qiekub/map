import {gql} from 'apollo-boost'

export const getID = gql`
	query {
		id: getID
	}
`

export const whoami = gql`
	query {
		whoami
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
			tags
		}
	}
`

export const search = gql`
	query($query: String="", $languages: [String]){
		search(query: $query, languages: $languages){
			query
			results {
				placeID
				preset
				name {
					text
					language
				}
				address
				geometry {
					location {
						lng
						lat
					}
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
					in_one_word (languages: $languages){
						text
						language
					}
					description (languages: $languages){
						text
						language
					}
					icon
					possibleAnswers {
						inputtype
						namespace
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

export const addChangeset = gql`
	mutation($properties: Changeset_Input){
		addChangeset(properties: $properties)
	}
`

export const loadSessions = gql`
	query {
		sessions {
			_id
			properties {
				__typename
				... on Session {
					profileID
					user_agent
					started
					expires
					lastModified
				}
			}
		}
	}
`

export const loadAccounts = gql`
	query {
		accounts {
			_id
			properties {
				__typename
				... on Account {
					provider
					username
				}
			}
		}
	}
`

export const loadChangesets = gql`
	query {
		changesets {
			_id
			properties {
				__typename
				... on Changeset {
					forID
					tags
					sources
					fromBot
					dataset
					antiSpamUserIdentifier
				}
			}
			metadata {
				created
			}
		}
	}
`


