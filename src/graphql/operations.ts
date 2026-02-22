import { gql } from '@apollo/client';
export const FIND_ALL_BRANDS = gql`
  query FindAllBrands {
    findAllBrands {
      publicId
      name
    }
  }
`;
export const FIND_ALL_COUNTRIES = gql`
  query FindAllCountries {
    findAllCountries {
      publicId
      name
    }
  }
`;
export const FIND_ALL_MARKET_GROUPS = gql`
  query FindAllMarketGroups($brandPublicId: ID!) {
    findAllMarketGroups(brandPublicId: $brandPublicId) {
      publicId
      name
    }
  }
`;
export const CREATE_MARKET_GROUP = gql`
  mutation CreateMarketGroup($brandPublicId: ID!, $name: String!) {
    createMarketGroup(brandPublicId: $brandPublicId, name: $name)
  }
`;

export const DELETE_MARKET_GROUP = gql`
  mutation DeleteMarketGroup($marketGroupPublicId: ID!) {
    deleteMarketGroup(marketGroupPublicId: $marketGroupPublicId)
  }
`;

export const UPSERT_MARKETS = gql`
  mutation UpsertMarkets($marketGroupPublicId: ID!, $countries: [ID!]!) {
    upsertMarkets(marketGroupPublicId: $marketGroupPublicId, countries: $countries)
  }
`;

export const FIND_ALL_MARKETS_BY_MARKET_GROUP = gql`
  query FindAllMarketsByMarketGroup($marketGroupPublicId: ID!) {
    findAllMarketsByMarketGroup(marketGroupPublicId: $marketGroupPublicId) {
      publicId
      name
      countryPublicId
      marketGroupPublicId
    }
  }
`;

