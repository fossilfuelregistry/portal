import React from "react"
import Loading from "components/Loading"
import useText from "lib/useText"
import { addCO2, getCO2 } from "./util"
import { useSelector } from "react-redux"
import clone from 'clone'

const DEBUG = false

function FutureSummary( { data = [] } ) {
	const { getText } = useText()
	const bestReservesSourceId = useSelector( redux => redux.reservesSourceId )
	const allSources = useSelector( redux => redux.allSources )

	const reservesSource = allSources?.find( s => s.sourceId === bestReservesSourceId ) ?? {}

	if( !( data?.length > 0 ) ) return <Loading/>

	const _totals = {
		oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
		gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
	}

	const stable = clone( _totals )
	const authority = clone( _totals )

	data.forEach( ( point, i ) => {
		if( getCO2( point.future?.stable?.production ) <= 0 ) return
		if( point.year > 2040 ) return
		DEBUG && console.log( point.year, point.future )
		addCO2( stable, 'oil', point.future.stable.production.oil )
		addCO2( stable, 'gas', point.future.stable.production.gas )
		addCO2( authority, 'oil', point.future.authority.production.oil )
		addCO2( authority, 'gas', point.future.authority.production.gas )
	} )

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
						<td>{ getText( 'stable' ) }</td>
						<td align="right">{ _( stable.oil.scope1.range[ 0 ] + stable.oil.scope3.range[ 0 ] + stable.gas.scope1.range[ 0 ] + stable.gas.scope3.range[ 0 ] ) }</td>
						<td align="right">{ _( stable.oil.scope1.co2 + stable.oil.scope3.co2 + stable.gas.scope1.co2 + stable.gas.scope3.co2 ) }</td>
						<td align="right">{ _( stable.oil.scope1.range[ 1 ] + stable.oil.scope3.range[ 1 ] + stable.gas.scope1.range[ 1 ] + stable.gas.scope3.range[ 1 ] ) }</td>
					</tr>
					<tr>
						<td>{ reservesSource.name }</td>
						<td align="right">{ _( authority.oil.scope1.range[ 0 ] + authority.oil.scope3.range[ 0 ] + authority.gas.scope1.range[ 0 ] + authority.gas.scope3.range[ 0 ] ) }</td>
						<td align="right">{ _( authority.oil.scope1.co2 + authority.oil.scope3.co2 + authority.gas.scope1.co2 + authority.gas.scope3.co2 ) }</td>
						<td align="right">{ _( authority.oil.scope1.range[ 1 ] + authority.oil.scope3.range[ 1 ] + authority.gas.scope1.range[ 1 ] + authority.gas.scope3.range[ 1 ] ) }</td>
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

              .total {
                font-weight: 700;
              }
			` }
			</style>
		</div>
	)
}

export default FutureSummary
