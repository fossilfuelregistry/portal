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
			{ variables: { iso3166: country?.toLowerCase() }, skip: !country } )

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

	const data = reserves
		.filter( r => r.fossilFuelType === fossilFuelType && grades?.[ r.grade ] === true && sources[ r.sourceId ] )
		.map( r => {
			scaleValues.min = scaleValues.min ? Math.min( scaleValues.min, r.volume ) : r.volume
			scaleValues.max = scaleValues.max ? Math.max( scaleValues.max, r.volume ) : r.volume
			const point = { year: r.year }
			if( r.projection || r.year > 2015 ) {
				point.co2_proj = r.volume
				point.span_proj = [ r.volume * 0.9, r.volume * 1.15 ]
			} else {
				point.co2 = r.volume
				point.span = [ r.volume * 0.9, r.volume * 1.15 ]
			}
			return point
		} )

	const interval = scaleValues.max - scaleValues.min
	scaleValues.min -= interval * 0.1
	scaleValues.max += interval * 0.1

	const scale = {
		co2: scaleValues,
		co2_proj: scaleValues,
		span: scaleValues,
		span_proj: scaleValues,
		year: {
			type: 'linear',
			nice: true,
			tickInterval: 5,
			min: firstYear,
			max: lastYear
		}
	}

	if( !firstYear || !lastYear || !fossilFuelType || !data.length > 0 )
		return <Alert message={texts?.make_selections} type="info" showIcon/>

	DEBUG && console.log( 'CountryReserves', { fossilFuelType, firstYear, lastYear, grades, sources, scaleValues, data } )

	return (
		<Chart scale={scale} height={400} data={data} autoFit forceUpdate>
			<Tooltip shared/>

			<View data={data}>
				<Area position="year*span"/>
				<Area position="year*span_proj" color={'#ffb542'}/>
			</View>

			<View data={data}>
				<Line position="year*co2"/>
				<Point position="year*co2" size={3} shape="circle"/>

				<Line position="year*co2_proj" color={'#ee6c32'}/>
				<Point position="year*co2_proj" size={3} shape="circle" color={'#e54700'}/>
			</View>
		</Chart>
	)
}
