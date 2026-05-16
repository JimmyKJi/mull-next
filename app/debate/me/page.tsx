import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { PHILOSOPHERS } from '@/lib/philosophers';
import DuelForm from './duel-form';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import { PixelPageHeader } from '@/components/pixel-window';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export default async function DuelPage() {
  const supabase = await createClient();
  const locale = await getServerLocale();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/debate/me');

  // Check they've taken the quiz at least once
  const { count: quizCount } = await supabase
    .from('quiz_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const hasQuizzed = (quizCount ?? 0) > 0;

  return (
    <main className="mx-auto max-w-[860px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/debate"
          className="text-[13px] text-[#4A4338] hover:text-[#221E18] hover:underline"
        >
          ← {t('nav.two_thinker_debate', locale)}
        </Link>
        <LanguageSwitcher initial={locale} />
      </div>

      <PixelPageHeader
        eyebrow={`▶ ${t('duel.eyebrow', locale).toUpperCase()}`}
        title="DEBATE YOURSELF"
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-prose)' }}>
            {t('duel.subtitle', locale)}
          </p>
        }
      />

      <div
        className="-mt-4 mb-8 border-l-4 px-4 py-2.5 text-[13px] leading-[1.6] text-[#4A4338]"
        style={{ borderColor: '#B8862F', background: '#F5EFDC' }}
      >
        <strong className="text-[#221E18]">
          {t('duel.mull_plus_notice', locale)}
        </strong>{' '}
        {t('duel.mull_plus_body', locale)}
      </div>

      {!hasQuizzed ? (
        <div style={{
          padding: '28px 32px',
          background: '#FFFCF4',
          border: '4px solid #221E18',
          boxShadow: '5px 5px 0 0 #B8862F',
          borderRadius: 0,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 18,
            color: '#4A4338',
            margin: '0 0 20px',
          }}>
            {t('duel.need_quiz', locale)}
          </p>
          <Link
            href="/"
            className="pixel-press"
            style={{
              display: 'inline-block',
              padding: '12px 22px',
              background: '#B8862F',
              color: '#1A1612',
              border: '4px solid #221E18',
              boxShadow: '4px 4px 0 0 #221E18',
              borderRadius: 0,
              fontFamily: 'var(--font-pixel-display)',
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
            }}
          >
            ▸ {t('account.take_quiz_arrow', locale).toUpperCase()}
          </Link>
        </div>
      ) : (
        <DuelForm philosophers={PHILOSOPHERS} locale={locale} />
      )}

      <p style={{
        fontFamily: sans,
        fontSize: 12,
        color: '#8C6520',
        marginTop: 56,
        opacity: 0.7,
        textAlign: 'center',
        letterSpacing: 0.3,
        lineHeight: 1.55,
      }}>
        {t('duel.footer_note', locale)}
      </p>
    </main>
  );
}
