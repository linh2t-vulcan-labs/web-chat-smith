import Image from "next/image";
import React from "react";

import type { TTaskDetailProps } from "./types";

const TaskDetail: React.FC<TTaskDetailProps> = ({
  name,
  image,
  imageMobile,
  description,
}) => (
  <div className="thickness-thin md:thickness-none relative flex h-auto w-full max-w-[668px] flex-col overflow-hidden rounded-[40px] border-white/10 bg-contain bg-center bg-no-repeat md:h-[440px] md:flex-row md:rtl:flex-row-reverse">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <Image
      className="absolute inset-0 hidden md:block"
      src={image}
      alt={name}
      fill
    />
    <div className="gap-medium-3 p-medium-3 md:px-large-4 md:py-large-5 flex basis-1/2 flex-col">
      <h5 className="text-Heading-h4 text-white/75">{name}</h5>
      <div className="text-bodyM text-white/75">{description}</div>
    </div>
    <div className="relative md:basis-1/2">
      <div className="relative block aspect-342/240 w-full md:hidden">
        <Image className="object-cover" alt="feature" src={imageMobile} fill />
      </div>
    </div>
  </div>
);

export default TaskDetail;
