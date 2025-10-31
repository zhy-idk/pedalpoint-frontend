import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BackIcon from '../assets/undo_24dp.svg?react';
import api, { apiBaseUrl } from '../api/index';


function AccountSettings() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  
  // Check if user has usable password
  const [hasUsablePassword, setHasUsablePassword] = useState<boolean | null>(null);
  const [isCheckingPassword, setIsCheckingPassword] = useState(true);
  const [setPasswordLoading, setSetPasswordLoading] = useState(false);
  const [setPasswordError, setSetPasswordError] = useState<string | null>(null);
  const [setPasswordSuccess, setSetPasswordSuccess] = useState(false);
  
  // Security Settings State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // TOTP State
  const [totpSetupData, setTotpSetupData] = useState<any>(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpLoading, setTotpLoading] = useState(false);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [totpResponse, setTotpResponse] = useState<any>(null);
  
  // Security Tab Password Protection
  const [isSecurityUnlocked, setIsSecurityUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Email Notifications State
  const [emailNotifications, setEmailNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    securityAlerts: true,
    deliveryUpdates: true
  });
  
  // Check has_usable_password from session
  useEffect(() => {
    const checkHasUsablePassword = async () => {
      if (!isAuthenticated) return;
      
      setIsCheckingPassword(true);
      try {
        const response = await fetch(`${apiBaseUrl}/_allauth/browser/v1/auth/session`, {
          credentials: 'include',
        });
        const data = await response.json();
        const hasPassword = data.data?.user?.has_usable_password ?? false;
        setHasUsablePassword(hasPassword);
        console.log('has_usable_password:', hasPassword);
      } catch (error) {
        console.error('Failed to check has_usable_password:', error);
        // Default to true if we can't check (safer assumption)
        setHasUsablePassword(true);
      } finally {
        setIsCheckingPassword(false);
      }
    };
    
    checkHasUsablePassword();
  }, [isAuthenticated]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-base-200 flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">
            Please log in to access account settings
          </h1>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    // TODO: Implement password change API call
    console.log('Password change requested');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Password changed successfully');
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) {
      setSetPasswordError('Email address not found. Please contact support.');
      return;
    }

    setSetPasswordLoading(true);
    setSetPasswordError(null);
    setSetPasswordSuccess(false);

    try {
      await api.post('/_allauth/browser/v1/auth/password/request', {
        email: user.email,
      }, {
        withCredentials: true,
      });

      setSetPasswordSuccess(true);
      // Show success message for a few seconds
      setTimeout(() => {
        setSetPasswordSuccess(false);
      }, 5000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.errors?.[0]?.message || 
                       error.response?.data?.message || 
                       error.message || 
                       'Failed to send password setup email. Please try again.';
      setSetPasswordError(errorMsg);
      console.error('Set password error:', error);
    } finally {
      setSetPasswordLoading(false);
    }
  };

  const handleGetTOTPSetup = async () => {
    setTotpLoading(true);
    setTotpError(null);
    setTotpResponse(null);

    try {
      const response = await api.get('/_allauth/browser/v1/account/authenticators/totp');
      setTotpSetupData(response.data);
      setTotpResponse({ 
        status: 'success',
        statusCode: 200,
        message: 'TOTP Setup Retrieved!', 
        ...response.data 
      });
    } catch (error: any) {
      // 404 is normal - means TOTP not set up yet
      if (error.response?.status === 404) {
        setTotpResponse({
          status: 'info',
          statusCode: 404,
          message: 'TOTP not set up yet',
          note: 'This is expected if you haven\'t enabled 2FA yet',
          fullResponse: error.response?.data
        });
      } else {
        const errorMsg = error.response?.data?.errors?.[0]?.message || 
                         error.response?.data?.message || 
                         error.message || 
                         'Failed to get TOTP setup';
        setTotpError(errorMsg);
        setTotpResponse({
          status: 'error',
          statusCode: error.response?.status || 500,
          message: errorMsg,
          fullResponse: error.response?.data
        });
      }
      console.error('TOTP GET response:', error.response?.data || error);
    } finally {
      setTotpLoading(false);
    }
  };

  const handleActivateTOTP = async () => {
    if (!totpCode.trim()) {
      setTotpError('Please enter a TOTP code');
      return;
    }

    setTotpLoading(true);
    setTotpError(null);
    setTotpResponse(null);

    try {
      const response = await api.post('/_allauth/browser/v1/account/authenticators/totp', {
        code: totpCode
      });
      setTotpResponse({ 
        status: 'success',
        statusCode: response.status,
        message: 'TOTP Activated Successfully!',
        ...response.data 
      });
      setTotpCode(""); // Clear the input on success
      setTotpSetupData(null); // Clear setup data after activation
    } catch (error: any) {
      const errorMsg = error.response?.data?.errors?.[0]?.message || 
                       error.response?.data?.message || 
                       error.message || 
                       'Failed to activate TOTP';
      setTotpError(errorMsg);
      setTotpResponse({
        status: 'error',
        statusCode: error.response?.status || 500,
        message: errorMsg,
        fullResponse: error.response?.data
      });
      console.error('TOTP POST error:', error.response?.data || error);
    } finally {
      setTotpLoading(false);
    }
  };

  const handleDeactivateTOTP = async () => {
    setTotpLoading(true);
    setTotpError(null);
    setTotpResponse(null);

    try {
      const response = await api.delete('/_allauth/browser/v1/account/authenticators/totp');
      setTotpResponse({ 
        status: 'success',
        statusCode: response.status,
        message: 'TOTP Deactivated Successfully!',
        ...response.data 
      });
      setTotpSetupData(null); // Clear setup data
      setTotpCode(""); // Clear input
    } catch (error: any) {
      const errorMsg = error.response?.data?.errors?.[0]?.message || 
                       error.response?.data?.message || 
                       error.message || 
                       'Failed to deactivate TOTP';
      setTotpError(errorMsg);
      setTotpResponse({
        status: 'error',
        statusCode: error.response?.status || 500,
        message: errorMsg,
        fullResponse: error.response?.data
      });
      console.error('TOTP DELETE error:', error.response?.data || error);
    } finally {
      setTotpLoading(false);
    }
  };

  const handleAccountDeletion = () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion');
      return;
    }
    // TODO: Implement account deletion API call
    console.log('Account deletion requested');
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
  };

  const handleEmailNotificationChange = (key: keyof typeof emailNotifications) => {
    setEmailNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    // TODO: Implement email notification preferences API call
  };

  const handleTabClick = (tabId: string) => {
    if (tabId === 'security' && !isSecurityUnlocked) {
      // Show password verification modal
      setShowPasswordModal(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const handlePasswordVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setPasswordError('');

    try {
      // Verify password using django-allauth reauthentication endpoint
      await api.post('/_allauth/browser/v1/auth/reauthenticate', {
        password: verifyPassword
      });

      // Success - unlock security tab
      setIsSecurityUnlocked(true);
      setShowPasswordModal(false);
      setActiveTab('security');
      setVerifyPassword('');
    } catch (error: any) {
      console.error('Password verification failed:', error);
      const errorMsg = error?.response?.data?.errors?.[0]?.message || 
                      error?.response?.data?.message || 
                      'Incorrect password. Please try again.';
      setPasswordError(errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'danger', label: 'Danger Zone', icon: '⚠️' }
  ];

  return (
    <div className="bg-base-200 min-h-screen p-2 sm:p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 mb-4">
            <Link to="/profile/" className="btn btn-ghost btn-xs sm:btn-sm">
              <BackIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Back</span>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Account Settings</h1>
              <p className="text-xs sm:text-sm text-base-content/70 hidden sm:block">Manage your account preferences and security</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-2 sm:p-4">
                {/* Mobile: Horizontal tabs */}
                <div className="flex lg:hidden overflow-x-auto gap-1 pb-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`btn btn-xs whitespace-nowrap ${
                        activeTab === tab.id ? 'btn-primary' : 'btn-ghost'
                      }`}
                    >
                      <span className="mr-1">{tab.icon}</span>
                      <span className="text-xs">{tab.label}</span>
                      {tab.id === 'security' && !isSecurityUnlocked && (
                        <span className="ml-1">🔒</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Desktop: Vertical menu */}
                <ul className="menu menu-compact hidden lg:flex">
                  {tabs.map(tab => (
                    <li key={tab.id}>
                      <button
                        onClick={() => handleTabClick(tab.id)}
                        className={`w-full text-left ${activeTab === tab.id ? 'active' : ''}`}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                        {tab.id === 'security' && !isSecurityUnlocked && (
                          <span className="ml-auto">🔒</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-3 sm:p-4 md:p-6">
                
                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4">Security Settings</h2>
                    </div>

                    {/* Change Password / Set Password */}
                    <div className="card bg-base-200">
                      <div className="card-body p-3 sm:p-4 md:p-6">
                        {isCheckingPassword ? (
                          <div className="flex items-center justify-center py-4">
                            <span className="loading loading-spinner loading-md"></span>
                            <span className="ml-2 text-sm">Checking password status...</span>
                          </div>
                        ) : hasUsablePassword === false ? (
                          // Set Password (no password exists)
                          <>
                            <h3 className="card-title text-base sm:text-lg">Set Password</h3>
                            <p className="text-xs sm:text-sm text-base-content/70 mb-3 sm:mb-4">
                              You don't have a password set yet. We'll send you an email with instructions to set up your password.
                            </p>
                            
                            {setPasswordSuccess && (
                              <div className="alert alert-success mb-3 sm:mb-4 text-xs sm:text-sm py-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Password setup email sent! Please check your email ({user?.email}) for instructions.</span>
                              </div>
                            )}
                            
                            {setPasswordError && (
                              <div className="alert alert-error mb-3 sm:mb-4 text-xs sm:text-sm py-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{setPasswordError}</span>
                              </div>
                            )}
                            
                            <form onSubmit={handleSetPassword} className="space-y-3 sm:space-y-4">
                              <div className="alert alert-info text-xs sm:text-sm py-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <div>
                                  <div className="font-bold">Email will be sent to: {user?.email}</div>
                                  <div>Click the button below to receive password setup instructions via email.</div>
                                </div>
                              </div>
                              <button 
                                type="submit" 
                                className="btn btn-primary btn-sm sm:btn-md"
                                disabled={setPasswordLoading || setPasswordSuccess}
                              >
                                {setPasswordLoading ? (
                                  <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    <span className="text-xs sm:text-sm">Sending email...</span>
                                  </>
                                ) : setPasswordSuccess ? (
                                  'Email Sent!'
                                ) : (
                                  'Send Password Setup Email'
                                )}
                              </button>
                            </form>
                          </>
                        ) : (
                          // Change Password (password exists)
                          <>
                            <h3 className="card-title text-base sm:text-lg">Change Password</h3>
                            <form onSubmit={handlePasswordChange} className="space-y-3 sm:space-y-4">
                              <div>
                                <label className="label py-1 sm:py-2">
                                  <span className="label-text text-xs sm:text-sm">Current Password</span>
                                </label>
                                <input
                                  type="password"
                                  className="input input-bordered input-sm sm:input-md w-full"
                                  value={passwordData.currentPassword}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                  required
                                />
                              </div>
                              <div>
                                <label className="label py-1 sm:py-2">
                                  <span className="label-text text-xs sm:text-sm">New Password</span>
                                </label>
                                <input
                                  type="password"
                                  className="input input-bordered input-sm sm:input-md w-full"
                                  value={passwordData.newPassword}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                  required
                                />
                              </div>
                              <div>
                                <label className="label py-1 sm:py-2">
                                  <span className="label-text text-xs sm:text-sm">Confirm New Password</span>
                                </label>
                                <input
                                  type="password"
                                  className="input input-bordered input-sm sm:input-md w-full"
                                  value={passwordData.confirmPassword}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                  required
                                />
                              </div>
                              <button type="submit" className="btn btn-primary btn-sm sm:btn-md">Update Password</button>
                            </form>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="card bg-base-200">
                      <div className="card-body p-3 sm:p-4 md:p-6">
                        <h3 className="card-title text-base sm:text-lg">Two-Factor Authentication (TOTP)</h3>
                        <p className="text-xs sm:text-sm text-base-content/70 mb-3 sm:mb-4">
                          Secure your account with time-based one-time passwords
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 mb-4">
                          <button 
                            onClick={handleGetTOTPSetup}
                            disabled={totpLoading}
                            className="btn btn-primary btn-sm sm:btn-md flex-1"
                          >
                            {totpLoading ? (
                              <>
                                <span className="loading loading-spinner loading-sm"></span>
                                <span className="text-xs sm:text-sm">Loading...</span>
                              </>
                            ) : (
                              <span className="text-xs sm:text-sm">Setup 2FA</span>
                            )}
                          </button>
                          <button 
                            onClick={handleDeactivateTOTP}
                            disabled={totpLoading}
                            className="btn btn-error btn-outline btn-sm sm:btn-md flex-1"
                          >
                            {totpLoading ? (
                              <>
                                <span className="loading loading-spinner loading-sm"></span>
                                <span className="text-xs sm:text-sm">Loading...</span>
                              </>
                            ) : (
                              <span className="text-xs sm:text-sm">Deactivate 2FA</span>
                            )}
                          </button>
                        </div>

                        {/* Error Display */}
                        {totpError && (
                          <div className="alert alert-error mb-3 text-xs sm:text-sm py-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{totpError}</span>
                          </div>
                        )}

                        {/* TOTP Setup Display */}
                        {totpSetupData?.meta && (
                          <div className="space-y-3 sm:space-y-4">
                            <div className="divider text-xs sm:text-sm">Scan QR Code</div>
                            
                            {/* QR Code */}
                            {totpSetupData.meta.totp_svg_url && (
                              <div className="flex justify-center p-4 bg-white rounded-lg">
                                <img 
                                  src={`${apiBaseUrl}${totpSetupData.meta.totp_svg_url}`}
                                  alt="TOTP QR Code"
                                  className="w-48 h-48 sm:w-64 sm:h-64"
                                />
                              </div>
                            )}

                            {/* Secret Key */}
                            {totpSetupData.meta.secret && (
                              <div>
                                <label className="label py-1">
                                  <span className="label-text text-xs sm:text-sm font-semibold">Secret Key (Manual Entry)</span>
                                </label>
                                <div className="flex items-center gap-2">
                                  <code className="flex-1 bg-base-300 p-2 rounded text-xs sm:text-sm break-all font-mono">
                                    {totpSetupData.meta.secret}
                                  </code>
                                  <button 
                                    className="btn btn-ghost btn-xs sm:btn-sm"
                                    onClick={() => {
                                      navigator.clipboard.writeText(totpSetupData.meta.secret);
                                      alert('Secret copied to clipboard!');
                                    }}
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="divider text-xs sm:text-sm">Enter Code to Activate</div>

                            {/* Activation Input */}
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={totpCode}
                                onChange={(e) => {
                                  setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                  setTotpError(null);
                                }}
                                maxLength={6}
                                className="input input-bordered input-sm sm:input-md flex-1 text-center font-mono text-lg"
                                disabled={totpLoading}
                              />
                              <button 
                                onClick={handleActivateTOTP}
                                disabled={totpLoading || totpCode.length !== 6}
                                className="btn btn-success btn-sm sm:btn-md"
                              >
                                {totpLoading ? (
                                  <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    <span className="text-xs sm:text-sm">Activating...</span>
                                  </>
                                ) : (
                                  <span className="text-xs sm:text-sm">Activate</span>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Status Messages */}
                        {totpResponse && (
                          <div className="mt-3 sm:mt-4">
                            {totpResponse.status === 'success' && (
                              <div className="alert alert-success text-xs sm:text-sm py-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{totpResponse.message}</span>
                              </div>
                            )}
                            {totpResponse.status === 'info' && (
                              <div className="alert alert-info text-xs sm:text-sm py-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <div>
                                  <div className="font-bold">{totpResponse.message}</div>
                                  <div>{totpResponse.note}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4">Email Notifications</h2>
                      <p className="text-xs sm:text-sm text-base-content/70">Choose what notifications you want to receive</p>
                    </div>

                    <div className="card bg-base-200">
                      <div className="card-body p-3 sm:p-4 md:p-6">
                        <div className="space-y-3 sm:space-y-4">
                          {Object.entries(emailNotifications).map(([key, value]) => (
                            <div key={key} className="flex items-start sm:items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm sm:text-base truncate">
                                  {key === 'orderUpdates' && 'Order Updates'}
                                  {key === 'promotions' && 'Promotions & Deals'}
                                  {key === 'newsletter' && 'Newsletter'}
                                  {key === 'securityAlerts' && 'Security Alerts'}
                                  {key === 'deliveryUpdates' && 'Delivery Updates'}
                                </div>
                                <div className="text-xs sm:text-sm text-base-content/70">
                                  {key === 'orderUpdates' && 'Get notified about your order status changes'}
                                  {key === 'promotions' && 'Receive emails about special offers and discounts'}
                                  {key === 'newsletter' && 'Stay updated with our latest news and products'}
                                  {key === 'securityAlerts' && 'Important security notifications (recommended)'}
                                  {key === 'deliveryUpdates' && 'Real-time delivery tracking notifications'}
                                </div>
                              </div>
                              <div className="form-control flex-shrink-0">
                                <label className="label cursor-pointer p-0">
                                  <input
                                    type="checkbox"
                                    className="toggle toggle-primary toggle-sm sm:toggle-md"
                                    checked={value}
                                    onChange={() => handleEmailNotificationChange(key as keyof typeof emailNotifications)}
                                  />
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                {/* Danger Zone Tab */}
                {activeTab === 'danger' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 text-error">Danger Zone</h2>
                      <p className="text-xs sm:text-sm text-base-content/70">Irreversible and destructive actions</p>
                    </div>

                    <div className="card bg-error/10 border border-error/20">
                      <div className="card-body p-3 sm:p-4 md:p-6">
                        <h3 className="card-title text-base sm:text-lg text-error">Delete Account</h3>
                        <p className="text-xs sm:text-sm text-base-content/70 mb-3 sm:mb-4">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        
                        {!showDeleteConfirm ? (
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="btn btn-error btn-outline btn-sm sm:btn-md"
                          >
                            Delete Account
                          </button>
                        ) : (
                          <div className="space-y-3 sm:space-y-4">
                            <div className="alert alert-warning text-xs sm:text-sm py-2 sm:py-3">
                              <span>This will permanently delete your account and all data. Type "DELETE" to confirm.</span>
                            </div>
                            <input
                              type="text"
                              className="input input-bordered input-sm sm:input-md w-full"
                              placeholder="Type DELETE to confirm"
                              value={deleteConfirmText}
                              onChange={(e) => setDeleteConfirmText(e.target.value)}
                            />
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={handleAccountDeletion}
                                className="btn btn-error btn-sm sm:btn-md flex-1"
                                disabled={deleteConfirmText !== 'DELETE'}
                              >
                                Confirm Deletion
                              </button>
                              <button
                                onClick={() => {
                                  setShowDeleteConfirm(false);
                                  setDeleteConfirmText('');
                                }}
                                className="btn btn-ghost btn-sm sm:btn-md flex-1"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* Password Verification Modal */}
        {showPasswordModal && (
          <div className="modal modal-open">
            <div className="modal-box border-2 border-warning max-w-[calc(100vw-2rem)] sm:max-w-md">
              <div className="flex flex-col items-center text-center">
                <div className="bg-warning/20 rounded-full p-3 sm:p-4 mb-3 sm:mb-4">
                  <svg 
                    className="w-12 h-12 sm:w-16 sm:h-16 text-warning" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                
                <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-warning mb-2">Verify Your Password 🔐</h3>
                <p className="text-xs sm:text-sm text-base-content/70 mb-3 sm:mb-4">
                  For your security, please enter your password to access security settings
                </p>

                <form onSubmit={handlePasswordVerification} className="w-full">
                  {passwordError && (
                    <div className="alert alert-error mb-3 sm:mb-4 text-xs sm:text-sm py-2 sm:py-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <div className="form-control mb-3 sm:mb-4">
                    <label className="label py-1 sm:py-2">
                      <span className="label-text text-xs sm:text-sm">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={verifyPassword}
                      onChange={(e) => {
                        setVerifyPassword(e.target.value);
                        setPasswordError('');
                      }}
                      className="input input-bordered input-sm sm:input-md w-full"
                      autoFocus
                      disabled={isVerifying}
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button 
                      type="button"
                      className="btn btn-ghost btn-sm sm:btn-md flex-1"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setVerifyPassword('');
                        setPasswordError('');
                      }}
                      disabled={isVerifying}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-warning btn-sm sm:btn-md flex-1"
                      disabled={isVerifying || !verifyPassword.trim()}
                    >
                      {isVerifying ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          <span className="text-xs sm:text-sm">Verifying...</span>
                        </>
                      ) : (
                        <span className="text-xs sm:text-sm">Verify & Continue</span>
                      )}
                    </button>
                  </div>
                </form>

                <div className="alert alert-info mt-3 sm:mt-4 text-xs py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div className="text-left">
                    <p>This helps protect your sensitive security settings from unauthorized access</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountSettings;

