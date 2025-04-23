import React, { use } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const user = useSelector(state => state.user.user);
    console.log(user);


    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;
