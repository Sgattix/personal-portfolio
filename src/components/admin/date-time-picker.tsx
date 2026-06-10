"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DateTimePickerProps = {
  value: string;
  onChange: (nextValue: string) => void;
  className?: string;
};

const DEFAULT_TIME = "12:00";

function toLocalDateParts(value: string): { date: string; time: string } {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return { date: "", time: DEFAULT_TIME };
  }

  const pad = (segment: number): string => segment.toString().padStart(2, "0");

  return {
    date: `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`,
    time: `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`,
  };
}

function toIsoString(datePart: string, timePart: string): string {
  if (!datePart) {
    return "";
  }

  const [yearRaw, monthRaw, dayRaw] = datePart.split("-");
  const [hourRaw, minuteRaw] = (timePart || DEFAULT_TIME).split(":");

  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  const next = new Date(year, month - 1, day, hour, minute);

  return Number.isNaN(next.getTime()) ? "" : next.toISOString();
}

export function DateTimePicker({
  value,
  onChange,
  className,
}: DateTimePickerProps) {
  const { date, time } = useMemo(() => toLocalDateParts(value), [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={
            className ??
            "w-full justify-between border-neutral-700 bg-neutral-950 text-left text-neutral-100 hover:bg-neutral-900"
          }
        >
          <CalendarDays className="size-4 text-neutral-400" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 space-y-3 border-neutral-800 bg-neutral-950 p-4 text-neutral-100">
        <label className="block space-y-2">
          <span className="text-xs text-neutral-400">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) =>
              onChange(toIsoString(event.target.value, time))
            }
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none transition focus:border-white"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs text-neutral-400">Time</span>
          <input
            type="time"
            value={time}
            onChange={(event) =>
              onChange(toIsoString(date, event.target.value))
            }
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none transition focus:border-white"
          />
        </label>
      </PopoverContent>
    </Popover>
  );
}
