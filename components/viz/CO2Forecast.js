import React, { useEffect, useMemo, useState } from "react"
import { useQuery } from "@apollo/client"
import GraphQLStatus from "components/GraphQLStatus"
import { GQL_countryProductionByIso, GQL_countryReservesByIso } from "queries/country"
import { Alert, Button, Col, notification, Row } from "antd"
import CsvDownloader from 'react-csv-downloader'
import { GQL_sources } from "queries/general"
import useCalculations from "./util"
import CO2ForecastGraph from "./CO2ForecastGraph"
import useText from "lib/useText"
import InputDataGraph from "./InputDataGraph"
import InputSummary from "./InputSummary"
import FutureSummary from "./FutureSummary"
import { useDispatch, useSelector } from "react-redux"

const DEBUG = false

function CO2Forecast( {
	country, source, grades, onGrades, onSources, projection, estimate, estimate_prod
} ) {
	const dispatch = useDispatch()
	const { getText } = useText()
	const [ limits, set_limits ] = useState()
	const { filteredCombinedDataSet, updateReserves } = useCalculations()
	const gwp = useSelector( redux => redux.gwp )

	const { data: sourcesData, loading: loadingSources, error: errorLoadingSources }
		= useQuery( GQL_sources )
	const allSources = sourcesData?.sources?.nodes ?? []

	useEffect( () => {
		if( allSources.length > 0 )
			dispatch( { type: 'ALLSOURCES', payload: allSources } )
	}, [ allSources ] )

	const { data: productionData, loading: loadingProduction, error: errorLoadingProduction }
		= useQuery( GQL_countryProductionByIso, { variables: { iso3166: country }, skip: !country } )
	const production = productionData?.countryProductions?.nodes ?? []


	const { data: reservesData, loading: loadingReserves, error: errorLoadingReserves }
		= useQuery( GQL_countryReservesByIso, { variables: { iso3166: country }, skip: !country } )
	const reserves = reservesData?.countryReserves?.nodes ?? []

	const sourceId = source?.sourceId

	const dataset = useMemo( () => {
		try {
			return filteredCombinedDataSet( production, reserves, [ 'oil', 'gas' ], sourceId, estimate, estimate_prod )
		} catch( e ) {
			console.log( e )
			notification.warning( {
				message: "Error during data extraction",
				description: e.message
			} )
		}
	}, [ production, reserves, projection, source, grades, estimate, estimate_prod, gwp ] )

	try {
		updateReserves( dataset, production, projection )
	} catch( e ) {
		console.log( e )
		notification.warning( {
			message: "Error during future production vs reserves calculation",
			description: e.message
		} )
	}

	const co2 = dataset?.co2 ?? []

	useEffect( () => {
		if( !dataset ) return
		dispatch( { type: 'BESTRESERVESSOURCEID', payload: dataset.bestReservesSourceId } )
		dispatch( { type: 'LASTYEAROFBESTRESERVE', payload: dataset.lastYearOfBestReserve } )
	}, [ dataset?.bestReservesSourceId, dataset?.lastYearOfBestReserve ] )

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
		//console.log( _grades )
		onGrades && onGrades( _grades )
	}, [ reserves?.length ] )

	if( loadingSources || errorLoadingSources )
		return <GraphQLStatus loading={ loadingSources } error={ errorLoadingSources }/>
	if( loadingProduction || errorLoadingProduction )
		return <GraphQLStatus loading={ loadingProduction } error={ errorLoadingProduction }/>
	if( loadingReserves || errorLoadingReserves )
		return <GraphQLStatus loading={ loadingReserves } error={ errorLoadingReserves }/>

	const { firstYear, lastYear } = limits ?? {}

	DEBUG && console.log( 'CountryProduction', { oil: co2 } )

	// Don't try to render a chart until all data looks good
	if( !firstYear || !lastYear || !co2?.length > 0 )
		return <Alert message={ getText( 'make_selections' ) } type="info" showIcon/>

	DEBUG && console.log( 'CountryProduction', { firstYear, lastYear, grades, source } )

	return (
		<>
			<Row gutter={ [ 16, 16 ] }>
				<Col xs={ 24 } lg={ 14 } xxl={ 18 }>
					<CO2ForecastGraph
						data={ co2 }
						projection={ projection }
						estimate={ estimate }
						cGrade={ dataset.cGrade }
						pGrade={ dataset.pGrade }
						estimate_prod={ estimate_prod }
					/>
				</Col>
				<Col xs={ 24 } lg={ 10 } xxl={ 6 }>
					<Row gutter={ [ 16, 16 ] }>

						<Col xs={ 24 } xl={ 24 }>
							<FutureSummary data={ co2 }/>
						</Col>

						<Col xs={ 24 } xl={ 24 }>
							<InputSummary data={ co2 }/>
						</Col>

					</Row>
				</Col>
			</Row>

			<Row gutter={ [ 16, 16 ] }>
				<Col xs={ 24 } md={ 12 } xxl={ 6 }>
					<div className="graph-wrap">
						<h4>{ getText( 'gas' ) + ' ' + getText( 'production' ) } e9m3</h4>
						<InputDataGraph
							data={ production } allSources={ allSources } fuel="gas" comment="PROD"
							estimate={ estimate_prod }
						/>
						<CsvDownloader datas={production} filename={'gas_production_' + country}>
							<Button className="download" block>{ getText( 'download' ) }</Button>
						</CsvDownloader>
					</div>
				</Col>
				<Col xs={ 24 } md={ 12 } xxl={ 6 }>
					<div className="graph-wrap">
						<h4>{ getText( 'gas' ) + ' ' + getText( 'reserves' ) } e9m3</h4>
						<InputDataGraph
							data={ reserves } allSources={ allSources } fuel="gas" comment="RES"
							estimate={ estimate }
						/>
						<CsvDownloader datas={reserves} filename={'gas_reserves_' + country}>
							<Button className="download" block>{ getText( 'download' ) }</Button>
						</CsvDownloader>
					</div>
				</Col>
				<Col xs={ 24 } md={ 12 } xxl={ 6 }>
					<div className="graph-wrap">
						<h4>{ getText( 'oil' ) + ' ' + getText( 'production' ) } e6bbl</h4>
						<InputDataGraph
							data={ production } allSources={ allSources } fuel="oil" comment="PROD"
							estimate={ estimate_prod }
						/>
						<CsvDownloader datas={production} filename={'oil_production_' + country}>
							<Button className="download" block>{ getText( 'download' ) }</Button>
						</CsvDownloader>
					</div>
				</Col>
				<Col xs={ 24 } md={ 12 } xxl={ 6 }>
					<div className="graph-wrap">
						<h4>{ getText( 'oil' ) + ' ' + getText( 'reserves' ) } e6bbl</h4>
						<InputDataGraph
							data={ reserves } allSources={ allSources } fuel="oil" comment="RES"
							estimate={ estimate }
						/>
						<CsvDownloader datas={reserves} filename={'oil_reserves_' + country}>
							<Button className="download" block>{ getText( 'download' ) }</Button>
						</CsvDownloader>
					</div>
				</Col>
			</Row>

			<style jsx>{ `
              .graph-wrap {
                background-color: #eeeeee;
                padding: 16px;
                border-radius: 8px;
              }

              .graph-wrap :global(.download) {
                margin-top: 12px;
              }
			` }
			</style>
		</> )
}

export default CO2Forecast
