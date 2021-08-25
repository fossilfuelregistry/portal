import React, { useCallback, useEffect } from "react"
import useText from "lib/useText"
import { useQuery } from "@apollo/client"
import Link from 'next/link'
import { GQL_largestProjects } from "queries/country"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router"

export default function LargestProjects( { onPositions } ) {
	const { getText } = useText()
	const router = useRouter()
	const dispatch = useDispatch()
	const country = useSelector( redux => redux.country )

	const { data, loading, error } = useQuery( GQL_largestProjects, {
		variables: { iso3166: country },
		skip: !country
	} )

	const setProject = useCallback( async project => {
		dispatch( { type: 'PROJECT', payload: project } )
	}, [] )

	const projects = ( data?.sparseProjects?.nodes ?? [] ).filter( p => p.productionCo2E > 0 )

	useEffect( () => {
		if( !( projects?.length > 0 ) ) return
		onPositions?.( projects.map( p => p.geoPosition ) )
	}, [ projects ] )

	if( loading || error || !data ) return null
	if( !projects.length ) return null

	return (
		<div className="co2-card">
			<div className="header">{ getText( 'largest_projects' ) }</div>
			<div className="box">
				{ projects.map( p => {
					return (
						<React.Fragment key={ p.projectId }>
							<Link
								href={ {
									pathname: router.pathname,
									query: {
										country,
										project: p.projectId
									}
								} }
							>
								<a onClick={ () => setProject( p ) }>{ p.projectId }</a>
							</Link>
							<br/>
						</React.Fragment> )
				} ) }
			</div>
		</div>
	)
}
