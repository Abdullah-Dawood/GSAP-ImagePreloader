import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import Image1 from "./assets/optimized/image1.jpg";
import Image2 from "./assets/optimized/image2.jpg";
import Image3 from "./assets/optimized/image3.jpg";
import Image4 from "./assets/optimized/image4.jpg";
import Image5 from "./assets/optimized/image5.jpg";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

const imagesToLoad = [Image1, Image2, Image3, Image4, Image5];

function preloadImages(srcs: string[]) {
  return Promise.all(
    srcs.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;

          if (img.decode) {
            img.decode().then(resolve).catch(resolve);
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        })
    )
  );
}

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [assetsReady, setAssetsReady] = useState(false);

  const [percentageCountDown, setPercentageCountDown] = useState("000");

  useEffect(() => {
    preloadImages(imagesToLoad).then(() => {
      setAssetsReady(true);
    });
  }, []);

  useGSAP(
    () => {
      if (!assetsReady) return;

      const images = gsap.utils.toArray<HTMLImageElement>(
        containerRef.current?.querySelectorAll("img") || []
      );

      gsap.set(images, {
        scale: 0,
        rotation: 0,
        visibility: "hidden",
        force3D: true,
      });

      let frameId = 0;
      let tl: gsap.core.Timeline | undefined;

      frameId = requestAnimationFrame(() => {
        frameId = requestAnimationFrame(() => {
          tl = gsap.timeline();

          images.forEach((image, index) => {
            const rotationVal = gsap.utils.random(-8, 8, 1);

            tl?.set(image, { visibility: "visible" }, index * 0.2);
            tl?.to(
              image,
              {
                scale: 1,
                duration: 0.4,
                ease: "power1.out",
                rotation: rotationVal,
                force3D: true,
              },
              index * 0.25
            );
          });
        });
      });

      return () => {
        cancelAnimationFrame(frameId);
        tl?.kill();
      };
    },
    { dependencies: [assetsReady], scope: containerRef }
  );

  useGSAP(
    () => {
      if (!assetsReady) return;

      const counter = { value: 0 };

      const updateText = () => {
        const roundedValue = Math.round(counter.value);
        const formattedValue = roundedValue.toString().padStart(3, "0");

        setPercentageCountDown(formattedValue);
      };

      const percentageTimeline = gsap.timeline();

      percentageTimeline.to(counter, {
        keyframes: [
          { value: 20, duration: 0.6, ease: "power2.in" },
          { value: 90, duration: 0.7, ease: "power1.inOut" },
          { value: 100, duration: 0.8, ease: "power3.out" },
        ],
        onUpdate: updateText,
      });

      return () => percentageTimeline.kill();
    },
    { dependencies: [assetsReady], scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="bg-[#ede4dd] h-screen w-screen flex items-center justify-center"
    >
      {assetsReady && (
        <div className="fixed inset-0 flex items-center justify-center img-container">
          {imagesToLoad.map((src, index) => (
            <img
              key={index}
              src={src}
              alt=""
              width="256"
              height="320"
              decoding="async"
            />
          ))}
        </div>
      )}

      <p className="fixed top-[32%] right-[38%] text-3xl  text-[#ff0001] header-txt">
        {percentageCountDown}
      </p>
    </div>
  );
}

export default App;
