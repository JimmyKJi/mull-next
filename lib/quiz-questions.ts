// Quick-mode quiz questions — the 20 broad questions that produce a
// rough sketch of someone's worldview in ~6 minutes.
//
// Extracted verbatim from public/mull.html `const Q`. The TS shape
// adds compile-time safety to the answer-vector shorthand: `v({TR:3})`
// is the same helper as in mull.html (now exported from lib/vectors).
//
// Why a separate file from lib/quiz-questions-detailed.ts: each
// question array is large enough that a single file would be hard
// to scan, and the detailed quiz is a strict superset of the quick
// one only in spirit, not literally — they probe slightly different
// dimensions and benefit from being edited independently.

import { v } from "./vectors";

export type Answer = {
  /** Display text (English; translations live in lib/quiz-i18n.ts). */
  t: string;
  /** 16-D vector this answer contributes to the user's running sum. */
  v: number[];
};

export type Question = {
  /** Prompt text (English; translations live in lib/quiz-i18n.ts). */
  p: string;
  /** Optional hint shown below the prompt in mull.html. Currently unused
   *  in the quick set but kept here so the type matches the detailed
   *  set's shape. */
  hint?: string;
  /** Answers — pick one unless `multi` is set. */
  a: Answer[];
  /** Multi-pick config: when present, the user picks up to `max` answers
   *  and their vectors are summed. */
  multi?: { max: number };
};

export const QUICK_QUESTIONS: Question[] = [
  { p:"Your closest friend is dying and terrified. What do you actually say?",
    a:[
      { t:"\"There's something beyond this. We don't know what, but I can feel it.\"", v:v({MR:3,TV:1,CE:2,SI:1}) },
      { t:"\"Everyone faces this. The wisdom is in how we face it.\"",                  v:v({AT:2,PO:2,TR:2,TV:1}) },
      { t:"\"Tell me what mattered to you. Let's name it together.\"",                  v:v({SS:2,VA:1,CE:2}) },
      { t:"\"We made beautiful things. That doesn't disappear because you do.\"",       v:v({VA:2,ES:1,TD:1,SS:1}) }
    ]},

  { p:"Five patients will die without organ transplants. A surgeon could save all five by sacrificing one healthy person who walked into the clinic. Should the surgeon do it?",
    a:[
      { t:"No — some lines you don't cross, even for good outcomes.",              v:v({UI:3,RT:1,AT:1}) },
      { t:"Yes — five lives outweigh one. The math is hard but clear.",            v:v({TR:2,UI:1,PO:2,WP:1}) },
      { t:"No, but for practical reasons — it would destroy trust in medicine.",   v:v({PO:3,TE:2,SR:1}) },
      { t:"The question is malformed. Real ethics doesn't reduce to such cases.",  v:v({CE:1,RT:2,MR:1,SR:2}) }
    ]},

  { p:"You and someone you respect have a real, lasting moral disagreement — not a misunderstanding, an actual difference. What's the honest move?",
    a:[
      { t:"Argue, hard. Truth deserves it.",                                  v:v({UI:2,TR:2,WP:1}) },
      { t:"Find what you actually disagree about underneath the surface.",     v:v({TD:3,SR:1,TR:1}) },
      { t:"Decide which of you is more likely right and learn from them.",    v:v({SR:2,RT:2,TR:1}) },
      { t:"Hold the disagreement. Some things won't resolve.",                 v:v({MR:2,AT:1,SI:1,TV:1}) },
      { t:"Live differently and let the disagreement breathe.",                v:v({SS:3,PO:1}) }
    ]},

  { p:"You're given a button. Press it, and you'll experience a perfect, joyful life — but it's all a simulation. Don't press it, and you keep your real life with all its disappointments. Do you press?",
    a:[
      { t:"Press it — pleasure is real wherever it comes from.",                       v:v({ES:3,VA:2,TE:1,SI:1}) },
      { t:"Don't press it — real life has meaning beyond pleasure.",                   v:v({SS:2,TV:2,UI:1,MR:1}) },
      { t:"Don't press it — what would I be losing if I never knew anything was real?",v:v({TR:2,SS:1,SR:2}) },
      { t:"Probably press it. Most of \"real life\" isn't great anyway.",              v:v({TV:3,SR:1,SI:2}) }
    ]},

  { p:"Someone you love made a free, deliberate decision — no coercion, no addiction, no accident — that ruined their life. Looking back, you think:",
    a:[
      { t:"They could have chosen differently. They're responsible.",                                v:v({SS:3,UI:1,RT:1}) },
      { t:"Given who they were and what they'd been through, this was always going to happen.",     v:v({TR:1,SI:2,SR:1,TV:2}) },
      { t:"Both — they're responsible AND it was always going to happen.",                          v:v({TR:1,MR:2,SR:1,PO:1}) },
      { t:"Neither. Life is mostly accidents we narrate after the fact.",                            v:v({TV:1,SR:3,SI:2}) }
    ]},

  { p:"You realize halfway through your career that the work no longer means anything to you. It's harmless, pays well, and you have viable alternatives if you wanted to leave. What's the wise move?",
    a:[
      { t:"Stay. Find meaning outside the job.",                                               v:v({AT:2,PO:2,CE:1}) },
      { t:"Quit. A meaningful life can't include 40 hours a week of meaninglessness.",         v:v({SS:3,VA:1,WP:1}) },
      { t:"Stay, but redefine the work itself. Meaning is a frame you bring.",                 v:v({SS:2,WP:1,PO:2,TR:1}) },
      { t:"Stay and grieve quietly. Most lives contain this kind of compromise.",              v:v({TV:3,AT:1,RT:1}) },
      { t:"The premise assumes meaning is the right frame for work at all.",                    v:v({SR:3,SI:1,TE:1}) }
    ]},

  { p:"An ancient practice has been done a certain way for 2,000 years. Someone proposes a clearly more efficient way. Your gut reaction:",
    a:[
      { t:"Adopt the new way. Efficiency wins.",                                            v:v({TR:1,SR:1,WP:2,SS:1}) },
      { t:"Stick with tradition. Long survival is evidence of hidden wisdom.",              v:v({RT:3,CE:1,SR:1}) },
      { t:"Investigate why the old way persisted before changing anything.",                 v:v({RT:2,TE:2,PO:2,SR:1}) },
      { t:"Try both for a season. Watch what actually happens.",                            v:v({TE:3,PO:2,SR:1}) },
      { t:"Wait. Sometimes the natural way reveals itself when you stop forcing.",          v:v({MR:2,AT:1,RT:1,SI:1}) }
    ]},

  { p:"You have two free hours and no obligations. Which feeds you most? Pick the one or two that genuinely fit.",
    multi: { max: 2 },
    a:[
      { t:"Reading something difficult. Real understanding takes work.",          v:v({TD:3,AT:2,TR:2}) },
      { t:"Walking somewhere beautiful in silence.",                              v:v({MR:2,ES:1,TV:1,SI:1}) },
      { t:"Making something with your hands.",                                    v:v({ES:2,WP:2,PO:2}) },
      { t:"Being with people you love, doing nothing in particular.",             v:v({CE:3,VA:2}) }
    ]},

  { p:"Which is the most trustworthy source of truth?",
    a:[
      { t:"Careful reasoning from clear principles.",                       v:v({TR:3,UI:1,TD:2}) },
      { t:"Direct experience and observation.",                             v:v({TE:3,ES:1,SR:1}) },
      { t:"Traditions and texts that have endured generations.",            v:v({RT:3,CE:1}) },
      { t:"Quiet attention to what's beneath words.",                       v:v({MR:3,SI:1,AT:1}) },
      { t:"None of these alone — all of them, weighed against each other.", v:v({SR:3,TE:2,RT:1}) }
    ]},

  { p:"When you face a hard decision, what's your actual first move?",
    a:[
      { t:"List the options and their likely consequences.",            v:v({PO:3,TR:1,TE:1}) },
      { t:"Notice my body — what does it want?",                        v:v({ES:3,TE:2}) },
      { t:"Ask what the person I want to become would do.",             v:v({SS:3,AT:1,VA:1}) },
      { t:"Talk to the people I love.",                                 v:v({CE:3,RT:1}) },
      { t:"Sleep on it. The answer comes when I stop reaching.",        v:v({MR:3,SI:1,AT:1}) },
      { t:"Look for the choice I'm avoiding. That's usually the right one.", v:v({SR:2,SS:2,TV:1}) }
    ]},

  { p:"On the question of God, or the sacred, or whatever you'd call it:",
    a:[
      { t:"Something is there, even if we can't name it.",                              v:v({MR:3,SI:1,RT:1}) },
      { t:"Probably not. The world makes sense without it.",                            v:v({SR:3,TE:2}) },
      { t:"The question itself matters more than any answer.",                          v:v({TD:2,SS:2,MR:1}) },
      { t:"Whatever I think personally, I respect what people have built around it.",   v:v({CE:2,RT:3,PO:1}) }
    ]},

  { p:"Are you the same person you were ten years ago?",
    a:[
      { t:"Yes. There's a continuous self, even though I've changed.",                  v:v({SS:3,RT:1}) },
      { t:"No. I'm a different person who shares memories with that one.",              v:v({SI:3,TE:1,MR:1}) },
      { t:"The question is malformed — there's no fixed \"self\" to compare.",         v:v({SI:3,MR:2,SR:1}) },
      { t:"Mostly yes, but a stranger would barely recognize me.",                       v:v({TR:1,TE:2,SR:1}) },
      { t:"I don't think about it. It doesn't help me live.",                            v:v({PO:3,SR:1}) }
    ]},

  { p:"Justice — what is it, primarily?",
    a:[
      { t:"Treating equals equally and unequals proportionally.",                     v:v({TR:2,UI:2,AT:1}) },
      { t:"Giving people what they need to live well.",                               v:v({CE:2,ES:1,UI:1,WP:1}) },
      { t:"Giving people what they've earned through their effort.",                  v:v({SS:3,WP:2}) },
      { t:"Whatever a community has built up over time as fair.",                     v:v({RT:3,CE:2,SR:1}) },
      { t:"What people make together when they share what they have.",                v:v({CE:3,UI:1,WP:1}) },
      { t:"An impossible ideal we keep stumbling toward.",                            v:v({TV:2,SR:2,UI:1}) }
    ]},

  { p:"You're at a dinner with people you love. Veal is served — and you find how veal is produced ethically troubling. Your hosts didn't know your views and are happily eating. What do you do?",
    a:[
      { t:"Eat with them. Connection in this moment matters more than principle.",  v:v({CE:3,ES:1,PO:1}) },
      { t:"Eat your sides quietly without making a scene.",                         v:v({AT:2,SS:1,SR:1,CE:1}) },
      { t:"Decline politely and explain when asked.",                               v:v({SS:2,UI:2,TR:1}) },
      { t:"Decline and gently raise the question.",                                 v:v({UI:3,WP:1,SR:1,SS:1}) }
    ]},

  { p:"Beauty in the world — what's it for?",
    a:[
      { t:"Nothing. It just is. That's why it matters.",                             v:v({MR:2,SI:1,AT:1}) },
      { t:"An evolutionary signal. The rest is decoration we add.",                   v:v({SR:3,TE:2,SI:1}) },
      { t:"It points beyond itself, toward something eternal.",                       v:v({MR:3,UI:2,TD:1,RT:1}) },
      { t:"The highest form of usefulness — pleasure made permanent.",                v:v({ES:3,VA:2}) },
      { t:"A reminder to stay alive to what's already here.",                          v:v({PO:2,ES:2,MR:1,VA:1}) }
    ]},

  { p:"Of these, what's most worth pursuing? Pick the one or two that ring true.",
    multi: { max: 2 },
    a:[
      { t:"Wisdom — understanding how things really are.",          v:v({TD:3,TR:2,AT:1}) },
      { t:"Excellence — being great at something that matters.",    v:v({SS:2,WP:2,AT:1}) },
      { t:"Connection — deep bonds with others.",                   v:v({CE:3,ES:1,VA:1}) },
      { t:"Peace — freedom from disturbance and craving.",          v:v({AT:3,MR:2,SI:2}) },
      { t:"Joy — fully experiencing being alive.",                  v:v({ES:3,VA:3}) },
      { t:"Freedom — to be the author of your own life.",           v:v({SS:3,VA:1,WP:1}) }
    ]},

  { p:"There's a government policy you find harmful. What do you do?",
    a:[
      { t:"Argue, organize, vote. The system can be changed.",                       v:v({WP:2,CE:2,UI:1,VA:1}) },
      { t:"Withdraw and live according to your own values.",                         v:v({SS:3,AT:1}) },
      { t:"Wait. Quick change usually fails. Slow change endures.",                  v:v({RT:2,PO:2,TR:1}) },
      { t:"Question whether you're actually right about it.",                        v:v({SR:3,RT:1,TR:1}) },
      { t:"Build something parallel that doesn't depend on it.",                     v:v({SS:2,WP:2,CE:1}) }
    ]},

  { p:"If you could upload your mind to a perfect digital substrate — same memories, same patterns of thought, but no body and no death — would you?",
    a:[
      { t:"Yes. The body is hardware. The mind is what matters.",                          v:v({SS:2,TR:1,WP:2,SI:2}) },
      { t:"Yes, eventually. But not until we understand what we'd lose.",                  v:v({SR:2,TR:1,PO:2}) },
      { t:"No. The body isn't separate from who I am.",                                    v:v({ES:3,MR:1,CE:1}) },
      { t:"No. Death gives life its shape.",                                               v:v({TV:3,MR:1,AT:2,VA:1}) },
      { t:"The question assumes there's a \"me\" to upload. There isn't, in that sense.",  v:v({SI:3,MR:2,SR:1}) }
    ]},

  { p:"Are we today responsible for harms our ancestors caused — by which I mean wrongs done by the institutions, nations, or groups we belong to, generations before we were born?",
    a:[
      { t:"Yes. We inherit their advantages, so we inherit their debts.",         v:v({CE:2,UI:3,RT:1,WP:1}) },
      { t:"Yes, in the sense that we should make things right going forward.",    v:v({WP:2,PO:2,UI:1,CE:1}) },
      { t:"No. Each person is responsible for what they did, not what we did.",   v:v({SS:3,SR:1,TR:1}) },
      { t:"The question is more interesting than any answer to it.",              v:v({TD:2,SR:2,MR:1}) }
    ]},

  { p:"What is real love, primarily?",
    a:[
      { t:"Two people choosing each other again, every day.",                        v:v({SS:2,VA:2,PO:1}) },
      { t:"Recognizing yourself in another person — the soul-meeting.",              v:v({MR:2,CE:2,UI:1,SI:1}) },
      { t:"The shared work of building a life together.",                            v:v({CE:3,PO:2,WP:1,RT:1}) },
      { t:"An attention so complete it dissolves the boundary between you.",         v:v({MR:3,ES:2,SI:2}) },
      { t:"Mostly biology. The rest is the stories we tell about it.",               v:v({SR:3,TE:2,SI:1}) }
    ]}
];
