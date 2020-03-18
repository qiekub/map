import {gql} from 'apollo-boost'

export const loadDoc = gql`
	query($_id: String=""){
		getPlace(_id: $_id){
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

export default {loadDoc}