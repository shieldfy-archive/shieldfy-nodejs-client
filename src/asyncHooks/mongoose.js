/**
 * This file is taken from : mongoosejs/mongoose-async-hooks (https://github.com/mongoosejs/mongoose-async-hooks)
 * embedded here for custom modifications
 */
const asyncHooks = require('async_hooks');

module.exports = (schema, options) => {
  schema.statics.$wrapCallback = function(callback) {
    var _this = this;
    const resourceName = `mongoose.${this.modelName}`;
    const resource = new asyncHooks.AsyncResource(resourceName);
    return function() {
      let emittedAfter = false;
      const args = Array.prototype.slice.call(arguments, 0);
      try {
        args.unshift(callback, null);
        if (resource.runInAsyncScope) {
          resource.runInAsyncScope.apply(resource, args);
          return;
        }
        resource.emitBefore();
        callback.apply(null, args);
        emittedAfter = true;
        resource.emitAfter();
      } catch (error) {
        if (!emittedAfter) {
          resource.emitAfter();
        }
        _this.emit('error', error);
      }
    };
  };
};