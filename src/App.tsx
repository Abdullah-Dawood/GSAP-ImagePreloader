import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import Image1 from "./assets/optimized/image1.jpg";
import Image2 from "./assets/optimized/image2.jpg";
import Image3 from "./assets/optimized/image3.jpg";
import Image4 from "./assets/optimized/image4.jpg";
import Image5 from "./assets/optimized/image5.jpg";

gsap.registerPlugin(useGSAP);

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

  return (
    <div
      ref={containerRef}
      className="bg-[#ede4dd] h-screen w-screen flex items-center justify-center"
    >
      {!assetsReady && (
        <div className="fixed inset-0 flex items-center justify-center">
          Loading...
        </div>
      )}

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
    </div>
  );
}

export default App;
