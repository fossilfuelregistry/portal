import { useEffect } from 'react'
import Graph from 'graph-data-structure'
import { useSelector } from "react-redux"
import { getFullFuelType, getPreferredGrades, sumOfCO2 } from "components/CO2Forecast/calculate"
import { useApolloClient } from "@apollo/client"
import { GQL_countryCurrentProduction } from "queries/country"
import { notification } from "antd"
import settings from "../../settings"

const DEBUG = false

let fuelTypes = [ 'gas', 'oil', 'coal' ] // Start with generic types, is extended later from DB data.

// One graph per fully qualified fuel type contains the possible conversion paths for that fuel.
const graphs = {}
// The corresponding conversion factors are in the conversions object.
const conversions = {}

const _toUnit = c => c.toUnit + ( ( c.modifier?.length > 0 ) ? settings.fuelTypeSeparator + c.modifier : '' )

export const useConversionHooks = () => {
	const conversionConstants = useSelector( redux => redux.conversions )
	const gwp = useSelector( redux => redux.gwp )
	const stableProduction = useSelector( redux => redux.stableProduction )
	const apolloClient = useApolloClient()

	// Build unit graphs for all fuels.

	useEffect( () => {
		if( !( conversionConstants?.length > 0 ) ) return

		conversionConstants.forEach( c => {
			const fullFuelType = getFullFuelType( c )
			// Extend fuelTypes with this full type?
			if( !( c.fossilFuelType?.length > 0 ) || fuelTypes.includes( fullFuelType ) ) return
			fuelTypes.push( fullFuelType )
		} )
		DEBUG && console.log( fuelTypes )

		// Build one Graph() per fuel type
		fuelTypes.forEach( fuelType => {

			graphs[ fuelType ] = Graph()
			conversions[ fuelType ] = {}
			const thisFuelConversions = conversionConstants.filter( c => c.fullFuelType === fuelType || c.fossilFuelType === null )

			// Add all unique units as nodes
			const allUnits = {}
			thisFuelConversions.forEach( u => {
				allUnits[ u.fromUnit ] = true
				allUnits[ _toUnit( u ) ] = true
			} )
			Object.keys( allUnits ).forEach( u => graphs[ fuelType ].addNode( u ) )

			DEBUG && console.log( { fuelType, allUnits, thisFuelConversions } )

			thisFuelConversions.forEach( conv => {
				graphs[ fuelType ].addEdge( conv.fromUnit, _toUnit( conv ) )
				conversions[ fuelType ][ conv.fromUnit + '>' + _toUnit( conv ) ] = {
					factor: conv.factor,
					low: conv.low,
					high: conv.high,
					modifier: conv.modifier
				}
			} )
		} )
	}, [ conversionConstants?.length ] )

	const convertVolume = ( { volume, unit, fossilFuelType }, toUnit ) => {
		try {
			const graph = graphs[ fossilFuelType ]
			const conversion = conversions[ fossilFuelType ]

			const path = graph.shortestPath( unit, toUnit )

			let factor = 1, low = 1, high = 1

			for( let step = 1; step < path.length; step++ ) {
				const from = path[ step - 1 ]
				const to = path[ step ]
				const conv = conversion[ from + '>' + to ]

				if( !conv ) throw new Error(
					`Conversion data issue: From ${ from } to ${ to } for ${ fossilFuelType } is ${ JSON.stringify( conv ) }` )

				factor *= conv.factor
				low *= conv.low
				high *= conv.high
			}

			return factor * volume
		} catch( e ) {
			console.log( e.message + ': ' + unit, toUnit )
			return volume
		}
	}

	const _co2Factors = ( unit, toUnit, fullFuelType ) => {
		const graph = graphs[ fullFuelType ]
		const conversion = conversions[ fullFuelType ]
		if( !graph ) throw new Error( 'No conversion graph for ' + fullFuelType )
		if( !conversion ) throw new Error( 'No conversion factors for ' + fullFuelType )

		const path = graph.shortestPath( unit, toUnit )
		DEBUG && console.log( 'Path ', { unit, toUnit, path, conversion } )

		let factor = 1, low = 1, high = 1
		for( let step = 1; step < path.length; step++ ) {
			const from = path[ step - 1 ]
			const to = path[ step ]
			const conv = conversion[ from + '>' + to ]

			if( !conv ) throw new Error(
				`Conversion data issue: From ${ from } to ${ to } for ${ fullFuelType } is ${ JSON.stringify( conv ) }` )
			const { factor: stepFactor, low: stepLow, high: stepHigh } = conv

			factor *= stepFactor
			low *= stepLow ?? stepFactor
			high *= stepHigh ?? stepFactor
		}
		return { low, high, factor }
	}

	const co2FromVolume = ( { volume, unit, fossilFuelType, subtype, methaneM3Ton }, log ) => {
		const fullFuelType = getFullFuelType( { fossilFuelType, subtype } )
		const graph = graphs[ fullFuelType ]
		if( !graph ) return { low: 0, high: 0, factor: 0 }

		let scope1 = {}, scope3
		const toUnit = 'kgco2e' + settings.fuelTypeSeparator + gwp

		try {
			scope1 = _co2Factors( unit, toUnit, fullFuelType )
		} catch( e ) {
			console.log( `Scope 1 ${ toUnit } Conversion Error:  ${ e.message }`, {
				unit, toUnit,
				fullFuelType,
				graph: graph.serialize()
			} )
		}

		try {
			scope3 = _co2Factors( unit, 'kgco2e', fullFuelType )
		} catch( e ) {
			if( console.trace ) console.trace()
			console.log( 'Conversion to kgco2e Error: ' + e.message, { unit, fullFuelType, graph: graph.serialize() } )
			throw new Error( "While looking for " + fullFuelType + ' ' + unit + " -> kgco2e conversion:\n" + e.message )
		}

		DEBUG && console.log( 'CO2 Factors:', { scope1, scope3, methaneM3Ton } )

		let volume1 = volume
		if( methaneM3Ton > 0 ) {
			// Calculate Scope1 for sparse project from production volume
			const e6ProductionTons = convertVolume( { volume, unit, fossilFuelType }, 'e6ton' )
			const e6m3Methane = e6ProductionTons * methaneM3Ton
			const e6feet3Methane = e6m3Methane * 35.31 * 200 // XXX XXX XXX
			volume1 = e6feet3Methane / 379.3 / 2.2 // SCF feet3 -> lb -> kg gives us e3ton

			// Get new factors for gas
			try {
				scope1 = _co2Factors( 'e3ton', toUnit, 'gas' )
			} catch( e ) {
				console.log( `Scope 1 ${ toUnit } Project gas equiv  conversion error:  ${ e.message }`, {
					unit, toUnit, graphs,
					graph: graph.serialize()
				} )
			}

			DEBUG && console.log( 'Project Specific Scope1:', {
				scope1,
				volume,
				e6ProductionTons,
				methaneM3Ton,
				e6m3Methane,
				volume1,
				kgco2e: volume1 * scope1.factor
			} )
		}

		const result = {
			scope1: [ volume1 * ( scope1.low || 0 ) / 1e9, volume1 * ( scope1.factor || 0 ) / 1e9, volume1 * ( scope1.high || 0 ) / 1e9 ],
			scope3: [ volume * scope3.low / 1e9, volume * scope3.factor / 1e9, volume * scope3.high / 1e9 ]
		}

		DEBUG && console.log( '.....co2', { result, scope1, volume1 } )
		return result
	}

	const reservesProduction =
		( projection, reserves, projectionSourceId, reservesSourceId, limits, grades ) => {
			DEBUG && console.log( 'reservesProduction', {
				projection,
				reserves,
				projectionSourceId,
				reservesSourceId,
				limits,
				grades
			} )
			if( !projectionSourceId ) return []
			if( !projection || projection.length < 1 ) return []
			if( !limits?.production ) return []
			if( !limits?.projection ) return []

			// Find most recent preferred reserve

			const useGrades = getPreferredGrades( reserves, reservesSourceId )
			const lastReserves = {
				oil: { p: { year: 0, value: 0 }, c: { year: 0, value: 0 } },
				gas: { p: { year: 0, value: 0 }, c: { year: 0, value: 0 } }
			}
			for( let i = reserves.length - 1; i >= 0; i-- ) { // Scan in reverse to find latest.
				const r = reserves[ i ]
				if( r.sourceId !== reservesSourceId ) continue
				if( r.grade !== useGrades.pGrade && r.grade !== useGrades.cGrade ) continue
				const grade = r.grade[ 1 ] // Disregard first character.
				if( r.year < lastReserves[ r.fossilFuelType ][ grade ].year ) continue
				lastReserves[ r.fossilFuelType ][ grade ].year = r.year
				lastReserves[ r.fossilFuelType ][ grade ].value = sumOfCO2( co2FromVolume( r ), 1 )
			}
			DEBUG && console.log( { reservesSourceId, useGrades, lastReserves } )

			let prod = []

			// Fill out gap between production and projection (if any)
			const gapStart = Math.min( limits.production.oil.lastYear, limits.production.gas.lastYear )
			const gapEnd = Math.max( limits.projection.oil.firstYear, limits.projection.gas.firstYear, gapStart )
			for( let y = gapStart; y < gapEnd; y++ ) {
				if( limits.production.oil.lastYear <= y )
					prod.push( {
						...stableProduction.oil,
						year: y,
						fossilFuelType: 'oil',
						sourceId: projectionSourceId
					} )
				if( limits.production.gas.lastYear <= y )
					prod.push( {
						...stableProduction.gas,
						year: y,
						fossilFuelType: 'gas',
						sourceId: projectionSourceId
					} )
			}

			prod.forEach( datapoint => {
				if( !datapoint.volume || !datapoint.unit ) {
					console.log( { prod } )
					throw new Error( 'Malformed production data point: ' + JSON.stringify( datapoint ) )
				}
				return datapoint.co2 = co2FromVolume( datapoint )
			} )

			projection.forEach( datapoint => {
				if( datapoint.sourceId !== projectionSourceId ) return
				if( datapoint.year < gapEnd ) return
				if( !datapoint.volume || !datapoint.unit ) {
					console.log( { projection } )
					throw new Error( 'Malformed projection data point: ' + JSON.stringify( datapoint ) )
				}

				let _dp = { ...datapoint }
				_dp.co2 = co2FromVolume( datapoint )

				const pointProduction = sumOfCO2( _dp.co2, 1 )
				_dp.plannedProd = 0
				_dp.continProd = 0

				const fuelReserve = lastReserves[ datapoint.fossilFuelType ]

				// Subtract production from planned reserves first, then from contingent.

				if( fuelReserve.p.value > pointProduction ) {
					_dp.plannedProd = pointProduction
					fuelReserve.p.value -= _dp.plannedProd
				} else if( fuelReserve.p.value > 0 ) {
					_dp.continProd = pointProduction - fuelReserve.p.value
					_dp.plannedProd = fuelReserve.p.value
					fuelReserve.p.value = 0
					if( _dp.continProd > fuelReserve.c.value ) _dp.continProd = fuelReserve.c.value
					fuelReserve.c.value -= _dp.continProd
				} else if( fuelReserve.c.value > 0 ) {
					_dp.plannedProd = 0
					_dp.continProd = Math.min( fuelReserve.c.value, pointProduction )
					fuelReserve.c.value -= _dp.continProd
				}
				prod.push( _dp )
			} )

			DEBUG && console.log( { gapStart, gapEnd, prod, lastReserves } )

			return prod
		}

	const getCountryCurrentCO2 = async iso3166 => {
		if( !iso3166 ) return 0

		try {
			const q = await apolloClient.query( {
				query: GQL_countryCurrentProduction,
				variables: { iso3166 }
			} )
			const prod = q.data?.getCountryCurrentProduction?.nodes ?? []
			const principal = prod.filter( p => p.sourceId === settings.principalProductionSourceId[ p.fossilFuelType ] )
			DEBUG && console.log( { principal } )
			let co2 = {}, total = 0
			principal.forEach( p => {
				DEBUG && console.log( co2 )
				const calc = co2FromVolume( p )
				DEBUG && console.log( { calc, p } )
				if( !co2[ p.fossilFuelType ] ) co2[ p.fossilFuelType ] = 0
				co2[ p.fossilFuelType ] += calc.scope1[ 1 ] + calc.scope3[ 1 ]
				total += calc.scope1[ 1 ] + calc.scope3[ 1 ]
			} )
			co2.total = total
			DEBUG && console.log( 'Country Production', co2 )
			return co2
		} catch( e ) {
			notification.error( {
				message: 'Failed to fetch country production',
				description: e.message,
				duration: 20
			} )
		}
	}

	return { co2FromVolume, convertVolume, reservesProduction, getCountryCurrentCO2 }
}
