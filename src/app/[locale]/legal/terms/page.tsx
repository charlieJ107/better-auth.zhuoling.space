import { Locale } from "@/lib/i18n";

export default async function TermsPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const { default: Content } = await import(`@/content/terms-and-conditions-${locale}.mdx`);
    return (

        <Content />
    )
}