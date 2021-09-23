import React from "react"
import useText from "lib/useText"
import HelpModal from "../HelpModal"
import { addToTotal, sumOfCO2 } from "./calculate"
import { useSelector } from "react-redux"
import SummaryRow from "./SummaryRow"
import settings from "../../settings"

const DEBUG = false

function InputSummary( { dataset = [] } ) {
	const { getText } = useText()
	const productionSourceId = useSelector( redux => redux.productionSourceId )

	if( !( dataset?.length > 0 ) ) return null

	const totals = {}
	settings.supportedFuels.forEach( fuel => totals[ fuel ] = { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] } )

	const sourceData = dataset.filter( p => p.sourceId === parseInt( productionSourceId ) )
	sourceData.forEach( datapoint => {
		addToTotal( totals[ datapoint.fossilFuelType ], datapoint.co2 )
	} )

	DEBUG && console.info( 'InputSummary', { dataset, productionSourceId, sourceData } )

	const _ = v => Math.round( v )

	return (
		<div className="table-wrap">
			<table>
				<thead>
					<tr>
						<th colSpan={ 4 }>
							{ getText( 'past_emissions' ) } { getText( 'megaton' ) } CO²e
							<HelpModal title="ranges" content="explanation_ranges"/>
						</th>
					</tr>
				</thead>
				<tbody>
					<SummaryRow
						label={ getText( 'oil' ) }
						total={ getText( 'oil' ) + ' ' + getText( 'total' ) }
						totals={ totals.oil }
					/>
					<SummaryRow
						label={ getText( 'gas' ) }
						total={ getText( 'gas' ) + ' ' + getText( 'total' ) }
						totals={ totals.gas }
					/>
					<tr className="total subheader">
						<td>{ getText( 'totals' ) }</td>
						<td align="right">{ _( sumOfCO2( totals, 0 ) ) }</td>
						<td align="right">{ _( sumOfCO2( totals, 1 ) ) }</td>
						<td align="right">{ _( sumOfCO2( totals, 2 ) ) }</td>
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
