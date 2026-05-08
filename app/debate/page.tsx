import Link from 'next/link';
import { PHILOSOPHERS } from '@/lib/philosophers';
import { createClient } from '@/utils/supabase/server';
import DebateForm from './debate-form';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type SavedDebate = {
  id: string;
  a_name: string;
  a_dates: string | null;
  a_archetype_key: string | null;
  b_name: string;
  b_dates: string | null;
  b_archetype_key: string | null;
  topic: string;
  setup: string | null;
  exchanges: { speaker: 'A' | 'B'; text: string }[];
  created_at: string;
};

export default async function DebatePage() {
  const supabase = await createClient();
  const locale = await getServerLocale();
  const { data: { user } } = await supabase.auth.getUser();

  let savedDebates: SavedDebate[] = [];
  if (user) {
    const { data } = await supabase
      .from('debate_history')
      .select('id, a_name, a_dates, a_archetype_key, b_name, b_dates, b_archetype_key, topic, setup, exchanges, created_at')
      .order('created_at', { ascending: false })
      .limit(3)
      .returns<SavedDebate[]>();
    savedDebates = data ?? [];
  }

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
        <nav style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <LanguageSwitcher initial={locale} />
          <Link href="/dilemma" style={{ fontFamily: sans, fontSize: 13, color: '#4A4338', textDecoration: 'none' }}>
            {t('nav.dilemma_arrow', locale)}
          </Link>
          <Link href="/account" style={{ fontFamily: sans, fontSize: 13, color: '#4A4338', textDecoration: 'none' }}>
            {t('nav.account_arrow', locale)}
          </Link>
        </nav>
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
        {t('debate.eyebrow', locale)}
      </div>
      <h1 style={{
        fontFamily: serif,
        fontSize: 44,
        fontWeight: 500,
        margin: '0 0 12px',
        letterSpacing: '-0.01em',
        lineHeight: 1.05,
      }}>
        {t('debate.title_html', locale, { em_simulated: '' }).split('{em_simulated}').map((part, i, arr) => (
          <span key={i}>{part}{i < arr.length - 1 && <em style={{ color: '#8C6520' }}>{t('debate.simulated_em', locale)}</em>}</span>
        ))}
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 18,
        color: '#4A4338',
        marginBottom: 12,
        lineHeight: 1.5,
      }}>
        {t('debate.subtitle', locale)}
      </p>
      <p style={{
        fontFamily: sans,
        fontSize: 12.5,
        color: '#8C6520',
        marginBottom: 18,
        opacity: 0.85,
        lineHeight: 1.55,
      }}>
        {t('debate.disclaimer', locale)}
      </p>

      <div style={{
        marginBottom: 36,
        padding: '14px 18px',
        background: '#F5EFDC',
        borderLeft: '3px solid #7A2E2E',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: sans,
          fontSize: 13,
          color: '#4A4338',
          lineHeight: 1.55,
        }}>
          <strong style={{ color: '#221E18' }}>{t('debate.you_in_debate', locale)}</strong>{' '}
          {t('debate.you_in_debate_body', locale)}
          {' '}<span style={{ color: '#8C6520', fontStyle: 'italic' }}>{t('debate.mull_plus', locale)}</span>
        </div>
        <Link href="/debate/me" style={{
          fontFamily: sans,
          fontSize: 13,
          fontWeight: 500,
          padding: '8px 14px',
          background: '#7A2E2E',
          color: '#FAF6EC',
          borderRadius: 6,
          textDecoration: 'none',
          letterSpacing: 0.3,
          flexShrink: 0,
        }}>
          {t('debate.debate_yourself', locale)}
        </Link>
      </div>

      <DebateForm philosophers={PHILOSOPHERS} savedDebates={savedDebates} locale={locale} />

      <p style={{
        fontFamily: sans,
        fontSize: 12,
        color: '#8C6520',
        marginTop: 48,
        opacity: 0.75,
        textAlign: 'center',
        letterSpacing: 0.3,
        lineHeight: 1.55,
      }}>
        {t('debate.footer_note', locale)}
      </p>
    </main>
  );
}
