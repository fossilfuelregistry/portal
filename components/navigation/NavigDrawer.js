import { useContext } from "react"
import { Drawer, } from 'antd'
import I18nContext from "../i18nContext"

const NavigDrawer = ( { visible, onClose } ) => {
	const i18n = useContext( I18nContext )

	return (
		<div style={{ marginTop: 100 }}>
			<Drawer
				title="Basic NavigDrawer"
				placement="left"
				closable={true}
				onClose={onClose}
				visible={visible}
			>
				<p>{i18n.oil}</p>
				<p>{i18n.gas}</p>
			</Drawer>
		</div>
	)
}

export default NavigDrawer
