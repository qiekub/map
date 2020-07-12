import React, { useState, useMemo, useCallback } from 'react'

import {
	Card,
	CardContent,
	CardActions,
	Typography,
	Table,
	TableBody,
	TableRow,
	TableCell,
	Button,
	Tooltip,
	IconButton,
} from '@material-ui/core'

import {
	ThumbDownRounded as ThumbDownIcon,
	ThumbUpRounded as ThumbUpIcon,
	// CheckRounded as CheckIcon,
	SkipNextRounded as SkipNextIcon,
} from '@material-ui/icons'

import {
	addEdge as mutate_addEdge,
} from '../../queries.js'

import { withLocalization } from '../Localized/'
import { withGlobals } from '../Globals/'
import { withTheme } from '@material-ui/core/styles'

	function getName(tags){
		if (tags.name) {
			return tags.name
		}else{
			const keys = Object.keys(tags).filter(k => k.startsWith('name:'))
			if (keys.length > 0) {
				return tags[keys[0]]
			}
		}

		return ''
	}

const Changeset = ({theme, changeset, globals, variant}) => {
	const [visible, setVisible] = useState(true)
	const name = useMemo(()=>getName(changeset.properties.tags), [changeset])
	const backgroundColor = useMemo(()=>theme.palette.background.paper, [theme])
	const foregroundColor = useMemo(()=>theme.palette.getContrastText(backgroundColor), [theme,backgroundColor])

	const decideAboutChangeset = useCallback((edgeType) => {
		globals.graphql.mutate({
			fetchPolicy: 'no-cache',
			mutation: mutate_addEdge,
			variables: {
				properties: {
					edgeType,
					fromID: globals.profileID,
					toID: changeset._id,
					tags: {},
				},
			},
		})
		.then(({data}) => {
			setVisible(false)
		})
		.catch(error=>{
			console.error(error)
		})
	}, [changeset, globals, setVisible])

	const addCorrection = useCallback(() => {
		window.open(`/add/${changeset.properties.forID}/`, '_blank')
	}, [changeset])

	if (visible) {
		return (
			<Card
				key={changeset._id}
				variant={variant || 'outlined'}
				elevation={variant === 'elevation' ? 6 : 0}
				style={{
					margin: '16px 16px 32px 16px',
					backgroundColor: backgroundColor,
					color: foregroundColor,
				}}
			>
				<CardContent>
					<Typography variant="h5" component="h2">
						{name}
					</Typography>

					<div style={{
						paddingTop: '16px',
						paddingBottom: '16px',
						margin: '0 -16px',

						overflow: 'auto',
						// margin: '-8px -16px -16px',
					}}>
						<Table size="small">
							<TableBody>
								{
									Object.entries({
										_id: changeset._id,
										...changeset.properties,
										...changeset.metadata,
									})
									.filter(entry =>
										// entry[0] !== 'tags'
										// &&
										entry[0] !== '__typename'
										// && entry[0] !== 'forID'
									)
									.map(([tag,value]) => {
										if (tag === 'antiSpamUserIdentifier') {
											tag = 'antiSpamID'
										}

										let cellContent = null
										if (tag === 'tags') {
											cellContent = (
												<Table
													className="tagsTable"
													size="small"
													style={{
														minWidth: '100%',
														margin: '-6px -16px -7px -16px',
													}}
												>
													<TableBody>
														{Object.entries(changeset.properties.tags).map(([tag,value]) => (
															<TableRow key={tag} style={{
																verticalAlign: 'top',
															}}>
																<TableCell component="th" scope="row">{tag}</TableCell>
																<TableCell>{!!value ? value.toString() : ''}</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											)
										} else if (tag === 'forID') {
											cellContent = (
												<Button
													variant="contained"
													color="secondary"
													onClick={addCorrection}
												>
													{value}
												</Button>
											)
										}else{
											cellContent = value.toString()
										}

										return (
											<TableRow key={tag} style={{
												verticalAlign: 'top',
											}}>
												<TableCell component="th" scope="row">
													<strong>{tag}</strong>
												</TableCell>
												<TableCell align="left">
													{cellContent}
												</TableCell>
											</TableRow>
										)
									})
								}
							</TableBody>
						</Table>
					</div>
				</CardContent>
				<CardActions style={{
					justifyContent: 'space-evenly',
				}}>
					<Tooltip
						title="Reject"
						aria-label="Reject"
					>
						<IconButton
							onClick={()=>{
								decideAboutChangeset('rejected')
							}}
							aria-label="Reject"
							style={{
								color: theme.palette.error.main,
							}}
						>
							<ThumbDownIcon />
						</IconButton>
					</Tooltip>
										
					<Tooltip
						title="Approve"
						aria-label="Approve"
					>
						<IconButton
							onClick={()=>{
								decideAboutChangeset('approved')
							}}
							aria-label="Approve"
							style={{
								color: theme.palette.success.main,
							}}
						>
							<ThumbUpIcon />
						</IconButton>
					</Tooltip>
					
					<Tooltip
						title="Skip"
						aria-label="Skip"
					>
						<IconButton
							onClick={()=>{
								decideAboutChangeset('skipped')
							}}
							aria-label="Skip"
						>
							<SkipNextIcon />
						</IconButton>
					</Tooltip>
				</CardActions>
			</Card>
		)
	}else{
		return null
	}
}

export default withGlobals(withLocalization(withTheme(Changeset)))
