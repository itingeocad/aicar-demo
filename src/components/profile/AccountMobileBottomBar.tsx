import Link from 'next/link';
import { MessageCircleMore, Plus } from 'lucide-react';

export function AccountMobileBottomBar() {
  return (
    <div className="bg-[#d9d9d9] md:hidden">
      <div className="mx-auto flex h-[102px] max-w-[960px] items-center justify-between px-8">
        <Link href="/aiclips" className="text-[22px] font-medium leading-none text-slate-900">
          AIClips
        </Link>

        <Link
          href="/sell"
          aria-label="Подать объявление"
          className="flex h-[66px] w-[66px] items-center justify-center rounded-full bg-white/85 text-slate-900"
        >
          <Plus className="h-10 w-10" strokeWidth={1.9} />
        </Link>

        <Link
          href="/aichat"
          aria-label="AIChat"
          className="flex h-[54px] w-[54px] items-center justify-center text-slate-700"
        >
          <MessageCircleMore className="h-11 w-11" strokeWidth={1.8} />
        </Link>
      </div>
    </div>
  );
}