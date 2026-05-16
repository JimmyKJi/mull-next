// Detailed-mode quiz questions — 50 deeper probes that produce a
// sharper portrait. Same shape as QUICK_QUESTIONS in
// lib/quiz-questions.ts; extracted verbatim from public/mull.html
// `const Q_DETAILED`.

import { v } from "./vectors";
import type { Question } from "./quiz-questions";

export const DETAILED_QUESTIONS: Question[] = [
  { p:"Think back to a belief you held strongly as a child, then later abandoned. Why did you abandon it?",
    a:[
      { t:"It collided with evidence. The world said no.",                           v:v({TE:3,SR:2,TR:1}) },
      { t:"A teacher or text I trusted argued it down.",                              v:v({TR:2,RT:2,TD:1}) },
      { t:"I outgrew it — what mattered to me changed.",                              v:v({SS:2,VA:1,SI:1,TV:1}) },
      { t:"I didn't really abandon it. I just stopped saying it out loud.",          v:v({CE:1,SR:1,TV:2}) },
      { t:"The community I belonged to changed, and the belief came with it.",        v:v({CE:3,RT:1}) }
    ]},

  { p:"Someone who has caused you real, irreversible harm asks you for genuine help. Real cost to you. What do you do?",
    a:[
      { t:"Help. Cycles of harm break when someone refuses to extend them.",          v:v({UI:2,VA:1,MR:1,CE:1}) },
      { t:"Help, but only after they acknowledge what they did.",                     v:v({SS:2,UI:1,WP:1,TR:1}) },
      { t:"Refuse. Forgiveness extended in advance teaches the wrong lesson.",        v:v({SR:1,SS:2,WP:1}) },
      { t:"Depends entirely on whether they've changed.",                             v:v({PO:3,TE:2,SR:1}) },
      { t:"Help anonymously, so they don't owe me anything.",                          v:v({AT:3,UI:1,TV:1}) }
    ]},

  { p:"A close friend lives by a self-image that's clearly false — but it's working for them. They aren't asking. Do you say anything?",
    a:[
      { t:"Yes. Friendship is owing each other the truth.",                            v:v({SS:2,UI:2,TR:1}) },
      { t:"No. People reach truth on their own time, or not at all.",                   v:v({MR:2,RT:1,SR:1,CE:1}) },
      { t:"Only if asked, even obliquely. Otherwise mind your own life.",              v:v({SS:2,PO:2,RT:1}) },
      { t:"Quiet questions, never assertions. Plant doubts and step back.",            v:v({TD:2,SR:2,MR:1}) },
      { t:"Depends on stakes — dangerous lies named, harmless ones left alone.",       v:v({PO:3,UI:1,TR:1}) }
    ]},

  { p:"A week of complete solitude, by choice. Afterward, what do you typically feel?",
    a:[
      { t:"Cleaner. Other people's noise was crowding out something real.",            v:v({SS:3,AT:2,MR:1}) },
      { t:"Hungry to be back. I think with people, not against them.",                  v:v({CE:3,ES:1,VA:1}) },
      { t:"Both — clearer in some ways, dimmer in others.",                              v:v({SR:1,TV:1,PO:1}) },
      { t:"Restless. Solitude shows me thoughts I'd rather not have.",                   v:v({TV:2,SR:1,SI:1}) },
      { t:"Calmer. Most of what I usually do is performance.",                            v:v({AT:3,SS:2,SI:2}) }
    ]},

  { p:"Your parents' worldview shaped yours. As an adult, how have you actually treated it?",
    a:[
      { t:"Inherited largely intact. The roots were sound.",                             v:v({RT:3,CE:2,TV:1}) },
      { t:"Rebuilt from scratch — kept what survived examination.",                      v:v({TR:2,SS:3,SR:2}) },
      { t:"Inverted hard. The reaction was mine, not the inheritance.",                  v:v({SS:3,WP:2,VA:1}) },
      { t:"Updated piece by piece. No clean break, no clean keep.",                      v:v({PO:3,SR:1,TR:1}) },
      { t:"Still in motion. I haven't decided yet.",                                      v:v({TD:1,SR:2,MR:1}) }
    ]},

  { p:"Someone with deep expertise contradicts your moral intuition on something specific. What weighs more?",
    a:[
      { t:"Their expertise. Intuitions are often wrong; expertise is calibrated.",       v:v({TE:3,TD:1,RT:1,SR:1}) },
      { t:"My intuition. Expertise can launder bad values into the language of evidence.",v:v({SS:3,SR:2,TE:1}) },
      { t:"Neither alone — I want to understand why we disagree.",                       v:v({TD:3,SR:1,TR:1}) },
      { t:"The intuition, but I take their argument as data about my blind spots.",      v:v({SS:2,SR:2,PO:1}) },
      { t:"It depends on the domain. Some intuitions are sacred, others are bias.",      v:v({PO:2,UI:1,TR:1,RT:1}) }
    ]},

  { p:"Where does the present, the past, and the future feel most real to you?",
    a:[
      { t:"The present. The other two are stories told from inside it.",                 v:v({MR:2,SI:2,ES:2}) },
      { t:"The past. It actually happened. The rest is inference.",                       v:v({TV:2,RT:2,TE:1}) },
      { t:"The future. The present is just where I work toward it.",                      v:v({WP:3,SS:2,VA:1}) },
      { t:"All three are equally real and equally constructed.",                          v:v({TD:2,SR:1,SI:1}) },
      { t:"None of them — what's real is the pattern, not any moment.",                    v:v({SI:3,MR:2,TD:1}) }
    ]},

  { p:"Someone hurt you in a way you can't repair. What's the right response, eventually?",
    a:[
      { t:"Forgiveness. Resentment is a poison you brew for yourself.",                   v:v({MR:2,VA:2,UI:1,AT:1}) },
      { t:"Naming it clearly, then walking away whole.",                                   v:v({SS:3,TR:2,UI:1}) },
      { t:"Holding it as a fact about reality, neither hating nor forgiving.",            v:v({TV:3,SI:1,AT:2}) },
      { t:"Translating it — making something real out of what was done to me.",            v:v({WP:3,VA:1,SS:1}) },
      { t:"Depends on the harm. Some things can be set down; others define what you trust.", v:v({PO:3,TV:1,SR:1}) }
    ]},

  { p:"A horse and a person are equally drowning. You can save one. The horse is irreplaceable to its owner, the stranger anonymous. What's the actual answer?",
    a:[
      { t:"The person. Always. Across all cases.",                                         v:v({UI:3,TR:2,RT:1}) },
      { t:"The person, but the gap is smaller than people pretend.",                       v:v({UI:1,ES:2,SR:1,SI:1}) },
      { t:"Whichever is closer. Distance dictates duty more than species does.",            v:v({CE:2,PO:3,TE:1}) },
      { t:"The horse, if the owner's life pivots on it. Saving names beats saving abstracts.", v:v({CE:2,RT:1,SR:1}) },
      { t:"The question deserves the discomfort, not a quick answer.",                      v:v({TD:3,SR:2,TV:1}) }
    ]},

  { p:"You know something true that would devastate someone. Telling them costs them peace; not telling them costs them autonomy. What do you do?",
    a:[
      { t:"Tell them. People deserve to author their own response.",                       v:v({SS:3,UI:2,TR:1}) },
      { t:"Don't. Truth without context is just damage.",                                  v:v({CE:2,MR:1,RT:1,PO:1}) },
      { t:"Tell them when they're equipped, not before.",                                  v:v({PO:3,CE:1,TR:1}) },
      { t:"Live as though they already know, and let them ask.",                           v:v({MR:2,SS:1,SR:1,RT:1}) },
      { t:"It depends on the stakes. Small truths, less duty. Big ones, more.",             v:v({PO:3,UI:1}) }
    ]},

  { p:"A practice you'd never personally do has persisted across very different cultures for thousands of years. What's the most likely truth about it?",
    a:[
      { t:"It encodes wisdom we've forgotten. Long survival is hard evidence.",            v:v({RT:3,CE:1,SR:1}) },
      { t:"It exploits something stable about human psychology, for better or worse.",      v:v({SR:3,TE:2,SI:1}) },
      { t:"It performed a function — but the function is now better met other ways.",       v:v({PO:3,TR:1,WP:1}) },
      { t:"Both wisdom and cruelty travel through tradition equally well.",                  v:v({TV:3,SR:1,RT:1}) },
      { t:"There's something the practice knows that I don't, even if I won't adopt it.",   v:v({MR:2,RT:2,TD:1}) }
    ]},

  { p:"You have legitimate authority over someone — boss, parent, teacher, leader. What's your default stance toward that authority?",
    a:[
      { t:"Use it sparingly. Authority that has to be wielded is already broken.",          v:v({MR:2,AT:2,RT:1,CE:1}) },
      { t:"Use it directly. People deserve the clarity of knowing who's responsible.",      v:v({SS:2,WP:2,UI:1,TR:1}) },
      { t:"Make myself dispensable. Good authority works toward its own end.",              v:v({SS:3,WP:1,UI:1}) },
      { t:"Hold it carefully — what's given can be taken back, and should be.",             v:v({CE:2,RT:1,SR:1}) },
      { t:"Question it constantly. Most hierarchies are bad for both sides.",               v:v({SR:2,SS:2,WP:1}) }
    ]},

  { p:"Mountains. The sea. A vast forest. They move some people deeply. If they move you — why?",
    a:[
      { t:"Scale. They make my life feel proportionate.",                                   v:v({TV:2,MR:2,SI:2}) },
      { t:"Beauty pointing past itself toward something I can't name.",                     v:v({MR:3,UI:1,TD:1}) },
      { t:"The body responding. It's older than thought.",                                   v:v({ES:3,TE:2,VA:1}) },
      { t:"The honest indifference of nature. Nothing about me is required.",               v:v({TV:3,SR:2,SI:1}) },
      { t:"They don't, particularly. The reverence is more cultural than felt.",             v:v({SR:3,SI:1,TE:1}) }
    ]},

  { p:"What would actually be worth dying for? Pick what genuinely fits.",
    multi: { max: 3 },
    a:[
      { t:"My children, or whoever has come to depend on me.",                              v:v({CE:3,VA:2,RT:1}) },
      { t:"A truth I had verified for myself, against the crowd if needed.",                 v:v({SS:3,TR:2,UI:1}) },
      { t:"A community that shaped me — to defend what made me possible.",                   v:v({CE:3,RT:3,UI:1}) },
      { t:"Justice, in a specific case, where I was the one positioned to act.",             v:v({UI:3,WP:2,SS:1}) },
      { t:"Nothing. A life is the precondition for every value, not a price for any.",        v:v({SR:3,VA:2,SI:1}) },
      { t:"A future I won't see — moral progress for people who don't exist yet.",            v:v({UI:3,TD:1,WP:1}) }
    ]},

  { p:"Consensus position. You're alone in disagreeing. What happens over time?",
    a:[
      { t:"I usually update toward the consensus. They're probably right and I probably missed something.",        v:v({SR:3,RT:2,TR:1}) },
      { t:"I hold the view. Truth isn't determined by headcount.",                          v:v({SS:3,TR:2,WP:1}) },
      { t:"I dig in for a while, then quietly give up if no one's been moved.",              v:v({TV:2,SS:1,PO:2}) },
      { t:"I keep arguing — but I expect to find the gap was in me, not them.",              v:v({TD:3,SR:2,UI:1}) },
      { t:"I let it be. Most disagreements are about framing, not truth.",                    v:v({MR:2,SR:1,RT:1}) }
    ]},

  { p:"Memories you can't fully trust but believe anyway. What does that mean about memory?",
    a:[
      { t:"Memory was never about accuracy. It's about coherence and identity.",             v:v({SI:2,CE:1,SS:1,MR:1}) },
      { t:"Belief outruns evidence in most domains. Memory's no different.",                  v:v({SR:3,TE:2,TR:1}) },
      { t:"Some memories are more like prayer than recording.",                                v:v({MR:3,TV:1,TD:1}) },
      { t:"It means I should trust other tools — writing, the people who were there.",        v:v({TE:2,SR:2,PO:2,CE:1}) },
      { t:"It means the self is more porous than we like to admit.",                          v:v({SI:3,MR:2,SS:-1}) }
    ]},

  { p:"A new way of doing something replaces an old way. The old worked. The new is provably better. Your honest first reaction?",
    a:[
      { t:"Excitement. Better is better.",                                                    v:v({WP:2,TR:2,VA:1}) },
      { t:"Curiosity, paired with suspicion of what 'better' is measuring.",                  v:v({SR:3,TD:2,RT:1}) },
      { t:"Reluctance. The old way solved problems we didn't know we had.",                   v:v({RT:3,TV:1,CE:1}) },
      { t:"Adopt it cautiously, watch what breaks.",                                          v:v({TE:3,PO:2,SR:1}) },
      { t:"Indifference. Most 'progress' is sideways motion.",                                v:v({TV:2,SR:2,SI:1}) }
    ]},

  { p:"Sitting with a problem instead of solving it. When is that wisdom and when is it cowardice?",
    a:[
      { t:"Wisdom when the problem is beyond your reach. Cowardice when it isn't.",           v:v({PO:3,TR:1,SR:1}) },
      { t:"Wisdom when acting now would foreclose better answers later.",                      v:v({TD:2,SR:2,MR:1}) },
      { t:"Almost always cowardice. Sitting is what we tell ourselves to feel deep.",          v:v({WP:3,SS:2,SR:1}) },
      { t:"Almost always wisdom. Most problems resolve themselves once you stop pushing.",     v:v({MR:3,AT:2,SI:1}) },
      { t:"There's no clean answer. The two states feel identical from the inside.",            v:v({TV:3,SR:1,TR:1}) }
    ]},

  { p:"Why do dreams matter, if they do?",
    a:[
      { t:"They don't. Dreams are noise the brain processes overnight.",                       v:v({SR:3,TE:2,TR:1}) },
      { t:"They show what the conscious mind has been hiding from itself.",                    v:v({TD:2,SI:2,MR:1}) },
      { t:"They're a form of attention I can't access awake.",                                  v:v({MR:3,SI:1,ES:1}) },
      { t:"They're the body talking — pay attention if it's loud.",                             v:v({ES:3,TE:2,MR:1}) },
      { t:"They matter as art matters. Made of nothing, somehow real.",                         v:v({MR:2,VA:2,TD:1}) }
    ]},

  { p:"A conversation you should have but keep avoiding. What's actually stopping you?",
    a:[
      { t:"Fear of what I'll learn about myself in saying it.",                                  v:v({TV:2,SS:1,SR:1,SI:1}) },
      { t:"Fear of damaging the relationship — silence preserves more than truth costs.",         v:v({CE:3,RT:1,TV:1}) },
      { t:"It can't be unsaid. I want to be sure.",                                                v:v({TR:2,SR:2,RT:1,PO:1}) },
      { t:"Hope it resolves itself. Most unspoken things do.",                                     v:v({MR:2,RT:1,SI:1,PO:1}) },
      { t:"Inertia. I'd be having the conversation if I were a slightly braver person.",          v:v({TV:2,SR:2,SS:1}) }
    ]},

  { p:"A hungry person right in front of you. A statistical hungry person at distance. Same response, or different?",
    a:[
      { t:"Same. Distance is morally arbitrary; I just feel it more.",                            v:v({UI:3,TR:2,WP:1}) },
      { t:"Different. The relationship to the person in front of me is real; the statistic isn't.",v:v({CE:3,RT:1,TE:1}) },
      { t:"Different — but the distant one is the moral test.",                                    v:v({UI:2,AT:2,TR:1}) },
      { t:"Both equally — and I do roughly the same scattered nothing for both.",                  v:v({TV:3,SR:1,SI:1}) },
      { t:"Whichever I can actually move the needle on.",                                          v:v({PO:3,WP:2,TE:1}) }
    ]},

  { p:"Where does conscience come from?",
    a:[
      { t:"Evolution shaped it. Reciprocal cooperation is in our wiring.",                         v:v({SR:3,TE:2,SI:1}) },
      { t:"The voice of internalized community — parents, culture, the eyes you carry.",           v:v({CE:3,RT:2,SI:1}) },
      { t:"A real sense of moral order, dim but pointing somewhere.",                                v:v({MR:3,UI:2,RT:1}) },
      { t:"Reason recognizing universal duties.",                                                    v:v({TR:3,UI:2,TD:1}) },
      { t:"All of those tangled. There isn't one source.",                                            v:v({SR:1,SI:1,PO:1,TD:1}) }
    ]},

  { p:"A skill you'll never have, no matter how hard you try. Some people have it; you don't. What's the right relationship to that fact?",
    a:[
      { t:"Mourn it briefly, then build with what I have.",                                          v:v({SS:2,WP:2,PO:2,TV:1}) },
      { t:"Accept it. Comparing yourself to others is most of suffering.",                            v:v({AT:3,MR:1,SI:1,TV:1}) },
      { t:"Refuse to accept. Limits often dissolve when stubbornly questioned.",                      v:v({SS:3,WP:3,VA:1}) },
      { t:"Grieve it properly. Not every loss should be optimized through.",                          v:v({TV:3,ES:1,VA:1}) },
      { t:"Notice what compensating around it taught me. The detour usually carried the lesson.",     v:v({TD:2,PO:2,SR:1,VA:1}) }
    ]},

  { p:"Romantic love between two people, lasting decades. What does its permanence actually depend on?",
    a:[
      { t:"Choosing each other again every day. It's a verb, not a state.",                          v:v({SS:3,VA:2,PO:2}) },
      { t:"Building something together that neither could build alone.",                              v:v({CE:3,WP:2,PO:1}) },
      { t:"Watching each other change without flinching.",                                            v:v({MR:2,VA:2,CE:1,TV:1}) },
      { t:"Honesty about what each owes the other. Romance is mostly fairness.",                      v:v({UI:2,TR:2,SS:1}) },
      { t:"Mostly luck. Compatibility is rarer than we admit.",                                        v:v({TV:3,SR:2,TE:1}) }
    ]},

  { p:"Do humans get morally better over time? Stay the same? Decay?",
    a:[
      { t:"Better, slowly. The circle of moral concern keeps widening.",                              v:v({UI:3,WP:1,VA:2}) },
      { t:"The same. Different vocabulary for the same impulses.",                                     v:v({TV:3,RT:1,SR:2}) },
      { t:"Worse in the things that matter; better in things easily measured.",                        v:v({RT:3,TV:2,CE:1}) },
      { t:"Both — better in some places, decaying in others. The trajectory isn't a line.",            v:v({SR:2,PO:2,TR:1}) },
      { t:"The premise is wrong. Moral 'progress' just means the present's preferences won.",          v:v({SR:3,SI:1,TE:1}) }
    ]},

  { p:"Without regret entirely, would you be wiser, or hollow?",
    a:[
      { t:"Wiser. Regret is a sentimental tax on present action.",                                     v:v({SS:2,WP:2,SR:1,SI:1}) },
      { t:"Hollow. Regret is what makes the past a teacher.",                                          v:v({TV:3,RT:1,VA:1,CE:1}) },
      { t:"Both — wiser in some directions, dimmer in others.",                                        v:v({TR:1,PO:1,SR:1}) },
      { t:"The question is malformed. There's no 'me' that survives the absence of regret.",          v:v({SI:3,MR:2,SS:-1}) },
      { t:"Hollow. The capacity to regret is the same capacity to love.",                              v:v({MR:2,VA:2,ES:1,TV:1}) }
    ]},

  { p:"Your body says one thing, your mind another. Which do you usually trust?",
    a:[
      { t:"The body. It knows things faster than I do.",                                               v:v({ES:3,TE:2,SI:1}) },
      { t:"The mind. The body's signal is correlation; thought finds the cause.",                      v:v({TR:3,TD:2,ES:-1}) },
      { t:"Whichever is louder — and that's information about which has been suppressed.",            v:v({SR:2,ES:2,SI:1}) },
      { t:"The body for the small decisions, the mind for the large.",                                  v:v({PO:3,ES:1,TR:1}) },
      { t:"They're never really separate. The split is a confession.",                                  v:v({MR:2,ES:2,SI:2}) }
    ]},

  { p:"Build a community from scratch. What's the very first principle?",
    a:[
      { t:"Honesty. Without it, every other principle drifts.",                                         v:v({UI:2,SS:2,VA:1}) },
      { t:"Mutual obligation. We owe each other a living.",                                             v:v({CE:3,RT:2,UI:1}) },
      { t:"Voluntariness. No coercion, ever, by anyone.",                                                v:v({SS:3,WP:2,UI:1}) },
      { t:"Tradition. New communities fail because they think they can skip the hard-won customs.",     v:v({RT:3,CE:2,SR:1}) },
      { t:"Care. Every other principle has to bend to whoever is suffering most.",                      v:v({CE:3,ES:2,MR:1}) }
    ]},

  { p:"Mockery and reverence, applied to the same thing. Which is more honest?",
    a:[
      { t:"Reverence — most things deserve more attention than we give them, not less.",                v:v({MR:3,RT:2,UI:1}) },
      { t:"Mockery — taking things seriously is mostly people performing depth.",                       v:v({SR:3,SS:1,SI:1,WP:1}) },
      { t:"Both, in turn. Anything precious survives the joke.",                                         v:v({VA:2,SR:1,SS:2,MR:1}) },
      { t:"Mockery when it punches up, reverence when it punches down.",                                v:v({CE:2,WP:2,UI:1,SR:1}) },
      { t:"Neither. The honest stance is just attention without commentary.",                           v:v({MR:3,AT:1,SI:1}) }
    ]},

  { p:"Hardest, dirtiest necessary work. Who should be doing it?",
    a:[
      { t:"Whoever is paid fairly to do it. Markets sort this if we let them.",                          v:v({TR:1,SS:2,TE:1,PO:2}) },
      { t:"Rotated. Citizens do it as a duty for the system that sustains them.",                       v:v({CE:3,UI:2,RT:1}) },
      { t:"The young, briefly, as part of growing up.",                                                  v:v({RT:3,CE:2,WP:1,AT:1}) },
      { t:"The people who owe the most to society. A debt-paying obligation.",                          v:v({UI:3,WP:1,TR:1}) },
      { t:"Whoever it'd damage least. The whole utilitarian frame is broken if we ignore that.",        v:v({UI:1,ES:2,SR:1,PO:2}) }
    ]},

  { p:"A polished public self, a messy private one. Which is the real you?",
    a:[
      { t:"The private one. The public one is a survival costume.",                                     v:v({SS:2,SR:1,TV:2,SI:1}) },
      { t:"The public one. Discipline is what makes a self real.",                                      v:v({AT:3,WP:2,RT:1}) },
      { t:"Neither. The real me is what's consistent across both.",                                      v:v({TR:2,SS:2,TD:1}) },
      { t:"There's no real me underneath, just versions for different rooms.",                           v:v({SI:3,SR:1,CE:1}) },
      { t:"The private me, but the public me is also me — performance is part of being human.",         v:v({CE:2,VA:2,SI:1,SS:1}) }
    ]},

  { p:"A child suffers. How much can be prevented and should be?",
    a:[
      { t:"Almost all of it. Most childhood suffering is structural and preventable.",                   v:v({UI:3,WP:2,VA:1}) },
      { t:"Some. The kind that comes from being formed by limit — that's necessary.",                    v:v({RT:2,TV:2,AT:2}) },
      { t:"Less than we think — protecting children too much makes them less able adults.",              v:v({TV:2,SS:2,RT:2}) },
      { t:"More than we admit. We've normalized harm we could end.",                                      v:v({UI:3,WP:1,TV:1,VA:1}) },
      { t:"The question hides a different one: who decides what counts as suffering?",                    v:v({SR:2,TD:2,CE:1}) }
    ]},

  { p:"Why do people care so much about who wins?",
    a:[
      { t:"Belonging. The team is a portable community.",                                                  v:v({CE:3,RT:1,VA:1}) },
      { t:"Excellence is rare. Watching it is the closest most of us get.",                                v:v({WP:3,VA:2,AT:1}) },
      { t:"Drama — a story whose ending isn't fixed.",                                                     v:v({VA:2,ES:1,MR:1}) },
      { t:"It's a mostly-harmless place to put energy that has nowhere else to go.",                      v:v({SR:2,PO:2,SI:1}) },
      { t:"They shouldn't, particularly. It's borrowed feeling.",                                          v:v({SR:3,AT:1,SI:1,TV:1}) }
    ]},

  { p:"A book that changed your life. Or one that didn't, when it should have. What does that say?",
    a:[
      { t:"Some books only work if you arrive at the right age.",                                          v:v({TV:2,RT:1,PO:2,TE:1}) },
      { t:"It says I was open to it. Books are mirrors.",                                                  v:v({SS:2,TD:2,MR:1}) },
      { t:"Books matter less than people. Most real change comes through relationships.",                  v:v({CE:3,ES:1,TE:1}) },
      { t:"It says the book did the work — some texts have unusual force.",                                v:v({RT:2,TD:2,MR:1}) },
      { t:"Both — I met it, and it met me.",                                                                v:v({MR:2,VA:1,TD:1,CE:1}) }
    ]},

  { p:"Quiet competence and loud excellence. Which moves you more?",
    a:[
      { t:"Quiet. People who can do the thing without needing to be seen doing it.",                       v:v({AT:3,MR:1,RT:2}) },
      { t:"Loud. The ones who push through skepticism with sheer force.",                                  v:v({WP:3,VA:2,SS:1}) },
      { t:"Both, depending on the domain.",                                                                 v:v({PO:2,SR:1}) },
      { t:"Neither, really. Excellence in itself is overrated.",                                            v:v({MR:2,SI:2,CE:1}) },
      { t:"Quiet. Loud excellence is usually performance with a real skill underneath.",                    v:v({SR:2,AT:2,TD:1}) }
    ]},

  { p:"Grief that stays for years, untouched by time. Heal toward it ending, or honor it as part of you?",
    a:[
      { t:"Honor. Grief that ends was love that wasn't.",                                                   v:v({TV:3,VA:1,RT:1,CE:1}) },
      { t:"Heal toward ending. Permanent grief is a refusal to live.",                                     v:v({VA:3,WP:2,SS:1}) },
      { t:"Both. The pain lessens; the love doesn't.",                                                      v:v({MR:2,VA:2,TV:2,ES:1}) },
      { t:"Translate it. Grief turned into work is grief that has done something.",                         v:v({WP:3,SS:1,TD:1,VA:1}) },
      { t:"Sit with it. Healing is mostly something time does, not something you do.",                       v:v({MR:3,AT:2,TV:1}) }
    ]},

  { p:"Statistical lives versus a single named person. Where does your honest moral attention go?",
    a:[
      { t:"To the statistical lives. The named one is a failure of imagination.",                            v:v({UI:3,TR:2,WP:1}) },
      { t:"To the named one. Concrete is real; abstract is loud.",                                          v:v({CE:3,ES:2,TE:1}) },
      { t:"Both, but I act on whichever I can actually affect.",                                            v:v({PO:3,UI:1,WP:1}) },
      { t:"To wherever the press isn't. Attention is its own moral economy.",                                v:v({SR:3,TD:1,UI:1}) },
      { t:"To neither, much. Most moral attention I claim is performance.",                                  v:v({SR:2,SI:2,TV:1}) }
    ]},

  { p:"Born family, chosen family. Where does loyalty actually rest?",
    a:[
      { t:"Born family, by default. Blood is a real thing.",                                                v:v({RT:3,CE:2}) },
      { t:"Chosen family. The people who'd choose you back.",                                                v:v({SS:3,VA:2,CE:1}) },
      { t:"Both equally. Two different kinds of obligation.",                                                v:v({CE:2,UI:1,RT:1,PO:1}) },
      { t:"Neither — loyalty to the relationship that's working, whichever it is.",                          v:v({SS:2,PO:3,TR:1}) },
      { t:"Loyalty's the wrong frame for either. People deserve presence, not loyalty.",                     v:v({MR:2,ES:1,SI:1,SR:1}) }
    ]},

  { p:"You see suffering you could affect, and you look away. What's the moral weight of that, really?",
    a:[
      { t:"Heavy. Looking away is the most common kind of harm.",                                           v:v({UI:3,TR:1,WP:1}) },
      { t:"Modest. Saint-level moral demand isn't reasonable to expect of anyone.",                          v:v({SR:2,PO:2,TE:1}) },
      { t:"Heavy in aggregate, weightless in any individual case.",                                          v:v({UI:1,SR:2,TR:2}) },
      { t:"Real, and irreducible by reasoning. The look-away is the tell.",                                  v:v({MR:2,ES:1,TV:1,SI:1}) },
      { t:"Depends on what you do with the next moment.",                                                    v:v({PO:3,VA:2,SS:1}) }
    ]},

  { p:"Born too early or too late for your real era. Real perception, or excuse?",
    a:[
      { t:"Real. Some sensibilities don't fit the present.",                                                v:v({TV:3,MR:2,SS:1}) },
      { t:"Excuse. The present is what you make of it.",                                                     v:v({WP:3,VA:2,PO:1}) },
      { t:"Both — real perception, used as excuse.",                                                          v:v({SR:2,TV:1,SI:1}) },
      { t:"The premise is wrong. There's no 'real era' anyone fits.",                                         v:v({SR:3,SI:2}) },
      { t:"Real, but unhelpful. The era is what you have.",                                                  v:v({TV:2,PO:3,AT:1}) }
    ]},

  { p:"A teacher (broadly defined) who changed you. What did they do that mattered?",
    a:[
      { t:"They expected more than I thought I had.",                                                        v:v({WP:3,SS:2,RT:1}) },
      { t:"They listened, longer than anyone else had.",                                                     v:v({CE:3,VA:1,MR:1}) },
      { t:"They modeled a kind of attention I didn't know existed.",                                          v:v({MR:3,TD:1,RT:1}) },
      { t:"They took my own thinking seriously, before it deserved it.",                                      v:v({SS:3,TD:2,UI:1}) },
      { t:"They gave me a tool I'm still using. Specific, practical, durable.",                               v:v({PO:3,TR:1,RT:1}) }
    ]},

  { p:"Letting go of a friendship. When is it the right move, and when is it failure?",
    a:[
      { t:"Right when it's costing you yourself. Failure when you're tired, not done.",                      v:v({SS:3,VA:1,PO:2}) },
      { t:"Almost always failure. People drift; they shouldn't be released.",                                 v:v({CE:3,RT:2,VA:1}) },
      { t:"Right when honesty would require either confrontation or distance.",                              v:v({UI:2,SS:2,SR:1}) },
      { t:"Right when you've changed in incompatible directions, not when you're temporarily annoyed.",       v:v({TV:2,PO:2,SR:1}) },
      { t:"There's no right or wrong here. Friendships have their own seasons.",                              v:v({MR:2,SI:1,TV:1,RT:1}) }
    ]},

  { p:"Public speech and private thought. Should they match?",
    a:[
      { t:"Yes. The gap is where corruption lives.",                                                          v:v({SS:3,UI:2,VA:1}) },
      { t:"No. Public speech is a different genre, with different obligations.",                              v:v({CE:3,RT:2,PO:1}) },
      { t:"Mostly yes, with allowances for tact.",                                                            v:v({TR:2,UI:1,SS:1,CE:1}) },
      { t:"The gap is where civilization lives. Total honesty is a hostile demand.",                          v:v({CE:2,RT:2,SR:2,TV:1}) },
      { t:"They should match in commitments, not in tone.",                                                    v:v({TR:2,PO:2,SS:2}) }
    ]},

  { p:"Healthy self-regard, vanity. What's the difference?",
    a:[
      { t:"Self-regard is calibrated to evidence; vanity isn't.",                                              v:v({TE:3,SR:2,TR:1}) },
      { t:"Self-regard is private; vanity needs an audience.",                                                  v:v({SS:2,AT:2,SR:1}) },
      { t:"Self-regard rests in being; vanity is a performance about it.",                                     v:v({MR:2,SI:1,RT:1,SS:1}) },
      { t:"Vanity is self-regard that's afraid of slipping.",                                                   v:v({TV:2,SR:1,TR:1,VA:1}) },
      { t:"There's no clean line. Most self-regard contains some vanity.",                                      v:v({SR:3,SI:1,TV:1}) }
    ]},

  { p:"Ritual — repeating, structured, often pre-rational practices. What's their actual value?",
    a:[
      { t:"They make things real. Marriage, mourning, gratitude — without ritual they evaporate.",             v:v({RT:3,CE:2,MR:2}) },
      { t:"They're scaffolding for emotion that needs structure to land.",                                      v:v({ES:2,RT:2,PO:1,MR:1}) },
      { t:"Mostly inertia. The good ones could be replaced; we don't because we're attached.",                  v:v({SR:3,TR:2,TE:1}) },
      { t:"The repetition is the point. It's how depth gets built.",                                             v:v({MR:3,AT:2,RT:1,TD:1}) },
      { t:"They're how communities remember themselves.",                                                        v:v({CE:3,RT:2,UI:1}) }
    ]},

  { p:"The animal in us — drives, appetites, instincts. Embrace, manage, or transcend?",
    a:[
      { t:"Embrace. The body is older and wiser than thought.",                                                  v:v({ES:3,VA:3,MR:1}) },
      { t:"Manage. Not because they're bad, but because they're loud.",                                          v:v({TR:2,PO:2,AT:2}) },
      { t:"Transcend. The wisdom traditions agree on this for a reason.",                                         v:v({AT:3,MR:2,SI:1}) },
      { t:"Refuse the dichotomy. There's no animal opposite something else.",                                     v:v({ES:3,SI:2,TR:1}) },
      { t:"Different drives need different stances. There's no one answer.",                                       v:v({PO:3,SR:1,TR:1}) }
    ]},

  { p:"The future of philosophy as a practice. More people doing it, or fewer?",
    a:[
      { t:"More. The world is harder to navigate without it.",                                                    v:v({TD:3,UI:2,SS:1}) },
      { t:"Fewer, in the academic sense. More, as everyday practice.",                                             v:v({PO:3,SS:2,TR:1}) },
      { t:"Roughly the same. There's a baseline of philosophical hunger that's stable.",                           v:v({TV:2,RT:1,SR:1}) },
      { t:"Philosophy will dissolve into other disciplines. That's mostly fine.",                                   v:v({TE:2,SR:2,SI:1}) },
      { t:"The question matters less than what kind of philosophy.",                                               v:v({TD:3,UI:1,PO:1}) }
    ]},

  { p:"When you've truly understood something difficult, what was the moment of understanding actually made of?",
    a:[
      { t:"A pattern suddenly visible. The pieces snap into a structure.",                                            v:v({TR:3,TD:3,SI:1}) },
      { t:"An example clicking. The abstract turned concrete.",                                                        v:v({TE:3,ES:2,PO:1}) },
      { t:"Someone's analogy reframing it. I'd been looking from the wrong angle.",                                   v:v({CE:2,RT:1,TD:2}) },
      { t:"A long quiet sitting. The understanding arrived when I stopped chasing it.",                                v:v({MR:3,AT:2,SI:1}) },
      { t:"The body got it before the mind did. I knew, then I understood why.",                                       v:v({ES:3,TE:2,MR:1}) },
      { t:"Disagreement. Trying to refute it forced the actual structure out.",                                          v:v({SR:3,TE:2,SS:1}) }
    ]},

  { p:"You give something up for an extended period — fast, screens, alcohol, comfort, stimulation. What does the giving-up actually surface?",
    a:[
      { t:"Weight I hadn't noticed I was carrying. The thing was costing more than it gave.",                          v:v({AT:3,SR:2,TV:1}) },
      { t:"Pleasure I'd underestimated. The frame I had on it was wrong.",                                              v:v({ES:3,VA:3,TE:1}) },
      { t:"Time. There's an enormous amount of it under what I was filling.",                                           v:v({AT:3,TD:2,SS:1}) },
      { t:"Distance from people. Most of what I gave up was social, not personal.",                                     v:v({CE:3,RT:1,TV:1}) },
      { t:"Mostly nothing. The 'discipline' frame is more aesthetic than I'd admitted.",                                v:v({SR:3,SI:2,VA:1}) },
      { t:"A different texture of attention. The world gets sharper without the buffer.",                                v:v({MR:3,ES:2,AT:1}) }
    ]},

  { p:"Five words on your tombstone. Pick the closest.",
    a:[
      { t:"\"He saw it clearly enough.\"",                                                                              v:v({TR:2,SR:2,TV:1,SS:1}) },
      { t:"\"She loved who was here.\"",                                                                                v:v({CE:3,VA:2,ES:1}) },
      { t:"\"They left it slightly better.\"",                                                                          v:v({WP:2,UI:2,PO:2}) },
      { t:"\"He paid attention.\"",                                                                                      v:v({MR:3,AT:1,VA:1}) },
      { t:"\"She lived without lying.\"",                                                                                v:v({SS:3,UI:1,TR:1}) },
      { t:"Leave it blank.",                                                                                              v:v({SI:3,MR:2,AT:1,TV:1}) }
    ]}
];
