import React from "react"
import useText from "lib/useText"
import HelpModal from "../HelpModal"
import { addToTotal, sumOfCO2 } from "./calculate"
import { useSelector } from "react-redux"
import SummaryRow from "./SummaryRow"
import settings from "../../settings"
import CsvDownloader from "react-csv-downloader"
import { Col, Row } from "antd"
import { DownloadOutlined } from "@ant-design/icons"

const DEBUG = false

function InputSummary( { dataset = [] } ) {
	const { getText } = useText()
	const country = useSelector( redux => redux.country )
	const productionSourceId = useSelector( redux => redux.productionSourceId )

	if( !( dataset?.length > 0 ) ) return null

	const totals = {}
	settings.supportedFuels.forEach( fuel => totals[ fuel ] = { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] } )

	const sourceData = dataset.filter( p => p.sourceId === parseInt( productionSourceId ) )
	sourceData.forEach( datapoint => {
		addToTotal( totals[ datapoint.fossilFuelType ], datapoint.co2 )
	} )

	const csvData = settings.supportedFuels.map( fuel => (
		{
			fuel,
			scope1_low: totals[ fuel ]?.scope1[ 0 ],
			scope1_mid: totals[ fuel ]?.scope1[ 1 ],
			scope1_high: totals[ fuel ]?.scope1[ 2 ],
			scope3_low: totals[ fuel ]?.scope3[ 0 ],
			scope3_mid: totals[ fuel ]?.scope3[ 1 ],
			scope3_high: totals[ fuel ]?.scope3[ 2 ]
		} )
	)

	DEBUG && console.info( 'InputSummary', { totals, csvData, dataset, productionSourceId, sourceData } )

	const _ = v => Math.round( v )

	return (
		<div className="table-wrap">
			<table>
				<thead>
					<tr>
						<th colSpan={ 4 }>
							<Row gutter={ 12 } style={ { display: 'inline-flex' } }>
								<Col>
									{ getText( 'past_emissions' ) } { getText( 'megaton' ) } CO²e
								</Col>
								<Col>
									<CsvDownloader
										datas={ csvData }
										filename={ country + '_historic_emissions.csv' }
									>
										<DownloadOutlined/>
									</CsvDownloader>
								</Col>
								<Col>
									<HelpModal title="ranges" content="explanation_ranges"/>
								</Col>
							</Row>
						</th>
					</tr>
				</thead>
				<tbody>
					{ settings.supportedFuels.map( fuel => (
						<SummaryRow
							key={ fuel }
							label={ getText( fuel ) }
							total={ getText( fuel ) + ' ' + getText( 'total' ) }
							totals={ totals[ fuel ] }
						/>
					) ) }
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
