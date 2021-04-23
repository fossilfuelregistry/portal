import { useState } from "react"
import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'
import CountryProduction from "components/viz/CountryProduction"
import CountrySelector from "components/navigation/CountrySelector"
import { Checkbox, Col, Row } from "antd"
import FossilFuelTypeSelector from "components/navigation/FossilFuelTypeSelector"
import { useRouter } from "next/router"

const DEBUG = false

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

export default function CountryProductionPage() {
	const router = useRouter()
	const [ country, set_country ] = useState()
	const [ fossilFuelType, set_fossilFuelType ] = useState()
	const [ grades, set_grades ] = useState( {} )
	const [ allSources, set_allSources ] = useState( [] )
	const [ selectedSources, set_selectedSources ] = useState( [] )

	return (
		<>
			<div className="page">
				<TopNavigation/>

				<div className="co2">
					<Row gutter={[ 12, 12 ]}>

						<Col xs={24} sm={12} md={8} lg={6}>
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

						<Col xs={24} sm={12} md={8} lg={6}>
							<FossilFuelTypeSelector country={country} onChange={set_fossilFuelType}/>
						</Col>

						<Col xs={24} sm={12} md={8} lg={6}>
							<Row>
								{allSources.map( source => (
									<Col xs={6} key={source.sourceId}>
										<Checkbox
											checked={selectedSources[ source.sourceId ]?.enabled}
											onChange={
												e => set_selectedSources(
													s => {
														let srcs = [ ...s ]
														srcs[ source.sourceId ] = { ...source, enabled: e.target.checked }
														return srcs
													}
												)
											}
										>
											{source.name}
										</Checkbox>
									</Col>
								) )}
							</Row>
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
							<CountryProduction
								country={country}
								fossilFuelType={fossilFuelType}
								sources={selectedSources}
								grades={grades}
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
				`}
				</style>

			</div>
		</>
	)
}

export { getStaticProps } from '../lib/getStaticProps'
