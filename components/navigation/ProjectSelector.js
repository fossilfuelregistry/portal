import { useApolloClient, useQuery } from "@apollo/client"
import GraphQLStatus from "../GraphQLStatus"
import { Alert, Select } from "antd"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import useText from "lib/useText"
import { GQL_projects } from "queries/general"
import { AreaChartOutlined, DotChartOutlined } from "@ant-design/icons"
import { GQL_projectGeo } from "queries/country"

const DEBUG = false

export default function ProjectSelector( { iso3166, iso31662 } ) {
	const router = useRouter()
	const apolloClient = useApolloClient()
	const [ selectedProjectOption, set_selectedProjectOption ] = useState()
	const [ projects, set_projects ] = useState( [] )
	const [ message, set_message ] = useState()
	const dispatch = useDispatch()
	const project = useSelector( redux => redux.project )
	const { getText } = useText()

	const query = router.query

	DEBUG && console.info( 'ProjectSelector', { query, iso3166, iso31662 } )

	useEffect( () => {
		DEBUG && console.info( 'ProjectSelector useEffect 1', { project } )
		if( !project || project === 'loading' )
			set_selectedProjectOption( undefined )
		else
			set_selectedProjectOption( project.projectIdentifier )
		//co2PageUpdateQuery( store, router )
	}, [ iso31662, project ] )

	const { data: projData, loading, error } = useQuery( GQL_projects, {
		skip: !iso3166,
		variables: { iso3166_: iso3166, iso31662_: iso31662 }
	} )

	useEffect( () => {
		if( loading || error || !( projData?.getProjects?.nodes instanceof Array ) ) return
		DEBUG && console.info( 'ProjectSelector useEffect 2', { project, query } )

		// Remove non-current entries and get one entry per project..
		const projs = new Map()
		projData?.getProjects?.nodes?.forEach( p => {
			const prev = projs.get( p.projectIdentifier )
			if( prev?.lastYear > p.lastYear ) return
			if( p.projectIdentifier?.length > 0 && ( p.lastYear ?? p.dataYear ) >= 2015 ) projs.set( p.projectIdentifier, p )
		} )

		// Now that we have data, also see if we should set state from URL
		if( query.project?.length > 0 ) {
			const p = projs.get( query.project )
			if( p && !window.projectInitialized ) { // Only set from URL once per page load
				dispatch( { type: 'PROJECT', payload: p } )
				set_selectedProjectOption( p.projectIdentifier )
				window.projectInitialized = true
			} else {
				set_message( getText( 'request_to_load_non_existing_project' ) + ' ' + query.project )
			}
		} else {
			if( project ) {
				dispatch( { type: 'PROJECT', payload: undefined } )
			}
		}
		DEBUG && console.info( 'ProjectSelector', { projs, gql: projData?.getProjects?.nodes } )

		set_projects( Array.from( projs.values() ) )

	}, [ projData?.getProjects?.nodes?.length, query.project ] )

	DEBUG && console.info( 'ProjectSelector', {
		projData: projData?.getProjects?.nodes?.length,
		loading,
		error,
		projects
	} )

	if( loading || error )
		return <GraphQLStatus loading={ loading } error={ error }/>

	return (
		<>
			{ projects?.length > 0 &&
			<div>
				{ message && <><Alert showIcon type="warning" message={ message }/><br/></> }
				<Select
					showSearch
					style={ { minWidth: 120, width: '100%' } }
					value={ selectedProjectOption }
					allowClear={ true }
					placeholder={ getText( 'search_projects' ) + '...' }
					onChange={ async p => {
						set_selectedProjectOption( p )
						const proj = projects.find( pr => pr.projectIdentifier === p )
						dispatch( { type: 'PROJECT', payload: proj } )
						console.info( { p, proj, projects } )

						if( proj?.projectId?.length > 0 ) {
							const q = await apolloClient.query( {
								query: GQL_projectGeo,
								variables: { iso3166, projectId: proj?.projectId }
							} )
							dispatch( { type: 'PROJECTGEO', payload: q.data?.projectGeo?.geom?.geojson } )
						} else {
							dispatch( { type: 'PROJECTGEO', payload: null } )
						}

						if( proj?.dataType === 'sparse' ) {
							dispatch( { type: 'PRODUCTIONSOURCEID', payload: undefined } )
						}

						dispatch( { type: 'PROJECT', payload: proj } )
					} }
				>
					{ projects.map( p => (
						<Select.Option key={ p.projectIdentifier }>
							{ p.projectIdentifier }{ ' ' }
							{ p.projectType === 'DENSE' ? <AreaChartOutlined style={ { color: '#81ad7a' } }/> :
								<DotChartOutlined style={ { color: '#ff6500' } }/> }
						</Select.Option> ) ) }
				</Select>
			</div>
			}
		</>
	)
}
