import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Grid from '@mui/material/Unstable_Grid2';
import { alpha } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import { fDate } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
import { useGetRevision } from 'src/api/revision';
import { useUserStore } from 'src/store/user-store';

// ----------------------------------------------------------------------

const REMARK_TABS = [
  { value: 'owner', label: 'Owner Remark', role: 'Owner' },
  { value: 'design', label: 'Design Remark', role: 'Design' },
  { value: 'class', label: 'Class Remark', role: 'Class' },
  { value: 'flag', label: 'Flag Remark', role: 'Flag' },
];

export default function DocumentDetailsView({ document, revisions }) {
  const settings = useSettingsContext();
  const { user } = useUserStore();
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState('details');
  const [selectedRemarkTab, setSelectedRemarkTab] = useState(REMARK_TABS[0].value);
  const [selectedRevision, setSelectedRevision] = useState(revisions?.[0]?._id || '');

  // Fetch revision data (including remarks) for the selected revision
  const { remarks = [], revisionLoading: isLoading } = useGetRevision(selectedRevision);

  // Tab change handlers
  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  // Remark sub-tab change handler
  const handleChangeRemarkTab = useCallback((event, newValue) => {
    setSelectedRemarkTab(newValue);
  }, []);

  // Revision dropdown change handler
  const handleRevisionChange = useCallback((event) => {
    setSelectedRevision(event.target.value);
  }, []);

  // If revisions change and selectedRevision is not in the list, reset to first
  if (revisions?.length > 0 && !revisions.some((r) => r._id === selectedRevision)) {
    setSelectedRevision(revisions[0]._id);
  }

  // Filter remarks by selected role
  const selectedRole = REMARK_TABS.find((tab) => tab.value === selectedRemarkTab)?.role;
  const filteredRemarks = remarks.filter((r) => r.role === selectedRole);

  // Find latest revision id
  const latestRevisionId = revisions?.length ? revisions[revisions.length - 1]._id : null;

  const renderError = (
    <EmptyContent
      filled
      title={t('Document not found')}
      action={
        <Button
          component={RouterLink}
          href={paths.dashboard.design.documents.root}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
          sx={{ mt: 3 }}
        >
          {t('Back to List')}
        </Button>
      }
      sx={{ py: 10 }}
    />
  );

  const renderDocument = document && (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('Document Details')}
          </Typography>

          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {t('Project Code')}
              </Typography>
              <Typography variant="body2">{document.projectCode}</Typography>
            </Grid>
            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {t('Document No')}
              </Typography>
              <Typography variant="body2">{document.documentNo}</Typography>
            </Grid>
            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {t('Type')}
              </Typography>
              <Typography variant="body2">{document.type}</Typography>
            </Grid>
            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {t('Title')}
              </Typography>
              <Typography variant="body2">{document.title}</Typography>
            </Grid>
            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {t('Contract Date')}
              </Typography>
              <Typography variant="body2">
                {document.contractDate ? fDate(document.contractDate) : '-'}
              </Typography>
            </Grid>
            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {t('Current Revision')}
              </Typography>
              <Typography variant="body2">{document.currentRevision}</Typography>
            </Grid>
            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {t('Status')}
              </Typography>
              <Typography variant="body2">{document.status}</Typography>
            </Grid>
            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {t('Approval Status')}
              </Typography>
              <Typography variant="body2">{document.approvalStatus}</Typography>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      <Grid xs={12}>
        <Card>
          <Tabs
            value={currentTab}
            onChange={handleChangeTab}
            sx={{
              px: 3,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {[
              { value: 'details', label: t('Document Details') },
              { value: 'revisions', label: t('Revisions') },
              { value: 'remarks', label: t('Remarks') },
            ].map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </Tabs>

          {currentTab === 'details' && (
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
                {t('Description')}
              </Typography>
              <Typography
                variant="body2"
                dangerouslySetInnerHTML={{
                  __html: document.description || '-',
                }}
              />
            </Card>
          )}

          {currentTab === 'revisions' && (
            <TableContainer>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px' }}>
                <Button
                  component={RouterLink}
                  href={paths.dashboard.design.documents.revisions(document._id)}
                  variant="contained"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                >
                  {t('New Revision')}
                </Button>
              </div>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Revision No')}</TableCell>
                    <TableCell>{t('Uploaded By')}</TableCell>
                    <TableCell>{t('Upload Date')}</TableCell>
                    <TableCell>{t('Notes')}</TableCell>
                    <TableCell>{t('Actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {revisions?.map((revision, idx) => {
                    const isLatest = revision._id === latestRevisionId;
                    return (
                      <TableRow key={revision._id}>
                        <TableCell>{revision.revisionNo}</TableCell>
                        <TableCell>{revision.uploadedBy}</TableCell>
                        <TableCell>{fDate(revision.uploadedAt)}</TableCell>
                        <TableCell>{revision.notes || '-'}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="primary"
                            startIcon={<Iconify icon="eva:download-fill" />}
                            onClick={() => {
                              if (revision.filePath) {
                                window.open(
                                  `${import.meta.env.VITE_HOST_API}/${revision.filePath}`,
                                  '_blank'
                                );
                              }
                            }}
                          >
                            {t('Download')}
                          </Button>
                          {/* Only latest revision is editable, others are read-only */}
                          {isLatest && (
                            <Button
                              size="small"
                              color="info"
                              sx={{ ml: 1 }}
                              component={RouterLink}
                              href={paths.dashboard.design.documents.revisions(document._id)}
                            >
                              {t('Edit')}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {currentTab === 'remarks' && (
            <>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 3 }}>
                <Typography variant="subtitle2">{t('Select Revision')}:</Typography>
                <Select
                  value={selectedRevision}
                  onChange={handleRevisionChange}
                  sx={{ minWidth: 200 }}
                  disabled={!revisions?.length}
                >
                  {revisions?.map((revision) => (
                    <MenuItem key={revision._id} value={revision._id}>
                      {t('Revision')} {revision.revisionNo}
                    </MenuItem>
                  ))}
                </Select>
                {/* Add Remark button only for selected role, authorization will be added later */}
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  disabled={!selectedRevision}
                  component={RouterLink}
                  href={
                    selectedRevision
                      ? paths.dashboard.design.documents.remarks(selectedRevision)
                      : '#'
                  }
                >
                  {t('Add Remark')}
                </Button>
              </Stack>
              {/* Sub-tabs for remark roles */}
              <Tabs
                value={selectedRemarkTab}
                onChange={handleChangeRemarkTab}
                sx={{ px: 3, mb: 2 }}
                variant="scrollable"
                scrollButtons="auto"
              >
                {REMARK_TABS.map((tab) => {
                  const hasRole = Array.isArray(user?.roles)
                    ? user.roles.includes(tab.role)
                    : user?.roles === tab.role;
                  return (
                    <Tab
                      key={tab.value}
                      value={tab.value}
                      label={tab.label}
                      disabled={!hasRole}
                      sx={!hasRole ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                    />
                  );
                })}
              </Tabs>
              <TableContainer>
                {isLoading && <Typography sx={{ p: 3 }}>{t('Loading remarks...')}</Typography>}
                {!isLoading && filteredRemarks.length === 0 && (
                  <Typography sx={{ p: 3 }}>
                    {t('No remarks found for this role in this revision')}
                  </Typography>
                )}
                {!isLoading && filteredRemarks.length > 0 && (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('Text')}</TableCell>
                        <TableCell>{t('Created By')}</TableCell>
                        <TableCell>{t('Created Date')}</TableCell>
                        <TableCell>{t('Actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRemarks.map((remark) => (
                        <TableRow key={remark._id}>
                          <TableCell>{remark.text}</TableCell>
                          <TableCell>{remark.createdBy}</TableCell>
                          <TableCell>{fDate(remark.createdAt)}</TableCell>
                          <TableCell>
                            {/* Only allow edit/delete for the selected role, authorization will be added later */}
                            <Button
                              size="small"
                              color="error"
                              startIcon={<Iconify icon="eva:trash-2-outline" />}
                              disabled={false} // will be controlled by authorization later
                            >
                              {t('Delete')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TableContainer>
            </>
          )}
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {!document && renderError}
      {document && renderDocument}
    </Container>
  );
}

DocumentDetailsView.propTypes = {
  document: PropTypes.shape({
    _id: PropTypes.string,
    projectCode: PropTypes.string,
    type: PropTypes.string,
    documentNo: PropTypes.string,
    title: PropTypes.string,
    contractDate: PropTypes.string,
    currentRevision: PropTypes.number,
    status: PropTypes.string,
    approvalStatus: PropTypes.string,
    description: PropTypes.string,
    createdBy: PropTypes.string,
  }),
  revisions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      revisionNo: PropTypes.number,
      uploadedBy: PropTypes.string,
      uploadedAt: PropTypes.string,
      notes: PropTypes.string,
      fileUrl: PropTypes.string,
    })
  ),
};

DocumentDetailsView.defaultProps = {
  document: null,
  revisions: [],
};
