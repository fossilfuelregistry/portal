import React from "react"
import Loading from "components/Loading"
import useText from "lib/useText"
import HelpModal from "../HelpModal"
import { addToTotal } from "./calculate"

//const DEBUG = false

function InputSummary( { dataset = [] } ) {
	const { getText } = useText()

	if( !( dataset?.length > 0 ) ) return <Loading/>

	const totals = {
		oil: { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] },
		gas: { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] }
	}

	dataset.forEach( datapoint => {
		addToTotal( totals.oil, 'oil', datapoint.production.oil )
		addToTotal( totals.gas, 'gas', datapoint.production.gas )
	} )

	const _ = v => Math.round( v )

	return (
		<div className="table-wrap">
			<table>
				<thead>
					<tr>
						<th colSpan={ 4 }>
							{ getText( 'past_emissions' ) } e9 kg CO²e
							<HelpModal title="ranges" content="explanation_ranges"/>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr className="subheader">
						<td>{ getText( 'oil' ) }</td>
						<td align="right">{ getText( 'low' ) }</td>
						<td align="right">{ getText( 'mid' ) }</td>
						<td align="right">{ getText( 'high' ) }</td>
					</tr>
					<tr>
						<td>
							{ getText( 'scope' ) } 1
							<HelpModal title="scopes" content="scope_1"/>
						</td>
						<td align="right">{ _( totals.oil.scope1.range[ 0 ] ) }</td>
						<td align="right">{ _( totals.oil.scope1.co2 ) }</td>
						<td align="right">{ _( totals.oil.scope1.range[ 1 ] ) }</td>
					</tr>
					<tr>
						<td>
							{ getText( 'scope' ) } 3
							<HelpModal title="scopes" content="scope_2"/>
						</td>
						<td align="right">{ _( totals.oil.scope3.range[ 0 ] ) }</td>
						<td align="right">{ _( totals.oil.scope3.co2 ) }</td>
						<td align="right">{ _( totals.oil.scope3.range[ 1 ] ) }</td>
					</tr>
					<tr className="total">
						<td>{ getText( 'oil' ) } { getText( 'total' ) }</td>
						<td align="right">{ _( totals.oil.scope1.range[ 0 ] + totals.oil.scope3.range[ 0 ] ) }</td>
						<td align="right">{ _( totals.oil.scope1.co2 + totals.oil.scope3.co2 ) }</td>
						<td align="right">{ _( totals.oil.scope1.range[ 1 ] + totals.oil.scope3.range[ 1 ] ) }</td>
					</tr>

					<tr className="subheader">
						<td>{ getText( 'gas' ) }</td>
						<td align="right">{ getText( 'low' ) }</td>
						<td align="right">{ getText( 'mid' ) }</td>
						<td align="right">{ getText( 'high' ) }</td>
					</tr>
					<tr>
						<td>
							{ getText( 'scope' ) } 1
							<HelpModal title="scopes" content="scope_1"/>
						</td>
						<td align="right">{ _( totals.gas.scope1.range[ 0 ] ) }</td>
						<td align="right">{ _( totals.gas.scope1.co2 ) }</td>
						<td align="right">{ _( totals.gas.scope1.range[ 1 ] ) }</td>
					</tr>
					<tr>
						<td>
							{ getText( 'scope' ) } 3
							<HelpModal title="scopes" content="scope_3"/>
						</td>
						<td align="right">{ _( totals.gas.scope3.range[ 0 ] ) }</td>
						<td align="right">{ _( totals.gas.scope3.co2 ) }</td>
						<td align="right">{ _( totals.gas.scope3.range[ 1 ] ) }</td>
					</tr>
					<tr className="total">
						<td>{ getText( 'gas' ) } { getText( 'total' ) }</td>
						<td align="right">{ _( totals.gas.scope1.range[ 0 ] + totals.gas.scope3.range[ 0 ] ) }</td>
						<td align="right">{ _( totals.gas.scope1.co2 + totals.gas.scope3.co2 ) }</td>
						<td align="right">{ _( totals.gas.scope1.range[ 1 ] + totals.gas.scope3.range[ 1 ] ) }</td>
					</tr>
					<tr className="total subheader">
						<td>{ getText( 'totals' ) }</td>
						<td align="right">{ _( totals.gas.scope1.range[ 0 ] + totals.gas.scope3.range[ 0 ] + totals.oil.scope1.range[ 0 ] + totals.oil.scope3.range[ 0 ] ) }</td>
						<td align="right">{ _( totals.gas.scope1.co2 + totals.gas.scope3.co2 + totals.oil.scope1.co2 + totals.oil.scope3.co2 ) }</td>
						<td align="right">{ _( totals.gas.scope1.range[ 1 ] + totals.gas.scope3.range[ 1 ] + totals.oil.scope1.range[ 1 ] + totals.oil.scope3.range[ 1 ] ) }</td>
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

export default InputSummary
