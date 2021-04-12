import { gql } from "@apollo/client/core"

export const GQL_countryReservesByIso = gql`
query countryReserves($iso3166: String!) {
  countryReserves(
  	condition: { iso3166: $iso3166 }
  	orderBy: YEAR_ASC
  ) {
    nodes {
      iso3166
      fossilFuelType
      grade
      sourceId
      unit
      volume
      year
    }
  }
}`

export const GQL_countryProductionByIso = gql`
query countryProductions($iso3166: String!) {
  countryProductions(
  	condition: { iso3166: $iso3166 }
  	orderBy: YEAR_ASC
  ) {
    nodes {
      iso3166
      fossilFuelType
      grade
      sourceId
      unit
      volume
      year
      projection
    }
  }
}`
