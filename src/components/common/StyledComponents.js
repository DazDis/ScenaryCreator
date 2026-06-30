import { Box, List } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledListContainer = styled(Box)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
}));

export const StyledList = styled(List)(({ theme }) => ({
    overflowY: 'auto',
    flex: 1,
    '& .MuiListItemButton-root': {
        borderRadius: theme.spacing(0.5),
        marginBottom: theme.spacing(0.5),
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    },
}));