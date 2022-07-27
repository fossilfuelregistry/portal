import { Button, Col, Layout, Row, Space, Typography } from "antd";
import HelpModal from "components/HelpModal";
import useText from "lib/useText";
import React from "react";


  

export type Props = {
  title: string;
  information?: { title: string; content: string };
  explanation?: string;
  source: string;
  sourceUrl: string;
  downloadable?: boolean;
  onDownload?(): void;
  children: React.ReactNode;
};

const { Header, Footer, Content } = Layout;

const { Title, Text, Paragraph, Link } = Typography;

export const Section: React.FunctionComponent<Props> = ( {
	title,
	information,
	explanation,
	source,
	sourceUrl,
	downloadable = false,
	onDownload,
	children
	
} ) => {
	const { getText } = useText()
	return (
		<>
			<Layout style={{ background: "#FAFAFA", padding: 20 }}>
				<Title level={3}>
					{title}
					{/* <HelpModal title="current_annual_estimate" content="explanation_emissionsring"/> */}
				</Title>
				{!!explanation && (
					<Paragraph style={{ whiteSpace: "pre-wrap" }}>
						{explanation}
					</Paragraph>
				)}

				<div>{children}</div>

				<Row justify="space-between">
					<Col>
						<Text>Source:</Text> <Link href={sourceUrl}>{source}</Link>
					</Col>
					<Col>
						<Button onClick={onDownload}>{getText( 'download' )}</Button>
					</Col>
				</Row>
			</Layout>
		</>
	);
};
