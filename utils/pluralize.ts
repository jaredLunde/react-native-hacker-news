export function pluralize(
  count: number,
  singular: string,
  plural: string = singular + "s"
) {
  if (count === 1) {
    return `${count} ${singular}`;
  }

  return `${count} ${plural}`;
}
