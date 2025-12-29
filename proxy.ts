
import { NextResponse, NextRequest } from "next/server";
import { authRoutes, privateRoutes } from "./config/routes";



export function proxy(request: NextRequest) {

  let pathName = request.nextUrl.pathname
  let cookie = request.cookies.get("Auth-cookie")?.value || ''

  // console.log("user request this page" , pathName)
  // console.log("user have auth cookie ?" , cookie)


  if (authRoutes.includes(pathName) && cookie) { // if user is trying to access login/signup and have cookie then send them back from where they came
    // console.log("first if is running")

    const redirect = request.nextUrl.searchParams.get('redirect') || "/"
    const url = new URL(redirect, request.nextUrl)

    return NextResponse.redirect(url)

  }


  if (privateRoutes.includes(pathName) && !cookie) { // if user is going to a protected page (/profile) and have no cookie  send them back to login/signup
    // console.log("second if is running")


    const newURl = new URL('/signin', request.nextUrl)
    newURl.searchParams.set('redirect', pathName)

    return NextResponse.redirect(newURl)
  }

  // console.log("running last return")
  return NextResponse.next()

}



export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - about (About page)  <-- Added here
     */
    '/((?!api|_next/static|_next/image|favicon.ico|About).+)',
  ],
}