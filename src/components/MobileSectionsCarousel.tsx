import React from "react";
import useEmblaCarousel from "embla-carousel-react";

interface MobileSectionsCarouselProps {
  sections: Array<React.ReactNode>;
}

const MobileSectionsCarousel: React.FC<MobileSectionsCarouselProps> = ({ sections }) => {
  const [emblaRef] = useEmblaCarousel({ loop: false, align: "start", dragFree: true });

  return (
    <div className="block lg:hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {sections.map((node, idx) => (
            <div key={idx} className="min-w-0 flex-[0_0_100%] px-4">
              {node}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {/* Simple dots can be added later if needed; Embla requires plugin or state */}
      </div>
    </div>
  );
};

export default MobileSectionsCarousel;


