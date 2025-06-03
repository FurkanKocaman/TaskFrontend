import useSWR from 'swr';
import { useMemo } from 'react';

import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
export function useGetDocuments() {
  const URL = endpoints.documents.get;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      documents: data?.documents || [],
      documentsLoading: isLoading,
      documentsError: error,
      documentsValidating: isValidating,
      documentsEmpty: !isLoading && !data?.documents.length,
    }),
    [data?.documents, error, isLoading, isValidating]
  );

  console.log('DATA', data);

  return memoizedValue;
}

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
export function useGetDocument(documentId) {
  const URL = documentId ? `${endpoints.documents.get}/${documentId}` : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      document: data?.document,
      documentLoading: isLoading,
      documentError: error,
      documentValidating: isValidating,
    }),
    [data?.document, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function postDocumentWithFile(formData) {
  const response = await axiosInstance.post(endpoints.documents.post, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}
