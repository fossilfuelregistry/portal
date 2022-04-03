import useText from "lib/useText"
import React, { useEffect, useState } from "react"
import getConfig from "next/config"
import PieChart from "components/viz/PieChart"
import { useDispatch, useSelector } from "react-redux"
import { Button, Col, Row } from "antd"
import settings from "../../settings"
import useCO2CostConverter from "lib/useCO2CostConverter"

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
	const [ sourceName, setSourceName ] = useState( "" )
	const [ productionYear, setProductionYear ] = useState( "" )
	const [ pieChartData, set_pieChartData ] = useState( [] )
	const dispatch = useDispatch()
	const countryName = useSelector( redux => redux.countryName )
	const gwp = useSelector( redux => redux.gwp )
	const total = useSelector( redux => redux.countryTotalCO2 )
	const allSources = useSelector( redux => redux.allSources )
	const costPerTonCO2 = useSelector( redux => redux.co2CostPerTon )

	const { currentUnit, costMultiplier } = useCO2CostConverter()

	const [ localTotal, setLocalTotal ] = useState( total ) 

	DEBUG && console.info( 'CountryProductionPieChart', { project, currentProduction, production } )
	useEffect( () => {
		if( !( currentProduction?.[ 0 ]?.totalCO2 > 0 ) ) return

		const mySources = currentProduction
			.filter( s => s.sourceId !== 3 ) // Hard filter to remove OPEC due to having no coal.
			.map( s => allSources.find( as => as.sourceId === s.sourceId ) )
		set_sources( mySources )

		console.info( "Sources", { mySources, sourceId } )
		let currentSourceId = sourceId
		setSourceName( mySources.find( s=>s.sourceId === sourceId )?.name ?? "" )
		
		if( !currentSourceId
			|| mySources.find( s => s.sourceId === currentSourceId ) === undefined ) {
			currentSourceId = mySources[ 0 ].sourceId
			set_sourceId( currentSourceId )
		}

		const currentEmissions = currentProduction.find( e => e.sourceId === currentSourceId )
		const _total = currentEmissions?.totalCO2 
		dispatch( { type: 'COUNTRYTOTALCO2', payload: _total } )

		const slices = currentEmissions?.production?.flatMap( p => {
			DEBUG && console.info( 'CountryProd Pie', p )
			const q1 = p.co2?.scope1?.[ 1 ] * costMultiplier ?? 0
			const q3 = p.co2?.scope3?.[ 1 ] * costMultiplier ?? 0
			return [ {
				label: p.fossilFuelType?.toUpperCase() + ' ' + getText( 'scope3' ),
				quantity: q3,
				fuel: p.fossilFuelType,
				year: p.year,
				subtype: p.subtype,
				percentage: Math.round( ( q3 * 100 ) / ( _total * costMultiplier )  ),
				fillColor: colors[ p.fossilFuelType ].scope3
			}, {
				label: p.fossilFuelType?.toUpperCase() + ' ' + getText( 'scope1' ),
				quantity: q1,
				fuel: p.fossilFuelType,
				year: p.year,
				subtype: p.subtype,
				percentage: Math.round( ( q1 * 100 ) / ( _total * costMultiplier ) ),
				fillColor: colors[ p.fossilFuelType ].scope1
			} ]
		} )
		DEBUG && console.info( { emissions: currentProduction, slices } )
		set_pieChartData( slices )
		setProductionYear( slices[ 0 ]?.year?.toString() ?? "" )
	},
	[ 
		currentProduction, 
		allSources, 
		sourceId, 
		gwp, 
		costPerTonCO2, 
		costMultiplier, 
		dispatch, 
		getText,
	] )

	useEffect( ()=>{
		setLocalTotal( costMultiplier * total )
	},[ total, costMultiplier ] )

	if( !currentProduction ) return null

	const countryEmission = currentProduction?.find( p => p.sourceId === sourceId )?.totalCO2
	const ratio = ( production?.totalCO2 ?? 0 ) / ( countryEmission ?? 1 )
	//const projectRadius = 83 * Math.sqrt( ratio )

	DEBUG && console.info( 'ratio', { ratio, production, currentProduction } )
	let digits = 0
	if( ratio < 0.1 ) digits = 1
	if( ratio < 0.01 ) digits = 2

	const displayGigaton = localTotal >= 1000 ?? false
	const prefix = displayGigaton ?  getText( 'gigaton' ) : getText( 'megaton' )
	const displayTotal = ( ( displayGigaton ? localTotal / 1000 : total ) ?? 0 ).toFixed( 0 )

	return (
		<div className="co2-card">
			<div
				className="header"
				title={ project?.id }
			>
				{`${ getText( 'emissions' ) } - ${ getText( 'current_annual_estimate' ) } (${ sourceName } ${ productionYear })`}
			</div>
			<div className="box">
				<Row align={ 'middle' }>
					<Col xs={ ( project ? 14 : 24 ) }>
						<div style={ { height: 400 } }>
							<PieChart
								data={ pieChartData }
								topNote={ countryName + ' ' + getText( 'total' ) }
								header={ displayTotal }
								note={ prefix + ' ' + currentUnit }
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
						<h2>{ project.projectIdentifier }</h2>
						{ getText( 'production' ) } { production[ production.fuels[ 0 ] ].lastYear ?? production[ production.fuels[ 0 ] ].dataYear }:
						<br/>
						<h3>
							{ production.fuels.map( f => <div key={ f }>{ production[ f ]?.productionString }</div> ) }
						</h3>
						({ ( ratio * 100 ).toFixed( digits ) }% { getText( 'of_country_total' ) })
						<br/>
						{ getText( 'emissions' ) }:
						<h3>
							{ production.totalCO2?.toFixed( 2 ) } { getText( 'megaton' ) } CO²e
						</h3>
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

// <div style={ { height: 200 } }>
// 	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 10 100 100" height="100%" width="100%">
// 		<circle
// 			fill={ colors.oil.scope3 } className="cls-1" cx="50"
// 			cy="50" r={ projectRadius }
// 		/>
// 		<text
// 			y={ 80 }
// 			fill="#000000d9"
// 			fontSize={ 14 }
// 			fontFamily={ 'sommet-rounded' }
// 			fontWeight={ 'bold' }
// 			textAnchor="middle"
// 		>
// 			<tspan x={ 50 }>{ ( ratio * 100 ).toFixed( digits ) }%</tspan>
// 			<tspan x={ 50 } dy={ 16 }>{ project.projectIdentifier }</tspan>
// 		</text>
// 	</svg>
// </div>
