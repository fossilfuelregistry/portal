import React from "react"
import { Alert, Col, Row } from "antd"
import useText from "lib/useText"
import InputSummary from "./InputSummary"
import { useDispatch, useSelector } from "react-redux"

const DEBUG = true

function ForecastView( { dataset, firstYear, lastYear } ) {
	const dispatch = useDispatch()
	const { getText } = useText()
	const gwp = useSelector( redux => redux.gwp )

	DEBUG && console.log( 'ForecastView', { dataset, firstYear, lastYear } )

	// Don't try to render a chart until all data looks good
	if( !firstYear || !lastYear || !dataset?.length > 0 )
		return <Alert message={ getText( 'make_selections' ) } type="info" showIcon/>

	return (
		<>
			<Row gutter={ [ 16, 16 ] }>
				<Col xs={ 24 } lg={ 14 } xxl={ 18 } />
				<Col xs={ 24 } lg={ 10 } xxl={ 6 }>
					<Row gutter={ [ 16, 16 ] }>

						<Col xs={ 24 } xl={ 24 } />

						<Col xs={ 24 } xl={ 24 } />

						<Col xs={ 24 } xl={ 24 }>
							<InputSummary dataset={ dataset }/>
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
