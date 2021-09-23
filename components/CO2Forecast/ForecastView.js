import React from "react"
import { Button, Col, Divider, Row } from "antd"
import useText from "lib/useText"
import InputSummary from "./InputSummary"
import { useSelector } from "react-redux"
import YearSummary from "./YearSummary"
import FutureSummary from "./FutureSummary"
import InputDataGraph from "components/viz/InputDataGraph"
import Download from "./Download"
import CO2ForecastGraph from "components/viz/CO2ForecastGraph"
import LeafletNoSSR from "components/geo/LeafletNoSSR"

const DEBUG = false

function ForecastView( { production, projection, reserves, projectedProduction, limits, projectionSources } ) {
	const { getText } = useText()
	const country = useSelector( redux => redux.country )
	const projectGeo = useSelector( redux => redux.projectGeo )

	DEBUG && console.info( 'ForecastView', {
		production,
		projection,
		reserves,
		projectedProduction,
		limits,
		projectGeo
	} )

	return (
		<>
			<Row gutter={ [ 32, 32 ] }>
				<Col xs={ 24 } xl={ 24 } xxl={ 16 }>
					<div className="big-graph-wrap">
						<CO2ForecastGraph
							production={ production }
							projection={ projection }
							reserves={ reserves }
							projectedProduction={ projectedProduction }
							limits={ limits }
						/>
					</div>
				</Col>

				<Col xs={ 24 } xl={ 24 } xxl={ 8 }>
					<Row gutter={ [ 32, 32 ] }>
						<Col xs={ 24 } xl={ 12 } xxl={ 24 }>
							<YearSummary dataset={ production } limits={ limits }/>
						</Col>

						<Col xs={ 24 } xl={ 12 } xxl={ 24 }>
							<InputSummary dataset={ production }/>
						</Col>

						<Col xs={ 24 } xl={ 12 } xxl={ 24 }>
							<FutureSummary
								dataset={ projection }
								limits={ limits }
								projectionSources={ projectionSources }
							/>
						</Col>

					</Row>

				</Col>
			</Row>

			<Divider style={ { marginTop: 48 } }><h4>{ getText( 'input_data_overview' ) }</h4></Divider>

			<div className="tldr">{ getText( 'input_data_overview_description' ) }</div>

			<Row gutter={ [ 32, 32 ] }>

				{ !!projectGeo &&
				<Col xs={ 24 } md={ 12 } xxl={ 12 }>
					<div className="graph-wrap">
						<LeafletNoSSR
							className="project-geo"
							outlineGeometry={ projectGeo }
						/>
					</div>
				</Col> }

				{ production?.length > 0 &&
				<Col xs={ 24 } md={ 12 } xxl={ 12 }>
					<div className="graph-wrap">
						<h4>{ getText( 'gas' ) + ' ' + getText( 'production' ) } e9m3</h4>
						<InputDataGraph data={ production } fuel="gas" comment="PROD"/>
						<Download data={ production } filename={ 'gas_production_' + country } fuel="gas">
							<Button className="download" block>{ getText( 'download' ) }</Button>
						</Download>
					</div>
				</Col> }

				{ reserves?.length > 0 &&
				<Col xs={ 24 } md={ 12 } xxl={ 12 }>
					<div className="graph-wrap">
						<h4>{ getText( 'gas' ) + ' ' + getText( 'reserves' ) } e9m3</h4>
						<InputDataGraph data={ reserves } fuel="gas" comment="RES"/>
						<Download data={ reserves } filename={ 'gas_reserves_' + country } fuel="gas">
							<Button className="download" block>{ getText( 'download' ) }</Button>
						</Download>
					</div>
				</Col> }

				{ production?.length > 0 &&
				<Col xs={ 24 } md={ 12 } xxl={ 12 }>
					<div className="graph-wrap">
						<h4>{ getText( 'oil' ) + ' ' + getText( 'production' ) } e6bbl</h4>
						<InputDataGraph data={ production } fuel="oil" comment="PROD"/>
						<Download data={ production } filename={ 'oil_production_' + country } fuel="oil">
							<Button className="download" block>{ getText( 'download' ) }</Button>
						</Download>
					</div>
				</Col> }

				{ reserves?.length > 0 &&
				<Col xs={ 24 } md={ 12 } xxl={ 12 }>
					<div className="graph-wrap">
						<h4>{ getText( 'oil' ) + ' ' + getText( 'reserves' ) } e6bbl</h4>
						<InputDataGraph data={ reserves } fuel="oil" comment="RES"/>
						<Download data={ reserves } filename={ 'oil_reserves_' + country } fuel="oil">
							<Button className="download" block>{ getText( 'download' ) }</Button>
						</Download>
					</div>
				</Col> }

			</Row>

			<style jsx>{ `
              .graph-wrap {
                background-color: #eeeeee;
                padding: 16px;
                border-radius: 8px;
              }

              .big-graph-wrap {
                background-color: #f7f7f7;
                padding: 12px;
                border-radius: 8px;
                height: 100%;
                max-height: 60vh;
              }

              .tldr {
                max-width: 500px;
                padding-bottom: 32px;
                margin: 0 auto;
              }
			` }
			</style>
		</> )
}

export default ForecastView
