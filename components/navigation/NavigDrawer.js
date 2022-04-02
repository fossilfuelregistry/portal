import React from "react"
import Link from 'next/link'
import { Drawer, } from 'antd'
import useText from "lib/useText"
import {
	EmailIcon,
	EmailShareButton,
	FacebookIcon,
	FacebookShareButton,
	LinkedinIcon,
	LinkedinShareButton,
	TwitterIcon,
	TwitterShareButton
} from "react-share"

const NavigDrawer = ( { visible, onClose } ) => {
	const { getText } = useText()

	return (
		<div className="menu">
			<Drawer
				title={ <h2><Link href="/">GRFF</Link></h2> }
				placement="left"
				closable={ true }
				onClose={ onClose }
				visible={ visible }
			>
				<h4 className="item"><Link href="/co2-forecast">{ getText( 'co2_forecast' ) }</Link></h4>
				<h4 className="item"><Link href="/data">{ getText( 'menu_item_data' ) }</Link></h4>
				<h4 className="item"><Link href="/methodology">{ getText( 'menu_item_methodology' ) }</Link></h4>
				<h4 className="item"><Link href="/analysis">{ getText( 'menu_item_analysis' ) }</Link></h4>
				<h4 className="item"><Link href="/api-intro">API</Link></h4>
				<h4 className="item"><Link href="/about">{ getText( 'menu_item_about' ) }</Link></h4>
				<h4>
					<FacebookShareButton className="social" url="https://fossilfuelregistry.org/">
						<FacebookIcon size={ 26 } round/>
					</FacebookShareButton>&nbsp;
					<EmailShareButton className="social" url="https://fossilfuelregistry.org/">
						<EmailIcon size={ 26 } round/>
					</EmailShareButton>&nbsp;
					<LinkedinShareButton className="social" url="https://fossilfuelregistry.org/">
						<LinkedinIcon size={ 26 } round/>
					</LinkedinShareButton>&nbsp;
					<TwitterShareButton className="social" url="https://fossilfuelregistry.org/">
						<TwitterIcon size={ 26 } round/>
					</TwitterShareButton>&nbsp;
				</h4>
			</Drawer>

			<style jsx>{ `
              .menu {
              }

              .item {
                padding: 12px 12px 12px 0;
              }
			` }
			</style>
		</div>
	)
}

export default NavigDrawer

// 				<h4 className="item"><Link href="/wells">{ getText( 'menu_item_wells' ) }</Link></h4>