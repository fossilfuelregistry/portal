import { wrapper } from 'lib/store'
import { GQL_conversions, GQL_productionCountries, GQL_sources, SQL_co2costs } from "queries/general"
import NodeCache from "node-cache"
import { getFullFuelType } from "components/CO2Forecast/calculate"

const myCache = new NodeCache()

export async function getStandaloneApolloClient() {
	const { ApolloClient, InMemoryCache, createHttpLink } = await import( "@apollo/client" )
	const client = new ApolloClient( {
		ssrMode: true,
		link: createHttpLink( {
			uri: process.env.NEXT_PUBLIC_BACKEND_URL + '/graphql'
		} ),
		cache: new InMemoryCache()
	} )
	return client
}

async function getI18nTexts( locale ) {
	if( myCache.get( locale ) ) return myCache.get( locale )

	const formData = new URLSearchParams()
	formData.append( 'api_token', process.env.POEDITOR_API_TOKEN )
	formData.append( 'id', process.env.POEDITOR_PROJECT_ID )
	formData.append( 'language', locale )

	const res = await fetch( `https://api.poeditor.com/v2/terms/list`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: formData
	} )
	const data = await res.json()
	const fullTerms = data?.result?.terms ?? []
	let terms = {}
	fullTerms.forEach( term => terms[ term.term ] = term.translation.content )

	myCache.set( locale, terms, 300 )
	return terms
}

async function getConversions() {

	if( myCache.get( 'conversions' ) ) return myCache.get( 'conversions' )

	const client = await getStandaloneApolloClient()
	const q = await client.query( { query: GQL_conversions } )
	const constants = q?.data?.conversionConstants?.nodes ?? []
	const conversions = constants.map( c => {
		const _c = { ...c }
		_c.fullFuelType = getFullFuelType( c )
		delete _c.__typename
		return _c
	} )
	myCache.set( 'conversions', conversions, 300 )
	return conversions
}

export async function getProducingCountries() {

	if( myCache.get( 'countries' ) ) return myCache.get( 'countries' )

	const client = await getStandaloneApolloClient()
	const q = await client.query( { query: GQL_productionCountries } )
	const _countries = q?.data?.getProducingIso3166?.nodes ?? []
	const countries = _countries.map( c => {
		const _c = { ...c }
		delete _c.__typename
		return _c
	} )
	myCache.set( 'countries', countries, 300 )
	return countries
}

async function getSources() {

	if( myCache.get( 'sources' ) ) return myCache.get( 'sources' )

	const client = await getStandaloneApolloClient()
	const q = await client.query( { query: GQL_sources } )
	const _sources = q?.data?.sources?.nodes ?? []
	const sources = _sources.map( c => {
		const _c = { ...c }
		delete _c.__typename
		return _c
	} )
	myCache.set( 'sources', sources, 300 )
	return sources
}

async function getCO2Costs() {
	if( myCache.get( 'co2Costs' ) ) return myCache.get( 'co2Costs' )

	const client = await getStandaloneApolloClient()
	const q = await client.query( { query: SQL_co2costs } )
	const _co2Costs = q?.data?.co2Costs?.nodes ?? []
	const co2Costs = _co2Costs.map( c => {
		const _c = { ...c }
		delete _c.__typename
		return _c
	} )
	myCache.set( 'co2Costs', co2Costs, 300 )
	return co2Costs
}

export const getStaticProps = wrapper.getStaticProps( store =>
	async props => {
		const { locale } = props
		try {
			const texts = await getI18nTexts( locale )
			await store.dispatch( { type: 'TEXTS', payload: texts } )
			await store.dispatch( { type: 'CONVERSIONS', payload: ( await getConversions() ) || [] } )
			await store.dispatch( { type: 'ALLSOURCES', payload: ( await getSources() ) || [] } )
			await store.dispatch( { type: 'LANGUAGE', payload: locale } )
			await store.dispatch( { type: 'CO2COSTS', payload: ( await getCO2Costs() || [] ) } )
			return { revalidate: 60 }
		} catch( e ) {
			console.info( "getStaticProps", e.message )
		}
	}
)
