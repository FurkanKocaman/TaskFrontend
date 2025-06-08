import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { parseISO } from 'date-fns';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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
import { Button } from '@mui/material';
import { useUserStore } from 'src/store/user-store';

const DESING_CATEGORY_GROUP_OPTIONS = [
  {
    classify: [
      'Arrangement',
      'Calculation',
      'Diagram',
      'Electric',
      'Equipment',
      'Steel',
      'Plan',
      'Procedure',
      'Report',
    ],
  },
];
const DOCUMENT_STATUS_OPTIONS = [
  {
    classify: ['data_entered', 'published'],
  },
];
const DOCUMENT_APPROVAL_STATUS_OPTIONS = [
  {
    classify: [
      'class_approval_required',
      'flag_approval_required',
      'owner_only',
      'in_approval',
      'not_approved',
    ],
  },
];

const DESING_Project_GROUP_OPTIONS = [
  {
    classify: ['NB001', 'NB002', 'NB003', 'NB004', 'NB005', 'NB006', 'NB007', 'NB008', 'NB009'],
  },
];

export default function DocumentsNewEditForm({ currentDocument }) {
  DocumentsNewEditForm.propTypes = {
    currentDocument: PropTypes.object,
  };

  const router = useRouter();
  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUserStore();
  const { t } = useTranslation();

  const NewDocumnetSchema = Yup.object().shape({
    projectName: Yup.string().required(t('Project name is required')),
    documentType: Yup.string().required(t('Document type is required')),
    documentNo: Yup.string().required(t('Document number is required')),
    documentTopic: Yup.string().required(t('Document topic is required')),
    contractDate: Yup.date().required(t('Contract date is required')),
    revisionNumber: Yup.number().required(t('Revision number is required')),
    status: Yup.string().required(t('Status is required')),
    approvalStatus: Yup.string().required(t('Approval status is required')),
    description: Yup.string().required(t('Description is required')),
    files: Yup.array().min(1, t('Files is required')),
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
      formData.append('createdBy', user.email);
      if (data.files.length > 0) {
        formData.append('documentFile', data.files[0]);
      } else {
        enqueueSnackbar(t('Please add a file'), { variant: 'error' });
        return;
      }
      await postDocumentWithFile(formData);
      enqueueSnackbar(t('Document created successfully!'));
      reset();
      router.push(paths.dashboard.design.documents.root);
    } catch (error) {
      enqueueSnackbar(error?.message || t('An error occurred'), { variant: 'error' });
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
                  label={t('Project Name')}
                  InputLabelProps={{ shrink: true }}
                >
                  <option value="">{t('Select a project')}</option>
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
                  label={t('Document Type')}
                  InputLabelProps={{ shrink: true }}
                >
                  <option value="">{t('Select document type')}</option>
                  {DESING_CATEGORY_GROUP_OPTIONS.map((category) =>
                    category.classify.map((classify) => (
                      <option key={classify} value={classify}>
                        {t(classify)}
                      </option>
                    ))
                  )}
                </RHFSelect>
                <RHFTextField name="documentNo" label={t('Document number')} />
                <RHFTextField name="documentTopic" label={t('Document Topic')} />
                <Controller
                  name="contractDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label={t('Due Date')}
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
                <RHFTextField name="revisionNumber" label={t('Revision number')} />
                <RHFSelect
                  native
                  name="status"
                  label={t('Status')}
                  InputLabelProps={{ shrink: true }}
                >
                  <option value="">{t('Select status')}</option>
                  {DOCUMENT_STATUS_OPTIONS.map((category) =>
                    category.classify.map((classify) => (
                      <option key={classify} value={classify}>
                        {t(classify)}
                      </option>
                    ))
                  )}
                </RHFSelect>
                <RHFSelect
                  native
                  name="approvalStatus"
                  label={t('Approval Status')}
                  InputLabelProps={{ shrink: true }}
                >
                  <option value="">{t('Select approval status')}</option>
                  {DOCUMENT_APPROVAL_STATUS_OPTIONS.map((category) =>
                    category.classify.map((classify) => (
                      <option key={classify} value={classify}>
                        {t(classify)}
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
                <Typography variant="subtitle2">{t('Description')}</Typography>
                <RHFEditor simple name="description" />
              </Stack>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">{t('Files')}</Typography>
                <RHFUpload
                  multiple
                  thumbnail
                  name="files"
                  maxSize={3145728}
                  onDrop={handleDrop}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  onUpload={() => {}}
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
        <Button color="inherit" onClick={() => router.push(paths.dashboard.design.documents.root)}>
          {t('Cancel')}
        </Button>
        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentDocument ? t('Create Document') : t('Save Changes')}
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
