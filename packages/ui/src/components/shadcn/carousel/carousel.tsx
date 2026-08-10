"use client";

import useEmblaCarousel from "embla-carousel-react";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";

import { Button } from "#components/shadcn/button";
import { cn } from "#lib/utils";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

interface CarouselProps {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

const getFalseSnapshot = () => false;

const useCarousel = () => {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
};

/** Subscribes to the embla `api`'s scroll-position events, re-rendering on `reInit`/`select`. */
const useCarouselScrollSubscription =
  (api: ReturnType<typeof useEmblaCarousel>[1]) =>
  (onStoreChange: () => void) => {
    if (!api) {
      return () => {
        // no-op
      };
    }
    api.on("reInit", onStoreChange);
    api.on("select", onStoreChange);
    return () => {
      api.off("select", onStoreChange);
      api.off("reInit", onStoreChange);
    };
  };

/** Whether the carousel can currently scroll prev/next, kept in sync with the embla `api`. */
const useCarouselScrollability = (
  api: ReturnType<typeof useEmblaCarousel>[1]
) => {
  const subscribe = useCarouselScrollSubscription(api);
  const canScrollPrev = React.useSyncExternalStore(
    subscribe,
    () => api?.canScrollPrev() ?? false,
    getFalseSnapshot
  );
  const canScrollNext = React.useSyncExternalStore(
    subscribe,
    () => api?.canScrollNext() ?? false,
    getFalseSnapshot
  );

  return { canScrollNext, canScrollPrev };
};

/** Notifies `setApi` the first time the embla `api` instance becomes available. */
const useNotifyCarouselApi = (
  api: CarouselApi,
  setApi: ((api: CarouselApi) => void) | undefined
) => {
  const notifiedApiRef = React.useRef<CarouselApi | null>(null);

  React.useEffect(() => {
    if (!(api && setApi) || notifiedApiRef.current === api) {
      return;
    }
    notifiedApiRef.current = api;
    // embla-carousel-react only creates the api instance asynchronously
    // (internal effect after the viewport ref mounts), so handing it to
    // setApi at the same lifecycle point requires an effect; the ref latch
    // guard above keeps this a one-time notification, not a per-render sync.
    // oxlint-disable-next-line react-doctor/no-pass-data-to-parent, react-doctor/no-pass-live-state-to-parent
    setApi(api);
  }, [api, setApi]);
};

/** The carousel's effective orientation — the explicit `orientation` prop, falling back to the axis embla was configured with. */
const resolveCarouselOrientation = (
  orientation: CarouselProps["orientation"],
  opts: CarouselOptions
): NonNullable<CarouselProps["orientation"]> =>
  orientation || (opts?.axis === "y" ? "vertical" : "horizontal");

const Carousel = ({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) => {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  );
  const { canScrollNext, canScrollPrev } = useCarouselScrollability(api);

  const scrollPrev = () => {
    api?.scrollPrev();
  };

  const scrollNext = () => {
    api?.scrollNext();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollNext();
    }
  };

  useNotifyCarouselApi(api, setApi);

  const contextValue: CarouselContextProps = {
    api,
    canScrollNext,
    canScrollPrev,
    carouselRef,
    opts,
    orientation: resolveCarouselOrientation(orientation, opts),
    scrollNext,
    scrollPrev,
  };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <CarouselContext value={contextValue}>
      <section
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </section>
    </CarouselContext>
  );
};

const CarouselContent = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ms-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
};

const CarouselItem = ({
  className,
  ...props
}: React.ComponentProps<"fieldset">) => {
  const { orientation } = useCarousel();

  return (
    <fieldset
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "ps-4" : "pt-4",
        className
      )}
      {...props}
    />
  );
};

const CarouselPrevious = ({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "inset-y-0 -inset-s-12 my-auto"
          : "inset-s-1/2 -top-12 -translate-x-1/2 rotate-90 rtl:translate-x-1/2",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeftIcon className="rtl:rotate-180" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
};

const CarouselNext = ({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "inset-y-0 -inset-e-12 my-auto"
          : "inset-s-1/2 -bottom-12 -translate-x-1/2 rotate-90 rtl:translate-x-1/2",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRightIcon className="rtl:rotate-180" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
};

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
};
