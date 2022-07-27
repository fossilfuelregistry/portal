import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import {  createStore } from 'redux'

import { AnnualEmissionsPresenter, Props } from "./presenter"

import { Provider } from "react-redux";
import { Store } from "../../../lib/types";

const fakeStore: Partial<Store> = {	
	texts:{
		"annual_emissions_title":"Annual Emissions from Fossil Fuel Production"
	}
}
const store = createStore( ()=>fakeStore )

export default {
	title: "Sections/AnnualEmissions",
	component: AnnualEmissionsPresenter,
	decorators: [
		( Story ) => (
			<Provider store={store}>
				<Story />
			</Provider>
		)
	]
} as ComponentMeta<typeof AnnualEmissionsPresenter>;

const Template: ComponentStory<typeof AnnualEmissionsPresenter> = ( args: Props ) => (
	<AnnualEmissionsPresenter {...args} />
);
export const Story = Template.bind( {} );
Story.args = {
}
Story.storyName = "Normal";
