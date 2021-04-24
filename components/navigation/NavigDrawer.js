import Link from 'next/link'
import { Drawer, } from 'antd'
import useText from "lib/useText"

const NavigDrawer = ( { visible, onClose } ) => {
	const { getText } = useText()

	return (
		<div className="menu">
			<Drawer
				title={<h2><Link href="/">GFFR</Link></h2>}
				placement="left"
				closable={true}
				onClose={onClose}
				visible={visible}
			>
				<h4 className="item"><Link href="/wells">{getText( 'wells' )}</Link></h4>
				<h4 className="item"><Link href="/country_production">{getText( 'country_production' )}</Link></h4>
				<h4 className="item"><Link href="/country_reserves">{getText( 'country_reserves' )}</Link></h4>
				<h4 className="item"><Link href="/co2">{getText( 'co2_forecast' )}</Link></h4>
				<h4 className="item"><Link href="/co2?country=dk">{getText( 'co2_forecast' )}</Link></h4>
				<p>...</p>
			</Drawer>

			<style jsx>{`
              .menu {
                margin-top: 100px;
                fort-family:
              }

              .item {
                padding: 12px 12px 12px 0;
              }
			`}
			</style>
		</div>
	)
}

export default NavigDrawer
