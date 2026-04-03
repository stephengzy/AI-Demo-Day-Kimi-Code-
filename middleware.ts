import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  // 如果已经是首页，不做处理
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next()
  }
  
  // 其他所有路由重定向到首页（下线页面）
  return NextResponse.redirect(new URL('/', request.url))
}
 
// 匹配所有路由
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
}
