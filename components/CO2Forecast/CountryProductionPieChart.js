import useText from "lib/useText"
import { useMemo } from "react"
import getConfig from "next/config"
import PieChart from "components/viz/PieChart"
import { useSelector } from "react-redux"
import { Col, Row } from "antd"

const colors = {
	oil: '#2b8d6e',
	gas: '#dc8c3d',
	coal: '#3497b6'
}

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

export default function CountryProductionPieChart( { project, emissions, co2, produtionMegatons } ) {
	const { getText } = useText()
	const countryName = useSelector( redux => redux.countryName )

	const pieChartData = useMemo( () => {
		if( !( emissions?.total > 0 ) ) return []
		const slices = []
		const total = emissions.total
		for( const [ key, value ] of Object.entries( emissions ) ) {
			if( key === 'total' ) continue
			slices.push( {
				label: key,
				quantity: value,
				percentage: Math.round( ( value * 100 ) / total ),
				fillColor: colors[ key ]
			} )
		}
		return slices
	}, [ emissions ] )

	const ratio = co2 / ( emissions?.total ?? 1 )
	const projectRadius = 83 * Math.sqrt( ratio )

	return (
		<div className="co2-card">
			<div
				className="header"
				title={ project?.id }
			>
				{ getText( 'emissions' ) } - { getText( 'current_annual_estimate' ) }
			</div>
			<div className="box">
				<Row align={ 'middle' }>
					<Col xs={ ( project ? 14 : 24 ) }>
						<div style={ { height: 400 } }>
							<PieChart
								data={ pieChartData }
								topNote={ countryName + ' ' + getText( 'total' ) }
								header={ emissions?.total?.toFixed( 0 ) }
								note={ getText( 'megaton' ) + ' CO²e' }
							/>
						</div>
					</Col>
					{ !!project &&
					<Col xs={ 10 } style={ { textAlign: 'center' } }>
						<div style={ { height: 200 } }>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" height="100%" width="100%">
								<circle fill={ colors.coal } className="cls-1" cx="50" cy="50" r={ projectRadius }/>
								<text
									y={ 80 }
									fill="#000000d9"
									fontSize={ 14 }
									fontFamily={ 'sommet-rounded' }
									fontWeight={ 'bold' }
									textAnchor="middle"
								>
									<tspan x={ 50 }>{ ( ratio * 100 ).toFixed( 2 ) }%</tspan>
									<tspan x={ 50 } dy={ 16 }>{ project.projectId }</tspan>
								</text>
							</svg>
						</div>
						{ getText( 'production' ) }: { produtionMegatons } { getText( 'megaton' ) } { project.fossilFuelType }
						<br/>
						{ getText( 'emissions' ) }: { co2.toFixed( 2 ) } { getText( 'megaton' ) } CO²e
					</Col>
					}
				</Row>
			</div>
		</div>
	)
}
