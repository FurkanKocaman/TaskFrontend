import { useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

import { useGetDocument } from 'src/api/document';
import DocumentDetailsView from 'src/sections/desing/documents/view/documents-details-view';

// ----------------------------------------------------------------------

export default function DocumentDetailsPage() {
  const { id } = useParams();

  const { document, revisions } = useGetDocument(id);

  console.log('Document', document, revisions);

  return (
    <>
      <Helmet>
        <title> Dashboard: Document Details</title>
      </Helmet>

      <DocumentDetailsView document={document} revisions={revisions} />
    </>
  );
}
