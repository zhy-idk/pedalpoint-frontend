import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  User,
  Edit,
  Camera,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: user?.username || "user",
    email: user?.email || "",
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    phone: user?.primaryUserInfo?.contact_number || "",
    address: user?.primaryUserInfo?.address || "",
    profilePicture:
      user?.primaryUserInfo?.image ||
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  });

  const [editInfo, setEditInfo] = useState(userInfo);

  // Update userInfo when auth user data changes
  useEffect(() => {
    if (user) {
      const updatedUserInfo = {
        username: user.username || "user",
        email: user.email || "",
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        phone: user.primaryUserInfo?.contact_number || "",
        address: user.primaryUserInfo?.address || "",
        profilePicture:
          user.primaryUserInfo?.image ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      };
      setUserInfo(updatedUserInfo);
      setEditInfo(updatedUserInfo);
    }
  }, [user]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-base-200 flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="mb-4 text-xl sm:text-2xl font-bold text-gray-800">
            Please log in to view your profile
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            You need to be logged in to access this page.
          </p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    setUserInfo(editInfo);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditInfo(userInfo);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bg-base-200 min-h-screen p-2 sm:p-4">
      <div className="mx-auto max-w-6xl">
        {/* Main Profile Card */}
        <div className="card bg-base-100 shadow-xl">
          {/* Profile Header with Avatar */}
          <div className="card-body p-3 sm:p-4 md:p-6">
            <h1 className="text-base-content text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              User Profile
            </h1>
            <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row">
              {/* Avatar Section */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="avatar relative">
                  <div className="ring-primary ring-offset-base-100 w-24 sm:w-28 md:w-32 rounded-full ring ring-offset-2">
                    <img src={userInfo.profilePicture} alt="Profile" />
                  </div>
                  <button className="btn btn-circle btn-primary btn-xs sm:btn-sm absolute right-0 bottom-0">
                    <Camera size={14} className="sm:hidden" />
                    <Camera size={16} className="hidden sm:block" />
                  </button>
                </div>
                <div className="mt-3 sm:mt-4 text-center lg:text-left w-full">
                  <div className="mb-2 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 justify-center lg:justify-start">
                    <UserCheck className="text-primary hidden sm:block" size={20} />
                    <UserCheck className="text-primary sm:hidden" size={16} />
                    <h2 className="text-base-content text-lg sm:text-xl md:text-2xl font-bold">
                      {isEditing ? (
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                          <input
                            type="text"
                            placeholder="First Name"
                            value={editInfo.firstName}
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            className="input input-bordered input-xs sm:input-sm text-sm sm:text-base md:text-lg font-bold w-full sm:w-auto"
                          />
                          <input
                            type="text"
                            placeholder="Last Name"
                            value={editInfo.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            className="input input-bordered input-xs sm:input-sm text-sm sm:text-base md:text-lg font-bold w-full sm:w-auto"
                          />
                        </div>
                      ) : (
                        <span className="text-base sm:text-lg md:text-xl lg:text-2xl">
                          {userInfo.firstName && userInfo.lastName
                            ? `${userInfo.firstName} ${userInfo.lastName}`
                            : userInfo.firstName ||
                              userInfo.lastName ||
                              "Complete Your Profile"}
                        </span>
                      )}
                    </h2>
                  </div>

                  {/* Username */}
                  <div className="mb-2 flex items-center gap-1 sm:gap-2 justify-center lg:justify-start">
                    <User className="text-base-content/60 sm:hidden" size={14} />
                    <User className="text-base-content/60 hidden sm:block" size={16} />
                    <span className="text-base-content/70 font-mono text-xs sm:text-sm">
                      @{userInfo.username}
                    </span>
                  </div>

                  <p className="text-base-content/60 text-xs sm:text-sm">
                    Active since March 2024
                  </p>
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex flex-1 justify-center lg:justify-end mt-3 lg:mt-0">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary btn-outline btn-sm sm:btn-md gap-1 sm:gap-2 w-full sm:w-auto max-w-xs"
                  >
                    <Edit size={14} className="sm:hidden" />
                    <Edit size={16} className="hidden sm:block" />
                    <span className="text-xs sm:text-sm md:text-base">Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex gap-2 w-full sm:w-auto max-w-xs">
                    <button
                      onClick={handleSave}
                      className="btn btn-success btn-sm sm:btn-md gap-1 sm:gap-2 flex-1"
                    >
                      <span className="text-xs sm:text-sm md:text-base">Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn btn-ghost btn-sm sm:btn-md gap-1 sm:gap-2 flex-1"
                    >
                      <span className="text-xs sm:text-sm md:text-base">Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <div className="card-body pt-0 p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              {/* Email Card */}
              <div className="card bg-base-200 shadow-sm">
                <div className="card-body p-3 sm:p-4">
                  <div className="mb-2 flex items-center gap-1 sm:gap-2">
                    <Mail className="text-accent sm:hidden" size={16} />
                    <Mail className="text-accent hidden sm:block" size={20} />
                    <h3 className="card-title text-sm sm:text-base">Email</h3>
                  </div>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editInfo.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="input input-bordered input-xs sm:input-sm w-full text-xs sm:text-sm"
                    />
                  ) : (
                    <div className="text-base-content/80 text-xs sm:text-sm break-all">
                      {userInfo.email || "Not provided"}
                    </div>
                  )}
                </div>
              </div>

              {/* Phone Card */}
              <div className="card bg-base-200 shadow-sm">
                <div className="card-body p-3 sm:p-4">
                  <div className="mb-2 flex items-center gap-1 sm:gap-2">
                    <Phone className="text-success sm:hidden" size={16} />
                    <Phone className="text-success hidden sm:block" size={20} />
                    <h3 className="card-title text-sm sm:text-base">Phone</h3>
                  </div>
                  {isEditing ? (
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={editInfo.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="input input-bordered input-xs sm:input-sm w-full text-xs sm:text-sm"
                    />
                  ) : (
                    <div className="badge badge-outline badge-sm sm:badge-md md:badge-lg text-xs sm:text-sm">
                      {userInfo.phone || "Not provided"}
                    </div>
                  )}
                </div>
              </div>

              {/* Username Card */}
              <div className="card bg-base-200 shadow-sm">
                <div className="card-body p-3 sm:p-4">
                  <div className="mb-2 flex items-center gap-1 sm:gap-2">
                    <User className="text-warning sm:hidden" size={16} />
                    <User className="text-warning hidden sm:block" size={20} />
                    <h3 className="card-title text-sm sm:text-base">Username</h3>
                  </div>
                  <div className="badge badge-primary badge-sm sm:badge-md md:badge-lg text-xs sm:text-sm">
                    @{userInfo.username}
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="card bg-base-200 shadow-sm">
                <div className="card-body p-3 sm:p-4">
                  <div className="mb-2 flex items-center gap-1 sm:gap-2">
                    <MapPin className="text-error sm:hidden" size={16} />
                    <MapPin className="text-error hidden sm:block" size={20} />
                    <h3 className="card-title text-sm sm:text-base">Address</h3>
                  </div>
                  {isEditing ? (
                    <textarea
                      placeholder="Enter your address"
                      value={editInfo.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      rows={3}
                      className="textarea textarea-bordered textarea-xs sm:textarea-sm w-full resize-none text-xs sm:text-sm"
                    />
                  ) : (
                    <div className="text-base-content/80 text-xs sm:text-sm leading-relaxed">
                      {userInfo.address || "Not provided"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="divider my-3 sm:my-4"></div>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4 px-2 sm:px-0">
              <button className="btn btn-outline btn-sm sm:btn-md gap-1 sm:gap-2 w-full sm:w-auto">
                <span className="text-xs sm:text-sm md:text-base">Privacy Settings</span>
              </button>
              <Link to="/account-settings/" className="btn btn-outline btn-sm sm:btn-md gap-1 sm:gap-2 w-full sm:w-auto">
                <span className="text-xs sm:text-sm md:text-base">Account Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
