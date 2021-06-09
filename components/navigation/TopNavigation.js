import { useEffect, useState } from "react"
import { Col, Row } from 'antd'
import NavigDrawer from "components/navigation/NavigDrawer"
import { CgMenu } from 'react-icons/cg'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import {
	EmailIcon,
	EmailShareButton,
	FacebookIcon,
	FacebookShareButton,
	LinkedinIcon,
	LinkedinShareButton,
	TwitterIcon,
	TwitterShareButton,
} from "react-share"
import useText from "lib/useText"

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

export default function TopNavigation( props ) {
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
		<div className="navigation">
			<Row gutter={ 12 } align="middle">
				<Col>
					<CgMenu onClick={ showDrawer }/>
				</Col>
				<Col>
					<img src="/SVG/gffr-logo.svg" alt="GFFR Logo" height={ 40 }/>
				</Col>
				<Col>
					<h4>{ getText( 'grff' ) }</h4>
				</Col>
				<Col>
					<FacebookShareButton className="social" url="https://gffr.journeyman.se/">
						<FacebookIcon size={ 26 } round/>
					</FacebookShareButton>&nbsp;
					<EmailShareButton className="social" url="https://gffr.journeyman.se/">
						<EmailIcon size={ 26 } round/>
					</EmailShareButton>&nbsp;
					<LinkedinShareButton className="social" url="https://gffr.journeyman.se/">
						<LinkedinIcon size={ 26 } round/>
					</LinkedinShareButton>&nbsp;
					<TwitterShareButton className="social" url="https://gffr.journeyman.se/">
						<TwitterIcon size={ 26 } round/>
					</TwitterShareButton>&nbsp;
				</Col>
			</Row>

			<NavigDrawer visible={ visible } onClose={ onClose }/>

			<style jsx>{ `
              .navigation {
                padding: 28px 40px;
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
                  padding: 16px 24px;
                  font-size: 22px;
                }
              }
			` }
			</style>

		</div>
	)
}
