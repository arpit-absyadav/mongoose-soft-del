export default function parseIndexFields(options: any) {
  const indexFields = {
    deleted: false,
    deleted_at: false,
  };

  if (!options.indexFields) {
    return indexFields;
  }

  if (
    (typeof options.indexFields === 'string' ||
      options.indexFields instanceof String) &&
    options.indexFields === 'all'
  ) {
    indexFields.deleted = indexFields.deleted_at = true;
  }

  if (
    typeof options.indexFields === 'boolean' &&
    options.indexFields === true
  ) {
    indexFields.deleted = indexFields.deleted_at = true;
  }

  if (Array.isArray(options.indexFields)) {
    indexFields.deleted = options.indexFields.indexOf('deleted') > -1;
    indexFields.deleted_at = options.indexFields.indexOf('deleted_at') > -1;
  }

  return indexFields;
}
