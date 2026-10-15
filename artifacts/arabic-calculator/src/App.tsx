import { useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Calculator, Divide, Minus, Plus, RotateCcw, X } from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [operation, setOperation] = useState<'add' | 'subtract' | 'multiply' | 'divide'>('add');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [hasCalculated, setHasCalculated] = useState(false);

  const operations = [
    { id: 'add' as const, label: 'جمع', symbol: '+', Icon: Plus },
    { id: 'subtract' as const, label: 'طرح', symbol: '−', Icon: Minus },
    { id: 'multiply' as const, label: 'ضرب', symbol: '×', Icon: X },
    { id: 'divide' as const, label: 'قسمة', symbol: '÷', Icon: Divide },
  ];

  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setResult(null);
    setHasCalculated(false);

    if (first.trim() === '' || second.trim() === '') {
      setError('أدخل الرقمين أولاً لإتمام العملية.');
      return;
    }

    const a = Number(first);
    const b = Number(second);
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      setError('يرجى إدخال أرقام صحيحة.');
      return;
    }
    if (operation === 'divide' && b === 0) {
      setError('لا يمكن القسمة على صفر. غيّر الرقم الثاني وحاول مجدداً.');
      return;
    }

    const value = operation === 'add' ? a + b
      : operation === 'subtract' ? a - b
      : operation === 'multiply' ? a * b
      : a / b;

    if (!Number.isFinite(value)) {
      setError('النتيجة أكبر من أن يمكن عرضها. جرّب أرقاماً أصغر.');
      return;
    }
    setResult(value);
    setHasCalculated(true);
  }

  function resetCalculator() {
    setFirst('');
    setSecond('');
    setResult(null);
    setError('');
    setHasCalculated(false);
    setOperation('add');
  }

  const formattedResult = result === null ? '' : new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 10,
  }).format(result);

  return (
    <main className="calculator-shell paper-grain relative flex min-h-[100dvh] flex-col overflow-hidden px-5 py-6 sm:px-8 sm:py-9" dir="rtl" lang="ar">
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_6px_18px_hsl(174_39%_30%_/_0.16)]">
            <Calculator size={21} strokeWidth={1.8} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[15px] font-bold leading-tight tracking-[-.02em]">حِسبة</p>
            <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">آلة حساب بسيطة</p>
          </div>
        </div>
        <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.55)] px-3.5 py-2 text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
          أربع عمليات، بلا تعقيد
        </span>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center py-12 sm:py-16">
        <div className="mb-9 max-w-2xl enter-up">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-px w-7 bg-[hsl(var(--accent))]" />
            <p className="text-xs font-semibold tracking-wide text-[hsl(var(--primary))]">مساحة هادئة للحساب</p>
          </div>
          <h1 className="text-[clamp(2.6rem,6vw,4.8rem)] font-semibold leading-[1.14] tracking-[-.055em]">
            الأرقام أوضح،<br />
            <span className="text-[hsl(var(--primary))]">والحساب أسهل.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-[hsl(var(--muted-foreground))] sm:text-[17px]">
            أدخل رقمين واختر العملية. النتيجة تظهر مباشرة، من دون خطوات زائدة.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(310px,.85fr)] lg:gap-8">
          <form onSubmit={calculate} noValidate className="enter-up rounded-[28px] border border-[hsl(var(--border)/.8)] bg-[hsl(var(--card)/.88)] p-5 shadow-[0_20px_60px_hsl(177_28%_17%_/.07)] backdrop-blur-sm sm:p-8" style={{ animationDelay: '80ms' }}>
            <div className="mb-7 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-[-.02em]">ابدأ عملية جديدة</h2>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">اكتب القيم واختر ما تريد حسابه</p>
              </div>
              <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">01 / 02</span>
            </div>

            <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-4">
              <label className="block">
                <span className="mb-2.5 block text-sm font-medium">الرقم الأول</span>
                <input
                  data-testid="input-first-number"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={first}
                  onChange={(event) => { setFirst(event.target.value); setError(''); setResult(null); setHasCalculated(false); }}
                  placeholder="مثال: ٢٤"
                  aria-label="الرقم الأول"
                  className="h-[58px] w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.72)] px-4 text-left font-mono text-lg text-[hsl(var(--foreground))] transition-colors placeholder:font-sans placeholder:text-sm placeholder:text-[hsl(var(--muted-foreground)/.68)] focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-4 focus:ring-[hsl(var(--primary)/.12)]"
                  dir="ltr"
                />
              </label>
              <span className="hidden h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-sm font-mono text-[hsl(var(--primary))] sm:flex" aria-hidden="true">◦</span>
              <label className="block">
                <span className="mb-2.5 block text-sm font-medium">الرقم الثاني</span>
                <input
                  data-testid="input-second-number"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={second}
                  onChange={(event) => { setSecond(event.target.value); setError(''); setResult(null); setHasCalculated(false); }}
                  placeholder="مثال: ٨"
                  aria-label="الرقم الثاني"
                  className="h-[58px] w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.72)] px-4 text-left font-mono text-lg text-[hsl(var(--foreground))] transition-colors placeholder:font-sans placeholder:text-sm placeholder:text-[hsl(var(--muted-foreground)/.68)] focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-4 focus:ring-[hsl(var(--primary)/.12)]"
                  dir="ltr"
                />
              </label>
            </div>

            <fieldset className="mt-7">
              <legend className="mb-3 text-sm font-medium">العملية الحسابية</legend>
              <div className="grid grid-cols-4 gap-2.5" role="group" aria-label="اختر العملية الحسابية">
                {operations.map(({ id, label, symbol, Icon }) => {
                  const selected = operation === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      data-testid={`button-operation-${id}`}
                      aria-pressed={selected}
                      onClick={() => { setOperation(id); setError(''); setResult(null); setHasCalculated(false); }}
                      className={`group flex min-h-[78px] flex-col items-center justify-center gap-1.5 rounded-2xl border transition-[background-color,border-color,transform] duration-150 active:scale-[.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--primary)/.18)] ${
                        selected
                          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_5px_14px_hsl(174_39%_30%_/.16)]'
                          : 'border-[hsl(var(--border))] bg-[hsl(var(--background)/.6)] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/.45)] hover:bg-[hsl(var(--secondary))]'
                      }`}
                    >
                      <Icon size={18} strokeWidth={2} aria-hidden="true" />
                      <span className="text-xs font-medium">{label}</span>
                      <span className={`font-mono text-[11px] leading-none ${selected ? 'text-[hsl(var(--primary-foreground)/.74)]' : 'text-[hsl(var(--muted-foreground))]'}`} dir="ltr">{symbol}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {error && (
              <div data-testid="status-calculation-error" role="alert" className="mt-5 flex items-start gap-2.5 rounded-2xl border border-[hsl(var(--destructive)/.24)] bg-[hsl(var(--destructive)/.07)] px-4 py-3.5 text-sm leading-6 text-[hsl(var(--destructive))]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold" aria-hidden="true">!</span>
                <span>{error}</span>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                data-testid="button-reset"
                onClick={resetCalculator}
                className="inline-flex h-[54px] items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--border))] px-5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--primary)/.18)]"
              >
                <RotateCcw size={16} aria-hidden="true" />
                مسح
              </button>
              <button
                type="submit"
                data-testid="button-calculate"
                className="inline-flex h-[54px] flex-1 items-center justify-center gap-2.5 rounded-2xl bg-[hsl(var(--primary))] px-6 text-[15px] font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_7px_18px_hsl(174_39%_30%_/.19)] transition-[transform,background-color,box-shadow] hover:-translate-y-0.5 hover:bg-[hsl(174_41%_26%)] hover:shadow-[0_10px_22px_hsl(174_39%_30%_/.23)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--primary)/.25)]"
              >
                احسب النتيجة
                <span aria-hidden="true" className="font-mono text-lg leading-none">←</span>
              </button>
            </div>
          </form>

          <aside className="enter-up relative flex min-h-[250px] flex-col overflow-hidden rounded-[28px] bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] shadow-[0_20px_60px_hsl(174_39%_30%_/.14)] sm:min-h-[320px] sm:p-8" style={{ animationDelay: '160ms' }} aria-label="منطقة النتيجة">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <span className="font-mono text-base" aria-hidden="true">=</span>
                </span>
                <h2 className="text-sm font-medium text-white/85">النتيجة</h2>
              </div>
              <span className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] tracking-wide text-white/60">المجموع النهائي</span>
            </div>

            <div className="mt-9 flex flex-1 flex-col justify-center" aria-live="polite" aria-atomic="true">
              {hasCalculated && result !== null ? (
                <>
                  <p className="mb-2 text-sm text-white/65">الناتج</p>
                  <output data-testid="text-calculation-result" className="break-all font-mono text-[clamp(2.5rem,6vw,4.6rem)] leading-none tracking-[-.065em]" dir="ltr">{formattedResult}</output>
                  <p data-testid="text-calculation-expression" className="mt-5 font-mono text-sm text-white/65" dir="ltr">
                    {new Intl.NumberFormat('en-US').format(Number(first))} {operations.find((item) => item.id === operation)?.symbol} {new Intl.NumberFormat('en-US').format(Number(second))}
                  </p>
                </>
              ) : (
                <div data-testid="text-result-placeholder">
                  <p className="font-mono text-5xl text-white/25" dir="ltr">—</p>
                  <p className="mt-4 max-w-[230px] text-sm leading-7 text-white/65">ستظهر إجابتك هنا فور الضغط على «احسب النتيجة».</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-4 text-[11px] text-white/55">
              <span>أربع عمليات أساسية</span>
              <span className="font-mono" dir="ltr">+ − × ÷</span>
            </div>
            <span className="pointer-events-none absolute left-[-38px] top-[48%] h-32 w-32 rounded-full border border-white/[.08]" aria-hidden="true" />
          </aside>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between border-t border-[hsl(var(--border)/.7)] pt-4 text-[11px] text-[hsl(var(--muted-foreground))]">
        <span>حِسبة — أداة يومية، ببساطة.</span>
        <span>أرقامك تبقى على جهازك</span>
      </footer>
    </main>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
