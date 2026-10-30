"use client";

import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { Briefcase, CheckCheck, Gauge, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";

type Period = "monthly" | "quarterly" | "yearly";

const PERIODS: { id: Period; label: string; unit: string }[] = [
  { id: "monthly", label: "Monthly", unit: "month" },
  { id: "quarterly", label: "Quarterly", unit: "quarter" },
  { id: "yearly", label: "Yearly", unit: "year" },
];

const plans = [
  {
    name: "Student Solver",
    description:
      "For student engineers and independent solvers submitting proposals to open challenges.",
    price: { monthly: 99, quarterly: 279, yearly: 999 },
    buttonText: "Browse Challenges",
    href: "/problems",
    popular: false,
    features: [
      { text: "20 submission tokens every month", icon: <Briefcase size={20} /> },
      { text: "Deterministic gate score + feedback", icon: <Gauge size={20} /> },
      { text: "Credibility boost on passing pitches", icon: <ShieldCheck size={20} /> },
    ],
    includes: [
      "Everything you need to start:",
      "Full 5-step structured pitch wizard",
      "Public solver portfolio",
      "Revision history on every pitch",
    ],
  },
  {
    name: "Education Partner",
    description:
      "For coaching centers, academies, and departments posting friction problems.",
    price: { monthly: 3599, quarterly: 9999, yearly: 30999 },
    buttonText: "Post a Challenge",
    href: "/org/problems/new",
    popular: true,
    features: [
      { text: "Unlimited challenge postings", icon: <Briefcase size={20} /> },
      { text: "Vetted proposal inbox", icon: <ShieldCheck size={20} /> },
      { text: "Org dashboard pipeline metrics", icon: <Gauge size={20} /> },
    ],
    includes: [
      "Everything in Student, plus:",
      "Strict 6.0 deterministic quality gate",
      "Shortlist, accept, or decline with notes",
      "Solver contact handoff on shortlist",
    ],
  },
  {
    name: "Campus & Enterprise",
    description:
      "For multi-department universities and training networks requiring custom calibration.",
    price: { monthly: null, quarterly: null, yearly: null },
    buttonText: "Schedule Consultation",
    href: "/collaborate",
    popular: false,
    features: [
      { text: "Custom domain keyword calibration", icon: <Briefcase size={20} /> },
      { text: "Deterministic rubric fine-tuning", icon: <Gauge size={20} /> },
      { text: "Dedicated account manager & SLA", icon: <ShieldCheck size={20} /> },
    ],
    includes: [
      "Everything in Education Partner, plus:",
      "Multiple departments and organizations",
      "White-glove sandbox onboarding",
      "Custom API & webhook integrations",
    ],
  },
];

function PricingSwitch({
  period,
  onChange,
}: {
  period: Period;
  onChange: (period: Period) => void;
}) {
  return (
    <div className="flex justify-center">
      <div className="relative z-50 mx-auto flex w-fit rounded-full border border-gray-200 bg-neutral-50 p-1">
        {PERIODS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`relative z-10 h-10 rounded-full px-3 py-1 text-sm font-medium transition-colors sm:h-12 sm:px-6 sm:py-2 ${
              period === id
                ? "text-white"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            {period === id && (
              <motion.span
                layoutId="pricing-switch"
                className="absolute left-0 top-0 h-10 w-full rounded-full border-4 border-blue-600 bg-gradient-to-t from-blue-500 via-blue-400 to-blue-600 shadow-sm shadow-blue-600 sm:h-12"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PricingSection() {
  const [period, setPeriod] = useState<Period>("monthly");
  const pricingRef = useRef<HTMLDivElement>(null);
  const unit = PERIODS.find((item) => item.id === period)?.unit ?? "month";

  return (
    <div
      className="relative mx-auto min-h-screen bg-neutral-100 px-4 pb-16 pt-12"
      ref={pricingRef}
    >
      <div
        className="pointer-events-none absolute left-[10%] right-[10%] top-0 z-0 h-full w-[80%]"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #206ce8 0%, transparent 70%)",
          opacity: 0.35,
          mixBlendMode: "multiply",
        }}
      />

      <div className="mx-auto mb-6 max-w-3xl text-center">
        <TimelineContent
          as="h2"
          animationNum={0}
          timelineRef={pricingRef}
          className="mb-4 text-3xl font-medium text-gray-900 sm:text-4xl md:text-6xl"
        >
          Plans that work for your{" "}
          <TimelineContent
            as="span"
            animationNum={1}
            timelineRef={pricingRef}
            className="inline-block rounded-xl border border-dashed border-blue-500 bg-blue-100 px-2 py-1 capitalize"
          >
            classroom
          </TimelineContent>
        </TimelineContent>

        <TimelineContent
          as="p"
          animationNum={2}
          timelineRef={pricingRef}
          className="mx-auto w-[80%] text-sm text-gray-600 sm:w-[70%] sm:text-base"
        >
          Transparent pricing for solvers and the organizations that hire them.
          No hidden fees, no opaque paywalls.
        </TimelineContent>
      </div>

      <TimelineContent
        as="div"
        animationNum={3}
        timelineRef={pricingRef}
      >
        <PricingSwitch period={period} onChange={setPeriod} />
        <p className="mt-3 text-center text-xs text-gray-500">
          Yearly plans save up to 28%.
        </p>
      </TimelineContent>

      <div className="mx-auto grid max-w-7xl gap-4 py-6 md:grid-cols-3">
        {plans.map((plan, index) => {
          const price = plan.price[period];

          return (
            <TimelineContent
              key={plan.name}
              as="div"
              animationNum={4 + index}
              timelineRef={pricingRef}
            >
              <Card
                className={`relative h-full border-neutral-200 ${
                  plan.popular ? "bg-blue-50 ring-2 ring-blue-500" : "bg-white"
                }`}
              >
                <CardHeader className="text-left">
                  <div className="flex justify-between gap-2">
                    <h3 className="mb-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
                      {plan.name}
                    </h3>
                    {plan.popular && (
                      <span className="h-fit rounded-full bg-blue-500 px-3 py-1 text-sm font-medium text-white">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="mb-4 text-sm text-gray-600">{plan.description}</p>
                  <div className="flex items-baseline">
                    {price === null ? (
                      <span className="text-4xl font-semibold text-gray-900">
                        Custom
                      </span>
                    ) : (
                      <span className="text-4xl font-semibold text-gray-900">
                        ₹
                        <NumberFlow
                          value={price}
                          className="text-4xl font-semibold"
                        />
                      </span>
                    )}
                    <span className="ml-1 text-gray-600">
                      /{price === null ? "annual license" : unit}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Link href={plan.href} className="block">
                    <button
                      type="button"
                      className={`mb-6 w-full rounded-xl border p-3.5 text-lg font-semibold ${
                        plan.popular
                          ? "border-blue-400 bg-gradient-to-t from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500"
                          : "border-neutral-700 bg-gradient-to-t from-neutral-900 to-neutral-600 text-white shadow-lg shadow-neutral-900"
                      }`}
                    >
                      {plan.buttonText}
                    </button>
                  </Link>

                  <ul className="space-y-2 py-5 font-semibold">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <span className="mr-3 mt-0.5 grid place-content-center text-neutral-800">
                          {feature.icon}
                        </span>
                        <span className="text-sm text-gray-600">
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3 border-t border-neutral-200 pt-4">
                    <h4 className="mb-3 text-base font-medium text-gray-900">
                      {plan.includes[0]}
                    </h4>
                    <ul className="space-y-2 font-semibold">
                      {plan.includes.slice(1).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <span className="mr-3 mt-0.5 grid h-6 w-6 place-content-center rounded-full border border-blue-500 bg-green-50">
                            <CheckCheck className="h-4 w-4 text-blue-500" />
                          </span>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TimelineContent>
          );
        })}
      </div>

      <div className="mx-auto max-w-7xl rounded-xl border border-neutral-200 bg-white p-6 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Need extra solver tokens?
          </h3>
          <p className="mt-0.5 text-xs text-gray-600">
            Top up your submission balance starting at ₹49 for 20 additional
            tokens.
          </p>
        </div>
        <Link
          href="/tokens"
          className="mt-4 inline-block rounded-lg border border-blue-500 px-5 py-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 sm:mt-0"
        >
          View Token Packs
        </Link>
      </div>
    </div>
  );
}
