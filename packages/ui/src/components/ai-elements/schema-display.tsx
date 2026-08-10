"use client";

import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps, HTMLAttributes } from "react";
import { createContext, useContext } from "react";

import { Badge } from "#components/shadcn/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#components/shadcn/collapsible";
import { cn } from "#lib/utils";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface SchemaParameter {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  location?: "path" | "query" | "header";
}

interface SchemaProperty {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  properties?: SchemaProperty[];
  items?: SchemaProperty;
}

interface SchemaDisplayContextType {
  method: HttpMethod;
  path: string;
  description?: string;
  parameters?: SchemaParameter[];
  requestBody?: SchemaProperty[];
  responseBody?: SchemaProperty[];
}

const SchemaDisplayContext = createContext<SchemaDisplayContextType>({
  method: "GET",
  path: "",
});

const methodStyles: Record<HttpMethod, string> = {
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  GET: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PATCH:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  POST: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PUT: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export type SchemaDisplayHeaderProps = HTMLAttributes<HTMLDivElement>;

export const SchemaDisplayHeader = ({
  className,
  children,
  ...props
}: SchemaDisplayHeaderProps) => (
  <div
    className={cn("flex items-center gap-3 border-b px-4 py-3", className)}
    {...props}
  >
    {children}
  </div>
);

export type SchemaDisplayMethodProps = ComponentProps<typeof Badge>;

export const SchemaDisplayMethod = ({
  className,
  children,
  ...props
}: SchemaDisplayMethodProps) => {
  const { method } = useContext(SchemaDisplayContext);

  return (
    <Badge
      className={cn("font-mono text-xs", methodStyles[method], className)}
      variant="secondary"
      {...props}
    >
      {children ?? method}
    </Badge>
  );
};

export type SchemaDisplayPathProps = HTMLAttributes<HTMLSpanElement>;

export const SchemaDisplayPath = ({
  className,
  children,
  ...props
}: SchemaDisplayPathProps) => {
  const { path } = useContext(SchemaDisplayContext);

  // Highlight path parameters
  const highlightedPath = path.replaceAll(
    /\{(?<param>[^}]+)\}/gu,
    '<span class="text-blue-600 dark:text-blue-400">{$<param>}</span>'
  );

  return (
    <span
      className={cn("font-mono text-sm", className)}
      // oxlint-disable-next-line react/no-danger -- path parameters are highlighted via trusted, locally-generated markup, not user input
      dangerouslySetInnerHTML={{ __html: children ?? highlightedPath }}
      {...props}
    />
  );
};

export type SchemaDisplayDescriptionProps =
  HTMLAttributes<HTMLParagraphElement>;

export const SchemaDisplayDescription = ({
  className,
  children,
  ...props
}: SchemaDisplayDescriptionProps) => {
  const { description } = useContext(SchemaDisplayContext);

  return (
    <p
      className={cn(
        "text-muted-foreground border-b px-4 py-3 text-sm",
        className
      )}
      {...props}
    >
      {children ?? description}
    </p>
  );
};

export type SchemaDisplayContentProps = HTMLAttributes<HTMLDivElement>;

export const SchemaDisplayContent = ({
  className,
  children,
  ...props
}: SchemaDisplayContentProps) => (
  <div className={cn("divide-y", className)} {...props}>
    {children}
  </div>
);

const RequiredBadge = () => (
  <Badge
    className="bg-red-100 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400"
    variant="secondary"
  >
    required
  </Badge>
);

export type SchemaDisplayParameterProps = HTMLAttributes<HTMLDivElement> &
  SchemaParameter;

export const SchemaDisplayParameter = ({
  name,
  type,
  required,
  description,
  location,
  className,
  ...props
}: SchemaDisplayParameterProps) => (
  <div className={cn("px-4 py-3 pl-10", className)} {...props}>
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">{name}</span>
      <Badge className="text-xs" variant="outline">
        {type}
      </Badge>
      {location && (
        <Badge className="text-xs" variant="secondary">
          {location}
        </Badge>
      )}
      {required && <RequiredBadge />}
    </div>
    {description && (
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    )}
  </div>
);

export type SchemaDisplayParametersProps = ComponentProps<typeof Collapsible>;

export const SchemaDisplayParameters = ({
  className,
  children,
  ...props
}: SchemaDisplayParametersProps) => {
  const { parameters = [] } = useContext(SchemaDisplayContext);

  if (!children && parameters.length === 0) {
    return null;
  }

  return (
    <Collapsible className={cn(className)} defaultOpen {...props}>
      <CollapsibleTrigger className="group hover:bg-muted/50 flex w-full items-center gap-2 px-4 py-3 text-left transition-colors">
        <ChevronRightIcon className="text-muted-foreground size-4 shrink-0 transition-transform group-data-open:rotate-90" />
        <span className="text-sm font-medium">Parameters</span>
        <Badge className="ml-auto text-xs" variant="secondary">
          {parameters.length}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="divide-y border-t">
          {children ??
            parameters.map((param) => (
              <SchemaDisplayParameter key={param.name} {...param} />
            ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export type SchemaDisplayPropertyProps = HTMLAttributes<HTMLDivElement> &
  SchemaProperty & {
    depth?: number;
  };

const PropertyTypeBadge = ({
  type,
  required,
}: Pick<SchemaProperty, "type" | "required">) => (
  <>
    <Badge className="text-xs" variant="outline">
      {type}
    </Badge>
    {required && <RequiredBadge />}
  </>
);

type SchemaDisplayPropertyGroupProps = SchemaDisplayPropertyProps & {
  depth: number;
  paddingLeft: number;
};

const SchemaDisplayPropertyGroup = ({
  name,
  type,
  required,
  description,
  properties,
  items,
  depth,
  paddingLeft,
  className,
}: SchemaDisplayPropertyGroupProps) => (
  <Collapsible defaultOpen={depth < 2}>
    <CollapsibleTrigger
      className={cn(
        "group hover:bg-muted/50 flex w-full items-center gap-2 py-3 text-left transition-colors",
        className
      )}
      style={{ paddingLeft }}
    >
      <ChevronRightIcon className="text-muted-foreground size-4 shrink-0 transition-transform group-data-open:rotate-90" />
      <span className="font-mono text-sm">{name}</span>
      <PropertyTypeBadge required={required} type={type} />
    </CollapsibleTrigger>
    {description && (
      <p
        className="text-muted-foreground pb-2 text-sm"
        style={{ paddingLeft: paddingLeft + 24 }}
      >
        {description}
      </p>
    )}
    <CollapsibleContent>
      <div className="divide-y border-t">
        {properties?.map((prop) => (
          // oxlint-disable-next-line no-use-before-define -- SchemaDisplayProperty and SchemaDisplayPropertyGroup are mutually recursive
          <SchemaDisplayProperty key={prop.name} {...prop} depth={depth + 1} />
        ))}
        {items && (
          // oxlint-disable-next-line no-use-before-define -- SchemaDisplayProperty and SchemaDisplayPropertyGroup are mutually recursive
          <SchemaDisplayProperty
            {...items}
            depth={depth + 1}
            name={`${name}[]`}
          />
        )}
      </div>
    </CollapsibleContent>
  </Collapsible>
);

type SchemaDisplayPropertyLeafProps = HTMLAttributes<HTMLDivElement> &
  Pick<SchemaProperty, "name" | "type" | "required" | "description"> & {
    paddingLeft: number;
  };

const SchemaDisplayPropertyLeaf = ({
  name,
  type,
  required,
  description,
  paddingLeft,
  className,
  ...props
}: SchemaDisplayPropertyLeafProps) => (
  <div
    className={cn("py-3 pr-4", className)}
    style={{ paddingLeft }}
    {...props}
  >
    <div className="flex items-center gap-2">
      {/* Spacer for alignment */}
      <span className="size-4" />
      <span className="font-mono text-sm">{name}</span>
      <PropertyTypeBadge required={required} type={type} />
    </div>
    {description && (
      <p className="text-muted-foreground mt-1 pl-6 text-sm">{description}</p>
    )}
  </div>
);

export const SchemaDisplayProperty = ({
  depth = 0,
  ...props
}: SchemaDisplayPropertyProps) => {
  const { properties, items } = props;
  const paddingLeft = 40 + depth * 16;

  if (properties || items) {
    return (
      <SchemaDisplayPropertyGroup
        {...props}
        depth={depth}
        paddingLeft={paddingLeft}
      />
    );
  }

  return <SchemaDisplayPropertyLeaf {...props} paddingLeft={paddingLeft} />;
};

type SchemaDisplayBodySectionProps = ComponentProps<typeof Collapsible> & {
  title: string;
  properties?: SchemaProperty[];
};

const EMPTY_PROPERTIES: SchemaProperty[] = [];

const SchemaDisplayBodySection = ({
  title,
  properties = EMPTY_PROPERTIES,
  className,
  children,
  ...props
}: SchemaDisplayBodySectionProps) => {
  if (!children && properties.length === 0) {
    return null;
  }

  return (
    <Collapsible className={cn(className)} defaultOpen {...props}>
      <CollapsibleTrigger className="group hover:bg-muted/50 flex w-full items-center gap-2 px-4 py-3 text-left transition-colors">
        <ChevronRightIcon className="text-muted-foreground size-4 shrink-0 transition-transform group-data-open:rotate-90" />
        <span className="text-sm font-medium">{title}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t">
          {children ??
            properties.map((prop) => (
              <SchemaDisplayProperty key={prop.name} {...prop} depth={0} />
            ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export type SchemaDisplayRequestProps = ComponentProps<typeof Collapsible>;

export const SchemaDisplayRequest = ({
  children,
  ...props
}: SchemaDisplayRequestProps) => {
  const { requestBody } = useContext(SchemaDisplayContext);

  return (
    <SchemaDisplayBodySection
      properties={requestBody}
      title="Request Body"
      {...props}
    >
      {children}
    </SchemaDisplayBodySection>
  );
};

export type SchemaDisplayResponseProps = ComponentProps<typeof Collapsible>;

export const SchemaDisplayResponse = ({
  children,
  ...props
}: SchemaDisplayResponseProps) => {
  const { responseBody } = useContext(SchemaDisplayContext);

  return (
    <SchemaDisplayBodySection
      properties={responseBody}
      title="Response"
      {...props}
    >
      {children}
    </SchemaDisplayBodySection>
  );
};

const SchemaDisplayDefaultBody = () => {
  const { description } = useContext(SchemaDisplayContext);

  return (
    <>
      <SchemaDisplayHeader>
        <div className="flex items-center gap-3">
          <SchemaDisplayMethod />
          <SchemaDisplayPath />
        </div>
      </SchemaDisplayHeader>
      {description && <SchemaDisplayDescription />}
      <SchemaDisplayContent>
        <SchemaDisplayParameters />
        <SchemaDisplayRequest />
        <SchemaDisplayResponse />
      </SchemaDisplayContent>
    </>
  );
};

export type SchemaDisplayProps = HTMLAttributes<HTMLDivElement> & {
  method: HttpMethod;
  path: string;
  description?: string;
  parameters?: SchemaParameter[];
  requestBody?: SchemaProperty[];
  responseBody?: SchemaProperty[];
};

export const SchemaDisplay = ({
  method,
  path,
  description,
  parameters,
  requestBody,
  responseBody,
  className,
  children,
  ...props
}: SchemaDisplayProps) => {
  const contextValue = {
    description,
    method,
    parameters,
    path,
    requestBody,
    responseBody,
  };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <SchemaDisplayContext.Provider value={contextValue}>
      <div
        className={cn(
          "bg-background overflow-hidden rounded-lg border",
          className
        )}
        {...props}
      >
        {children ?? <SchemaDisplayDefaultBody />}
      </div>
    </SchemaDisplayContext.Provider>
  );
};

export type SchemaDisplayBodyProps = HTMLAttributes<HTMLDivElement>;

export const SchemaDisplayBody = ({
  className,
  children,
  ...props
}: SchemaDisplayBodyProps) => (
  <div className={cn("divide-y", className)} {...props}>
    {children}
  </div>
);

export type SchemaDisplayExampleProps = HTMLAttributes<HTMLPreElement>;

export const SchemaDisplayExample = ({
  className,
  children,
  ...props
}: SchemaDisplayExampleProps) => (
  <pre
    className={cn(
      "bg-muted mx-4 mb-4 overflow-auto rounded-md p-4 font-mono text-sm",
      className
    )}
    {...props}
  >
    {children}
  </pre>
);
