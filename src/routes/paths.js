const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  page404: '/404',
  page500: '/500',
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    construction: {
      root: `${ROOTS.DASHBOARD}/construction`,
      pipeFollow: {
        root: `${ROOTS.DASHBOARD}/construction/pipe-follow`,
        spoolFollow: `${ROOTS.DASHBOARD}/construction/pipe-follow/spool-follow`,
      },
    },
    design: {
      root: `${ROOTS.DASHBOARD}/design`,
      documents: {
        root: `${ROOTS.DASHBOARD}/design/documents`,
        new: `${ROOTS.DASHBOARD}/design/documents/new`,
        edit: (id) => `${ROOTS.DASHBOARD}/design/documents/${id}/edit`,
        details: (id) => `${ROOTS.DASHBOARD}/design/documents/${id}`,
        revisions: (id) => `${ROOTS.DASHBOARD}/design/documents/${id}/revisions`,
        remarks: (id) => `${ROOTS.DASHBOARD}/design/documents/revisions/${id}/remarks`,
      },
    },
  },
};
