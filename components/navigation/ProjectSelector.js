import { useQuery } from "@apollo/client"
import GraphQLStatus from "../GraphQLStatus"
import { Select } from "antd"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector, useStore } from "react-redux"
import useText from "lib/useText"
import { GQL_projects } from "queries/general"
import { co2PageUpdateQuery } from "../CO2Forecast/calculate"
import { AreaChartOutlined, DotChartOutlined } from "@ant-design/icons"

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
			set_selectedProjectOption( { value: project.projectId } )
	}, [ iso31662 ] )

	const { data: projData, loading, error } = useQuery( GQL_projects, {
		skip: !iso3166,
		variables: { iso3166_: iso3166, iso31662_: iso31662 }
	} )

	const projects = useMemo( () => {
		if( loading || error || !projData?.getProjects?.nodes?.length ) return []

		// Remove non-current entries and get one entry per project..
		const projects = new Map()
		projData?.getProjects?.nodes?.forEach( p => {
			const prev = projects.get( p.projectId )
			if( prev?.lastYear > p.lastYear ) return
			if( p.projectId?.length > 0 && p.lastYear >= 2015 ) projects.set( p.projectId, p )
		} )

		// Now that we have data, also see if we should set state from URL
		if( router.query.project?.length > 0 ) {
			const p = projects.get( router.query.project )
			if( p ) {
				dispatch( { type: 'PROJECT', payload: p } )
				set_selectedProjectOption( p.projectId )
			}
		}

		return Array.from( projects.values() )
	}, [ projData?.getProjects?.nodes?.length ] )

	DEBUG && console.log( 'ProjectSelector', {
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
			<div style={ { marginTop: 12 } }>
				<Select
					showSearch
					style={ { minWidth: 120, width: '100%' } }
					value={ selectedProjectOption }
					allowClear={ true }
					placeholder={ getText( 'project' ) + '...' }
					onChange={ async p => {
						set_selectedProjectOption( p )
						const proj = projects.find( pr => pr.projectId === p )
						dispatch( { type: 'PROJECT', payload: proj } )
						console.log( { p, proj, projects } )
						await co2PageUpdateQuery( store, router, 'project', p )
					} }
				>
					{ projects.map( p => (
						<Select.Option key={ p.projectId }>
							{ p.projectId }{ ' ' }
							{ p.dataType === 'dense' ? <AreaChartOutlined style={ { color: '#81ad7a' } }/> :
								<DotChartOutlined style={ { color: '#ff6500' } }/> }
						</Select.Option> ) ) }
				</Select>
			</div>
			}
		</>
	)
}
