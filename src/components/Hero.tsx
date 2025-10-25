import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const heroSlides = [
  {
    id: 1,
    title: "Welcome to PedalPoint",
    subtitle: "Your Ultimate Bike Shop",
    description: "Discover premium bikes, expert repairs, and exceptional service. From mountain bikes to city cruisers, we've got everything you need for your cycling journey.",
    buttonText: "Shop Now",
    buttonLink: "/",
    backgroundImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: 2,
    title: "Expert Bike Repairs",
    subtitle: "Professional Service You Can Trust",
    description: "Our certified technicians provide comprehensive bike maintenance and repairs. Quick turnaround, quality parts, and competitive pricing guaranteed.",
    buttonText: "Book Repair",
    buttonLink: "/repair",
    backgroundImage: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: 3,
    title: "Build Your Dream Bike",
    subtitle: "Custom Bikes Made Perfect",
    description: "Create a personalized bike that matches your style and performance needs. Choose from premium components and expert assembly services.",
    buttonText: "Start Building",
    buttonLink: "/builder",
    backgroundImage: "https://bikepacking.com/wp-content/uploads/2014/07/bikes-troll-log-00.jpg"
  }
];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = heroSlides[currentSlide];

  return (
    <div className="relative min-h-100 overflow-hidden">
      {/* Background Images with Transition */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${slide.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="hero-overlay bg-opacity-40"></div>
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 hero min-h-100">
        <div className="hero-content text-neutral-content text-center">
          <div className="max-w-2xl">
            <h1 className="mb-5 text-3xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
              {currentSlideData.title}
            </h1>
            <h2 className="mb-4 text-lg md:text-xl lg:text-2xl font-semibold text-white/90 drop-shadow-md">
              {currentSlideData.subtitle}
            </h2>
            <p className="mb-8 text-sm md:text-base lg:text-lg text-white/80 leading-relaxed drop-shadow-md max-w-xl mx-auto">
              {currentSlideData.description}
            </p>
            <Link 
              to={currentSlideData.buttonLink} 
              className="btn btn-primary btn-lg hover:btn-accent transition-all duration-300 transform hover:scale-105"
            >
              {currentSlideData.buttonText}
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-linear"
          style={{
            width: `${((currentSlide + 1) / heroSlides.length) * 100}%`
          }}
        />
      </div>
    </div>
  );
}
export default Hero;