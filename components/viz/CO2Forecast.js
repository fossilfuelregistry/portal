import React, { useContext, useEffect, useMemo, useState } from "react"
import { useQuery } from "@apollo/client"
import GraphQLStatus from "components/GraphQLStatus"
import { GQL_countryProductionByIso, GQL_countryReservesByIso } from "queries/country"
import { Alert, Col, notification, Row } from "antd"
import { useUnitConversionGraph } from "./UnitConverter"
import { GQL_sources } from "queries/general"
import useCalculations from "./util"
import CO2ForecastGraph from "./CO2ForecastGraph"
import useText from "lib/useText"
import InputDataGraph from "./InputDataGraph"
import InputSummary from "./InputSummary"
import FutureSummary from "./FutureSummary"
import { StoreContext } from "lib/zustandProvider"

const DEBUG = false

function CO2Forecast( {
	country, source, grades, onGrades, onSources, projection, estimate, estimate_prod
} ) {
	const store = useContext( StoreContext )
	const { co2FromVolume, setGWP } = useUnitConversionGraph()
	const { getText } = useText()
	const [ limits, set_limits ] = useState()
	const [ gwp, set_gwp ] = useState()
	const { filteredCombinedDataSet } = useCalculations()

	const { data: sourcesData, loading: loadingSources, error: errorLoadingSources }
		= useQuery( GQL_sources )
	const allSources = sourcesData?.sources?.nodes ?? []
	store.setState( { allSources } )


	const { data: productionData, loading: loadingProduction, error: errorLoadingProduction }
		= useQuery( GQL_countryProductionByIso,
			{ variables: { iso3166: country }, skip: !country } )
	const production = productionData?.countryProductions?.nodes ?? []


	const { data: reservesData, loading: loadingReserves, error: errorLoadingReserves }
		= useQuery( GQL_countryReservesByIso,
			{ variables: { iso3166: country }, skip: !country } )
	const reserves = reservesData?.countryReserves?.nodes ?? []


	const sourceId = source?.sourceId
	console.log( { limits, source } )

	const co2 = useMemo( () => {
		setGWP( gwp )
		let co2 = []
		try {
			co2 = filteredCombinedDataSet( production, reserves, [ 'oil', 'gas' ],
				sourceId, grades, allSources.find( s => s.sourceId === projection ),
				projection, estimate, estimate_prod,
				co2FromVolume )
		} catch( e ) {
			console.log( e )
			notification.warning( {
				message: "Error during data extraction",
				description: <pre>{e.message}<br/>{e.stack}</pre>
			} )
		}
		return co2
	}, [ production, reserves, projection, source, grades, estimate, estimate_prod, gwp ] )

	// Figure out available years and sources when production loaded.

	useEffect( () => {
		DEBUG && console.log( 'useEffect Production.length', { allSources } )
		if( !( production?.length > 0 ) || !( allSources?.length > 0 ) ) return
		const newLimits = production.reduce( ( limits, dbRow ) => {
			limits.firstYear = ( limits.firstYear === undefined || dbRow.year < limits.firstYear ) ? dbRow.year : limits.firstYear
			limits.lastYear = ( limits.lastYear === undefined || dbRow.year > limits.lastYear ) ? dbRow.year : limits.lastYear
			if( dbRow.projection )
				limits.futureSources[ dbRow.sourceId ] = allSources.find( s => s.sourceId === dbRow.sourceId )
			else
				limits.productionSources[ dbRow.sourceId ] = allSources.find( s => s.sourceId === dbRow.sourceId )
			return limits
		}, { futureSources: [], productionSources: [] } )

		DEBUG && console.log( { newLimits } )
		set_limits( newLimits )
		onSources && onSources( newLimits )
	}, [ production?.length ] )

	// Figure out available grades when reserves loaded.

	useEffect( () => {
		DEBUG && console.log( 'useEffect Reserves', { allSources } )
		if( !( reserves?.length > 0 ) ) return
		const _grades = reserves.reduce( ( g, r ) => {
			g[ r.grade ] = false
			return g
		}, {} )
		console.log( _grades )
		onGrades && onGrades( _grades )
	}, [ reserves?.length ] )

	if( loadingSources || errorLoadingSources )
		return <GraphQLStatus loading={loadingSources} error={errorLoadingSources}/>
	if( loadingProduction || errorLoadingProduction )
		return <GraphQLStatus loading={loadingProduction} error={errorLoadingProduction}/>
	if( loadingReserves || errorLoadingReserves )
		return <GraphQLStatus loading={loadingReserves} error={errorLoadingReserves}/>

	const { firstYear, lastYear } = limits ?? {}

	DEBUG && console.log( 'CountryProduction', { oil: co2 } )

	// Don't try to render a chart until all data looks good
	if( !firstYear || !lastYear || !co2?.length > 0 )
		return <Alert message={getText( 'make_selections' )} type="info" showIcon/>

	DEBUG && console.log( 'CountryProduction', { firstYear, lastYear, grades, source } )

	return (
		<>
			<Row gutter={[ 16, 16 ]}>
				<Col xs={24} xl={18}>
					<CO2ForecastGraph
						data={co2} projection={projection} estimate={estimate}
						estimate_prod={estimate_prod} gwp={gwp}
					/>
				</Col>
				<Col xs={24} xl={6}>
					<Row gutter={[ 16, 16 ]}>

						<Col xs={24} md={12} xl={24}>
							<FutureSummary data={co2} gwp={gwp} set_gwp={set_gwp}/>
						</Col>

						<Col xs={24} md={12} xl={24}>
							<InputSummary data={co2}/>
						</Col>

					</Row>
				</Col>
			</Row>

			<Row gutter={[ 16, 16 ]}>
				<Col xs={24} md={12} xxl={6}>
					<div className="graph-wrap">
						<h4>{getText( 'gas' ) + ' ' + getText( 'production' )} e9m3</h4>
						<InputDataGraph
							data={production} allSources={allSources} fuel="gas" comment="PROD"
							estimate={estimate_prod}
						/>
					</div>
				</Col>
				<Col xs={24} md={12} xxl={6}>
					<div className="graph-wrap">
						<h4>{getText( 'gas' ) + ' ' + getText( 'reserves' )} e9m3</h4>
						<InputDataGraph
							data={reserves} allSources={allSources} fuel="gas" comment="RES"
							estimate={estimate}
						/>
					</div>
				</Col>
				<Col xs={24} md={12} xxl={6}>
					<div className="graph-wrap">
						<h4>{getText( 'oil' ) + ' ' + getText( 'production' )} e6bbl</h4>
						<InputDataGraph
							data={production} allSources={allSources} fuel="oil" comment="PROD"
							estimate={estimate_prod}
						/>
					</div>
				</Col>
				<Col xs={24} md={12} xxl={6}>
					<div className="graph-wrap">
						<h4>{getText( 'oil' ) + ' ' + getText( 'reserves' )} e6bbl</h4>
						<InputDataGraph
							data={reserves} allSources={allSources} fuel="oil" comment="RES"
							estimate={estimate}
						/>
					</div>
				</Col>
			</Row>

			<style jsx>{`
              .graph-wrap {
                background-color: #eeeeee;
                padding: 16px;
                border-radius: 8px;
              }
			`}
			</style>
		</> )
}

export default CO2Forecast
