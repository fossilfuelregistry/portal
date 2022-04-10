import React, { /*useCallback, */ useMemo } from "react"
import { Group } from '@visx/group'
import { AreaStack, LinePath } from '@visx/shape'
import { AxisBottom, AxisRight } from '@visx/axis'
import { curveLinear } from '@visx/curve'
import { scaleLinear } from '@visx/scale'
import { withTooltip } from '@visx/tooltip'
import { max } from 'd3-array'
import { withParentSize } from "@visx/responsive"
import useText from "lib/useText"
import { combineOilAndGasAndCoal, sumOfCO2 } from "../CO2Forecast/calculate"
import { useSelector } from "react-redux"
import CsvDownloader /*, { toCsv } */ from "react-csv-downloader"
import settings from 'settings'
import getConfig from "next/config"
import useCsvDataTranslator from "lib/useCsvDataTranslator"
import { DownloadOutlined } from "@ant-design/icons"
import { formatCsvNumber } from "../../lib/numberFormatter"
import useNumberFormatter from "lib/useNumberFormatter"
import useCO2CostConverter from "lib/useCO2CostConverter"



const DEBUG = false

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const colors = {
	oil: { past: '#008080', reserves: '#70a494', contingent: '#b4c8a8' },
	gas: { past: '#de8a5a', reserves: '#edbb8a', contingent: '#f6edbd' },
	coal: { past: '#6EABD9', reserves: '#90BCDE', contingent: '#B1CFE5' },
}

//#008080,#70a494,#b4c8a8,#f6edbd,#edbb8a,#de8a5a,#ca562c

function CO2ForecastGraphBase( {
	production, projection, projectedProduction, parentWidth, parentHeight
} ) {
	const { getText } = useText()
	const country = useSelector( redux => redux.country )
	const projectionSourceId = useSelector( redux => redux.projectionSourceId )
	const productionSourceId = useSelector( redux => redux.productionSourceId )
	const { generateCsvTranslation } = useCsvDataTranslator()
	const { currentUnit, costMultiplier } = useCO2CostConverter()
	const numberFormatter =  useNumberFormatter()

	const height = parentHeight
	const margin = { left: 0, top: 10 }

	const getYear = d => d.year
	const getY0 = d => d[ 0 ]
	const getY1 = d => d[ 1 ]
	const getProjection = d => d.co2

	let pReserves = false, cReserves = false

	const productionData = combineOilAndGasAndCoal( production.filter( d => d.sourceId === productionSourceId ) )
		.filter( d => d.year >= settings.year.start )
		.map( d => ( {
			year: d.year,
			oil: d.oil ? sumOfCO2( d.oil.co2, 1 ) * costMultiplier : 0,
			gas: d.gas ? sumOfCO2( d.gas.co2, 1 ) * costMultiplier  : 0,
			coal: d.coal ? sumOfCO2( d.coal.co2, 1 ) * costMultiplier : 0,
		} ) )

	const projectionData = combineOilAndGasAndCoal( projection.filter( d => d.sourceId === projectionSourceId ) )
		.filter( d => d.year >= settings.year.start )
		.map( d => ( {
			year: d.year,
			co2: ( ( d.oil ? sumOfCO2( d.oil.co2, 1 )  : 0 ) + ( d.gas ? sumOfCO2( d.gas.co2, 1 ) : 0 ) + ( d.coal ? sumOfCO2( d.coal.co2, 1 ) : 0 ) ) * costMultiplier 
		} ) )
		
	const projProdData = ( projectionSourceId ? combineOilAndGasAndCoal( projectedProduction ) : [] )
		.filter( d => d.year >= settings.year.start )
		.map( d => {
			const multiplyOrZero = ( value ) => value ? value * costMultiplier : 0
			
			if( d.oil?.plannedProd > 0 ) pReserves = true
			if( d.gas?.plannedProd > 0 ) pReserves = true
			if( d.coal?.plannedProd > 0 ) pReserves = true
			if( d.oil?.continProd > 0 ) cReserves = true
			if( d.gas?.continProd > 0 ) cReserves = true
			if( d.coal?.continProd > 0 ) cReserves = true
			return {
				year: d.year,
				oil_p: multiplyOrZero( d.oil?.plannedProd ),
				oil_c: multiplyOrZero( d.oil?.continProd ),
				gas_p: multiplyOrZero( d.gas?.plannedProd ),
				gas_c: multiplyOrZero( d.gas?.continProd ),
				coal_p: multiplyOrZero( d.coal?.plannedProd ),
				coal_c: multiplyOrZero( d.coal?.continProd ),
			}
		} )

	DEBUG && console.info( { production, productionData, projProdData, projectionSourceId, projectedProduction } )

	// scale
	const yearScale = scaleLinear( {
		range: [ 0, parentWidth - margin.left ],
		domain: [ settings.year.start, settings.year.end ],
	} )

	const maxCO2 = useMemo( () => {
		let maxValue = max( productionData, d => ( d.oil ?? 0 ) + ( d.gas ?? 0 ) + ( d.coal ?? 0 ) )
		maxValue = Math.max( maxValue, max( projectionData, d => d.co2 ) )
		return maxValue * 1.05
	}, [ productionData, projectionData ] )

	const productionScale = scaleLinear( {
		range: [ height - 30, 0 ],
		domain: [ 0, maxCO2 ],
	} )
	/*
	const handleMenuClick = useCallback( async e => {

		const _csv = async() => {
			const columns = [
				{ id: 'year', displayName: 'year', },
				{ id: 'oil', displayName: 'oil emissions', },
				{ id: 'gas', displayName: 'gas emissions', },
				{ id: 'coal', displayName: 'coal emissions', },
				{ id: 'co2', displayName: 'projected emissions', },
				{ id: 'oil_p', displayName: 'projected oil emissions', },
				{ id: 'oil_c', displayName: 'projected contingent oil emissions', },
				{ id: 'gas_p', displayName: 'projected gas emissions', },
				{ id: 'gas_c', displayName: 'projected contingent gas emissions', },
				{ id: 'coal_p', displayName: 'projected coal emissions', },
				{ id: 'coal_c', displayName: 'projected contingent coal emissions', },
			]
			const datas = productionData
			projectionData.forEach( d => {
				const y = datas.find( dp => dp.year === d.year )
				if( y )
					y.co2 = d.co2
				else
					datas.push( d )
			} )
			projProdData.forEach( d => {
				const y = datas.find( dp => dp.year === d.year )
				if( y ) {
					y.oil_p = d.oil_p
					y.oil_c = d.oil_c
					y.gas_p = d.gas_p
					y.gas_c = d.gas_c
					y.coal_p = d.coal_p
					y.coal_c = d.coal_c
				} else
					datas.push( d )
			} )
			const csv = await toCsv( {
				datas, columns
			} )
			const blob = new Blob( [ csv ], { type: 'text/csv;charset=utf-8' } )
			FileSaver.saveAs( blob, 'fossilfuelregistry_' + country + '_data.csv' )
		}

		switch( e.key ) {
			case 'png':
				saveSvgAsPng( document.getElementById( "CO2Forecast" ), "CO2Forecast.png" )
				break
			case 'csv':
				await _csv()
				break
			default:
		}
	}, [] )*/

	if( !( maxCO2 > 0 ) ) return null // JSON.stringify( maxCO2 )


	const csvData = productionData.map( p=>( {
		year: p.year, 
		oil: formatCsvNumber( p.oil ),
		gas: formatCsvNumber( p.gas ),
		coal: formatCsvNumber( p.coal ),
	} ) )

	projectionData.forEach( d => {
		const y = csvData.find( dp => dp.year === d.year )
		if( y )
			y.co2 = formatCsvNumber( d.co2 )
		else
			csvData.push( { year: d.year, co2: formatCsvNumber( d.co2 ) } )
	} )
	projProdData.forEach( d => {
		const y = csvData.find( dp => dp.year === d.year )
		if( y ) {
			y.oil_p =  formatCsvNumber( d.oil_p )
			y.oil_c =  formatCsvNumber( d.oil_c )
			y.gas_p =  formatCsvNumber( d.gas_p )
			y.gas_c =  formatCsvNumber( d.gas_c )
			y.coal_p = formatCsvNumber(  d.coal_p )
			y.coal_c = formatCsvNumber(  d.coal_c )
		} else
			csvData.push( {
				year: formatCsvNumber( d.year ),
				oil_p: formatCsvNumber( d.oil_p ),
				oil_c: formatCsvNumber( d.oil_c ),
				gas_p: formatCsvNumber( d.gas_p ),
				gas_c: formatCsvNumber( d.gas_c ),
				coal_p: formatCsvNumber( d.coal_p ),
				coal_c: formatCsvNumber( d.coal_c ),
			} )
	} )

	const translatedCsvData = csvData.map( generateCsvTranslation )

	// PNG DOWNLOAD BUTTON
	// const menu = (
	// 	<Menu onClick={ handleMenuClick }>
	// 		<Menu.Item key="png">PNG Image</Menu.Item>
	// 		<Menu.Item key="csv">CSV Data</Menu.Item>
	// 	</Menu>
	// )

	// 			<div className="chart-menu" style={ { position: "absolute", top: 8, right: 16, zIndex: 1001 } }>
	// 				<Dropdown onClick={ handleMenuClick } overlay={ menu }>
	// 					<Button type="primary" shape="circle" icon={ <DownloadOutlined/> }/>
	// 				</Dropdown>
	// 			</div>

	return (
		<div className="graph" style={ { height: height } }>
			<div style={ { display: 'inline-block', paddingBottom:"5px" } }>
				<CsvDownloader
					datas={ translatedCsvData }
					filename={ country + '_emissions_forecast.csv' }
				>
					<DownloadOutlined/>
				</CsvDownloader>
			</div>

			<svg width={ '100%' } height={ height } id="CO2Forecast">
				<Group left={ margin.left } top={ 0 }>
					<AxisBottom
						top={ height - 30 }
						scale={ yearScale }
						numTicks={ parentWidth > 520 ? 8 : 4 }
						tickFormat={ x => `${ x?.toFixed( 0 ) }` }
						tickLabelProps={ ( label, pos, ticks ) => {
							let dx = 0
							if( pos === 0 ) dx = 15
							if( pos === ticks?.length - 1 ) dx = -15
							return {
								dx,
								dy: '0.25em',
								fill: '#222',
								fontFamily: 'Arial',
								fontSize: 13,
								textAnchor: 'middle',
							}
						} }
					/>

					<AreaStack
						keys={ [ 'oil_c', 'oil_p', 'gas_c', 'gas_p', 'coal_c', 'coal_p' ] }
						data={ projProdData }
						x={ d => yearScale( getYear( d.data ) ) }
						y0={ d => productionScale( getY0( d ) ) }
						y1={ d => productionScale( getY1( d ) ) }
					>
						{ ( { stacks, path } ) =>
							stacks.map( stack => {
								return (
									<path
										key={ `stack-${ stack.key }` }
										d={ path( stack ) || '' }
										stroke="transparent"
										fill={ {
											oil_p: colors.oil.reserves,
											oil_c: colors.oil.contingent,
											gas_p: colors.gas.reserves,
											gas_c: colors.gas.contingent,
											coal_p: colors.coal.reserves,
											coal_c: colors.coal.contingent,
											
										}[ stack.key ] }
									/>
								)
							} ) }
					</AreaStack>

					<AreaStack
						keys={ [ 'oil', 'gas', 'coal' ] }
						data={ productionData }
						defined={ d => ( getY0( d ) > 0 || getY1( d ) > 0 ) }
						x={ d => yearScale( getYear( d.data ) ) }
						y0={ d => productionScale( getY0( d ) ) }
						y1={ d => productionScale( getY1( d ) ) }
					>
						{ ( { stacks, path } ) =>
							stacks.map( stack => {
								return (
									<path
										key={ `stack-${ stack.key }` }
										d={ path( stack ) || '' }
										stroke="transparent"
										fill={ {
											oil: colors.oil.past,
											gas: colors.gas.past,
											coal: colors.coal.past,
										}[ stack.key ] }
									/>
								)
							} ) }
					</AreaStack>

					<LinePath
						curve={ curveLinear }
						className="projection auth"
						data={ projectionData }
						defined={ d => getProjection( d ) > 0 }
						x={ d => yearScale( getYear( d ) ) ?? 0 }
						y={ d => productionScale( getProjection( d ) ) ?? 0 }
						shapeRendering="geometricPrecision"
					/>

					<AxisRight
						scale={ productionScale }
						numTicks={ parentWidth > 520 ? 8 : 4 }
						tickFormat={ x => numberFormatter( x ) }
						tickLabelProps={ ( label, pos ) => {
							return {
								dx: '0.25em',
								dy: pos === 0 ? -12 : 2,
								fill: '#222',
								fontFamily: 'Arial',
								fontSize: 13,
								textAnchor: 'start',
							}
						} }
					/>

					<text x="40" y="18" transform="rotate(0)" fontSize={ 13 }>
						{ currentUnit }
					</text>

				</Group>

			</svg>

			<div className="legend">
				<table>
					<tbody>
						<tr>
							<td>
								<div className="blob gas past"/>
							</td>
							<td>{ getText( 'gas' ) }: { getText( 'past_emissions' ) }</td>
						</tr>
						<tr>
							<td>
								<div className="blob oil past"/>
							</td>
							<td>{ getText( 'oil' ) }: { getText( 'past_emissions' ) }</td>
						</tr>
						<tr>
							<td>
								<div className="blob coal past"/>
							</td>
							<td>{ getText( 'coal' ) }: { getText( 'past_emissions' ) }</td>
						</tr>
						{ pReserves && <tr>
							<td>
								<div className="blob gas p"/>
							</td>
							<td>{ getText( 'gas' ) }: { getText( 'against_reserves' ) }</td>
						</tr> }
						{ pReserves && <tr>
							<td>
								<div className="blob oil p"/>
							</td>
							<td>{ getText( 'oil' ) }: { getText( 'against_reserves' ) }</td>
						</tr> }
						{ pReserves && <tr>
							<td>
								<div className="blob coal p"/>
							</td>
							<td>{ getText( 'coal' ) }: { getText( 'against_reserves' ) }</td>
						</tr> }
						{ cReserves && <tr>
							<td>
								<div className="blob gas c"/>
							</td>
							<td>{ getText( 'gas' ) }: { getText( 'against_contingent' ) }</td>
						</tr> }
						{ cReserves && <tr>
							<td>
								<div className="blob oil c"/>
							</td>
							<td>{ getText( 'oil' ) } : { getText( 'against_contingent' ) }</td>
						</tr> }
						{ cReserves && <tr>
							<td>
								<div className="blob coal c"/>
							</td>
							<td>{ getText( 'coal' ) } : { getText( 'against_contingent' ) }</td>
						</tr> }
						{ ( !cReserves && !pReserves ) && <tr>
							<td/>
							<td style={ { maxWidth: 200 } }>{ getText( 'no_reserves' ) }</td>
						</tr> }
					</tbody>
				</table>

			</div>

			<style jsx>{ `
              :global(path.projection) {
                stroke: #333333;
                stroke-width: 2;
                stroke-dasharray: 0;
                stroke-opacity: 0.2;
              }

              :global(path.projection.auth) {
                stroke: #333333;
                stroke-width: 3;
                stroke-dasharray: 0;
                stroke-opacity: 0.4;
              }

              :global(path.reserves) {
                stroke-width: 3;
              }

              :global(path.projection.reserves) {
                stroke-dasharray: 4;
              }

              :global(path.reserves.oil) {
                stroke: #b1663d;
              }

              :global(path.reserves.gas) {
                stroke: #4382b3;
              }

			  :global(path.reserves.gas) {
                stroke: #433333;
              }

              .graph {
                position: relative;
                min-height: 500px;
                max-height: 700px;
              }

              @media (max-width: ${ theme[ '@screen-sm' ] }) {
                .graph {
                  min-height: 350px;
                  max-height: 500px;
                }
              }

              .legend {
                position: absolute;
                font-size: 14px;
                top: 0px;
                right: 0px;
                border: 1px solid #dddddd;
                border-radius: 8px;
                padding: 8px 12px 12px;
                background-color: rgba(255, 255, 255, 0.5);
              }

              .blob {
                height: 16px;
                width: 16px;
                border-radius: 6px;
                border: 1px solid #dddddd;
                margin-right: 6px;
              }

              .oil.past {
                background-color: ${ colors.oil.past };
              }

              .gas.past {
                background-color: ${ colors.gas.past };
              }

			  .coal.past {
                background-color: ${ colors.coal.past };
              }

              .oil.p {
                background-color: ${ colors.oil.reserves };
              }

              .gas.p {
                background-color: ${ colors.gas.reserves };
              }

			  .coal.p {
                background-color: ${ colors.coal.reserves };
              }

              .oil.c {
                background-color: ${ colors.oil.contingent };
              }

              .gas.c {
                background-color: ${ colors.gas.contingent };
              }

			  .coal.c {
                background-color: ${ colors.coal.contingent };
              }
			` }
			</style>
		</div> )
}

export default withParentSize( withTooltip( CO2ForecastGraphBase ) )
