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

export const GQL_calculationConstants = gql`
query calculationConstants {
  calculationConstants {
    nodes {
      country
      constantType
      authority
      description
      factor
      fossilFuelType
      high
      id
      low
      modifier
      nodeId
      projectId
      quality
      reference
      subtype
      unit
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
    nodes { id projectIdentifier firstYear lastYear dataYear co2 projectType geoPosition { geojson srid } fuels }
  }
}`

export const GQL_sources = gql`
query sources {
  sources {
    nodes { description name namePretty sourceId url documentUrl latestCurationAt }
  }
}`

export const SQL_co2costs = gql`
query co2Costs {
  co2Costs(filter: {currency: {equalTo: "USD"}}) {
    nodes {
      costPerTon
      currency
      source
      year
    }
  }
}
`

export const GQL_projectsTableData = gql`
query projectsTableData($iso3166:String! $offset:Int! $limit:Int! ) {
  projects(
      orderBy: PRODUCTION_CO2E_DESC
      condition: {iso3166: $iso3166}
      filter: {not: {productionCo2E: {equalTo: 0}}}
      offset: $offset
      first: $limit
    ) {
    nodes {
      id
      projectIdentifier
      productionCo2E
      fuels
      dataYear
      firstYear
      lastYear
      projectDataPoints {
        nodes {
          dataYear
          fossilFuelType
          volume
          year
          unit
        }
      }
    }
    totalCount
    pageInfo {
      hasPreviousPage
      hasNextPage
    }
  }
}`


export const GQL_prefixConversions = gql`
query prefixConversions {
  prefixConversions {
    nodes {
      factor
      fromPrefix
      toPrefix
    }
  }
}
`
