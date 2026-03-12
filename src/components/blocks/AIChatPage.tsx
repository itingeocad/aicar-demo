import { Search } from 'lucide-react';

function FaqIcon() {
  return (
    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#d9d9d9] text-slate-700 md:h-14 md:w-14">
      <span className="relative block h-5 w-5 group-open:hidden">
        <span className="absolute left-1/2 top-1/2 h-[2px] w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-700" />
        <span className="absolute left-1/2 top-1/2 h-5 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-700" />
      </span>
      <span className="hidden h-[2px] w-5 rounded-full bg-slate-700 group-open:block" />
    </span>
  );
}

function FaqRow({
  question,
  defaultOpen = false,
  children,
  mobile = false
}: {
  question: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
  mobile?: boolean;
}) {
  return (
    <details className="group border-b border-black/35 py-6 md:py-7" open={defaultOpen}>
      <summary
        className={
          mobile
            ? 'flex cursor-pointer list-none items-center justify-between gap-4 text-[18px] leading-[1.25] text-slate-900 [&::-webkit-details-marker]:hidden'
            : 'flex cursor-pointer list-none items-center justify-between gap-6 text-[22px] leading-[1.25] text-slate-900 [&::-webkit-details-marker]:hidden'
        }
      >
        <span>{question}</span>
        <FaqIcon />
      </summary>

      {children ? (
        <div
          className={
            mobile
              ? 'pt-5 text-[16px] leading-[1.45] text-slate-800'
              : 'pt-6 text-[18px] leading-[1.45] text-slate-800'
          }
        >
          {children}
        </div>
      ) : null}
    </details>
  );
}

function PromptBox({ mobile = false }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <div className="mx-auto mt-10 max-w-[640px] px-4">
        <div className="rounded-[22px] bg-[#d3d3d3] px-5 pb-6 pt-5">
          <div className="pb-5 text-center text-[24px] font-medium leading-none text-slate-900">
            Начни чат
          </div>

          <div className="flex min-h-[80px] items-center gap-4 rounded-[18px] bg-white px-5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
            <Search className="h-8 w-8 flex-none text-slate-500" />
            <div className="truncate text-[16px] leading-none text-slate-800">
              Семейный автомобиль, внедорожник. От 2020 ...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-14 max-w-[1080px]">
      <div className="rounded-[14px] bg-[#d3d3d3] px-7 pb-7 pt-6">
        <div className="pb-5 text-center text-[24px] font-medium leading-none text-slate-900">
          Начни чат
        </div>

        <div className="flex min-h-[78px] items-center gap-5 rounded-[14px] bg-white px-7 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
          <Search className="h-8 w-8 flex-none text-slate-500" />
          <div className="truncate text-[18px] leading-none text-slate-800">
            Семейный автомобиль, внедорожник. От 2020 года и выше. Полная комплектация...
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqList({ mobile = false }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <div className="mx-auto mt-10 max-w-[720px] px-5">
        <FaqRow question="Что умеет AIChat?" defaultOpen mobile>
          <ul className="list-disc space-y-1 pl-6">
            <li>Подбор авто по бюджету и предпочтениям</li>
            <li>Сравнение нескольких моделей</li>
            <li>Рекомендации на основе ваших запросов</li>
            <li>Анализ комплектации и характеристик</li>
            <li>Подсказки по выгодности предложения</li>
          </ul>
        </FaqRow>

        <FaqRow question="Что такое AI-чат по подбору автомобиля?" mobile />
        <FaqRow question="Нужно ли регистрироваться, чтобы воспользоваться AI-чатом?" mobile />
        <FaqRow question="Насколько точны рекомендации?" mobile />
      </div>
    );
  }

  return (
    <div className="mx-auto mt-14 max-w-[1220px]">
      <FaqRow question="Что умеет AIChat?" defaultOpen>
        <ul className="list-disc space-y-1 pl-8">
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
        <section className="px-4 pb-[150px] pt-[110px]">
          <h1 className="text-center text-[72px] font-semibold tracking-[-0.04em] text-slate-900">
            AIChat
          </h1>

          <div className="mx-auto mt-9 max-w-[1080px] text-center text-[20px] leading-[1.28] text-slate-900">
            <p>
              Наш интеллектуальный помощник поможет вам подобрать автомобиль быстро, точно и без лишних шагов.
            </p>
            <p>
              Просто укажите желаемый бюджет, марку, тип кузова, год выпуска или другие параметры — и AI
              мгновенно проанализирует предложения, сравнит характеристики и предложит оптимальные варианты.
            </p>
          </div>

          <PromptBox />
        </section>

        <section className="px-4 pb-[160px]">
          <h2 className="text-center text-[42px] font-medium tracking-[-0.03em] text-slate-900">
            Частые вопросы
          </h2>

          <FaqList />
        </section>
      </div>

      <div className="md:hidden">
        <section className="pb-[110px] pt-[92px]">
          <h1 className="text-center text-[44px] font-semibold tracking-[-0.04em] text-slate-900">
            AIChat
          </h1>

          <div className="mx-auto mt-8 max-w-[760px] px-5 text-center text-[18px] leading-[1.22] text-slate-900">
            <p>
              Наш интеллектуальный помощник поможет вам подобрать автомобиль быстро, точно и без лишних шагов.
            </p>
            <p className="mt-1">
              Просто укажите желаемый бюджет, марку, тип кузова, год выпуска или другие параметры — и AI мгновенно
              проанализирует предложения, сравнит характеристики и предложит оптимальные варианты.
            </p>
          </div>

          <PromptBox mobile />
        </section>

        <section className="pb-[110px]">
          <h2 className="text-center text-[28px] font-medium tracking-[-0.03em] text-slate-900">
            Частые вопросы
          </h2>

          <FaqList mobile />
        </section>
      </div>
    </>
  );
}