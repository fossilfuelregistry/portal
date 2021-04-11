export function co2FromReserve( datapoint, conversion ) {
	let low = datapoint * 0.9
	let high = datapoint * 1.1
	return { value: datapoint, range: [ low,high ] }
}
