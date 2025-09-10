import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

const SuperuserRequired: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-error/20 p-4 rounded-full">
              <Shield className="h-12 w-12 text-error" />
            </div>
          </div>
          
          <h2 className="card-title justify-center text-error">
            <AlertTriangle className="h-5 w-5" />
            Access Denied
          </h2>
          
          <p className="text-base-content/70">
            This feature requires superuser privileges. Please contact your administrator 
            if you need access to user management.
          </p>
          
          <div className="card-actions justify-center mt-4">
            <button 
              className="btn btn-primary"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperuserRequired;
