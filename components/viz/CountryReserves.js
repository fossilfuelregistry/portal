import { Area, Chart, Line, Point, Tooltip, View } from 'bizcharts'
import { useQuery } from "@apollo/client"
import { GQL_conversions, GQL_sources } from "queries/general"
import GraphQLStatus from "../GraphQLStatus"
import { GQL_countryReservesByIso } from "queries/country"
import { useEffect, useState } from "react"
import { Alert } from "antd"
import { textsSelector, useStore } from "../../lib/zustandProvider"

const DEBUG = true

export default function CountryReserves( { country, fossilFuelType, sources, grades, onGrades, onSources } ) {
	const texts = useStore( textsSelector )
	const [ limits, set_limits ] = useState()

	const { data: conversionsData, loading: loadingConversions, error: errorLoadingConversions }
		= useQuery( GQL_conversions )

	const conversion = conversionsData?.conversions?.nodes ?? []

	const { data: sourcesData, loading: loadingSources, error: errorLoadingSources }
		= useQuery( GQL_sources )

	const allSources = sourcesData?.sources?.nodes ?? []

	const { data: reservesData, loading: loadingReserves, error: errorLoadingReserves }
		= useQuery( GQL_countryReservesByIso,
			{ variables: { iso3166: country }, skip: !country } )

	const reserves = reservesData?.countryReserves?.nodes ?? []

	useEffect( () => {
		DEBUG && console.log( 'useEffect reserves.length', { allSources } )
		if( !( reserves?.length > 0 ) || !( allSources?.length > 0 ) ) return
		const newLimits = reserves.reduce( ( limits, r ) => {
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
	}, [ reserves.length ] )

	if( loadingSources || errorLoadingSources )
		return <GraphQLStatus loading={loadingSources} error={errorLoadingSources}/>
	if( loadingConversions || errorLoadingConversions )
		return <GraphQLStatus loading={loadingConversions} error={errorLoadingConversions}/>
	if( loadingReserves || errorLoadingReserves )
		return <GraphQLStatus loading={loadingReserves} error={errorLoadingReserves}/>

	const { firstYear, lastYear } = limits ?? {}

	const scaleValues = { sync: true, nice: true }

	DEBUG && console.log( 'CountryReserves', { fossilFuelType, firstYear, lastYear, grades, sources, scaleValues } )

	const datasets = sources.filter( s => s?.enabled ).map( source => {
		console.log( source )
		return {
			source,
			data: reserves
				.filter( r => r.fossilFuelType === fossilFuelType && grades?.[ r.grade ] === true && source.sourceId === r.sourceId )
				.map( r => {
					scaleValues.min = scaleValues.min ? Math.min( scaleValues.min, r.volume ) : r.volume
					scaleValues.max = scaleValues.max ? Math.max( scaleValues.max, r.volume ) : r.volume
					const point = { year: r.year }
					if( r.projection || r.year > 2005 ) {
						point[ 'co2_' + source.name + '_projection' ] = r.volume
						point[ 'co2_span_' + source.name + '_projection' ] = [ r.volume * 0.9, r.volume * 1.15 ]
					} else {
						point[ 'co2_' + source.name ] = r.volume
						point[ 'co2_span_' + source.name ] = [ r.volume * 0.9, r.volume * 1.15 ]
					}
					return point
				} )
		}
	} )

	const interval = scaleValues.max - scaleValues.min
	scaleValues.min -= interval * 0.1
	scaleValues.max += interval * 0.1

	const scale = {
		year: {
			type: 'linear',
			nice: true,
			tickInterval: 5,
			min: firstYear,
			max: lastYear
		}
	}

	datasets.forEach( dataset => {
		scale[ 'co2_' + dataset.source.name ] = scaleValues
		scale[ 'co2_span_' + dataset.source.name ] = scaleValues
		scale[ 'co2_' + dataset.source.name + '_projection' ] = scaleValues
		scale[ 'co2_span_' + dataset.source.name + '_projection' ] = scaleValues
	} )

	if( !firstYear || !lastYear || !fossilFuelType || !datasets?.[ 0 ]?.data?.length > 0 )
		return <Alert message={texts?.make_selections} type="info" showIcon/>

	return (
		<Chart scale={scale} height={400} autoFit forceUpdate>
			<Tooltip shared/>

			{datasets.map( dataset => {
				DEBUG && console.log( 'CountryReserves', { scaleValues, dataset } )
				return (
					<>
						<View data={dataset.data}>
							<Area
								position={"year*" + 'co2_span_' + dataset.source.name}
							/>
							<Area
								position={"year*" + 'co2_span_' + dataset.source.name + '_projection'}
								color={'#ffb542'}
							/>

							<Line position={"year*" + 'co2_' + dataset.source.name}/>
							<Point position={"year*" + 'co2_' + dataset.source.name} size={3} shape="circle"/>

							<Line
								position={"year*" + 'co2_' + dataset.source.name + '_projection'}
								color={'#ee6c32'}
							/>
							<Point
								position={"year*" + 'co2_' + dataset.source.name + '_projection'}
								size={3}
								shape="circle" color={'#e54700'}
							/>
						</View>
					</>
				)
			} )}
		</Chart>
	)
}
