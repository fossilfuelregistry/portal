import { wrapper } from 'lib/store'
import { GQL_conversions, GQL_productionCountries, GQL_sources } from "queries/general"

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
	return terms
}

async function getConversions() {
	const client = await getStandaloneApolloClient()
	const q = await client.query( { query: GQL_conversions } )
	const constants = q?.data?.conversionConstants?.nodes ?? []
	return constants.map( c => {
		const _c = { ...c }
		delete _c.__typename
		return _c
	} )
}

export async function getProducingCountries() {
	const client = await getStandaloneApolloClient()
	const q = await client.query( { query: GQL_productionCountries } )
	const constants = q?.data?.getProducingIso3166?.nodes ?? []
	return constants.map( c => {
		const _c = { ...c }
		delete _c.__typename
		return _c
	} )
}

async function getSources() {
	const client = await getStandaloneApolloClient()
	const q = await client.query( { query: GQL_sources } )
	const sources = q?.data?.sources?.nodes ?? []
	return sources.map( c => {
		const _c = { ...c }
		delete _c.__typename
		return _c
	} )
}

export const getStaticProps = wrapper.getStaticProps( store =>
	async props => {
		const { locale } = props
		try {
			store.dispatch( { type: 'TEXTS', payload: ( await getI18nTexts( locale ) ) || [] } )
			store.dispatch( { type: 'CONVERSIONS', payload: ( await getConversions() ) || [] } )
			store.dispatch( { type: 'ALLSOURCES', payload: ( await getSources() ) || [] } )
			store.dispatch( { type: 'LANGUAGE', payload: locale } )
		} catch( e ) {
			console.log( "getStaticProps", e.message )
		}
	}
)
