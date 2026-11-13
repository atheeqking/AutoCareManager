type Props = { value: string; onChange: (value: string) => void }

export function PhoneInput({ value, onChange }: Props) {
  return <label className="block text-sm">Phone number
    <input type="tel" inputMode="numeric" autoComplete="tel-national" required
      pattern="[0-9]{10}" maxLength={10} title="Enter exactly 10 digits."
      className="mt-1 w-full rounded-md border border-slate-300 bg-white p-3"
      value={value} onChange={event => onChange(event.target.value.replace(/\D/g, '').slice(0, 10))} />
    <span className="mt-1 block text-xs text-slate-500">10 digits, without a country code.</span>
  </label>
}
