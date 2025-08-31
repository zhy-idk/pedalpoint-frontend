import { APIProvider, Map } from "@vis.gl/react-google-maps";

function Contact() {
  return (
    <>
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="mb-4 text-4xl font-bold">Contact Page</h1>
        <p className="text-lg text-gray-600">
          This page is under construction.
        </p>
        <div className="aspect-video w-150 overflow-hidden rounded-lg shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1928.1456985871694!2d120.9537944951819!3d14.86497557657469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397abe0d0352313%3A0x4c25d08d65ed952!2sSUPPER%2088%20BIKE%20SHOP!5e0!3m2!1sen!2sph!4v1756371556738!5m2!1sen!2sph"
            className="h-full w-full"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Supper 88 Bike Shop Location"
          />
        </div>
      </div>
    </>
  );
}
export default Contact;
