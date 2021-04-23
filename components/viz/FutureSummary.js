import React from "react"
import Loading from "components/Loading"
import useText from "lib/useText"
import { addCO2 } from "./util"
import { Switch } from "antd"
import { useDispatch, useSelector } from "react-redux"

const DEBUG = false

function FutureSummary( { data = [] } ) {
	const { getText } = useText()
	const gwp = useSelector( redux => redux.gwp )
	const dispatch = useDispatch()

	if( !( data?.length > 0 ) ) return <Loading/>

	const totals = {
		oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
		gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
	}

	data.forEach( point => {
		addCO2( totals, 'oil', point.production.oil )
		addCO2( totals, 'gas', point.production.gas )
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
						<td>{getText( '...' )}</td>
						<td align="right">...</td>
						<td align="right">Unit</td>
					</tr>
					<tr>
						<td>{getText( '...' )}</td>
						<td align="right">...</td>
						<td align="right">Unit</td>
					</tr>
					<tr>
						<td>{getText( '...' )}</td>
						<td align="right">...</td>
						<td align="right">Unit</td>
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
