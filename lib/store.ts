import React from "react"
import { applyMiddleware, createStore } from 'redux'
import { createWrapper, HYDRATE } from 'next-redux-wrapper'
import { Store } from "./types"

let hydrated = false

const initialState: Store = {
	ip: null,
	ipLocation: {},
	texts: {},
	allSources: [],
	gwp: 'GWP100',
	stableProduction: null,
	reservesSourceId: null,
	productionSourceId: null,
	projectionSourceId: null,
	futureEmissionTotals: {},
	conversions: [],
	country: null,
	countryName: null,
	region: null,
	project: {},
	projectGeo: null,
	availableReserveSources: [],
	pGrade: null,
	cGrade: null,
	countryTotalCO2: null,
	co2CostPerTon: null, // null || { source: null, currency: 'USD',cost: 100},
	co2Costs: [],
	showCostInGraphs: false,
	sourcesWithData: [],
	locale: typeof window !== 'undefined' ? window?.navigator?.userLanguage || window?.navigator?.language || 'en-US' : "en-US",
	language: null
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

	let urlParams = {}

	// On initial hydrate we initialize state from URL.
	if( typeof window !== 'undefined' && action.type === HYDRATE && !hydrated ) {
		const params = [ 'region', 'project', 'productionSourceId', 'projectionSourceId', 'reservesSourceId', 'gwp' ]
		const query = new URLSearchParams( window?.location?.search )

		params.forEach( p => {
			if( p.includes( 'Id' ) )
				urlParams[ p ] = parseInt( query.get( p ) )
			else
				urlParams[ p ] = query.get( p )
		} )
	}

	switch( action.type ) {
		case HYDRATE:

			// Subsequent hydrates after initial are only for language switches, leave rest of app
			// state as is.
			if( hydrated ) {
				return {
					...state,
					texts: action.payload.texts,
				}
			}

			hydrated = true
			return {
				...state,
				texts: action.payload.texts,
				language: action.payload.language,
				conversions: action.payload.conversions,
				allSources: action.payload.allSources,
				country: null,
				region: urlParams.region,
				project: 'loading', // Project needs to be set once data loaded.
				gwp: urlParams.gwp ?? 'GWP100',
				productionSourceId: urlParams.productionSourceId,
				projectionSourceId: urlParams.projectionSourceId,
				reservesSourceId: urlParams.reservesSourceId,
				co2Costs: action.payload.co2Costs,
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
		case 'PROJECTGEO':
			return { ...state, projectGeo: action.payload }
		case 'FUTUREEMISSIONTOTALS':
			return { ...state, futureEmissionTotals: action.payload }
		case 'COUNTRY':
			return { ...state, country: action.payload }
		case 'COUNTRYNAME':
			return { ...state, countryName: action.payload }
		case 'REGION':
			return { ...state, region: action.payload }
		case 'PROJECT':
			//console.info( action )
			//console.trace()
			return { ...state, project: action.payload }
		case 'PGRADE':
			return { ...state, pGrade: action.payload }
		case 'CGRADE':
			return { ...state, cGrade: action.payload }
		case 'AVAILABLERESERVESOURCES':
			return { ...state, availableReserveSources: action.payload }
		case 'COUNTRYTOTALCO2':
			return { ...state, countryTotalCO2: action.payload }
		case 'CO2COSTPERTON': 
			return { ...state, co2CostPerTon: action.payload }
		case 'SHOWCOSTINGRAPHS': 
			return { ...state, showCostInGraphs: action.payload }
		case 'CO2COSTS':
			return { ...state, co2Costs: action.payload }
		case 'SOURCESWITHDATA':
			return { ...state, sourcesWithData: action.payload }
		default:
			return state
	}
}

const makeStore = context => {
	const redux_store = createStore( reducer, bindMiddleware( [] ) )
	if( typeof global !== 'undefined' ) global.redux_store = redux_store
	return redux_store
}

export const wrapper = createWrapper( makeStore, { debug: false } )

