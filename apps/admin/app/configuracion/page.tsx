export default function AdminConfiguracion() {
    const sections = [
        {
            title: 'Programación de Scrapers',
            fields: [
                { label: 'Intervalo de ejecución', value: 'Cada 6 horas' },
                { label: 'Horario inicio', value: '06:00 AM' },
                { label: 'Reintentos fallidos', value: '3' },
                { label: 'Timeout máximo', value: '300 segundos' },
            ]
        },
        {
            title: 'API Keys',
            fields: [
                { label: 'OpenAI API Key', value: 'sk-****4321' },
                { label: 'Stripe API Key', value: 'sk_live_****7890' },
                { label: 'SendGrid API Key', value: 'SG.****abcd' },
                { label: 'Cloudinary API Key', value: '****5678' },
            ]
        },
        {
            title: 'Configuración de Correo',
            fields: [
                { label: 'SMTP Host', value: 'smtp.sendgrid.net' },
                { label: 'SMTP Puerto', value: '587' },
                { label: 'Correo remitente', value: 'noreply@ahorroya.com' },
                { label: 'Notificaciones activas', value: 'Sí' },
            ]
        },
        {
            title: 'Sistema',
            fields: [
                { label: 'Modo mantenimiento', value: 'No' },
                { label: 'Registro de auditoría', value: 'Activado' },
                { label: 'Cache de productos', value: '15 minutos' },
                { label: 'Versión app', value: '2.4.1' },
            ]
        },
    ];

    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Configuración de la Aplicación</h2>
            <div className="grid grid-cols-2 gap-6">
                {sections.map((section) => (
                    <div key={section.title} className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                        <h3 className="mb-4 text-lg font-semibold">{section.title}</h3>
                        <div className="space-y-3">
                            {section.fields.map((field) => (
                                <div key={field.label} className="flex items-center justify-between border-b border-slate-800 pb-2 last:border-0">
                                    <span className="text-sm text-slate-400">{field.label}</span>
                                    <span className="text-sm">{field.value}</span>
                                </div>
                            ))}
                        </div>
                        <button className="mt-4 text-sm text-cyan-400 hover:text-cyan-300">Editar</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
