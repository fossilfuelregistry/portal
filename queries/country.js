import { gql } from "@apollo/client/core"

export const GQL_countryReservesByIso = gql`
query countryReserves($iso3166: String!) {
  countryReserves(condition: {iso3166: $iso3166}) {
    nodes {
      iso3166
      fossilFuelType
      grade
      unit
      volume
      year
    }
  }
}`
