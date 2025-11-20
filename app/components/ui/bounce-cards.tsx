'use client';

import { useEffect, useCallback, useState, useRef, memo } from "react"
import Image from 'next/image'
import { gsap } from "gsap"
import { Modal } from "./Modal"

interface BounceCardsProps {
  className?: string
  images?: string[]
  containerWidth?: number
  containerHeight?: number
  animationDelay?: number
  animationStagger?: number
  easeType?: string
  transformStyles?: string[]
}

const BounceCardsComponent = ({
  className = "",
  images = [],
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = "elastic.out(1, 0.8)",
  transformStyles = [
    "rotate(10deg) translate(-170px)",
    "rotate(5deg) translate(-85px)",
    "rotate(-3deg)",
    "rotate(-10deg) translate(85px)",
    "rotate(2deg) translate(170px)"
  ]
}: BounceCardsProps) => {
  const [validImages, setValidImages] = useState<string[]>(images);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    setValidImages(images);
  }, [images]);

  useEffect(() => {
    // Only animate once when component first mounts with images
    if (validImages.length > 0 && !hasAnimated.current) {
      hasAnimated.current = true;
      gsap.fromTo(
        ".card",
        {
          opacity: 0,
          scale: 0.5,
          y: 50
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: easeType,
          delay: animationDelay,
          stagger: animationStagger
        }
      );
    }
  }, [validImages, animationDelay, animationStagger, easeType]);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.1,
      zIndex: 10,
      duration: 0.3,
      ease: "power2.out"
    });
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      zIndex: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  }, []);

  const handleImageError = useCallback((failedImageSrc: string) => {
    setValidImages(current => current.filter(src => src !== failedImageSrc));
  }, []);

  const handleImageClick = useCallback((src: string) => {
    setSelectedImage(src);
  }, []);

  return (
    <>
      <div
        className={`relative ${className}`}
        style={{
          width: containerWidth,
          height: containerHeight
        }}
      >
        {validImages.map((src, idx) => (
          <div
            key={src}
            className="card absolute w-[120px] aspect-square rounded-[18px] overflow-hidden border-1 border-white/90 shadow-lg shadow-black/20 cursor-pointer transition-shadow duration-300 hover:shadow-xl hover:shadow-black/30"
            style={{
              transform: transformStyles[idx] !== undefined ? transformStyles[idx] : "none",
              zIndex: 1
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleImageClick(src)}
          >
            <Image
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              src={src}
              alt={`card-${idx}`}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              onError={() => handleImageError(src)}
            />
          </div>
        ))}
      </div>
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      >
        {selectedImage && (
          <div className="relative w-full h-[85vh]">
            <Image
              src={selectedImage}
              alt="Selected"
              fill
              className="object-contain rounded-lg"
              sizes="100vw"
            />
          </div>
        )}
      </Modal>
    </>
  )
}

export const BounceCards = memo(BounceCardsComponent);
