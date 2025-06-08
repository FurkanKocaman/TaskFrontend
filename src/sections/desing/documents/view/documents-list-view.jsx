import isEqual from 'lodash/isEqual';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import {
  DataGrid,
  GridToolbarExport,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetDocuments } from 'src/api/document';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Chart, { useChart } from 'src/components/chart';

import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DesingTableFiltersResult from '../../desing-table-filters-result';
import DocumentsTableToolbar from '../../documents-table-toolbar';

// ----------------------------------------------------------------------

const defaultFilters = {
  project: '',
  type: '',
  status: 'all',
  dateRange: [null, null],
};

const HIDE_COLUMNS = {
  category: true,
};

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export default function DocumentsListView() {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const confirmRows = useBoolean();
  const router = useRouter();
  const settings = useSettingsContext();
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);
  // Pagination states
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch documents with filters and pagination from backend
  const { documents, documentsLoading, totalCount } = useGetDocuments({
    ...filters,
    page: page + 1, // Backend expects 1-based page
    pageSize,
  });

  const canReset = !isEqual(defaultFilters, filters);

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    (id) => {
      enqueueSnackbar(t('Delete success!'));
    },
    [enqueueSnackbar, t]
  );

  const handleDeleteRows = useCallback(() => {
    enqueueSnackbar(t('Delete success!'));
  }, [enqueueSnackbar, t]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.design.documents.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.design.documents.details(id));
    },
    [router]
  );

  const PROJECT_OPTIONS = [
    { value: '', label: t('All') },
    ...Array.from(new Set(documents.map((doc) => doc.projectCode))).map((code) => ({
      value: code,
      label: t(code),
    })),
  ];

  const TYPE_OPTIONS = [
    { value: '', label: t('All') },
    ...Array.from(new Set(documents.map((doc) => doc.type))).map((type) => ({
      value: type,
      label: t(type),
    })),
  ];

  const STATUS_OPTIONS = [
    { value: 'all', label: t('All') },
    { value: 'data_entered', label: t('Data Entered') },
    { value: 'published', label: t('Published') },
  ];

  const columns = [
    {
      field: 'projectCode',
      headerName: t('Project Code'),
      width: 120,
    },
    {
      field: 'documentNo',
      headerName: t('Document Number'),
      width: 160,
    },
    {
      field: 'type',
      headerName: t('Type'),
      width: 120,
      valueGetter: (params) => (params.row.type ? t(params.row.type) : '-'),
    },
    {
      field: 'title',
      headerName: t('Topic'),
      width: 180,
    },
    {
      field: 'currentRevision',
      headerName: t('Current Revision'),
      width: 120,
      valueGetter: (params) => params.row.currentRevision || '-',
    },
    {
      field: 'revisionDate',
      headerName: t('Revision Date'),
      width: 140,
      valueGetter: (params) =>
        params.row.revisionDate ? new Date(params.row.revisionDate).toLocaleDateString() : '-',
    },
    {
      field: 'createdAt',
      headerName: t('Created At'),
      width: 140,
      valueGetter: (params) =>
        params.row.createdAt ? new Date(params.row.createdAt).toLocaleDateString() : '-',
    },
    {
      field: 'revisionUploader',
      headerName: t('Uploaded By'),
      width: 120,
      valueGetter: (params) => params.row.revisionUploader || '-',
    },
    {
      field: 'status',
      headerName: t('Status'),
      width: 140,
      valueGetter: (params) => {
        if (params.row.status === 'data_entered') return t('Data Entered');
        if (params.row.status === 'published') return t('Published');
        return params.row.status ? t(params.row.status) : '-';
      },
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: ' ',
      align: 'right',
      headerAlign: 'right',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label={t('View')}
          onClick={() => handleViewRow(params.row.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:pen-bold" />}
          label={t('Edit')}
          onClick={() => handleEditRow(params.row.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label={t('Delete')}
          onClick={() => {
            handleDeleteRow(params.row.id);
          }}
          sx={{ color: 'error.main' }}
        />,
      ],
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  // --- SUMMARY CALCULATIONS ---
  const published = documents.filter((d) => d.approvalStatus === 'published').length;
  const klassApproved = documents.filter((d) => d.approvalStatus === 'klass').length;
  const flagApproved = documents.filter((d) => d.approvalStatus === 'flag').length;
  const onayda = documents.filter((d) =>
    ['pending', 'approved', 'revised'].includes(d.approvalStatus)
  ).length;
  const gecikmis = documents.filter((d) => d.approvalStatus === 'expired').length;
  const total = documents.length;
  let dataGirilmis = total - (published + klassApproved + flagApproved + onayda + gecikmis);
  if (dataGirilmis < 0) dataGirilmis = 0;
  const donutSeriesRaw = [dataGirilmis, published, klassApproved, flagApproved, onayda, gecikmis];
  const donutSeries = donutSeriesRaw.every((v) => v === 0) ? [1, 0, 0, 0, 0, 0] : donutSeriesRaw;

  const donutLabels = [
    'Data Girilmiş',
    'Yayınlanmış',
    'Klass Onaylı',
    'Bayrak Onaylı',
    'Onayda',
    'Gecikmiş',
  ];

  const chartOptions = useChart({
    labels: donutLabels,
    legend: { position: 'bottom' },
    plotOptions: { pie: { donut: { size: '80%' } } },
    tooltip: { fillSeriesColor: false },
  });

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'xl'}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CustomBreadcrumbs
          heading={t('List')}
          links={[
            { name: t('Dashboard'), href: paths.dashboard.root },
            {
              name: t('Document'),
              href: paths.dashboard.design.root,
            },
            { name: t('List') },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.design.documents.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('New Document')}
            </Button>
          }
          sx={{
            mb: {
              xs: 1,
              md: 1,
            },
          }}
        />
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 2, md: 2 }}
          alignItems="stretch"
          sx={{ width: '100%' }}
        >
          {/* Table Card */}
          <Box
            flex={1}
            minWidth={0}
            sx={{
              width: '100%',
              overflowX: { xs: 'auto', md: 'visible' },
              mb: { xs: 2, md: 0 },
            }}
          >
            <Card
              sx={{
                height: { xs: 'auto', md: 'auto' },
                minHeight: { xs: 400, md: 700 },
                flexGrow: 1,
                display: { md: 'flex' },
                flexDirection: { md: 'column' },
                overflow: 'auto',
                p: { xs: 1, md: 2 },
                minWidth: 0,
                boxShadow: { xs: 0, md: 1 },
              }}
            >
              <Tabs
                value={filters.status}
                onChange={(event, newValue) => handleFilters('status', newValue)}
                sx={{
                  px: { xs: 1, md: 2.5 },
                  boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
                }}
              >
                {STATUS_OPTIONS.map((tab) => {
                  let count = documents.length;
                  if (tab.value === 'published') {
                    count = documents.filter((user) => user.status === 'published').length;
                  } else if (tab.value === 'data_entered') {
                    count = documents.filter((user) => user.status === 'data_entered').length;
                  }
                  return (
                    <Tab
                      key={tab.value}
                      iconPosition="end"
                      value={tab.value}
                      label={tab.label}
                      icon={
                        <Label
                          variant={(tab.value === filters.status && 'filled') || 'soft'}
                          color={(tab.value === 'published' && 'success') || 'default'}
                        >
                          {count}
                        </Label>
                      }
                    />
                  );
                })}
              </Tabs>
              <Box sx={{ width: '100%', minWidth: { xs: 600, md: 900 }, maxWidth: '100vw' }}>
                <DataGrid
                  getRowId={(row) => row.id}
                  checkboxSelection
                  disableRowSelectionOnClick
                  rows={documents}
                  columns={columns}
                  loading={documentsLoading}
                  getRowHeight={() => 'auto'}
                  pageSizeOptions={[5, 10, 25]}
                  rowCount={totalCount || documents.length}
                  pagination
                  paginationMode="server"
                  page={page}
                  pageSize={pageSize}
                  onPageChange={(newPage) => setPage(newPage)}
                  onPageSizeChange={(newPageSize) => {
                    setPageSize(newPageSize);
                    setPage(0);
                  }}
                  localeText={{
                    noRowsLabel: t('No Data'),
                    noResultsOverlayLabel: t('No results found'),
                  }}
                  sx={{
                    width: '100%',
                    minWidth: { xs: 600, md: 900 },
                    maxWidth: '100vw',
                  }}
                  onRowSelectionModelChange={(newSelectionModel) => {
                    setSelectedRowIds(newSelectionModel);
                  }}
                  columnVisibilityModel={columnVisibilityModel}
                  onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                  onRowClick={(params, event) => {
                    if (
                      event.target.closest('.MuiDataGrid-actionsCell') ||
                      event.target.closest('[role="menu"]')
                    ) {
                      return;
                    }
                    handleViewRow(params.row.id);
                  }}
                  slots={{
                    toolbar: () => (
                      <>
                        <GridToolbarContainer>
                          <DocumentsTableToolbar
                            filters={filters}
                            onFilters={handleFilters}
                            projectOptions={PROJECT_OPTIONS}
                            typeOptions={TYPE_OPTIONS}
                            statusOptions={STATUS_OPTIONS}
                          />
                          <GridToolbarQuickFilter
                            sx={{
                              flexShrink: 0,
                              width: { xs: 1, md: 180 },
                            }}
                          />
                          <Stack
                            spacing={1}
                            flexGrow={1}
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-end"
                          >
                            {!!selectedRowIds.length && (
                              <Button
                                size="small"
                                color="error"
                                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                                onClick={confirmRows.onTrue}
                                sx={{ fontSize: { xs: 12, md: 14 }, px: { xs: 1, md: 2 } }}
                              >
                                {t('Delete')} ({selectedRowIds.length})
                              </Button>
                            )}
                            <GridToolbarColumnsButton />
                            <GridToolbarFilterButton />
                            <GridToolbarExport />
                          </Stack>
                        </GridToolbarContainer>
                        {canReset && (
                          <DesingTableFiltersResult
                            filters={filters}
                            onFilters={handleFilters}
                            onResetFilters={handleResetFilters}
                            results={documents.length}
                            sx={{ p: { xs: 1, md: 2.5 }, pt: 0 }}
                          />
                        )}
                      </>
                    ),
                    noRowsOverlay: () => <EmptyContent title={t('No Data')} />,
                    noResultsOverlay: () => <EmptyContent title={t('No results found')} />,
                  }}
                  slotProps={{
                    columnsPanel: {
                      getTogglableColumns,
                    },
                  }}
                />
              </Box>
            </Card>
          </Box>
          {/* Mini Summary Card */}
          <Card
            sx={{
              minWidth: { xs: '100%', md: 260 },
              maxWidth: { xs: '100%', md: 340 },
              p: { xs: 1.5, md: 2 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: { xs: 0, md: 0 },
              flexShrink: 0,
              boxShadow: { xs: 0, md: 1 },
            }}
          >
            <CardHeader title={t('Mini Özet')} sx={{ p: 0, mb: 2, textAlign: 'center' }} />
            <Chart
              dir="ltr"
              type="donut"
              series={donutSeries}
              options={chartOptions}
              width={220}
              height={220}
            />
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body2">
                Data Girilmiş: <b>{dataGirilmis}</b>
              </Typography>
              <Typography variant="body2">
                Yayınlanmış: <b>{published}</b>
              </Typography>
              <Typography variant="body2">
                Klass Onaylı: <b>{klassApproved}</b>
              </Typography>
              <Typography variant="body2">
                Bayrak Onaylı: <b>{flagApproved}</b>
              </Typography>
              <Typography variant="body2">
                Onayda: <b>{onayda}</b>
              </Typography>
              <Typography variant="body2">
                Gecikmiş: <b>{gecikmis}</b>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Toplam: <b>{total}</b>
              </Typography>
            </Box>
          </Card>
        </Stack>
      </Container>

      <ConfirmDialog
        open={confirmRows.value}
        onClose={confirmRows.onFalse}
        title={t('Delete')}
        content={
          <>
            {t('Are you sure want to delete')} <strong> {selectedRowIds.length} </strong>{' '}
            {t('items?')}
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirmRows.onFalse();
            }}
          >
            {t('Delete')}
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, filters }) {
  const { project, type, status, dateRange } = filters;
  let filtered = inputData;

  if (project) {
    filtered = filtered.filter((doc) => doc.projectCode === project);
  }
  if (type) {
    filtered = filtered.filter((doc) => doc.type === type);
  }
  if (status && status !== 'all') {
    filtered = filtered.filter((doc) => doc.status === status);
  }
  if (dateRange && dateRange[0] && dateRange[1]) {
    const start = new Date(dateRange[0]).setHours(0, 0, 0, 0);
    const end = new Date(dateRange[1]).setHours(23, 59, 59, 999);
    filtered = filtered.filter((doc) => {
      const created = new Date(doc.createdAt).getTime();
      return created >= start && created <= end;
    });
  }
  return filtered;
}
