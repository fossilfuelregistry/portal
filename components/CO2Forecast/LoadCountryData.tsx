import React, { useEffect, useMemo, useState } from "react"
import { useQuery } from "@apollo/client"
import GraphQLStatus from "components/GraphQLStatus"
import { GQL_countryProduction, GQL_countryProjection, GQL_countryReserves } from "queries/country"
import { Alert, notification } from "antd"
import useText from "lib/useText"
import { useDispatch, useSelector } from "react-redux"
import ForecastView from "./ForecastView"
import { useConversionHooks } from "../viz/conversionHooks"
import settings from "settings"
import { MinimalDataset, prepareProductionDataset, RawDataset } from "./calculate"
import { Store } from "lib/types"
import { usePrefixConversion } from "lib/calculations/prefix-conversion"

const DEBUG = false

function LoadCountryData( { projectionSources }:{projectionSources: RawDataset[]} ) {
	const dispatch = useDispatch()
	const { co2FromVolume, reservesProduction } = useConversionHooks()
	const { getText } = useText()
	const [ limits, set_limits ] = useState( {} )
	const [ grades, set_grades ] = useState( {} )
	const country = useSelector( (redux: Store) => redux.country )
	const region = useSelector( (redux: Store) => redux.region )
	const productionSourceId = useSelector( (redux: Store) => redux.productionSourceId )
	const projectionSourceId = useSelector( (redux: Store) => redux.projectionSourceId )
	const reservesSourceId = useSelector( (redux: Store) => redux.reservesSourceId )
	const stableProduction = useSelector( (redux: Store) => redux.stableProduction )
	const gwp = useSelector( (redux: Store) => redux.gwp )
	
	const prefixConversion = usePrefixConversion()

	

	const _co2 = (dataset: MinimalDataset[]) => {
		console.info({dataset})
		if( !( dataset?.length > 0 ) ) return []

		try {
			return prepareProductionDataset( dataset ).map( p => ( { ...p, co2: co2FromVolume( p ) } ) )
		} catch( e ) {
			notification.error( { message: 'LoadCountryData  error', description: e.message, duration: 20 } )
			return dataset
		}
	}

	const {
		data: productionData,
		loading: loadingProduction,
		error: errorLoadingProduction
	} = useQuery( GQL_countryProduction, {
		variables: { iso3166: country, iso31662: region ?? '' },
		skip: !productionSourceId
	} )

	DEBUG && console.info( 'LoadCountryData', { productionData } )

	const production = useMemo( () => {
		DEBUG && console.info( '_co2( productionData )', productionData?.countryDataPoints?.nodes )
		return _co2( productionData?.countryDataPoints?.nodes )
	}, [ productionData?.countryDataPoints?.nodes, productionData?.countryDataPoints?.nodes?.length, productionSourceId, gwp ] )

	const {
		data: projectionData,
		loading: loadingProjection,
		error: errorLoadingProjection
	} = useQuery( GQL_countryProjection, {
		variables: { iso3166: country, iso31662: region ?? '', sourceId: projectionSourceId },
		skip: !country
	} )

	const projection = useMemo( () => {
		try {
			// Synthesize stable projection data points if selected
			if( projectionSourceId === settings.stableProductionSourceId ) {
				if( !stableProduction?.oil ) return []

				let stableProj = []
				for( let year = 2020; year <= settings.year.end; year++ ) {
					stableProj.push( { ...stableProduction.oil, year, sourceId: settings.stableProductionSourceId } )
					stableProj.push( { ...stableProduction.gas, year, sourceId: settings.stableProductionSourceId } )
					stableProj.push( { ...stableProduction.coal, year, sourceId: settings.stableProductionSourceId } )
				}
				DEBUG && console.info( { stableProj } )
				return stableProj.concat( _co2( projectionData?.countryDataPoints?.nodes ) )
			} else
				return _co2( projectionData?.countryDataPoints?.nodes )
		} catch( e ) {
			notification.error( { message: 'Error in calculation', description: e.message } )
			return []
		}
	}, [ projectionData?.countryDataPoints?.nodes, projectionSourceId, stableProduction, gwp ] )

	const {
		data: reservesData,
		loading: loadingReserves,
		error: errorLoadingReserves
	} = useQuery( GQL_countryReserves, {
		variables: { iso3166: country, iso31662: region ?? '', sourceId: productionSourceId },
		skip: !country
	} )

	const reserves = useMemo( () => _co2( reservesData?.countryDataPoints?.nodes ),
		[ reservesData?.countryDataPoints?.nodes, gwp ] )

	// Find stable production
	useEffect( () => {
		const reverse = [ ...production ].reverse()
		const oil = reverse.find( d => d.fossilFuelType === 'oil' && d.sourceId === productionSourceId )
		const gas = reverse.find( d => d.fossilFuelType === 'gas' && d.sourceId === productionSourceId )
		const coal = reverse.find( d => d.fossilFuelType === 'coal' && d.sourceId === productionSourceId )
		dispatch( { type: 'STABLEPRODUCTION', payload: { oil, gas, coal } } )
	}, [ production, productionSourceId, gwp ] )

	// Figure out available years when data loaded.

	useEffect( () => {
		if( !( production?.length > 0 ) ) return

		const reduced = {}
		settings.supportedFuels.forEach( fuel => reduced[ fuel ] = { firstYear: settings.year.end, lastYear: 0 } )

		const newLimits = production.reduce( ( _limits, datapoint ) => {
			if( datapoint.sourceId !== productionSourceId ) return _limits
			const l = _limits[ datapoint.fossilFuelType ]
			l.firstYear = Math.min( l.firstYear, datapoint.year )
			l.lastYear = Math.max( l.lastYear, datapoint.year )
			return _limits
		}, reduced )

		DEBUG && console.info( 'useEffect Production', production?.length, { production, limits, newLimits } )

		// Check if no data
		settings.supportedFuels.forEach( fuel => {
			if( newLimits[ fuel ].firstYear === settings.year.end ) newLimits[ fuel ].firstYear = 0
		} )

		set_limits( l => ( { ...l, production: newLimits } ) )
		DEBUG && console.info( 'useEffect Production', { newLimits } )
	}, [ production?.length, productionSourceId ] )

	useEffect( () => {
		DEBUG && console.info( 'useEffect projection', { projection, limits } )
		if( !projection?.length > 0 ) return

		let newLimits
		const reduced = {}
		settings.supportedFuels.forEach( fuel => reduced[ fuel ] = { firstYear: settings.year.end, lastYear: 0 } )

		if( projectionSourceId === settings.stableProductionSourceId ) {
			newLimits = {}
			settings.supportedFuels.forEach( fuel => newLimits[ fuel ] = {
				firstYear: new Date().getFullYear() - 1,
				lastYear: settings.year.end
			} )
		} else {
			newLimits = projection.reduce( ( _limits, datapoint ) => {
				if( datapoint.sourceId !== projectionSourceId ) return _limits
				const l = _limits[ datapoint.fossilFuelType ]
				l.firstYear = Math.min( l.firstYear, datapoint.year )
				l.lastYear = Math.max( l.lastYear, datapoint.year )
				return _limits
			}, reduced )
		}

		// Check if no data
		settings.supportedFuels.forEach( fuel => {
			if( newLimits[ fuel ].firstYear === settings.year.end ) newLimits[ fuel ].firstYear = 0
		} )

		set_limits( l => ( { ...l, projection: newLimits } ) )
	}, [ projection, projectionSourceId ] )

	useEffect( () => {
		DEBUG && console.info( 'useEffect reserves', { limits, reserves } )
		if( !( reserves?.length > 0 ) ) return
		const newLimits = reserves.reduce( ( _limits, datapoint ) => {
			_limits.firstYear = ( _limits.firstYear === undefined || datapoint.year < _limits.firstYear ) ? datapoint.year : _limits.firstYear
			_limits.lastYear = ( _limits.lastYear === undefined || datapoint.year > _limits.lastYear ) ? datapoint.year : _limits.lastYear
			return _limits
		}, {} )

		set_limits( l => ( { ...l, reserves: newLimits } ) )
	}, [ reserves ] )

	DEBUG && console.info( { limits, production, projection, reserves } )

	// Figure out available grades when reserves loaded.

	useEffect( () => {
		DEBUG && console.info( 'useEffect Reserve Grades', { reserves, reservesSourceId } )
		if( !( reserves?.length > 0 ) ) return
		const _grades = reserves
			.filter( r => r.sourceId === reservesSourceId )
			.reduce( ( g, r ) => {
				g[ r.grade ] = false
				return g
			}, {} )
		//console.info( _grades )
		set_grades( _grades )
	}, [ reserves?.length, reservesSourceId ] )

	// Match projected production with reserves.

	const projectedProduction = useMemo( () => {
		if( !productionSourceId ) return []
		if( !projectionSourceId ) return []
		if( !reservesSourceId ) return []
		DEBUG && console.info( 'useMemo projectedProduction', { projection, reserves } )
		try {
			return reservesProduction( projection, reserves, projectionSourceId, reservesSourceId, limits, grades )
		} catch( e ) {
			notification.error( {
				message: 'Error in projected production calculation',
				description: e.message,
				duration: 20
			} )
			return []
		}
	}, [ projection, reserves, productionSourceId, projectionSourceId, reservesSourceId, limits, grades ] )

	if( loadingProduction || errorLoadingProduction )
		return <GraphQLStatus loading={ loadingProduction } error={ errorLoadingProduction }/>
	if( loadingProjection || errorLoadingProjection )
		return <GraphQLStatus loading={ loadingProjection } error={ errorLoadingProjection }/>
	if( loadingReserves || errorLoadingReserves )
		return <GraphQLStatus loading={ loadingReserves } error={ errorLoadingReserves }/>

	// Don't try to render a chart until all data looks good
	if( ( !limits.production?.oil?.lastYear && !limits.production?.gas?.lastYear && !limits.production?.coal?.lastYear ) || !production?.length > 0 ) {
		DEBUG && console.info( 'What to do?', { limits, production } )
		return <Alert message={ getText( 'make_selections' ) } type="info" showIcon/>
	}

	return (
		<ForecastView
			production={ production }
			projection={ projection }
			reserves={ reserves }
			projectedProduction={ projectedProduction }
			projectionSources={ projectionSources }
		/>
	)
}

export default LoadCountryData
