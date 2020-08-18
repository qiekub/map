import {gql} from '@apollo/client'

export const id = gql`
	query {
		id
	}
`

export const whoami = gql`
	query {
		whoami
	}
`

export const place = gql`
	query($_id: ID, $wantedTags: [String], $languages: [String]){
		place(_id: $_id){
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
					tags(keys: $wantedTags)
				}
			}
		}
	}
`

export const countries = gql`
	query($wantedTags: [String], $languages: [String]){
		countries{
			_id
			properties {
				... on Place {
					name (languages: $languages){
						text
						language
					}
					tags(keys: $wantedTags)
				}
			}
		}
	}
`

export const markers = gql`
	query($languages: [String]){
		markers{
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

export const questions = gql`
	query($languages: [String]){
		questions {
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

export const countrycode = gql`
	query($lat: Float = 0.0, $lng: Float = 0.0) {
		countrycode(lat: $lat, lng: $lng)
	}
`

export const addChangeset = gql`
	mutation($properties: Changeset_Input){
		addChangeset(properties: $properties)
	}
`

export const addEdge = gql`
	mutation($properties: Edge_Input){
		addEdge(properties: $properties)
	}
`

export const sessions = gql`
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

export const accounts = gql`
	query {
		accounts {
			_id
			properties {
				__typename
				... on Account {
					provider
					username
					displayName
				}
			}
		}
	}
`

export const undecidedPlaces = gql`
	query($forID: ID) {
		undecidedPlaces(forID: $forID) {
			_id
		}
	}
`

export const undecidedTags = gql`
	query($forID: ID) {
		undecidedTags(forID: $forID)
	}
`

export const changesets = gql`
	query($forID: ID) {
		changesets(forID: $forID) {
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


