import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import {  createStore } from 'redux'

import { Props, Section } from "./section";
import { Provider } from "react-redux";
import { Store } from "../../../lib/types";

const fakeStore: Partial<Store> = {
	texts: { "download":"Download" }
}
const store = createStore( ()=>fakeStore )

export default {
	title: "Components/Section",
	component: Section,
	decorators: [
		( Story )=> (
			<Provider store={store}>
				<Story />
			</Provider>
		)
	]
} as ComponentMeta<typeof Section>;

const Template: ComponentStory<typeof Section> = ( args: Props ) => (
	<Section {...args} />
);

export const Story = Template.bind( {} );
Story.args = {
	title: "Historical and projected emissions under various scenarios",
	downloadable: true,
	explanation: `This chart shows how the currently estimated level of reserves and contingent resources compare to projected future production under various scenarios. 
Where projected production exceeds the amount of currently estimated reserves and contingent resources, it indicates that fossil fuel production may expand beyond current reserves under those scenarios. We call these "forecasted reserves". 
Where projected future production is entirely met by existing reserves and contingent resources, it indicates the country may wind down production before all existing reserves are depleted. We call these "excess reserves".`,
	information: { title: "Title", content: "Content" },
	onDownload: () => { },
	source: "Country Production and Reserves Dataset",
	sourceUrl: "#",
};
Story.storyName = "With all props";
