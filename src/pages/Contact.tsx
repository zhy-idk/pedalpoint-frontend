import { MapPin, Phone, Mail, Clock } from "lucide-react";

function Contact() {
  return (
    <div className="bg-base-200 min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary text-primary-content py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-center text-3xl font-bold sm:text-4xl md:text-5xl">
            Get in Touch
          </h1>
          <p className="mx-auto max-w-2xl text-center text-base opacity-90 sm:text-lg">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4 text-2xl">
                  Contact Information
                </h2>

                {/* Address */}
                <div className="mb-4 flex items-start gap-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <MapPin className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Our Location</h3>
                    <p className="text-base-content/70">
                      SUPPER 88 BIKE SHOP
                      <br />
                      9074 J.P Rizal St, Poblacion, Pandi, 3014 Bulacan
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-4 flex items-start gap-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Phone className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Phone</h3>
                    <a
                      href="tel:+639123456789"
                      className="text-base-content/70 hover:text-primary transition-colors"
                    >
                      +63 912 345 6789
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="mb-4 flex items-start gap-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Mail className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Email</h3>
                    <a
                      href="mailto:pedal.point01@gmail.com"
                      className="text-base-content/70 hover:text-primary transition-colors"
                    >
                      pedal.point01@gmail.com
                    </a>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Clock className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Business Hours</h3>
                    <div className="text-base-content/70 space-y-1">
                      <p>Sunday - Saturday: 7:30 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="h-fit lg:sticky lg:top-4">
            <div className="card bg-base-100 overflow-hidden shadow-xl">
              <div className="card-body p-0">
                <div className="h-[400px] w-full sm:h-[500px] lg:h-[600px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1928.1456985871694!2d120.9537944951819!3d14.86497557657469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397abe0d0352313%3A0x4c25d08d65ed952!2sSUPPER%2088%20BIKE%20SHOP!5e0!3m2!1sen!2sph!4v1756371556738!5m2!1sen!2sph"
                    className="h-full w-full"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="PedalPoint - Supper 88 Bike Shop Location"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
