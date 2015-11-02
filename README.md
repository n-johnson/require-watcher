# require-watcher

Watches the node.js require module cache and emits events when modules are loaded.

```
var watch = require('require-watcher')(require);

watch.on('add', function(data){ console.log('ADD: ', data); });
```
