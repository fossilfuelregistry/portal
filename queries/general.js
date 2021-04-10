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
