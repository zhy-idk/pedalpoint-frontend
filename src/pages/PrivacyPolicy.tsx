import { Shield, Lock, Eye, UserCheck, Database, Mail } from "lucide-react";

function PrivacyPolicy() {
  return (
    <div className="bg-base-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-base-content/70">
            Last Updated: January 7, 2025
          </p>
        </div>

        {/* Introduction */}
        <div className="card bg-base-200 shadow-lg mb-6">
          <div className="card-body">
            <p className="text-lg">
              At Pedal Point, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
              or make a purchase from us.
            </p>
          </div>
        </div>

        {/* Information We Collect */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              Information We Collect
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
                <p className="text-base-content/80 mb-2">
                  When you create an account or make a purchase, we may collect:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-base-content/80">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely through PayMongo)</li>
                  <li>Order history and purchase details</li>
                  <li>Account credentials (username and encrypted password)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Automatically Collected Information</h3>
                <p className="text-base-content/80 mb-2">
                  When you visit our website, we automatically collect:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-base-content/80">
                  <li>IP address and browser type</li>
                  <li>Device information and operating system</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referring website and exit pages</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* How We Use Your Information */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-primary" />
              How We Use Your Information
            </h2>
            
            <p className="text-base-content/80 mb-4">
              We use the information we collect for the following purposes:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="badge badge-primary mt-1">1</div>
                <div>
                  <p className="font-semibold">Order Processing and Fulfillment</p>
                  <p className="text-base-content/70 text-sm">
                    To process your orders, arrange deliveries, and provide customer support
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="badge badge-primary mt-1">2</div>
                <div>
                  <p className="font-semibold">Account Management</p>
                  <p className="text-base-content/70 text-sm">
                    To create and manage your account, including order history and preferences
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="badge badge-primary mt-1">3</div>
                <div>
                  <p className="font-semibold">Payment Processing</p>
                  <p className="text-base-content/70 text-sm">
                    To securely process payments through our trusted payment processor, PayMongo
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="badge badge-primary mt-1">4</div>
                <div>
                  <p className="font-semibold">Communication</p>
                  <p className="text-base-content/70 text-sm">
                    To send order confirmations, shipping updates, and respond to your inquiries
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="badge badge-primary mt-1">5</div>
                <div>
                  <p className="font-semibold">Service Improvement</p>
                  <p className="text-base-content/70 text-sm">
                    To analyze website usage and improve our products and services
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="badge badge-primary mt-1">6</div>
                <div>
                  <p className="font-semibold">Marketing (with consent)</p>
                  <p className="text-base-content/70 text-sm">
                    To send promotional emails about new products and special offers (you can opt-out anytime)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Sharing */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              How We Share Your Information
            </h2>
            
            <p className="text-base-content/80 mb-4">
              We do not sell or rent your personal information to third parties. We may share your information with:
            </p>
            
            <div className="space-y-3">
              <div className="alert">
                <Shield className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Payment Processors</p>
                  <p className="text-sm">
                    PayMongo for secure payment processing (they have their own privacy policies)
                  </p>
                </div>
              </div>

              <div className="alert">
                <Shield className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Shipping Partners</p>
                  <p className="text-sm">
                    Delivery services to fulfill your orders (only necessary shipping information)
                  </p>
                </div>
              </div>

              <div className="alert">
                <Shield className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Service Providers</p>
                  <p className="text-sm">
                    Third-party service providers who assist in website operations and business operations
                  </p>
                </div>
              </div>

              <div className="alert">
                <Shield className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Legal Requirements</p>
                  <p className="text-sm">
                    When required by law or to protect our rights and safety
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Security */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              Data Security
            </h2>
            
            <p className="text-base-content/80 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="font-semibold flex items-center gap-2">
                    <div className="badge badge-success">✓</div>
                    SSL Encryption
                  </h3>
                  <p className="text-sm text-base-content/70">
                    All data transmitted between you and our servers is encrypted using SSL/TLS
                  </p>
                </div>
              </div>

              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="font-semibold flex items-center gap-2">
                    <div className="badge badge-success">✓</div>
                    Secure Payment Processing
                  </h3>
                  <p className="text-sm text-base-content/70">
                    Payments processed through PCI DSS compliant PayMongo
                  </p>
                </div>
              </div>

              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="font-semibold flex items-center gap-2">
                    <div className="badge badge-success">✓</div>
                    Password Protection
                  </h3>
                  <p className="text-sm text-base-content/70">
                    Passwords are hashed and encrypted in our database
                  </p>
                </div>
              </div>

              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="font-semibold flex items-center gap-2">
                    <div className="badge badge-success">✓</div>
                    Limited Access
                  </h3>
                  <p className="text-sm text-base-content/70">
                    Only authorized personnel have access to personal information
                  </p>
                </div>
              </div>
            </div>

            <div className="alert alert-warning mt-4">
              <span className="text-sm">
                While we strive to protect your personal information, no method of transmission over the internet 
                or electronic storage is 100% secure. We cannot guarantee absolute security.
              </span>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Your Rights and Choices</h2>
            
            <p className="text-base-content/80 mb-4">
              You have the following rights regarding your personal information:
            </p>
            
            <div className="space-y-3">
              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" /> 
                <div className="collapse-title font-semibold">
                  Access and Update
                </div>
                <div className="collapse-content text-sm text-base-content/80">
                  <p>
                    You can access and update your account information at any time by logging into your account 
                    and visiting the Account Settings page.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" /> 
                <div className="collapse-title font-semibold">
                  Data Deletion
                </div>
                <div className="collapse-content text-sm text-base-content/80">
                  <p>
                    You may request deletion of your account and personal information by contacting us. 
                    Note that we may retain certain information as required by law or for legitimate business purposes.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" /> 
                <div className="collapse-title font-semibold">
                  Marketing Communications
                </div>
                <div className="collapse-content text-sm text-base-content/80">
                  <p>
                    You can opt-out of receiving marketing emails by clicking the "unsubscribe" link in any 
                    promotional email or by updating your communication preferences in your account settings.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" /> 
                <div className="collapse-title font-semibold">
                  Cookies
                </div>
                <div className="collapse-content text-sm text-base-content/80">
                  <p>
                    You can control cookies through your browser settings. However, disabling cookies may affect 
                    the functionality of our website.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Children's Privacy */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Children's Privacy</h2>
            <p className="text-base-content/80">
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children under 13. If you believe we have collected information from a child under 13, 
              please contact us immediately.
            </p>
          </div>
        </div>

        {/* Changes to Policy */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Changes to This Privacy Policy</h2>
            <p className="text-base-content/80">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
              new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this 
              Privacy Policy periodically for any changes.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card bg-primary text-primary-content shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Contact Us
            </h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> privacy@pedalpoint.com</p>
              <p><strong>Phone:</strong> +63 XXX XXX XXXX</p>
              <p><strong>Address:</strong> [Your Business Address]</p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <a href="/" className="btn btn-outline">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;



