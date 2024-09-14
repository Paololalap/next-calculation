"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FIELDS } from "@/constants/FIELDS";

// Define the schema for the form using Zod
const formSchema = z.object({
  person1Salary: z.coerce.number(),
  person2Salary: z.coerce.number(),
  expense: z.coerce.number(),
});

// Format numbers with commas for readability
const formatNumber = (value: string | number) => {
  return Number(value).toLocaleString("en-US");
};

// Parse numbers by removing commas
const parseNumber = (value: string) => {
  return value.replace(/,/g, "");
};

export function CalculationForm() {
  const [remarks, setRemarks] = useState("");

  // Memoize the saved inputs
  const savedInputs = useMemo(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("inputs") || "{}");
    }
    return {};
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      person1Salary: savedInputs.person1Salary ?? 36000,
      person2Salary: savedInputs.person2Salary ?? 21000,
      expense: savedInputs.expense ?? 0,
    },
  });

  const [contributions, setContributions] = useState({
    person1Contribution: 0,
    person2Contribution: 0,
  });

  useEffect(() => {
    const savedContributions = localStorage.getItem("contributions");
    if (savedContributions) {
      setContributions(JSON.parse(savedContributions));
    }
  }, []);

  // Memoize the calculation function
  const calculateContributions = useMemo(() => {
    return (values: z.infer<typeof formSchema>) => {
      const totalIncome = values.person1Salary + values.person2Salary;
      const person1Percentage = values.person1Salary / totalIncome;
      const person2Percentage = values.person2Salary / totalIncome;

      const person1Contribution = person1Percentage * values.expense;
      const person2Contribution = person2Percentage * values.expense;

      const calculatedContributions = {
        person1Contribution,
        person2Contribution,
      };

      localStorage.setItem(
        "contributions",
        JSON.stringify(calculatedContributions),
      );
      localStorage.setItem("inputs", JSON.stringify(values));

      return calculatedContributions;
    };
  }, []);

  // Use useCallback for handleChange
  const handleChange = useCallback(() => {
    const values = form.getValues();
    const newContributions = calculateContributions(values);
    setContributions(newContributions);
  }, [form, calculateContributions]);

  // Use useCallback for clearRemarks
  const clearRemarks = useCallback(() => {
    setRemarks("");
  }, []);

  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="mx-auto gap-x-8 sm:flex">
          {FIELDS.slice(0, 2).map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name as keyof z.infer<typeof formSchema>}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      value={formatNumber(formField.value)}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^0-9,]/g, "");
                        let parsedValue = parseNumber(value);

                        if (parsedValue.length > 7) {
                          parsedValue = parsedValue.slice(0, 7);
                        }

                        formField.onChange(
                          parsedValue ? parseFloat(parsedValue) : 0,
                        );
                        handleChange();
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      className="input-no-spinner"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <FormField
          control={form.control}
          name="expense"
          render={({ field: formField }) => (
            <FormItem className="mx-auto sm:w-fit">
              <FormLabel>{FIELDS[2].label}</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  value={formatNumber(formField.value)}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^0-9,]/g, "");
                    let parsedValue = parseNumber(value);

                    if (parsedValue.length > 7) {
                      parsedValue = parsedValue.slice(0, 7);
                    }

                    formField.onChange(
                      parsedValue ? parseFloat(parsedValue) : 0,
                    );
                    handleChange();
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  className="input-no-spinner"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
      <p>
        Person 1&apos;s Contributions:{" "}
        {formatNumber(contributions.person1Contribution.toFixed(2))}
      </p>
      <p className="-mt-3">
        Person 2&apos;s Contributions:{" "}
        {formatNumber(contributions.person2Contribution.toFixed(2))}
      </p>
      <Label className="text-base">
        Remarks:
        <div className="mt-1 flex flex-col gap-1 min-[400px]:flex-row">
          <div className="relative w-full">
            <Input
              className="capitalize placeholder:normal-case"
              placeholder="e.g., Groceries"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            {remarks && (
              <Button
                onClick={clearRemarks}
                variant="ghost"
                className="absolute right-0 top-1/2 mr-1 h-8 -translate-y-1/2 cursor-pointer px-3"
              >
                Clear
              </Button>
            )}
          </div>
          <DatePicker />
        </div>
      </Label>
    </Form>
  );
}
