import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useState, useRef, useId } from "react";
import { type Project } from "../sections/Carousel3D";

interface SlideProps {
  slide: Project;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
}

const Slide = ({ slide, index, current, handleSlideClick }: SlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null);

  const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.opacity = "1";
  };

  const { img, name, tags } = slide;
  const isActive = current === index;

  return (
    <div 
      className="[perspective:1200px] [transform-style:preserve-3d] absolute top-0 w-full h-full flex items-center justify-center"
      style={{ left: `${index * 105}%` }}
    >
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative opacity-100 transition-all duration-300 ease-in-out w-[70vw] h-[75vw] md:w-[42vw] md:h-[46vw] z-10"
        onClick={() => handleSlideClick(index)}
        style={{
          transform:
            !isActive
              ? "scale(0.98) rotateX(8deg)"
              : "scale(1) rotateX(0deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full rounded-[18px] overflow-hidden transition-all duration-700 ease-out bg-[#020611]"
          style={{
            border: '2px solid rgba(6,207,214,0.4)',
            boxShadow: isActive
                  ? '0 0 42px 12px rgba(6,207,214,0.4), inset 0 0 20px rgba(6,207,214,0.2)'
                  : '0 12px 34px rgba(0,0,0,0.55)'
          }}
        >
          <img
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-600 ease-in-out"
            alt={name}
            src={img}
            onLoad={imageLoaded}
            loading="eager"
            draggable={false}
          />
          
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,10,44,0.97)_0%,rgba(2,10,44,0.48)_52%,transparent_100%)] flex flex-col justify-end p-5 pointer-events-none">
            <h3
              className={`font-sansation font-bold text-[1.2rem] m-0 mb-2 transition-colors duration-700 ease-in-out leading-[1.2] text-left ${isActive ? 'text-[#06CFD6]' : 'text-white'}`}
            >
              {name}
            </h3>

            {tags && tags.length > 0 && (
              <div className="flex gap-2 mt-[7px] flex-wrap">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="font-inter text-[0.75rem] text-[#06CFD6] border border-[#06CFD6]/40 rounded-md px-2 py-[3px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <img
            src="/vectors/designs/elemento_esquina_inferior_izquierda_de_portafolio.svg"
            alt=""
            className="absolute bottom-0 right-0 w-[110px] h-auto pointer-events-none"
          />
          <img
            src="/vectors/designs/elemento_logo.svg"
            alt=""
            className="absolute bottom-3 right-3 w-6 h-auto pointer-events-none"
          />
        </div>
      </li>
    </div>
  );
};

interface CarouselControlProps {
  type: string;
  title: string;
  handleClick: () => void;
}

const CarouselControl = ({
  type,
  title,
  handleClick,
}: CarouselControlProps) => {
  return (
    <button
      className={`w-12 h-12 flex items-center mx-2 justify-center bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-full focus:outline-none active:translate-y-0.5 transition duration-200 pointer-events-auto z-50 lg:hover:-translate-y-0.5 ${
        type === "previous" ? "rotate-180" : ""
      }`}
      title={title}
      onClick={handleClick}
    >
      <IconArrowNarrowRight className="text-white" />
    </button>
  );
};

interface CarouselProps {
  slides: Project[];
}

export default function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(0);

  const handlePreviousClick = () => setCurrent(prev => prev - 1);
  const handleNextClick = () => setCurrent(prev => prev + 1);

  const handleSlideClick = (index: number) => {
    if (current !== index) setCurrent(index);
  };

  const id = useId();

  const visibleIndices = [current - 2, current - 1, current, current + 1, current + 2];

  const getSlide = (idx: number) => {
    const len = slides.length;
    const normalized = ((idx % len) + len) % len;
    return slides[normalized];
  };

  return (
    <div
      className="relative w-[80vw] h-[75vw] md:w-[50vw] md:h-[46vw] mx-auto"
      aria-labelledby={`carousel-heading-${id}`}
    >
      <ul
        className="absolute w-full h-full transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(-${current * 105}%)`,
        }}
      >
        {visibleIndices.map(idx => (
          <Slide
            key={idx}
            slide={getSlide(idx)}
            index={idx}
            current={current}
            handleSlideClick={handleSlideClick}
          />
        ))}
      </ul>

      <div className="absolute flex justify-center w-full top-[calc(100%+2rem)] z-50">
        <CarouselControl
          type="previous"
          title="Go to previous slide"
          handleClick={handlePreviousClick}
        />

        <CarouselControl
          type="next"
          title="Go to next slide"
          handleClick={handleNextClick}
        />
      </div>
    </div>
  );
}
