"use client"

import { SipStepUpLiveCalculator } from "@/components/calculators/sip-stepup-live"

export function SipCalculator({ standalone = true }: { standalone?: boolean }) {
  if (standalone) {
    return (
      <section className="bg-[var(--section-warm)] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SipStepUpLiveCalculator />
        </div>
      </section>
    )
  }

  return (
    <div className="w-full">
      <SipStepUpLiveCalculator />
    </div>
  )
}
