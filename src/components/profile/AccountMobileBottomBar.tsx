import Link from 'next/link';
import { MessageCircle, Plus } from 'lucide-react';

export function AccountMobileBottomBar() {
  return (
    <div className="bg-[#d9d9d9] md:hidden">
      <div className="mx-auto flex h-[92px] max-w-[960px] items-center justify-between px-7">
        <Link href="/aiclips" className="text-[22px] leading-none text-slate-900">
          AIClips
        </Link>

        <button
          type="button"
          aria-label="Добавить объявление"
          className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-white/35 text-slate-900"
        >
          <Plus className="h-9 w-9" strokeWidth={1.8} />
        </button>

        <Link
          href="/aichat"
          aria-label="AIChat"
          className="flex h-[52px] w-[52px] items-center justify-center text-slate-700"
        >
          <MessageCircle className="h-10 w-10" strokeWidth={1.8} />
        </Link>
      </div>
    </div>
  );
}