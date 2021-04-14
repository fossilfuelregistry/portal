import React, { useEffect, useState } from "react"
import { useQuery } from "@apollo/client"
import { withParentSize } from '@visx/responsive'
import { AreaStack } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { max } from 'd3-array'
import GraphQLStatus from "components/GraphQLStatus"
import { GQL_countryProductionByIso } from "queries/country"
import { Alert } from "antd"
import { textsSelector, useStore } from "lib/zustandProvider"
import { useUnitConversionGraph } from "./UnitConverter"
import { GQL_sources } from "queries/general"
import { filteredCombinedDataSet } from "./util"

const DEBUG = true

const getX = ( d ) => d.year
const getY = ( d ) => {
	return d.oil ?? 0 + d.gas ?? 0
}
const getY0 = ( d ) => d[ 0 ]
const getY1 = ( d ) => d[ 1 ]

function CO2ForecastBase( { country, sources, grades, onGrades, onSources, parentWidth } ) {
	const { co2FromVolume } = useUnitConversionGraph()
	const texts = useStore( textsSelector )
	const [ limits, set_limits ] = useState()

	const height = 500

	const { data: sourcesData, loading: loadingSources, error: errorLoadingSources }
		= useQuery( GQL_sources )

	const allSources = sourcesData?.sources?.nodes ?? []

	const { data: productionData, loading: loadingProduction, error: errorLoadingProduction }
		= useQuery( GQL_countryProductionByIso,
			{ variables: { iso3166: country }, skip: !country } )

	const production = productionData?.countryProductions?.nodes ?? []

	useEffect( () => {
		DEBUG && console.log( 'useEffect Production.length', { allSources } )
		if( !( production?.length > 0 ) || !( allSources?.length > 0 ) ) return
		const newLimits = production.reduce( ( limits, r ) => {
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
	}, [ production.length ] )

	if( loadingSources || errorLoadingSources )
		return <GraphQLStatus loading={loadingSources} error={errorLoadingSources}/>
	if( loadingProduction || errorLoadingProduction )
		return <GraphQLStatus loading={loadingProduction} error={errorLoadingProduction}/>

	const { firstYear, lastYear } = limits ?? {}

	let oil
	const sourceIds = sources.map( s => s?.sourceId )
	try {
		oil = filteredCombinedDataSet( production, [ 'oil', 'gas' ], sourceIds, grades, false, co2FromVolume )
	} catch( e ) {
		return (
			<Alert
				message="Error during data extraction" description={<pre>{e.message}<br/>{e.stack}</pre>} showIcon
				type="error"
			/> )
	}

	DEBUG && console.log( 'CountryProduction', { oil } )

	// Don't try to render a chart until all data looks good
	if(
		!firstYear || !lastYear || !oil?.length > 0
	)
		return <Alert message={texts?.make_selections} type="info" showIcon/>

	const data = oil

	// scales
	const xScale = scaleLinear( {
		range: [ 0, parentWidth ],
		domain: [ firstYear, lastYear ],
	} )
	const maxCO2 = max( data, d => d.oil + d.gas )
	const yScale = scaleLinear( {
		range: [ height, 0 ],
		domain: [ 0, maxCO2 ],
	} )

	DEBUG && console.log( 'CountryProduction', { firstYear, lastYear, maxCO2, grades, sources } )

	return (
		<svg width={'100%'} height={height}>
			<AreaStack
				keys={[ 'oil', 'gas' ]}
				data={data}
				x={d => {
					const x = xScale( getX( d.data ) ) ?? 0
					console.log( { d, x } )
					return x
				}}
				y0={d => yScale( getY0( d ) ) ?? 0}
				y1={d => yScale( getY1( d ) ) ?? 0}
			>
				{( { stacks, path } ) =>
					stacks.map( stack => {
						console.log( { stack, path: path( stack ) } )
						return (
							<path
								key={`stack-${stack.key}`}
								d={path( stack ) || ''}
								stroke="transparent"
								fill={stack.key === 'oil' ? "#555555" : "#568a9e"}
							/>
						)
					} )}
			</AreaStack>
		</svg>
	)
}

const CO2Forecast = withParentSize( CO2ForecastBase )
export default CO2Forecast

/*
			<Group top={0} left={0}>
				<LinePath
					curve={curveLinear}
					data={data}
					x={d => xScale( getX( d ) ) ?? 0}
					y={d => yScale( getY( d ) ) ?? 0}
					stroke={'#935050'}
					strokeWidth={1.5}
					strokeOpacity={1}
					shapeRendering="geometricPrecision"
				/>
				<AreaClosed
					data={data}
					x={d => xScale( getX( d ) ) ?? 0}
					y={d => yScale( getY( d ) ) ?? 0}
					yScale={yScale}
					strokeWidth={1}
					stroke="url(#area-gradient)"
					fill={'#a1a35e'}
					fillOpacity={0.1}
					curve={curveLinear}
				/>
			</Group>

 */
