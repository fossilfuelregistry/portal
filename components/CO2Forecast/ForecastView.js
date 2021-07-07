import React from "react"
import { Alert, Col, Row } from "antd"
import useText from "lib/useText"
import InputSummary from "./InputSummary"
import { useDispatch, useSelector } from "react-redux"

const DEBUG = true

function ForecastView( { production, projection, reserves, limits } ) {
	const dispatch = useDispatch()
	const { getText } = useText()
	const gwp = useSelector( redux => redux.gwp )

	DEBUG && console.log( 'ForecastView', { production, projection, reserves, limits } )

	return (
		<>
			<Row gutter={ [ 16, 16 ] }>
				<Col xs={ 24 } lg={ 14 } xxl={ 18 } />
				<Col xs={ 24 } lg={ 10 } xxl={ 6 }>
					<Row gutter={ [ 16, 16 ] }>

						<Col xs={ 24 } xl={ 24 } />

						<Col xs={ 24 } xl={ 24 } />

						<Col xs={ 24 } xl={ 24 }>
							<InputSummary dataset={ production }/>
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

              .graph-wrap :global(.download) {
                margin-top: 12px;
              }
			` }
			</style>
		</> )
}

export default ForecastView
