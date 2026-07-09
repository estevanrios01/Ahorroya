export const metadata = {
    title: "AhorroYa - Compara Precios",
    description: "Plataforma Nacional de Comparación de Precios de Supermercados y Farmacias de Colombia."
};

export default function WebLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body>
                {children}
            </body>
        </html>
    );
}
