import { useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

import { useGetDocument } from 'src/api/document';

import DocumentsNewEditForm from 'src/sections/desing/documents/documents-new-edit-form';

// ----------------------------------------------------------------------

export default function DocumentsNewPage() {
  const { id } = useParams();

  const { document } = useGetDocument(id);

  return (
    <>
      <Helmet>
        <title> Dashboard: Documents</title>
      </Helmet>

      <DocumentsNewEditForm currentDocument={document} />
    </>
  );
}
