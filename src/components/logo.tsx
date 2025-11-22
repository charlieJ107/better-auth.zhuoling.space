import Image from "next/image";
import { getBrandingValue } from "@/lib/branding";

// Disable eslint unexpected any
/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Logo(props: { 
    className?: string,
    width?: number,
    height?: number,
    alt?: string,
    src?: string,
    title?: string,
    [key: string]: any 
}) {
    const title = props.title || getBrandingValue('platformName');
    return (
        <div className={props.className} {...props}>
            <Image src={props.src || "/static/images/icon.svg"} alt={props.alt || title} width={props.width || 72} height={props.height || 72} />
            <span className="text-2xl font-bold">{title}</span>
        </div>
    );
}
