import React, { useEffect, useMemo, useState } from "react"
import { useQuery } from "@apollo/client"
import GraphQLStatus from "components/GraphQLStatus"
import { GQL_projectProduction, GQL_projectProjection, GQL_projectReserves } from "queries/country"
import { Alert, notification } from "antd"
import useText from "lib/useText"
import { useDispatch, useSelector } from "react-redux"
import ForecastView from "./ForecastView"
import { useConversionHooks } from "../viz/conversionHooks"
import settings from "settings"

const DEBUG = false

function LoadProjectData() {
	const dispatch = useDispatch()
	const { co2FromVolume, reservesProduction } = useConversionHooks()
	const { getText } = useText()
	const [ limits, set_limits ] = useState( {} )
	const [ grades, set_grades ] = useState( {} )
	const project = useSelector( redux => redux.project )
	const productionSourceId = useSelector( redux => redux.productionSourceId )
	const projectionSourceId = useSelector( redux => redux.projectionSourceId )
	const reservesSourceId = useSelector( redux => redux.reservesSourceId )
	const stableProduction = useSelector( redux => redux.stableProduction )
	const gwp = useSelector( redux => redux.gwp )

	const _co2 = dataset => {
		try {
			return ( dataset ?? [] )
				.filter( datapoint => datapoint.fossilFuelType === 'gas' || datapoint.fossilFuelType === 'oil' )
				.map( datapoint => {
					let _d = { ...datapoint }
					delete _d.id
					delete _d.__typename
					_d.co2 = co2FromVolume( datapoint )
					return _d
				} )
		} catch( e ) {
			notification.error( { message: 'Application error', description: e.message } )
			return dataset
		}
	}

	const {
		data: productionData,
		loading: loadingProduction,
		error: errorLoadingProduction
	} = useQuery( GQL_projectProduction, {
		variables: { forId: project?.id },
		skip: !project?.id
	} )

	const production = useMemo( () => {
		DEBUG && console.log( '_co2( productionData )', productionData?.projectDataPoints?.nodes )
		return _co2( productionData?.projectDataPoints?.nodes )
	}, [ productionData?.projectDataPoints?.nodes, productionData?.projectDataPoints?.nodes?.length, productionSourceId, gwp ] )

	const {
		data: projectionData,
		loading: loadingProjection,
		error: errorLoadingProjection
	} = useQuery( GQL_projectProjection, {
		variables: { id: project?.id },
		skip: !project?.id
	} )

	DEBUG && console.log( 'LoadProjectData', { productionData, production } )

	const projection = useMemo( () => {
		try {
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
				return _co2( projectionData?.projectDataPoints?.nodes )
		} catch( e ) {
			notification.error( { message: 'Error in calculation', description: e.message } )
			return []
		}
	}, [ projectionData?.projectDataPoints?.nodes, projectionSourceId, stableProduction, gwp ] )

	const {
		data: reservesData,
		loading: loadingReserves,
		error: errorLoadingReserves
	} = useQuery( GQL_projectReserves, {
		variables: { id: project?.id },
		skip: !project?.id
	} )

	const reserves = useMemo( () => _co2( reservesData?.projectDataPoints?.nodes ),
		[ reservesData?.projectDataPoints?.nodes, gwp ] )

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

		// Check if no data
		if( newLimits.oil.firstYear === settings.year.end ) newLimits.oil.firstYear = 0
		if( newLimits.gas.firstYear === settings.year.end ) newLimits.gas.firstYear = 0

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

		// Check if no data
		if( newLimits.oil.firstYear === settings.year.end ) newLimits.oil.firstYear = 0
		if( newLimits.gas.firstYear === settings.year.end ) newLimits.gas.firstYear = 0

		set_limits( l => ( { ...l, projection: newLimits } ) )
	}, [ projection, projectionSourceId ] )

	useEffect( () => {
		DEBUG && console.log( 'useEffect reserves', { limits, reserves } )
		if( !( reserves?.length > 0 ) ) return
		const newLimits = reserves.reduce( ( _limits, datapoint ) => {
			_limits.firstYear = ( _limits.firstYear === undefined || datapoint.year < _limits.firstYear ) ? datapoint.year : _limits.firstYear
			_limits.lastYear = ( _limits.lastYear === undefined || datapoint.year > _limits.lastYear ) ? datapoint.year : _limits.lastYear
			return _limits
		}, {} )

		set_limits( l => ( { ...l, reserves: newLimits } ) )
	}, [ reserves ] )

	DEBUG && console.log( { limits, project, production, projection, reserves } )

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
		if( !productionSourceId ) return []
		if( !projectionSourceId ) return []
		if( !reservesSourceId ) return []
		DEBUG && console.log( 'useMemo projectedProduction', { projection, reserves } )
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

export default LoadProjectData
