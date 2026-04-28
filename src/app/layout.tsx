import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
export const metadata: Metadata = {
  title: {
    default: 'ERP 智能助手 | 小微企业管理系统',
    template: '%s | ERP 智能助手',
  },
  description: '面向小微企业的ERP教学演示系统，支持客户管理、订单管理、库存管理、财务管理等核心功能，以及AI智能助手对话交互。',
  keywords: [
    'ERP系统',
    '企业管理',
    '客户管理',
    '订单管理',
    '库存管理',
    '财务管理',
    '智能助手',
    '小微企业',
  ],
  authors: [{ name: 'ERP Team' }],
  openGraph: {
    title: 'ERP 智能助手 | 小微企业管理系统',
    description: '面向小微企业的ERP教学演示系统',
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
      </body>
    </html>
  );
}
