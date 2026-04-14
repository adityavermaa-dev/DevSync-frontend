import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constants/commonData';

const VerifyEmailHandler = () => {
  const navigate = useNavigate();
  const { token: routeToken } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      const queryToken = searchParams.get('token');
      const token = routeToken || queryToken;

      if (!token) {
        navigate('/verification-failed', { replace: true });
        return;
      }

      const candidates = [
        `${BASE_URL}/verify-email/${token}`,
        `${BASE_URL}/auth/verify-email/${token}`,
        `${BASE_URL}/verification/${token}`,
      ];

      let verified = false;
      for (const url of candidates) {
        try {
          await axios.get(url, { withCredentials: true });
          verified = true;
          break;
        } catch {
          // Try the next known backend path.
        }
      }

      if (!isMounted) return;

      if (verified) {
        toast.success('Email verified successfully.');
        navigate('/email-verified', { replace: true });
      } else {
        navigate('/verification-failed', { replace: true });
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [navigate, routeToken, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p style={{ color: 'var(--dashboard-text-main)', fontWeight: 600 }}>
          Verifying your email...
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailHandler;
