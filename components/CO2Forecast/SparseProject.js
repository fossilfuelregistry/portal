import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Col, Divider, notification, Row } from "antd"
import useText from "lib/useText"
import { useSelector } from "react-redux"
import { useQuery } from "@apollo/client"
import { GQL_project } from "queries/country"
import GraphQLStatus from "../GraphQLStatus"
import { useConversionHooks } from "components/viz/conversionHooks"
import OpenCorporateCard from "../OpenCorporateCard"

import { useRouter } from "next/router"
import { ExportOutlined } from "@ant-design/icons"
import CountryProductionPieChart from "./CountryProductionPieChart"
import HelpModal from "../HelpModal"
import Sources from "./Sources"
import getConfig from "next/config"
import MapLibre from "../geo/MapLibre"
import ScopeBars from "../viz/ScopeBars"

const DEBUG = false

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

function SparseProject( { borders, countryCurrentProduction } ) {
	const { getText } = useText()
	const router = useRouter()
	const { projectCO2, goToCountryOverview } = useConversionHooks()
	const country = useSelector( redux => redux.country )
	const project = useSelector( redux => redux.project )
	const [ localeDescription, set_localeDescription ] = useState()

	DEBUG && console.info( 'SparseProject', { country, project } )

	const { data, loading, error } = useQuery( GQL_project, {
		variables: { id: project?.id },
		skip: !( project?.id > 0 )
	} )

	DEBUG && console.info( 'SparseProject', { country, project, loading, error, data } )

	const theProject = data?.project ?? {}

	// Strip wikitext stuff.
	const description = useMemo( () => {
		if( !theProject?.description ) return ''
		return theProject.description
			.replace( /\[\[/g, '' )
			.replace( /\]\]/g, '' )
			.replace( /<ref>(.?)*<\/ref>/sg, '' )
			.replace( /<ref name="(.?)*">(.?)*<\/ref>/sg, '' )
			.replace( /<ref (.?)*\/>/sg, '' )
	}, [ theProject?.description ] )

	const co2 = useMemo( () => {
		if( !theProject?.id ) return {}
		const co2 = projectCO2( theProject )
		DEBUG && console.info( 'SparseProject projectCO2', { theProject, co2 } )
		return co2
	}, [ theProject?.id ] )

	useEffect( () => {
		// Translate description

		if( router.locale === 'en' ) return
		if( !( description?.length > 0 ) ) {
			return
		}
		const asyncEffect = async() => {
			try {
				const api = await fetch( 'https://translation.googleapis.com/language/translate/v2?key=' + process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify( {
						source: 'en',
						target: router.locale,
						q: description
					} )
				} )
				if( !api.ok ) throw new Error( 'Translation fail ' + api.statusText )
				const resp = await api.json()
				set_localeDescription( resp?.data?.translations?.[ 0 ]?.translatedText )
			} catch( e ) {
				console.info( e )
				notification.error( {
					message: "Failed to translate description",
					description: e.message
				} )
			}
		}
		asyncEffect()
	}, [ description ] )

	if( loading || error )
		return <GraphQLStatus loading={ loading } error={ error }/>

	const allFuelsCO2 = { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] }
	const _addElements = ( a, b ) => {
		a.forEach( ( v, i ) => a[ i ] += b[ i ] )
	}
	co2.fuels.forEach( fuel => {
		_addElements( allFuelsCO2.scope1, co2[ fuel ].scope1 )
		_addElements( allFuelsCO2.scope3, co2[ fuel ].scope3 )
	} )
	DEBUG && console.info( 'SparseProject', co2, allFuelsCO2 )

	try {
		return (
			<>
				<Button
					block
					style={ {
						marginTop: 34,
						marginBottom: 16,
						borderColor: theme[ '@primary-color' ],
						color: theme[ '@primary-color' ]
					} }
					onClick={ goToCountryOverview }
				>
					{ getText( 'back_to_country_overview' ) }
				</Button>

				<Divider><h4>{ getText( 'project_overview' ) } - { project.projectIdentifier }</h4></Divider>

				<Alert type="warning" message={ getText( 'sparse_data_warning' ) } showIcon={ true }/>

				<Row gutter={ [ 16, 16 ] }>

					<Col xs={ 24 } xxl={ 12 }/>

					<Col xs={ 24 }>
						<CountryProductionPieChart
							project={ theProject }
							currentProduction={ countryCurrentProduction }
							production={ co2 }
						/>
					</Col>

					{ ( theProject.geom || theProject.geoPosition ) &&
					<Col xs={ 24 } xl={ 12 }>
						<MapLibre
							className="country-geo"
							outlineGeometry={ borders }
							projects={ [ theProject ] }
						/>
					</Col> }

					<Col xs={ 24 } xl={ 12 }>
						<div className="co2-card">
							<div className="header">
								{ getText( 'emissions' ) } - { getText( 'project' ) } - { getText( 'megaton' ) + ' CO²e' }
								<HelpModal title="ranges" content="explanation_ranges"/>
							</div>
							<div className="box">
								<div style={ { height: 400 } }>
									<ScopeBars
										totals={ allFuelsCO2 }
									/>
								</div>
							</div>
						</div>
					</Col>

					{ !!theProject.ocOperatorId &&
					<Col xs={ 24 } xl={ 12 }>
						<OpenCorporateCard reference={ theProject.ocOperatorId }/>
					</Col> }

					{ !!description &&
					<Col xs={ 24 } xl={ 12 }>
						<div className="co2-card">
							<div className="header">&nbsp;</div>
							<div className="box">
								<div>
									<b>{ theProject.projectIdentifier } </b>
									<a href={ theProject.linkUrl }><ExportOutlined/></a>
								</div>
								{ localeDescription?.length > 0 &&
								<>
									<span className="annotation">[{ getText( 'machine_translated_text' ) }]</span>
									<span dangerouslySetInnerHTML={ { __html: localeDescription } }/>
									<br/>
									<br/>
								</> }
								{ localeDescription?.length > 0 &&
								<span className="annotation">[{ getText( 'original_text' ) }]</span> }
								{ description }
							</div>
						</div>
					</Col> }

					{ !!theProject.linkUrl &&
					<Col xs={ 24 } xl={ 12 }>
						<div className="co2-card">
							<div className="header">Extended information from GEM</div>
							<div className="box">
								<div>
									<b>{ theProject.projectIdentifier } </b>
									<a href={ theProject.linkUrl }><ExportOutlined/></a>
								</div>
							</div>
						</div>
					</Col> }

					<Col xs={ 24 } xl={ 12 }>
						<Sources
							production={ co2.sources }
						/>
					</Col>

				</Row>

				<style jsx>{ `
                  .annotation {
                    opacity: 0.7;
                    font-size: 14px;
                    margin-right: 12px;
                  }
				` }
				</style>
			</> )
	} catch( e ) {
		console.info( e )
		return <Alert message={ e.message } type="error" showIcon/>
	}
}

export default SparseProject
