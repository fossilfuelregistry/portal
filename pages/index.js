import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'
import dynamic from "next/dynamic"
import { Col, Slider, Radio, Row } from "antd"
import { useCallback, useState } from "react"

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const GlobeNoSSR = dynamic( () => import( "components/geo/GlobeNoSSR" ),
	{ ssr: false } )

export default function Home() {
	const [ year, set_year ] = useState( 2019 )
	const [ dataKeyName, set_dataKeyName ] = useState( 'production' )

	const handleChangeKeyName = useCallback( event => {
		set_dataKeyName( event.target.value )
	}, [] )

	return (
		<div className="page">

			<TopNavigation/>

			<div className="content-block globe-controls">
				<Row gutter={[ 4, 12 ]}>
					<Col xs={24} md={16}>
						<Slider
							trackStyle={{ height: '12px' }}
							railStyle={{ height: '12px' }}
							handleStyle={{ height: '22px', width: '22px' }}
							tooltipVisible={true}
							min={1970}
							max={2021}
							onChange={set_year}
							value={year}
						/>
					</Col>
					<Col xs={24} md={8} style={{ textAlign: 'center' }}>
						<Radio.Group
							options={[
								{ label: 'PRODUCTION', value: 'production' },
								{ label: 'RESERVES', value: 'reserves' },
							]}
							onChange={handleChangeKeyName}
							value={dataKeyName}
							optionType="button"
							buttonStyle="solid"
						/>
					</Col>
				</Row>

			</div>

			<div className="content-block">
				<GlobeNoSSR year={year} dataKeyName={dataKeyName}/>
			</div>

			<style jsx>{`
              @media (max-width: ${theme[ '@screen-sm' ]}) {
              }
			`}
			</style>

		</div>
	)
}

export { getStaticProps } from '../lib/getStaticProps'
