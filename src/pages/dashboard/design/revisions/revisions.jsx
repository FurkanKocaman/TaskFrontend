import { Helmet } from 'react-helmet-async';

import DocumentsListView from 'src/sections/desing/documents/view/documents-list-view';

// ----------------------------------------------------------------------

export default function DocumentsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Documents</title>
      </Helmet>

      <DocumentsListView />
    </>
  );
}
