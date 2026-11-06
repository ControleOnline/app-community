const flatten=value=>Array.isArray(value)?Object.assign({},...value.map(flatten)):value || {};
module.exports={Platform:{OS:'web'},StyleSheet:{create:v=>v,flatten,absoluteFill:{}},View:'View',Text:'Text',TextInput:'TextInput',Pressable:'Pressable',ScrollView:'ScrollView',Modal:'Modal',useWindowDimensions:()=>({width:1440,height:900})};
