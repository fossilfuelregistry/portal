import { gql } from "@apollo/client/core"

const _formatter = conditionObject => JSON.stringify( conditionObject ).replace( /"([^"]+)":/g, '$1:' ).replace( /\uFFFF/g, '\\\"' )

export const GQL_dataQuery = ( { iso3166, iso31662, projectId } ) => {
	const prod = _formatter( {
		iso3166,
		iso31662: iso31662 ?? '',
		projectId: projectId ?? '',
		projection: false
	} )
	const proj = _formatter( {
		iso3166,
		iso31662: iso31662 ?? '',
		projectId: projectId ?? '',
		projection: true
	} )
	const res = _formatter( {
		iso3166,
		iso31662: iso31662 ?? '',
		projectId: projectId ?? '',
	} )

	return {
		production: gql`
		query countryProduction {
		  countryProductions(
			condition: ${ prod }
			orderBy: YEAR_ASC
		  ) { nodes { id iso3166 fossilFuelType sourceId unit volume year } }
		}`,
		projection: gql`
		query countryProjection {
		  countryProductions(
			condition: ${ proj }
			orderBy: YEAR_ASC
		  ) { nodes { id iso3166 fossilFuelType sourceId unit volume year } }
		}`,
		reserves: gql`
		query countryReserves {
		  countryReserves(
			condition: ${ res }
			orderBy: YEAR_ASC
		  ) { nodes { id iso3166 fossilFuelType grade sourceId unit volume quality year } }
		}`
	}
}

export const GQL_countryReservesByIso = gql`
query countryReserves($iso3166: String!) {
  countryReserves(
  	condition: { iso3166: $iso3166 }
  	orderBy: YEAR_ASC
  ) {
    nodes { id iso3166 fossilFuelType grade sourceId unit volume quality year }
  }
}`

export const GQL_countryProductionByIso = gql`
query countryProductions($iso3166: String!) {
  countryProductions(
  	condition: { iso3166: $iso3166 }
    filter: {fossilFuelType: {in: ["oil", "gas"]}}
  	orderBy: YEAR_ASC
  ) {
    nodes { id iso3166 fossilFuelType sourceId unit volume year projection }
  }
}`
