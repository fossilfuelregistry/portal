import React, { useEffect } from "react"
import useText from "lib/useText"
import HelpModal from "../HelpModal"
import { addToTotal, sumOfCO2 } from "./calculate"
import { useSelector } from "react-redux"
import SummaryRow from "./SummaryRow"
import settings from "../../settings"
import CsvDownloader from "react-csv-downloader"
import { Col, Row } from "antd"
import { DownloadOutlined } from "@ant-design/icons"
import useCsvDataTranslator from "lib/useCsvDataTranslator"
import useCO2CostConverter from "lib/useCO2CostConverter"
import { formatCsvNumber } from "lib/numberFormatter"

import useNumberFormatter from "lib/useNumberFormatter"

const DEBUG = false

function InputSummary( { dataset = [] } ) {
	const { getText } = useText()
	const { generateCsvTranslation } = useCsvDataTranslator()
	const country = useSelector( redux => redux.country )
	const productionSourceId = useSelector( redux => redux.productionSourceId )

	const costPerTonCO2 = useSelector( redux => redux.co2CostPerTon )
	const { currentUnit, costMultiplier } = useCO2CostConverter()
	const numberFormatter = useNumberFormatter()





	if( !( dataset?.length > 0 ) ) return null

	const totals = {}
	settings.supportedFuels.forEach( fuel => totals[ fuel ] = { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] } )

	const sourceData = dataset.filter( p => p.sourceId === parseInt( productionSourceId ) )
	sourceData.forEach( datapoint => {
		addToTotal( totals[ datapoint.fossilFuelType ], datapoint.co2 )
	} )

	const totalsInCO2OrCost = {}
	 Object.entries( totals ).forEach( ( [ fuel, scopes ] ) => {
		 totalsInCO2OrCost[ fuel ] = {}
		Object.entries( scopes ).forEach( ( [ scope, value ] )=> {
			totalsInCO2OrCost[ fuel ][ scope ] =  value.map( v=> v * costMultiplier )
		} )
	} )

	const csvData = settings.supportedFuels.map( fuel => (
		{
			fuel,
			scope1_low: formatCsvNumber( totalsInCO2OrCost[ fuel ]?.scope1[ 0 ] ),
			scope1_mid: formatCsvNumber( totalsInCO2OrCost[ fuel ]?.scope1[ 1 ] ),
			scope1_high: formatCsvNumber( totalsInCO2OrCost[ fuel ]?.scope1[ 2 ] ),
			scope3_low: formatCsvNumber( totalsInCO2OrCost[ fuel ]?.scope3[ 0 ] ),
			scope3_mid: formatCsvNumber( totalsInCO2OrCost[ fuel ]?.scope3[ 1 ] ),
			scope3_high: formatCsvNumber( totalsInCO2OrCost[ fuel ]?.scope3[ 2 ] ),
		} )
	)

	DEBUG && console.info( 'InputSummary', { totalsInCO2OrCost, csvData, dataset, productionSourceId, sourceData } )

	const translatedCsvData = csvData.map( generateCsvTranslation )

	const _ = v => Math.round( v )

	return (
		<div className="table-wrap">
			<table>
				<thead>
					<tr>
						<th colSpan={ 4 }>
							<Row gutter={ 12 } style={ { display: 'inline-flex' } }>
								<Col>
									{ getText( 'historic_heading' ) }
								</Col>
								<Col>
									<CsvDownloader
										datas={ translatedCsvData }
										filename={ country + '_historic_emissions.csv' }
									>
										<DownloadOutlined/>
									</CsvDownloader>
								</Col>
								<Col>
									<HelpModal title="historic_heading" content="historic_heading_explanation"/>
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
							totals={ totalsInCO2OrCost[ fuel ] }
						/>
					) ) }
					<tr className="total subheader">
						<td>{ getText( 'totals' ) }</td>
						<td align="right">{ numberFormatter( _( sumOfCO2( totals, 0 ) ) * costMultiplier ) }</td>
						<td align="right">{ numberFormatter( _( sumOfCO2( totals, 1 ) ) * costMultiplier ) }</td>
						<td align="right">{ numberFormatter( _( sumOfCO2( totals, 2 ) ) * costMultiplier ) }</td>
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
