import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { SnapshotInfoBoxProps } from "./snapshot-info-box";
import SnapshotInfoBox from ".";

import FuelIcon from "components/navigation/FuelIcon";

export default {
	title: "Components/SnapshotInfoBox",
	component: SnapshotInfoBox,
} as ComponentMeta<typeof SnapshotInfoBox>;

const Template: ComponentStory<typeof SnapshotInfoBox> = (
	args: SnapshotInfoBoxProps
) => <SnapshotInfoBox {...args} />;

export const Story = Template.bind( {} );
Story.args = {
	title: "Total emissions",
	subtitle: "Million tonnes CO₂e",
	sourceYear:"Latest year: 2020",
	value: "11,266",
	tags: [ "3rd highest" ],
	icon: <FuelIcon fuel={ "oil" } height={ 22 } />
};
Story.storyName = 'Info box with tag'
