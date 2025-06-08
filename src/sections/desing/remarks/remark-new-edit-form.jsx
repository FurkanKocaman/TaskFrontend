import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { postRemark } from 'src/api/revision';
import { useUserStore } from 'src/store/user-store';

// ----------------------------------------------------------------------

const ROLE_OPTIONS = ['Owner', 'Design', 'Class', 'Flag'];

// ----------------------------------------------------------------------

export default function RemarkNewEditForm({ currentRevision }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useUserStore();

  const NewRemarkSchema = Yup.object().shape({
    role: Yup.string()
      .required('Role is required')
      .oneOf(ROLE_OPTIONS, 'Please select a valid role'),
    text: Yup.string()
      .required('Comment text is required')
      .min(3, 'Comment must be at least 3 characters'),
  });

  const defaultValues = useMemo(
    () => ({
      role: '',
      text: '',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(NewRemarkSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const remarkData = {
        revisionId: currentRevision._id,
        role: data.role,
        text: data.text,
        createdBy: user.email, // This should be replaced with actual logged-in user
      };

      const res = await postRemark(remarkData.revisionId, remarkData);

      if (res) {
        enqueueSnackbar('Remark added successfully!');
        reset();
        router.push(paths.dashboard.design.documents.details(currentRevision.documentId));
      }
    } catch (error) {
      console.error('Submit error:', error);
      enqueueSnackbar(error?.message || 'Something went wrong', { variant: 'error' });
    }
  });

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
            <Typography variant="h6">Add New Remark</Typography>
          </Box>
        </Box>

        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Role</Typography>
            <RHFSelect name="role" label="Select Role">
              {ROLE_OPTIONS.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </RHFSelect>
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Comment</Typography>
            <RHFTextField
              name="text"
              label="Enter your comment"
              multiline
              rows={4}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              color="inherit"
              onClick={() =>
                router.push(paths.dashboard.design.documents.details(currentRevision.documentId))
              }
            >
              Cancel
            </Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Add Remark
            </LoadingButton>
          </Stack>
        </Stack>
      </Card>
    </FormProvider>
  );
}

RemarkNewEditForm.propTypes = {
  currentRevision: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    documentId: PropTypes.string.isRequired,
  }).isRequired,
};
