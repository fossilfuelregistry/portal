import settings from "settings"

export function addToTotal( total, datapoint ) {
	if( !total ) {
		console.trace()
		throw new Error( 'Calculation problem, addToTotal( undefined, ... )' )
	}
	const scopes = Object.keys( datapoint )
	if( !scopes?.length ) return
	const ranges = Object.keys( datapoint[ scopes[ 0 ] ] )

	scopes.forEach( scope => {
		ranges?.forEach( range => {
			if( !total[ scope ] ) total[ scope ] = []
			if( !total[ scope ][ range ] ) total[ scope ] [ range ] = 0
			total[ scope ][ range ] += datapoint[ scope ][ range ]
		} )
	} )
}

function _sumOfFuelCO2( fuel, range ) {
	try {
		return fuel.scope1?.[ range ] + fuel.scope3?.[ range ]
	} catch( e ) {
		console.log( fuel )
		console.trace()
		throw new Error( e.message + '\nCannot calculate CO2 of ' + JSON.stringify( fuel ) )
	}
}

export function sumOfCO2( datapoint, range ) {
	if( !datapoint ) {
		console.trace()
		return
	}
	if( datapoint.scope1 || datapoint.scope3 )
		return _sumOfFuelCO2( datapoint, range )

	let co2 = 0
	settings.supportedFuels.forEach( fuel => {
		if( datapoint[ fuel ] )
			co2 += _sumOfFuelCO2( datapoint[ fuel ], range )
	} )
	return co2
}

export function __sumOfCO2( datapoint, range ) {
	if( datapoint.oil ) {
		return _sumOfFuelCO2( datapoint.oil, range ) + _sumOfFuelCO2( datapoint.gas, range )
	} else {
		return _sumOfFuelCO2( datapoint, range )
	}
}

export function combineOilAndGas( dataset ) {
	let newDataset = []
	let nextCombinedPoint = { year: 0 }

	dataset.forEach( d => {
		if( nextCombinedPoint.year !== d.year ) {
			if( nextCombinedPoint.year !== 0 ) newDataset.push( nextCombinedPoint )
			nextCombinedPoint = { year: d.year }
		}
		nextCombinedPoint[ d.fossilFuelType ] = d
	} )
	newDataset.push( nextCombinedPoint )
	return newDataset
}

export function getPreferredGrades( reserves, reservesSourceId ) {
	let pGrade = -1, cGrade = -1

	reserves.forEach( r => {
		if( r.sourceId !== reservesSourceId ) return
		if( r.grade?.[ 1 ] === 'p' ) {
			pGrade = Math.max( pGrade, settings.gradesPreferenceOrder.indexOf( r.grade?.[ 0 ] ) )
		}
		if( r.grade?.[ 1 ] === 'c' ) {
			cGrade = Math.max( cGrade, settings.gradesPreferenceOrder.indexOf( r.grade?.[ 0 ] ) )
		}
	} )
	if( pGrade < 0 ) pGrade = '--'
	else pGrade = settings.gradesPreferenceOrder[ pGrade ] + 'p'
	if( cGrade < 0 ) cGrade = '--'
	else cGrade = settings.gradesPreferenceOrder[ cGrade ] + 'c'
	return { pGrade, cGrade }
}

// Get pref grade from the aggregated string in the get_reserves_sources backend function
export function getPreferredReserveGrade( grades ) {
	if( !( grades?.length > 0 ) ) return ''
	let pGrade = -1, cGrade = -1
	grades.forEach( grade => {
		if( grade?.[ 1 ] === 'p' ) {
			pGrade = Math.max( pGrade, settings.gradesPreferenceOrder.indexOf( grade?.[ 0 ] ) )
		}
		if( grade?.[ 1 ] === 'c' ) {
			cGrade = Math.max( cGrade, settings.gradesPreferenceOrder.indexOf( grade?.[ 0 ] ) )
		}
	} )
	if( pGrade < 0 ) pGrade = '--'
	else pGrade = settings.gradesPreferenceOrder[ pGrade ] + 'p'
	if( cGrade < 0 ) cGrade = '--'
	else cGrade = settings.gradesPreferenceOrder[ cGrade ] + 'c'

	return pGrade + '/' + cGrade
}

export async function co2PageUpdateQuery( store, router, parameter, value ) {
	const params = [ 'region', 'productionSourceId', 'projectionSourceId', 'reservesSourceId' ]
	const DEBUG = false
	const query = new URLSearchParams()
	const state = store.getState()

	params.forEach( p => {
		const v = state[ p ]
		if( !v ) return
		query.set( p, v )
	} )

	if( state.project === 'loading' && router.query.project?.length > 0 )
		query.set( 'project', router.query.project )
	else if( state.project?.projectIdentifier )
		query.set( 'project', state.project?.projectIdentifier )

	DEBUG && console.log( 'URL', parameter, '->', { value, router, query, state } )

	if( value !== undefined )
		query.set( parameter, value )
	else if( typeof parameter == 'string' )
		query.delete( parameter )
	else if( typeof parameter == 'object' ) {
		Object.keys( parameter ).forEach( p => {
			if( p === 'country' ) return // Handled below, goes to path instead of query
			if( parameter[ p ] === undefined ) query.delete( p )
			else query.set( p, parameter[ p ] )
		} )
	}

	let url = ''
	if( router.locale !== router.defaultLocale ) url += '/' + router.locale
	url += router.pathname.replace( /\[country\]/, state.country ) + '?' + query.toString()
	DEBUG && console.log( 'URL <<<', router.asPath )
	if( url === router.asPath ) return
	DEBUG && console.log( 'URL >>>', url )

	await router.replace( url, null, { shallow: true } )
}

export function getFullFuelType( datapoint ) {
	let fullFuelType = datapoint.fossilFuelType
	if( datapoint.fossilFuelType?.length > 0 )
		fullFuelType = datapoint.fossilFuelType + ( datapoint.subtype?.length > 0 ? settings.fuelTypeSeparator + datapoint.subtype : '' )
	//console.log( 'fullFuelType', fullFuelType )
	return fullFuelType
}

export function prepareProductionDataset( dataset ) {

	const onlySupportedFuelPoints = dataset.filter( datapoint => settings.supportedFuels.includes( datapoint.fossilFuelType ) )

	// Now squash multiple year entries into one.
	const singlePointPerYear = []
	let aggregatePoint

	onlySupportedFuelPoints.forEach( datapoint => {
		if( !aggregatePoint ) {
			aggregatePoint = { ...datapoint }
			return
		}
		if( aggregatePoint.year !== datapoint.year
			|| aggregatePoint.fossilFuelType !== datapoint.fossilFuelType
			|| aggregatePoint.sourceId !== datapoint.sourceId ) {
			singlePointPerYear.push( aggregatePoint )
			aggregatePoint = { ...datapoint }
			return
		}

		if( aggregatePoint.unit !== datapoint.unit ) {
			console.log( { aggregatePoint, datapoint } )
			throw new Error( 'Multiple data points for same fuel / source / year cannot have different units.' )
		}

		//console.log( 'Aggregating', { aggregatePoint, datapoint } )
		aggregatePoint.subtype = null
		aggregatePoint.volume += datapoint.volume
	} )

	singlePointPerYear.push( aggregatePoint )

	singlePointPerYear.forEach( datapoint => {
		if( !datapoint ) return
		delete datapoint.__typename
	} )

	return singlePointPerYear
}