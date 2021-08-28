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

export const GQL_countries = gql`
query countries {
  getProducingCountries {
    nodes { isoA2 name }
  }
}`

export const GQL_productionCountries = gql`
query producingCountries {
  getProducingIso3166 {
    nodes { iso3166 iso31662 fr es en sv } }
}`

export const GQL_fossilFuelTypes = gql`
query fossilFuelTypes {
	fossilFuelTypes { nodes }
}`

export const GQL_projectSources = gql`
query GQL_projectSources( $id:Int! ) {
  getProjectSources(id: $id) {
    nodes { dataPoints dataType description latestCurationAt name namePretty sourceId records url quality grade }
  }
}`

export const GQL_projects = gql`
query projects($iso3166_: String!, $iso31662_: String = "") {
  getProjects(iso3166_: $iso3166_, iso31662_: $iso31662_) { nodes { projectIdentifier firstYear lastYear co2 type } }
}`

export const GQL_sources = gql`
query sources {
  sources {
    nodes { description name sourceId url }
  }
}`

