"use client";

import React, { useMemo, useState } from "react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { withAuth } from "@/utils/withAuth";

import {
  BettingParameters,
  BettingParametersState,
  ChannelType,
  TimeOfDay,
  defaultBettingParameters,
} from "./data";
 
import { fieldGroups, FieldDefinition, FieldGroup } from "./field";


const booleanButtonClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-brand-500 text-white shadow-sm hover:bg-brand-600"
      : "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
  );

const BettingParametersPage: React.FC = () => {
  const [parameters, setParameters] = useState<BettingParametersState>(defaultBettingParameters);
  const [activeTimeframes, setActiveTimeframes] = useState<Record<ChannelType, TimeOfDay>>({
    Online: "Day",
    Retail: "Day",
  });
  const [activeChannel, setActiveChannel] = useState<ChannelType>("Online");

  const channels = useMemo<ChannelType[]>(() => ["Online", "Retail"], []);

  const setParameterValue = (
    channel: ChannelType,
    timeframe: TimeOfDay,
    key: keyof BettingParameters,
    value: BettingParameters[keyof BettingParameters]
  ) => {
    setParameters((prev) => {
      const channelData = { ...prev[channel] };
      const timeframeData = {
        ...channelData[timeframe],
        [key]: value,
      } as BettingParameters;
      return {
        ...prev,
        [channel]: {
          ...channelData,
          [timeframe]: timeframeData,
        },
      };
    });
  };

  const handleReset = (channel: ChannelType, timeframe: TimeOfDay) => {
    setParameters((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [timeframe]: { ...defaultBettingParameters[channel][timeframe] },
      },
    }));
  };

  const handleSave = (channel: ChannelType, timeframe: TimeOfDay) => {
    const payload = parameters[channel][timeframe];
    console.log("Saving betting parameters", { channel, timeframe, payload });
    alert(`${channel} (${timeframe}) parameters saved successfully!`);
  };

  const renderBooleanField = (
    channel: ChannelType,
    timeframe: TimeOfDay,
    field: FieldDefinition,
    value: boolean
  ) => (
    <div key={`${channel}-${timeframe}-${field.key}`} className="flex flex-col gap-2">
      <Label>{field.label}</Label>
      <div className="inline-flex w-full max-w-xs items-center justify-between rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
        <button
          type="button"
          className={booleanButtonClasses({ isActive: value })}
          onClick={() => setParameterValue(channel, timeframe, field.key, true)}
        >
          Yes
        </button>
        <button
          type="button"
          className={booleanButtonClasses({ isActive: !value })}
          onClick={() => setParameterValue(channel, timeframe, field.key, false)}
        >
          No
        </button>
      </div>
    </div>
  );

  const renderNumericField = (
    channel: ChannelType,
    timeframe: TimeOfDay,
    field: FieldDefinition,
    value: string
  ) => (
    <div
      key={`${channel}-${timeframe}-${field.key}`}
      className={cn("flex flex-col gap-2", field.colSpan === 2 && "md:col-span-2")}
    >
      <Label htmlFor={`${channel}-${timeframe}-${field.key}`}>{field.label}</Label>
      <div className="relative">
        {field.prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
            {field.prefix}
          </span>
        )}
        <Input
          id={`${channel}-${timeframe}-${field.key}`}
          type="number"
          defaultValue={value}
          onChange={(event) => setParameterValue(channel, timeframe, field.key, event.target.value)}
          className={field.prefix ? "pl-8" : undefined}
        />
        {field.suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
            {field.suffix}
          </span>
        )}
      </div>
      {field.helperText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{field.helperText}</p>
      )}
    </div>
  );

  const renderFieldGroup = (channel: ChannelType, timeframe: TimeOfDay, group: FieldGroup) => {
    const data = parameters[channel][timeframe];

    return (
      <div
        key={`${channel}-${timeframe}-${group.title}`}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{group.title}</h4>
          {group.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{group.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {group.fields.map((field) => {
            const value = data[field.key];

            if (typeof value === "undefined") {
              return null;
            }

            if (field.type === "boolean") {
              return renderBooleanField(channel, timeframe, field, Boolean(value));
            }

            return renderNumericField(channel, timeframe, field, String(value));
          })}
        </div>
      </div>
    );
  };

  const renderChannelCard = (channel: ChannelType) => {
    const timeframe = activeTimeframes[channel];

    return (
      <div key={channel} className="space-y-4 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{channel}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure betting parameters for the {channel.toLowerCase()} channel.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6">
          <Tabs
            value={timeframe}
            onValueChange={(value) =>
              setActiveTimeframes((prev) => ({
                ...prev,
                [channel]: value as TimeOfDay,
              }))
            }
            className="w-full"
          >
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800/60">
              <TabsList className="bg-white/80 dark:bg-gray-900/60">
                <TabsTrigger value="Day" className="px-4 py-2">
                  Day
                </TabsTrigger>
                <TabsTrigger value="Night" className="px-4 py-2">
                  Night
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="text-sm"
                  onClick={() => handleReset(channel, activeTimeframes[channel])}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  className="bg-brand-500 text-white hover:bg-brand-600"
                  onClick={() => handleSave(channel, activeTimeframes[channel])}
                >
                  Save
                </Button>
              </div>
            </div>

            <TabsContent value="Day" className="space-y-6">
              <Form onSubmit={(event) => event.preventDefault()}>
                <div className="space-y-6">
                  {fieldGroups.map((group) => renderFieldGroup(channel, "Day", group))}
                </div>
              </Form>
            </TabsContent>

            <TabsContent value="Night" className="space-y-6">
              <Form onSubmit={(event) => event.preventDefault()}>
                <div className="space-y-6">
                  {fieldGroups.map((group) => renderFieldGroup(channel, "Night", group))}
                </div>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Betting Parameters" />

      <div className="space-y-4">
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Centralised Limits & Controls
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Maintain consistency across channels by managing your online and retail parameters in one place.
            Adjust day and night thresholds independently to reflect peak trading periods.
          </p>
        </div>

        <Tabs
          value={activeChannel}
          onValueChange={(value) => setActiveChannel(value as ChannelType)}
          className="w-full"
        >
          <TabsList className="mb-6 h-auto rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:from-gray-800/60 dark:to-gray-800/30">
            {channels.map((channel) => (
              <TabsTrigger
                key={channel}
                value={channel}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-50 data-[state=active]:border data-[state=active]:border-brand-200 data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-md dark:hover:bg-gray-800 dark:data-[state=active]:border-brand-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-300"
              >
                {channel}
              </TabsTrigger>
            ))}
          </TabsList>

          {channels.map((channel) => (
            <TabsContent key={channel} value={channel} className="mt-0">
              {renderChannelCard(channel)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default withAuth(BettingParametersPage);

