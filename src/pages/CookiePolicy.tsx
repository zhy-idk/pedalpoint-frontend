import { Cookie, Shield, Settings, Info } from "lucide-react";

function CookiePolicy() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-base-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Cookie className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-base-content/70">Last Updated: {lastUpdated}</p>
        </div>

        {/* Introduction */}
        <div className="card bg-base-200 shadow-lg mb-6">
          <div className="card-body">
            <p className="text-lg">
              This Cookie Policy explains how PedalPoint ("we", "us", or "our")
              uses cookies and similar technologies when you visit our website.
              We use cookies to enhance your browsing experience, secure your
              account, and maintain your shopping cart.
            </p>
          </div>
        </div>

        {/* What Are Cookies */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              What Are Cookies?
            </h2>
            <p className="text-base-content/80 mb-4">
              Cookies are small text files that are placed on your device
              (computer, smartphone, or tablet) when you visit a website. They
              help websites remember your actions and preferences over a period
              of time.
            </p>
            <p className="text-base-content/80">
              Cookies can be "session cookies" (deleted when you close your
              browser) or "persistent cookies" (remain on your device for a set
              period or until manually deleted).
            </p>
          </div>
        </div>

        {/* Types of Cookies We Use */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Types of Cookies We Use
            </h2>

            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <div className="badge badge-error">Required</div>
                    Essential Cookies
                  </h3>
                  <p className="text-base-content/80 mb-4">
                    These cookies are strictly necessary for the website to
                    function properly. Without these cookies, services you have
                    asked for cannot be provided.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Cookie Name</th>
                          <th>Purpose</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="font-mono text-xs">sessionid</td>
                          <td>Maintains your login session</td>
                          <td>Session / 2 weeks</td>
                        </tr>
                        <tr>
                          <td className="font-mono text-xs">csrftoken</td>
                          <td>Security protection against CSRF attacks</td>
                          <td>1 year</td>
                        </tr>
                        <tr>
                          <td className="font-mono text-xs">messages</td>
                          <td>Stores system messages and notifications</td>
                          <td>Session</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="alert alert-info mt-4">
                    <Info className="h-5 w-5" />
                    <span className="text-sm">
                      These cookies cannot be disabled as they are essential for
                      the website to function.
                    </span>
                  </div>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <div className="badge badge-warning">Functional</div>
                    Functional Cookies
                  </h3>
                  <p className="text-base-content/80 mb-4">
                    These cookies enable enhanced functionality and
                    personalization, such as remembering your preferences and
                    shopping cart contents.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Cookie/Storage</th>
                          <th>Purpose</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="font-mono text-xs">theme</td>
                          <td>Remembers your theme preference (light/dark)</td>
                          <td>Persistent</td>
                        </tr>
                        <tr>
                          <td className="font-mono text-xs">cart_data</td>
                          <td>Stores your shopping cart items</td>
                          <td>30 days</td>
                        </tr>
                        <tr>
                          <td className="font-mono text-xs">user_preferences</td>
                          <td>Stores display preferences and settings</td>
                          <td>1 year</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* No Tracking Notice */}
              <div className="alert alert-success">
                <Shield className="h-6 w-6" />
                <div>
                  <h3 className="font-bold">No Third-Party Tracking</h3>
                  <p className="text-sm">
                    We do <strong>NOT</strong> use analytics cookies, advertising
                    cookies, or any third-party tracking technologies. We only
                    track sales data to manage orders and inventory. Your browsing
                    behavior is not monitored or shared with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Local Storage */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Local Storage</h2>
            <p className="text-base-content/80 mb-4">
              In addition to cookies, we use browser local storage to store:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
              <li>Theme preferences (light/dark mode)</li>
              <li>Shopping cart data when not logged in</li>
              <li>Form data to prevent loss during navigation</li>
              <li>UI state preferences (sidebar collapsed, etc.)</li>
            </ul>
            <p className="text-base-content/80 mt-4">
              Local storage data remains on your device and is not transmitted to
              our servers unless you perform an action (like checking out).
            </p>
          </div>
        </div>

        {/* Managing Cookies */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              How to Manage Cookies
            </h2>

            <p className="text-base-content/80 mb-4">
              You can control and manage cookies in various ways:
            </p>

            <div className="space-y-4">
              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title font-semibold">
                  Browser Settings
                </div>
                <div className="collapse-content text-sm text-base-content/80 space-y-2">
                  <p>Most browsers allow you to:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>View and delete cookies</li>
                    <li>Block third-party cookies</li>
                    <li>Block cookies from specific sites</li>
                    <li>Block all cookies</li>
                    <li>Delete all cookies when you close the browser</li>
                  </ul>
                  <p className="mt-2">
                    Check your browser's help menu for instructions on managing
                    cookies.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title font-semibold">
                  Google Chrome
                </div>
                <div className="collapse-content text-sm text-base-content/80">
                  <p>
                    Settings → Privacy and security → Cookies and other site data
                    → See all cookies and site data
                  </p>
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title font-semibold">
                  Mozilla Firefox
                </div>
                <div className="collapse-content text-sm text-base-content/80">
                  <p>
                    Settings → Privacy & Security → Cookies and Site Data →
                    Manage Data
                  </p>
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title font-semibold">Safari</div>
                <div className="collapse-content text-sm text-base-content/80">
                  <p>
                    Preferences → Privacy → Manage Website Data → Remove All
                  </p>
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title font-semibold">
                  Microsoft Edge
                </div>
                <div className="collapse-content text-sm text-base-content/80">
                  <p>
                    Settings → Cookies and site permissions → Manage and delete
                    cookies and site data
                  </p>
                </div>
              </div>
            </div>

            <div className="alert alert-warning mt-4">
              <span className="text-sm">
                <strong>Note:</strong> Blocking or deleting cookies may affect
                your ability to use certain features of our website, such as
                staying logged in or maintaining your shopping cart.
              </span>
            </div>
          </div>
        </div>

        {/* Updates to Policy */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              Changes to This Cookie Policy
            </h2>
            <p className="text-base-content/80">
              We may update this Cookie Policy from time to time to reflect
              changes in our practices or for other operational, legal, or
              regulatory reasons. Please check this page periodically for updates.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="card bg-primary text-primary-content shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Questions?</h2>
            <p className="mb-4">
              If you have any questions about our use of cookies, please contact
              us:
            </p>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> pedal.point01@gmail.com
              </p>
              <p>
                <strong>Phone:</strong> +63 912 345 6789
              </p>
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

export default CookiePolicy;

