const asyncHooks = require('async_hooks');



function hook(Client)
{
    const transactions = new Map();

    Object.defineProperty(Client, '_currentRequest', {
        get () {
          const asyncId = asyncHooks.executionAsyncId()
          return transactions.has(asyncId) ? transactions.get(asyncId) : null
        },
        set (request) {
          const asyncId = asyncHooks.executionAsyncId()
          transactions.set(asyncId, request)
        }
    });

    const asyncHook = asyncHooks.createHook({ init, destroy });

    function init(asyncId, type, triggerId, resource) {
        if (type === 'TIMERWRAP') return
        transactions.set(asyncId, Client._currentRequest)
    }

    function destroy(asyncId) {
        if (!transactions.has(asyncId)) return // in case type === TIMERWRAP
        transactions.delete(asyncId)
    }

    asyncHook.enable();

}

module.exports = hook;
