export interface Brand {
  publicId: string;
  name: string;
}

export interface Country {
  publicId: string;
  name: string;
}

export interface MarketGroup {
  publicId: string;
  name: string;
}

export interface Market {
  publicId: string;
  name: string;
  countryPublicId: string;
  marketGroupPublicId: string;
}

// Query response types
export interface FindAllBrandsData {
  findAllBrands: Brand[];
}

export interface FindAllCountriesData {
  findAllCountries: Country[];
}

export interface FindAllMarketGroupsData {
  findAllMarketGroups: MarketGroup[];
}

export interface FindAllMarketGroupsVariables {
  brandPublicId: string;
}

export interface FindAllMarketsByMarketGroupData {
  findAllMarketsByMarketGroup: Market[];
}

export interface FindAllMarketsByMarketGroupVariables {
  marketGroupPublicId: string;
}

// Mutation variables and response types
export interface CreateMarketGroupVariables {
  brandPublicId: string;
  name: string;
}

export interface CreateMarketGroupData {
  createMarketGroup: boolean;
}

export interface DeleteMarketGroupVariables {
  marketGroupPublicId: string;
}

export interface DeleteMarketGroupData {
  deleteMarketGroup: boolean;
}

export interface UpsertMarketsVariables {
  marketGroupPublicId: string;
  countries: string[];
}

export interface UpsertMarketsData {
  upsertMarkets: boolean;
}

