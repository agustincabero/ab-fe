import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FIND_ALL_BRANDS, FIND_ALL_MARKET_GROUPS, CREATE_MARKET_GROUP, DELETE_MARKET_GROUP } from '../graphql/operations';
import type {
  FindAllBrandsData,
  FindAllMarketGroupsData,
  FindAllMarketGroupsVariables,
  CreateMarketGroupVariables,
  CreateMarketGroupData,
  DeleteMarketGroupVariables,
  DeleteMarketGroupData,
} from '../types/graphql';
import { useSnackbar } from '../contexts/SnackbarContext';

const MarketGroupsManager: React.FC = () => {
  const { showSuccess, showError } = useSnackbar();
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [newMarketGroupName, setNewMarketGroupName] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [marketGroupToDelete, setMarketGroupToDelete] = useState<{ publicId: string; name: string } | null>(null);

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
    refetch: refetchMarketGroups,
  } = useQuery<FindAllMarketGroupsData, FindAllMarketGroupsVariables>(
    FIND_ALL_MARKET_GROUPS,
    {
      variables: { brandPublicId: selectedBrandId },
      skip: !selectedBrandId,
    }
  );

  // Mutation for creating market group
  const [createMarketGroup, { loading: createLoading }] = useMutation<
    CreateMarketGroupData,
    CreateMarketGroupVariables
  >(CREATE_MARKET_GROUP);

  // Mutation for deleting market group
  const [deleteMarketGroup, { loading: deleteLoading }] = useMutation<
    DeleteMarketGroupData,
    DeleteMarketGroupVariables
  >(DELETE_MARKET_GROUP);

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

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    setNewMarketGroupName('');
  };

  const handleCreateMarketGroup = async () => {
    if (!newMarketGroupName.trim() || !selectedBrandId) {
      showError('Please enter a market group name');
      return;
    }

    try {
      await createMarketGroup({
        variables: {
          brandPublicId: selectedBrandId,
          name: newMarketGroupName.trim(),
        },
      });
      showSuccess('Market group created successfully!');
      setNewMarketGroupName('');
      // Refetch market groups after creation
      await refetchMarketGroups();
    } catch (error) {
      showError(`Failed to create market group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteMarketGroup = (marketGroup: { publicId: string; name: string }) => {
    setMarketGroupToDelete(marketGroup);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMarketGroupToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!marketGroupToDelete) return;

    try {
      await deleteMarketGroup({
        variables: {
          marketGroupPublicId: marketGroupToDelete.publicId,
        },
      });
      showSuccess('Market group deleted successfully!');
      // Refetch market groups after deletion
      await refetchMarketGroups();
    } catch (error) {
      showError(`Failed to delete market group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const isCreateButtonDisabled = !newMarketGroupName.trim() || !selectedBrandId || createLoading;

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
              brandsData.findAllBrands.map((brand: { publicId: string; name: string }) => (
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

      {/* Market Groups List */}
      {selectedBrandId && (
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Market Groups
            </Typography>
          </Box>
          <Divider />
          {marketGroupsLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="150px">
              <CircularProgress />
            </Box>
          ) : marketGroupsData && marketGroupsData.findAllMarketGroups.length > 0 ? (
            <List>
              {marketGroupsData.findAllMarketGroups.map((marketGroup: { publicId: string; name: string }) => (
                <ListItem
                  key={marketGroup.publicId}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteMarketGroup(marketGroup)}
                      disabled={deleteLoading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={marketGroup.name}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                No market groups found for this brand
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {!selectedBrandId && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            Select a brand to view market groups
          </Typography>
        </Box>
      )}

      {/* Create Market Group Form */}
      {selectedBrandId && (
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Create New Market Group
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Market Group Name"
              value={newMarketGroupName}
              onChange={(e) => setNewMarketGroupName(e.target.value)}
              fullWidth
              disabled={createLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isCreateButtonDisabled) {
                  handleCreateMarketGroup();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleCreateMarketGroup}
              disabled={isCreateButtonDisabled}
              sx={{ minWidth: '120px' }}
            >
              {createLoading ? <CircularProgress size={24} /> : 'Create'}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Market Group
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Deleting the market group{marketGroupToDelete ? ` "${marketGroupToDelete.name}"` : ''} will also delete the markets that belong to it (if they exist). This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarketGroupsManager;



