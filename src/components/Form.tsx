"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FIELDS } from "@/constants/FIELDS";

// Define the schema for the form using Zod
const formSchema = z.object({
  person1Salary: z.coerce.number(),
  person2Salary: z.coerce.number(),
  expense: z.coerce.number(),
});

// Format numbers with commas for readability
function formatNumber(value: string | number) {
  return Number(value).toLocaleString("en-US");
}

// Parse numbers by removing commas
function parseNumber(value: string) {
  return value.replace(/,/g, "");
}

export function CalculationForm() {
  // Retrieve saved input values from localStorage (if available)
  const savedInputs =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("inputs") || "{}")
      : {};

  // Initialize the form with default values and schema validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      person1Salary: savedInputs.person1Salary ?? 36000,
      person2Salary: savedInputs.person2Salary ?? 21000,
      expense: savedInputs.expense ?? 0,
    },
  });

  // State to store the calculated contributions
  const [contributions, setContributions] = useState({
    person1Contribution: 0,
    person2Contribution: 0,
  });

  // Load saved contributions from localStorage on component mount
  useEffect(() => {
    const savedContributions = localStorage.getItem("contributions");
    if (savedContributions) {
      setContributions(JSON.parse(savedContributions));
    }
  }, []);

  // Calculate contributions based on the current form values
  function calculateContributions(values: z.infer<typeof formSchema>) {
    const totalIncome = values.person1Salary + values.person2Salary;
    const person1Percentage = values.person1Salary / totalIncome;
    const person2Percentage = values.person2Salary / totalIncome;

    const person1Contribution = person1Percentage * values.expense;
    const person2Contribution = person2Percentage * values.expense;

    const calculatedContributions = {
      person1Contribution,
      person2Contribution,
    };

    // Save the calculated contributions and form values to localStorage
    localStorage.setItem(
      "contributions",
      JSON.stringify(calculatedContributions),
    );
    localStorage.setItem("inputs", JSON.stringify(values));

    // Update the state with the new contributions
    setContributions(calculatedContributions);
  }

  // Handle input changes and trigger recalculation
  function handleChange() {
    const values = form.getValues();
    calculateContributions(values);
  }

  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="gap-x-8 sm:flex mx-auto">
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
                        // Restrict input to numbers and commas
                        let value = e.target.value.replace(/[^0-9,]/g, "");
                        let parsedValue = parseNumber(value);

                        // Ensure the number of digits does not exceed 7
                        if (parsedValue.length > 7) {
                          parsedValue = parsedValue.slice(0, 7);
                        }

                        formField.onChange(
                          parsedValue ? parseFloat(parsedValue) : 0,
                        );
                        handleChange(); // Trigger recalculation on change
                      }}
                      type="text" // Keeps it as text for formatting purposes
                      inputMode="numeric" // Prompts numeric keyboard on mobile devices
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
                    // Restrict input to numbers and commas
                    let value = e.target.value.replace(/[^0-9,]/g, "");
                    let parsedValue = parseNumber(value);

                    // Ensure the number of digits does not exceed 7
                    if (parsedValue.length > 7) {
                      parsedValue = parsedValue.slice(0, 7);
                    }

                    formField.onChange(
                      parsedValue ? parseFloat(parsedValue) : 0,
                    );
                    handleChange(); // Trigger recalculation on change
                  }}
                  type="text" // Keeps it as text for formatting purposes
                  inputMode="numeric" // Prompts numeric keyboard on mobile devices
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
        Person 1&apos;s Contributions: {formatNumber(contributions.person1Contribution.toFixed(2))}
      </p>
      <p>
        Person 2&apos;s Contributions: {formatNumber(contributions.person2Contribution.toFixed(2))}
      </p>
    </Form>
  );
}
