import { CalculationForm } from "@/components/Form";

export default function Homepage() {
  return (
    <section className="flex flex-col gap-5 flex-1 sm:max-w-max">
    <h1
      className="scroll-m-20 font-extrabold tracking-tight text-5xl text-center"
    >
      Calculation
    </h1>
     <CalculationForm />
  </section>
  )
}
