import { useQuery } from "@apollo/client"
import GraphQLStatus from "../GraphQLStatus"
import { Select } from "antd"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import useText from "lib/useText"
import { GQL_projects } from "queries/general"

const DEBUG = false

export default function ProjectSelector( { iso3166, iso31662 } ) {
	const router = useRouter()
	const [ selectedProjectOption, set_selectedProjectOption ] = useState()
	const dispatch = useDispatch()
	const { getText } = useText()

	DEBUG && console.log( 'ProjectSelector', { iso3166, iso31662 } )

	// Clear selection if country/region changes.
	useEffect( () => {
		set_selectedProjectOption( undefined )
	}, [ iso3166, iso31662 ] )

	const { data: projData, loading, error } = useQuery( GQL_projects, {
		skip: !iso3166,
		variables: { iso3166_: iso3166, iso31662_: iso31662 }
	} )

	const _projects = ( projData?.getProjects?.nodes ?? [] )
		.filter( p => !!p.projectId ).map( p => p.projectId )
	const projects = [ ...new Set( _projects ) ] // Deduplicate

	DEBUG && console.log( 'ProjectSelector', { projData, loading, error, projects } )

	if( loading || error )
		return <GraphQLStatus loading={ loading } error={ error }/>

	return (
		<>
			{ projects?.length > 0 &&
			<div style={ { marginTop: 12 } }>
				<Select
					showSearch
					style={ { minWidth: 120, width: '100%' } }
					value={ selectedProjectOption }
					labelInValue={ true }
					allowClear={ true }
					placeholder={ getText( 'project' ) + '...' }
					onChange={ async p => {
						console.log( '____________', p )
						set_selectedProjectOption( p )
						dispatch( { type: 'PROJECT', payload: p?.value } )
						const query = { ...router.query }
						delete query.project
						if( p?.value ) query.project = p.value
						await router.replace( { pathname: router.pathname, query } )
					} }
				>
					{ projects.map( p => (
						<Select.Option key={ p }>{ p }</Select.Option> ) ) }
				</Select>
			</div>
			}
		</>
	)
}
