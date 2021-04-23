import React from "react"
import Loading from "components/Loading"
import useText from "lib/useText"
import { getCO2 } from "./util"
import { Switch } from "antd"
import { useDispatch, useSelector } from "react-redux"

const DEBUG = false

function FutureSummary( { data = [] } ) {
	const { getText } = useText()
	const gwp = useSelector( redux => redux.gwp )
	const dispatch = useDispatch()
	const bestReservesSourceId = useSelector( redux => redux.bestReservesSourceId )
	const allSources = useSelector( redux => redux.allSources )

	const reservesSource = allSources?.find( s => s.sourceId === bestReservesSourceId ) ?? {}

	if( !( data?.length > 0 ) ) return <Loading/>

	const totals = { stable: 0, decline: 0, authority: 0 }

	data.forEach( ( point, i ) => {
		if( !point.future?.stable?.production ) return
		totals.stable += getCO2( point.future.stable.production )
		totals.decline += getCO2( point.future.decline.production )
		totals.authority += getCO2( point.future.authority.production )
	} )

	const _ = v => Math.round( v )

	return (
		<div className="table-wrap">
			<table>
				<thead>
					<tr>
						<th colSpan={3}>{getText( 'future_emissions' )}</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>{getText( 'methane_gwp_ratio' )}</td>
						<td colSpan={2} align="right">
							<Switch
								checkedChildren="GWP20"
								unCheckedChildren="GWP100"
								checked={gwp}
								onChange={c => dispatch( { type: 'GWP', payload: c } )}
							/>
						</td>
					</tr>
					<tr>
						<td>{getText( 'stable' )}</td>
						<td align="right">{totals.stable?.toFixed( 1 )}</td>
						<td align="right">e9 kgCO²e</td>
					</tr>
					<tr>
						<td>{getText( 'declining' )}</td>
						<td align="right">{totals.decline?.toFixed( 1 )}</td>
						<td align="right">e9 kgCO²e</td>
					</tr>
					<tr>
						<td>{reservesSource.name}</td>
						<td align="right">{totals.authority?.toFixed( 1 )}</td>
						<td align="right">e9 kgCO²e</td>
					</tr>
				</tbody>
			</table>

			<style jsx>{`
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
			`}
			</style>
		</div>
	)
}

export default FutureSummary
