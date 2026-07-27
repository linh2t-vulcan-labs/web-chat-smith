"use client";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@cs/ui/components/shadcn/alert";
import { AspectRatio } from "@cs/ui/components/shadcn/aspect-ratio";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@cs/ui/components/shadcn/avatar";
import { Badge } from "@cs/ui/components/shadcn/badge";
import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@cs/ui/components/shadcn/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@cs/ui/components/shadcn/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@cs/ui/components/shadcn/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@cs/ui/components/shadcn/item";
import { Kbd, KbdGroup } from "@cs/ui/components/shadcn/kbd";
import { Separator } from "@cs/ui/components/shadcn/separator";
import { Skeleton } from "@cs/ui/components/shadcn/skeleton";
import { Spinner } from "@cs/ui/components/shadcn/spinner";
import {
  BellIcon,
  CheckIcon,
  DownloadIcon,
  HomeIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";

import { people } from "./shared/data";
import { ShadcnGrid, ShadcnPanel, ShadcnSection } from "./shared/section";

export const ShadcnFoundations = () => (
  <ShadcnSection
    title="Foundations"
    description="Static and low-risk primitives: buttons, badges, alerts, cards, avatars, empty states, skeletons, and keyboard hints."
  >
    <ShadcnGrid>
      <ShadcnPanel title="Button variants and sizes">
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button size="icon" aria-label="Settings">
            <SettingsIcon />
          </Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon-xs" aria-label="Search">
            <SearchIcon />
          </Button>
          <Button size="icon-lg" aria-label="Download">
            <DownloadIcon />
          </Button>
        </div>
      </ShadcnPanel>

      <ShadcnPanel title="Button group">
        <ButtonGroup>
          <Button variant="outline">Back</Button>
          <ButtonGroupSeparator />
          <ButtonGroupText>Page 2</ButtonGroupText>
          <ButtonGroupSeparator />
          <Button variant="outline">Next</Button>
        </ButtonGroup>
      </ShadcnPanel>

      <ShadcnPanel title="Badges and keyboard">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Blocked</Badge>
        </div>
        <KbdGroup className="mt-4">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </ShadcnPanel>

      <ShadcnPanel title="Alert states">
        <div className="space-y-3">
          <Alert>
            <CheckIcon />
            <AlertTitle>Ready for review</AlertTitle>
            <AlertDescription>
              Layout, color, and icon alignment should stay stable.
            </AlertDescription>
            <AlertAction>
              <Button size="sm" variant="outline">
                Open
              </Button>
            </AlertAction>
          </Alert>
          <Alert variant="destructive">
            <BellIcon />
            <AlertTitle>Attention required</AlertTitle>
            <AlertDescription>
              Destructive copy wraps without pushing the action outside.
            </AlertDescription>
          </Alert>
        </div>
      </ShadcnPanel>

      <ShadcnPanel title="Avatar group">
        <AvatarGroup>
          {people.map((person) => (
            <Avatar key={person.name}>
              <AvatarFallback>{person.fallback}</AvatarFallback>
              <AvatarBadge />
            </Avatar>
          ))}
          <AvatarGroupCount>+8</AvatarGroupCount>
        </AvatarGroup>
      </ShadcnPanel>

      <ShadcnPanel title="Card composition">
        <Card>
          <CardHeader>
            <CardTitle>Usage card</CardTitle>
            <CardDescription>Header, action, content, footer.</CardDescription>
            <CardAction>
              <Badge variant="outline">Live</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">82%</div>
            <p className="text-sm text-muted-foreground">
              Responsive text should remain readable in narrow columns.
            </p>
          </CardContent>
          <CardFooter>
            <Button size="sm" variant="outline">
              Details
            </Button>
          </CardFooter>
        </Card>
      </ShadcnPanel>

      <ShadcnPanel title="Item list">
        <ItemGroup>
          {people.map((person) => (
            <Item key={person.name}>
              <ItemHeader>
                <ItemMedia variant="icon">
                  <UserIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{person.name}</ItemTitle>
                  <ItemDescription>{person.role}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </ItemActions>
              </ItemHeader>
              <ItemFooter>Last active today</ItemFooter>
            </Item>
          ))}
          <ItemSeparator />
        </ItemGroup>
      </ShadcnPanel>

      <ShadcnPanel title="Empty state">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SparklesIcon />
            </EmptyMedia>
            <EmptyTitle>No drafts yet</EmptyTitle>
            <EmptyDescription>
              The empty state should stay centered and compact.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm">Create draft</Button>
          </EmptyContent>
        </Empty>
      </ShadcnPanel>

      <ShadcnPanel title="Aspect ratio, skeleton, spinner">
        <AspectRatio
          ratio={16 / 9}
          className="overflow-hidden rounded-lg bg-muted"
        >
          <div className="flex size-full items-center justify-center gap-2 text-muted-foreground">
            <HomeIcon className="size-5" />
            16:9 preview
          </div>
        </AspectRatio>
        <Separator className="my-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <Spinner className="size-4" />
          Loading state
        </div>
      </ShadcnPanel>
    </ShadcnGrid>
  </ShadcnSection>
);
