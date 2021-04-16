import React, { useEffect, useState } from "react"
import { useQuery } from "@apollo/client"
import GraphQLStatus from "components/GraphQLStatus"
import { GQL_countryProductionByIso } from "queries/country"
import { Alert, notification } from "antd"
import { textsSelector, useStore } from "lib/zustandProvider"
import { useUnitConversionGraph } from "./UnitConverter"
import { GQL_sources } from "queries/general"
import { filteredCombinedDataSet } from "./util"
import CO2ForecastGraph from "./CO2ForecastGraph"

const DEBUG = false


function CO2Forecast( {
	country, sources, grades, onGrades, onSources
} ) {
	const { co2FromVolume } = useUnitConversionGraph()
	const texts = useStore( textsSelector )
	const [ limits, set_limits ] = useState()

	const { data: sourcesData, loading: loadingSources, error: errorLoadingSources }
		= useQuery( GQL_sources )

	const allSources = sourcesData?.sources?.nodes ?? []

	const { data: productionData, loading: loadingProduction, error: errorLoadingProduction }
		= useQuery( GQL_countryProductionByIso,
			{ variables: { iso3166: country }, skip: !country } )

	const production = productionData?.countryProductions?.nodes ?? []

	let co2
	const sourceIds = sources.map( s => s?.sourceId )
	try {
		co2 = filteredCombinedDataSet( production, [ 'oil', 'gas' ], sourceIds, grades, null, co2FromVolume )
	} catch( e ) {
		notification.warning( {
			message: "Error during data extraction",
			description: <pre>{e.message}<br/>{e.stack}</pre>
		} )
	}

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

	const { firstYear, lastYear } = limits ?? {}

	DEBUG && console.log( 'CountryProduction', { oil: co2 } )

	// Don't try to render a chart until all data looks good
	if( !firstYear || !lastYear || !co2?.length > 0 )
		return <Alert message={texts?.make_selections} type="info" showIcon/>

	DEBUG && console.log( 'CountryProduction', { firstYear, lastYear, grades, sources } )

	return <CO2ForecastGraph data={co2}/>
}

export default CO2Forecast
