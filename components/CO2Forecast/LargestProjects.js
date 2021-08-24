import React, { useCallback } from "react"
import useText from "lib/useText"
import { useQuery } from "@apollo/client"
import Link from 'next/link'
import { GQL_largestProjects } from "queries/country"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router"
import { notification } from "antd"

export default function LargestProjects() {
	const { getText } = useText()
	const router = useRouter()
	const dispatch = useDispatch()
	const country = useSelector( redux => redux.country )

	const { data, loading, error } = useQuery( GQL_largestProjects, {
		variables: { iso3166: country },
		skip: !country
	} )

	const setProject = useCallback( async project => {
		console.log( 'setProject', { project, country } )
		try {

			dispatch( { type: 'PROJECT', payload: project } )
		} catch( e ) {
			console.log( e )
			notification.error( { message: 'Project load failed.', description: e.message } )
		}
	}, [] )

	if( loading || error || !data ) return null

	const projects = data?.sparseProjects?.nodes ?? []
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
