import './globals.css'; import type {Metadata} from 'next'
export const metadata:Metadata={title:'Tri4Swim | Private Swim Lessons',description:'Private swim lessons for kids and adults.',icons:{icon:'/icon.png'}}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
