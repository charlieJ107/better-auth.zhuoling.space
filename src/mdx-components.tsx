import type { MDXComponents } from 'mdx/types'
import { getBrandingConfig } from '@/lib/branding'
import { BrandServiceDescriptionClient } from '@/components/branding-mdx'

// Branding components for MDX
export function BrandAppName() {
    const branding = getBrandingConfig();
    return <>{branding.appName}</>;
}

export function BrandPlatformName() {
    const branding = getBrandingConfig();
    return <>{branding.platformName}</>;
}

export function BrandServiceName() {
    const branding = getBrandingConfig();
    return <>{branding.serviceName}</>;
}

export function BrandCompanyName() {
    const branding = getBrandingConfig();
    return <>{branding.companyName}</>;
}

export function BrandLegalEmail() {
    const branding = getBrandingConfig();
    return <>{branding.contactEmail.legal}</>;
}

export function BrandPrivacyEmail() {
    const branding = getBrandingConfig();
    return <>{branding.contactEmail.privacy}</>;
}

export function BrandDPOEmail() {
    const branding = getBrandingConfig();
    return <>{branding.contactEmail.dpo}</>;
}

// Use client component for locale-aware service description
export function BrandServiceDescription() {
    return <BrandServiceDescriptionClient />;
}

const components: MDXComponents = {
    h1: ({ props, children }) => (<h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance" {...props}>{children}</h1>),
    h2: ({ props, children }) => (<h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0" {...props}>{children}</h2>),
    h3: ({ props, children }) => (<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight" {...props}>{children}</h3>),
    h4: ({ props, children }) => (<h4 className="scroll-m-20 text-xl font-semibold tracking-tight" {...props}>{children}</h4>),
    p: ({ props, children }) => (<p className="leading-7 not-first:mt-6" {...props}>{children}</p>),
    blockquote: ({ props, children }) => (<blockquote className="mt-6 border-l-2 pl-6 italic"{...props}>{children}</blockquote>),
    table: ({ props, children }) => (
        <div className="my-6 w-full overflow-y-auto">
            <table className="w-full" {...props}>{children}</table>
        </div>
    ),
    tr: ({props, children}) => (<tr className="even:bg-muted m-0 border-t p-0" {...props}>{children}</tr>),
    th: ({props, children}) => (<th className="border px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right" {...props}>{children}</th>),
    td: ({props, children}) => (<td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right" {...props}>{children}</td>),
    ul: ({props, children}) => (<ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props}>{children}</ul>),
    code: ({props, children}) => (<code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold" {...props}>{children}</code>),
    pre: ({props, children}) => (<pre className="text-muted-foreground text-xl" {...props}>{children}</pre>),
    big: ({props, children}) => (<big className="text-lg font-semibold" {...props}>{children}</big>),
    strong: ({props, children}) => (<strong className="text-lg font-semibold" {...props}>{children}</strong>),
    small: ({props, children}) => (<small className="text-sm leading-none font-medium" {...props}>{children}</small>),
    // Branding components
    BrandAppName,
    BrandPlatformName,
    BrandServiceName,
    BrandCompanyName,
    BrandLegalEmail,
    BrandPrivacyEmail,
    BrandDPOEmail,
    BrandServiceDescription,
}

export function useMDXComponents(): MDXComponents {
    return components
}