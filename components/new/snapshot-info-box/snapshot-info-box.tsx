import { Card, Space, Typography } from "antd";
import React from "react";
import settings from "../../../settings";

export type SnapshotInfoBoxProps = {
  title: string;
  subtitle?: string;
  value: string;
  sourceYear?: string;
  tags?: string[];
};

const { Text, Title, Paragraph } = Typography;

export const SnapshotInfoBox: React.FunctionComponent<SnapshotInfoBoxProps> = ({
  title,
  subtitle,
  value,
  sourceYear,
  tags,
}) => {
  return (
    <Card
      bordered={false}
      style={{
        background: "#FAFAFA",
        width: 295,
      }}
    >
      <Space direction="vertical">
        <div style={{ paddingBottom: 16 }}>
          <Text style={{ fontSize: 18 }} strong>
            {title}
          </Text>
          <br />
          <Text style={{ fontSize: 15 }} type="secondary">
            {subtitle}
          </Text>
        </div>
        <Text style={{ fontSize: 36 }} strong>
          {value}
        </Text>
        {!!sourceYear && <Text style={{ fontSize: 13 }}>{sourceYear}</Text>}
        {!!tags &&
          tags.map((tag) => (
            <Text
              style={{
                color: settings.style.color.brand,
                lineHeight: "150%",
                borderWidth: 1,
                borderColor: settings.style.color.brand,
                borderStyle: "solid",
                borderRadius: 5,
                padding: 6,
              }}
            >
              {tag}
            </Text>
          ))}
      </Space>
    </Card>
  );
};
