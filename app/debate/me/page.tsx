import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { PHILOSOPHERS } from '@/lib/philosophers';
import DuelForm from './duel-form';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';

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
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '60px 24px 120px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 36,
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <Link href="/" style={{
          fontFamily: serif,
          fontSize: 28,
          fontWeight: 500,
          color: '#221E18',
          textDecoration: 'none',
          letterSpacing: '-0.5px'
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LanguageSwitcher initial={locale} />
          <Link href="/debate" style={{ fontFamily: sans, fontSize: 13, color: '#4A4338', textDecoration: 'none' }}>
            {t('nav.two_thinker_debate', locale)}
          </Link>
        </div>
      </header>

      <div style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        {t('duel.eyebrow', locale)}
      </div>
      <h1 style={{
        fontFamily: serif,
        fontSize: 44,
        fontWeight: 500,
        margin: '0 0 12px',
        letterSpacing: '-0.01em',
        lineHeight: 1.05,
      }}>
        {t('duel.title_html', locale).split('{em_you}').map((part, i, arr) => (
          <span key={i}>{part}{i < arr.length - 1 && <em style={{ color: '#8C6520' }}>{t('duel.you_em', locale)}</em>}</span>
        ))}
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 18,
        color: '#4A4338',
        marginBottom: 14,
        lineHeight: 1.55,
      }}>
        {t('duel.subtitle', locale)}
      </p>
      <div style={{
        padding: '12px 16px',
        background: '#F5EFDC',
        borderLeft: '3px solid #B8862F',
        borderRadius: 6,
        fontFamily: sans,
        fontSize: 12.5,
        color: '#4A4338',
        marginBottom: 32,
        lineHeight: 1.55,
      }}>
        <strong style={{ color: '#221E18' }}>{t('duel.mull_plus_notice', locale)}</strong> {t('duel.mull_plus_body', locale)}
      </div>

      {!hasQuizzed ? (
        <div style={{
          padding: '28px 32px',
          background: '#FFFCF4',
          border: '1px dashed #D6CDB6',
          borderRadius: 12,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 18,
            color: '#4A4338',
            margin: '0 0 16px',
          }}>
            {t('duel.need_quiz', locale)}
          </p>
          <Link href="/" style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: '#221E18',
            color: '#FAF6EC',
            borderRadius: 6,
            textDecoration: 'none',
            fontFamily: sans,
            fontSize: 14,
            fontWeight: 500,
          }}>
            {t('account.take_quiz_arrow', locale)}
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
