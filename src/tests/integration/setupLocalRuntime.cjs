// Import-time ERP device detection receives an empty, disposable memory store.
const memory=new Map();
global.localStorage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,String(value)),removeItem:key=>memory.delete(key)};
global.IS_REACT_ACT_ENVIRONMENT=true;
