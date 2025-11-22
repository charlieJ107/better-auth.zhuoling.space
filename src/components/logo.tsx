import Image from "next/image";

// Disable eslint unexpected any
/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Logo(props: { className?: string, [key: string]: any }) {
    const appName = process.env.APP_NAME;
    if (!appName) {
        throw new Error("APP_NAME is not set");
    }
    return (
        <div className={props.className} {...props}>
            <Image src="/static/images/icon.svg" alt="Logo" width={72} height={72} />
            <span className="text-2xl font-bold sr-only">{appName}</span>
        </div>
    );
}
