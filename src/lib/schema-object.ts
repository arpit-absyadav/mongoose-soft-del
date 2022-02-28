export default function createSchemaObject(
  typeKey: any,
  typeValue: any,
  options: any,
) {
  // eslint-disable-next-line no-param-reassign
  options[typeKey] = typeValue;
  return options;
}
