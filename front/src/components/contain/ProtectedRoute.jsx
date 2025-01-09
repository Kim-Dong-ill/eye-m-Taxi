import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authUser } from "../../store/thunkFunctions";
import { useEffect } from "react";

const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAuth = useSelector((state) => state.user.isAuth);

  useEffect(() => {
    dispatch(authUser());
  }, [dispatch]);

  return isAuth ? (
    <Outlet />
) : (
    <Navigate 
        to="/login" 
        state={{ from: location }} // 이전 페이지 정보 저장
        replace 
    />
);
};

export default ProtectedRoute;
