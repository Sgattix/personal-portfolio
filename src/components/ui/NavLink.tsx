import Link from "next/link";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-lg text-white border-dotted border-b-2 border-transparent hover:border-[#2D6BFB] transition-all">{children}</Link>
        </li>
    );
}

export default NavLink;