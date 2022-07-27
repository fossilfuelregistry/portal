export default {
	year: {
		start: 2010,
		end: 2040,
	},
	openCorporate: {
		endpoint: "https://api.opencorporates.com",
		web: "https://opencorporates.com",
	},
	gradesPreferenceOrder: "3x12",
	stableProductionSourceId: 100,
	principalProductionSourceId: { oil: 2, gas: 2, coal: 1 },
	fuelTypeSeparator: "|",
	supportedFuels: [ "oil", "gas", "coal" ],
	fuelsNormalizedVolumeUnit: {
		oil: "e3bbls",
		coal: "e3ton",
		gas: "e9m3",
	},
	gradient6: [ "#96E6FA", "#7AC3DC", "#5EA0BF", "#437EA1", "#275B84", "#0B3866" ],
	style: {
		color: {
			primary: "#040404",
			brand: "#1172BA",
			success: "#4AA233",
			error: "#C4362D",
			charts: [ "#87BFFF", "#4C6EE6","#52B9BF", "#81D986", "#FFE74C", "#FFC482", "#BB638C", "#E05267" ]
		},
	},
} as const;
