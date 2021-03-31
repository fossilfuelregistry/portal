import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'
import dynamic from "next/dynamic"

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const GlobeNoSSR = dynamic( () => import( "react-globe.gl" ),
	{ ssr: false } )

export default function Home( props ) {
	return (
		<div className="page">
			<TopNavigation/>
			<GlobeNoSSR
				backgroundColor="#ffffff"
				globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
			/>
			<style jsx>{`
              @media (max-width: ${theme[ '@screen-sm' ]}) {
              }
			`}
			</style>

		</div>
	)
}

export { getStaticProps } from '../lib/getStaticProps'
