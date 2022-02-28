import softDelete from './lib/soft-delete';

export default function (schema: any, options: any) {
  if (options.paranoid) {
    // deletedAt should be default.
    softDelete(schema, options);
  }
}
