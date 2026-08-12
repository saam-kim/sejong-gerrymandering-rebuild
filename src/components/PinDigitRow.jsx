const INSTANCE_ATTR = "data-pin-row";

export default function PinDigitRow({ value, length, onChange, name = "pin", autoFocus = false }) {
  const digits = Array.from({ length }, (_, index) => value[index] || "");

  function focusInput(index) {
    const input = document.querySelector(`[${INSTANCE_ATTR}="${name}-${index}"]`);
    input?.focus();
  }

  function handleChange(index, event) {
    const clean = event.target.value.replace(/\D/g, "");
    if (!clean) {
      onChange(value.slice(0, index) + value.slice(index + 1));
      return;
    }

    const nextDigits = [...digits];
    clean
      .slice(0, length - index)
      .split("")
      .forEach((char, offset) => {
        nextDigits[index + offset] = char;
      });
    onChange(nextDigits.join("").slice(0, length));
    focusInput(Math.min(index + clean.length, length - 1));
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !digits[index] && index > 0) focusInput(index - 1);
    if (event.key === "ArrowLeft" && index > 0) focusInput(index - 1);
    if (event.key === "ArrowRight" && index < length - 1) focusInput(index + 1);
  }

  function handlePaste(event) {
    event.preventDefault();
    onChange(event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length));
  }

  return (
    <div className="flex justify-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          {...{ [INSTANCE_ATTR]: `${name}-${index}` }}
          inputMode="numeric"
          maxLength={1}
          autoFocus={autoFocus && index === 0}
          value={digit}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          className={`h-14 w-11 rounded-xl border-2 bg-white/[0.08] text-center text-2xl font-black text-white outline-none transition sm:h-[58px] sm:w-[46px] ${
            digit ? "border-indigo-400 bg-indigo-500/15" : "border-white/15"
          } focus:border-indigo-400 focus:bg-indigo-500/15`}
        />
      ))}
    </div>
  );
}
