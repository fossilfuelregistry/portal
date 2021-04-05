import { useStore, textsSelector } from 'lib/zustandProvider'
import Link from 'next/link'
import { Drawer, } from 'antd'

const NavigDrawer = ( { visible, onClose } ) => {
	const texts = useStore( textsSelector )

	return (
		<div className="menu">
			<Drawer
				title={<h2><Link href="/">GFFR</Link></h2>}
				placement="left"
				closable={true}
				onClose={onClose}
				visible={visible}
			>
				<h4 className="item"><Link href="/wells">{texts?.wells}</Link></h4>
				<h4 className="item"><Link href="/co2">{texts?.co2_totals}</Link></h4>
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
