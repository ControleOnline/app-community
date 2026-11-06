const auth={getters:{isLogged:true,user:{id:1}},actions:{logIn(user){auth.getters.isLogged=!!user;auth.getters.user=user;}}};
module.exports={useStore:()=>auth,auth};
