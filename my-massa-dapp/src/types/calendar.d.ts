import type React from "react"
import type { ComponentProps } from "react"
import type { DayPicker } from "react-day-picker"

declare module "react-day-picker" {
  interface DayPickerCustomComponents {
    IconLeft?: React.ComponentType<{ props?: unknown }>
    IconRight?: React.ComponentType<{ props?: unknown }>
  }
}

export type CalendarProps = ComponentProps<typeof DayPicker>