'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarItem({ item }: {
    item: {
        link: string,
        text: string
    }
}) {

    const pathname = usePathname()
    
    return (
        <Link
            className={`w-full px-4 py-2 hover:bg-slate-100 inline-block ${pathname === item.link ? 'bg-slate-100' : ''}`}
            href={item.link}
            key={'LinkTo' + item.text}>
            {item.text}
        </Link>
    )
}