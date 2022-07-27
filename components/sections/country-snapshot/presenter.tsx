import React from "react";
import { Col, Row } from "antd";
import SnapshotInfoBox from "components/common/snapshot-info-box";

import useText from "lib/useText";
import FuelIcon from "components/navigation/FuelIcon";
import useNumberFormatter from "lib/useNumberFormatter";

export type Props = {
  co2eEmissions: number
  co2eRanking?: string
  oilProduction: number
  oilRanking?: string
  coalProduction: number
  coalRanking?: string
  gasProduction: number
  gasRanking?: string
};


export const CountrySnapshotSection: React.FC<Props> = ( {
	co2eEmissions,
	co2eRanking,
	oilProduction,
	oilRanking,
	coalProduction,
	coalRanking,
	gasProduction,
	gasRanking,
} ) => {
	const { getText } = useText();
	const numberFormatter = useNumberFormatter()

	return (
		<div>
			<h1>{getText( "country_snapshot" )}</h1>
			<Row justify="space-between">
				<Col>
					<SnapshotInfoBox
						title={getText( "total_emissions" )}
						subtitle={getText( "million_tonnes_co2e" )}
						tags={  co2eRanking ? [ co2eRanking ] : undefined}
						value={numberFormatter( co2eEmissions, 1 )}
						icon={<FuelIcon fuel="emissions" height={24} />}
					/>
				</Col>
				<Col>
					<SnapshotInfoBox
						title={getText( "oil_production" )}
						subtitle={getText( "million_barrels" )}
						tags={  oilRanking ? [ oilRanking ] : undefined}
						value={numberFormatter( oilProduction, 1 )}
						icon={<FuelIcon fuel="oil" height={24} />}
					/>
				</Col>
				<Col>
					<SnapshotInfoBox
						title={getText( "gas_production" )}
						subtitle={getText( "billion_cubic_metres" )}
						tags={  gasRanking ? [ gasRanking ] : undefined}
						value={numberFormatter( gasProduction, 1 )}
						icon={<FuelIcon fuel="gas" height={24} />}
					/>
				</Col>
				<Col>
					<SnapshotInfoBox
						title={getText( "coal_production" )}
						subtitle={getText( "thousand_tonnes" )}
						tags={  coalRanking ? [ coalRanking ] : undefined}
						value={numberFormatter( coalProduction, 1 )}
						icon={<FuelIcon fuel="coal" height={24} />}
					/>
				</Col>
			</Row>
		</div>
	);
};
