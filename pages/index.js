import { useContext, useState } from "react"
import { Col, Row } from 'antd'
import NavigDrawer from "components/navigation/NavigDrawer"
import I18nContext from "components/i18nContext"
import { CgMenu } from 'react-icons/cg'
import getConfig from 'next/config'

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

export default function Home( props ) {
	const i18n = useContext( I18nContext )
	const [ visible, setVisible ] = useState( false )
	const showDrawer = () => {
		setVisible( true )
	}
	const onClose = () => {
		setVisible( false )
	}

	return (
		<div className="navigation">
			<Row gutter={12} align="middle">
				<Col>
					<CgMenu onClick={showDrawer}/>
				</Col>
				<Col>
					<img src="/SVG/gffr-logo.svg" alt="GFFR Logo" height={40}/>
				</Col>
				<Col>
					<h4>Global Fossil Fuel Reserve</h4>
				</Col>
			</Row>

			<NavigDrawer visible={visible} onClose={onClose}/>

			<style jsx>{`
              .navigation {
                padding: 40px;
                font-size: 32px;
                line-height: 1;
              }

              @media (max-width: ${theme[ '@screen-sm' ]}) {
                .navigation {
                  padding: 16px 24px;
                }
              }
			`}</style>

		</div>
	)
}

export { getStaticProps } from '../functions/getStaticProps'
