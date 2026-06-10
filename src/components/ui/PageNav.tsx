"use client";
import { FunctionComponent, useState } from "react";

interface PageNavProps {
    sections: string[];
}

const PageNav: FunctionComponent<PageNavProps> = ({ sections }) => {
    const sectionsIds = sections.map(section => section.toLowerCase().replace(/\s+/g, '-'));
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

    const handleSectionClick = (event: React.MouseEvent<HTMLAnchorElement>, index: number) => {
        event.preventDefault();
        const sectionId = sectionsIds[index];
        const sectionElement = document.getElementById(sectionId);
        sectionElement?.scrollIntoView({ behavior: "smooth" });
        setActiveSectionId(sectionId);
    };

    return <aside
    className="hidden fixed top-1/2 -left-40 transition-all lg:flex flex-row-reverse gap-4 z-20 rotate-270 bg-black/50 px-4 py-2 rounded-b-lg text-lg"
    >
        {sections.map((section, index) => (
            <a
                key={section}
                href={`#${sectionsIds[index]}`}
                className={`text-white ${activeSectionId === sectionsIds[index] ? "text-blue-500" : ""} transition-colors hover:text-blue-400`}
                onClick={event => handleSectionClick(event, index)}
            >
                {section}
            </a>
        ))}
    </aside>;
}
 
export default PageNav;