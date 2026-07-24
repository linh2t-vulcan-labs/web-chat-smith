import type { ReactNode } from "react";

import { Badge } from "@/components/badge";

interface TCardContentProps {
  title: string;
  image: ReactNode;
  isNew?: boolean;
  description: string;
}

const CardContent = ({
  image,
  title,
  isNew,
  description,
}: TCardContentProps) => (
  <>
    {image}
    <div className="p-small-1">
      <h4 className="gap-small-0.75 text-footnoteM-bold text-text-general-inverse inline-flex items-center">
        {title}{" "}
        {isNew && (
          <Badge
            className="px-0! text-[8px]! leading-3 font-semibold uppercase"
            type="default"
            containerClassName="py-0!"
            rounded="half"
            color="green"
          >
            NEW
          </Badge>
        )}
      </h4>
      <p className="text-footnoteS-neutral text-text-general-inverse">
        {description}
      </p>
    </div>
  </>
);

export default CardContent;
