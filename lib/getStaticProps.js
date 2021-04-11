import { initializeStore } from 'lib/store'
import { client } from 'pages/_app'
import { GQL_conversions } from "queries/general"

async function geti18nTexts( locale ) {
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
	const q = await client.query( { query: GQL_conversions } )
	return q?.data?.conversionConstants?.nodes
}

export async function getStaticProps( props ) {
	const { locale, preview = false } = props
	const texts = ( await geti18nTexts( locale ) ) || []
	const conversions = ( await getConversions() ) || []
	const zustandStore = initializeStore( { texts, conversions: conversions } )
	return {
		props: { initialZustandState: JSON.stringify( zustandStore.getState() ), preview }
	}
}
