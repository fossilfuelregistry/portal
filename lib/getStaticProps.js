import { initializeStore } from 'lib/store'

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

export async function getStaticProps( { locale, preview = false } ) {
	const texts = ( await geti18nTexts( locale ) ) || []
	const zustandStore = initializeStore( { texts } )
	return {
		props: { initialZustandState: JSON.stringify( zustandStore.getState() ), preview }
	}
}
