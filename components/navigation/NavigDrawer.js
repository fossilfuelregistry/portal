import Link from 'next/link'
import { Drawer, Select, } from 'antd'
import useText from "lib/useText"
import { useRouter } from "next/router"
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
	const router = useRouter()

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
				<h4 className="item"><Link href="/wells">{ getText( 'wells' ) }</Link></h4>
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
				<Select
					size="small"
					style={ { width: '100%' } }
					value={ router.locale }
					onChange={ async value => {
						await router.push( router.asPath, router.asPath, { locale: value } )
					} }
					placeholder={ getText( 'switch-language' ) }
				>
					<Select.Option key={ 'en' }>EN</Select.Option>
					<Select.Option key={ 'fr' }>FR</Select.Option>
					<Select.Option key={ 'es' }>ES</Select.Option>
				</Select>
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
