import { useEffect, useCallback, useMemo, useState } from 'react';
import { Box, Card, Stack, Typography, Divider, CircularProgress, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Chart, { useChart } from 'src/components/chart';
import { getProjects, getProjectById } from 'src/api/project';

const columns = [
  { field: 'project_name', headerName: 'Proje', flex: 1, minWidth: 100 },
  { field: 'data_girilmis', headerName: 'Data Girilmiş', flex: 1, minWidth: 120 },
  { field: 'yayinlanmis', headerName: 'Yayınlanmış', flex: 1, minWidth: 120 },
  { field: 'klass_onayli', headerName: 'Klass Onaylı', flex: 1, minWidth: 120 },
  { field: 'bayrak_onayli', headerName: 'Bayrak Onaylı', flex: 1, minWidth: 120 },
  { field: 'onayda', headerName: 'Onayda', flex: 1, minWidth: 100 },
  { field: 'gecikmis', headerName: 'Gecikmiş', flex: 1, minWidth: 100 },
  { field: 'toplam', headerName: 'Toplam', flex: 1, minWidth: 100 },
];

export default function ProjectsSummaryPage() {
  const [projects, setProjects] = useState([]);
  const [backendSummary, setBackendSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjectLoading, setSelectedProjectLoading] = useState(false);
  const [selectedProjectError, setSelectedProjectError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProjects()
      .then((data) => {
        setProjects(data.projects);
        setBackendSummary(data.summary);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Veriler alınamadı');
        setLoading(false);
      });
  }, []);

  const handleRowClick = useCallback((params) => {
    setSelectedProjectLoading(true);
    setSelectedProjectError(null);
    getProjectById(params.id)
      .then((data) => {
        setSelectedProject(data);
        setSelectedProjectLoading(false);
      })
      .catch((err) => {
        setSelectedProjectError(err.message || 'Proje alınamadı');
        setSelectedProjectLoading(false);
      });
  }, []);

  const summary = useMemo(() => {
    if (selectedProject) {
      // Check if all required fields exist
      const hasAllFields = [
        'data_girilmis',
        'yayinlanmis',
        'klass_onayli',
        'bayrak_onayli',
        'onayda',
        'gecikmis',
        'toplam',
      ].every((key) => selectedProject[key] !== undefined && selectedProject[key] !== null);
      if (!hasAllFields) {
        return 'FIELDS_MISSING';
      }
      return {
        'Data Girilmiş': selectedProject.data_girilmis,
        Yayınlanmış: selectedProject.yayinlanmis,
        'Klass Onaylı': selectedProject.klass_onayli,
        'Bayrak Onaylı': selectedProject.bayrak_onayli,
        Onayda: selectedProject.onayda,
        gecikmis: selectedProject.gecikmis,
        Toplam: selectedProject.toplam,
      };
    }
    return (
      backendSummary || {
        'Data Girilmiş': 0,
        Yayınlanmış: 0,
        'Klass Onaylı': 0,
        'Bayrak Onaylı': 0,
        Onayda: 0,
        gecikmis: 0,
        Toplam: 0,
      }
    );
  }, [selectedProject, backendSummary]);

  // Donut chartta sadece 0'dan büyük olanlar gösterilsin
  const donutKeys = [
    'data_girilmis',
    'yayinlanmis',
    'klass_onayli',
    'bayrak_onayli',
    'onayda',
    'gecikmis',
  ];
  const chartLabels = donutKeys.filter((key) => summary[key] > 0);
  const chartSeries = chartLabels.map((key) => summary[key]);
  const chartOptions = useChart({
    labels: chartLabels,
    legend: {
      floating: true,
      position: 'bottom',
      horizontalAlign: 'center',
    },
    tooltip: {
      fillSeriesColor: false,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            value: {
              formatter: (val) => val,
            },
            total: {
              show: true,
              formatter: () => chartSeries.reduce((a, b) => a + b, 0),
            },
          },
        },
      },
    },
  });

  let summaryContent;
  if (selectedProjectLoading) {
    summaryContent = (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
        <CircularProgress size={24} />
      </Box>
    );
  } else if (selectedProjectError) {
    summaryContent = <Alert severity="error">{selectedProjectError}</Alert>;
  } else if (summary === 'FIELDS_MISSING') {
    summaryContent = (
      <Alert severity="warning">
        Seçili proje için özet veriler eksik veya alınamadı. Backend API çıktısını kontrol edin.
      </Alert>
    );
  } else {
    summaryContent = (
      <Stack spacing={1}>
        {Object.entries(summary).map(([key, value], idx) => (
          <Stack key={key} direction="row" justifyContent="space-between">
            <Typography variant="body2">{key}</Typography>
            <Typography variant="subtitle2">{value}</Typography>
          </Stack>
        ))}
      </Stack>
    );
  }

  let mainContent;
  if (loading) {
    mainContent = (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  } else if (error) {
    mainContent = <Alert severity="error">{error}</Alert>;
  } else {
    mainContent = (
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch">
        {/* DataGrid Table */}
        <Card sx={{ flex: 2, minWidth: 0, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Proje Tablosu
          </Typography>
          <Box sx={{ width: '100%', height: 400 }}>
            <DataGrid
              rows={projects}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10]}
              autoHeight
              disableSelectionOnClick
              onRowClick={handleRowClick}
              getRowId={(row) => row.id}
            />
          </Box>
        </Card>
        {/* Mini Summary + Chart */}
        <Stack flex={1} spacing={3} sx={{ minWidth: 260 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {selectedProject ? `${selectedProject.project_name} Özeti` : 'Genel Özet'}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {summaryContent}
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Dağılım Grafiği
            </Typography>
            <Chart
              dir="ltr"
              type="donut"
              series={chartSeries}
              options={chartOptions}
              width="100%"
              height={280}
            />
          </Card>
        </Stack>
      </Stack>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Proje Özetleri
      </Typography>
      {mainContent}
    </Box>
  );
}
