import PropTypes from 'prop-types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useTranslation } from 'react-i18next';

export default function DocumentsTableToolbar({
  filters,
  onFilters,
  projectOptions = [],
  typeOptions = [],
  statusOptions = [],
}) {
  const { t } = useTranslation();
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
      <FormControl sx={{ minWidth: 140 }}>
        <InputLabel>{t('Project')}</InputLabel>
        <Select
          value={filters.project || ''}
          onChange={(e) => onFilters('project', e.target.value)}
          input={<OutlinedInput label={t('Project')} />}
        >
          {projectOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 140 }}>
        <InputLabel>{t('Type')}</InputLabel>
        <Select
          value={filters.type || ''}
          onChange={(e) => onFilters('type', e.target.value)}
          input={<OutlinedInput label={t('Type')} />}
        >
          {typeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 140 }}>
        <InputLabel>{t('Status')}</InputLabel>
        <Select
          value={filters.status || 'all'}
          onChange={(e) => onFilters('status', e.target.value)}
          input={<OutlinedInput label={t('Status')} />}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <DatePicker
        label={t('Start Date')}
        value={filters.dateRange?.[0] || null}
        onChange={(date) => onFilters('dateRange', [date, filters.dateRange?.[1] || null])}
        slotProps={{ textField: { size: 'small', sx: { minWidth: 140 } } }}
      />
      <DatePicker
        label={t('End Date')}
        value={filters.dateRange?.[1] || null}
        onChange={(date) => onFilters('dateRange', [filters.dateRange?.[0] || null, date])}
        slotProps={{ textField: { size: 'small', sx: { minWidth: 140 } } }}
      />
    </Stack>
  );
}

DocumentsTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  projectOptions: PropTypes.array,
  typeOptions: PropTypes.array,
  statusOptions: PropTypes.array,
};
