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
import CountryProductionPieChart from "./CountryProductionPieChart"
import HelpModal from "../HelpModal"
import LeafletNoSSR from "../geo/LeafletNoSSR"

const DEBUG = false

function SparseProject( { borders } ) {
	const { getText } = useText()
	const router = useRouter()
	const { getCountryCurrentCO2 } = useConversionHooks()
	const country = useSelector( redux => redux.country )
	const project = useSelector( redux => redux.project )
	const [ countryCO2Total, set_countryCO2Total ] = useState( 0 )
	const [ localeDescription, set_localeDescription ] = useState()
	const { co2FromVolume, convertVolume } = useConversionHooks()

	DEBUG && console.log( 'SparseProject', { country, project, countryCO2Total } )

	useEffect( () => {
		const asyncEffect = async() => {
			const ct = await getCountryCurrentCO2( country )
			set_countryCO2Total( ct )
		}
		asyncEffect()
	}, [ country ] )

	const { data, loading, error } = useQuery( GQL_sparseProject, {
		variables: { iso3166: country, projectId: project?.projectId },
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

	const co2 = useMemo( () => {
		const points = theProject?.sparseDataPoints?.nodes ?? []
		if( !points.length ) return 0

		const lastYearProd = points.filter( p => p.dataType === 'PRODUCTION' ).reduce( ( last, point ) => {
			if( point.year > last.year )
				return point
			else
				return last
		}, { year: 0 } )

		const co2 = co2FromVolume( { ...lastYearProd, methaneM3Ton: theProject.methaneM3Ton } )
		co2.megatons = convertVolume( lastYearProd, 'e9ton' )
		co2.scope1 = co2.scope1?.map( c => Math.round( c * 100 ) / 100 )
		co2.scope3 = co2.scope3?.map( c => Math.round( c * 100 ) / 100 )
		DEBUG && console.log( { theProject, points, lastYearProd, co2 } )
		return co2
	}, [ theProject?.projectId ] )

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

	try {
		return (
			<>
				<Alert type="warning" message={ getText( 'sparse-data-warning' ) } showIcon={ true }/>
				<br/>
				<Row gutter={ [ 16, 16 ] }>

					<Col xs={ 24 } xxl={ 12 }/>

					<Col xs={ 24 }>
						<CountryProductionPieChart
							project={ theProject }
							emissions={ countryCO2Total }
							produtionMegatons={co2.megatons}
							co2={ ( co2.scope1?.[ 1 ] || 0 ) + co2.scope3?.[ 1 ] }
						/>
					</Col>

					<Col xs={ 24 } xl={ 12 }>
						<LeafletNoSSR
							className="country-geo"
							outlineGeometry={ borders }
							projects={ [ theProject.geoPosition ] }
						/>
					</Col>

					<Col xs={ 24 } xl={ 12 }>
						<div className="co2-card">
							<div className="header">
								{ getText( 'emissions' ) } - { getText( 'project' ) }
								<HelpModal title="ranges" content="explanation_ranges"/>
							</div>
							<div className="box">
								<div style={ { height: 400 } }>
									<BarStackChart
										data={ [
											{
												label: getText( 'range-low' ).toUpperCase(),
												scope1: co2.scope1?.[ 0 ],
												scope3: co2.scope3?.[ 0 ]
											},
											{
												label: getText( 'range-mid' ).toUpperCase(),
												scope1: co2.scope1?.[ 1 ],
												scope3: co2.scope3?.[ 1 ]
											},
											{
												label: getText( 'range-high' ).toUpperCase(),
												scope1: co2.scope1?.[ 2 ],
												scope3: co2.scope3?.[ 2 ]
											},
										] }
										keys={ [ "scope3", "scope1" ] }
									/>
								</div>
							</div>
						</div>
					</Col>

					<Col xs={ 24 } xl={ 12 }>
						<OpenCorporateCard reference={ theProject.ocOperatorId }/>
					</Col>

					<Col xs={ 24 } xl={ 12 }>
						<div className="co2-card">
							<div className="header">&nbsp;</div>
							<div className="box">
								<div>
									<b>{ theProject.projectId } </b>
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
		console.log( e )
		return <Alert message={ e.message } type="error" showIcon/>
	}
}

export default SparseProject
