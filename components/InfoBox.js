import React from "react"
import useText from "lib/useText"
import { useSelector } from "react-redux"
import { addToTotal } from "./CO2Forecast/calculate"
import settings from "../settings"
import ScopeBars from "./viz/ScopeBars"

const DEBUG = false

export default function InfoBox( { header, content } ) {
	const { getText } = useText()

	return (
		<div className="co2-card">
			<div className="header">
				{ header }
			</div>

			<div className="box" style={ { flexGrow: 1, minHeight: 200 } }>
				{ content }
			</div>

			<style jsx>{ `
			` }
			</style>
		</div> )
}
