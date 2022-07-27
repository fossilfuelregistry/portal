import Section from 'components/common/section'
import useText from 'lib/useText'
import React from 'react'
import {  Row, Col } from "antd";

export type Props = {
    test:""
	source: string
	sourceUrl: string
}

export const AnnualEmissionsPresenter:React.FC<Props> = ( {
	source,
	sourceUrl
} ) => {
	const { getText } = useText()
	return (
		<Section title={getText( 'annual_emissions_title' )} source={source} sourceUrl={sourceUrl} />
	)
}

