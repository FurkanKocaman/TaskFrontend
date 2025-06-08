import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { postRevision, putRevision } from 'src/api/document';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFUpload, RHFTextField } from 'src/components/hook-form';
import { useUserStore } from 'src/store/user-store';

export default function RevisionNewEditForm({ currentDocument, currentRevision, isEdit }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUserStore();

  const NewRevisionSchema = Yup.object().shape({
    notes: Yup.string().min(1, 'Notes is required').required('Notes is required'),
    files: Yup.mixed().required('File is required'),
  });

  const defaultValues = useMemo(
    () => ({
      notes: isEdit && currentRevision ? currentRevision.notes || '' : '',
      files: null,
    }),
    [isEdit, currentRevision]
  );

  const methods = useForm({
    resolver: yupResolver(NewRevisionSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();
      formData.append('uploadedBy', user.email);
      formData.append('notes', data.notes || '');
      if (data.files && data.files.length > 0) {
        formData.append('documentFile', data.files[0]);
      }
      if (isEdit && currentRevision) {
        await putRevision(currentRevision._id, formData);
        enqueueSnackbar('Revision updated successfully! (Backend entegrasyonu eklenmeli)', {
          variant: 'success',
        });
      } else {
        await postRevision(currentDocument._id, formData);
        enqueueSnackbar('Revision created successfully!');
        reset();
      }
      router.push(paths.dashboard.design.documents.details(currentDocument._id));
    } catch (error) {
      console.error('Submit error:', error);
      enqueueSnackbar(error?.message || 'Something went wrong', { variant: 'error' });
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

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Card>
        <Box
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
          sx={{ p: 3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6">{isEdit ? 'Edit Revision' : 'Add New Revision'}</Typography>
          </Box>
        </Box>
        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Notes</Typography>
            <RHFTextField name="notes" multiline rows={3} InputLabelProps={{ shrink: true }} />
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
              helperText="Allowed files: PDF, Word, Excel, Images (max 100MB)"
            />
          </Stack>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              color="inherit"
              onClick={() =>
                router.push(paths.dashboard.design.documents.details(currentDocument._id))
              }
            >
              Cancel
            </Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {isEdit ? 'Update Revision' : 'Add Revision'}
            </LoadingButton>
          </Stack>
        </Stack>
      </Card>
    </FormProvider>
  );
}

RevisionNewEditForm.propTypes = {
  currentDocument: PropTypes.shape({
    _id: PropTypes.string,
  }).isRequired,
  currentRevision: PropTypes.object,
  isEdit: PropTypes.bool,
};
