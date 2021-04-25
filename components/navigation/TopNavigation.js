import { useEffect, useState } from "react"
import { Col, Row } from 'antd'
import NavigDrawer from "components/navigation/NavigDrawer"
import { CgMenu } from 'react-icons/cg'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import {
	EmailShareButton,
	FacebookShareButton,
	LinkedinShareButton,
	TwitterShareButton,
	EmailIcon,
	FacebookIcon,
	LinkedinIcon,
	TwitterIcon,
} from "react-share";

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

export default function TopNavigation( props ) {
	const router = useRouter()
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
			<Row gutter={12} align="middle">
				<Col>
					<CgMenu onClick={showDrawer}/>
				</Col>
				<Col>
					<img src="/SVG/gffr-logo.svg" alt="GFFR Logo" height={40}/>
				</Col>
				<Col>
					<h4>
						Global Fossil Fuel Registry
						&nbsp;&nbsp;&nbsp;
						<FacebookShareButton url="https://gffr.journeyman.se/" ><FacebookIcon size={24}/></FacebookShareButton>&nbsp;
						<EmailShareButton url="https://gffr.journeyman.se/" ><EmailIcon size={24}/></EmailShareButton>&nbsp;
						<LinkedinShareButton url="https://gffr.journeyman.se/" ><LinkedinIcon size={24}/></LinkedinShareButton>&nbsp;
						<TwitterShareButton url="https://gffr.journeyman.se/" ><TwitterIcon size={24}/></TwitterShareButton>&nbsp;
					</h4>
				</Col>
			</Row>

			<NavigDrawer visible={visible} onClose={onClose}/>

			<style jsx>{`
              .navigation {
                padding: 28px 40px;
                font-size: 32px;
                line-height: 1;
                height: 100px;
              }

              @media (max-width: ${theme[ '@screen-sm' ]}) {
                .navigation {
                  padding: 16px 24px;
                }
              }
			`}
			</style>

		</div>
	)
}
