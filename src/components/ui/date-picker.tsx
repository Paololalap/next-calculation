"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DatePicker = () => {
  const [date, setDate] = useState<Date>();

  useEffect(() => {
    setDate(new Date());
  }, []);

  // Memoize the formatted date string
  const formattedDate = useMemo(() => {
    return date ? format(date, "PP") : null;
  }, [date]);

  // Memoize the calendar props
  const calendarProps = useMemo(
    () => ({
      mode: "single" as const,
      selected: date,
      onSelect: setDate,
      autoFocus: true,
      startMonth: new Date(1999, 11),
      endMonth: new Date(2025, 2),
    }),
    [date],
  );

  // Memoize the button className
  const buttonClassName = useMemo(() => {
    return cn(!date && "text-muted-foreground");
  }, [date]);

  // Use useCallback for the onSelect function
  const handleDateSelect = useCallback((newDate: Date | undefined) => {
    setDate(newDate);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-max justify-start text-left", buttonClassName)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formattedDate ?? <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar {...calendarProps} onSelect={handleDateSelect} />
      </PopoverContent>
    </Popover>
  );
};

export { DatePicker };
