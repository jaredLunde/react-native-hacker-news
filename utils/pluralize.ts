export function pluralize(
  count: number,
  singular: string,
  plural: string = singular + "s"
) {
  return `${count} ${count === 1 ? singular : plural}`;
}
