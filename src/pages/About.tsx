import { Bike, Wrench, Users, Heart, Award, Target, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";

function About() {
  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero Section */}
      <section className="hero bg-gradient-to-br from-primary/20 to-secondary/20 py-20">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6">About PedalPoint</h1>
            <p className="text-xl mb-8 text-base-content/80">
              Your trusted partner in cycling. We're passionate about helping riders find the perfect bike 
              and keeping them on the road with expert service and support.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-lg text-base-content/80">
                <p>
                  PedalPoint was founded with a simple mission: to make cycling accessible to everyone. 
                  What started as a small local bike shop has grown into a comprehensive cycling destination 
                  where riders of all levels can find everything they need.
                </p>
                <p>
                  We believe that every cyclist deserves quality equipment, expert advice, and reliable service. 
                  Whether you're commuting to work, exploring mountain trails, or competing in races, 
                  we're here to support your journey on two wheels.
                </p>
                <p>
                  Our team combines years of experience with genuine passion for cycling, ensuring that 
                  every customer receives personalized attention and the best products for their needs.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <div className="card bg-base-100 shadow-xl">
                  <figure className="px-10 pt-10">
                    <Bike className="w-32 h-32 text-primary" />
                  </figure>
                  <div className="card-body items-center text-center">
                    <h3 className="card-title">Passion for Cycling</h3>
                    <p>We live and breathe bicycles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 px-4 bg-base-100">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              These core principles guide everything we do at PedalPoint
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body items-center text-center">
                <Heart className="w-12 h-12 text-error mb-4" />
                <h3 className="card-title text-lg">Passion</h3>
                <p className="text-sm text-base-content/70">
                  We're passionate cyclists who understand your needs and share your enthusiasm for the sport.
                </p>
              </div>
            </div>
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body items-center text-center">
                <Award className="w-12 h-12 text-warning mb-4" />
                <h3 className="card-title text-lg">Quality</h3>
                <p className="text-sm text-base-content/70">
                  We source only the best products and maintain the highest standards in our service work.
                </p>
              </div>
            </div>
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body items-center text-center">
                <Users className="w-12 h-12 text-primary mb-4" />
                <h3 className="card-title text-lg">Community</h3>
                <p className="text-sm text-base-content/70">
                  We're committed to building a strong cycling community and supporting local riders.
                </p>
              </div>
            </div>
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body items-center text-center">
                <Shield className="w-12 h-12 text-success mb-4" />
                <h3 className="card-title text-lg">Integrity</h3>
                <p className="text-sm text-base-content/70">
                  Honest advice, fair pricing, and reliable service you can trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What We Offer</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Comprehensive cycling solutions for every rider
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <Bike className="w-10 h-10 text-primary mb-4" />
                <h3 className="card-title text-xl mb-3">Bike Sales</h3>
                <p className="text-base-content/70 mb-4">
                  From entry-level commuters to high-end racing machines, we carry a wide selection 
                  of quality bicycles for every type of rider.
                </p>
                <div className="card-actions">
                  <Link to="/builder" className="btn btn-primary btn-sm">
                    Build Your Bike
                  </Link>
                </div>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <Wrench className="w-10 h-10 text-secondary mb-4" />
                <h3 className="card-title text-xl mb-3">Expert Service</h3>
                <p className="text-base-content/70 mb-4">
                  Our certified mechanics provide professional bike maintenance, repairs, and tune-ups 
                  to keep your ride smooth and safe.
                </p>
                <div className="card-actions">
                  <Link to="/repair" className="btn btn-secondary btn-sm">
                    Schedule Service
                  </Link>
                </div>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <Target className="w-10 h-10 text-accent mb-4" />
                <h3 className="card-title text-xl mb-3">Custom Builds</h3>
                <p className="text-base-content/70 mb-4">
                  Use our Bike Builder tool to create your perfect ride, selecting every component 
                  to match your style and needs.
                </p>
                <div className="card-actions">
                  <Link to="/builder" className="btn btn-accent btn-sm">
                    Start Building
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-base-100">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose PedalPoint?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Expert Knowledge</h3>
                <p className="text-base-content/70">
                  Our team has years of experience and stays up-to-date with the latest cycling trends and technology.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Fast Service</h3>
                <p className="text-base-content/70">
                  We respect your time and work efficiently to get you back on the road as quickly as possible.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Personalized Service</h3>
                <p className="text-base-content/70">
                  Every customer gets individual attention and recommendations tailored to their specific needs.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-success" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Warranty & Support</h3>
                <p className="text-base-content/70">
                  We stand behind our products and services with comprehensive warranties and ongoing support.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-warning" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Community Focus</h3>
                <p className="text-base-content/70">
                  We're more than a shop - we're a hub for the local cycling community and group rides.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-info/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-info" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Wide Selection</h3>
                <p className="text-base-content/70">
                  From components to accessories, we carry everything you need for your cycling journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-2xl">
            <div className="card-body text-center">
              <h2 className="card-title justify-center text-3xl mb-4">Ready to Start Your Cycling Journey?</h2>
              <p className="text-lg mb-8 text-primary-content/90">
                Visit our shop, browse our online catalog, or get in touch with our team. 
                We're here to help you find the perfect ride.
              </p>
              <div className="card-actions justify-center gap-4">
                <Link to="/" className="btn btn-outline btn-lg text-primary-content border-primary-content hover:bg-primary-content hover:text-primary">
                  Browse Bikes
                </Link>
                <Link to="/contact" className="btn btn-lg bg-base-100 text-primary hover:bg-base-200">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;