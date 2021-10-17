import { gql } from "@apollo/client/core"

export const GQL_conversions = gql`
query conversions {
  conversionConstants {
    nodes {
      id authority description fossilFuelType
      fromUnit toUnit high factor low
      country modifier subtype
    }
  }
}`

export const GQL_productionCountries = gql`
query producingCountries {
  getProducingIso3166 {
    nodes { iso3166 iso31662 fr es en sv } }
}`

export const GQL_projectSources = gql`
query projectSources( $id:Int! ) {
  getProjectSources(forId: $id) {
    nodes { dataPoints dataType description latestCurationAt name namePretty sourceId records url quality grade }
  }
}`

export const GQL_projects = gql`
query projects($iso3166_: String!, $iso31662_: String = "") {
  getProjects(iso3166_: $iso3166_, iso31662_: $iso31662_) {
    nodes { id projectIdentifier firstYear lastYear co2 projectType geoPosition { geojson srid } fuels }
  }
}`

export const GQL_sources = gql`
query sources {
  sources {
    nodes { description name namePretty sourceId url documentUrl latestCurationAt }
  }
}`
