type FormOptionsProps = {
  options: string[]
}

export function FormOptions({ options }: FormOptionsProps) {
  return options.map((option) => (
    <option key={option} value={option}>
      {option}
    </option>
  ))
}
