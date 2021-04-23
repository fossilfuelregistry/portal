import { wrapper } from 'lib/store'

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

export const getStaticProps = wrapper.getStaticProps( async props => {
	const { locale, preview = false, store } = props
	const texts = ( await getI18nTexts( locale ) ) || []
	store.dispatch( { type: 'TEXTS', payload: texts } )
}
)
