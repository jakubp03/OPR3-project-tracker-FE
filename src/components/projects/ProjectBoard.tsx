import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    InputAdornment,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    TextField,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createProject, fetchAllProjects } from '../../store/slices/projectSlice';
import { CreateProjectRequest } from '../../types/project';
import ProjectForm from './ProjectForm';

type SortField = 'title' | 'dueDate' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export default function ProjectBoard() {
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [sortField, setSortField] = useState<SortField>('updatedAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { projects, isLoading } = useAppSelector((state) => state.projects);

    useEffect(() => {
        dispatch(fetchAllProjects());
    }, [dispatch]);

    const handleCreateProject = async (data: CreateProjectRequest) => {
        const result = await dispatch(createProject(data));
        if (createProject.fulfilled.match(result)) {
            setOpenCreateDialog(false);
            setSnackbar({ open: true, message: 'Project created successfully!', severity: 'success' });
        } else {
            setSnackbar({ open: true, message: 'Failed to create project.', severity: 'error' });
        }
    };

    const handleSort = (field: SortField) => {
        const isAsc = sortField === field && sortOrder === 'asc';
        setSortOrder(isAsc ? 'desc' : 'asc');
        setSortField(field);
        setPage(0);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(0);
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (sortField === 'title') {
            return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        }
        const aVal = new Date(a[sortField]).getTime();
        const bVal = new Date(b[sortField]).getTime();
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    const paginatedProjects = sortedProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const sortLabelSx = {
        '&.MuiTableSortLabel-root': { color: '#616161' },
        '&.MuiTableSortLabel-root:hover': { color: '#424242' },
        '&.Mui-active': { color: '#424242' },
        '& .MuiTableSortLabel-icon': { color: '#424242 !important' },
    };

    return (
        <Box sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ color: '#424242', fontWeight: 500 }}>
                    Projects
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCreateDialog(true)}
                    sx={{ bgcolor: '#616161', color: '#fff', '&:hover': { bgcolor: '#424242' }, textTransform: 'none', px: 3 }}
                >
                    New Project
                </Button>
            </Box>

            {/* Search */}
            <TextField
                placeholder="Search by title or description…"
                value={searchQuery}
                onChange={handleSearchChange}
                size="small"
                sx={{ mb: 2, width: 340 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#9e9e9e' }} />
                        </InputAdornment>
                    )
                }}
            />

            {/* Table */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#fafafa' }}>
                            <TableCell sx={{ color: '#616161', fontWeight: 600 }}>
                                <TableSortLabel
                                    active={sortField === 'title'}
                                    direction={sortField === 'title' ? sortOrder : 'asc'}
                                    onClick={() => handleSort('title')}
                                    sx={sortLabelSx}
                                >
                                    Title
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ color: '#616161', fontWeight: 600 }}>Done / Total</TableCell>
                            <TableCell sx={{ color: '#616161', fontWeight: 600 }}>
                                <TableSortLabel
                                    active={sortField === 'dueDate'}
                                    direction={sortField === 'dueDate' ? sortOrder : 'asc'}
                                    onClick={() => handleSort('dueDate')}
                                    sx={sortLabelSx}
                                >
                                    Due Date
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ color: '#616161', fontWeight: 600 }}>
                                <TableSortLabel
                                    active={sortField === 'updatedAt'}
                                    direction={sortField === 'updatedAt' ? sortOrder : 'asc'}
                                    onClick={() => handleSort('updatedAt')}
                                    sx={sortLabelSx}
                                >
                                    Updated At
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ color: '#616161', fontWeight: 600 }}>Archived</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <CircularProgress sx={{ color: '#616161' }} />
                                </TableCell>
                            </TableRow>
                        ) : paginatedProjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography sx={{ color: '#757575', py: 4 }}>
                                        {searchQuery ? 'No projects match your search.' : 'No projects yet. Create your first project!'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : paginatedProjects.map((project) => {
                            const doneTasks = project.tasks?.filter(t => t.status === 'DONE').length ?? 0;
                            const totalTasks = project.tasks?.length ?? 0;
                            return (
                                <TableRow
                                    key={project.id}
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
                                >
                                    <TableCell sx={{ color: '#424242', fontWeight: 500 }}>{project.title}</TableCell>
                                    <TableCell sx={{ color: '#616161' }}>{doneTasks} / {totalTasks}</TableCell>
                                    <TableCell sx={{ color: '#616161' }}>{new Date(project.dueDate).toLocaleDateString()}</TableCell>
                                    <TableCell sx={{ color: '#616161' }}>{new Date(project.updatedAt).toLocaleDateString()}</TableCell>
                                    <TableCell sx={{ color: '#616161' }}>{project.isArchived ? 'Yes' : 'No'}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={filteredProjects.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </TableContainer>

            {/* Create Project Dialog */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
                <ProjectForm onSubmit={handleCreateProject} onCancel={() => setOpenCreateDialog(false)} />
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
