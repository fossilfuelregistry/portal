import { Area, Axis, Chart, Line, Point, Tooltip, View } from 'bizcharts'
import { useQuery } from "@apollo/client"
import { GQL_conversions } from "../../queries/general"
import GraphQLStatus from "../GraphQLStatus"


export default function CountryReserves( { future } ) {
	const scale = {
		co2: {
			sync: true,
			nice: true,
			min: 5,
			max: 30
		},
		year: {
			type: 'linear',
			nice: true,
			min: future ? 2021 : 1988,
			max: future ? 2040 : 2020,
			ticks: future ? [ 2020, 2030, 2040 ] : [ 1990, 2000, 2010 ]
		},
	}

	const { data: conversionsData, loading: loadingConversions, error: errorLoadingConversions }
		= useQuery( GQL_conversions )

	if( loadingConversions || errorLoadingConversions )
		return <GraphQLStatus loading={loadingConversions} error={errorLoadingConversions}/>

	const conversionConstants = conversionsData?.data

	return (
		<Chart scale={scale} height={400} data={data} autoFit>
			<Tooltip shared/>
			<Axis name="co2" visible={false}/>
			<Axis name="year" label={{ style: { textAlign: future ? 'start' : 'end' } }}/>
			<View data={future ? dataFuture : data} scale={{ co2: { alias: 'co2' } }}>
				<Area position="year*co2" color={future ? '#e9ba70' : undefined}/>
			</View>
			<View data={future ? averagesFuture : averages} scale={{ co2: { alias: 'co2' } }}>
				<Line position="year*co2" color={future ? '#cf7e00' : undefined}/>
				<Point
					position="year*co2"
					size={3}
					shape="circle"
					color={future ? '#e54700' : undefined}
				/>
			</View>
		</Chart>
	)
}
