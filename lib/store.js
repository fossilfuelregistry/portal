import { applyMiddleware, createStore } from 'redux'
import { createWrapper, HYDRATE } from 'next-redux-wrapper'

let hydrated = false

const initialState = {
	ip: null,
	ipLocation: {},
	texts: {},
	allSources: [],
	gwp: 'kgco2e_100',
	stableProduction: null,
	reservesSourceId: null,
	productionSourceId: null,
	projectionSourceId: null,
	futureEmissionTotals: {},
	conversions: [],
	country: null,
	countryName: null,
	region: null,
	project: null,
	availableReserveSources: [],
	pGrade: null,
	cGrade: null
}

const bindMiddleware = ( middleware ) => {
	if( process.env.NODE_ENV !== 'production' ) {
		const { composeWithDevTools } = require( 'redux-devtools-extension' )
		const enhancer = composeWithDevTools( { trace: true } )
		return enhancer( applyMiddleware( ...middleware ) )
	}
	return applyMiddleware( ...middleware )
}

const reducer = ( state = initialState, action ) => {

	// Only hydrate once.
	// if( hydrated && action.type === HYDRATE ) {
	// 	return state
	// }

	let urlParams = {}

	if( typeof window !== 'undefined' && action.type === HYDRATE ) {
		const params = [ 'region', 'project', 'productionSourceId', 'projectionSourceId', 'reservesSourceId' ]
		const query = new URLSearchParams( window?.location?.search )

		params.forEach( p => {
			if( p.includes( 'Id' ) )
				urlParams[ p ] = parseInt( query.get( p ) )
			else
				urlParams[ p ] = query.get( p )
		} )
	}

	//if( typeof window === 'undefined' ) console.log( 'REDUCE', action )

	switch( action.type ) {
		case HYDRATE:
			//console.log( 'HYDRATE', Object.keys( action?.payload?.texts )?.length )
			hydrated = true
			return {
				...state,
				texts: action.payload.texts,
				language: action.payload.language,
				conversions: action.payload.conversions,
				allSources: action.payload.allSources,
				country: null,
				region: urlParams.region,
				project: urlParams.project,
				productionSourceId: urlParams.productionSourceId,
				projectionSourceId: urlParams.projectionSourceId,
				reservesSourceId: urlParams.reservesSourceId
			}
		case 'IP':
			return { ...state, ip: action.payload }
		case 'IPLOCATION':
			return { ...state, ipLocation: action.payload }
		case 'TEXTS':
			return { ...state, texts: action.payload }
		case 'LANGUAGE':
			return { ...state, language: action.payload }
		case 'ALLSOURCES':
			return { ...state, allSources: action.payload }
		case 'CONVERSIONS':
			return { ...state, conversions: action.payload }
		case 'GWP':
			return { ...state, gwp: action.payload }
		case 'STABLEPRODUCTION':
			return { ...state, stableProduction: action.payload }
		case 'RESERVESSOURCEID':
			return { ...state, reservesSourceId: action.payload }
		case 'PRODUCTIONSOURCEID':
			return { ...state, productionSourceId: action.payload }
		case 'PROJECTIONSOURCEID':
			return { ...state, projectionSourceId: action.payload }
		case 'FUTUREEMISSIONTOTALS':
			return { ...state, futureEmissionTotals: action.payload }
		case 'COUNTRY':
			return { ...state, country: action.payload }
		case 'COUNTRYNAME':
			return { ...state, countryName: action.payload }
		case 'REGION':
			return { ...state, region: action.payload }
		case 'PROJECT':
			return { ...state, project: action.payload }
		case 'PGRADE':
			return { ...state, pGrade: action.payload }
		case 'CGRADE':
			return { ...state, cGrade: action.payload }
		case 'AVAILABLERESERVESOURCES':
			return { ...state, availableReserveSources: action.payload }
		default:
			return state
	}
}

const makeStore = context => createStore( reducer, bindMiddleware( [] ) )

export const wrapper = createWrapper( makeStore, { debug: false } )
