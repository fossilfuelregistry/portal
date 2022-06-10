export default {
	year: {
		start: 2010,
		end: 2040
	},
	openCorporate: {
		endpoint: 'https://api.opencorporates.com',
		web: 'https://opencorporates.com'
	},
	gradesPreferenceOrder: '3x12',
	stableProductionSourceId: 100,
	principalProductionSourceId: { oil: 2, gas: 2, coal: 1 },
	fuelTypeSeparator: '|',
	supportedFuels: [ 'oil', 'gas', 'coal' ],
	fuelsNormalizedVolumeUnit: {
		oil: "e3bbls",
		coal: "e3ton",
		gas: "e9m3",
	},
	gradient6: [ "#96E6FA","#7AC3DC","#5EA0BF","#437EA1","#275B84","#0B3866" ]
} as const
