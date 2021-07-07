import React from "react"
import useText from "lib/useText"
import { useSelector } from "react-redux"
import { useUnitConversionGraph } from "../viz/UnitConverter"
import { addToTotal, sumOfCO2 } from "./calculate"

const DEBUG = true

function FutureSummary( { dataset, limits } ) {
	const { getText } = useText()
	const { co2FromVolume } = useUnitConversionGraph()
	const stableProduction = useSelector( redux => redux.stableProduction )
	const allSources = useSelector( redux => redux.allSources )
	const projectionSourceId = useSelector( redux => redux.projectionSourceId )

	if( !( dataset?.length > 0 ) ) return null

	DEBUG && console.log( { projectionSourceId, allSources, limits, stableProduction } )

	const stable = {
		oil: co2FromVolume( stableProduction.oil ),
		gas: co2FromVolume( stableProduction.gas )
	}

	const projectionSource = allSources.find( s => s.sourceId === projectionSourceId )
	if( !projectionSource ) return null
	let sourceName = projectionSource?.name
	if( sourceName.startsWith( 'name_' ) ) sourceName = getText( sourceName )

	const year = dataset.reduce( ( yrs, datapoint ) => {
		yrs.first = Math.min( datapoint.year, yrs.first ?? 9999 )
		yrs.last = Math.max( datapoint.year, yrs.last ?? 0 )
		return yrs
	}, {} )
	year.first = Math.max( new Date().getFullYear(), year.first )
	const years = 1 + year.last - year.first

	const sourceTotal = {
		oil: { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] },
		gas: { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] }
	}

	dataset.forEach( d => {
		if( d.year < year.first ) return
		addToTotal( sourceTotal[ d.fossilFuelType ], d.co2 )
	} )

	DEBUG && console.log( { years, year, stable } )

	const _ = v => Math.round( v )

	return (
		<div className="table-wrap">
			<table>
				<thead>
					<tr>
						<th colSpan={ 4 }>{ getText( 'future_emissions' ) } e9 kg CO²e</th>
					</tr>
				</thead>
				<tbody>
					<tr className="subheader">
						<td align="right"/>
						<td align="right">{ getText( 'low' ) }</td>
						<td align="right">{ getText( 'mid' ) }</td>
						<td align="right">{ getText( 'high' ) }</td>
					</tr>
					<tr>
						<td>{ sourceName }</td>
						<td align="right">{ _( sumOfCO2( sourceTotal, 0 ) ) }</td>
						<td align="right">{ _( sumOfCO2( sourceTotal, 1 ) ) }</td>
						<td align="right">{ _( sumOfCO2( sourceTotal, 2 ) ) }</td>
					</tr>
					<tr>
						<td>{ getText( 'stable' ) }</td>
						<td align="right">{ _( years * sumOfCO2( stable, 0 ) ) }</td>
						<td align="right">{ _( years * sumOfCO2( stable, 1 ) ) }</td>
						<td align="right">{ _( years * sumOfCO2( stable, 2 ) ) }</td>
					</tr>
				</tbody>
			</table>

			<style jsx>{ `
              .table-wrap {
                border: 1px solid #dddddd;
                border-radius: 8px;
              }

              table tr:first-child th:first-child {
                border-top-left-radius: 8px;
              }

              table tr:first-child th:last-child {
                border-top-right-radius: 8px;
              }

              table {
                width: 100%;
              }

              th {
                background-color: #eeeeee;
              }

              th, td {
                padding: 3px 12px;
              }

              .subheader td {
                background-color: #eeeeee;
              }

              .total td {
                font-weight: 700;
              }
			` }
			</style>
		</div>
	)
}

export default FutureSummary
