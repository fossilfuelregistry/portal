import { useEffect, useState } from "react"
import { Area, Chart, Line, Point, Tooltip, View } from 'bizcharts'
import { useQuery } from "@apollo/client"
import GraphQLStatus from "components/GraphQLStatus"
import { GQL_countryProductionByIso } from "queries/country"
import { Alert } from "antd"
import { textsSelector, useStore } from "lib/zustandProvider"
import { useUnitConversionGraph } from "./UnitConverter"
import { GQL_sources } from "queries/general"
import { getFuelCO2 } from "./util"

const DEBUG = false

export default function CountryProduction( { country, fossilFuelType, sources, onSources } ) {
	const { co2FromVolume } = useUnitConversionGraph()
	const texts = useStore( textsSelector )
	const [ limits, set_limits ] = useState()

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
			limits.sources[ r.sourceId ] = allSources.find( s => s.sourceId === r.sourceId )
			return limits
		}, { sources: [] } )

		DEBUG && console.log( { newLimits } )
		set_limits( newLimits )
		onSources && onSources( newLimits.sources )
	}, [ production.length ] )

	if( loadingSources || errorLoadingSources )
		return <GraphQLStatus loading={loadingSources} error={errorLoadingSources}/>
	if( loadingProduction || errorLoadingProduction )
		return <GraphQLStatus loading={loadingProduction} error={errorLoadingProduction}/>

	const { firstYear, lastYear } = limits ?? {}

	const scaleValues = { sync: true, nice: true }

	DEBUG && console.log( 'CountryProduction', { fossilFuelType, firstYear, lastYear, sources, scaleValues } )

	let datasets
	try {
		datasets = sources.filter( s => s?.enabled ).map( source => {
			DEBUG && console.log( source )
			return {
				source,
				data: production
					.filter( r => r.fossilFuelType === fossilFuelType && source.sourceId === r.sourceId )
					.map( r => {
						const point = { year: r.year }
						const co2 = co2FromVolume( r )
						const co2Total = getFuelCO2( co2, 2 )
						scaleValues.min = scaleValues.min ? Math.min( scaleValues.min, co2Total ) : co2Total
						scaleValues.max = scaleValues.max ? Math.max( scaleValues.max, co2Total ) : co2Total
						if( r.projection ) {
							point[ 'co2_' + source.name + '_projection' ] = co2Total
							point[ 'co2_span_' + source.name + '_projection' ] = [
								co2.scope1.range[ 0 ] + co2.scope3.range[ 0 ],
								co2.scope1.range[ 1 ] + co2.scope3.range[ 1 ]
							]
						} else {
							point[ 'co2_' + source.name ] = co2Total
							point[ 'co2_span_' + source.name ] = [
								co2.scope1.range[ 0 ] + co2.scope3.range[ 0 ],
								co2.scope1.range[ 1 ] + co2.scope3.range[ 1 ]
							]
						}
						return point
					} )
			}
		} )
	} catch( e ) {
		console.log( e )
		return <Alert message="Error during unit conversion" description={e.message} showIcon type="error"/>
	}

	const interval = scaleValues.max - scaleValues.min
	scaleValues.min -= interval * 0.1
	scaleValues.max += interval * 0.1

	DEBUG && console.log( 'CountryProduction', { datasets, production } )

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

	// Don't try to render a chart until all data looks good
	if(
		!firstYear || !lastYear || !fossilFuelType
		|| !datasets?.[ 0 ]?.data?.length > 0
	)
		return <Alert message={texts?.make_selections} type="info" showIcon/>
	if( Number.isNaN( scaleValues.min ) || Number.isNaN( scaleValues.max ) )
		return (
			<Alert
				message={'Scale range calculation failed.'}
				description={JSON.stringify( scaleValues, null, 2 )}
				type="warning"
				showIcon
			/> )

	return (
		<Chart scale={scale} height={400} autoFit forceUpdate>
			<Tooltip shared/>

			{datasets.map( dataset => {
				DEBUG && console.log( 'CountryProduction', { scaleValues, dataset } )
				return (
					<View data={dataset.data} key={dataset.source.name}>
						<Area
							position={"year*" + 'co2_span_' + dataset.source.name}
						/>
						<Area
							position={"year*" + 'co2_span_' + dataset.source.name + '_projection'}
							color={'#ffb542'}
						/>

						<Line position={"year*" + 'co2_' + dataset.source.name}/>
						<Point
							position={"year*" + 'co2_' + dataset.source.name}
							size={3} shape="circle"
						/>

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
				)
			} )}
		</Chart>
	)
}
