import { useState } from "react"
import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'
import { textsSelector, useStore } from "lib/zustandProvider"
//import dynamic from 'next/dynamic'
import CountryReserves from "components/viz/CountryReserves"
import CountrySelector from "../components/navigation/CountrySelector"
import { Checkbox, Col, Row } from "antd"
import FossilFuelTypeSelector from "../components/navigation/FossilFuelTypeSelector"

const DEBUG = false

const theme = getConfig()?.publicRuntimeConfig?.themeVariables
//const MultiView = dynamic( () => import( "components/viz/MutliViewChart" ), { ssr: false } )

export default function Wells() {
	const texts = useStore( textsSelector )
	const [ country, set_country ] = useState()
	const [ fossilFuelType, set_fossilFuelType ] = useState()
	const [ grades, set_grades ] = useState( {} )

	return (
		<>
			<div className="page">
				<TopNavigation/>

				<div className="co2">
					<Row gutter={[ 12, 12 ]}>

						<Col xs={24} sm={12} md={8} lg={6}>
							<CountrySelector country={country} onChange={set_country}/>
						</Col>

						<Col xs={24} sm={12} md={8} lg={6}>
							<FossilFuelTypeSelector country={country} onChange={set_fossilFuelType}/>
						</Col>

						<Col xs={24} sm={12} md={8} lg={6}>
							<Row>
								{Object.keys( grades ).map( grade => (
									<Col xs={6} key={grade}>
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

						<Col xs={24}>
							<CountryReserves
								country={country}
								fossilFuelType={fossilFuelType}
								grades={grades}
								onGrades={set_grades}
							/>
						</Col>

					</Row>
				</div>

				<style jsx>{`
                  .co2 {
                    padding: 0 40px;
                  }
				`}
				</style>

			</div>
		</>
	)
}

export { getStaticProps } from '../lib/getStaticProps'
