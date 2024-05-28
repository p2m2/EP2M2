export default defineNuxtRouteMiddleware(async (to, from) => {

  // skip middleware on server
  if (import.meta.server) return
 
  // when we open login page we do nothing
  if (from.path == '/login'){
    abortNavigation()
  }
  if (to.path == '/login') {
    return
  }
  
  const token = useCookie("token",{sameSite:"strict"});
  const team = useCookie("team",{sameSite:"strict"});
  
  if (token.value && team.value){
    
    const data  = await $fetch("/api/checkToken", {
      method: "POST",
      headers:{
          "Content-Type":"text/plain"
      },
      body: token.value.toString()
    });
  
    // user is log yet
    if (data){
      // Go to page ask
      return
    }
  }
  // Go to login and indicate page to go back after login
  return navigateTo({
    path:'/login',
    query:{
      page: from.path
    }});
})
  