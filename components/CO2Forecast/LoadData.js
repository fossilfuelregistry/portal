import React, { useEffect, useMemo, useState } from "react"
import { useQuery } from "@apollo/client"
import GraphQLStatus from "components/GraphQLStatus"
import { GQL_countryProductionByIso, GQL_countryReservesByIso } from "queries/country"
import { Alert, notification } from "antd"
import useText from "lib/useText"
import { useDispatch, useSelector } from "react-redux"
import ForecastView from "./ForecastView"

const DEBUG = false

function LoadData( {
	source, grades, onGrades, onSources, projection, estimate, estimate_prod
} ) {
	const dispatch = useDispatch()
	const { getText } = useText()
	const [ limits, set_limits ] = useState()
	const country = useSelector( redux => redux.country )
	const allSources = useSelector( redux => redux.allSources )
	const gwp = useSelector( redux => redux.gwp )

	const { data: productionData, loading: loadingProduction, error: errorLoadingProduction }
		= useQuery( GQL_countryProductionByIso, { variables: { iso3166: country }, skip: !country } )
	const production = productionData?.countryProductions?.nodes ?? []

	const { data: reservesData, loading: loadingReserves, error: errorLoadingReserves }
		= useQuery( GQL_countryReservesByIso, { variables: { iso3166: country }, skip: !country } )
	const reserves = reservesData?.countryReserves?.nodes ?? []

	const sourceId = source?.sourceId

	const dataset = useMemo( () => {
		if( !production?.length ) return []
		if( !reserves?.length ) return []
		if( !source ) return []

		DEBUG && console.log( { production, reserves, projection, source, grades, estimate, estimate_prod, gwp } )


	}, [ production, reserves, projection, source, grades, estimate, estimate_prod, gwp ] )

	try {
		//updateReserves( dataset, production, projection )
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
		<ForecastView
			dataset={dataset}
		/>
	)
}

export default LoadData
