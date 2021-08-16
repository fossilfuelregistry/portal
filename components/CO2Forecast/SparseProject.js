import React, { useEffect, useMemo, useState } from "react"
import { Alert, Col, notification, Row } from "antd"
import useText from "lib/useText"
import { useSelector } from "react-redux"
import { useQuery } from "@apollo/client"
import { GQL_sparseProject } from "queries/country"
import GraphQLStatus from "../GraphQLStatus"
import { useConversionHooks } from "components/viz/conversionHooks"
import OpenCorporateCard from "../OpenCorporateCard"

import { useRouter } from "next/router"
import { ExportOutlined } from "@ant-design/icons"
import BarStackChart from "components/viz/BarStackChart"

const DEBUG = false

function SparseProject() {
	const { getText } = useText()
	const router = useRouter()
	const { getCountryCurrentCO2 } = useConversionHooks()
	const country = useSelector( redux => redux.country )
	const project = useSelector( redux => redux.project )
	const [ countryCO2Total, set_countryCO2Total ] = useState( 0 )
	const [ localeDescription, set_localeDescription ] = useState()
	const { co2FromVolume } = useConversionHooks()

	DEBUG && console.log( 'SparseProject', { country, project, countryCO2Total } )

	useEffect( () => {
		const asyncEffect = async() => {
			const ct = await getCountryCurrentCO2( country )
			set_countryCO2Total( ct )
		}
		asyncEffect()
	}, [ country ] )

	const { data, loading, error } = useQuery( GQL_sparseProject, {
		variables: { iso3166: country, projectId: project.projectId },
		skip: !project?.projectId
	} )

	DEBUG && console.log( 'SparseProject', { country, project, countryCO2Total, loading, error, data } )

	const projectRows = data?.sparseProjects?.nodes ?? []
	const theProject = projectRows[ 0 ] ?? {}

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

	useEffect( () => {
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
				console.log( e )
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

	const co2 = co2FromVolume( theProject )
	co2.scope1 = co2.scope1.map( c => Math.round( c * 100 ) / 100 )
	co2.scope3 = co2.scope3.map( c => Math.round( c * 100 ) / 100 )

	const projectCO2 = ( co2.scope1?.[ 1 ] || 0 ) + co2.scope3?.[ 1 ]

	try {
		return (
			<>
				<Alert type="warning" message={ getText( 'sparse-data-warning' ) } showIcon={ true }/>
				<br/>
				<Row gutter={ [ 16, 16 ] }>
					<Col xs={ 24 } lg={ 12 } xl={ 8 }>
						{ getText( 'production' ) }: { theProject.volume } { theProject.unit } { theProject.fossilFuelType },
						emissions { projectCO2.toFixed( 2 ) } e9kgco2e
						<br/>
						{ getText( 'co2e_scope1' ) }: { JSON.stringify( co2.scope1 ) }
						<br/>
						{ getText( 'co2e_scope3' ) }: { JSON.stringify( co2.scope3 ) }
						<br/>
						{ getText( 'country_production' ) }: { JSON.stringify( countryCO2Total ) }
						<br/>
						{ getText( 'country_production' ) } %: { ( 100 * projectCO2 / countryCO2Total.total ).toFixed( 2 ) }
					</Col>

					<Col xs={ 24 } lg={ 12 } xl={ 8 } style={ { height: 400 } }>
						<BarStackChart
							data={ [
								{ label: 'LOW', scope1: co2.scope1[ 0 ], scope3: co2.scope3[ 0 ] },
								{ label: 'MID', scope1: co2.scope1[ 1 ], scope3: co2.scope3[ 1 ] },
								{ label: 'HIGH', scope1: co2.scope1[ 2 ], scope3: co2.scope3[ 2 ] },
							] }
							keys={ [ "scope3", "scope1" ] }
						/>
					</Col>

					<Col xs={ 24 } lg={ 12 } xl={ 8 }>
						<OpenCorporateCard reference={ theProject.ocOperatorId }/>
					</Col>

					<Col xs={ 24 } lg={ 12 } xl={ 8 }>
						<div><b>{ theProject.projectId } </b><a href={ theProject.linkUrl }><ExportOutlined/></a></div>
						{ description }
						{ localeDescription?.length > 0 &&
						<>
							<br/>
							<br/>
							<span dangerouslySetInnerHTML={ { __html: localeDescription } }/>
						</> }
					</Col>

				</Row>

				<style jsx>{ `
				` }
				</style>
			</> )
	} catch( e ) {
		return <Alert message={ e.message } type="error" showIcon/>
	}
}

export default SparseProject
