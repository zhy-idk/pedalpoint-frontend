import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Shield,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useUsers, type User } from "../../hooks/useUsers";

function StaffUserManagement() {
  const { users, loading, error, refresh, updateUser, deleteUser } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    isStaff: false,
    isActive: true,
  });

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const formatLastLogin = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const toggleStaffStatus = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const success = await updateUser(userId, { is_staff: !user.is_staff });
    if (success) {
      // The users list will be refreshed automatically by the hook
    }
  };

  const toggleActiveStatus = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const success = await updateUser(userId, { is_active: !user.is_active });
    if (success) {
      // The users list will be refreshed automatically by the hook
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    const dialog = document.getElementById(
      "edit_user_modal",
    ) as HTMLDialogElement;
    dialog?.showModal();
  };

  const openCreateModal = () => {
    setNewUser({
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      isStaff: false,
      isActive: true,
    });
    setShowCreateModal(true);
    const dialog = document.getElementById(
      "create_user_modal",
    ) as HTMLDialogElement;
    dialog?.showModal();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (
      newUser.email &&
      newUser.firstName &&
      newUser.lastName &&
      newUser.password
    ) {
      const newId = Math.max(...users.map((u) => u.id)) + 1;
      const user: User = {
        id: newId,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isStaff: newUser.isStaff,
        isActive: newUser.isActive,
        dateJoined: new Date().toISOString().split("T")[0],
        lastLogin: null,
      };

      setUsers([...users, user]);
      setShowCreateModal(false);
      const dialog = document.getElementById(
        "create_user_modal",
      ) as HTMLDialogElement;
      dialog?.close();
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? { ...selectedUser } : user,
        ),
      );
      const dialog = document.getElementById(
        "edit_user_modal",
      ) as HTMLDialogElement;
      dialog?.close();
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const success = await deleteUser(userId);
      if (success) {
        // The users list will be refreshed automatically by the hook
      }
    }
  };

  return (
    <div className="bg-base-100 p-3">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-base-content/70">
            Manage users and staff permissions
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary gap-2">
          <Plus className="h-4 w-4" />
          Create Account
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error mb-6">
          <AlertCircle className="h-4 w-4" />
          <div>
            <div className="font-bold">Error</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading users...</span>
        </div>
      )}

      {/* Search and Filters */}
      {!loading && (
        <div className="mb-4 flex items-center gap-4">
          <label className="input input-bordered flex w-full max-w-md items-center gap-2">
            <Search className="h-4 w-4 opacity-50" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="grow"
            />
          </label>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Users</div>
              <div className="stat-value text-primary">{users.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Staff Members</div>
              <div className="stat-value text-secondary">
                {users.filter((u) => u.is_staff).length}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Active Users</div>
              <div className="stat-value text-accent">
                {users.filter((u) => u.is_active).length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="table-zebra table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Staff</th>
                <th>Active</th>
                <th>Date Joined</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
              <tr key={user.id} className="hover">
                <th>{user.id}</th>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content w-8 rounded-full">
                        <span className="text-xs">
                          {user.first_name?.charAt(0) || user.username.charAt(0)}
                          {user.last_name?.charAt(0) || ''}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">
                        {user.full_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 opacity-50" />
                    {user.email}
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => toggleStaffStatus(user.id)}
                    className={`btn btn-sm gap-2 ${
                      user.is_staff ? "btn-success" : "btn-ghost"
                    }`}
                  >
                    {user.is_staff ? (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Staff
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        User
                      </>
                    )}
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => toggleActiveStatus(user.id)}
                    className={`btn btn-sm gap-2 ${
                      user.is_active ? "btn-success" : "btn-error"
                    }`}
                  >
                    {user.is_active ? (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Active
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4" />
                        Inactive
                      </>
                    )}
                  </button>
                </td>
                <td>{formatDate(user.date_joined)}</td>
                <td>
                  <span
                    className={
                      user.last_login
                        ? "text-base-content"
                        : "text-base-content/50"
                    }
                  >
                    {formatLastLogin(user.last_login)}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(user)}
                      className="btn btn-ghost btn-sm"
                      title="Edit user"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="btn btn-ghost btn-sm text-error"
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-base-content/50">
              No users found matching your search.
            </p>
          </div>
        )}
      </div>
      )}

      {/* Create User Modal */}
      <dialog id="create_user_modal" className="modal">
        <div className="modal-box">
          <h3 className="mb-4 text-lg font-bold">Create New Account</h3>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">First Name</span>
                </label>
                <input
                  type="text"
                  placeholder="First Name"
                  className="input input-bordered"
                  value={newUser.firstName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Last Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Last Name"
                  className="input input-bordered"
                  value={newUser.lastName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                className="input input-bordered"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  className="input input-bordered"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="input input-bordered"
                  value={newUser.confirmPassword}
                  onChange={(e) =>
                    setNewUser({ ...newUser, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Staff Member</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={newUser.isStaff}
                  onChange={(e) =>
                    setNewUser({ ...newUser, isStaff: e.target.checked })
                  }
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Active Account</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={newUser.isActive}
                  onChange={(e) =>
                    setNewUser({ ...newUser, isActive: e.target.checked })
                  }
                />
              </label>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  const dialog = document.getElementById(
                    "create_user_modal",
                  ) as HTMLDialogElement;
                  dialog?.close();
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Account
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Edit User Modal */}
      <dialog id="edit_user_modal" className="modal">
        <div className="modal-box">
          <h3 className="mb-4 text-lg font-bold">Edit User</h3>

          {selectedUser && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">First Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="First Name"
                    className="input input-bordered"
                    value={selectedUser.firstName}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        firstName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Last Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="input input-bordered"
                    value={selectedUser.lastName}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        lastName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="input input-bordered"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Staff Member</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={selectedUser.isStaff}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        isStaff: e.target.checked,
                      })
                    }
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Active Account</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={selectedUser.isActive}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        isActive: e.target.checked,
                      })
                    }
                  />
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    const dialog = document.getElementById(
                      "edit_user_modal",
                    ) as HTMLDialogElement;
                    dialog?.close();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </div>
  );
}

export default StaffUserManagement;
