import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SearchIcon from '@mui/icons-material/Search';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    Paper,
    Snackbar,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    addUserToProject,
    archiveProject,
    createTask,
    fetchProjectById,
    updateProject
} from '../../store/slices/projectSlice';
import { CreateTaskRequest, TaskStatus, UpdateProjectRequest } from '../../types/project';
import TaskForm from '../tasks/TaskForm';
import ProjectForm from './ProjectForm';

type SortField = 'title' | 'dueDate' | 'updatedAt';
type SortOrder = 'asc' | 'desc';
type StatusTab = 'ALL' | TaskStatus;

export default function ProjectView() {
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openCreateTaskDialog, setOpenCreateTaskDialog] = useState(false);
    const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [sortField, setSortField] = useState<SortField>('updatedAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<StatusTab>('ALL');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });

    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { projects, isLoading } = useAppSelector((state) => state.projects);
    const project = projects.find(p => p.id === Number(projectId));

    useEffect(() => {
        if (projectId) {
            dispatch(fetchProjectById(Number(projectId)));
        }
    }, [dispatch, projectId]);

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleEditProject = async (data: UpdateProjectRequest) => {
        if (!projectId) return;
        const result = await dispatch(updateProject({ projectId: Number(projectId), data }));
        if (updateProject.fulfilled.match(result)) {
            setOpenEditDialog(false);
            showSnackbar('Project updated successfully!', 'success');
        } else {
            showSnackbar('Failed to update project.', 'error');
        }
    };

    const handleArchiveProject = async () => {
        if (!projectId || !window.confirm('Archive this project? It will become read-only.')) return;
        const result = await dispatch(archiveProject(Number(projectId)));
        if (archiveProject.fulfilled.match(result)) {
            setOpenEditDialog(false);
            showSnackbar('Project archived.', 'success');
        } else {
            showSnackbar('Failed to archive project.', 'error');
        }
    };

    const handleCreateTask = async (data: CreateTaskRequest) => {
        if (!projectId) return;
        const result = await dispatch(createTask({ projectId: Number(projectId), data }));
        if (createTask.fulfilled.match(result)) {
            setOpenCreateTaskDialog(false);
            showSnackbar('Task created successfully!', 'success');
        } else {
            showSnackbar('Failed to create task.', 'error');
        }
    };

    const handleAddUser = async () => {
        if (!projectId || !userEmail.trim()) return;
        const result = await dispatch(addUserToProject({ projectId: Number(projectId), userEmail: userEmail.trim() }));
        if (addUserToProject.fulfilled.match(result)) {
            setOpenAddUserDialog(false);
            setUserEmail('');
            showSnackbar('User added to project!', 'success');
        } else {
            showSnackbar('Failed to add user. Check the email and try again.', 'error');
        }
    };

    const handleSort = (field: SortField) => {
        const isAsc = sortField === field && sortOrder === 'asc';
        setSortOrder(isAsc ? 'desc' : 'asc');
        setSortField(field);
        setPage(0);
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: StatusTab) => {
        setActiveTab(newValue);
        setPage(0);
    };

    const sortLabelSx = {
        '&.MuiTableSortLabel-root': { color: '#616161' },
        '&.MuiTableSortLabel-root:hover': { color: '#424242' },
        '&.Mui-active': { color: '#424242' },
        '& .MuiTableSortLabel-icon': { color: '#424242 !important' },
    };

    const statusLabel: Record<TaskStatus, string> = {
        [TaskStatus.TODO]: 'To Do',
        [TaskStatus.IN_PROGRESS]: 'In Progress',
        [TaskStatus.DONE]: 'Done',
    };

    const filteredTasks = (project?.tasks ?? []).filter(t => {
        const matchesTab = activeTab === 'ALL' || t.status === activeTab;
        const matchesSearch =
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortField === 'title') {
            return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        }
        const aVal = new Date(a[sortField]).getTime();
        const bVal = new Date(b[sortField]).getTime();
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    const paginatedTasks = sortedTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    if (isLoading && !project) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: '#616161' }} />
            </Box>
        );
    }

    if (!project) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Project not found.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4 }}>
            {/* Title row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Typography variant="h4" sx={{ color: '#424242', fontWeight: 500 }}>
                    {project.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<GroupAddIcon />}
                        onClick={() => setOpenAddUserDialog(true)}
                        sx={{ borderColor: '#bdbdbd', color: '#616161', textTransform: 'none', '&:hover': { borderColor: '#757575', bgcolor: 'rgba(0,0,0,0.04)' } }}
                    >
                        Add User
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setOpenEditDialog(true)}
                        sx={{ borderColor: '#bdbdbd', color: '#616161', textTransform: 'none', '&:hover': { borderColor: '#757575', bgcolor: 'rgba(0,0,0,0.04)' } }}
                    >
                        Edit Project
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenCreateTaskDialog(true)}
                        sx={{ bgcolor: '#616161', color: '#fff', textTransform: 'none', '&:hover': { bgcolor: '#424242' } }}
                    >
                        New Task
                    </Button>
                </Box>
            </Box>

            {/* Project info */}
            <Paper elevation={0} sx={{ p: 3, mb: 2, border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                <Typography variant="body1" sx={{ color: '#616161', lineHeight: 1.8, mb: 2 }}>
                    {project.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <Box>
                        <Typography variant="caption" sx={{ color: '#9e9e9e', fontWeight: 600, textTransform: 'uppercase' }}>Due Date</Typography>
                        <Typography variant="body2" sx={{ color: '#424242', mt: 0.5 }}>{new Date(project.dueDate).toLocaleDateString()}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: '#9e9e9e', fontWeight: 600, textTransform: 'uppercase' }}>Updated</Typography>
                        <Typography variant="body2" sx={{ color: '#424242', mt: 0.5 }}>{new Date(project.updatedAt).toLocaleDateString()}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: '#9e9e9e', fontWeight: 600, textTransform: 'uppercase' }}>Created</Typography>
                        <Typography variant="body2" sx={{ color: '#424242', mt: 0.5 }}>{new Date(project.createdAt).toLocaleDateString()}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: '#9e9e9e', fontWeight: 600, textTransform: 'uppercase' }}>Archived</Typography>
                        <Typography variant="body2" sx={{ color: '#424242', mt: 0.5 }}>{project.isArchived ? 'Yes' : 'No'}</Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Task section header */}
            <Typography variant="h5" sx={{ color: '#424242', fontWeight: 500, mb: 2, mt: 3 }}>
                Tasks
            </Typography>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{ mb: 2, borderBottom: '1px solid #e0e0e0', '& .MuiTab-root': { textTransform: 'none', color: '#757575' }, '& .Mui-selected': { color: '#424242 !important' }, '& .MuiTabs-indicator': { backgroundColor: '#616161' } }}
            >
                <Tab label={`All (${project.tasks?.length ?? 0})`} value="ALL" />
                <Tab label={`To Do (${project.tasks?.filter(t => t.status === TaskStatus.TODO).length ?? 0})`} value={TaskStatus.TODO} />
                <Tab label={`In Progress (${project.tasks?.filter(t => t.status === TaskStatus.IN_PROGRESS).length ?? 0})`} value={TaskStatus.IN_PROGRESS} />
                <Tab label={`Done (${project.tasks?.filter(t => t.status === TaskStatus.DONE).length ?? 0})`} value={TaskStatus.DONE} />
            </Tabs>

            {/* Search */}
            <TextField
                placeholder="Search tasks…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                size="small"
                sx={{ mb: 2, width: 320 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#9e9e9e' }} />
                        </InputAdornment>
                    )
                }}
            />

            {/* Task Table */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#fafafa' }}>
                            <TableCell sx={{ color: '#616161', fontWeight: 600 }}>
                                <TableSortLabel active={sortField === 'title'} direction={sortField === 'title' ? sortOrder : 'asc'} onClick={() => handleSort('title')} sx={sortLabelSx}>Title</TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ color: '#616161', fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ color: '#616161', fontWeight: 600 }}>
                                <TableSortLabel active={sortField === 'dueDate'} direction={sortField === 'dueDate' ? sortOrder : 'asc'} onClick={() => handleSort('dueDate')} sx={sortLabelSx}>Due Date</TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ color: '#616161', fontWeight: 600 }}>
                                <TableSortLabel active={sortField === 'updatedAt'} direction={sortField === 'updatedAt' ? sortOrder : 'asc'} onClick={() => handleSort('updatedAt')} sx={sortLabelSx}>Updated At</TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedTasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography sx={{ color: '#757575', py: 3 }}>
                                        {searchQuery ? 'No tasks match your search.' : 'No tasks in this category.'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : paginatedTasks.map((task) => (
                            <TableRow
                                key={task.id}
                                onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
                            >
                                <TableCell sx={{ color: '#424242', fontWeight: 500 }}>{task.title}</TableCell>
                                <TableCell sx={{ color: '#616161' }}>{statusLabel[task.status] ?? task.status}</TableCell>
                                <TableCell sx={{ color: '#616161' }}>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                                <TableCell sx={{ color: '#616161' }}>{new Date(task.updatedAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={filteredTasks.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </TableContainer>

            {/* Edit Project Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <ProjectForm
                    project={project}
                    onSubmit={handleEditProject}
                    onCancel={() => setOpenEditDialog(false)}
                    onArchive={handleArchiveProject}
                />
            </Dialog>

            {/* Create Task Dialog */}
            <Dialog open={openCreateTaskDialog} onClose={() => setOpenCreateTaskDialog(false)} maxWidth="sm" fullWidth>
                <TaskForm onSubmit={handleCreateTask} onCancel={() => setOpenCreateTaskDialog(false)} />
            </Dialog>

            {/* Add User Dialog */}
            <Dialog open={openAddUserDialog} onClose={() => setOpenAddUserDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ color: '#424242' }}>Add User to Project</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        label="User Email"
                        type="email"
                        fullWidth
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddUser(); }}
                        sx={{ mt: 1, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#616161' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#616161' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => { setOpenAddUserDialog(false); setUserEmail(''); }} sx={{ color: '#757575' }}>Cancel</Button>
                    <Button
                        onClick={handleAddUser}
                        variant="contained"
                        disabled={!userEmail.trim()}
                        sx={{ bgcolor: '#616161', '&:hover': { bgcolor: '#424242' } }}
                    >
                        Add
                    </Button>
                </DialogActions>
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
