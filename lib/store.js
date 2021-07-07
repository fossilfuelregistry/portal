import { applyMiddleware, createStore } from 'redux'
import { createWrapper, HYDRATE } from 'next-redux-wrapper'

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
	region: null,
	project: null,
	availableReserveSources: [],
	pGrade: null,
	cGrade: null
}

const bindMiddleware = ( middleware ) => {
	if( process.env.NODE_ENV !== 'production' ) {
		const { composeWithDevTools } = require( 'redux-devtools-extension' )
		return composeWithDevTools( applyMiddleware( ...middleware ) )
	}
	return applyMiddleware( ...middleware )
}

const reducer = ( state = initialState, action ) => {
	// console.log( 'REDUCER', action )
	switch( action.type ) {
		case HYDRATE:
			return { ...state,
				texts: action.payload.texts,
				language: action.payload.language,
				conversions: action.payload.conversions,
				allSources: action.payload.allSources
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

const initStore = context => {
	return createStore( reducer, bindMiddleware( [] ) )
}

export const wrapper = createWrapper( initStore, { debug: false } )
