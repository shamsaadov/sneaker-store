import React from "react";
import useEmblaCarousel from "embla-carousel-react";

interface MobileCarouselProps {
  items: Array<React.ReactNode>;
}

const MobileCarousel: React.FC<MobileCarouselProps> = ({ items }) => {
  const [emblaRef] = useEmblaCarousel({ loop: false, align: "start", dragFree: true });

  return (
    <div className="block lg:hidden overflow-x-hidden py-2 bg-transparent">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex will-change-transform">
          {items.map((node, idx) => (
            <div key={idx} className="min-w-0 flex-[0_0_100%] px-3 py-2 flex justify-center">
              <div className="mc-slide-inner w-full max-w-[560px]">{node}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileCarousel;


