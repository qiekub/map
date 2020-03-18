import {gql} from 'apollo-boost'

export const loadPoi = gql`
	query($_id: String=""){
		getPlace(_id: $_id){
			_id
			properties {
				... on Place {
					name
					geometry {
						location {
							lng
							lat
						}
					}
					osmID
					tags
					permanently_closed
				}
			}
		}
	}
`

export const loadPois = gql`
	query{
		getPlaces{
			_id
			properties {
				... on Place {
					name
					geometry {
						location {
							lng
							lat
						}
					}
					osmID
					tags
					permanently_closed
				}
			}
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