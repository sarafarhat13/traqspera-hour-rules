// Helpers to read values from Modus web-component input events in a type-safe
// way. Modus emits its change events from the host element, which exposes the
// current `value` (string for text/select, boolean for checkbox/switch).

export function readStringValue(e: { target: EventTarget | null }): string {
  return (e.target as unknown as { value?: string })?.value ?? '';
}

export function readBooleanValue(e: { target: EventTarget | null }): boolean {
  const host = e.target as unknown as { value?: boolean; checked?: boolean };
  if (typeof host?.value === 'boolean') return host.value;
  return Boolean(host?.checked);
}
