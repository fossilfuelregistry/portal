import { useEffect, useRef, useState } from "react"
import TopNavigation from "components/navigation/TopNavigation"
import { conversionsSelector, useStore } from "lib/zustandProvider"

const DEBUG = false

export default function Wells( props ) {
	const conversion = useStore( conversionsSelector )

	const [ map, set_map ] = useState()
	const heatmap = useRef()

	useEffect( () => {
	}, [] )

	return (
		<div className="page">
			<TopNavigation/>

			<div className="map" />

			<style jsx>{`
			`}
			</style>

		</div>
	)
}

export { getStaticProps } from '../lib/getStaticProps'