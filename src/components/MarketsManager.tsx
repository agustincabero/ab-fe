import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  FIND_ALL_BRANDS,
  FIND_ALL_MARKET_GROUPS,
  FIND_ALL_COUNTRIES,
  FIND_ALL_MARKETS_BY_MARKET_GROUP,
  UPSERT_MARKETS,
} from '../graphql/operations';
import type {
  FindAllBrandsData,
  FindAllMarketGroupsData,
  FindAllMarketGroupsVariables,
  FindAllCountriesData,
  FindAllMarketsByMarketGroupData,
  FindAllMarketsByMarketGroupVariables,
  UpsertMarketsVariables,
  UpsertMarketsData,
} from '../types/graphql';
import { useSnackbar } from '../contexts/SnackbarContext';

const MarketsManager: React.FC = () => {
  const { showSuccess, showError } = useSnackbar();
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [selectedMarketGroupId, setSelectedMarketGroupId] = useState<string>('');
  const [selectedCountryIds, setSelectedCountryIds] = useState<Set<string>>(new Set());
  const [initialCountryIds, setInitialCountryIds] = useState<Set<string>>(new Set());

  // Query for brands
  const {
    data: brandsData,
    loading: brandsLoading,
    error: brandsError,
  } = useQuery<FindAllBrandsData>(FIND_ALL_BRANDS);

  // Query for market groups (only when brand is selected)
  const {
    data: marketGroupsData,
    loading: marketGroupsLoading,
    error: marketGroupsError,
  } = useQuery<FindAllMarketGroupsData, FindAllMarketGroupsVariables>(
    FIND_ALL_MARKET_GROUPS,
    {
      variables: { brandPublicId: selectedBrandId },
      skip: !selectedBrandId,
    }
  );

  // Query for all countries
  const {
    data: countriesData,
    loading: countriesLoading,
    error: countriesError,
  } = useQuery<FindAllCountriesData>(FIND_ALL_COUNTRIES);

  // Query for markets by market group
  const {
    data: marketsData,
    loading: marketsLoading,
    error: marketsError,
    refetch: refetchMarkets,
  } = useQuery<FindAllMarketsByMarketGroupData, FindAllMarketsByMarketGroupVariables>(
    FIND_ALL_MARKETS_BY_MARKET_GROUP,
    {
      variables: { marketGroupPublicId: selectedMarketGroupId },
      skip: !selectedMarketGroupId,
    }
  );

  // Mutation for upserting markets
  const [upsertMarkets, { loading: upsertLoading }] = useMutation<
    UpsertMarketsData,
    UpsertMarketsVariables
  >(UPSERT_MARKETS);

  // Show errors via snackbar
  useEffect(() => {
    if (brandsError) {
      showError(`Failed to load brands: ${brandsError.message}`);
    }
  }, [brandsError, showError]);

  useEffect(() => {
    if (marketGroupsError) {
      showError(`Failed to load market groups: ${marketGroupsError.message}`);
    }
  }, [marketGroupsError, showError]);

  useEffect(() => {
    if (countriesError) {
      showError(`Failed to load countries: ${countriesError.message}`);
    }
  }, [countriesError, showError]);

  useEffect(() => {
    if (marketsError) {
      showError(`Failed to load markets: ${marketsError.message}`);
    }
  }, [marketsError, showError]);

  // Update selected countries when markets data changes
  useEffect(() => {
    if (marketsData) {
      const countryIds = new Set(
        marketsData.findAllMarketsByMarketGroup.map((market) => market.countryPublicId)
      );
      // Use a callback to batch updates
      const updateCountryIds = () => {
        setSelectedCountryIds(new Set(countryIds));
        setInitialCountryIds(new Set(countryIds));
      };
      updateCountryIds();
    }
  }, [marketsData]);

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    setSelectedMarketGroupId('');
    setSelectedCountryIds(new Set());
    setInitialCountryIds(new Set());
  };

  const handleMarketGroupChange = (marketGroupId: string) => {
    setSelectedMarketGroupId(marketGroupId);
    setSelectedCountryIds(new Set());
    setInitialCountryIds(new Set());
  };

  const handleCountryToggle = (countryId: string) => {
    setSelectedCountryIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(countryId)) {
        newSet.delete(countryId);
      } else {
        newSet.add(countryId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!selectedMarketGroupId) return;

    try {
      await upsertMarkets({
        variables: {
          marketGroupPublicId: selectedMarketGroupId,
          countries: Array.from(selectedCountryIds),
        },
      });
      showSuccess('Markets saved successfully!');
      // Refetch markets to update initial state
      await refetchMarkets();
    } catch (error) {
      showError(`Failed to save markets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Check if there are changes to save
  const hasChanges = useMemo(() => {
    if (selectedCountryIds.size !== initialCountryIds.size) return true;
    for (const id of selectedCountryIds) {
      if (!initialCountryIds.has(id)) return true;
    }
    return false;
  }, [selectedCountryIds, initialCountryIds]);

  const isSaveDisabled = !selectedMarketGroupId || !hasChanges || upsertLoading;

  return (
    <Box>
      {/* Brand Selection */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="brand-select-label">Select Brand</InputLabel>
          <Select
            labelId="brand-select-label"
            value={selectedBrandId}
            label="Select Brand"
            onChange={(e) => handleBrandChange(e.target.value)}
            disabled={brandsLoading}
          >
            {brandsLoading ? (
              <MenuItem disabled>Loading brands...</MenuItem>
            ) : brandsData && brandsData.findAllBrands.length > 0 ? (
              brandsData.findAllBrands.map((brand) => (
                <MenuItem key={brand.publicId} value={brand.publicId}>
                  {brand.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No brands available</MenuItem>
            )}
          </Select>
        </FormControl>
      </Paper>

      {/* Market Group Selection */}
      {selectedBrandId && (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="market-group-select-label">Select Market Group</InputLabel>
            <Select
              labelId="market-group-select-label"
              value={selectedMarketGroupId}
              label="Select Market Group"
              onChange={(e) => handleMarketGroupChange(e.target.value)}
              disabled={marketGroupsLoading}
            >
              {marketGroupsLoading ? (
                <MenuItem disabled>Loading market groups...</MenuItem>
              ) : marketGroupsData && marketGroupsData.findAllMarketGroups.length > 0 ? (
                marketGroupsData.findAllMarketGroups.map((marketGroup) => (
                  <MenuItem key={marketGroup.publicId} value={marketGroup.publicId}>
                    {marketGroup.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No market groups available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Paper>
      )}

      {/* Countries Checkboxes */}
      {selectedMarketGroupId && (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Countries
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {countriesLoading || marketsLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="150px">
              <CircularProgress />
            </Box>
          ) : countriesData && countriesData.findAllCountries.length > 0 ? (
            <Grid container spacing={1}>
              {countriesData.findAllCountries.map((country) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={country.publicId}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedCountryIds.has(country.publicId)}
                        onChange={() => handleCountryToggle(country.publicId)}
                      />
                    }
                    label={country.name}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No countries available
            </Typography>
          )}
        </Paper>
      )}

      {/* Save Button */}
      {selectedMarketGroupId && (
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaveDisabled}
            sx={{ minWidth: '120px' }}
          >
            {upsertLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </Box>
      )}

      {/* Placeholder when no selections */}
      {!selectedBrandId && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            Select a brand to view market groups
          </Typography>
        </Box>
      )}

      {selectedBrandId && !selectedMarketGroupId && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            Select a market group to manage countries
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MarketsManager;



