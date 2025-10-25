import { FileText, ShoppingCart, Shield, AlertCircle, Scale, Wrench } from "lucide-react";

function TermsOfUse() {
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
            <FileText className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Terms of Use</h1>
          <p className="text-base-content/70">Last Updated: {lastUpdated}</p>
        </div>

        {/* Introduction */}
        <div className="card bg-base-200 shadow-lg mb-6">
          <div className="card-body">
            <p className="text-lg">
              Welcome to PedalPoint! These Terms of Use ("Terms") govern your
              access to and use of our website, products, and services. By
              accessing or using PedalPoint, you agree to be bound by these Terms.
              If you do not agree to these Terms, please do not use our services.
            </p>
          </div>
        </div>

        {/* Acceptance of Terms */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">1. Acceptance of Terms</h2>
            <p className="text-base-content/80 mb-3">
              By creating an account, making a purchase, or using any of our
              services, you acknowledge that you have read, understood, and agree
              to be bound by these Terms and our Privacy Policy.
            </p>
            <p className="text-base-content/80">
              These Terms apply to all visitors, users, and others who access or
              use our services.
            </p>
          </div>
        </div>

        {/* Account Registration */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              2. Account Registration and Security
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  2.1 Account Creation
                </h3>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
                  <li>You must be at least 13 years old to create an account</li>
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account confidentiality</li>
                  <li>One account per person; multiple accounts are prohibited</li>
                  <li>You must verify your email address to activate your account</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  2.2 Account Security
                </h3>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
                  <li>
                    You are responsible for all activities under your account
                  </li>
                  <li>
                    Notify us immediately of any unauthorized access or security
                    breach
                  </li>
                  <li>
                    We recommend enabling two-factor authentication (2FA) for
                    enhanced security
                  </li>
                  <li>Never share your password with anyone</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  2.3 Account Termination
                </h3>
                <p className="text-base-content/80 ml-4">
                  We reserve the right to suspend or terminate your account if you
                  violate these Terms, engage in fraudulent activity, or for any
                  other reason at our discretion.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products and Orders */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              3. Products, Orders, and Payments
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  3.1 Product Information
                </h3>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
                  <li>
                    We strive to display accurate product information, but cannot
                    guarantee 100% accuracy
                  </li>
                  <li>Colors may vary due to screen settings</li>
                  <li>We reserve the right to limit quantities</li>
                  <li>Prices are subject to change without notice</li>
                  <li>All prices are in Philippine Peso (PHP) unless stated</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">3.2 Orders</h3>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
                  <li>
                    Placing an order constitutes an offer to purchase products
                  </li>
                  <li>We reserve the right to accept or reject any order</li>
                  <li>
                    Order confirmation does not guarantee product availability
                  </li>
                  <li>
                    We will notify you if an order cannot be fulfilled and provide
                    a full refund
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">3.3 Payment</h3>
                <div className="ml-4 space-y-3">
                  <p className="text-base-content/80">
                    All payments are processed securely through PayMongo, our
                    trusted payment processor.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-base-content/80">
                    <li>
                      Accepted payment methods: Credit/Debit cards, GCash, and
                      other PayMongo-supported methods
                    </li>
                    <li>Payment must be received before order processing</li>
                    <li>You are responsible for any payment processing fees</li>
                    <li>
                      We do not store your payment card information on our servers
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  3.4 Shipping and Delivery
                </h3>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
                  <li>Delivery times are estimates and not guaranteed</li>
                  <li>
                    Shipping costs are calculated at checkout based on location
                    and weight
                  </li>
                  <li>Risk of loss transfers to you upon delivery</li>
                  <li>
                    You are responsible for providing accurate shipping information
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Returns and Refunds */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">4. Returns and Refunds</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">4.1 Return Policy</h3>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
                  <li>Returns accepted within 7 days of delivery</li>
                  <li>
                    Products must be unused, in original packaging, and in
                    resalable condition
                  </li>
                  <li>
                    Custom-built bikes and personalized items are not returnable
                  </li>
                  <li>Proof of purchase required</li>
                  <li>Return shipping costs are the customer's responsibility</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">4.2 Refunds</h3>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
                  <li>
                    Refunds processed within 7-14 business days of receiving
                    returned item
                  </li>
                  <li>
                    Refunds issued to original payment method
                  </li>
                  <li>Shipping costs are non-refundable unless item is defective</li>
                  <li>
                    Partial refunds may be granted for items not in original
                    condition
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  4.3 Defective Products
                </h3>
                <p className="text-base-content/80 ml-4">
                  If you receive a defective or damaged product, contact us within
                  48 hours of delivery. We will arrange for a replacement or full
                  refund, including return shipping costs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Service and Repairs */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" />
              5. Repair and Service Queue
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  5.1 Service Appointments
                </h3>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
                  <li>
                    Service appointments can be scheduled through our online queue
                    system
                  </li>
                  <li>Appointments are subject to availability</li>
                  <li>
                    We reserve the right to reschedule or cancel appointments with
                    notice
                  </li>
                  <li>
                    Please arrive on time; late arrivals may need to reschedule
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">5.2 Repairs</h3>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
                  <li>
                    Repair estimates provided are approximations and may change
                  </li>
                  <li>
                    We will contact you if additional work or costs are required
                  </li>
                  <li>
                    Repairs are warranted for 30 days from service date
                  </li>
                  <li>
                    Bikes not picked up within 30 days may incur storage fees
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  5.3 Custom Builds
                </h3>
                <p className="text-base-content/80 ml-4">
                  Custom bike builds require a deposit and are non-refundable once
                  work begins. Build times vary based on parts availability and
                  complexity. We will provide regular updates on build progress.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Conduct */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-primary" />
              6. User Conduct and Prohibited Activities
            </h2>

            <p className="text-base-content/80 mb-4">
              You agree NOT to:
            </p>

            <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
              <li>
                Use the website for any illegal purpose or violate any laws
              </li>
              <li>
                Impersonate any person or entity or falsely state your affiliation
              </li>
              <li>
                Interfere with or disrupt the website or servers
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the website
              </li>
              <li>
                Use any automated system (bots, scrapers) to access the website
              </li>
              <li>
                Upload or transmit viruses, malware, or harmful code
              </li>
              <li>
                Harass, abuse, or harm other users or staff
              </li>
              <li>
                Post false, misleading, or fraudulent content
              </li>
              <li>
                Resell products purchased from us without authorization
              </li>
            </ul>
          </div>
        </div>

        {/* Intellectual Property */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              7. Intellectual Property Rights
            </h2>

            <p className="text-base-content/80 mb-4">
              All content on this website, including but not limited to text,
              graphics, logos, images, audio clips, digital downloads, and
              software, is the property of PedalPoint or its content suppliers and
              is protected by Philippine and international copyright laws.
            </p>

            <div className="space-y-3">
              <p className="text-base-content/80">
                <strong>Trademarks:</strong> "PedalPoint" and our logo are
                trademarks of PedalPoint. You may not use our trademarks without
                prior written permission.
              </p>

              <p className="text-base-content/80">
                <strong>Limited License:</strong> We grant you a limited,
                non-exclusive, non-transferable license to access and use the
                website for personal, non-commercial purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              8. Disclaimers and Limitation of Liability
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  8.1 "As Is" Disclaimer
                </h3>
                <p className="text-base-content/80 ml-4">
                  The website and services are provided "as is" and "as available"
                  without warranties of any kind, either express or implied. We do
                  not guarantee that the website will be uninterrupted,
                  error-free, or secure.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  8.2 Limitation of Liability
                </h3>
                <p className="text-base-content/80 ml-4 mb-3">
                  To the fullest extent permitted by law, PedalPoint shall not be
                  liable for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-8">
                  <li>
                    Indirect, incidental, special, or consequential damages
                  </li>
                  <li>Loss of profits, data, or goodwill</li>
                  <li>Service interruptions or technical failures</li>
                  <li>
                    Damages resulting from third-party services (shipping,
                    payment processing)
                  </li>
                </ul>
                <p className="text-base-content/80 ml-4 mt-3">
                  Our total liability shall not exceed the amount you paid for the
                  product or service in question.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">9. Privacy</h2>
            <p className="text-base-content/80">
              Your use of the website is also governed by our{" "}
              <a href="/privacy-policy" className="link link-primary">
                Privacy Policy
              </a>
              . Please review our Privacy Policy to understand our data collection
              and usage practices.
            </p>
          </div>
        </div>

        {/* Changes to Terms */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">10. Changes to Terms</h2>
            <p className="text-base-content/80 mb-3">
              We reserve the right to modify these Terms at any time. Changes will
              be effective immediately upon posting to the website. Your continued
              use of the website after changes constitutes acceptance of the new
              Terms.
            </p>
            <p className="text-base-content/80">
              We recommend reviewing these Terms periodically. The "Last Updated"
              date at the top indicates when the Terms were last revised.
            </p>
          </div>
        </div>

        {/* Governing Law */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              11. Governing Law and Dispute Resolution
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">11.1 Governing Law</h3>
                <p className="text-base-content/80 ml-4">
                  These Terms shall be governed by and construed in accordance with
                  the laws of the Republic of the Philippines, without regard to
                  its conflict of law provisions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  11.2 Dispute Resolution
                </h3>
                <p className="text-base-content/80 ml-4 mb-3">
                  In the event of any dispute arising from these Terms or your use
                  of our services:
                </p>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-8">
                  <li>
                    Contact us first to attempt informal resolution
                  </li>
                  <li>
                    If unresolved, disputes shall be subject to the exclusive
                    jurisdiction of the courts of Bulacan, Philippines
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card bg-primary text-primary-content shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">12. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Use, please contact
              us:
            </p>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> pedal.point01@gmail.com
              </p>
              <p>
                <strong>Phone:</strong> +63 912 345 6789
              </p>
              <p>
                <strong>Address:</strong> 9074 J.P Rizal St, Poblacion, Pandi,
                3014 Bulacan, Philippines
              </p>
            </div>
          </div>
        </div>

        {/* Acceptance */}
        <div className="alert alert-info mb-6">
          <AlertCircle className="h-6 w-6" />
          <div>
            <h3 className="font-bold">Acceptance of Terms</h3>
            <p className="text-sm">
              By using PedalPoint, you acknowledge that you have read and
              understood these Terms of Use and agree to be bound by them.
            </p>
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

export default TermsOfUse;

