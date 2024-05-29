// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

//  This middleware verify if use logged

export default defineNuxtRouteMiddleware(async (to, from) => {
  
  // when we open login page we do nothing
  if (from.path == '/login'){
    return abortNavigation();
  }
  if (to.path == '/login') {
    return
  }
  
  // get cookies
  const token = useCookie("token",{sameSite:"strict"});
  const team = useCookie("team",{sameSite:"strict"});

  // if we have cookie, we check if we have the token
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
  