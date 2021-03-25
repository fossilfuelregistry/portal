import { useContext, useState } from "react"
import { Button } from 'antd'
import NavigDrawer from "../components/navigation/NavigDrawer"
import I18nContext from "../components/i18nContext"
import { CgMenu } from 'react-icons/cg'
import getConfig from 'next/config'

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

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

export default function Home( props ) {
	const i18n = useContext( I18nContext )
	const [ visible, setVisible ] = useState( false )
	const showDrawer = () => {
		setVisible( true )
	}
	const onClose = () => {
		setVisible( false )
	}

	return (
		<div className="navigation">
			<CgMenu onClick={showDrawer}/>
			<NavigDrawer visible={visible} onClose={onClose}/>

			<style jsx>{`
              .navigation {
                padding: 40px;
                font-size: 32px;
              }

              @media (max-width: ${theme[ '@screen-sm' ]}) {
                .navigation {
                  padding: 16px 24px;
                }
              }
			`}</style>

		</div>
	)
}

export async function getStaticProps( { locale, preview = false } ) {
	const texts = ( await geti18nTexts( locale ) ) || []
	return {
		props: { texts, preview }
	}
}
