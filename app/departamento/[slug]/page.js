import { notFound } from 'next/navigation';
import { getDepartment } from '../../../services/catalog/CatalogService';
import DepartmentClient from './DepartmentClient';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  const department = await getDepartment(slug);
  if (!department) return { title: 'No encontrado - AhorroYa' };

  return {
    metadataBase: new URL(SITE_URL),
    title: `${department.name} - Compara precios en supermercados y farmacias | AhorroYa`,
    description: department.description,
    openGraph: {
      title: `${department.name} - AhorroYa`,
      description: department.description,
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/departamento/${department.slug}` },
  };
}

export default async function DepartmentPage({ params }) {
  const slug = (await params).slug;
  const department = await getDepartment(slug);
  if (!department) notFound();

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Departamentos', url: '/departamentos' },
        { name: department.name },
      ]} />
      <WebSiteJsonLd />
      <DepartmentClient department={department} />
    </>
  );
}
