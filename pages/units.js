import { useEffect, useRef, useState } from "react"
import { DataSet, Network } from 'vis-network/standalone/umd/vis-network.min'
import TopNavigation from "components/navigation/TopNavigation"
import { conversionsSelector, useStore } from "lib/zustandProvider"

const DEBUG = false

export default function Units() {
	const conversion = useStore( conversionsSelector )

	const [ map, set_map ] = useState()
	const domRef = useRef()

	useEffect( () => {
		// Find unique units
		const allUnits = {}
		conversion.forEach( u => {
			allUnits[ u.fromUnit ] = true
			allUnits[ u.toUnit ] = true
		} )

		const nodes = new DataSet( Object.keys( allUnits ).map( unitName => {
			return { id: unitName, label: unitName, font: '26px' }
		} ) )

		// create an array with edges
		const edges = new DataSet( conversion.map( conv => {
			return { from: conv.fromUnit, to: conv.toUnit, arrows: 'middle', font: { bold: true } }
		} ) )

		// create a network
		const data = {
			nodes: nodes,
			edges: edges,
		}
		const options = {}
		const network = new Network( domRef.current, data, options )
	}, [ domRef.current ] )

	return (
		<div className="page">
			<TopNavigation/>

			<div className="network" ref={domRef}/>

			<style jsx>{`
              .network {
                height: 80vw;
              }
			`}
			</style>

		</div>
	)
}

export { getStaticProps } from 'lib/getStaticProps'
