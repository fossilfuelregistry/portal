import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'
import dynamic from "next/dynamic"

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const GlobeNoSSR = dynamic( () => import( "components/geo/GlobeNoSSR" ),
	{ ssr: false } )

export default function Home( props ) {
	return (
		<div className="page">

			<TopNavigation/>

			<GlobeNoSSR/>

			<style jsx>{`
              @media (max-width: ${theme[ '@screen-sm' ]}) {
              }
			`}
			</style>

		</div>
	)
}

export { getStaticProps } from '../lib/getStaticProps'
