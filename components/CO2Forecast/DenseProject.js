import React, { useEffect, useMemo } from "react"
import { Alert, Button, Col, Divider, Row } from "antd"
import useText from "lib/useText"
import { useSelector } from "react-redux"
import { useQuery } from "@apollo/client"
import { GQL_project } from "queries/country"
import GraphQLStatus from "../GraphQLStatus"
import { useConversionHooks } from "components/viz/conversionHooks"
import CountryProductionPieChart from "./CountryProductionPieChart"
import LeafletNoSSR from "../geo/LeafletNoSSR"
import Sources from "./Sources"
import LoadProjectData from "./LoadProjectData"
import getConfig from "next/config"

const DEBUG = false

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

function DenseProject( { countryCurrentProduction, borders, productionSources, projectionSources, reservesSources } ) {
	const { getText } = useText()
	const country = useSelector( redux => redux.country )
	const project = useSelector( redux => redux.project )
	const { projectCO2, goToCountryOverview } = useConversionHooks()
	const productionSourceId = useSelector( redux => redux.productionSourceId )

	DEBUG && console.log( 'DenseProject', { country, project, countryCurrentProduction } )

	const { data, loading, error } = useQuery( GQL_project, {
		variables: { id: project?.id },
		skip: !( project?.id > 0 )
	} )

	DEBUG && console.log( 'DenseProject', { country, project, loading, error, data } )

	const theProject = data?.project ?? {}

	const production = useMemo( () => {
		if( !theProject?.id ) return {}
		const co2 = projectCO2( theProject )
		DEBUG && console.log( 'DenseProject projectCO2', { theProject, co2 } )
		return co2
	}, [ theProject?.id ] )

	useEffect( () => {
		const asyncEffect = async() => {
		}

		asyncEffect()
	}, [] )

	if( loading || error )
		return <GraphQLStatus loading={ loading } error={ error }/>

	try {
		return (
			<>
				<Button
					block
					style={ { marginTop: 34, marginBottom: 16, borderColor: theme[ '@primary-color' ], color: theme[ '@primary-color' ] } }
					onClick={ goToCountryOverview }
				>
					{ getText( 'back_to_country_overview' ) }
				</Button>

				<Divider><h4>{ getText( 'project_overview' ) } - { project.projectIdentifier }</h4></Divider>

				<Row gutter={ [ 32, 32 ] } style={ { marginBottom: 26 } }>
					<Col xs={ 24 } xxl={ 12 }>
						<CountryProductionPieChart
							project={ project }
							currentProduction={ countryCurrentProduction }
							production={ production }
						/>
					</Col>

					<Col xs={ 24 } xxl={ 12 }>
						<div className="geo-wrap">
							<LeafletNoSSR
								className="country-geo"
								outlineGeometry={ borders }
								projects={ [ theProject ] }
								fitToProjects={ true }
							/>
						</div>
					</Col>
				</Row>

				<Divider style={ { marginTop: 48 } }><h4>{ getText( 'co2_forecast' ) }</h4></Divider>

				{ productionSourceId > 0 && <LoadProjectData/> }

				<Sources
					production={ productionSources }
					reserves={ reservesSources }
					projection={ projectionSources }
				/>

				<style jsx>{ `
				` }
				</style>
			</> )
	} catch( e ) {
		console.log( e )
		return <Alert message={ e.message } type="error" showIcon/>
	}
}

export default DenseProject
