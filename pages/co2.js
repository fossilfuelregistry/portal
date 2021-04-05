import { useState } from "react"
import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'
import { textsSelector, useStore } from "lib/zustandProvider"
import dynamic from 'next/dynamic'

const DEBUG = false

const theme = getConfig()?.publicRuntimeConfig?.themeVariables
const MultiView = dynamic( () => import( "components/viz/MutliViewChart" ), { ssr: false } )

export default function Wells( props ) {
	const texts = useStore( textsSelector )
	const [ map, set_map ] = useState()

	return (
		<>
			<div className="page">
				<TopNavigation/>

				<div className="table">
					<div className="table-cell" style={{ width: '50%' }}><MultiView/></div>
					<div className="table-cell" style={{ width: '50%' }}><MultiView future={true}/></div>
				</div>

				<style jsx>{`
				`}
				</style>

			</div>
		</>
	)
}

export { getStaticProps } from '../lib/getStaticProps'
