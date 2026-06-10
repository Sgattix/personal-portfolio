"use client";

import { useState } from "react";

import { DateTimePicker } from "@/components/admin/date-time-picker";

type ProjectDateFieldProps = {
  initialValue: string;
};

export function ProjectDateField({ initialValue }: ProjectDateFieldProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="space-y-2">
      <span className="text-sm text-neutral-300">Date</span>
      <DateTimePicker value={value} onChange={setValue} />
      <input type="hidden" name="date" value={value} readOnly />
    </div>
  );
}
