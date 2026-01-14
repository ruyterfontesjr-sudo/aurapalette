export default function CheckoutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ minHeight: 'auto', height: 'auto' }}>
            {children}
        </div>
    );
}
