import React, { useEffect, useMemo, useState } from "react"
import { useQuery } from "@apollo/client"
import GraphQLStatus from "components/GraphQLStatus"
import { GQL_dataQuery } from "queries/country"
import { Alert } from "antd"
import useText from "lib/useText"
import { useDispatch, useSelector } from "react-redux"
import ForecastView from "./ForecastView"
import { useConversionHooks } from "../viz/conversionHooks"
import settings from "settings"

const DEBUG = true

function LoadData() {
	const dispatch = useDispatch()
	const { co2FromVolume, reservesProduction } = useConversionHooks()
	const { getText } = useText()
	const [ limits, set_limits ] = useState( {} )
	const [ grades, set_grades ] = useState( {} )
	const country = useSelector( redux => redux.country )
	const region = useSelector( redux => redux.region )
	const project = useSelector( redux => redux.project )
	const productionSourceId = useSelector( redux => redux.productionSourceId )
	const projectionSourceId = useSelector( redux => redux.projectionSourceId )
	const reservesSourceId = useSelector( redux => redux.reservesSourceId )
	const stableProduction = useSelector( redux => redux.stableProduction )
	const gwp = useSelector( redux => redux.gwp )

	const _co2 = dataset => {
		return ( dataset ?? [] )
			.filter( datapoint => datapoint.fossilFuelType === 'gas' || datapoint.fossilFuelType === 'oil' )
			.map( datapoint => {
				let _d = { ...datapoint }
				delete _d.id
				delete _d.__typename
				_d.co2 = co2FromVolume( datapoint )
				return _d
			} )
	}

	const queries = useMemo( () => {
		return GQL_dataQuery( {
			iso3166: country,
			iso31662: region,
			projectId: project?.projectId
		} )
	}, [ country, region, project?.projectId ] )

	const { data: productionData, loading: loadingProduction, error: errorLoadingProduction }
		= useQuery( queries.production, { skip: !productionSourceId } )

	DEBUG && console.log( 'LoadData', { productionData } )

	const production = useMemo( () => {
		DEBUG && console.log( '_co2( productionData )', productionData?.countryProductions?.nodes )
		return _co2( productionData?.countryProductions?.nodes )
	}, [ productionData?.countryProductions?.nodes, productionData?.countryProductions?.nodes?.length, productionSourceId, gwp ] )

	const { data: projectionData, loading: loadingProjection, error: errorLoadingProjection }
		= useQuery( queries.projection, { skip: !projectionSourceId } )

	const projection = useMemo( () => {

		// Synthesize stable projection data points if selected
		if( projectionSourceId === settings.stableProductionSourceId ) {
			if( !stableProduction?.oil ) return []

			let stableProj = []
			for( let year = 2020; year <= settings.year.end; year++ ) {
				stableProj.push( { ...stableProduction.oil, year, sourceId: settings.stableProductionSourceId } )
				stableProj.push( { ...stableProduction.gas, year, sourceId: settings.stableProductionSourceId } )
			}
			DEBUG && console.log( { stableProj } )
			return stableProj
		} else
			return _co2( projectionData?.countryProductions?.nodes )
	}, [ projectionData?.countryProductions?.nodes, projectionSourceId, stableProduction, gwp ] )

	const { data: reservesData, loading: loadingReserves, error: errorLoadingReserves }
		= useQuery( queries.reserves, { skip: !productionSourceId } )
	const reserves = useMemo( () => _co2( reservesData?.countryReserves?.nodes ),
		[ reservesData?.countryReserves?.nodes, gwp ] )

	// Find stable production
	useEffect( () => {
		const reverse = [ ...production ].reverse()
		const oil = reverse.find( d => d.fossilFuelType === 'oil' )
		const gas = reverse.find( d => d.fossilFuelType === 'gas' )
		dispatch( { type: 'STABLEPRODUCTION', payload: { oil, gas } } )
	}, [ production, productionSourceId, gwp ] )

	// Figure out available years when data loaded.

	useEffect( () => {
		DEBUG && console.log( 'useEffect Production', production?.length, limits )
		if( !production?.length > 0 ) return
		const newLimits = production.reduce( ( _limits, datapoint ) => {
			if( datapoint.sourceId !== productionSourceId ) return _limits
			const l = _limits[ datapoint.fossilFuelType ]
			l.firstYear = Math.min( l.firstYear, datapoint.year )
			l.lastYear = Math.max( l.lastYear, datapoint.year )
			return _limits
		}, { oil: { firstYear: settings.year.end, lastYear: 0 }, gas: { firstYear: settings.year.end, lastYear: 0 } } )

		set_limits( l => ( { ...l, production: newLimits } ) )
		DEBUG && console.log( 'useEffect Production', { newLimits } )
	}, [ production, productionSourceId ] )

	useEffect( () => {
		DEBUG && console.log( 'useEffect projection', { projection, limits } )
		if( !projection?.length > 0 ) return

		let newLimits

		if( projectionSourceId === settings.stableProductionSourceId ) {
			newLimits = {
				oil: { firstYear: new Date().getFullYear() - 1, lastYear: settings.year.end },
				gas: { firstYear: new Date().getFullYear() - 1, lastYear: settings.year.end }
			}
		} else {
			newLimits = projection.reduce( ( _limits, datapoint ) => {
				if( datapoint.sourceId !== projectionSourceId ) return _limits
				const l = _limits[ datapoint.fossilFuelType ]
				l.firstYear = Math.min( l.firstYear, datapoint.year )
				l.lastYear = Math.max( l.lastYear, datapoint.year )
				return _limits
			}, {
				oil: { firstYear: settings.year.end, lastYear: 0 },
				gas: { firstYear: settings.year.end, lastYear: 0 }
			} )
		}

		set_limits( l => ( { ...l, projection: newLimits } ) )
	}, [ projection, projectionSourceId ] )

	useEffect( () => {
		DEBUG && console.log( 'useEffect reserves', { limits } )
		if( !reserves?.length > 0 ) return
		const newLimits = reserves.reduce( ( _limits, datapoint ) => {
			_limits.firstYear = ( _limits.firstYear === undefined || datapoint.year < _limits.firstYear ) ? datapoint.year : _limits.firstYear
			_limits.lastYear = ( _limits.lastYear === undefined || datapoint.year > _limits.lastYear ) ? datapoint.year : _limits.lastYear
			return _limits
		}, {} )

		set_limits( l => ( { ...l, reserves: newLimits } ) )
	}, [ reserves ] )

	DEBUG && console.log( { limits, production, projection } )

	// Figure out available grades when reserves loaded.

	useEffect( () => {
		DEBUG && console.log( 'useEffect Reserve Grades', { reserves, reservesSourceId } )
		if( !( reserves?.length > 0 ) ) return
		const _grades = reserves
			.filter( r => r.sourceId === reservesSourceId )
			.reduce( ( g, r ) => {
				g[ r.grade ] = false
				return g
			}, {} )
		//console.log( _grades )
		set_grades( _grades )
	}, [ reserves?.length, reservesSourceId ] )

	// Match projected production with reserves.

	const projectedProduction = useMemo( () => {
		return reservesProduction( projection, reserves, projectionSourceId, reservesSourceId, limits, grades )
	}, [ projection, reserves, projectionSourceId, reservesSourceId, limits, grades ] )

	if( loadingProduction || errorLoadingProduction )
		return <GraphQLStatus loading={ loadingProduction } error={ errorLoadingProduction }/>
	if( loadingProjection || errorLoadingProjection )
		return <GraphQLStatus loading={ loadingProjection } error={ errorLoadingProjection }/>
	if( loadingReserves || errorLoadingReserves )
		return <GraphQLStatus loading={ loadingReserves } error={ errorLoadingReserves }/>

	// Don't try to render a chart until all data looks good
	if( ( !limits.production?.oil?.lastYear && !limits.production?.gas?.lastYear ) || !production?.length > 0 )
		return <Alert message={ getText( 'make_selections' ) } type="info" showIcon/>

	return (
		<ForecastView
			production={ production }
			projection={ projection }
			reserves={ reserves }
			projectedProduction={ projectedProduction }
		/>
	)
}

export default LoadData
