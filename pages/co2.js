import { useState } from "react"
import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'
import CountrySelector from "components/navigation/CountrySelector"
import { Checkbox, Col, Radio, Row, Slider } from "antd"
import { useRouter } from "next/router"
import CO2Forecast from "components/viz/CO2Forecast"
import useText from "lib/useText"

const DEBUG = false

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const radioStyle = {
	display: 'block',
	height: '30px',
	lineHeight: '30px',
}

export default function CO2ForecastPage() {
	const router = useRouter()
	const { getText } = useText()
	const [ country, set_country ] = useState()
	const [ grades, set_grades ] = useState( {} )
	const [ estimate, set_estimate ] = useState( 2 )
	const [ estimate_prod, set_estimate_prod ] = useState( 2 )
	const [ projection, set_projection ] = useState( 'decline' )
	const [ allSources, set_allSources ] = useState( [] )
	const [ selectedSources, set_selectedSources ] = useState( [] )

	return (
		<>
			<div className="page">
				<TopNavigation/>

				<div className="co2">
					<Row gutter={[ 12, 12 ]}>

						<Col xs={12} lg={6}>
							<h3>{getText( 'country' )}</h3>
							<CountrySelector
								country={country}
								onChange={c => {
									set_country( c.value )
									router.replace( {
										pathname: router.pathname,
										query: { ...router.query, country: c.value }
									} )
								}}
							/>
						</Col>

						<Col xs={12} lg={4}>
							<h3>{getText( 'data_source' )}</h3>
							<Row gutter={[ 12, 12 ]}>
								{allSources.map( source => (
									<Col xs={24} key={source?.sourceId}>
										<Checkbox
											checked={selectedSources[ source?.sourceId ]?.enabled}
											onChange={
												e => set_selectedSources(
													s => {
														let srcs = [ ...s ]
														srcs[ source.sourceId ] = {
															...source,
															enabled: e.target.checked
														}
														return srcs
													}
												)
											}
										>
											{source?.name}
										</Checkbox>
									</Col>
								) )}
							</Row>
						</Col>

						<Col xs={12} lg={3}>
							<h3>{getText( 'grades' )}</h3>
							<Row gutter={[ 12, 12 ]}>
								{Object.keys( grades ).map( grade => (
									<Col xs={24} key={grade}>
										<Checkbox
											checked={grades[ grade ]}
											onChange={
												e => set_grades(
													g => ( { ...g, [ grade ]: e.target.checked } )
												)
											}
										>
											{grade}
										</Checkbox>
									</Col>
								) )}
							</Row>
						</Col>

						<Col xs={12} lg={5}>
							<div>
								<h3>{getText( 'projection' )}</h3>
								<Radio.Group onChange={e => set_projection( e.target.value )} value={projection}>
									<Radio style={radioStyle} value={'auth'}>
										{getText( 'authority' )}
									</Radio>
									<Radio style={radioStyle} value={'stable'}>
										{getText( 'stable' )}
									</Radio>
									<Radio style={radioStyle} value={'decline'}>
										{getText( 'declining' )}
									</Radio>
								</Radio.Group>
							</div>
						</Col>

						<Col xs={24} lg={6}>
							<h3>{getText( 'estimates' )}</h3>
							<Slider
								trackStyle={{ height: '12px' }}
								railStyle={{ height: '12px' }}
								handleStyle={{ height: '22px', width: '22px' }}
								tooltipVisible={false}
								value={estimate}
								dots={false}
								step={0.1}
								min={0}
								max={4}
								marks={{
									0: getText( 'low' ) ,
									2: getText( 'reserves' ),
									4: getText( 'high' )
								}}
								onChange={set_estimate}
							/>
							<br/>
							<Slider
								trackStyle={{ height: '12px' }}
								railStyle={{ height: '12px' }}
								handleStyle={{ height: '22px', width: '22px' }}
								tooltipVisible={false}
								value={estimate_prod}
								dots={false}
								step={0.1}
								min={0}
								max={4}
								marks={{
									0: getText( 'low' ) ,
									2: getText( 'production' ),
									4: getText( 'high' )
								}}
								onChange={set_estimate_prod}
							/>
						</Col>

						<Col xs={24}>
							<CO2Forecast
								country={country}
								sources={selectedSources}
								grades={grades}
								estimate={estimate}
								estimate_prod={estimate_prod}
								projection={projection}
								onGrades={set_grades}
								onSources={set_allSources}
							/>
						</Col>

					</Row>
				</div>

				<style jsx>{`
                  .co2 {
                    padding: 0 40px;
                  }
				  
				  @media (max-width: ${theme[ '@screen-sm' ]}) {
                  	.co2 {
                    	padding: 0 18px;
                  	}
				  }
				  
                  h3 {
                    margin-bottom: 12px !important;
                  }

                  .co2 :global(.ant-slider-mark) {
                    top: 25px;
                  }

                  .co2 :global(.ant-slider-dot) {
                    height: 20px;
                    width: 20px;
                    top: -4px;
                    transform: translateX(-6.5px);
                  }
				`}
				</style>

			</div>
		</>
	)
}

export { getStaticProps } from '../lib/getStaticProps'