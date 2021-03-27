import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'
import { ipSelector, textsSelector, useStore } from "lib/zustandProvider"

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

export default function Wells( props ) {
	const texts = useStore( textsSelector )
	const ip = useStore( ipSelector )

	return (
		<div className="page">
			<TopNavigation/>
			<h1>{texts.wells}</h1>
			<h4>IP {ip}</h4>
			<style jsx>{`
              @media (max-width: ${theme[ '@screen-sm' ]}) {
              }
			`}</style>

		</div>
	)
}

export { getStaticProps } from '../lib/getStaticProps'
