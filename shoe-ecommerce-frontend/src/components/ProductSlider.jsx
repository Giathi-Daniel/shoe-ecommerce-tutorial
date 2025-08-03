import React, { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import ProductCard from "../components/ProductCard";

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

const ProductSlider = ({ products }) => {
  const sliderRef = useRef(null);

  const sliderSettings = {
    dots: false, 
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    nextArrow: (
      <button 
        className="p-2 text-gray-700 bg-white border-2 border-gray-300 rounded-full shadow-lg slick-next-arrow hover:bg-gray-200"
        onClick={() => sliderRef.current.slickNext()} 
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
    ),
    prevArrow: (
      <button 
        className="p-2 text-gray-700 bg-white border-2 border-gray-300 rounded-full shadow-lg slick-prev-arrow hover:bg-gray-200"
        onClick={() => sliderRef.current.slickPrev()} 
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
    ),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const cleanSliderProps = (props) => {
    const cleanedProps = { ...props };
    delete cleanedProps.currentSlide;
    delete cleanedProps.slideCount;
    return cleanedProps;
  };

  return (
    <div className="relative mt-10">
      <h2 className="mb-4 text-2xl font-semibold">More Products</h2>

      {/* Buttons Container - Positioned just below the h2 */}
      <div className="flex justify-between w-full px-4 mb-4">
        <button
          onClick={() => sliderRef.current.slickPrev()} // Trigger previous slide on click
          className="p-2 text-gray-700 bg-white border-2 border-gray-300 rounded-full shadow-lg slick-prev-arrow hover:bg-gray-200"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => sliderRef.current.slickNext()} // Trigger next slide on click
          className="p-2 text-gray-700 bg-white border-2 border-gray-300 rounded-full shadow-lg slick-next-arrow hover:bg-gray-200"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
      
      {/* Slider */}
      <Slider ref={sliderRef} {...cleanSliderProps(sliderSettings)}>
        {products.map((product, idx) => (
          <div key={`${product._id}-${idx}`} className="px-2">
            <ProductCard product={product} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ProductSlider;