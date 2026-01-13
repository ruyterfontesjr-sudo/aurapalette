import Link from 'next/link';
import styles from '../termos/page.module.css';
import Card from '@/components/Card';
import Logo from '@/components/Logo';

export const metadata = {
    title: 'Política de Privacidade - AuraPalette',
    description: 'Política de privacidade do serviço AuraPalette.',
};

export default function PrivacidadePage() {
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
                    <h1 className={styles.title}>Política de Privacidade</h1>
                    <p className={styles.lastUpdate}>
                        Última atualização: 11 de janeiro de 2026
                    </p>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>1. Informações que Coletamos</h2>
                        <p className={styles.text}>
                            Coletamos as seguintes informações quando você utiliza o AuraPalette:
                        </p>
                        <ul className={styles.list}>
                            <li><strong>Dados pessoais:</strong> Nome e endereço de e-mail fornecidos no cadastro</li>
                            <li><strong>Fotografias:</strong> Imagens enviadas para análise de colorimetria</li>
                            <li><strong>Respostas do quiz:</strong> Informações sobre suas preferências e características</li>
                            <li><strong>Dados de pagamento:</strong> Processados de forma segura pelo Stripe</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>2. Como Usamos suas Informações</h2>
                        <p className={styles.text}>
                            Utilizamos suas informações para:
                        </p>
                        <ul className={styles.list}>
                            <li>Gerar sua análise de colorimetria personalizada</li>
                            <li>Processar pagamentos de forma segura</li>
                            <li>Enviar seu relatório e atualizações importantes</li>
                            <li>Melhorar nossos serviços e experiência do usuário</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>3. Processamento de Imagens</h2>
                        <p className={styles.text}>
                            Suas fotografias são processadas por inteligência artificial para análise de colorimetria. As imagens são:
                        </p>
                        <ul className={styles.list}>
                            <li>Utilizadas exclusivamente para gerar sua análise</li>
                            <li>Não são armazenadas permanentemente em nossos servidores</li>
                            <li>Não são compartilhadas com terceiros</li>
                            <li>Processadas de forma criptografada</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>4. Compartilhamento de Dados</h2>
                        <p className={styles.text}>
                            Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
                        </p>
                        <ul className={styles.list}>
                            <li><strong>Stripe:</strong> Para processamento seguro de pagamentos</li>
                            <li><strong>OpenAI:</strong> Para processamento de análise de imagem (dados anonimizados)</li>
                            <li><strong>Obrigações legais:</strong> Quando exigido por lei</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>5. Segurança</h2>
                        <p className={styles.text}>
                            Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, incluindo criptografia SSL, servidores seguros e acesso restrito aos dados.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>6. Seus Direitos</h2>
                        <p className={styles.text}>
                            De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
                        </p>
                        <ul className={styles.list}>
                            <li>Acessar seus dados pessoais</li>
                            <li>Corrigir dados incompletos ou desatualizados</li>
                            <li>Solicitar a exclusão dos seus dados</li>
                            <li>Revogar o consentimento a qualquer momento</li>
                            <li>Solicitar portabilidade dos dados</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>7. Cookies</h2>
                        <p className={styles.text}>
                            Utilizamos cookies essenciais para o funcionamento do serviço e cookies analíticos para entender como nosso site é utilizado. Você pode configurar seu navegador para recusar cookies.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>8. Retenção de Dados</h2>
                        <p className={styles.text}>
                            Mantemos seus dados pelo tempo necessário para fornecer o serviço. Dados de transações são mantidos conforme exigências legais e fiscais. Você pode solicitar a exclusão dos seus dados a qualquer momento.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>9. Contato</h2>
                        <p className={styles.text}>
                            Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato:
                        </p>
                        <p className={styles.text}>
                            E-mail: privacidade@aurapalette.com.br
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
