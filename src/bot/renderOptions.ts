import escapeHtml from "./escapeHtml";

export default function renderOptions(
  options: Record<string, readonly [string, string][]>
): string {
  return Object.entries(options)
    .map(
      ([optgroupLabel, optgroupOptions]: [
        string,
        readonly [string, string][]
      ]) => {
        return `<optgroup label="${escapeHtml(optgroupLabel)}">${optgroupOptions
          .map(([value, label]) => {
            return `<option value="${escapeHtml(value)}">${escapeHtml(
              label
            )}</option>`;
          })
          .join("\n")}</optgroup>`;
      }
    )
    .join("\n");
}
