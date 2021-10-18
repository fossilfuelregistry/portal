import React, { useEffect, useMemo, useState } from "react"
import useText from "lib/useText"
import { useQuery } from "@apollo/client"
import Link from 'next/link'
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router"
import { AreaChartOutlined, DotChartOutlined, EnvironmentOutlined } from "@ant-design/icons"
import ProjectSelector from "components/navigation/ProjectSelector"
import settings from "../../settings"
import { Checkbox, Col, Divider, Row } from "antd"
import FuelIcon from "components/navigation/FuelIcon"
import { GQL_projects } from "../../queries/general"

const DEBUG = false

export default function LargestProjects( { onPositions, onGeoClick } ) {
	const { getText } = useText()
	const router = useRouter()
	const dispatch = useDispatch()
	const country = useSelector( redux => redux.country )
	const region = useSelector( redux => redux.region )
	const countryTotalCO2 = useSelector( redux => redux.countryTotalCO2 )
	const [ filters, set_filters ] = useState( { oil: true, gas: true, coal: true } )

	const { data, loading, error } = useQuery( GQL_projects, {
		variables: { iso3166_: country, iso31662_: region ?? '' },
		skip: !country
	} )

	const projects = useMemo( () => {
		const projs = ( data?.getProjects?.nodes ?? [] )
			.filter( p => p.co2 > 0 )
			.sort( ( a, b ) => Math.sign( b.co2 - a.co2 ) )
		DEBUG && console.info( projs[ 0 ] )
		return projs
	}, [ data?.getProjects?.nodes?.length ] )

	useEffect( () => {
		if( !( projects?.length > 0 ) ) return
		onPositions?.( projects.map( p => p.geoPosition ) )
	}, [ projects ] )

	if( loading || error || !data ) return null
	if( !projects.length ) return null

	const largest = projects
		.filter( p => {
			let show = false
			p.fuels?.forEach( f => {
				if( filters[ f ] ) show = true
			} )
			return show
		} )
		.slice( 0, 9 )

	return (
		<div className="co2-card">
			<div className="header">{ getText( 'largest_projects' ) }</div>
			<div
				className="box"
				style={ { display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }
			>
				<div className="switches">
					<Row justify="center" gutter={ 16 }>
						{ settings.supportedFuels.map( fuel =>
							<Col key={ fuel }>
								<Checkbox
									checked={ filters[ fuel ] !== false }
									onChange={ e => {
										console.log( e )
										set_filters( { ...filters, [ fuel ]: e.target.checked } )
									} }
								>
									<div style={ { display: 'inline-flex', opacity: ( filters[ fuel ] !== false ) ? 1 : 0.4 } }>
										<FuelIcon fuel={ fuel } height={ 22 }/>
										<div style={ { paddingLeft: 4 } }>{ getText( fuel ) }</div>
									</div>
								</Checkbox>
							</Col>
						) }
					</Row>
					<Divider style={ { marginTop: 12 } }/>
					<table style={ { margin: '0 auto' } }>
						<tbody>
							{ largest.map( p => {
								//console.info( { p: p.productionCo2E, countryTotalCO2 } )
								return (
									<tr key={ p.id }>

										<td align="right" style={ { lineHeight: 0, paddingRight: 8 } }>
											<div className="fuels">
												{ p.fuels.map( fuel =>
													<FuelIcon
														key={ fuel } fuel={ fuel } height={ 20 }
														width={ 20 }
													/> ) }
											</div>
										</td>

										<td>
											{ p.projectType === 'DENSE' ?
												<AreaChartOutlined style={ { color: '#81ad7a' } }/> :
												<DotChartOutlined style={ { color: '#ff6500' } }/> }
										</td>

										<td style={ { padding: '0 10px', fontSize: 20, fontWeight: 'bold' } }>
											<Link
												shallow={ true }
												href={ {
													pathname: router.pathname,
													query: {
														country,
														project: p.projectIdentifier
													}
												} }
											>
												<a onClick={ () => dispatch( {
													type: 'PROJECT',
													payload: p
												} ) }
												>
													{ p.projectIdentifier }
												</a>

											</Link>
										</td>

										<td align="right">
											{ ( p.co2 / ( countryTotalCO2 * 1e7 ) ).toFixed( 0 ) }<small>%</small>
										</td>

										<td style={ { paddingLeft: 12 } }>
											{ p.geoPosition &&
											<a>
												<EnvironmentOutlined
													onClick={ () => onGeoClick( p.geoPosition ) }
												/>
											</a>
											}
										</td>
									</tr> )
							} ) }
						</tbody>
					</table>
				</div>
				<div>
					<ProjectSelector
						iso3166={ country }
						iso31662={ region ?? '' }
					/>
				</div>
			</div>
			<style jsx>{ `
              .fuels {
                display: inline-block;
              }

              .co2-card {
                height: 100%;
                display: flex;
                flex-direction: column;
              }

              .co2-card .box {
                flex: 1 1 auto;
              }

              .co2-card :global(.ant-switch-inner svg path) {
                fill: #ffffff;
              }

              .switches :global(label) {
                align-items: flex-start;
              }
			` }
			</style>
		</div>
	)
}
