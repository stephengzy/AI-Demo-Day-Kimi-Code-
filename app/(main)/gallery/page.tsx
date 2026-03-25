import { Suspense } from 'react';
import GalleryContent from './GalleryContent';

// 禁用静态生成，强制动态渲染
export const dynamic = 'force-dynamic';

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-60px)] flex items-center justify-center">
        <div className="text-on-surface-variant">加载中...</div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}
