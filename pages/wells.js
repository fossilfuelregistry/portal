import { useCallback, useEffect, useState } from "react"
import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'
import { ipLocationSelector, useStore } from "lib/zustandProvider"
import dynamic from 'next/dynamic'
import { useQuery, gql } from '@apollo/client'

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const Q_PRODUCTION = gql`
query ProductionWells( $swLat: Float! $swLng: Float! $neLat: Float! $neLng: Float! ) {
  findProductionIn(neLat: $neLat, neLng: $neLng, swLat: $swLat, swLng: $swLng) {
    nodes {
      id gasProduction oilProduction
      position { ... on GeometryPoint { x y } }
    }
  }
}`

const MapWithNoSSR = dynamic( () => import( "components/geo/Leaflet" ),
	{ ssr: false } )

export default function Wells( props ) {
	//const texts = useStore( textsSelector )
	const ipLocation = useStore( ipLocationSelector )

	const [ center, set_center ] = useState( { lat: 0, lng: 0 } )
	const [ bounds, set_bounds ] = useState()

	useEffect( () => {
		if( !ipLocation ) return
		set_center( ipLocation )
	},
	[ ipLocation?.lat, ipLocation?.lng ] )

	const handleOnMove = useCallback( ( center, _bounds ) => {
		console.log( _bounds )
		set_bounds( _bounds )
		set_center( { lat: center.lat, lng: center.lng } )
	}, [ set_center ] )

	const { data: production, loading: productionLoading } = useQuery( Q_PRODUCTION, {
		variables: {
			swLat: bounds._southWest.lat,
			swLng: bounds._southWest.lng,
			neLat: bounds._northEast.lat,
			neLng: bounds._northEast.lng
		}
	} )

	console.log( production?.findProductionIn?.nodes )

	return (
		<>
			<div className="page">
				<TopNavigation/>

				<div className="map">
					<MapWithNoSSR center={center} onMove={handleOnMove}/>
				</div>

				<style jsx>{`
				`}
				</style>

			</div>
		</>
	)
}

export { getStaticProps } from '../lib/getStaticProps'
