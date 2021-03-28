import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

export default function Home( props ) {
	return (
		<div className="page">
			<TopNavigation/>
			<h1>Home</h1>
			<style jsx>{`
              @media (max-width: ${theme[ '@screen-sm' ]}) {
              }
			`}
			</style>

		</div>
	)
}

export { getStaticProps } from '../lib/getStaticProps'
