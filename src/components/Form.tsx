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

const formSchema = z.object({
  person1Salary: z.coerce.number(),
  person2Salary: z.coerce.number(),
  expense: z.coerce.number(),
});

function formatNumber(value: string | number) {
  return Number(value).toLocaleString("en-US");
}

function parseNumber(value: string) {
  return value.replace(/,/g, "");
}

export function CalculationForm() {
  const savedInputs =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("inputs") || "{}")
      : {};

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

    localStorage.setItem(
      "contributions",
      JSON.stringify(calculatedContributions),
    );
    localStorage.setItem("inputs", JSON.stringify(values));

    setContributions(calculatedContributions);
  }

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
                        const value = e.target.value.replace(/[^0-9,]/g, "");
                        const parsedValue = parseNumber(value);
                        formField.onChange(
                          parsedValue ? parseFloat(parsedValue) : 0,
                        );
                        handleChange();
                      }}
                      type="text"
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
                    const value = e.target.value.replace(/[^0-9,]/g, "");
                    const parsedValue = parseNumber(value);
                    formField.onChange(
                      parsedValue ? parseFloat(parsedValue) : 0,
                    );
                    handleChange(); 
                  }}
                  type="text"
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
        Person 1&apos;s Contributions: {contributions.person1Contribution.toFixed(2)}
      </p>
      <p>
        Person 2&apos;s Contributions: {contributions.person2Contribution.toFixed(2)}
      </p>
    </Form>
  );
}
