import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

type Props = {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
    const { token, isValidating } = useAppSelector(state => state.auth);

    if (isValidating) {
        return <div>Loading...</div>;
    }

    if (token === null) {
        return <Navigate to="/login" replace />
    }

    return children;
}