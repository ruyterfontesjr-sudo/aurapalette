import type { Metadata } from "next";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
    title: "Aura Palette - Análise de Colorimetria com IA | Descubra Suas Cores Ideais",
    description: "Descubra sua paleta de cores ideal com inteligência artificial. Análise de colorimetria pessoal online em 2 minutos. +50.000 brasileiras já descobriram suas cores ideais. Guia completo de maquiagem, cabelos, roupas e acessórios personalizados para seu tom de pele.",
    keywords: "colorimetria, colorimetria pessoal, análise de colorimetria, paleta de cores pessoal, coloração pessoal, teste de colorimetria, qual minha estação, cores que combinam comigo, consultoria de cores, colorimetria com IA, colorimetria online Brasil, descobrir minha estação, primavera verão outono inverno colorimetria, cores para meu tom de pele, análise de cores online, colorimetria brasileira, teste de cores gratuito, paleta de cores para morenas, paleta de cores para negras, paleta de cores para loiras, melhores cores para minha pele, colorimetria quente frio, subtom de pele, maquiagem para meu tom de pele",
    authors: [{ name: "Aura Palette" }],
    creator: "Aura Palette",
    publisher: "Aura Palette",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: "Aura Palette - Descubra Sua Paleta de Cores com IA",
        description: "Envie uma selfie e receba sua análise de colorimetria personalizada em 2 minutos. Dicas de maquiagem, cabelos, roupas e acessórios incluídas. Resultado imediato!",
        type: "website",
        locale: "pt_BR",
        siteName: "Aura Palette",
        url: "https://aurapalette.com.br",
        images: [
            {
                url: "https://aurapalette.com.br/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Aura Palette - Análise de Colorimetria com IA",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Aura Palette - Sua Paleta de Cores com IA",
        description: "Análise de colorimetria personalizada com inteligência artificial. Resultado em 2 minutos! +50.000 brasileiras já descobriram suas cores.",
        images: ["https://aurapalette.com.br/og-image.jpg"],
    },
    alternates: {
        canonical: "https://aurapalette.com.br",
        languages: {
            'pt-BR': 'https://aurapalette.com.br',
        },
    },
    category: "beauty",
    verification: {
        google: "", // Add Google Search Console verification
    },
    other: {
        "geo.region": "BR",
        "geo.placename": "Brasil",
        "content-language": "pt-BR",
        "rating": "general",
        "distribution": "global",
    },
    themeColor: "#0f0a19",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
    },
    icons: {
        icon: '/icon.png?v=4',
        shortcut: '/icon.png?v=4',
        apple: '/icon.png?v=4',
    },
};

// JSON-LD Schema for SEO - Multiple schemas for better coverage
const jsonLdWebApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Aura Palette",
    "description": "Análise de colorimetria pessoal com inteligência artificial. Descubra sua paleta de cores ideal.",
    "url": "https://aurapalette.com.br",
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "browserRequirements": "Requires JavaScript",
    "offers": {
        "@type": "Offer",
        "price": "47.00",
        "priceCurrency": "BRL",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2026-12-31"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "1847",
        "bestRating": "5",
        "worstRating": "1"
    }
};

const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Aura Palette",
    "url": "https://aurapalette.com.br",
    "logo": "https://aurapalette.com.br/logo.png",
    "description": "Plataforma de análise de colorimetria pessoal com inteligência artificial",
    "sameAs": [
        "https://instagram.com/aurapalette"
    ],
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": "Portuguese"
    }
};

const jsonLdFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "O que é colorimetria pessoal?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Colorimetria pessoal é uma técnica que identifica as cores que mais harmonizam com seu tom de pele, olhos e cabelo. Com a análise, você descobre sua estação (Primavera, Verão, Outono ou Inverno) e recebe uma paleta personalizada de cores."
            }
        },
        {
            "@type": "Question",
            "name": "Como funciona a análise de colorimetria com IA?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Você responde um quiz rápido, envia uma selfie com boa iluminação, e nossa inteligência artificial analisa seu tom de pele, subtom e contraste. Em menos de 2 minutos, você recebe um relatório completo com sua paleta de cores ideal."
            }
        },
        {
            "@type": "Question",
            "name": "A análise de colorimetria online é confiável?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim! Nossa IA foi treinada com milhares de análises profissionais e tem precisão superior a 95%. Além disso, oferecemos garantia de 7 dias - se não ficar satisfeita, devolvemos seu dinheiro."
            }
        },
        {
            "@type": "Question",
            "name": "Quanto custa a análise de colorimetria?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "A análise completa custa apenas R$47,00 (pagamento único). Você recebe acesso vitalício ao seu relatório com paleta de cores, dicas de maquiagem, cabelos, roupas e acessórios."
            }
        }
    ]
};

const jsonLdService = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Análise de Colorimetria Pessoal",
    "provider": {
        "@type": "Organization",
        "name": "Aura Palette"
    },
    "areaServed": {
        "@type": "Country",
        "name": "Brasil"
    },
    "description": "Análise de colorimetria pessoal online com inteligência artificial. Descubra sua paleta de cores ideal em 2 minutos.",
    "offers": {
        "@type": "Offer",
        "price": "47.00",
        "priceCurrency": "BRL"
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <head>
                {/* Theme color for mobile status bar */}
                <meta name="theme-color" content="#0f0a19" />
                <meta name="msapplication-navbutton-color" content="#0f0a19" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="mobile-web-app-capable" content="yes" />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebApplication) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdService) }}
                />
                {/* Google Tag Manager - Replace GTM-XXXXXX with actual ID */}
                {process.env.NEXT_PUBLIC_GTM_ID && (
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                                })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
                            `
                        }}
                    />
                )}

                {/* Google Ads (gtag.js) */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17872778006" />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', 'AW-17872778006');
                        `
                    }}
                />
            </head>
            <body>
                {/* Google Tag Manager (noscript) */}
                {process.env.NEXT_PUBLIC_GTM_ID && (
                    <noscript>
                        <iframe
                            src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
                            height="0"
                            width="0"
                            style={{ display: 'none', visibility: 'hidden' }}
                        />
                    </noscript>
                )}
                <ScrollToTop />
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
