import Link from 'next/link';
import styles from './page.module.css';
import Card from '@/components/Card';
import Logo from '@/components/Logo';

export const metadata = {
    title: 'Termos de Uso - Aura Palette',
    description: 'Termos de uso do serviço Aura Palette.',
};

export default function TermosPage() {
    return (
        <main className={styles.page}>
            <div className={styles.orbPrimary} />

            <div className={styles.container}>
                <div className={styles.header}>
                    <Link href="/">
                        <Logo />
                    </Link>
                </div>

                <Card className={styles.content}>
                    <h1 className={styles.title}>Termos de Uso</h1>
                    <p className={styles.lastUpdate}>
                        Última atualização: 11 de janeiro de 2026
                    </p>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>1. Aceitação dos Termos</h2>
                        <p className={styles.text}>
                            Ao acessar e usar o serviço Aura Palette, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>2. Descrição do Serviço</h2>
                        <p className={styles.text}>
                            O Aura Palette é um serviço de análise de colorimetria pessoal que utiliza inteligência artificial para analisar fotografias e fornecer recomendações personalizadas de paleta de cores. O serviço inclui:
                        </p>
                        <ul className={styles.list}>
                            <li>Análise de tom de pele, olhos e cabelo</li>
                            <li>Identificação de temperatura e subtom</li>
                            <li>Determinação da estação pessoal de cores</li>
                            <li>Recomendações de cores para moda, maquiagem e acessórios</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>3. Uso do Serviço</h2>
                        <p className={styles.text}>
                            Você concorda em:
                        </p>
                        <ul className={styles.list}>
                            <li>Fornecer informações precisas e verdadeiras</li>
                            <li>Enviar apenas fotos suas ou com autorização do titular</li>
                            <li>Não usar o serviço para fins ilegais ou não autorizados</li>
                            <li>Não tentar acessar áreas restritas do sistema</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>4. Pagamento e Reembolso</h2>
                        <p className={styles.text}>
                            O relatório completo de colorimetria é oferecido mediante pagamento único. Oferecemos garantia de satisfação de 7 (sete) dias. Caso não esteja satisfeito com o serviço, entre em contato conosco para solicitar reembolso integral dentro deste período.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>5. Propriedade Intelectual</h2>
                        <p className={styles.text}>
                            Todo o conteúdo do Aura Palette, incluindo textos, gráficos, logos, ícones e software, é propriedade exclusiva da empresa e protegido por leis de direitos autorais. O relatório gerado é para uso pessoal e não comercial.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>6. Limitação de Responsabilidade</h2>
                        <p className={styles.text}>
                            As recomendações fornecidas pelo Aura Palette são baseadas em análise por inteligência artificial e têm caráter sugestivo. Não garantimos resultados específicos. O serviço não substitui consultoria profissional de imagem.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>7. Modificações</h2>
                        <p className={styles.text}>
                            Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas por e-mail. O uso continuado do serviço após as modificações constitui aceitação dos novos termos.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>8. Contato</h2>
                        <p className={styles.text}>
                            Para dúvidas sobre estes Termos de Uso, entre em contato através do e-mail: contato@aurapalette.com.br
                        </p>
                    </section>

                    <Link href="/" className={styles.backLink}>
                        ← Voltar para a página inicial
                    </Link>
                </Card>
            </div>
        </main>
    );
}
