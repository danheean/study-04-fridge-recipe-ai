import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, Image, Shield, ChefHat, ArrowLeft,
  Trash2, UserCog, AlertCircle
} from 'lucide-react';
import { getAllUsers, getAdminStats, deleteUser, toggleAdminRole } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { CenteredSpinner } from '../components/LoadingSpinner';

export default function AdminPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const { user, isAdmin, isAuthenticated } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const USERS_PER_PAGE = 20;

  // 권한 체크
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      navigate('/');
      return;
    }

    if (!isAdmin) {
      toast.error('관리자 권한이 필요합니다.');
      navigate('/');
      return;
    }
  }, [isAuthenticated, isAdmin, navigate, toast]);

  // 데이터 로드
  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        getAdminStats(user.id),
        getAllUsers(user.id, 0, USERS_PER_PAGE)
      ]);

      setStats(statsData);
      setUsers(usersData.users || []);
      setTotalUsers(usersData.total || 0);
      setHasMore(usersData.has_more || false);
      setPage(1);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error(error.userMessage || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreUsers = async () => {
    try {
      const skip = page * USERS_PER_PAGE;
      const usersData = await getAllUsers(user.id, skip, USERS_PER_PAGE);

      setUsers(prev => [...prev, ...(usersData.users || [])]);
      setHasMore(usersData.has_more || false);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load more users:', error);
      toast.error('사용자 목록을 더 불러오는데 실패했습니다.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmed = await confirm({
      title: '사용자 삭제',
      message: `정말로 "${userName}" 사용자를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.`,
      confirmLabel: '삭제',
      cancelLabel: '취소',
      confirmVariant: 'danger',
    });

    if (!confirmed) return;

    try {
      await deleteUser(user.id, userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setTotalUsers(prev => prev - 1);
      toast.success('사용자가 삭제되었습니다.');

      // 통계 새로고침
      const statsData = await getAdminStats(user.id);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(error.userMessage || '사용자 삭제에 실패했습니다.');
    }
  };

  const handleToggleAdmin = async (userId, userName, currentIsAdmin) => {
    const action = currentIsAdmin ? '해제' : '부여';
    const confirmed = await confirm({
      title: `관리자 권한 ${action}`,
      message: `"${userName}" 사용자의 관리자 권한을 ${action}하시겠습니까?`,
      confirmLabel: action,
      cancelLabel: '취소',
    });

    if (!confirmed) return;

    try {
      await toggleAdminRole(user.id, userId, !currentIsAdmin);
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, is_admin: !currentIsAdmin } : u
      ));
      toast.success(`관리자 권한이 ${action}되었습니다.`);

      // 통계 새로고침
      const statsData = await getAdminStats(user.id);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to toggle admin role:', error);
      toast.error(error.userMessage || `관리자 권한 ${action}에 실패했습니다.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <CenteredSpinner message="관리자 페이지 로딩 중..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-2 min-h-[44px] active:scale-95"
                aria-label="홈으로 돌아가기"
              >
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-500" aria-hidden="true" />
                <h1 className="text-2xl font-bold text-gray-900">관리자 페이지</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">전체 사용자</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.total_users || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">전체 레시피</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.total_recipes || 0}
                </p>
              </div>
              <ChefHat className="w-12 h-12 text-primary-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">이미지 업로드</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.total_images || 0}
                </p>
              </div>
              <Image className="w-12 h-12 text-secondary-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">관리자 수</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.total_admins || 0}
                </p>
              </div>
              <Shield className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">전체 사용자 목록</h2>
            <p className="text-sm text-gray-600 mt-1">총 {totalUsers}명</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용자 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    권한
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-sm text-gray-500">{u.email || '이메일 없음'}</p>
                        <p className="text-xs text-gray-400 mt-1">ID: {u.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.is_admin ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <Shield className="w-3 h-3 mr-1" />
                          관리자
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          일반 사용자
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleAdmin(u.id, u.name, u.is_admin)}
                          disabled={u.id === user.id}
                          className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          title={u.id === user.id ? '자기 자신의 권한은 변경할 수 없습니다' : u.is_admin ? '관리자 권한 해제' : '관리자 권한 부여'}
                        >
                          <UserCog className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          disabled={u.id === user.id}
                          className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          title={u.id === user.id ? '자기 자신은 삭제할 수 없습니다' : '사용자 삭제'}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 더 보기 버튼 */}
          {hasMore && (
            <div className="p-6 border-t border-gray-200 text-center">
              <button
                onClick={loadMoreUsers}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-h-[48px] active:scale-[0.98]"
              >
                더 보기 ({totalUsers - users.length}명 남음)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
