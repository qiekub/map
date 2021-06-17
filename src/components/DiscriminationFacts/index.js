import React, { useState, useCallback, useEffect } from 'react'

import { getILGA } from '../../functions.js'

import { Localized, withLocalization } from '../Localized/'
import { withGlobals } from '../Globals/'
import { withTheme } from '@material-ui/core/styles'

import { getTranslationFromArray } from '../../functions.js'

import {
	Link,

	Chip,
	Typography,

	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	ListSubheader,

	Collapse,
	IconButton,
	Icon,
} from '@material-ui/core'
import {
	PeopleRounded as PeopleIcon,
	GavelRounded as GavelIcon,
	LockRounded as LockIcon,

	ExpandMore as ExpandMoreIcon,
} from '@material-ui/icons'

import ilga_rotating_globe from '../../images/ilga_rotating_logo.gif'

const IlgaGlobeIcon_inner = props => <Icon
	style={{
		backgroundImage: 'url(' + ilga_rotating_globe + ')',
		backgroundSize: 'contain',
		backgroundRepeat: 'no-repeat',
		backgroundPosition: 'center',
		backgroundColor: 'white',
		borderRadius: '100%',
		marginLeft: '-4px',
		height: '30px',
		width: '30px',
		filter: (
			props.theme.palette.type === 'dark'
				? 'invert(1) contrast(0.835) hue-rotate(180deg) saturate(2) brightness(1.5)'
				: ''
		),
	}}
></Icon>
const IlgaGlobeIcon = withTheme(IlgaGlobeIcon_inner)

function DiscriminationFacts({ toggleable, style, key, inline, getString, globals, theme, countryCode }) {
	const [ilga, setIlga] = useState(null)
	const [countryDoc, setCountryDoc] = useState(null)
	const [expanded, setExpanded] = useState(false)

	const toggleExpanded = useCallback(()=>{
		setExpanded(!expanded)
	}, [expanded])

	useEffect(() => {
		const alpha3code = countryCode // tags['ISO3166-1:alpha3']
		if (alpha3code) {
			globals.getCountryByCode(alpha3code, countryDoc => {
				const ilga = getILGA(alpha3code)
				setIlga(ilga)
				setCountryDoc(countryDoc)
			})
		} else {
			setIlga(null)
			setCountryDoc(null)
		}
	}, [countryCode, globals])

	function chipFunction (label) {
		if (typeof label === 'string') {
			return (<Chip
				component="div"
				size="small"
				style={{
					margin: '0 4px 4px 0',
				}}
				key={label}
				label={getString(label.replace(/:/g, '_'), null, label + '')}
			/>)
		}

		return label
	}

		// if (tags.preset !== 'boundary/administrative') {
		// 	return null
		// }

		if (ilga) {
			const getStatusColor = status => {
				if (status === 'great') {
					return theme.palette.success.main
				} else if (status === 'ok') {
					return theme.palette.warning.main
				} else if (status === 'bad') {
					return theme.palette.error.main
				}
				return ''
			}

			const ilga_criminalisation_secondary = ilga.criminalisation.description.map(chipFunction)
			const ilga_protection_secondary = ilga.protection.description.map(chipFunction)
			const ilga_penalty_secondary = ilga.penalty.description.map(item => {
				if (
					typeof item === 'string'
					&& item.endsWith(':years')
					&& ilga.penalty.vars.years
				) {
					item = getString('criminalisation_penalty_max_years', {
						n: ilga.penalty.vars.years,
					})
				}
				return chipFunction(item)
			})
			const ilga_recognition_secondary = ilga.recognition.description.map(chipFunction)

			const isToggleable = toggleable
			const isExpanded = (
				isToggleable
					? expanded || false
					: true
			)

			const countryName = (
				!!countryDoc
					&& !!countryDoc.properties
					&& !!countryDoc.properties.name
					? getTranslationFromArray(countryDoc.properties.name, globals.userLocales)
					: null
			)

			const toggleButton = (
				<IconButton
					aria-expanded={isExpanded}
					aria-label="show more"
					style={{
						transition: theme.transitions.create('transform', {
							duration: theme.transitions.duration.shortest,
						}),
						transform: (
							isExpanded
								? 'rotate(180deg)'
								: 'rotate(0deg)'
						),
						marginRight: '-16px',
						height: '48px',
						width: '48px',
					}}
					edge="end"
				>
					<ExpandMoreIcon />
				</IconButton>
			)

			return (<React.Fragment key={key}>
				{
					!!inline
						? (
							<ListItem
								dense
								button
								onClick={toggleExpanded}
								style={{
									margin: '0 -16px',
									...style,
								}}
							>
								<ListItemIcon>
									<IlgaGlobeIcon />
								</ListItemIcon>
								<ListItemText
									primary={
										!!countryName
											? <Localized id="ilga_heading_main_for_country" vars={{ country: countryName }} />
											: <Localized id="ilga_heading_main" />
									}
									primaryTypographyProps={{
										variant: 'body2',
									}}
								/>
								{
									isToggleable
										? toggleButton
										: null
								}
							</ListItem>
						)
						: (
							<ListSubheader
								onClick={toggleExpanded}
								style={{
									cursor: (isToggleable ? 'pointer' : 'default'),
									display: 'flex',
									justifyContent: 'space-between',
									padding: '0 16px',
								}}
							>
								<div
									style={{
										lineHeight: '20px',
										padding: '14px 0',
									}}
								>
									{
										!!countryName
											? <Localized id="ilga_heading_main_for_country" vars={{ country: countryName }} />
											: <Localized id="ilga_heading_main" />
									}
								</div>
								{
									isToggleable
										? toggleButton
										: null
								}
							</ListSubheader>
						)
				}

				<Collapse in={isExpanded} timeout="auto" unmountOnExit>
					<List key="ILGA" dense>
						<ListItem>
							<ListItemIcon style={{
								alignSelf: 'flex-start',
								paddingTop: '12px',
								color: getStatusColor(ilga.criminalisation.status),
							}}>
								<PeopleIcon />
							</ListItemIcon>
							<ListItemText
								primary={<Localized id="ilga_heading_criminalisation" />}
								secondary={ilga_criminalisation_secondary}
								secondaryTypographyProps={{
									component: 'div',
									style: {
										marginTop: '4px',
									}
								}}
							/>
						</ListItem>
						<ListItem>
							<ListItemIcon style={{
								alignSelf: 'flex-start',
								paddingTop: '12px',
								color: getStatusColor(ilga.penalty.status),
							}}>
								<GavelIcon />
							</ListItemIcon>
							<ListItemText
								primary={<Localized id="ilga_heading_penalty" />}
								secondary={ilga_penalty_secondary}
								secondaryTypographyProps={{
									component: 'div',
									style: {
										marginTop: '4px',
									}
								}}
							/>
						</ListItem>
						<ListItem>
							<ListItemIcon style={{
								alignSelf: 'flex-start',
								paddingTop: '12px',
								color: getStatusColor(ilga.protection.status),
							}}>
								<LockIcon />
							</ListItemIcon>
							<ListItemText
								primary={<Localized id="ilga_heading_protection" />}
								secondary={ilga_protection_secondary}
								secondaryTypographyProps={{
									component: 'div',
									style: {
										marginTop: '4px',
									}
								}}
							/>
						</ListItem>
						<ListItem>
							<ListItemIcon style={{
								alignSelf: 'flex-start',
								paddingTop: '12px',
								color: getStatusColor(ilga.recognition.status),
							}}>
								<PeopleIcon />
							</ListItemIcon>
							<ListItemText
								primary={<Localized id="ilga_heading_recognition" />}
								secondary={ilga_recognition_secondary}
								secondaryTypographyProps={{
									component: 'div',
									style: {
										marginTop: '4px',
									}
								}}
							/>
						</ListItem>
					</List>

					<Typography variant="caption" style={{
						display: 'block',
						margin: '0 16px 16px 16px',
					}}>
						<Localized
							id="ilga_data_source_info_text"
							elems={{
								dataset_link: <Link target="_blank" href="https://ilga.org/maps-sexual-orientation-laws" />,
							}}
						/>
					</Typography>

				</Collapse>
			</React.Fragment>)
		}

		return null
}

export default withGlobals(withLocalization(withTheme(DiscriminationFacts)))
