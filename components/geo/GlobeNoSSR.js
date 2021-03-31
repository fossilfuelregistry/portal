import Globe from "react-globe.gl"
import { useQuery, gql } from "@apollo/client"
import Spinner from "./Spinner"


export default function GlobeNoSSR() {

	const { data, loading } = useQuery( gql`{ neCountries { nodes { isoA2 gdpMdEst geometry } } }`, {} )

	let polygonsData = []
	const countries = data?.neCountries?.nodes
	if( countries?.length > 0 )
		polygonsData = countries
			.filter( c => c.ISO_A2 !== 'AQ' )
			.map( c => ( { ...c, height: Math.sqrt( c.gdpMdEst )/5000  } ) )

	if( polygonsData.length < 10 )
		return <Spinner/>

	return (
		<Globe
			backgroundColor="#ffffff"
			globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
			polygonsData={polygonsData}
			polygonAltitude={'height'}
			polygonCapColor={() => 'rgba(20, 0, 0, 0.5)'}
			polygonSideColor={() => 'rgba(0, 0, 0, 0.08)'}
			polygonsTransitionDuration={4000}
		/>
	)
}
