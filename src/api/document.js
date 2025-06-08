import useSWR from 'swr';
import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import qs from 'qs';

import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
export function useGetDocuments(filters = {}) {
  // Helper to check if a value is a valid Date
  function isValidDate(d) {
    return d instanceof Date && !Number.isNaN(d.getTime());
  }

  let startDate;
  let endDate;
  if (filters.dateRange?.[0]) {
    const d = new Date(filters.dateRange[0]);
    if (isValidDate(d)) startDate = d.toISOString();
  }
  if (filters.dateRange?.[1]) {
    const d = new Date(filters.dateRange[1]);
    if (isValidDate(d)) endDate = d.toISOString();
  }

  // Add pagination params
  const page = typeof filters.page === 'number' ? filters.page : 0;
  const pageSize = typeof filters.pageSize === 'number' ? filters.pageSize : 10;

  const query = qs.stringify(
    {
      projectCode: filters.project,
      type: filters.type,
      status: filters.status !== 'all' ? filters.status : undefined,
      startDate,
      endDate,
      page,
      pageSize,
    },
    { skipNulls: true, skipEmptyString: true }
  );

  const URL = query ? `${endpoints.documents.get}?${query}` : endpoints.documents.get;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  const memoizedValue = useMemo(
    () => ({
      documents: data?.documents || [],
      documentsLoading: isLoading,
      documentsError: error,
      documentsValidating: isValidating,
      documentsEmpty: !isLoading && !data?.documents.length,
      totalCount: data?.totalCount || 0, // for backend pagination
    }),
    [data?.documents, data?.totalCount, error, isLoading, isValidating]
  );
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
      revisions: data?.revisions,
      documentLoading: isLoading,
      documentError: error,
      documentValidating: isValidating,
    }),
    [data?.document, data?.revisions, isLoading, error, isValidating]
  );

  return memoizedValue;
}

export async function postDocumentWithFile(formData) {
  const response = await axiosInstance.post(endpoints.documents.post, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}

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

export async function putRevision(id, formData) {
  console.log('formData', formData.get('documentFile'));
  const response = await axiosInstance.put(`${endpoints.revisions.post}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}

// ----------------------------------------------------------------------
export async function postRemark(data) {
  const response = await axios.post(`${HOST_API}/remarks`, data);
  return response.data;
}

// ----------------------------------------------------------------------
export function useGetRemarks(revisionId) {
  const URL = revisionId ? `${endpoints.documents.get}/remarks/${revisionId}` : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  const memoizedValue = useMemo(
    () => ({
      remarks: data?.remarks || [],
      remarksLoading: isLoading,
      remarksError: error,
      remarksValidating: isValidating,
    }),
    [data?.remarks, error, isLoading, isValidating]
  );

  return memoizedValue;
}
