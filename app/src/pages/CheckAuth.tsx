import { useEffect } from "react";
import { useIdToken } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../libs/firebase";

interface CheckAuthProps {
  children: React.ReactNode;
}

const CheckAuth = ({ children }: CheckAuthProps) => {
  const [user, loading, error] = useIdToken(auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, error, navigate]);

  return <>{children}</>;
};

export default CheckAuth;
