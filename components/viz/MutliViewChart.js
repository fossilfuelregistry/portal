import { useEffect, useState } from "react"
import {
	Chart,
	Area,
	Line,
	Point,
	Tooltip,
	Axis,
	View
} from 'bizcharts'

const data = [
	{ year: 1988, co2: [ 14.3, 27.7 ] },
	{ year: 1989, co2: [ 14.5, 27.8 ] },
	{ year: 1990, co2: [ 15.5, 29.6 ] },
	{ year: 1991, co2: [ 16.7, 30.7 ] },
	{ year: 1992, co2: [ 16.5, 25.0 ] },
	{ year: 1993, co2: [ 17.8, 25.7 ] },
	{ year: 1994, co2: [ 13.5, 24.8 ] },
	{ year: 1995, co2: [ 10.5, 21.4 ] },
	{ year: 1996, co2: [ 9.2, 23.8 ] },
	{ year: 1997, co2: [ 11.6, 21.8 ] },
	{ year: 1998, co2: [ 10.7, 23.7 ] },
	{ year: 1999, co2: [ 11.0, 23.3 ] },
	{ year: 2000, co2: [ 11.6, 23.7 ] },
	{ year: 2001, co2: [ 11.8, 20.7 ] },
	{ year: 2002, co2: [ 12.6, 22.4 ] },
	{ year: 2003, co2: [ 13.6, 19.6 ] },
	{ year: 2005, co2: [ 11.4, 22.6 ] },
	{ year: 2006, co2: [ 13.2, 25.0 ] },
	{ year: 2007, co2: [ 14.2, 21.6 ] },
	{ year: 2008, co2: [ 13.1, 17.1 ] },
	{ year: 2009, co2: [ 12.2, 15.5 ] },
	{ year: 2010, co2: [ 12.0, 20.8 ] },
	{ year: 2011, co2: [ 12.0, 17.1 ] },
	{ year: 2012, co2: [ 12.7, 18.3 ] },
	{ year: 2013, co2: [ 12.4, 19.4 ] },
	{ year: 2014, co2: [ 12.6, 19.9 ] },
	{ year: 2015, co2: [ 11.9, 20.2 ] },
	{ year: 2016, co2: [ 11.0, 19.3 ] },
	{ year: 2017, co2: [ 10.8, 17.8 ] },
	{ year: 2018, co2: [ 11, 19.5 ] },
	{ year: 2019, co2: [ 12, 20.1 ] },
	{ year: 2020, co2: [ 12, 22 ] },
]

const dataFuture = [
	{ year: 2020, co2: [ 12, 22 ] },
	{ year: 2021, co2: [ 12, 22 ] },
	{ year: 2022, co2: [ 14.5, 21.8 ] },
	{ year: 2023, co2: [ 15.5, 22.6 ] },
	{ year: 2024, co2: [ 16.7, 24.7 ] },
	{ year: 2025, co2: [ 16.5, 25.0 ] },
	{ year: 2026, co2: [ 17.8, 25.7 ] },
	{ year: 2027, co2: [ 13.5, 24.8 ] },
	{ year: 2028, co2: [ 10.5, 21.4 ] },
	{ year: 2029, co2: [ 9.2, 23.8 ] },
	{ year: 2030, co2: [ 11.6, 21.8 ] },
	{ year: 2031, co2: [ 10.7, 23.7 ] },
	{ year: 2032, co2: [ 11.0, 23.3 ] },
	{ year: 2033, co2: [ 11.6, 23.7 ] },
	{ year: 2034, co2: [ 11.8, 20.7 ] },
	{ year: 2035, co2: [ 12.6, 22.4 ] },
	{ year: 2036, co2: [ 13.6, 19.6 ] },
	{ year: 2037, co2: [ 11.4, 22.6 ] },
	{ year: 2038, co2: [ 13.2, 25.0 ] },
	{ year: 2039, co2: [ 14.2, 21.6 ] },
	{ year: 2040, co2: [ 13.1, 17.1 ] },
]

const averages = [
	{ year: 1988, co2: 21.5 },
	{ year: 1989, co2: 22.1 },
	{ year: 1990, co2: 23 },
	{ year: 1991, co2: 23.8 },
	{ year: 1992, co2: 21.4 },
	{ year: 1993, co2: 21.3 },
	{ year: 1994, co2: 18.3 },
	{ year: 1995, co2: 15.4 },
	{ year: 1996, co2: 16.4 },
	{ year: 1997, co2: 17.7 },
	{ year: 1998, co2: 17.5 },
	{ year: 1999, co2: 17.6 },
	{ year: 2000, co2: 17.7 },
	{ year: 2001, co2: 16.8 },
	{ year: 2002, co2: 17.7 },
	{ year: 2003, co2: 16.3 },
	{ year: 2005, co2: 17.8 },
	{ year: 2006, co2: 18.1 },
	{ year: 2007, co2: 17.2 },
	{ year: 2008, co2: 14.4 },
	{ year: 2009, co2: 13.7 },
	{ year: 2010, co2: 15.7 },
	{ year: 2011, co2: 14.6 },
	{ year: 2012, co2: 15.3 },
	{ year: 2013, co2: 15.3 },
	{ year: 2014, co2: 15.8 },
	{ year: 2015, co2: 15.2 },
	{ year: 2016, co2: 14.8 },
	{ year: 2017, co2: 14.4 },
	{ year: 2018, co2: 15 },
	{ year: 2019, co2: 16 },
	{ year: 2020, co2: 18 },
]

const averagesFuture = [
	{ year: 2020, co2: 18 },
	{ year: 2021, co2: 17 },
	{ year: 2022, co2: 19 },
	{ year: 2023, co2: 18 },
	{ year: 2024, co2: 19 },
	{ year: 2025, co2: 20 },
	{ year: 2026, co2: 18 },
	{ year: 2027, co2: 18.3 },
	{ year: 2028, co2: 15.4 },
	{ year: 2029, co2: 16.4 },
	{ year: 2030, co2: 17.7 },
	{ year: 2031, co2: 17.5 },
	{ year: 2032, co2: 17.6 },
	{ year: 2033, co2: 17.7 },
	{ year: 2034, co2: 16.8 },
	{ year: 2035, co2: 17.7 },
	{ year: 2036, co2: 16.3 },
	{ year: 2037, co2: 17.8 },
	{ year: 2038, co2: 18.1 },
	{ year: 2039, co2: 17.2 },
	{ year: 2040, co2: 14.4 },
]

export default function MultiViewChart( { future } ) {
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
