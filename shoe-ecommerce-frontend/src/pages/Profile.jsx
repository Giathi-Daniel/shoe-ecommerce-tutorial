import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleDeleteAccount = () => {
    if (deleteInput !== 'delete me') {
      toast.error('Please type "delete me" to confirm account deletion.');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmDeleteAccount = async () => {
    setShowConfirmModal(false);
    setIsDeleting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete account');
      }

      toast.success('Your account has been deleted.');
      setDeleteInput('')
      logout();
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-md p-8 mx-auto mt-20 bg-white rounded shadow">
      <h2 className="mb-6 text-2xl font-bold text-center">Your Profile</h2>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Name</label>
        <input
          type="text"
          value={user.name}
          readOnly
          className="w-full p-2 bg-gray-100 border rounded cursor-not-allowed"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Email</label>
        <input
          type="email"
          value={user.email}
          readOnly
          className="w-full p-2 bg-gray-100 border rounded cursor-not-allowed"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-1 font-semibold">Password</label>
        <input
          type="password"
          value="********"
          readOnly
          className="w-full p-2 bg-gray-100 border rounded cursor-not-allowed"
        />
      </div>

      <hr className="mb-6" />

      <div className="mb-4">
        <label htmlFor="deleteInput" className="block mb-1 font-semibold text-red-600">
          Type "delete me" to confirm account deletion
        </label>
        <input
          id="deleteInput"
          type="text"
          value={deleteInput}
          onChange={(e) => setDeleteInput(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder='Type "delete me"'
        />
      </div>

      <button
        disabled={isDeleting}
        onClick={handleDeleteAccount}
        className="w-full px-4 py-2 font-semibold text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
      >
        {isDeleting ? 'Deleting...' : 'Delete Account'}
      </button>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm p-6 bg-white rounded shadow-lg">
            <p className="mb-4 font-semibold text-center text-gray-800">
              Deleting your account is irreversible. Are you sure?
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setDeleteInput('');
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteAccount}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}