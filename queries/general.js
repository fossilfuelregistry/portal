import { gql } from "@apollo/client/core"

export const GQL_conversions = gql`
query conversions {
  conversionConstants {
    nodes {
      id authority description fossilFuelType
      fromUnit toUnit high factor low
      country modifier
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

export const GQL_projects = gql`
query projects($iso3166_: String!, $iso31662_: String = "") {
  getProjects(iso3166_: $iso3166_, iso31662_: $iso31662_) { nodes { iso31662 projectId firstYear lastYear dataType } }
}`

export const GQL_productionSources = gql`
query productionSources($projectId: String = "", $iso31662: String = "", $iso3166: String = "") {
  getProductionSources(
    iso3166_: $iso3166
    iso31662_: $iso31662
    projectId_: $projectId
  ) { nodes { sourceId name namePretty } }
}`

export const GQL_projectionSources = gql`
query projectionSources($projectId: String = "", $iso31662: String = "", $iso3166: String = "") {
  getProjectionSources(
    iso3166_: $iso3166
    iso31662_: $iso31662
    projectId_: $projectId
  ) { nodes { sourceId name namePretty } }
}`

export const GQL_reservesSources = gql`
query reservesSources($projectId: String = "", $iso31662: String = "", $iso3166: String = "") {
  getReservesSources(
    iso3166_: $iso3166
    iso31662_: $iso31662
    projectId_: $projectId
  ) { nodes { sourceId name namePretty grades year quality } }
}`

export const GQL_sources = gql`
query sources {
  sources {
    nodes { description name sourceId url }
  }
}`

