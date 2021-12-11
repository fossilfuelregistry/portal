import HelpModal from "components/HelpModal"
import React from "react"
import useText from "lib/useText"
import { sumOfCO2 } from "./calculate"

export default function SummaryRow( { label, totals, total } ) {
	const { getText } = useText()
	const _ = v => Math.round( v )

	return (
		<>
			<tr className="subheader">
				<td>{ label }</td>
				<td align="right">{ getText( 'low' ) } <HelpModal title="ranges" content="P5"/></td>
				<td align="right">{ getText( 'mid' ) } <HelpModal title="historic_heading" content="WA"/></td>
				<td align="right">{ getText( 'high' ) } <HelpModal title="historic_heading" content="P95"/></td>
			</tr>
			<tr>
				<td>
					{ getText( 'scope' ) } 1
					<HelpModal title="scopes" content="scope_1"/>
				</td>
				<td align="right">{ _( totals.scope1[ 0 ] ) }</td>
				<td align="right">{ _( totals.scope1[ 1 ] ) }</td>
				<td align="right">{ _( totals.scope1[ 2 ] ) }</td>
			</tr>
			<tr>
				<td>
					{ getText( 'scope' ) } 3
					<HelpModal title="scopes" content="scope_3"/>
				</td>
				<td align="right">{ _( totals.scope3[ 0 ] ) }</td>
				<td align="right">{ _( totals.scope3[ 1 ] ) }</td>
				<td align="right">{ _( totals.scope3[ 2 ] ) }</td>
			</tr>
			<tr className="total">
				<td>{ total }</td>
				<td align="right">{ _( sumOfCO2( totals, 0 ) ) }</td>
				<td align="right">{ _( sumOfCO2( totals, 1 ) ) }</td>
				<td align="right">{ _( sumOfCO2( totals, 2 ) ) }</td>
			</tr>

			<style jsx>{ `
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

		</>
	)
}