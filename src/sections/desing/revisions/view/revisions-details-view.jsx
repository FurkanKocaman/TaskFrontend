import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import Grid from '@mui/material/Unstable_Grid2';
import { alpha } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import { fDate } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const REMARK_TABS = [
  { value: 'owner', label: 'Owner Remark', role: 'Owner' },
  { value: 'design', label: 'Design Remark', role: 'Design' },
  { value: 'class', label: 'Class Remark', role: 'Class' },
  { value: 'flag', label: 'Flag Remark', role: 'Flag' },
];

export default function DocumentDetailsView({
  document,
  revisions,
  remarks,
  userRole,
  onAddRemark,
}) {
  const settings = useSettingsContext();

  const [currentTab, setCurrentTab] = useState('details');
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [remarkTab, setRemarkTab] = useState('owner');
  const [newRemark, setNewRemark] = useState('');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const handleChangeRemarkTab = useCallback((event, newValue) => {
    setRemarkTab(newValue);
  }, []);

  const handleSelectRevision = useCallback((revision) => {
    setSelectedRevision(revision);
  }, []);

  const handleAddRemark = useCallback(() => {
    if (newRemark.trim() && selectedRevision) {
      onAddRemark({
        revisionId: selectedRevision._id,
        role: REMARK_TABS.find((tab) => tab.value === remarkTab)?.role,
        text: newRemark.trim(),
      });
      setNewRemark('');
    }
  }, [newRemark, onAddRemark, remarkTab, selectedRevision]);

  const filteredRemarks = remarks?.filter(
    (remark) =>
      remark.revisionId === selectedRevision?._id &&
      remark.role === REMARK_TABS.find((tab) => tab.value === remarkTab)?.role
  );

  const renderError = (
    <EmptyContent
      filled
      title="Document not found"
      action={
        <Button
          component={RouterLink}
          href={paths.dashboard.design.documents.root}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
          sx={{ mt: 3 }}
        >
          Back to List
        </Button>
      }
      sx={{ py: 10 }}
    />
  );

  const renderRemarks = (
    <Card sx={{ mt: 3 }}>
      <Tabs
        value={remarkTab}
        onChange={handleChangeRemarkTab}
        sx={{
          px: 3,
          boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
        }}
      >
        {REMARK_TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            disabled={!selectedRevision || userRole !== tab.role}
          />
        ))}
      </Tabs>

      <Stack spacing={3} sx={{ p: 3 }}>
        {selectedRevision ? (
          <>
            {filteredRemarks?.map((remark) => (
              <Card key={remark._id} sx={{ p: 2, bgcolor: 'background.neutral' }}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle2">{remark.createdBy}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {fDate(remark.createdAt)}
                    </Typography>
                  </Stack>
                  <Typography variant="body2">{remark.text}</Typography>
                </Stack>
              </Card>
            ))}

            {userRole === REMARK_TABS.find((tab) => tab.value === remarkTab)?.role && (
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Add a remark..."
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                />
                <IconButton color="primary" onClick={handleAddRemark} disabled={!newRemark.trim()}>
                  <Iconify icon="eva:plus-fill" />
                </IconButton>
              </Stack>
            )}
          </>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
            Select a revision to view remarks
          </Typography>
        )}
      </Stack>
    </Card>
  );

  const renderDocument = document && (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Document Details
          </Typography>

          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Project Code
              </Typography>
              <Typography variant="body2">{document.projectCode}</Typography>
            </Grid>

            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Document No
              </Typography>
              <Typography variant="body2">{document.documentNo}</Typography>
            </Grid>

            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Type
              </Typography>
              <Typography variant="body2">{document.type}</Typography>
            </Grid>

            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Title
              </Typography>
              <Typography variant="body2">{document.title}</Typography>
            </Grid>

            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Contract Date
              </Typography>
              <Typography variant="body2">
                {document.contractDate ? fDate(document.contractDate) : '-'}
              </Typography>
            </Grid>

            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Current Revision
              </Typography>
              <Typography variant="body2">{document.currentRevision}</Typography>
            </Grid>

            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Status
              </Typography>
              <Typography variant="body2">{document.status}</Typography>
            </Grid>

            <Grid xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Approval Status
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
              {
                value: 'details',
                label: 'Document Details',
              },
              {
                value: 'revisions',
                label: 'Revisions',
              },
            ].map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </Tabs>

          {currentTab === 'details' && (
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
                Description
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
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Revision No</TableCell>
                      <TableCell>Uploaded By</TableCell>
                      <TableCell>Upload Date</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revisions?.map((revision) => (
                      <TableRow
                        key={revision._id}
                        selected={selectedRevision?._id === revision._id}
                        onClick={() => handleSelectRevision(revision)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{revision.revisionNo}</TableCell>
                        <TableCell>{revision.uploadedBy}</TableCell>
                        <TableCell>{fDate(revision.uploadedAt)}</TableCell>
                        <TableCell>{revision.notes || '-'}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="primary"
                            startIcon={<Iconify icon="eva:download-fill" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (revision.filePath) {
                                window.open(
                                  import.meta.env.VITE_HOST_API + revision.filePath,
                                  '_blank'
                                );
                              }
                            }}
                          >
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {renderRemarks}
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
      filePath: PropTypes.string,
    })
  ),
  remarks: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      revisionId: PropTypes.string,
      role: PropTypes.oneOf(['Owner', 'Design', 'Class', 'Flag']),
      text: PropTypes.string,
      createdBy: PropTypes.string,
      createdAt: PropTypes.string,
    })
  ),
  userRole: PropTypes.oneOf(['Owner', 'Design', 'Class', 'Flag']),
  onAddRemark: PropTypes.func,
};

DocumentDetailsView.defaultProps = {
  document: null,
  revisions: [],
  remarks: [],
  userRole: null,
  onAddRemark: () => {},
};
