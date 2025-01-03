import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
    const isAuth = useSelector((state) => state.user.isAuth);
    
    return isAuth ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;