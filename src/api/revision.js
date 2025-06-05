import useSWR from 'swr';
import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';

import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';

const HOST_API = import.meta.env.VITE_HOST_API || '';

export function useGetRevision(revisionId) {
  const URL = revisionId ? `${endpoints.revisions.get}/${revisionId}` : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  const memoizedValue = useMemo(
    () => ({
      revision: data?.revision,
      remarks: data?.remarks,
      revisionLoading: isLoading,
      revisionError: error,
      revisionValidating: isValidating,
    }),
    [data?.revision, data?.remarks, isLoading, error, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
export async function postRevision(documentId, formData) {
  console.log('formData', formData.get('documentFile'));
  const response = await axiosInstance.post(
    `${endpoints.documents.get}/${documentId}/revision`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return response.data;
}

// ----------------------------------------------------------------------
export async function postRemark(revisionId, data) {
  const response = await axiosInstance.post(
    `${endpoints.revisions.post}/${revisionId}/remark`,
    data
  );
  return response.data;
}
