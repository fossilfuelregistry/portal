import React from "react"
import useText from "lib/useText"
import { useSelector } from "react-redux"
import HelpModal from "../HelpModal"
import SummaryRow from "./SummaryRow"
import { addToTotal } from "./calculate"

const DEBUG = false

function YearSummary( { dataset = [] } ) {
	const { getText } = useText()
	const productionSourceId = useSelector( redux => redux.productionSourceId )

	if( !( dataset?.length > 0 ) ) return null

	const totals =  { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] }

	let lastOil, lastGas
	dataset.forEach( d => {
		if( d.fossilFuelType === 'oil' ) lastOil = d
		if( d.fossilFuelType === 'gas' ) lastGas = d
	} )

	addToTotal( totals, lastGas.co2 )
	addToTotal( totals, lastOil.co2 )

	DEBUG && console.log( { lastOil, lastGas, productionSourceId, dataset } )

	let year = `(${ lastOil.year })`
	if( lastOil.year !== lastGas.year ) year = `(${ lastOil.year } / ${ lastGas.year })`

	return (
		<div className="table-wrap">
			<table>
				<thead>
					<tr>
						<th colSpan={ 4 }>
							{ getText( 'this_year' ) } { year } e9 kg CO²e
							<HelpModal title="ranges" content="explanation_ranges"/>
						</th>
					</tr>
				</thead>
				<tbody>
					<SummaryRow totals={ totals } total={ getText( 'total' ) }/>
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
			` }
			</style>
		</div> )
}

export default YearSummary
