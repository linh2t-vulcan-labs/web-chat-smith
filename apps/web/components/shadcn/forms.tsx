"use client";

import { IconCalendarBlank } from "@cs/icons/calendar-blank";
import { IconMail } from "@cs/icons/mail";
import { IconSearch } from "@cs/icons/search";
import { Calendar } from "@cs/ui/components/shadcn/calendar";
import { Checkbox } from "@cs/ui/components/shadcn/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@cs/ui/components/shadcn/combobox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@cs/ui/components/shadcn/field";
import { Input } from "@cs/ui/components/shadcn/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@cs/ui/components/shadcn/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@cs/ui/components/shadcn/input-otp";
import { Label } from "@cs/ui/components/shadcn/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@cs/ui/components/shadcn/native-select";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@cs/ui/components/shadcn/progress";
import {
  RadioGroup,
  RadioGroupItem,
} from "@cs/ui/components/shadcn/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@cs/ui/components/shadcn/select";
import { Slider } from "@cs/ui/components/shadcn/slider";
import { Switch } from "@cs/ui/components/shadcn/switch";
import { Textarea } from "@cs/ui/components/shadcn/textarea";
import {
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
} from "@cs/ui/components/shadcn/toggle";
import { TagIcon } from "lucide-react";
import * as React from "react";

import { frameworks } from "./shared/data";
import { ShadcnGrid, ShadcnPanel, ShadcnSection } from "./shared/section";

const frameworkLabels = frameworks.map((framework) => framework.label);

export const ShadcnForms = () => {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 5, 13)
  );

  return (
    <ShadcnSection
      title="Forms"
      description="Inputs, labels, fields, validation messaging, composite controls, and RTL-aware form layout."
    >
      <ShadcnGrid>
        <ShadcnPanel title="Input and label">
          <div className="grid gap-2">
            <Label htmlFor="example-email">Email</Label>
            <Input
              id="example-email"
              type="email"
              placeholder="name@company.com"
            />
          </div>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="example-message">Message</Label>
            <Textarea
              id="example-message"
              placeholder="Write a concise note..."
            />
          </div>
        </ShadcnPanel>

        <ShadcnPanel title="Field set">
          <FieldSet>
            <FieldLegend>Profile</FieldLegend>
            <FieldDescription>
              Field copy and errors should wrap without layout shifts.
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="display-name">Display name</FieldLabel>
                <Input id="display-name" defaultValue="ChatSmith Team" />
                <FieldDescription>
                  Visible to workspace members.
                </FieldDescription>
              </Field>
              <Field data-invalid>
                <FieldContent>
                  <FieldTitle>Workspace slug</FieldTitle>
                  <FieldDescription>
                    Use lowercase letters and dashes.
                  </FieldDescription>
                </FieldContent>
                <Input defaultValue="invalid slug" aria-invalid />
                <FieldError>Slug cannot contain spaces.</FieldError>
              </Field>
            </FieldGroup>
            <FieldSeparator>Optional</FieldSeparator>
          </FieldSet>
        </ShadcnPanel>

        <ShadcnPanel title="Input group">
          <div className="space-y-3">
            <InputGroup>
              <InputGroupAddon>
                <IconSearch />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search templates" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="sm" variant="ghost">
                  Search
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <InputGroup>
              <InputGroupAddon>
                <IconMail />
              </InputGroupAddon>
              <InputGroupInput placeholder="Invite by email" />
              <InputGroupAddon align="inline-end">
                <InputGroupText>.com</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <InputGroup>
              <InputGroupTextarea placeholder="Autosizing textarea surface" />
            </InputGroup>
          </div>
        </ShadcnPanel>

        <ShadcnPanel title="Select controls">
          <div className="flex flex-wrap gap-3">
            <Select defaultValue="next">
              <SelectTrigger>
                <SelectValue placeholder="Framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Frameworks</SelectLabel>
                  {frameworks.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                  <SelectSeparator />
                  <SelectItem value="other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <NativeSelect defaultValue="team">
              <NativeSelectOption value="team">Team</NativeSelectOption>
              <NativeSelectOption value="personal">Personal</NativeSelectOption>
            </NativeSelect>
          </div>
        </ShadcnPanel>

        <ShadcnPanel title="Combobox">
          <Combobox items={frameworkLabels}>
            <ComboboxInput placeholder="Pick stack" showClear>
              <ComboboxContent>
                <ComboboxList>
                  <ComboboxGroup>
                    <ComboboxLabel>Available</ComboboxLabel>
                    {frameworkLabels.map((item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                  <ComboboxEmpty>No framework found.</ComboboxEmpty>
                </ComboboxList>
              </ComboboxContent>
            </ComboboxInput>
          </Combobox>
        </ShadcnPanel>

        <ShadcnPanel title="Choice controls">
          <div className="space-y-4">
            <label
              htmlFor="example-terms"
              className="flex items-center gap-2 text-sm"
            >
              <Checkbox id="example-terms" defaultChecked />
              Accept terms
            </label>
            <div className="flex items-center gap-2">
              <Switch defaultChecked id="example-switch" />
              <Label htmlFor="example-switch">Notifications</Label>
            </div>
            <RadioGroup defaultValue="comfortable" className="grid gap-2">
              <label
                htmlFor="density-compact"
                className="flex items-center gap-2 text-sm"
              >
                <RadioGroupItem id="density-compact" value="compact" />
                Compact
              </label>
              <label
                htmlFor="density-comfortable"
                className="flex items-center gap-2 text-sm"
              >
                <RadioGroupItem id="density-comfortable" value="comfortable" />
                Comfortable
              </label>
            </RadioGroup>
          </div>
        </ShadcnPanel>

        <ShadcnPanel title="Toggle controls">
          <div className="flex flex-wrap gap-2">
            <Toggle aria-label="Toggle calendar">
              <IconCalendarBlank />
            </Toggle>
            <Toggle defaultPressed aria-label="Toggle tag">
              <TagIcon />
            </Toggle>
            <ToggleGroup defaultValue={["bold"]}>
              <ToggleGroupItem value="bold">B</ToggleGroupItem>
              <ToggleGroupItem value="italic">I</ToggleGroupItem>
              <ToggleGroupItem value="underline">U</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </ShadcnPanel>

        <ShadcnPanel title="Slider and progress">
          <div className="space-y-5">
            <Slider defaultValue={[48]} max={100} step={1} />
            <Progress value={64}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <ProgressLabel>Upload</ProgressLabel>
                <ProgressValue />
              </div>
              <ProgressTrack>
                <ProgressIndicator />
              </ProgressTrack>
            </Progress>
          </div>
        </ShadcnPanel>

        <ShadcnPanel title="Calendar and OTP">
          <Calendar mode="single" selected={date} onSelect={setDate} />
          <div className="mt-4">
            <InputOTP maxLength={6}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </ShadcnPanel>
      </ShadcnGrid>
    </ShadcnSection>
  );
};
