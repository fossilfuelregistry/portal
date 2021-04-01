import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'
import dynamic from "next/dynamic"
import { Slider } from "antd"
import { useCallback, useState } from "react"

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const GlobeNoSSR = dynamic( () => import( "components/geo/GlobeNoSSR" ),
	{ ssr: false } )

export default function Home() {
	const [ year, set_year ] = useState( 2019 )
	const handleChange = useCallback( event => {
		set_year( event )
	}, [] )

	return (
		<div className="page">

			<TopNavigation/>

			<div className="content-block globe-controls">
				<Slider
					trackStyle={{ height: '12px' }}
					railStyle={{ height: '12px' }}
					handleStyle={{ height: '22px', width: '22px' }}
					tooltipVisible={true}
					min={2010}
					max={2021}
					onChange={handleChange}
					value={year}
				/>
			</div>

			<div className="content-block">
				<GlobeNoSSR year={year}/>
			</div>

			<style jsx>{`
              @media (max-width: ${theme[ '@screen-sm' ]}) {
              }
			`}
			</style>

		</div>
	)
}

export { getStaticProps } from '../lib/getStaticProps'
