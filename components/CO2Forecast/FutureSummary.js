import React from "react"
import useText from "lib/useText"
import { useSelector } from "react-redux"
import clone from 'clone'

const DEBUG = false

function FutureSummary( { dataset, limits } ) {
	const { getText } = useText()
	const bestReservesSourceId = useSelector( redux => redux.reservesSourceId )
	const allSources = useSelector( redux => redux.allSources )
	const reservesSource = allSources?.find( s => s.sourceId === bestReservesSourceId ) ?? {}

	if( !( dataset?.length > 0 ) ) return null

	const totals = {
		oil: { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] },
		gas: { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] }
	}

	const stable = clone( totals )
	const selected = clone( totals )

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
					<tr/>
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
			` }
			</style>
		</div>
	)
}

export default FutureSummary
