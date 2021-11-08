import { useEffect, useState } from "react"
import { Col, Row } from 'antd'
import NavigDrawer from "components/navigation/NavigDrawer"
import { CgMenu } from 'react-icons/cg'
import getConfig from 'next/config'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useText from "lib/useText"

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

export default function TopNavigation() {
	const router = useRouter()
	const { getText } = useText()
	const [ visible, set_visible ] = useState( false )

	useEffect( () => {
		const handleRouteChange = ( url, { shallow } ) => {
			set_visible( false )
		}

		router.events.on( 'routeChangeStart', handleRouteChange )

		// If the component is unmounted, unsubscribe
		// from the event with the `off` method:
		return () => {
			router.events.off( 'routeChangeStart', handleRouteChange )
		}
	}, [] )

	const showDrawer = () => {
		set_visible( true )
	}
	const onClose = () => {
		set_visible( false )
	}

	return (
		<div className="navigation page-padding">
			<Row gutter={ 12 } align="middle">
				<Col>
					<CgMenu onClick={ showDrawer }/>
				</Col>
				<Col>
					<Link href="/"><img src="/SVG/gffr-logo.svg" alt="GFFR Logo" height={ 40 }/></Link>
				</Col>
				<Col>
					<h4>{ getText( 'grff' ) }</h4>
				</Col>
			</Row>

			<NavigDrawer visible={ visible } onClose={ onClose }/>

			<style jsx>{ `
              .navigation {
                font-size: 32px;
                line-height: 1;
              }

              .navigation :global(.social) {
                opacity: 0.5;
                transition: opacity ease-in-out 300ms;
              }

              .navigation :global(.social:hover) {
                opacity: 1;
              }

              @media (max-width: ${ theme[ '@screen-sm' ] }) {
                .navigation {
                  font-size: 22px;
                }
              }
			` }
			</style>

		</div>
	)
}
