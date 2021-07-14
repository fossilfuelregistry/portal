import { useQuery } from "@apollo/client"
import GraphQLStatus from "../GraphQLStatus"
import { Select } from "antd"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useDispatch, useSelector, useStore } from "react-redux"
import useText from "lib/useText"
import { GQL_projects } from "queries/general"
import { co2PageUpdateQuery } from "../CO2Forecast/calculate"

const DEBUG = false

export default function ProjectSelector( { iso3166, iso31662 } ) {
	const router = useRouter()
	const store = useStore()
	const [ selectedProjectOption, set_selectedProjectOption ] = useState()
	const dispatch = useDispatch()
	const project = useSelector( redux => redux.project )
	const { getText } = useText()

	DEBUG && console.log( 'ProjectSelector', { iso3166, iso31662 } )

	useEffect( () => {
		if( !project )
			set_selectedProjectOption( undefined )
		else
			set_selectedProjectOption( { value: project } )
	}, [ iso31662 ] )

	const { data: projData, loading, error } = useQuery( GQL_projects, {
		skip: !iso3166,
		variables: { iso3166_: iso3166, iso31662_: iso31662 }
	} )

	const _projects = ( projData?.getProjects?.nodes ?? [] )
		.filter( p => !!p.projectId && p.lastYear >= 2015 )
		.map( p => p.projectId )
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
						set_selectedProjectOption( p )
						dispatch( { type: 'PROJECT', payload: p?.value } )
						await co2PageUpdateQuery( store, router, 'project', p?.value )
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
