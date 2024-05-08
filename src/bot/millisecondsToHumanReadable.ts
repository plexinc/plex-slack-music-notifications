export default function millisecondsToHumanReadable(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const humanReadable = [
    {
      label: "d",
      value: days,
    },
    {
      label: "h",
      value: hours % 24,
    },
    {
      label: "m",
      value: minutes % 60,
    },
    {
      label: "s",
      value: seconds % 60,
    },
  ];

  return humanReadable
    .flatMap((item) => (item.value > 0 ? [`${item.value}${item.label}`] : []))
    .join(" ");
}
