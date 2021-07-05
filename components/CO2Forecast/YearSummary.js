import React from "react"
import Loading from "components/Loading"
import useText from "lib/useText"
import { addCO2 } from "./util"
import { useSelector } from "react-redux";
import HelpModal from "../HelpModal"

const DEBUG = true

const _ = v => Math.round( v )

function YearSummary( { data = [] } ) {
	const { getText } = useText()
	const productionSourceId = useSelector( redux => redux.productionSourceId )

	if( !( data?.length > 0 ) ) return <Loading/>

	const totals = {
		oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
		gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
	}

	let oil = false, gas = false, lastOilYear, lastGasYear
	for( let index = data.length - 1; index >= 0; index-- ) {
		if( oil && gas ) break
		const point = data[ index ]
		if( !oil && point.production.oil.scope3.co2 ) {
			oil = true
			addCO2( totals, 'oil', point.production.oil )
			lastOilYear = point.year
		}
		if( !gas && point.production.gas.scope3.co2 ) {
			gas = true
			addCO2( totals, 'gas', point.production.gas )
			lastGasYear = point.year
		}
	}

	DEBUG && console.log( { lastOilYear, lastGasYear, productionSourceId, data } )

	let year
	if( lastOilYear === lastGasYear )
		year = `(${lastOilYear})`
	else
		year = `(${lastOilYear} / ${lastGasYear})`

	return (
		<div className="table-wrap">
			<table>
				<thead>
					<tr>
						<th colSpan={ 4 }>
							{ getText( 'this_year' ) } {year} e9 kg CO²e
							<HelpModal title="ranges" content="explanation_ranges"/>
						</th>
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
						<td>
							{ getText( 'scope' ) } 1
							<HelpModal title="scopes" content="scope_1"/>
						</td>
						<td align="right">{ _( totals.oil.scope1.range[ 0 ] + totals.gas.scope1.range[ 0 ] ) }</td>
						<td align="right">{ _( totals.oil.scope1.co2 + totals.gas.scope1.co2 ) }</td>
						<td align="right">{ _( totals.oil.scope1.range[ 1 ] + totals.gas.scope1.range[ 1 ] ) }</td>
					</tr>
					<tr>
						<td>
							{ getText( 'scope' ) } 3
							<HelpModal title="scopes" content="scope_3"/>
						</td>
						<td align="right">{ _( totals.oil.scope3.range[ 0 ] + totals.gas.scope3.range[ 0 ] ) }</td>
						<td align="right">{ _( totals.oil.scope3.co2 + totals.gas.scope3.co2 ) }</td>
						<td align="right">{ _( totals.oil.scope3.range[ 1 ] + totals.gas.scope3.range[ 1 ] ) }</td>
					</tr>
					<tr className="total">
						<td>{ getText( 'total' ) }</td>
						<td align="right">
							{ _(
								totals.oil.scope1.range[ 0 ] + totals.gas.scope1.range[ 0 ] +
								totals.oil.scope3.range[ 0 ] + totals.gas.scope3.range[ 0 ]
							) }
						</td>
						<td align="right">
							{ _(
								totals.oil.scope1.co2 + totals.gas.scope1.co2 +
								totals.oil.scope3.co2 + totals.gas.scope3.co2
							) }
						</td>
						<td align="right">
							{ _(
								totals.oil.scope1.range[ 1 ] + totals.gas.scope1.range[ 1 ] +
								totals.oil.scope3.range[ 1 ] + totals.gas.scope3.range[ 1 ]
							) }
						</td>
					</tr>

				</tbody>
			</table>

			<style jsx>{ `
              .table-wrap {
                border: 1px solid #dddddd;
                border-radius: 8px;
                margin-bottom: 16px;
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
		</div> )
}

export default YearSummary
