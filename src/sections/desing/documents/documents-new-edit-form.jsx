import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { parseISO } from 'date-fns';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useMemo, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { postDocumentWithFile } from 'src/api/document';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFEditor,
  RHFUpload,
  RHFTextField,
} from 'src/components/hook-form';

const DESING_CATEGORY_GROUP_OPTIONS = [
  {
    classify: [
      'Arajman',
      'Hesap',
      'Diagram',
      'Elektrik',
      'Teçhiz',
      'Çelik',
      'Plan',
      'Prosedür',
      'Rapor',
    ],
  },
];
const DOCUMENT_STATUS_OPTIONS = [
  {
    classify: ['Data Girilmiş', 'Yayınlanmış'],
  },
];
const DOCUMENT_APPROVAL_STATUS_OPTIONS = [
  {
    classify: [
      'Klass Onayı Gerekli',
      'Bayrak Onayı Gerekli',
      'Sadece Owner',
      'Onayda',
      'Onaylanmadı',
    ],
  },
];

const DESING_Project_GROUP_OPTIONS = [
  {
    classify: ['NB001', 'NB002', 'NB003', 'NB004', 'NB005', 'NB006', 'NB007', 'NB008', 'NB009'],
  },
];

export default function DocumentsNewEditForm({ currentDocument }) {
  console.log('currentDocument', currentDocument);

  DocumentsNewEditForm.propTypes = {
    currentDocument: PropTypes.object,
  };

  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const NewDocumnetSchema = Yup.object().shape({
    projectName: Yup.string().required('Project name is required'),
    documentType: Yup.string().required('Document type is required'),
    documentNo: Yup.string().required('Document number is required'),
    documentTopic: Yup.string().required('Document topic is required'),
    contractDate: Yup.date().required('Contract date is required'),
    revisionNumber: Yup.number().required('Revision number is required'),
    status: Yup.string().required('Status is required'),
    approvalStatus: Yup.string().required('Approval status is required'),
    description: Yup.string().required('Description is required'),
    files: Yup.array().min(1, 'Files is required'),
  });

  const defaultValues = useMemo(
    () => ({
      projectName: currentDocument?.projectCode || '',
      documentType: currentDocument?.type || '',
      documentNo: currentDocument?.documentNo?.toString?.() || '',
      documentTopic: currentDocument?.title || '',
      contractDate: currentDocument?.contractDate ? parseISO(currentDocument.contractDate) : null,
      revisionNumber: currentDocument?.currentRevision || '',
      status: currentDocument?.status || '',
      approvalStatus: currentDocument?.approvalStatus || '',
      description: currentDocument?.description || '',
      files: currentDocument?.files || [],
    }),
    [currentDocument]
  );

  const methods = useForm({
    resolver: yupResolver(NewDocumnetSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentDocument) {
      reset(defaultValues);
    }
  }, [currentDocument, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();

      formData.append('projectCode', data.projectName);
      formData.append('type', data.documentType);
      formData.append('documentNo', data.documentNo);
      formData.append('title', data.documentTopic);
      formData.append(
        'contractDate',
        data.contractDate ? new Date(data.contractDate).toISOString() : ''
      );
      formData.append('description', data.description);
      formData.append('createdBy', 'admin');

      if (data.files.length > 0) {
        formData.append('documentFile', data.files[0]);
      } else {
        enqueueSnackbar('Lütfen bir dosya ekleyin', { variant: 'error' });
        return;
      }

      await postDocumentWithFile(formData);

      enqueueSnackbar('Doküman başarıyla oluşturuldu!');
      reset();
      router.push(paths.dashboard.design.documents.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error?.message || 'Bir hata oluştu', { variant: 'error' });
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const files = values.files || [];

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setValue('files', [...files, ...newFiles], { shouldValidate: true });
    },
    [setValue, values.files]
  );

  const handleRemoveFile = useCallback(
    (inputFile) => {
      const filtered = values.files && values.files?.filter((file) => file !== inputFile);
      setValue('files', filtered);
    },
    [setValue, values.files]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('files', []);
  }, [setValue]);

  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Stack spacing={3} sx={{ p: 3 }}>
          <Card>
            <Stack spacing={3} sx={{ p: 3 }}>
              <Box
                columnGap={2}
                rowGap={3}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  md: 'repeat(2, 1fr)',
                }}
              >
                <RHFSelect
                  native
                  name="projectName"
                  label="Project Name"
                  InputLabelProps={{ shrink: true }}
                >
                  <option value="">Select a project</option>
                  {DESING_Project_GROUP_OPTIONS.map((category) =>
                    category.classify.map((classify) => (
                      <option key={classify} value={classify}>
                        {classify}
                      </option>
                    ))
                  )}
                </RHFSelect>
                <RHFSelect
                  native
                  name="documentType"
                  label="Document Type"
                  InputLabelProps={{ shrink: true }}
                >
                  <option value="">Select document type</option>
                  {DESING_CATEGORY_GROUP_OPTIONS.map((category) =>
                    category.classify.map((classify) => (
                      <option key={classify} value={classify}>
                        {classify}
                      </option>
                    ))
                  )}
                </RHFSelect>

                <RHFTextField name="documentNo" label="Document number" />
                <RHFTextField name="documentTopic" label="Document Topic" />

                <Controller
                  name="contractDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="Due Date"
                      value={field.value}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                        },
                      }}
                    />
                  )}
                />
                <RHFTextField name="revisionNumber" label="Revision number" />
                <RHFSelect native name="status" label="Status" InputLabelProps={{ shrink: true }}>
                  <option value="">Select status</option>
                  {DOCUMENT_STATUS_OPTIONS.map((category) =>
                    category.classify.map((classify) => (
                      <option key={classify} value={classify}>
                        {classify}
                      </option>
                    ))
                  )}
                </RHFSelect>
                <RHFSelect
                  native
                  name="approvalStatus"
                  label="Approval Status"
                  InputLabelProps={{ shrink: true }}
                >
                  <option value="">Select approval status</option>
                  {DOCUMENT_APPROVAL_STATUS_OPTIONS.map((category) =>
                    category.classify.map((classify) => (
                      <option key={classify} value={classify}>
                        {classify}
                      </option>
                    ))
                  )}
                </RHFSelect>
              </Box>

              <Divider sx={{ borderStyle: 'dashed' }} />
            </Stack>
          </Card>
        </Stack>
      </Grid>
      <Grid xs={12} md={12}>
        <Stack sx={{ p: 3 }}>
          <Card>
            <Stack spacing={3} sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Description</Typography>
                <RHFEditor simple name="description" />
              </Stack>

              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Files</Typography>
                <RHFUpload
                  multiple
                  thumbnail
                  name="files"
                  maxSize={3145728}
                  onDrop={handleDrop}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  onUpload={() => console.info('ON UPLOAD')}
                />
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      <Grid md={4} />
      <Grid xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
        <Grid sx={{ flexGrow: 1, pl: 12 }} />

        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentDocument ? 'Create Document' : 'Save Changes'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}
