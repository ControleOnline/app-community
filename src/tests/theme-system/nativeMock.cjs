const flatten=value=>Array.isArray(value)?Object.assign({},...value.map(flatten)):value || {};
const normalizeColor=require('@react-native/normalize-colors');
const processColor=value=>{
  const rgba=normalizeColor(value);
  return typeof rgba==='number' ? ((rgba << 24) | (rgba >>> 8)) >>> 0 : undefined;
};
module.exports={processColor,Platform:{OS:'web'},StyleSheet:{create:v=>v,flatten,absoluteFill:{}},View:'View',Text:'Text',TextInput:'TextInput',Pressable:'Pressable',Switch:'Switch',ScrollView:'ScrollView',Modal:'Modal',useWindowDimensions:()=>({width:1440,height:900})};
