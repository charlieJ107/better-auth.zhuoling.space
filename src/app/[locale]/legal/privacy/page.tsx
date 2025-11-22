import { Locale } from "@/lib/i18n";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const { default: Content } = await import(`@/content/privacy-policy-${locale}.mdx`);
    return (
        <Content />
    )
}