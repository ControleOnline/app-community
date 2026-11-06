global.IS_REACT_ACT_ENVIRONMENT=true;
beforeEach(()=>{
  const data=new Map();
  global.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k),clear:()=>data.clear()};
});
