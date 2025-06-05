import { useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';

import RemarkNewEditForm from 'src/sections/desing/remarks/remark-new-edit-form';
import { useGetRevision } from 'src/api/document';

// ----------------------------------------------------------------------

export default function RemarksNewPage() {
  const { id } = useParams();

  const { revision, remarks, revisionLoading, revisionError } = useGetRevision(id);

  console.log('Revision', revision, remarks);

  const renderLoading = (
    <Box sx={{ py: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );

  const renderError = (
    <Container>
      <EmptyContent
        filled
        title="Revision not found"
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.design.documents.root}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
            sx={{ mt: 3 }}
          >
            Back to Documents
          </Button>
        }
        sx={{ py: 10 }}
      />
    </Container>
  );

  return (
    <>
      <Helmet>
        <title> Dashboard: New Remark</title>
      </Helmet>

      {revisionLoading && renderLoading}
      {revisionError && renderError}
      {revision && <RemarkNewEditForm currentRevision={revision} />}
    </>
  );
}
