"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@cs/ui/components/shadcn/carousel";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@cs/ui/components/shadcn/chart";
import type { ChartConfig } from "@cs/ui/components/shadcn/chart";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@cs/ui/components/shadcn/resizable";
import { ScrollArea, ScrollBar } from "@cs/ui/components/shadcn/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@cs/ui/components/shadcn/table";
// oxlint-disable-next-line react-doctor/prefer-dynamic-import
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { chartData, rows } from "./shared/data";
import { ShadcnGrid, ShadcnPanel, ShadcnSection } from "./shared/section";

const chartConfig = {
  desktop: {
    color: "var(--chart-1)",
    label: "Desktop",
  },
  mobile: {
    color: "var(--chart-2)",
    label: "Mobile",
  },
} satisfies ChartConfig;

export const ShadcnDataDisplay = () => (
  <ShadcnSection
    title="Data Display"
    description="Tables, charts, scroll areas, and resizable panels for dense UI checks."
  >
    <ShadcnGrid className="xl:grid-cols-2">
      <ShadcnPanel title="Table">
        <Table>
          <TableCaption>
            Invoice states across common content widths.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-end">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell>{row.owner}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell className="text-end">{row.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-end">$457.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </ShadcnPanel>

      <ShadcnPanel title="Chart">
        <ChartContainer config={chartConfig} className="min-h-64">
          <AreaChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="mobile"
              type="natural"
              fill="var(--color-mobile)"
              fillOpacity={0.35}
              stroke="var(--color-mobile)"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.25}
              stroke="var(--color-desktop)"
            />
          </AreaChart>
        </ChartContainer>
      </ShadcnPanel>

      <ShadcnPanel title="Scroll area">
        <ScrollArea className="h-48 rounded-lg border">
          <div className="min-w-[42rem] p-4">
            <div className="grid grid-cols-6 gap-3 text-sm">
              {Array.from({ length: 30 }).map((_, index) => (
                <div key={index} className="bg-muted/40 rounded-md border p-3">
                  Cell {index + 1}
                </div>
              ))}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </ShadcnPanel>

      <ShadcnPanel title="Resizable panels" className="overflow-hidden">
        <ResizablePanelGroup
          orientation="horizontal"
          className="h-56 min-h-0 rounded-lg border"
        >
          <ResizablePanel defaultSize={35} minSize={25}>
            <div className="flex h-full items-center justify-center p-4 text-sm">
              Sidebar
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={65}>
            <div className="flex h-full items-center justify-center p-4 text-sm">
              Content
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ShadcnPanel>

      <ShadcnPanel title="Carousel">
        <Carousel className="mx-auto w-full max-w-sm">
          <CarouselContent>
            {["Draft", "Review", "Publish"].map((item) => (
              <CarouselItem key={item}>
                <div className="bg-muted/40 flex h-40 items-center justify-center rounded-lg border text-sm font-medium">
                  {item}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="inset-s-2" />
          <CarouselNext className="inset-e-2" />
        </Carousel>
      </ShadcnPanel>
    </ShadcnGrid>
  </ShadcnSection>
);
