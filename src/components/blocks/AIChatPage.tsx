import { Search } from 'lucide-react';

function FaqIcon({ open }: { open: boolean }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9d9d9] text-slate-600">
      {open ? (
        <span className="block h-[2px] w-3 rounded-full bg-slate-600" />
      ) : (
        <span className="relative block h-3 w-3">
          <span className="absolute left-1/2 top-1/2 h-[2px] w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-600" />
          <span className="absolute left-1/2 top-1/2 h-3 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-600" />
        </span>
      )}
    </span>
  );
}

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
    <details className="border-b border-black/15 py-4" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <FaqIcon open={defaultOpen} />
      </summary>

      {children ? <div className="pt-4 text-[14px] leading-6 text-slate-700">{children}</div> : null}
    </details>
  );
}

function PromptBox({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={mobile ? 'mx-auto mt-7 max-w-[320px]' : 'mx-auto mt-8 max-w-[760px]'}>
      <div className={mobile ? 'rounded-[10px] bg-[#d9d9d9] p-3' : 'rounded-[10px] bg-[#d9d9d9] p-4'}>
        <div className="pb-3 text-center text-[14px] font-medium text-slate-900">
          Начни чат
        </div>

        <div className="flex items-center gap-3 rounded-[8px] bg-white px-4 py-3 ring-1 ring-black/5">
          <Search className="h-5 w-5 flex-none text-slate-500" />
          <div className={mobile ? 'truncate text-[12px] text-slate-600' : 'truncate text-[14px] text-slate-600'}>
            {mobile
              ? 'Семейный автомобиль, внедорожник. От 2020 ...'
              : 'Семейный автомобиль, внедорожник. От 2020 года и выше. Полная комплектация...'}
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqList({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={mobile ? 'mx-auto mt-8 max-w-[340px]' : 'mx-auto mt-10 max-w-[980px]'}>
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
  );
}

export function AIChatPage() {
  return (
    <>
      <div className="hidden md:block">
        <section className="aicar-container pt-14 pb-10">
          <h1 className="text-center text-[52px] font-semibold tracking-[-0.02em] text-slate-900">
            AIChat
          </h1>

          <div className="mx-auto mt-5 max-w-[980px] text-center text-[15px] leading-[1.55] text-slate-700">
            <p>
              Наш интеллектуальный помощник поможет вам подобрать автомобиль быстро, точно и без лишних шагов.
            </p>
            <p className="mt-2">
              Просто укажите желаемый бюджет, марку, тип кузова, год выпуска или другие параметры — и AI
              мгновенно проанализирует предложения, сравнит характеристики и предложит оптимальные варианты.
            </p>
          </div>

          <PromptBox />
        </section>

        <section className="aicar-container pb-16 pt-10">
          <h2 className="text-center text-[28px] font-medium tracking-[-0.02em] text-slate-900">
            Частые вопросы
          </h2>

          <FaqList />
        </section>
      </div>

      <div className="md:hidden">
        <section className="aicar-container pt-8 pb-6">
          <h1 className="text-center text-[24px] font-semibold tracking-[-0.02em] text-slate-900">
            AIChat
          </h1>

          <div className="mx-auto mt-5 max-w-[320px] text-center text-[12px] leading-[1.55] text-slate-700">
            <p>
              Наш интеллектуальный помощник поможет вам подобрать автомобиль быстро, точно и без лишних шагов.
            </p>
            <p className="mt-2">
              Просто укажите желаемый бюджет, марку, тип кузова, год выпуска или другие параметры — и AI мгновенно
              проанализирует предложения, сравнит характеристики и предложит оптимальные варианты.
            </p>
          </div>

          <PromptBox mobile />
        </section>

        <section className="aicar-container pb-12 pt-4">
          <h2 className="text-center text-[18px] font-medium tracking-[-0.02em] text-slate-900">
            Частые вопросы
          </h2>

          <FaqList mobile />
        </section>
      </div>
    </>
  );
}