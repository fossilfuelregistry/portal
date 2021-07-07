import React, { useEffect, useMemo, useState } from "react"
import { useQuery } from "@apollo/client"
import GraphQLStatus from "components/GraphQLStatus"
import { GQL_dataQuery } from "queries/country"
import { Alert, notification } from "antd"
import useText from "lib/useText"
import { useDispatch, useSelector } from "react-redux"
import ForecastView from "./ForecastView"
import { useUnitConversionGraph } from "../viz/UnitConverter"

const DEBUG = false

function LoadData() {
	const dispatch = useDispatch()
	const { co2FromVolume } = useUnitConversionGraph()
	const { getText } = useText()
	const [ limits, set_limits ] = useState( {} )
	const [ grades, set_grades ] = useState( {} )
	const country = useSelector( redux => redux.country )
	const region = useSelector( redux => redux.region )
	const project = useSelector( redux => redux.project )
	const productionSourceId = useSelector( redux => redux.productionSourceId )
	const projectionSourceId = useSelector( redux => redux.projectionSourceId )
	const reservesSourceId = useSelector( redux => redux.reservesSourceId )
	const gwp = useSelector( redux => redux.gwp )

	const _co2 = dataset => {
		console.log( 'CALC CO2' )
		return ( dataset ?? [] ).map( datapoint => ( {
			...datapoint,
			co2: co2FromVolume( datapoint, datapoint.year === 2010 )
		} ) )
	}

	const queries = useMemo( () => {
		return GQL_dataQuery( {
			iso3166: country,
			iso31662: region,
			projectId: project,
			sourceId: reservesSourceId
		} )
	}, [ country, region, project, productionSourceId ] )

	const { data: productionData, loading: loadingProduction, error: errorLoadingProduction }
		= useQuery( queries.production, { skip: !productionSourceId } )
	const production = useMemo( () => _co2( productionData?.countryProductions?.nodes ),
		[ productionData?.countryProductions?.nodes, gwp ] )

	const { data: projectionData, loading: loadingProjection, error: errorLoadingProjection }
		= useQuery( queries.projection, { skip: !projectionSourceId } )
	const projection = useMemo( () => _co2( projectionData?.countryProductions?.nodes ),
		[ projectionData?.countryProductions?.nodes?.length, gwp ] )

	const { data: reservesData, loading: loadingReserves, error: errorLoadingReserves }
		= useQuery( queries.reserves, { skip: !reservesSourceId } )
	const reserves = useMemo( () => _co2( reservesData?.countryReserves?.nodes ),
		[ reservesData?.countryReserves?.nodes?.length, gwp ] )

	try {
		//updateReserves( dataset, production, projection )
	} catch( e ) {
		console.log( e )
		notification.warning( {
			message: "Error during future production vs reserves calculation",
			description: e.message
		} )
	}

	// Figure out available years when data loaded.

	useEffect( () => {
		DEBUG && console.log( 'useEffect Production.length', production?.length, { limits } )
		if( !production?.length > 0 ) return
		const newLimits = production.reduce( ( limits, datapoint ) => {
			limits.firstYear = ( limits.firstYear === undefined || datapoint.year < limits.firstYear ) ? datapoint.year : limits.firstYear
			limits.lastYear = ( limits.lastYear === undefined || datapoint.year > limits.lastYear ) ? datapoint.year : limits.lastYear
			return limits
		}, {} )

		set_limits( { ...limits, production: newLimits } )
	}, [ production?.length ] )

	useEffect( () => {
		DEBUG && console.log( 'useEffect projection.length', { limits } )
		if( !projection?.length > 0 ) return
		const newLimits = projection.reduce( ( limits, datapoint ) => {
			limits.firstYear = ( limits.firstYear === undefined || datapoint.year < limits.firstYear ) ? datapoint.year : limits.firstYear
			limits.lastYear = ( limits.lastYear === undefined || datapoint.year > limits.lastYear ) ? datapoint.year : limits.lastYear
			return limits
		}, {} )

		set_limits( { ...limits, projection: newLimits } )
	}, [ projection?.length ] )

	useEffect( () => {
		DEBUG && console.log( 'useEffect reserves.length', { limits } )
		if( !reserves?.length > 0 ) return
		const newLimits = reserves.reduce( ( limits, datapoint ) => {
			limits.firstYear = ( limits.firstYear === undefined || datapoint.year < limits.firstYear ) ? datapoint.year : limits.firstYear
			limits.lastYear = ( limits.lastYear === undefined || datapoint.year > limits.lastYear ) ? datapoint.year : limits.lastYear
			return limits
		}, {} )

		set_limits( { ...limits, reserves: newLimits } )
	}, [ reserves?.length ] )

	DEBUG && console.log( { limits, production } )

	// Figure out available grades when reserves loaded.

	useEffect( () => {
		DEBUG && console.log( 'useEffect Reserves', {} )
		if( !( reserves?.length > 0 ) ) return
		const _grades = reserves.reduce( ( g, r ) => {
			g[ r.grade ] = false
			return g
		}, {} )
		//console.log( _grades )
		set_grades( _grades )
	}, [ reserves?.length ] )

	if( loadingProduction || errorLoadingProduction )
		return <GraphQLStatus loading={ loadingProduction } error={ errorLoadingProduction }/>
	if( loadingProjection || errorLoadingProjection )
		return <GraphQLStatus loading={ loadingProjection } error={ errorLoadingProjection }/>
	if( loadingReserves || errorLoadingReserves )
		return <GraphQLStatus loading={ loadingReserves } error={ errorLoadingReserves }/>

	const { firstYear, lastYear } = limits.production ?? {}

	// Don't try to render a chart until all data looks good
	if( !firstYear || !lastYear || !production?.length > 0 )
		return <Alert message={ getText( 'make_selections' ) } type="info" showIcon/>

	DEBUG && console.log( 'CountryProduction', { firstYear, lastYear, grades } )

	return (
		<ForecastView
			production={ production }
			projection={ projection }
			reserves={ reserves }
			limits={ limits }
		/>
	)
}

export default LoadData
