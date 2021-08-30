import React, { useCallback, useEffect, useMemo } from "react"
import useText from "lib/useText"
import { useQuery } from "@apollo/client"
import Link from 'next/link'
import { GQL_largestProjects } from "queries/country"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router"
import { AreaChartOutlined, DotChartOutlined } from "@ant-design/icons"
import ProjectSelector from "../navigation/ProjectSelector"

export default function LargestProjects( { onPositions } ) {
	const { getText } = useText()
	const router = useRouter()
	const dispatch = useDispatch()
	const country = useSelector( redux => redux.country )
	const region = useSelector( redux => redux.region )

	const { data, loading, error } = useQuery( GQL_largestProjects, {
		variables: { iso3166: country },
		skip: !country
	} )

	const setProject = useCallback( async project => {
		dispatch( { type: 'PROJECT', payload: project } )
	}, [] )

	const projects = useMemo( () => {
		return ( data?.projects?.nodes ?? [] ).filter( p => p.productionCo2E > 0 )
	}, [ data?.projects?.nodes ] )

	useEffect( () => {
		if( !( projects?.length > 0 ) ) return
		onPositions?.( projects.map( p => p.geoPosition ) )
	}, [ projects ] )

	if( loading || error || !data ) return null
	if( !projects.length ) return null

	return (
		<div className="co2-card">
			<div className="header">{ getText( 'largest_projects' ) }</div>
			<div className="box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
				<div>
					{ projects.map( p => {
						return (
							<React.Fragment key={ p.id }>
								<Link
									href={ {
										pathname: router.pathname,
										query: {
											country,
											project: p.projectIdentifier
										}
									} }
								>
									<a onClick={ () => setProject( p ) }>
										{ p.projectType === 'DENSE' ?
											<AreaChartOutlined style={ { color: '#81ad7a' } }/> :
											<DotChartOutlined style={ { color: '#ff6500' } }/> }
										{ ' ' }
										{ p.projectIdentifier }
									</a>
								</Link>
								<br/>
							</React.Fragment> )
					} ) }
				</div>
				<div>
					<ProjectSelector
						iso3166={ country }
						iso31662={ region ?? '' }
					/>
				</div>
			</div>
		</div>
	)
}
