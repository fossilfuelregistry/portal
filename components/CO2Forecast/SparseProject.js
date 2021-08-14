import React, { useEffect, useMemo, useState } from "react"
import { Alert, Col, Row } from "antd"
import ReactMarkdown from 'react-markdown'
import useText from "lib/useText"
import { useSelector } from "react-redux"
import { useQuery } from "@apollo/client"
import { GQL_sparseProject } from "queries/country"
import GraphQLStatus from "../GraphQLStatus"
import { useConversionHooks } from "components/viz/conversionHooks"
import OpenCorporateCard from "../OpenCorporateCard"

const DEBUG = true

function SparseProject() {
	const { getText } = useText()
	const { getCountryCurrentCO2 } = useConversionHooks()
	const country = useSelector( redux => redux.country )
	const project = useSelector( redux => redux.project )
	const [ countryCO2Total, set_countryCO2Total ] = useState( 0 )
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

	if( loading || error )
		return <GraphQLStatus loading={ loading } error={ error }/>

	const co2 = co2FromVolume( theProject )
	const projectCO2 = ( co2.scope1[ 1 ] || 0 ) + co2.scope3[ 1 ]

	try {
		return (
			<>
				<Alert type="warning" message={ getText( 'sparse-data-warning' ) } showIcon={ true }/>
				<br/>
				<Row gutter={ [ 16, 16 ] }>
					<Col xs={ 24 } lg={ 12 } xl={ 8 }>
						{ getText( 'production' ) }: { theProject.volume } { theProject.unit } { theProject.fossilFuelType }, emissions {projectCO2} e9kgco2e
						<br/>
						{ getText( 'co2e_scope1' ) }: { JSON.stringify( co2.scope1 ) }
						<br/>
						{ getText( 'co2e_scope3' ) }: { JSON.stringify( co2.scope3 ) }
						<br/>
						{ getText( 'country_production' ) }: { countryCO2Total.toFixed( 1 ) }
						<br/>
						{ getText( 'country_production' ) } %: { ( 100 * projectCO2 / countryCO2Total ).toFixed( 2 ) }
					</Col>

					<Col xs={ 24 } lg={ 12 } xl={ 8 }>
						<OpenCorporateCard reference={theProject.ocOperatorId}/>
					</Col>

					<Col xs={ 24 } lg={ 12 } xl={ 8 }>
						<h2>{ theProject.projectId }</h2>
						<ReactMarkdown>{ description }</ReactMarkdown>
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
