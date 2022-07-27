import { Card,  Typography, Row, Col } from "antd";
import React from "react";
import settings from "../../../settings";

export type SnapshotInfoBoxProps = {
	title: string;
	subtitle?: string;
	value: string;
	sourceYear?: string;
	tags?: string[];
	icon?: React.ReactNode | JSX.Element | string;
};

const { Text, Title } = Typography;

export const SnapshotInfoBox: React.FunctionComponent<SnapshotInfoBoxProps> = ( {
	title,
	subtitle,
	value,
	sourceYear,
	tags,
	icon,
} ) => {
	return (
		<Card
			bordered={false}
			style={{
				background: "#FAFAFA",
				width: 295,
			}}
		>
			<div style={{ paddingBottom: 16, }}>
				<Row justify="space-between" align="top">
					<Col>
						<Text style={{ fontSize: 18 }} strong>
							{title}
						</Text>

						<br />
						<Text style={{ fontSize: 15 }} type="secondary">
							{subtitle}
						</Text>
					</Col>
					{!!icon && <Col>{icon}</Col>}
				</Row>
			</div>
			<Row>
				{!!tags &&
					tags.map( ( tag ) => (
						<Text
							key={tag}
							style={{
								color: settings.style.color.brand,
								lineHeight: "150%",
								borderWidth: 1,
								borderColor: settings.style.color.brand,
								borderStyle: "solid",
								borderRadius: 5,
								padding: 6,
								fontStyle: "normal",
								fontWeight: 400,
								fontSize: 16,
							}}
						>
							{tag}
						</Text>
					) )}
			</Row>
			<Row>
				<Title style={{ fontSize: 40 }} level={3} >
					{value}
				</Title>
			</Row>
			<Row>
				{!!sourceYear && <Text style={{ fontSize: 13 }}>{sourceYear}</Text>}
			</Row>
			
		</Card>
	);
};
