import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import {  createStore } from 'redux'

import { CountrySnapshotSection, Props } from "./presenter"

import { Provider } from "react-redux";
import { Store } from "../../../lib/types";

const fakeStore: Partial<Store> = {
	locale: 'en-US',
	texts: { 
		"country_snapshot":"Country snapshot",
		"total_emissions": "Total emissions",
		"million_tonnes_co2e": "Million tonnes CO₂e",
		"latest_year": "Latest year",
		"oil_production":"Oil production",
		"million_barrels": "Million barrels",
		"gas_production":"Gas production",
		"coal_production": "Coal production",
		"billion_cubic_metres": "Billion cubic metres",
		"thousand_tonnes":"Thousand tonnes",
	}
}
const store = createStore( ()=>fakeStore )

export default {
	title: "Sections/CountrySnapshot",
	component: CountrySnapshotSection,
	decorators: [
		( Story ) => (
			<Provider store={store}>
				<Story />
			</Provider>
		)
	]
} as ComponentMeta<typeof CountrySnapshotSection>;

const Template: ComponentStory<typeof CountrySnapshotSection> = ( args: Props ) => (
	<CountrySnapshotSection {...args} />
);
export const Story = Template.bind( {} );
Story.args = {
	co2eEmissions:11266,
	co2eRanking:"5th highest",
	oilProduction:110,
	oilRanking:"56th highest" ,
	coalProduction:78.4,
	coalRanking:"3rd highest",
	gasProduction: 86,
	gasRanking: "25th highest",
}
Story.storyName = "Normal";
