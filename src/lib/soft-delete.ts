/* eslint-disable prefer-rest-params */
import * as mongoose from 'mongoose';
const { Model } = mongoose;

import parseIndexFields from './index-field-parser';
import createSchemaObject from './schema-object';
import parseUpdateArguments from './parse-update-args';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default function softDelete(schema: any, options: any) {
  options = options || {};

  const indexFields = parseIndexFields(options);

  const { typeKey } = schema.options;

  schema.add({
    deleted: createSchemaObject(typeKey, Boolean, {
      default: false,
      index: indexFields.deleted,
    }),
    deleted_at: createSchemaObject(typeKey, Date, {
      default: null,
      index: indexFields.deleted_at,
    }),
  });

  schema.pre('save', function (this: any, next: any) {
    if (!this.deleted) {
      this.deleted = false;
    }
    next();
  });

  if (options.paranoid) {
    const overrideItems = options.overrideMethods;
    const overridableMethods = [
      'count',
      'countDocuments',
      'find',
      'findOne',
      'findOneAndUpdate',
      'update',
    ];
    let finalList: any = [];

    if (
      (typeof overrideItems === 'string' || overrideItems instanceof String) &&
      overrideItems === 'all'
    ) {
      finalList = overridableMethods;
    }

    if (typeof overrideItems === 'boolean' && overrideItems === true) {
      finalList = overridableMethods;
    }

    if (Array.isArray(overrideItems)) {
      overrideItems.forEach((method) => {
        if (overridableMethods.indexOf(method) > -1) {
          finalList.push(method);
        }
      });
    }

    finalList.forEach((method: any) => {
      if (['count', 'countDocuments', 'find', 'findOne'].indexOf(method) > -1) {
        let modelMethodName: any = method;
        if (
          method === 'countDocuments' &&
          typeof Model.countDocuments !== 'function'
        ) {
          modelMethodName = 'count';
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        schema.statics[method] = function () {
          // eslint-disable-next-line prefer-rest-params
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const fn: any = Model[modelMethodName].apply(this, arguments);
          if (fn.options.paranoid !== false) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const modelFn = Model[modelMethodName]
              // eslint-disable-next-line prefer-rest-params
              .apply(this, arguments)
              .where('deleted')
              .ne(true);
            return modelFn;
          }
          return fn;
        };
      } else {
        schema.statics[method] = function () {
          // const args = parseUpdateArguments.apply(undefined, arguments);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const args = parseUpdateArguments(...arguments);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (Object.keys(args[1]) !== 'paranoid') {
            args[0].deleted = { $ne: true };
          }

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return Model[method].apply(this, args);
        };
      }
    });
  }

  schema.methods.destroy = function () {
    this.deleted = true;

    if (schema.path('deleted_at')) {
      this.deleted_at = new Date();
    }

    if (options.validateBeforeDelete === false) {
      return this.save({ validateBeforeSave: false });
    }

    return this.save();
  };

  schema.statics.destroy = function (conditions: any) {
    const doc: any = {
      deleted: true,
    };

    if (schema.path('deleted_at')) {
      doc.deleted_at = new Date();
    }

    return this.update(conditions, doc, { multi: true });
  };

  schema.methods.restore = function () {
    this.deleted = false;
    this.deleted_at = undefined;
    return this.save();
  };

  schema.statics.restore = function (conditions: any) {
    const doc = {
      deleted: false,
      deleted_at: undefined,
      deletedBy: undefined,
    };

    return this.update(conditions, doc, { multi: true });
  };
}
