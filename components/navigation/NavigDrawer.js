import { useStore, textsSelector } from 'lib/zustandProvider'
import Link from 'next/link'
import { Drawer, } from 'antd'

const NavigDrawer = ( { visible, onClose } ) => {
	const texts = useStore( textsSelector )

	return (
		<div style={{ marginTop: 100 }}>
			<Drawer
				title={"GFFR"}
				placement="left"
				closable={true}
				onClose={onClose}
				visible={visible}
			>
				<Link href="/wells">{texts?.oil}</Link>
				<p>{texts?.gas}</p>
			</Drawer>
		</div>
	)
}

export default NavigDrawer
