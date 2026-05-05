import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';
export const metadata: Metadata = {
  title: {
    default: '天商 ERP 系统 | ERP 智能客服助手',
    template: '%s | 天商 ERP 系统',
  },
  description: '天商 ERP 系统面向小微企业场景，支持客户、订单、库存、财务管理，并提供 ERP 智能客服助手对话交互。',
  keywords: [
    '天商ERP系统',
    '企业管理',
    '客户管理',
    '订单管理',
    '库存管理',
    '财务管理',
    '智能助手',
    '小微企业',
  ],
  authors: [{ name: 'Tianshang ERP Team' }],
  openGraph: {
    title: '天商 ERP 系统 | ERP 智能客服助手',
    description: '天商 ERP 系统面向小微企业场景的教学演示平台',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
