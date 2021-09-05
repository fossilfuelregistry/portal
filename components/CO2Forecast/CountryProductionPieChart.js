import useText from "lib/useText"
import { useEffect, useState } from "react"
import getConfig from "next/config"
import PieChart from "components/viz/PieChart"
import { useSelector } from "react-redux"
import { Button, Col, Row } from "antd"
import settings from "../../settings"

const DEBUG = false

const c = settings.gradient6
const colors = {
	oil: { scope1: c[ 0 ], scope3: c[ 1 ] },
	gas: { scope1: c[ 2 ], scope3: c[ 3 ] },
	coal: { scope1: c[ 4 ], scope3: c[ 5 ] }
}

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

export default function CountryProductionPieChart( { project, currentProduction, production } ) {
	const { getText } = useText()
	const [ sources, set_sources ] = useState( [] )
	const [ sourceId, set_sourceId ] = useState()
	const [ total, set_total ] = useState( 0 )
	const [ pieChartData, set_pieChartData ] = useState( [] )
	const countryName = useSelector( redux => redux.countryName )
	const gwp = useSelector( redux => redux.gwp )
	const allSources = useSelector( redux => redux.allSources )

	useEffect( () => {
		if( !( currentProduction?.[ 0 ]?.totalCO2 > 0 ) ) return

		const mySources = currentProduction.map( s => allSources.find( as => as.sourceId === s.sourceId ) )
		set_sources( mySources )

		let currentSourceId = sourceId
		if( !currentSourceId
			|| mySources.find( s => s.sourceId === currentSourceId ) === undefined ) {
			currentSourceId = mySources[ 0 ].sourceId
			set_sourceId( currentSourceId )
		}

		const currentEmissions = currentProduction.find( e => e.sourceId === currentSourceId )
		const _total = currentEmissions?.totalCO2
		set_total( _total )

		const slices = currentEmissions?.production?.flatMap( p => {
			DEBUG && console.log( 'CountryProductionPieChart', p )
			const q1 = p.co2?.scope1?.[ 1 ] ?? 0
			const q3 = p.co2?.scope3?.[ 1 ] ?? 0
			return [ {
				label: p.fossilFuelType?.toUpperCase() + ' ' + getText( 'scope3' ),
				quantity: q3,
				year: p.year,
				subtype: p.subtype,
				percentage: Math.round( ( q3 * 100 ) / _total ),
				fillColor: colors[ p.fossilFuelType ].scope3
			}, {
				label: p.fossilFuelType?.toUpperCase() + ' ' + getText( 'scope1' ),
				quantity: q1,
				year: p.year,
				subtype: p.subtype,
				percentage: Math.round( ( q1 * 100 ) / _total ),
				fillColor: colors[ p.fossilFuelType ].scope1
			} ]
		} )
		console.log( { emissions: currentProduction, slices } )
		set_pieChartData( slices )
	}, [ currentProduction, sourceId, gwp ] )

	if( !currentProduction ) return null
	
	const countryEmission = currentProduction?.find( p => p.sourceId === sourceId )?.totalCO2
	const ratio = ( production?.totalCO2 ?? 0 ) / ( countryEmission ?? 1 )
	const projectRadius = 83 * Math.sqrt( ratio )

	DEBUG && console.log( 'ratio', { ratio, production, currentProduction } )

	return (
		<div className="co2-card">
			<div
				className="header"
				title={ project?.id }
			>
				{ getText( 'emissions' ) } - { getText( 'current_annual_estimate' ) }
			</div>
			<div className="box">
				<Row align={ 'middle' }>
					<Col xs={ ( project ? 14 : 24 ) }>
						<div style={ { height: 400 } }>
							<PieChart
								data={ pieChartData }
								topNote={ countryName + ' ' + getText( 'total' ) }
								header={ total?.toFixed( 0 ) }
								note={ getText( 'megaton' ) + ' CO²e' }
							/>
						</div>

						<div className="sources">
							{ sources.map( s => (
								<Button
									key={ s.sourceId }
									onClick={ () => set_sourceId( s.sourceId ) }
									type={ s.sourceId === sourceId ? 'primary' : '' }
								>
									{ s.name }
								</Button>
							) ) }
						</div>

					</Col>

					{ !!project && !!production?.totalCO2 &&
					<Col xs={ 10 } style={ { textAlign: 'center' } }>
						<div style={ { height: 200 } }>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 10 100 100" height="100%" width="100%">
								<circle
									fill={ colors[ production.fuels[ 0 ] ]?.scope3 } className="cls-1" cx="50"
									cy="50" r={ projectRadius }
								/>
								<text
									y={ 80 }
									fill="#000000d9"
									fontSize={ 14 }
									fontFamily={ 'sommet-rounded' }
									fontWeight={ 'bold' }
									textAnchor="middle"
								>
									<tspan x={ 50 }>{ ( ratio * 100 ).toFixed( 2 ) }%</tspan>
									<tspan x={ 50 } dy={ 16 }>{ project.projectIdentifier }</tspan>
								</text>
							</svg>
						</div>
						{ getText( 'production' ) } { production[ production.fuels[ 0 ] ].lastYear }:
						<br/>
						{ production.fuels.map( f => <div key={ f }>{ production[ f ]?.productionString }</div> ) }
						{ getText( 'emissions' ) }:
						<br/>
						{ production.totalCO2?.toFixed( 2 ) } { getText( 'megaton' ) } CO²e
					</Col>
					}
				</Row>
			</div>

			<style jsx>{ `
              .sources {
                text-align: center;
              }

              .sources :global(button) {
                margin-left: 6px;
                margin-right: 6px;
              }
			` }
			</style>
		</div>
	)
}
