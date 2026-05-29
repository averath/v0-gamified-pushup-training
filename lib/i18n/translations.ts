import { en } from "./locales/en"
import { pl } from "./locales/pl"

export const translations = { en, pl } as const

export type Language = keyof typeof translations
type WidenStrings<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? readonly WidenStrings<Item>[]
    : { [Key in keyof T]: WidenStrings<T[Key]> }

export type TranslationKey = WidenStrings<typeof translations.en>
