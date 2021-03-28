import { useStore, textsSelector } from 'lib/zustandProvider'
import Link from 'next/link'
import { Drawer, } from 'antd'

const NavigDrawer = ( { visible, onClose } ) => {
	const texts = useStore( textsSelector )

	return (
		<div style={{ marginTop: 100 }}>
			<Drawer
				title={<Link href="/">GFFR</Link>}
				placement="left"
				closable={true}
				onClose={onClose}
				visible={visible}
			>
				<Link href="/wells">{texts?.oil_production}</Link>
				<p>...</p>
			</Drawer>
		</div>
	)
}

export default NavigDrawer
