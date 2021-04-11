import { gql } from "@apollo/client/core"

export const GQL_conversions = gql`
query conversions {
  conversionConstants {
    nodes {
      authority
      description
      fossilFuelType
      fromUnit
      toUnit
      high
      factor
      low
    }
  }
}`

export const GQL_countries = gql`
query countries {
  neCountries(orderBy: NAME_ASC) {
    nodes { isoA2 name }
  }
}`

export const GQL_fossilFuelTypes = gql`
query fossilFuelTypes {
	fossilFuelTypes { nodes }
}`

export const GQL_sources = gql`
query sources {
  sources {
    nodes { description name sourceId url }
  }
}`
