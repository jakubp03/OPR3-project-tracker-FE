import { Alert, Box, Button, CircularProgress, Dialog, Paper, Snackbar, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteTask, fetchProjectById, updateTask } from '../../store/slices/projectSlice';
import { CreateTaskRequest, TaskStatus, UpdateTaskRequest } from '../../types/project';
import TaskForm from './TaskForm';

export default function TaskView() {
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });
    const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { projects, isLoading } = useAppSelector((state) => state.projects);
    const project = projects.find(p => p.id === Number(projectId));
    const task = project?.tasks.find(t => t.id === Number(taskId));

    useEffect(() => {
        if (projectId && !project) {
            dispatch(fetchProjectById(Number(projectId)));
        }
    }, [dispatch, projectId, project]);

    const handleEditTask = async (data: CreateTaskRequest | UpdateTaskRequest) => {
        if (projectId && taskId) {
            const updateData: UpdateTaskRequest = {
                title: data.title,
                description: data.description,
                status: data.status || task?.status || TaskStatus.TODO,
                dueDate: data.dueDate
            };
            const result = await dispatch(updateTask({
                projectId: Number(projectId),
                taskId: Number(taskId),
                data: updateData
            }));
            if (updateTask.fulfilled.match(result)) {
                setOpenEditDialog(false);
                setSnackbar({ open: true, message: 'Task updated successfully!', severity: 'success' });
            } else {
                setSnackbar({ open: true, message: 'Failed to update task.', severity: 'error' });
            }
        }
    };

    const handleDeleteTask = async () => {
        if (projectId && taskId && window.confirm('Delete this task? This cannot be undone.')) {
            const result = await dispatch(deleteTask({ projectId: Number(projectId), taskId: Number(taskId) }));
            if (deleteTask.fulfilled.match(result)) {
                navigate(`/projects/${projectId}`);
            } else {
                setSnackbar({ open: true, message: 'Failed to delete task.', severity: 'error' });
            }
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: '#616161' }} />
            </Box>
        );
    }

    if (!task) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Task not found</Typography>
                <Button onClick={() => navigate(`/projects/${projectId}`)} sx={{ mt: 2 }}>
                    Back to Project
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                    <Button
                        onClick={() => navigate(`/projects/${projectId}`)}
                        sx={{ color: '#757575', textTransform: 'none', mb: 1, pl: 0 }}
                    >
                        ← Back to Project
                    </Button>
                    <Typography variant="h4" sx={{ color: '#424242', fontWeight: 500 }}>
                        {task.title}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={() => setOpenEditDialog(true)}
                    sx={{ bgcolor: '#616161', color: '#fff', '&:hover': { bgcolor: '#424242' }, textTransform: 'none', px: 3 }}
                >
                    Edit Task
                </Button>
            </Box>

            {/* Description Box */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    border: '1px solid #e0e0e0',
                    minHeight: 100,
                    bgcolor: '#fff'
                }}
            >
                <Typography variant="body1" sx={{ color: '#616161', lineHeight: 1.8 }}>
                    {task.description}
                </Typography>
            </Paper>

            {/* Metadata */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    gap: 4
                }}
            >
                <Box>
                    <Typography variant="caption" sx={{ color: '#757575', fontWeight: 600, textTransform: 'uppercase' }}>
                        Status
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#424242', mt: 0.5 }}>
                        {task.status === TaskStatus.TODO ? 'To Do' : task.status === TaskStatus.IN_PROGRESS ? 'In Progress' : 'Done'}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="caption" sx={{ color: '#757575', fontWeight: 600, textTransform: 'uppercase' }}>
                        Due Date
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#424242', mt: 0.5 }}>
                        {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="caption" sx={{ color: '#757575', fontWeight: 600, textTransform: 'uppercase' }}>
                        Updated At
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#424242', mt: 0.5 }}>
                        {new Date(task.updatedAt).toLocaleDateString()}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="caption" sx={{ color: '#757575', fontWeight: 600, textTransform: 'uppercase' }}>
                        Created At
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#424242', mt: 0.5 }}>
                        {new Date(task.createdAt).toLocaleDateString()}
                    </Typography>
                </Box>
            </Paper>

            {/* Edit Task Dialog */}
            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <TaskForm
                    task={task}
                    onSubmit={handleEditTask}
                    onCancel={() => setOpenEditDialog(false)}
                    onDelete={handleDeleteTask}
                />
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
