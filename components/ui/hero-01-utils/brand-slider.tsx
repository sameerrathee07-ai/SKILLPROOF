"use client";

import { Marquee } from "@/components/ui/hero-01-utils/marquee";
import { motion } from "motion/react";

export interface BrandList {
  image: string;
  name: string;
  lightimg: string;
}

function BrandSlider({ brandList }: { brandList: BrandList[] }) {
  return (
    <section>
      <div className="py-6 md:py-10">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div 
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col gap-3"
          >
            <div className="flex justify-center text-center py-3 md:py-4 relative">
              <div className="flex items-center justify-center gap-4">
                <div className="hidden md:block h-px w-36 bg-gradient-to-l from-muted-foreground/30 to-transparent" />
                <p className="text-sm font-medium sm:px-2 px-6 text-muted-foreground text-center">
                  Integrated with modern developer and talent platforms
                </p>
                <div className="hidden md:block h-px w-36 bg-gradient-to-r from-muted-foreground/30 to-transparent" />
              </div>
            </div>
            {brandList && brandList.length > 0 && (
              <div className="py-4">
                <Marquee pauseOnHover className="[--duration:25s] p-0">
                  {brandList.map((brand, index) => (
                    <div key={index} className="flex items-center px-6">
                      <img
                        src={brand.image}
                        alt={brand.name}
                        className="h-8 max-w-[140px] object-contain dark:hidden opacity-75 hover:opacity-100 transition-opacity"
                      />
                      <img
                        src={brand.lightimg}
                        alt={brand.name}
                        className="hidden dark:block h-8 max-w-[140px] object-contain opacity-75 hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ))}
                </Marquee>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default BrandSlider;
