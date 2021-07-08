import React from "react"
import { Button, Col, Row } from "antd"
import useText from "lib/useText"
import InputSummary from "./InputSummary"
import { useSelector } from "react-redux"
import YearSummary from "./YearSummary"
import FutureSummary from "./FutureSummary"
import InputDataGraph from "components/viz/InputDataGraph"
import Download from "./Download"
import CO2ForecastGraph from "../viz/CO2ForecastGraph"

const DEBUG = false

function ForecastView( { production, projection, reserves, limits } ) {
	const { getText } = useText()
	const country = useSelector( redux => redux.country )

	DEBUG && console.log( 'ForecastView', { production, projection, reserves, limits } )

	return (
		<>
			<Row gutter={ [ 16, 16 ] }>
				<Col xs={ 24 } lg={ 14 } xxl={ 18 }>
					{ false && <CO2ForecastGraph
						production={ production }
						projection={ projection }
						reserves={ reserves }
						limits={ limits }
					           /> }
				</Col>

				<Col xs={ 24 } lg={ 10 } xxl={ 6 }>
					<Row gutter={ [ 16, 16 ] }>
						<Col xs={ 24 } xl={ 24 }>
							<FutureSummary dataset={ projection } limits={ limits }/>
						</Col>

						<Col xs={ 24 } xl={ 24 }>
							<YearSummary dataset={ production } limits={ limits }/>
						</Col>

						<Col xs={ 24 } xl={ 24 }>
							<InputSummary dataset={ production }/>
						</Col>
					</Row>

					<Row gutter={ [ 16, 16 ] }>
						<Col xs={ 24 } md={ 12 } xxl={ 6 }>
							<div className="graph-wrap">
								<h4>{ getText( 'gas' ) + ' ' + getText( 'production' ) } e9m3</h4>
								<InputDataGraph data={ production } fuel="gas" comment="PROD"/>
								<Download data={ production } filename={ 'gas_production_' + country } fuel="gas">
									<Button className="download" block>{ getText( 'download' ) }</Button>
								</Download>
							</div>
						</Col>
						<Col xs={ 24 } md={ 12 } xxl={ 6 }>
							<div className="graph-wrap">
								<h4>{ getText( 'gas' ) + ' ' + getText( 'reserves' ) } e9m3</h4>
								<InputDataGraph data={ reserves } fuel="gas" comment="RES"/>
								<Download data={ reserves } filename={ 'gas_reserves_' + country } fuel="gas">
									<Button className="download" block>{ getText( 'download' ) }</Button>
								</Download>
							</div>
						</Col>
						<Col xs={ 24 } md={ 12 } xxl={ 6 }>
							<div className="graph-wrap">
								<h4>{ getText( 'oil' ) + ' ' + getText( 'production' ) } e6bbl</h4>
								<InputDataGraph data={ production } fuel="oil" comment="PROD"/>
								<Download data={ production } filename={ 'oil_production_' + country } fuel="oil">
									<Button className="download" block>{ getText( 'download' ) }</Button>
								</Download>
							</div>
						</Col>
						<Col xs={ 24 } md={ 12 } xxl={ 6 }>
							<div className="graph-wrap">
								<h4>{ getText( 'oil' ) + ' ' + getText( 'reserves' ) } e6bbl</h4>
								<InputDataGraph data={ reserves } fuel="oil" comment="RES"/>
								<Download data={ reserves } filename={ 'oil_reserves_' + country } fuel="oil">
									<Button className="download" block>{ getText( 'download' ) }</Button>
								</Download>
							</div>
						</Col>
					</Row>

				</Col>
			</Row>

			<style jsx>{ `
              .graph-wrap {
                background-color: #eeeeee;
                padding: 16px;
                border-radius: 8px;
              }
			` }
			</style>
		</> )
}

export default ForecastView
