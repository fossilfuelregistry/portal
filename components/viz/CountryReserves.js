import { Area, Axis, Chart, Line, Point, Tooltip, View } from 'bizcharts'
import { useQuery } from "@apollo/client"
import { GQL_conversions } from "queries/general"
import GraphQLStatus from "../GraphQLStatus"
import { GQL_countryReservesByIso } from "queries/country"
import { useEffect, useState } from "react"

const DEBUG = true

export default function CountryReserves( { country, fossilFuelType, grades, onGrades } ) {
	const [ limits, set_limits ] = useState()

	const { data: conversionsData, loading: loadingConversions, error: errorLoadingConversions }
		= useQuery( GQL_conversions )

	const conversion = conversionsData?.data

	const { data: reservesData, loading: loadingReserves, error: errorLoadingReserves }
		= useQuery( GQL_countryReservesByIso,
			{ variables: { iso3166: country?.toLowerCase() }, skip: !country } )

	const reserves = reservesData?.countryReserves?.nodes ?? []

	useEffect( () => {
		if( !( reserves?.length > 0 ) ) return
		const newLimits = reserves.reduce( ( limits, r ) => {
			limits[ 0 ] = ( limits[ 0 ] === undefined || r.year < limits[ 0 ] ) ? r.year : limits[ 0 ]
			limits[ 1 ] = ( limits[ 1 ] === undefined || r.year > limits[ 1 ] ) ? r.year : limits[ 1 ]
			limits[ 2 ] = Object.assign( { [ r.grade ]: true }, limits[ 2 ] ?? {} )
			return limits
		}, [] )

		set_limits( newLimits )
		onGrades && onGrades( newLimits[ 2 ] )
	}, [ reserves.length ] )

	if( loadingConversions || errorLoadingConversions )
		return <GraphQLStatus loading={loadingConversions} error={errorLoadingConversions}/>

	if( loadingReserves || errorLoadingReserves )
		return <GraphQLStatus loading={loadingReserves} error={errorLoadingReserves}/>

	const [ firstYear, lastYear ] = limits ?? []

	const scale = {
		co2: {
			sync: true,
			nice: true,
			tickInterval: 5,
			min: 0, max: 30,
		},
		co2_proj: {
			sync: true,
			nice: true,
			tickInterval: 5,
			min: 0, max: 30,
		},
		year: {
			type: 'linear',
			nice: true,
			tickInterval: 5,
			min: firstYear,
			max: lastYear
		}
	}

	const data = reserves
		.filter( r => r.fossilFuelType === fossilFuelType && grades?.[ r.grade ] === true )
		.map( r => {
			const point = { year: r.year }
			if( r.projection ) point.co2_proj = r.volume
			else point.co2 = r.volume
			return point
		} )

	DEBUG && console.log( 'CountryReserves', fossilFuelType, firstYear, lastYear, grades, reserves.length, data.length )

	return (
		<Chart scale={scale} height={400} data={data} autoFit>
			<Tooltip shared/>

			<View data={data}>
				<Axis name="year" visible={false}/>
				<Axis name="co2" visible={false}/>
				<Axis name="co2_proj" visible={false}/>
				<Area
					position="year*co2"
				/>
				<Area
					position="year*co2_proj"
					color={'#ffb542'}
				/>
			</View>

			<View data={data}>
				<Axis name="co2" visible={false}/>
				<Line position="year*co2"/>
				<Point position="year*co2" size={3} shape="circle"/>

				<Line position="year*co2_proj" color={'#ee6c32'}/>
				<Point position="year*co2_proj" size={3} shape="circle" color={'#e54700'}/>
			</View>
		</Chart>
	)
}
