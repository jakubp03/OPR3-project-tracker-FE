import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { CreateProjectRequest, Project, UpdateProjectRequest } from '../../types/project';

interface ProjectFormProps {
    project?: Project;
    onSubmit: (data: CreateProjectRequest | UpdateProjectRequest) => void;
    onCancel: () => void;
    onArchive?: () => void;
}

type FormValues = {
    title: string;
    description: string;
    dueDate: Dayjs | null;
};

export default function ProjectForm({ project, onSubmit, onCancel, onArchive }: ProjectFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm<FormValues>({
        defaultValues: {
            title: project?.title || '',
            description: project?.description || '',
            dueDate: project?.dueDate ? dayjs(project.dueDate) : null
        }
    });

    const onFormSubmit = (data: FormValues) => {
        onSubmit({
            title: data.title,
            description: data.description,
            dueDate: data.dueDate ? data.dueDate.toISOString() : ''
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
            <DialogTitle sx={{ color: '#424242' }}>
                {project ? 'Edit Project' : 'Create New Project'}
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField
                        label="Title"
                        fullWidth
                        {...register('title', {
                            required: 'Title is required',
                            minLength: { value: 3, message: 'Title must be at least 3 characters' }
                        })}
                        error={!!errors.title}
                        helperText={errors.title?.message}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: '#616161'
                                }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#616161'
                            }
                        }}
                    />

                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        {...register('description', {
                            required: 'Description is required',
                            minLength: { value: 10, message: 'Description must be at least 10 characters' }
                        })}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: '#616161'
                                }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#616161'
                            }
                        }}
                    />

                    <Controller
                        name="dueDate"
                        control={control}
                        rules={{ required: 'Due date is required', validate: v => (v && v.isValid()) || 'Invalid date' }}
                        render={({ field }) => (
                            <DatePicker
                                label="Due Date"
                                value={field.value}
                                onChange={field.onChange}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!errors.dueDate,
                                        helperText: errors.dueDate?.message,
                                        sx: {
                                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#616161' } },
                                            '& .MuiInputLabel-root.Mui-focused': { color: '#616161' }
                                        }
                                    }
                                }}
                            />
                        )}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                {project && onArchive && !project.isArchived && (
                    <Button
                        onClick={onArchive}
                        sx={{
                            color: '#d32f2f',
                            borderColor: '#d32f2f',
                            mr: 'auto',
                            '&:hover': {
                                bgcolor: 'rgba(211, 47, 47, 0.04)',
                                borderColor: '#b71c1c'
                            }
                        }}
                        variant="outlined"
                    >
                        Archive Project
                    </Button>
                )}
                <Button
                    onClick={onCancel}
                    sx={{
                        color: '#757575',
                        '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.05)'
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    sx={{
                        bgcolor: '#616161',
                        '&:hover': {
                            bgcolor: '#424242'
                        }
                    }}
                >
                    {project ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Box>
    );
}
