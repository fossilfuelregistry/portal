import React, { useEffect, useMemo, useState } from "react"
import { useQuery } from "@apollo/client"
import GraphQLStatus from "components/GraphQLStatus"
import { GQL_countryProductionByIso, GQL_countryReservesByIso } from "queries/country"
import { Alert, notification } from "antd"
import { useUnitConversionGraph } from "./UnitConverter"
import { GQL_sources } from "queries/general"
import { dataSetEstimateFutures, filteredCombinedDataSet } from "./util"
import CO2ForecastGraph from "./CO2ForecastGraph"
import useText from "lib/useText"

const DEBUG = false


function CO2Forecast( {
	country, sources, grades, onGrades, onSources, projection, estimate, estimate_prod
} ) {
	const { co2FromVolume } = useUnitConversionGraph( estimate )
	const { getText } = useText()
	const [ limits, set_limits ] = useState()

	const { data: sourcesData, loading: loadingSources, error: errorLoadingSources }
		= useQuery( GQL_sources )

	const allSources = sourcesData?.sources?.nodes ?? []

	const { data: productionData, loading: loadingProduction, error: errorLoadingProduction }
		= useQuery( GQL_countryProductionByIso,
			{ variables: { iso3166: country }, skip: !country } )

	const production = productionData?.countryProductions?.nodes ?? []

	const { data: reservesData, loading: loadingReserves, error: errorLoadingReserves }
		= useQuery( GQL_countryReservesByIso,
			{ variables: { iso3166: country }, skip: !country } )

	const reserves = reservesData?.countryReserves?.nodes ?? []

	const sourceIds = sources.map( s => s?.sourceId )
	const co2 = useMemo( () => {
		let co2 = []
		try {
			co2 = filteredCombinedDataSet( production, reserves, [ 'oil', 'gas' ], sourceIds, grades, null, co2FromVolume )
		} catch( e ) {
			console.log( e )
			notification.warning( {
				message: "Error during data extraction",
				description: <pre>{e.message}<br/>{e.stack}</pre>
			} )
		}
		return co2
	}, [ production, reserves, sources, grades ] )

	useEffect( () => {
		DEBUG && console.log( 'useEffect Production.length', { allSources } )
		if( !( production?.length > 0 ) || !( allSources?.length > 0 ) ) return
		const newLimits = production.reduce( ( limits, r ) => {
			limits.firstYear = ( limits.firstYear === undefined || r.year < limits.firstYear ) ? r.year : limits.firstYear
			limits.lastYear = ( limits.lastYear === undefined || r.year > limits.lastYear ) ? r.year : limits.lastYear
			limits.grades = Object.assign( { [ r.grade ]: false }, limits.grades ?? {} )
			limits.sources[ r.sourceId ] = allSources.find( s => s.sourceId === r.sourceId )
			return limits
		}, { sources: [] } )

		DEBUG && console.log( { newLimits } )
		set_limits( newLimits )
		onGrades && onGrades( newLimits.grades )
		onSources && onSources( newLimits.sources )
	}, [ production.length ] )

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

	DEBUG && console.log( 'CountryProduction', { firstYear, lastYear, grades, sources } )

	dataSetEstimateFutures( co2, estimate, estimate_prod )

	return <CO2ForecastGraph data={co2} projection={projection} estimate={estimate} estimate_prod={estimate_prod}/>
}

export default CO2Forecast
