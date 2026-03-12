import Link from 'next/link';
import { ChevronDown, Plus, Search } from 'lucide-react';

function FaqRow({
  question,
  defaultOpen = false,
  children
}: {
  question: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <details
      className="border-b border-black/15 py-4"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        {defaultOpen ? <span className="text-slate-500">−</span> : <Plus className="h-4 w-4 text-slate-500" />}
      </summary>

      {children ? <div className="pt-4 text-[14px] leading-6 text-slate-700">{children}</div> : null}
    </details>
  );
}

function PromptBox() {
  return (
    <div className="mx-auto mt-8 max-w-[760px]">
      <div className="mb-5 flex justify-center">
        <Link
          href="/search"
          className="inline-flex h-[44px] min-w-[180px] items-center justify-center rounded-[10px] bg-[#7f889c] px-6 text-[15px] font-medium text-white transition hover:bg-[#737c90]"
        >
          Начни чат
        </Link>
      </div>

      <div className="rounded-[10px] bg-[#d9d9d9] p-3 md:p-4">
        <div className="flex items-center gap-3 rounded-[8px] bg-white px-4 py-3 ring-1 ring-black/5">
          <Search className="h-5 w-5 flex-none text-slate-500" />
          <div className="truncate text-[13px] text-slate-600 md:text-[14px]">
            Семейный автомобиль, внедорожник. От 2020 года и выше. Полная комплектация...
          </div>
        </div>
      </div>
    </div>
  );
}

export function AIChatPage() {
  return (
    <>
      <div className="hidden md:block">
        <section className="aicar-container py-12">
          <h1 className="text-center text-[52px] font-semibold tracking-[-0.02em] text-slate-900">
            AIChat
          </h1>

          <div className="mx-auto mt-6 max-w-[980px] text-center text-[15px] leading-7 text-slate-700">
            <p>
              Наш интеллектуальный помощник поможет вам подобрать автомобиль быстро, точно и без лишних шагов.
            </p>
            <p className="mt-4">
              Просто укажите желаемый бюджет, марку, тип кузова, год выпуска или другие параметры — и AI
              мгновенно проанализирует предложения, сравнит характеристики и предложит оптимальные варианты.
            </p>
          </div>

          <PromptBox />
        </section>

        <section className="aicar-container pb-16">
          <h2 className="text-center text-[28px] font-semibold tracking-[-0.02em] text-slate-900">
            Частые вопросы
          </h2>

          <div className="mx-auto mt-10 max-w-[980px]">
            <FaqRow question="Что умеет AIChat?" defaultOpen>
              <ul className="list-disc space-y-1 pl-5">
                <li>Подбор авто по бюджету и предпочтениям</li>
                <li>Сравнение нескольких моделей</li>
                <li>Рекомендации на основе ваших запросов</li>
                <li>Анализ комплектации и характеристик</li>
                <li>Подсказки по выгодности предложения</li>
              </ul>
            </FaqRow>

            <FaqRow question="Что такое AI-чат по подбору автомобиля?" />
            <FaqRow question="Нужно ли регистрироваться, чтобы воспользоваться AI-чатом?" />
            <FaqRow question="Насколько точны рекомендации?" />
          </div>
        </section>
      </div>

      <div className="md:hidden">
        <section className="aicar-container py-8">
          <h1 className="text-center text-[24px] font-semibold tracking-[-0.02em] text-slate-900">
            AIChat
          </h1>

          <div className="mx-auto mt-5 max-w-[320px] text-center text-[14px] leading-6 text-slate-700">
            <p>
              Наш интеллектуальный помощник поможет вам подобрать автомобиль быстро, точно и без лишних шагов.
            </p>
            <p className="mt-4">
              Просто укажите желаемый бюджет, марку, тип кузова, год выпуска или другие параметры — и AI мгновенно
              проанализирует предложения, сравнит характеристики и предложит оптимальные варианты.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-[320px]">
            <div className="mb-4 flex justify-center">
              <Link
                href="/search"
                className="inline-flex h-[42px] min-w-[168px] items-center justify-center rounded-[10px] bg-[#7f889c] px-5 text-[14px] font-medium text-white"
              >
                Начни чат
              </Link>
            </div>

            <div className="rounded-[10px] bg-[#d9d9d9] p-3">
              <div className="flex items-center gap-3 rounded-[8px] bg-white px-3 py-3 ring-1 ring-black/5">
                <Search className="h-4 w-4 flex-none text-slate-500" />
                <div className="truncate text-[12px] text-slate-600">
                  Семейный автомобиль, внедорожник. От 2020 ...
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="aicar-container pb-12">
          <h2 className="text-center text-[22px] font-semibold tracking-[-0.02em] text-slate-900">
            Частые вопросы
          </h2>

          <div className="mx-auto mt-8 max-w-[340px]">
            <FaqRow question="Что умеет AIChat?" defaultOpen>
              <ul className="list-disc space-y-1 pl-5">
                <li>Подбор авто по бюджету и предпочтениям</li>
                <li>Сравнение нескольких моделей</li>
                <li>Рекомендации на основе ваших запросов</li>
                <li>Анализ комплектации и характеристик</li>
                <li>Подсказки по выгодности предложения</li>
              </ul>
            </FaqRow>

            <FaqRow question="Что такое AI-чат по подбору автомобиля?" />
            <FaqRow question="Нужно ли регистрироваться, чтобы воспользоваться AI-чатом?" />
            <FaqRow question="Насколько точны рекомендации?" />
          </div>
        </section>
      </div>
    </>
  );
}