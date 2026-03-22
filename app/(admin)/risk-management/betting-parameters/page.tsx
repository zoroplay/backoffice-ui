"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  normalizeApiError,
  settingsApi,
  type SaveRiskManagementPayload,
} from "@/lib/api";
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

type ApiRecord = Record<string, unknown>;
type ApiCategory = "online" | "retail";
type SavePrimitive = string | number | "";

const CHANNEL_TO_CATEGORY: Record<ChannelType, ApiCategory> = {
  Online: "online",
  Retail: "retail",
};

const timeframeToPeriod = (timeframe: TimeOfDay) => timeframe.toLowerCase();
const buildPeriodKey = (base: string, timeframe: TimeOfDay) =>
  `${base}_${timeframeToPeriod(timeframe)}`;
const savingKey = (channel: ChannelType, timeframe: TimeOfDay) => `${channel}-${timeframe}`;

const toRecord = (value: unknown): ApiRecord => {
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === "object" ? (first as ApiRecord) : {};
  }

  if (!value || typeof value !== "object") {
    return {};
  }

  const root = value as ApiRecord;
  if (root.data && typeof root.data === "object") {
    const nested = root.data as ApiRecord;
    if (Array.isArray(nested.data)) {
      const first = nested.data[0];
      return first && typeof first === "object" ? (first as ApiRecord) : {};
    }
    if (nested.data && typeof nested.data === "object") {
      return nested.data as ApiRecord;
    }
    return nested;
  }

  if (Array.isArray(root.data)) {
    const first = root.data[0];
    return first && typeof first === "object" ? (first as ApiRecord) : {};
  }

  return root;
};

const toStringValue = (value: unknown): string | undefined => {
  if (value === null || typeof value === "undefined") {
    return undefined;
  }
  return String(value);
};

const readString = (payload: ApiRecord, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = toStringValue(payload[key]);
    if (typeof value !== "undefined") {
      return value;
    }
  }
  return undefined;
};

const readBoolean = (payload: ApiRecord, keys: string[]): boolean | undefined => {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      return value === 1;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "1" || normalized === "true") return true;
      if (normalized === "0" || normalized === "false") return false;
    }
  }
  return undefined;
};

const hasTimeframePayload = (payload: ApiRecord, timeframe: TimeOfDay) => {
  const period = timeframeToPeriod(timeframe);
  return Object.keys(payload).some((key) => key.endsWith(`_${period}`));
};

const mapApiToForm = (
  channel: ChannelType,
  timeframe: TimeOfDay,
  payload: ApiRecord,
  fallback: BettingParameters
): BettingParameters => {
  const periodKey = (base: string) => buildPeriodKey(base, timeframe);

  const holdBetsKeys =
    channel === "Online"
      ? [periodKey("hold_bets"), periodKey("hold_bets_from")]
      : [periodKey("hold_bets_from"), periodKey("hold_bets")];

  const systemBetKeys =
    channel === "Online"
      ? [periodKey("allow_system_bet"), periodKey("accept_system_bet")]
      : [periodKey("accept_system_bet"), periodKey("allow_system_bet")];

  const splitBetKeys =
    channel === "Online"
      ? [periodKey("allow_split_bet"), periodKey("accept_split_bet")]
      : [periodKey("accept_split_bet"), periodKey("allow_split_bet")];

  return {
    ...fallback,
    minimumWithdrawal:
      readString(payload, [periodKey("min_withdrawal")]) ?? fallback.minimumWithdrawal,
    maximumWithdrawal:
      readString(payload, [periodKey("max_withdrawal")]) ?? fallback.maximumWithdrawal,
    minimumAvailableCredit:
      channel === "Retail"
        ? readString(payload, [periodKey("network_min_available_credit")]) ??
          fallback.minimumAvailableCredit
        : fallback.minimumAvailableCredit,
    maxPayout: readString(payload, [periodKey("max_payout")]) ?? fallback.maxPayout,
    maxOddLength:
      readString(payload, [periodKey("max_single_odd_length"), periodKey("max_combi_odd_length")]) ??
      fallback.maxOddLength,
    singleStakeMin: readString(payload, [periodKey("single_min")]) ?? fallback.singleStakeMin,
    singleStakeMax: readString(payload, [periodKey("single_max")]) ?? fallback.singleStakeMax,
    combStakeMin: readString(payload, [periodKey("combi_min")]) ?? fallback.combStakeMin,
    combStakeMax: readString(payload, [periodKey("combi_max")]) ?? fallback.combStakeMax,
    ticketSizeMin: readString(payload, [periodKey("size_min")]) ?? fallback.ticketSizeMin,
    ticketSizeMax: readString(payload, [periodKey("size_max")]) ?? fallback.ticketSizeMax,
    liveTicketMin: readString(payload, [periodKey("live_size_min")]) ?? fallback.liveTicketMin,
    liveTicketMax: readString(payload, [periodKey("live_size_max")]) ?? fallback.liveTicketMax,
    cancelTicketMinutes:
      readString(payload, [periodKey("max_time_to_cancel")]) ?? fallback.cancelTicketMinutes,
    dailyCancelLimit:
      readString(payload, [periodKey("daily_cancel_limit")]) ?? fallback.dailyCancelLimit,
    singleTicketMaxWinning:
      readString(payload, [periodKey("single_max_winning")]) ?? fallback.singleTicketMaxWinning,
    maxDuplicateTickets:
      readString(payload, [periodKey("max_duplicate_ticket")]) ?? fallback.maxDuplicateTickets,
    acceptPreMatchBets:
      readBoolean(payload, [periodKey("accept_prematch_bets")]) ?? fallback.acceptPreMatchBets,
    acceptLiveBets:
      readBoolean(payload, [periodKey("accept_live_bets")]) ?? fallback.acceptLiveBets,
    enableCashout: readBoolean(payload, [periodKey("enable_cashout")]) ?? fallback.enableCashout,
    enableCutX: readBoolean(payload, [periodKey("enable_cut_x")]) ?? fallback.enableCutX,
    enableSystemBet: readBoolean(payload, systemBetKeys) ?? fallback.enableSystemBet,
    enableSplitBet: readBoolean(payload, splitBetKeys) ?? fallback.enableSplitBet,
    minBonusOdds: readString(payload, [periodKey("min_bonus_odd")]) ?? fallback.minBonusOdds,
    holdBetsFrom: readString(payload, holdBetsKeys) ?? fallback.holdBetsFrom,
  };
};

const pickRawPayloadForTimeframe = (payload: ApiRecord, timeframe: TimeOfDay): ApiRecord => {
  const period = timeframeToPeriod(timeframe);
  const picked: ApiRecord = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (key.endsWith(`_${period}`)) {
      picked[key] = value;
    }
  });

  return picked;
};

const toBinary = (value: boolean) => (value ? "1" : "0");
const toSavePrimitive = (value: unknown): SavePrimitive | undefined => {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }
  if (value === null) {
    return "";
  }
  return undefined;
};

const mapFormToApiPayload = (
  channel: ChannelType,
  timeframe: TimeOfDay,
  formValues: BettingParameters,
  basePayload: ApiRecord
): SaveRiskManagementPayload => {
  const period = timeframeToPeriod(timeframe);
  const category = CHANNEL_TO_CATEGORY[channel];
  const periodKey = (base: string) => buildPeriodKey(base, timeframe);
  const nextBase: Record<string, SavePrimitive> = {};

  Object.entries(basePayload).forEach(([key, value]) => {
    const parsed = toSavePrimitive(value);
    if (typeof parsed !== "undefined") {
      nextBase[key] = parsed;
    }
  });

  if (category === "online") {
    delete nextBase[periodKey("accept_system_bet")];
    delete nextBase[periodKey("accept_split_bet")];
  } else {
    delete nextBase[periodKey("allow_system_bet")];
    delete nextBase[periodKey("allow_split_bet")];
  }

  const payload: SaveRiskManagementPayload = {
    ...nextBase,
    period,
    category,
    [periodKey("min_withdrawal")]: formValues.minimumWithdrawal,
    [periodKey("max_withdrawal")]: formValues.maximumWithdrawal,
    [periodKey("max_payout")]: formValues.maxPayout,
    [periodKey("max_single_odd_length")]: formValues.maxOddLength,
    [periodKey("max_combi_odd_length")]: formValues.maxOddLength,
    [periodKey("single_min")]: formValues.singleStakeMin,
    [periodKey("single_max")]: formValues.singleStakeMax,
    [periodKey("combi_min")]: formValues.combStakeMin,
    [periodKey("combi_max")]: formValues.combStakeMax,
    [periodKey("size_min")]: formValues.ticketSizeMin,
    [periodKey("size_max")]: formValues.ticketSizeMax,
    [periodKey("live_size_min")]: formValues.liveTicketMin,
    [periodKey("live_size_max")]: formValues.liveTicketMax,
    [periodKey("max_time_to_cancel")]: formValues.cancelTicketMinutes,
    [periodKey("daily_cancel_limit")]: formValues.dailyCancelLimit,
    [periodKey("single_max_winning")]: formValues.singleTicketMaxWinning,
    [periodKey("max_duplicate_ticket")]: formValues.maxDuplicateTickets,
    [periodKey("min_bonus_odd")]: formValues.minBonusOdds,
    [periodKey("enable_cashout")]: toBinary(formValues.enableCashout),
    [periodKey("enable_cut_x")]: toBinary(formValues.enableCutX),
    [periodKey("accept_prematch_bets")]: toBinary(formValues.acceptPreMatchBets),
    [periodKey("accept_live_bets")]: toBinary(formValues.acceptLiveBets),
  };

  if (category === "online") {
    payload[periodKey("hold_bets")] = formValues.holdBetsFrom;
    payload[periodKey("allow_system_bet")] = toBinary(formValues.enableSystemBet);
    payload[periodKey("allow_split_bet")] = toBinary(formValues.enableSplitBet);
  } else {
    payload[periodKey("hold_bets_from")] = formValues.holdBetsFrom;
    payload[periodKey("accept_system_bet")] = toBinary(formValues.enableSystemBet);
    payload[periodKey("accept_split_bet")] = toBinary(formValues.enableSplitBet);
    payload[periodKey("network_min_available_credit")] = formValues.minimumAvailableCredit ?? "";
  }

  return payload;
};

const booleanButtonClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-brand-500 text-white shadow-sm hover:bg-brand-600"
      : "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
  );

const BettingParametersPage: React.FC = () => {
  const [parameters, setParameters] = useState<BettingParametersState>(defaultBettingParameters);
  const [initialParameters, setInitialParameters] = useState<BettingParametersState>(
    defaultBettingParameters
  );
  const [rawPayloadByChannel, setRawPayloadByChannel] = useState<
    Record<ChannelType, Record<TimeOfDay, ApiRecord>>
  >({
    Online: { Day: {}, Night: {} },
    Retail: { Day: {}, Night: {} },
  });
  const [activeTimeframes, setActiveTimeframes] = useState<Record<ChannelType, TimeOfDay>>({
    Online: "Day",
    Retail: "Day",
  });
  const [activeChannel, setActiveChannel] = useState<ChannelType>("Online");
  const [isLoading, setIsLoading] = useState(true);
  const [savingState, setSavingState] = useState<Record<string, boolean>>({});

  const channels = useMemo<ChannelType[]>(() => ["Online", "Retail"], []);

  const fetchParameters = useCallback(async () => {
    setIsLoading(true);
    try {
      const [onlineResponse, retailResponse] = await Promise.all([
        settingsApi.getOnlineRiskManagementBettingParameters(),
        settingsApi.getRetailRiskManagementBettingParameters(),
      ]);

      const onlinePayload = toRecord(onlineResponse);
      const retailPayload = toRecord(retailResponse);

      const mapped: BettingParametersState = {
        Online: {
          Day: mapApiToForm(
            "Online",
            "Day",
            onlinePayload,
            defaultBettingParameters.Online.Day
          ),
          Night: hasTimeframePayload(onlinePayload, "Night")
            ? mapApiToForm("Online", "Night", onlinePayload, defaultBettingParameters.Online.Night)
            : defaultBettingParameters.Online.Night,
        },
        Retail: {
          Day: mapApiToForm(
            "Retail",
            "Day",
            retailPayload,
            defaultBettingParameters.Retail.Day
          ),
          Night: hasTimeframePayload(retailPayload, "Night")
            ? mapApiToForm("Retail", "Night", retailPayload, defaultBettingParameters.Retail.Night)
            : defaultBettingParameters.Retail.Night,
        },
      };

      setParameters(mapped);
      setInitialParameters(mapped);
      setRawPayloadByChannel({
        Online: {
          Day: pickRawPayloadForTimeframe(onlinePayload, "Day"),
          Night: pickRawPayloadForTimeframe(onlinePayload, "Night"),
        },
        Retail: {
          Day: pickRawPayloadForTimeframe(retailPayload, "Day"),
          Night: pickRawPayloadForTimeframe(retailPayload, "Night"),
        },
      });
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to fetch betting parameters");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchParameters();
  }, [fetchParameters]);

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
        [timeframe]: { ...initialParameters[channel][timeframe] },
      },
    }));
  };

  const handleSave = async (channel: ChannelType, timeframe: TimeOfDay) => {
    const saveStateKey = savingKey(channel, timeframe);
    setSavingState((prev) => ({ ...prev, [saveStateKey]: true }));

    try {
      const formValues = parameters[channel][timeframe];
      const payload = mapFormToApiPayload(
        channel,
        timeframe,
        formValues,
        rawPayloadByChannel[channel][timeframe]
      );
      await settingsApi.saveRiskManagementBettingParameters(payload);
      setInitialParameters((prev) => ({
        ...prev,
        [channel]: {
          ...prev[channel],
          [timeframe]: { ...formValues },
        },
      }));
      setRawPayloadByChannel((prev) => ({
        ...prev,
        [channel]: {
          ...prev[channel],
          [timeframe]: pickRawPayloadForTimeframe(payload as ApiRecord, timeframe),
        },
      }));
      toast.success(`${channel} (${timeframe}) parameters saved`);
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to save betting parameters");
    } finally {
      setSavingState((prev) => ({ ...prev, [saveStateKey]: false }));
    }
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
          value={value}
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
    const isSaving = Boolean(savingState[savingKey(channel, timeframe)]);

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
                  disabled={isLoading || isSaving}
                  onClick={() => handleReset(channel, activeTimeframes[channel])}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  className="bg-brand-500 text-white hover:bg-brand-600"
                  disabled={isLoading || isSaving}
                  onClick={() => void handleSave(channel, activeTimeframes[channel])}
                >
                  {isSaving ? "Saving..." : "Save"}
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
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            Loading betting parameters...
          </div>
        ) : null}
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

