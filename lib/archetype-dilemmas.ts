// Personalized daily dilemmas — the deep version of /dilemma.
//
// The old pool (lib/dilemmas.ts) shows everyone the same introspective-recall
// prompt each day ("What did you avoid today?"). This module replaces that on
// the live surface with prompts that (a) are genuinely DILEMMATIC — they pose
// a tension you have to resolve, not a memory to retrieve — and (b) are aimed
// at the GROWTH EDGE of the reader's archetype: the blind spot, the failure
// mode, the place that archetype is most prone to flatter itself. A
// Cartographer gets pressed on acting before the map is finished; a Keel on
// whether their calm is wisdom or avoidance; a Hammer on what fills the space
// after they've broken something.
//
// That double move — personalized AND pointed at the soft spot — is what makes
// these both adaptive and thought-provoking. The growth edges are sourced from
// each archetype's whereItFalters / commonMistakes / tensions in
// lib/archetypes.ts; keep them in sympathy if those essays change.
//
// LOCALIZATION: each prompt carries an inline zh translation (full-width
// punctuation, as the project requires). The other six locales fall back to
// English — the same policy the long-form archetype essays follow. Unlike
// lib/dilemmas-i18n.ts, this overlay is keyed by (poolKey, index) within this
// file, NOT by global pool index, so the two never collide.
//
// INTEGRITY: the live page passes a dilemmaRef {poolKey, index} to the submit
// route, which reconstructs the exact prompt via getDeepDilemmaByRef — the
// server never trusts client free-text for what the question was.

import { type Locale } from '@/lib/translations';

export type DeepDilemma = {
  prompt: string;
  hint?: string;
  /** Inline zh translation. Full-width punctuation. Other locales use en. */
  zh?: { prompt: string; hint?: string };
};

// ─────────────────────────────────────────────────────────────────────
// Per-archetype pools. Keyed by archetype slug (lib/archetype-targets.ts).
// ~8 each, every one aimed at that archetype's growth edge.
// ─────────────────────────────────────────────────────────────────────

export const ARCHETYPE_DILEMMAS: Record<string, DeepDilemma[]> = {
  // ─── Cartographer — edge: the map is not the territory; acting before
  //     the framework is finished; people as data points. ──────────────
  cartographer: [
    {
      prompt: `You have to decide something important this week, and you already know you'll never have enough information to be sure. What would it take for you to act before the map is finished — and what are you really waiting for when you wait?`,
      hint: `Name the specific missing piece. Then ask whether it would actually change your decision, or only your comfort.`,
      zh: {
        prompt: `这周你必须做一个重要决定，而你早已清楚：自己永远不会掌握足够的信息来确定无疑。要让你在地图画完之前就动手，需要什么条件——当你迟迟不动时，真正在等的又是什么？`,
        hint: `说出那块具体缺失的拼图。然后问问自己：它真会改变你的决定，还是只会安抚你的不安？`,
      },
    },
    {
      prompt: `Think of someone you've quietly "figured out" — filed under a type, a pattern, a diagnosis. When did that label last stop you from actually seeing them?`,
      hint: `The question isn't whether your read was accurate. It's what the accuracy cost you.`,
      zh: {
        prompt: `想想某个你已悄悄「看透」的人——把他归入某种类型、某种模式、某个判断。这个标签上一次妨碍你真正看见他，是什么时候？`,
        hint: `问题不在于你的判断准不准，而在于这份准确让你付出了什么。`,
      },
    },
    {
      prompt: `Recall a time you dismissed someone's hunch because they couldn't justify it — and they turned out right. What did they know that your framework had no slot for?`,
      hint: `Competence that lives in the hands rarely files a brief. Don't explain it away after the fact.`,
      zh: {
        prompt: `回想一次：你因为某人说不出理由，就否定了他的直觉——结果他是对的。他知道的那件事，你的框架里根本没有位置安放，那是什么？`,
        hint: `藏在双手里的本事，很少会递交一份说明书。别在事后把它解释掉。`,
      },
    },
    {
      prompt: `Is there a way of thinking you've refined for years that no longer touches anything that matters? How would you know if it had quietly become a hobby?`,
      hint: `Be specific about the last time it changed a real decision — not just a conversation.`,
      zh: {
        prompt: `有没有一套你打磨了多年的思考方式，如今却再也碰不到任何要紧的东西？如果它早已悄悄沦为一种消遣，你又怎么会察觉？`,
        hint: `具体说出它上一次真正改变了一个决定，而不只是一场对话，是什么时候。`,
      },
    },
    {
      prompt: `Where in your life are you using "let me first define my terms" as a way to avoid committing to a position? What would you have to admit if you stopped?`,
      hint: `Sometimes the distinction is real. Sometimes it's a place to hide. You usually know which.`,
      zh: {
        prompt: `在生活的哪个角落，你把「让我先把概念界定清楚」当成了回避表态的借口？如果你不再这样，你将不得不承认什么？`,
        hint: `有时那个区分是真的，有时它只是个藏身处。你心里通常清楚是哪一种。`,
      },
    },
    {
      prompt: `Recall a decision where the world's response taught you something no amount of prior analysis could have. What does that suggest about how you spend your time before acting?`,
      hint: `The world's reaction is data the map needed. When did you last treat acting itself as a way of mapping?`,
      zh: {
        prompt: `回想一个决定：世界给你的回应，教会了你再多事前分析也得不到的东西。这对你「行动之前如何花时间」说明了什么？`,
        hint: `世界的反应，正是地图所缺的数据。你上一次有意识地把「行动本身」当作绘图，是什么时候？`,
      },
    },
    {
      prompt: `Something around you is structured badly and you understand exactly why. At what point does continuing to understand it become a way of not fixing it?`,
      hint: `The Hammer would have swung by now. What are they getting right that you're not?`,
      zh: {
        prompt: `你身边有件事结构很糟，而你恰恰完全懂得它糟在哪里。到了哪一刻，「继续理解它」就变成了「不去修它」的托词？`,
        hint: `换作铁锤，这一锤早就抡下去了。在这件事上，他对在哪、而你错在哪？`,
      },
    },
    {
      prompt: `When were you most wrong about something that mattered — and was the error in your reasoning, or in what you refused to count as evidence?`,
      hint: `The scariest errors aren't bad logic. They're the inputs you didn't let yourself admit existed.`,
      zh: {
        prompt: `你在某件要紧的事上错得最离谱的那一次——错在你的推理，还是错在你拒绝承认其为证据的那些东西？`,
        hint: `最可怕的错误并非逻辑出错，而是那些你不肯承认其存在的输入。`,
      },
    },
  ],

  // ─── Keel — edge: equanimity as emotional avoidance; calm as complicity;
  //     discipline mistaken for goodness. ──────────────────────────────
  keel: [
    {
      prompt: `Recall something you "accepted" recently. Were you genuinely at peace with it, or just declining to feel it? How can you tell the difference from the inside?`,
      hint: `Peace leaves you present. Avoidance leaves you a little absent. Which were you?`,
      zh: {
        prompt: `回想你最近「接受」了的某件事。你是真的与它和解了，还是只是拒绝去感受它？从内心，你如何分辨这两者？`,
        hint: `平静让你在场，回避则让你有点缺席。那一刻的你，是哪一种？`,
      },
    },
    {
      prompt: `When has your composure let something unjust continue — because staying calm was easier than making the scene that needed making?`,
      hint: `The Stoics burned at injustice. Equanimity that never acts is just comfort wearing armor.`,
      zh: {
        prompt: `你的沉稳，什么时候反而让一桩不公得以延续——只因为保持冷静，比闹出那场本该闹的风波更省事？`,
        hint: `斯多葛派也曾为不义而怒火中烧。从不付诸行动的平静，不过是披着铠甲的安逸。`,
      },
    },
    {
      prompt: `Name a feeling you've talked yourself out of because the situation was beyond your control. What was it trying to tell you before you silenced it?`,
      hint: `Feelings carry information even when the situation can't be changed. What was the message?`,
      zh: {
        prompt: `说出一种你因「局面无法掌控」而劝自己别去感受的情绪。在你把它压下去之前，它想告诉你什么？`,
        hint: `即便局面无法改变，情绪仍携带着信息。那条信息是什么？`,
      },
    },
    {
      prompt: `Could someone be exactly as disciplined and composed as you are — and also be cold, even cruel? What part of your practice points outward, toward others, rather than inward?`,
      hint: `Composure is not the same as kindness. Find the part of your practice that serves someone else.`,
      zh: {
        prompt: `一个人是否可能和你一样自律、一样沉稳——却又冷漠，甚至残酷？你的修行里，哪一部分是朝外、朝向他人的，而非朝向自己？`,
        hint: `沉稳并不等于善良。找出你修行中真正服务于他人的那一部分。`,
      },
    },
    {
      prompt: `Where have you chosen private endurance over joining others who struggle with the same thing? What did the self-sufficiency protect you from?`,
      hint: `Sometimes "I'll handle it myself" is strength. Sometimes it's a way of staying untouched.`,
      zh: {
        prompt: `在哪些地方，你选择了独自硬扛，而不去与同样挣扎的人并肩？这份「自给自足」替你挡掉了什么？`,
        hint: `有时「我自己来」是坚强，有时它只是一种让自己不被触碰的方式。`,
      },
    },
    {
      prompt: `Think of someone whose distress you met with "consider what's in your control." What did they need in that moment that the doctrine didn't give them?`,
      hint: `The test of presence isn't whether you stayed composed. It's whether they felt met.`,
      zh: {
        prompt: `想想某个人，他正痛苦，而你回以一句「想想哪些是你能控制的」。那一刻他需要的、而这套道理给不了的，是什么？`,
        hint: `检验「在场」的标准，不是你是否保持镇定，而是他是否感到被接住了。`,
      },
    },
    {
      prompt: `Is there grief or anger you've been too composed about — something that perhaps deserved to knock you down for a while?`,
      hint: `Some things are supposed to move you. Refusing to be moved isn't always wisdom.`,
      zh: {
        prompt: `有没有某种悲伤或愤怒，你对它过于镇定了——某件或许本就该把你击垮一阵子的事？`,
        hint: `有些事本就该撼动你。拒绝被撼动，未必是智慧。`,
      },
    },
    {
      prompt: `What have you filed under "cannot be changed" that someone else would call "has not been changed yet"? How sure are you which it really is?`,
      hint: `The boundary between "can" and "can't" is sometimes a story you accepted. Test one.`,
      zh: {
        prompt: `有什么被你归入「无法改变」，而在别人眼里只是「尚未被改变」？你究竟有多确定它属于哪一类？`,
        hint: `「能」与「不能」之间的界线，有时只是你接受下来的一个说法。挑一个去试试。`,
      },
    },
  ],

  // ─── Threshold — edge: "no words" as evasion; intuition mistaken for
  //     certainty; private depth nobody benefits from. ──────────────────
  threshold: [
    {
      prompt: `Recall something you've left unsaid because "there are no words." Is that true — or is it the harder work of articulation you've been avoiding? Try the words now.`,
      hint: `Push language to its edge before you declare the edge. Where exactly does it actually stop?`,
      zh: {
        prompt: `回想一件你以「无可言说」为由而留着没说的事。这是真的吗——还是说，你回避的其实是「把它说清楚」这桩更难的活儿？现在就试着说说看。`,
        hint: `在你宣告语言的尽头之前，先把语言推到那个边缘。它究竟在哪里才真正停下？`,
      },
    },
    {
      prompt: `Describe something you "just know" to be true that you've never let anyone test. What would it take for you to be wrong — and would you even notice?`,
      hint: `A feeling of certainty is not evidence. Who in your life is allowed to push back on it?`,
      zh: {
        prompt: `描述一件你「就是知道」为真、却从不让任何人检验的事。要让你错，需要什么条件——而你又是否会察觉自己错了？`,
        hint: `确信的感觉不是证据。在你生命里，谁被允许对它提出反驳？`,
      },
    },
    {
      prompt: `When has your withdrawal into reflection cost someone who needed you present and ordinary instead? What were the dishes you left undone for the silence?`,
      hint: `The serious mystics balanced silence with the begging bowl, the factory, the congregation.`,
      zh: {
        prompt: `你退入沉思之中，什么时候让某个需要你「在场而平常」的人付出了代价？为了那份静默，你撂下了哪些没洗的碗？`,
        hint: `认真的神秘主义者，会让静默与化缘钵、与工厂、与会众相互平衡。`,
      },
    },
    {
      prompt: `If your inner life is rich and no one around you is the better for it, what is it for? Name one person your contemplation should reach — and how it would.`,
      hint: `Depth that stays sealed can look a lot like self-regard. Make it land somewhere.`,
      zh: {
        prompt: `如果你的内在世界丰盈，身边却无人因此受益，那它究竟为了什么？说出一个你的沉思本该抵达的人——以及它将如何抵达。`,
        hint: `封存起来的深度，看上去往往很像自我陶醉。让它落到某个地方去。`,
      },
    },
    {
      prompt: `You distrust the neat system that explains everything. But where have you used "it's a mystery" to dodge an explanation you actually owe someone?`,
      hint: `Some things resist articulation. Some you just haven't bothered to articulate. Be honest about which.`,
      zh: {
        prompt: `你不信任那种解释一切的整齐体系。可你又在哪里，用「这是个谜」来躲掉一个你其实欠某人的交代？`,
        hint: `有些事确实难以言明，有些只是你懒得去说。诚实面对它属于哪一种。`,
      },
    },
    {
      prompt: `When did a moment of awe or stillness this year actually change how you treated a person the next day? If it didn't, what was it worth?`,
      hint: `Weil's attention ended in action. Trace the line from the stillness to the deed — or notice it isn't there.`,
      zh: {
        prompt: `今年里，哪一次敬畏或宁静的时刻，真正改变了你第二天对待某个人的方式？如果它没有，那它又值多少？`,
        hint: `薇依的「专注」最终落于行动。把那条从宁静通往行为的线索描出来——或者承认它并不存在。`,
      },
    },
    {
      prompt: `If much of what you call "I" is provisional, why do you still protect your comfort, your time, your solitude so carefully? What is doing the protecting?`,
      hint: `It's easy to say the self is illusion and still guard it fiercely. Watch where you actually flinch.`,
      zh: {
        prompt: `如果你所谓的「我」大多是暂时的，那你为何仍如此小心地守护自己的安逸、时间和独处？究竟是谁在守护？`,
        hint: `嘴上说自我是幻象、手上却把它护得死紧，这并不难。留意你究竟在哪里会真的退缩。`,
      },
    },
    {
      prompt: `Think of a grief or love you refuse to put into words "to keep it pure." Is the silence honoring it — or sparing you from having to act on it?`,
      hint: `Sometimes naming a thing obligates you. Ask whether that's what the silence is really avoiding.`,
      zh: {
        prompt: `想想一种你拒绝诉诸言语、「以保其纯粹」的悲伤或爱。这份静默是在尊崇它——还是在替你免去「必须为它行动」的负担？`,
        hint: `有时，为一件事命名，就意味着你被它绑定。问问自己，静默真正回避的是不是这个。`,
      },
    },
  ],

  // ─── Pilgrim — edge: "still searching" as insurance; lonely road as
  //     vanity; arriving at solidarity late. ────────────────────────────
  pilgrim: [
    {
      prompt: `Where has "I'm still figuring it out" stopped being honest inquiry and started being a way to avoid committing where you'd risk being wrong in public?`,
      hint: `Notice the difference between an open question and an open escape hatch.`,
      zh: {
        prompt: `在哪里，「我还在摸索」已不再是诚实的探问，而变成了一种回避——回避在众目之下表态、承担可能出错的风险？`,
        hint: `分清「敞开的问题」与「敞开的逃生口」之间的区别。`,
      },
    },
    {
      prompt: `Is there pride in how alone you walk? What would it cost you to admit that other people, in their settled lives, may have found something you've been quietly calling beneath you?`,
      hint: `The heroic solitary is a flattering self-image. Test whether yours is earned or just worn.`,
      zh: {
        prompt: `你独行的姿态里，是否藏着骄傲？要你承认「那些过着安定日子的人，或许找到了你私下里看不上的某种东西」，这会让你付出什么？`,
        hint: `孤胆英雄是个讨人喜欢的自我形象。检验你的那一个，是挣来的，还是只是披在身上的。`,
      },
    },
    {
      prompt: `When did you treat someone's comfort in belonging — to a faith, a family, a tradition — as a failure of nerve? What might they understand that you don't?`,
      hint: `Most people get real meaning from belonging. Arriving at that late is still arriving. Start now.`,
      zh: {
        prompt: `你什么时候把某人「归属于某种信仰、家庭、传统」的安然，看作一种怯懦？他懂得、而你不懂的，会是什么？`,
        hint: `大多数人从归属中获得真实的意义。迟一点抵达，也仍是抵达。现在就动身。`,
      },
    },
    {
      prompt: `Name something you've actually come to know, after all the walking. What would it mean to plant it and stand on it — even provisionally?`,
      hint: `Perpetual searching can be its own kind of bad faith. What have you earned the right to claim?`,
      zh: {
        prompt: `走了这么久，说出一件你确实已经懂得的事。把它种下、立于其上——哪怕只是暂时的——这意味着什么？`,
        hint: `永无止境的寻找，也可能是它自己的一种自欺。你已挣得了主张什么的资格？`,
      },
    },
    {
      prompt: `Pilgrimage is a phase, not an address. What would "coming back" look like for you — and what are you afraid you'd have to give up to do it?`,
      hint: `Some people stop walking and never notice they've just been pacing. Is the road still moving you forward?`,
      zh: {
        prompt: `朝圣是一个阶段，而非一处住址。对你而言，「归来」会是什么模样——而你又怕为此不得不放弃什么？`,
        hint: `有些人早已停步，却没发觉自己只是在原地踱来踱去。这条路，还在带你向前吗？`,
      },
    },
    {
      prompt: `Who has paid for your refusal to settle — a partner, a friend, a family kept at arm's length? Was the honesty worth their cost, or only yours?`,
      hint: `The absurd hero's freedom is sometimes funded by someone else's stability. Name them.`,
      zh: {
        prompt: `谁为你「拒绝安定」买了单——一个伴侣、一个朋友、一个被你保持距离的家？这份诚实，值得他们付出的代价吗，还是只值得你自己的？`,
        hint: `荒诞英雄的自由，有时是由别人的安稳供养的。说出那个人。`,
      },
    },
    {
      prompt: `If meaning is something each person forges alone, what holds you to anything bigger than yourself? When did you last show up for a collective thing you couldn't quit when it got hard?`,
      hint: `Solidarity asks you to stay when leaving would be cleaner. Find one place you actually stayed.`,
      zh: {
        prompt: `如果意义是每个人独自锻造出来的，那又是什么把你系于某种比你自身更大的东西？你上一次为一件「难起来也无法抽身」的集体之事挺身而出，是什么时候？`,
        hint: `团结要求你在「一走了之更干净」时仍然留下。找出一个你真的留下了的地方。`,
      },
    },
    {
      prompt: `You refuse cheap comfort. But is there a comfort you actually need and won't let yourself have, because needing it feels like weakness?`,
      hint: `Refusing every consolation can be its own kind of vanity. What would it cost to accept one?`,
      zh: {
        prompt: `你拒绝廉价的慰藉。但有没有一种你其实需要、却不肯允许自己拥有的安慰——只因为「需要它」让你觉得软弱？`,
        hint: `拒绝一切慰藉，也可能是它自己的一种虚荣。接受一次，会让你付出什么？`,
      },
    },
  ],

  // ─── Touchstone — edge: decisions evidence can't settle; the unmeasurable;
  //     neutrality that favors the status quo. ─────────────────────────
  touchstone: [
    {
      prompt: `Name a real decision in front of you that the evidence will never settle — love, leaving, forgiving. How will you choose, and what does it mean that you must choose anyway?`,
      hint: `Some of the most important questions don't come with data. Refusing to decide is also a decision.`,
      zh: {
        prompt: `说出一个摆在你面前、证据永远无法替你定夺的真实决定——爱、离开、原谅。你将如何抉择？而「无论如何你都必须抉择」这件事，又意味着什么？`,
        hint: `有些最重要的问题并不附带数据。拒绝决定，本身也是一种决定。`,
      },
    },
    {
      prompt: `What in your life resists every metric you'd normally trust — and have you quietly treated it as less real because you can't measure it?`,
      hint: `Not everything that counts can be counted. What have you discounted for lacking a number?`,
      zh: {
        prompt: `你生活中，有什么抗拒着一切你平常信赖的衡量标准——而你是否因为量不了它，就悄悄把它当成不那么真实的东西？`,
        hint: `并非一切重要之物都可计数。你又因为某样东西没有数字，而把它打了折扣？`,
      },
    },
    {
      prompt: `Where are you "staying neutral" or "withholding judgment" in a way that quietly keeps the current arrangement in place? Whom does your neutrality serve?`,
      hint: `Not picking a side is picking. Name what your suspended judgment is actually protecting.`,
      zh: {
        prompt: `在哪里，你的「保持中立」或「暂不评判」，正悄悄维系着现有的格局？你的中立，究竟在为谁服务？`,
        hint: `不选边，就是一种选择。说出你「悬置的判断」实际上在保护什么。`,
      },
    },
    {
      prompt: `If everything is uncertain, then so is your skepticism. What best-supported, provisional commitment would you act on today if you stopped using doubt as a place to rest?`,
      hint: `Skepticism is a method, not a conclusion. Methods are for using, then acting on.`,
      zh: {
        prompt: `如果一切都不确定，那你的怀疑本身也不确定。倘若你不再把怀疑当成歇脚之处，今天你会基于哪个「证据最充分的暂定立场」去行动？`,
        hint: `怀疑是一种方法，不是一个结论。方法是用来使用、进而付诸行动的。`,
      },
    },
    {
      prompt: `Recall a moment you waited for a certainty that never came, and the waiting itself did the damage. What would acting on "good enough" have cost by comparison?`,
      hint: `Demanding triple-verification before ordinary decisions is itself a choice — usually a bad one.`,
      zh: {
        prompt: `回想一次：你等着一个始终没有到来的确定答案，而这场等待本身造成了伤害。相比之下，凭「够好了」就行动，又会付出什么代价？`,
        hint: `在日常决定前都要求三重核实，本身就是一种选择——而且通常是个糟糕的选择。`,
      },
    },
    {
      prompt: `Whom do you trust that you couldn't justify trusting on the evidence alone? What is that trust built on, if not the ledger?`,
      hint: `Some of the truest things you know about people would never survive peer review. Sit with that.`,
      zh: {
        prompt: `有谁是你信任的、却无法仅凭证据为这份信任辩护的人？如果不是靠账本，那这份信任建立在什么之上？`,
        hint: `你对人最真切的某些了解，根本经不起同行评审。在这一点上停留片刻。`,
      },
    },
    {
      prompt: `You're comfortable saying "I don't know." But is there a place where "I don't know" has become an excuse not to find out — or not to feel?`,
      hint: `Honest uncertainty is a virtue. Convenient uncertainty wears the same coat. Tell them apart.`,
      zh: {
        prompt: `你能坦然说出「我不知道」。但有没有某处，「我不知道」已经成了你不去弄清、或不去感受的借口？`,
        hint: `诚实的不确定是一种美德，省事的不确定却穿着同一件外衣。把它们分辨开。`,
      },
    },
    {
      prompt: `Is there something you believe matters — justice, beauty, a person's worth — that no experiment could confirm? What does it mean that you believe it anyway?`,
      hint: `The Lighthouse trusts reason past experience. Where, quietly, do you do the same?`,
      zh: {
        prompt: `有没有某种你相信「要紧」的东西——正义、美、一个人的价值——是任何实验都无法证实的？而你仍然相信它，这又意味着什么？`,
        hint: `灯塔信任那超越经验的理性。在哪里，你也悄悄地这样做着？`,
      },
    },
  ],

  // ─── Hearth — edge: tradition as alibi; loyalty vs. the excluded person;
  //     community vs. conformity. ───────────────────────────────────────
  hearth: [
    {
      prompt: `Name one inherited practice or belief you'd no longer choose if you were starting fresh today. What is actually keeping it in place — wisdom, or inertia?`,
      hint: `"This is old" is not the same as "this is wise." Some things shouldn't be passed on.`,
      zh: {
        prompt: `说出一项你继承下来的做法或信念——倘若今天从头开始，你将不再选择它。真正让它留存至今的，是智慧，还是惯性？`,
        hint: `「这很古老」不等于「这很明智」。有些东西本就不该被传下去。`,
      },
    },
    {
      prompt: `When has loyalty to your community asked you to fail an individual — someone it couldn't make room for? Whom did you choose, and could you defend it to their face?`,
      hint: `The hardest test of a tradition is the person it excludes. Picture them while you answer.`,
      zh: {
        prompt: `你对群体的忠诚，什么时候要求你辜负了某个个体——一个它容不下的人？你最终选了谁，而这个选择，你能当着他的面为之辩护吗？`,
        hint: `检验一个传统最严苛的标尺，是它所排斥的那个人。作答时，把他想在眼前。`,
      },
    },
    {
      prompt: `Can your community hold real disagreement — or only agreement wearing community's clothes? When did it last tolerate someone saying "we shouldn't do this"?`,
      hint: `Listen for the voice that says "we don't do that here." How much room does it leave?`,
      zh: {
        prompt: `你的群体容得下真正的分歧吗——还是只容得下披着群体外衣的「一致」？它上一次容忍某人说出「我们不该这么做」，是什么时候？`,
        hint: `留意那句「我们这儿不兴这个」。它到底留下了多少余地？`,
      },
    },
    {
      prompt: `Who counts as inheriting from your tradition, and who doesn't? Where did you draw that line — and who drew it for you?`,
      hint: `Every community defined by inheritance decides who's in. That decision can be narrow. Examine yours.`,
      zh: {
        prompt: `谁算是你这个传统的继承者，谁不算？这条线是你在哪里划下的——又是谁替你划的？`,
        hint: `每个以传承界定自身的群体，都得决定谁在圈内。这个决定可能很狭隘。审视你的那一个。`,
      },
    },
    {
      prompt: `Is there something done in your family or community that "we've always done" — that, said plainly, should never have been done at all?`,
      hint: `Name it without the softening of custom. Then decide what you owe the people it cost.`,
      zh: {
        prompt: `你的家庭或群体里，有没有一件「我们一向如此」的事——若直白说来，根本就不该做？`,
        hint: `去掉「习俗」这层缓冲，把它直接说出来。然后想想，你欠那些为它付出代价的人什么。`,
      },
    },
    {
      prompt: `Where have you let the company of others stand in for a question you should have faced alone? What does the belonging spare you from asking?`,
      hint: `Community can be a home or a hiding place. Find one question you've outsourced to the group.`,
      zh: {
        prompt: `在哪里，你让「众人的陪伴」顶替了一个你本该独自面对的问题？这份归属，替你免去了哪个本该追问的问题？`,
        hint: `群体可以是家，也可以是藏身处。找出一个你外包给集体的问题。`,
      },
    },
    {
      prompt: `Is there a practice you keep without quite knowing what it's for? Trace what it actually does — and whether the answer survives daylight.`,
      hint: `Meaning lives in the practice, yes. But some practices carry only inertia. Which is this one?`,
      zh: {
        prompt: `有没有一项你一直在守、却并不太清楚「为何而守」的做法？追究它究竟起了什么作用——以及这个答案，是否经得起白日下的端详。`,
        hint: `意义确实活在实践之中。但有些实践承载的只是惯性。这一项，属于哪种？`,
      },
    },
    {
      prompt: `Whom would your community be better for including — and what comfort would you personally have to give up to widen the door?`,
      hint: `Widening the circle costs the people already inside something. Name your share of the cost.`,
      zh: {
        prompt: `你的群体若接纳谁，会因此更好——而为了把门开得更宽，你个人又得放弃哪种安逸？`,
        hint: `把圈子扩大，总要让圈内的人付出些什么。说出属于你的那一份代价。`,
      },
    },
  ],

  // ─── Forge — edge: the human cost of the better world; certainty about
  //     being right; activity mistaken for progress. ───────────────────
  forge: [
    {
      prompt: `Picture the better world you're working toward. Who, alive right now, pays the price of getting there — and have you let yourself look at them directly?`,
      hint: `Every transformation has present-day costs. The tragedy is refusing to count them.`,
      zh: {
        prompt: `想象你正为之努力的那个更好的世界。此刻活着的人当中，谁在为「抵达那里」付出代价——而你是否让自己正眼看过他们？`,
        hint: `每一场变革都有当下的代价。真正的悲剧，是拒绝去清点它们。`,
      },
    },
    {
      prompt: `Where are you most certain you're on the right side? Now: what would someone decent, who disagrees with you, say you're not seeing?`,
      hint: `The 20th century is full of Forges who were sure. Steelman the person you'd rather dismiss.`,
      zh: {
        prompt: `在哪件事上，你最确信自己站在正确的一边？那么：一个正派却与你意见相左的人，会说你没看见什么？`,
        hint: `二十世纪满是「曾经笃定」的熔炉。为那个你宁愿忽视的人，构筑他最强的论证。`,
      },
    },
    {
      prompt: `Describe something you're building or pushing right now. In one honest paragraph: what does success actually look like in five years? If you can't write it, what does that tell you?`,
      hint: `More building isn't progress unless the direction is clear. Write the five-year picture — or admit it's missing.`,
      zh: {
        prompt: `描述一件你此刻正在建造或推动的事。用诚实的一段话写出：五年后，成功究竟是什么样子？如果你写不出来，这又说明了什么？`,
        hint: `方向不明，再多的建造也不是进步。写出那幅五年图景——或者承认它根本不存在。`,
      },
    },
    {
      prompt: `Is there a structure you helped create that's quietly become the problem? Would you even be able to tell — or are you too invested to see it?`,
      hint: `Ask what the institution was for, not just what it does now. Then ask if you can still tell the difference.`,
      zh: {
        prompt: `有没有一个你曾参与缔造的体制，如今已悄悄变成了问题本身？你还分辨得出来吗——还是说，你投入太深，已经看不见了？`,
        hint: `问问这个机构当初是为何而设，而不只是它如今在做什么。再问问，你是否还分得清两者的差别。`,
      },
    },
    {
      prompt: `Recall a change you were sure was right that failed when it met real people and real institutions. What did the friction know that your plan didn't?`,
      hint: `Knowing what should change is not knowing how. The "how" is where the humility lives.`,
      zh: {
        prompt: `回想一项你深信正确、却在撞上真实的人与真实的机构时落败的变革。那股阻力懂得、而你的方案不懂的，是什么？`,
        hint: `知道「该改什么」，不等于知道「该怎么改」。谦卑，就住在那个「怎么改」里。`,
      },
    },
    {
      prompt: `Where have you been willing to override people "for their own good," or for the greater good? Draw the line, for yourself, between transforming a system and trampling the people inside it.`,
      hint: `That line is real and easy to cross without noticing. Find the last time you were near it.`,
      zh: {
        prompt: `在哪里，你曾愿意「为了他们好」或「为了更大的善」而压过他人的意愿？为你自己划出那条线——「改造一个体制」与「践踏体制中的人」之间的界线。`,
        hint: `那条线是真实存在的，且极易在浑然不觉间被跨过。找出你上一次逼近它，是什么时候。`,
      },
    },
    {
      prompt: `What would you have to accept about the pace of real change to stop burning out — and what part of you treats patience as a kind of betrayal?`,
      hint: `Durable change is slower than the Forge wants. Is your impatience serving the work, or your self-image?`,
      zh: {
        prompt: `要不再把自己耗尽，你得接受关于「真实变革之速度」的什么事实——而你内心又有哪一部分，把耐心当成了某种背叛？`,
        hint: `持久的变革，比熔炉所愿的要慢。你的急切，是在服务这项事业，还是在服务你的自我形象？`,
      },
    },
    {
      prompt: `Some suffering can't be fixed by changing the system. Where have you refused to do the inner work because it felt like letting the world off the hook?`,
      hint: `The Keel trains to bear what can't be changed. What of yours actually can't be — yet you keep fighting it?`,
      zh: {
        prompt: `有些苦，靠改变体制是治不好的。在哪里，你拒绝去做那份内在的功课——只因为那感觉像是放过了这个世界？`,
        hint: `龙骨修炼自己去承受无法改变之事。你身上有什么是真的改不了——而你却仍在与它搏斗？`,
      },
    },
  ],

  // ─── Hammer — edge: what fills the space after breaking; sovereignty
  //     mistaken for solitude; the affirmation under the negation. ──────
  hammer: [
    {
      prompt: `Name something you've torn down — a belief, a relationship, an institution's hold on you. What filled the space afterward? If you don't know, then something filled it for you — what?`,
      hint: `Breaking the idol leaves a gap. Something always moves in. Did you choose what, or did it choose you?`,
      zh: {
        prompt: `说出一件你曾推倒的东西——一个信念、一段关系、某个机构对你的掌控。之后，是什么填补了那片空白？如果你不知道，那便是有某样东西替你填上了——是什么？`,
        hint: `打碎偶像，会留下一道空缺，而总会有东西住进来。是你选了它，还是它选了你？`,
      },
    },
    {
      prompt: `What have you actually built — not critiqued, not punctured, but made and maintained? If the honest answer is "little," what would it take to build one thing?`,
      hint: `Demolition is easier than construction. The mature Hammer eventually has to make something stand.`,
      zh: {
        prompt: `你究竟建造过什么——不是批判、不是戳穿，而是亲手造出并维系的东西？如果诚实的答案是「几乎没有」，那要造出哪怕一样东西，需要什么？`,
        hint: `拆毁比建造容易。成熟的铁锤，终究得让某样东西立起来。`,
      },
    },
    {
      prompt: `Recall a truth you told someone that was both true and cruel. Was the cruelty necessary to the truth — or were you, somewhere, enjoying the swing?`,
      hint: `The gift of saying the hard thing and the vanity of saying it are very close. Tell them apart in one real case.`,
      zh: {
        prompt: `回想一句你对某人说过的、既真实又残忍的话。那份残忍，是真理所必需的——还是说，你内心某处，其实享受着挥锤的快感？`,
        hint: `「说出难听真话」的馈赠，与「以此为快」的虚荣，相距极近。就一桩真事，把它们分辨开。`,
      },
    },
    {
      prompt: `You owe nothing to inherited values. Fine. But do you owe nothing to anyone? Name the obligations you'd choose on purpose — or admit you've confused freedom with isolation.`,
      hint: `"I'm not bound by tradition" and "I owe no one" are different claims. Which are you actually living?`,
      zh: {
        prompt: `你不亏欠任何继承而来的价值观。好。可你就当真不亏欠任何人吗？说出那些你会主动选择去承担的责任——否则就承认，你把自由错当成了孤立。`,
        hint: `「我不受传统束缚」与「我不亏欠任何人」是两个不同的主张。你实际过的，是哪一个？`,
      },
    },
    {
      prompt: `Where do you reflexively oppose the consensus regardless of whether it's right? What would it cost you to agree with the crowd, just once, when the crowd happens to be correct?`,
      hint: `The herd is sometimes right. Refusing to notice is its own kind of conformity — to your own pose.`,
      zh: {
        prompt: `在哪里，你不论对错都条件反射般地反对共识？哪怕只有一次，在人群恰好正确时与之站在一起，会让你付出什么？`,
        hint: `羊群有时是对的。拒绝承认这一点，本身也是一种从众——只不过从的是你自己的姿态。`,
      },
    },
    {
      prompt: `Nietzsche broke idols to make room for something worthier. What is the something you're breaking for? If there's nothing, the breaking is just noise.`,
      hint: `Name the positive project the destruction serves. If you can't, the iconoclasm has become a habit.`,
      zh: {
        prompt: `尼采打碎偶像，是为了给某种更值得的东西腾出空间。你打碎，又是为了什么？倘若什么都没有，那打碎不过是噪音。`,
        hint: `说出这场破坏所服务的那个积极的事业。如果说不出，那破除偶像就已沦为一种习惯。`,
      },
    },
    {
      prompt: `You're useful to people who can take you. But have you mistaken everyone's discomfort for their weakness? Whom did you break that you should have spared?`,
      hint: `Not everyone who flinches is fragile. Some just deserved a gentleness you decided not to give.`,
      zh: {
        prompt: `你对那些受得住你的人是有用的。但你是否把所有人的不适，都错当成了他们的软弱？你击碎过谁——而那个人本该被你放过？`,
        hint: `不是每个退缩的人都脆弱。有些人只是值得一份你决定不给的温柔。`,
      },
    },
    {
      prompt: `After you've broken every inherited value, what is the "you" that's doing the breaking — and have you ever turned the hammer on that?`,
      hint: `It's easy to dismantle everything except the self that enjoys dismantling. Try it.`,
      zh: {
        prompt: `当你打碎了一切继承而来的价值之后，那个「正在打碎」的「你」又是什么——你可曾把这把锤子，转向过它？`,
        hint: `拆掉一切都容易，唯独难拆那个享受着拆毁的自我。试试看。`,
      },
    },
  ],

  // ─── Garden — edge: the world comes for the kitchen; pleasure vs.
  //     cultivation; where the beauty came from. ────────────────────────
  garden: [
    {
      prompt: `While you've been cultivating your small good life, who has been running the world — and what happens to your garden when their decisions finally arrive at your door?`,
      hint: `"Live unnoticed" has a cost someone else's politics will eventually collect. Name what you've left to others.`,
      zh: {
        prompt: `当你悉心经营着自己那方小小的好生活时，是谁在掌管这个世界——而当他们的决定终于找上门来，你的花园又会怎样？`,
        hint: `「隐居避世」自有其代价，迟早会被别人的政治来收取。说出那些你交给了他人去管的事。`,
      },
    },
    {
      prompt: `Think of a pleasure you reach for often. Does it leave you grateful, or jittery? What would it mean to trade the jittery ones for the steady ones?`,
      hint: `Epicurus ate barley bread. Cultivation produces gratitude; consumption produces a hangover. Which is yours?`,
      zh: {
        prompt: `想想一种你常去寻求的快乐。它留给你的是感激，还是躁动不安？把那些令人躁动的，换成那些令人安稳的，又意味着什么？`,
        hint: `伊壁鸠鲁吃的是大麦面包。涵养带来感激，纵欲带来宿醉。你的是哪一种？`,
      },
    },
    {
      prompt: `Choose something beautiful in your life — a place, an object, a meal. Whose labor, whose land, whose absence made it possible? Does knowing change the pleasure?`,
      hint: `Attention to the source needn't ruin the pleasure. Sometimes it deepens it. Try it on one real thing.`,
      zh: {
        prompt: `选一样你生活里美好的东西——一处地方、一件物品、一顿饭。是谁的劳作、谁的土地、谁的缺席，成全了它？知道了之后，这份愉悦会改变吗？`,
        hint: `留意来处，未必会毁掉愉悦，有时反而加深它。就一样真实的东西，试一试。`,
      },
    },
    {
      prompt: `Where has your taste become a way of signaling rather than enjoying? Could you take the same pleasure in something plain, with whoever happens to be around?`,
      hint: `The mature Garden eats simple food with company, not foam off a tasting menu. Test yourself honestly.`,
      zh: {
        prompt: `在哪里，你的品味已变成一种炫示，而非享受？换作朴素的东西、身边只是恰好在场的人，你还能从中得到同样的愉悦吗？`,
        hint: `成熟的花园，是与人共享粗茶淡饭，而非品尝菜单上那一勺泡沫。诚实地检验自己。`,
      },
    },
    {
      prompt: `You're good at being in the present. But have you used the present to avoid looking at how few of these hours remain? What would change if you let the finitude in?`,
      hint: `Savoring and denial can look identical from outside. Which were you doing this week?`,
      zh: {
        prompt: `你擅长安住于当下。但你是否曾用「当下」来回避去正视：这样的时辰，所剩已无几？若你让这份「有限」走进来，又会有什么改变？`,
        hint: `从外面看，品味与否认可以一模一样。这一周，你做的是哪一种？`,
      },
    },
    {
      prompt: `When has your enjoyment depended on someone else's discomfort — a meal someone served, a peace someone else kept? What, if anything, do you owe them?`,
      hint: `Not every pleasure is innocent. The point isn't guilt; it's seeing clearly, and then deciding.`,
      zh: {
        prompt: `你的享受，什么时候是建立在别人的不适之上的——一顿有人伺候的饭、一份由他人维持的安宁？你又欠他们什么（如果有的话）？`,
        hint: `并非每一种愉悦都是清白的。重点不是愧疚，而是看清，然后再做决定。`,
      },
    },
    {
      prompt: `What is one thing happening in the wider world that you've tuned out because engaging would disturb your peace? Is the peace worth the tuning-out?`,
      hint: `Quietism is a choice with consequences for people who can't opt out. Name one you've made.`,
      zh: {
        prompt: `外面的世界上，有什么事是你刻意屏蔽掉的——只因为去关心它会扰乱你的安宁？这份安宁，值得你这般充耳不闻吗？`,
        hint: `「不问世事」是一种选择，而它的后果，要由那些无法置身事外的人来承担。说出你做过的一个这样的选择。`,
      },
    },
    {
      prompt: `Are your pleasures the point — or a place you've stopped because going further felt like work? Is there a depth past the peach that you've been quietly declining?`,
      hint: `The Threshold passes through pleasure toward something else. Have you settled too early, or exactly right?`,
      zh: {
        prompt: `你的那些愉悦，是终点本身——还是一个你停下的地方，只因再往前走就成了苦差？在那只桃子之外，是否有一种深度，是你一直悄悄推拒的？`,
        hint: `门槛者穿过愉悦，奔向别的什么。你是停得太早，还是停得恰到好处？`,
      },
    },
  ],

  // ─── Lighthouse — edge: a principle followed to something monstrous;
  //     contempt for the changing world; the person vs. the pattern. ────
  lighthouse: [
    {
      prompt: `Take a principle you hold rigorously. Follow it, honestly, all the way to a case where it would demand something you find monstrous. Do you follow it there — or does the monstrousness teach you something the principle missed?`,
      hint: `A pattern followed past the person in front of you can curdle. Where does yours, if anywhere?`,
      zh: {
        prompt: `取一条你严格持守的原则。诚实地沿着它一路推下去，直到某个它会要求你做出可怕之事的情形。你会跟着它走到那一步吗——还是说，那份可怕，教会了你这条原则所遗漏的东西？`,
        hint: `一个模式若越过你眼前的活人继续推演，便可能变质。你的那一条，会在哪里变质（如果有的话）？`,
      },
    },
    {
      prompt: `When did lived experience contradict a truth you'd reasoned your way to? Which did you trust — and were you right to?`,
      hint: `The Touchstone would side with experience. When should you have?`,
      zh: {
        prompt: `什么时候，亲身的经历与你一路推理得出的某个真理相抵触？你信了哪一个——而你信得对吗？`,
        hint: `试金石会站在经验那一边。你又该在何时如此？`,
      },
    },
    {
      prompt: `Recall treating someone as a lesser instance of a type — less awake, less serious, not yet ascended. What did the pattern let you stop seeing about them?`,
      hint: `"They don't understand" often does the work "I haven't explained" should be doing. Which was it?`,
      zh: {
        prompt: `回想你把某人当作某种类型的低等样本——不够清醒、不够认真、尚未上升。这个模式，让你不再去看见他身上的什么？`,
        hint: `「他们不懂」常常顶替了本该由「我还没讲清」来做的工。当时是哪一种？`,
      },
    },
    {
      prompt: `Name a belief you hold partly because it's beautiful — it fits, it's elegant, it satisfies. What would it take to find it false, and would you let the world tell you?`,
      hint: `Beautiful systems can be wrong. Elegance is suggestive, not conclusive. Hold yours accountable.`,
      zh: {
        prompt: `说出一个你部分地因其「美」而持有的信念——它契合、它优雅、它令人满足。要发现它是错的，需要什么条件，而你又是否愿意让这世界来告诉你？`,
        hint: `美的体系也可能是错的。优雅只是提示，而非定论。让你的那一个，对现实负起责来。`,
      },
    },
    {
      prompt: `Where do you treat ordinary, embodied life — the meals, the bodies, the small obligations — as a way station to something realer? What does that cost the people living fully inside it?`,
      hint: `The form of Justice doesn't pay the medical bill. Find where you've looked past the actual for the eternal.`,
      zh: {
        prompt: `在哪里，你把平凡的、肉身的生活——那些饭食、身体、琐碎的责任——当成了通往某种「更真实之物」的中转站？这又让那些全身心活在其中的人，付出了什么？`,
        hint: `「正义」这个理念，付不了医药费。找出你为了永恒而越过眼前实在之物的地方。`,
      },
    },
    {
      prompt: `Whom do you quietly consider unenlightened? Now picture being wrong about them. What would they have to show you for you to revise?`,
      hint: `The eternal, if it's real, is also in the very ordinary moments others are simply living. Look there.`,
      zh: {
        prompt: `你私下里把谁看作尚未开悟之人？现在，设想你看错了他。他要让你看到什么，才会令你修正自己的判断？`,
        hint: `永恒之物，若是真实的，也同样在别人只是平凡度过的那些寻常时刻里。往那里看。`,
      },
    },
    {
      prompt: `What real, present obligation have you neglected while attending to higher things? Who needed the ordinary version of you?`,
      hint: `Contemplating the Good is not the same as doing the good in front of you. Name the gap.`,
      zh: {
        prompt: `当你忙于那些更高远的事时，你疏忽了哪一项真实而当下的责任？谁需要的，是那个平凡版本的你？`,
        hint: `沉思「至善」，与去做眼前的善，是两回事。说出这中间的落差。`,
      },
    },
    {
      prompt: `Take something you find self-evidently true that others don't see. Instead of concluding they can't think — make the case in one concrete particular. Can you?`,
      hint: `The universal has to be argued for in particulars. If you can't, maybe you haven't understood it either.`,
      zh: {
        prompt: `取一件你认为不证自明、别人却看不见的真理。先别急着断定他们不会思考——用一个具体的实例把它论证出来。你做得到吗？`,
        hint: `普遍之理，必须在具体之中被论证。如果你做不到，也许你自己也并未真正懂得它。`,
      },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────
// Universal deep pool — for users not yet placed (no quiz attempt). Same
// depth and dilemmatic shape, but archetype-agnostic: aimed at the
// tensions any reflective person carries.
// ─────────────────────────────────────────────────────────────────────

export const UNIVERSAL_DEEP: DeepDilemma[] = [
  {
    prompt: `Name a value you hold that, followed all the way, would cost you something you're not actually willing to lose. Which wins — and what does that reveal about which value you really hold?`,
    hint: `We discover our real priorities at the point where two of them collide. Find a real collision.`,
    zh: {
      prompt: `说出一个你持守的价值——若一路贯彻到底，它会让你失去某样你其实不愿失去的东西。最终哪一边胜出——而这又揭示出，你真正持守的是哪一个价值？`,
      hint: `我们是在两个优先项相撞的那一点，才发现自己真正的轻重次序。找出一次真实的碰撞。`,
    },
  },
  {
    prompt: `Think of a person you've written off. Make the strongest possible case that they're right and you're wrong. Did anything actually shift?`,
    hint: `Steelman it past the point of comfort. If nothing moved, you didn't go far enough.`,
    zh: {
      prompt: `想想一个你已经一笔勾销的人。为「他对、你错」构筑你所能想到的最强论证。有什么真的动摇了吗？`,
      hint: `把这个论证推到超出你舒适区的地方。若毫无松动，那是你还没推得够远。`,
    },
  },
  {
    prompt: `What is a comfortable belief you hold that you've never seriously tried to disprove? Try now — what's the single strongest piece of evidence against it?`,
    hint: `We defend hardest the beliefs we've examined least. Pick one that would genuinely hurt to lose.`,
    zh: {
      prompt: `有什么让你心安的信念，是你从未认真试图推翻过的？现在就试试——反对它的、最有力的那一条证据是什么？`,
      hint: `我们辩护得最卖力的，往往是审视得最少的信念。挑一个，失去它会让你真正心痛的。`,
    },
  },
  {
    prompt: `When did you last do the right thing at real cost to yourself? When did you last do the easy thing and tell yourself a story about it? Put the two side by side.`,
    hint: `The gap between the two is where your actual character lives. Don't flinch from it.`,
    zh: {
      prompt: `你上一次以真实的代价去做对的事，是什么时候？你上一次做了省事的事、却给自己编了套说辞，又是什么时候？把这两件并排放在一起。`,
      hint: `这两者之间的落差，正是你真实品性所栖居之处。别躲开它。`,
    },
  },
  {
    prompt: `Someone you love is about to make a choice you believe is a mistake. Do you say so — and what does your answer reveal about where you draw the line between honesty and control?`,
    hint: `Both speaking and staying silent can be love, or cowardice. Which is yours, in this case?`,
    zh: {
      prompt: `你所爱的人正要做一个你认定是错误的选择。你会说出来吗——而你的答案，又揭示出你把「诚实」与「控制」之间的界线划在了哪里？`,
      hint: `开口与沉默，都既可能是爱，也可能是怯懦。在这件事上，你的是哪一种？`,
    },
  },
  {
    prompt: `What would you have to believe about the world for your current way of living to be exactly right? Do you actually believe it?`,
    hint: `Our lives quietly encode assumptions we'd never defend out loud. Surface one and test it.`,
    zh: {
      prompt: `要让你当下的生活方式恰好正确，你必须对这个世界相信些什么？而你，当真相信吗？`,
      hint: `我们的生活，悄悄编码着一些我们绝不会公开为之辩护的假设。把其中一个揭出来，检验它。`,
    },
  },
  {
    prompt: `Recall a time you changed your mind about something that mattered. What actually did it — an argument, an experience, exhaustion, someone you trusted? What does that say about how a person reaches you?`,
    hint: `Most real mind-changes aren't logical. Knowing your own mechanism is a kind of power over it.`,
    zh: {
      prompt: `回想一次你在要紧之事上改变了主意。真正促成它的是什么——一个论证、一段经历、疲惫，还是某个你信任的人？这又说明，一个人要怎样才能真正触动你？`,
      hint: `大多数真正的回心转意，并不靠逻辑。看清自己的那套机制，便是对它的一种掌控。`,
    },
  },
  {
    prompt: `What are you working hardest to convince yourself of right now? What would it mean if the effort itself were the tell?`,
    hint: `We rarely strain to believe what's obviously true. Effort points at the seam.`,
    zh: {
      prompt: `此刻，你最费力地想说服自己相信的，是什么？倘若这份「费力」本身就是破绽，那又意味着什么？`,
      hint: `我们很少要费劲去相信那些显然为真的事。费力之处，正指向那道裂缝。`,
    },
  },
];

// ─────────────────────────────────────────────────────────────────────
// Selection + lookup
// ─────────────────────────────────────────────────────────────────────

/** UTC date key (yyyy-mm-dd) — the per-day boundary the dilemma rotates on.
 *  Matches getDailyDilemma in lib/dilemmas.ts so dilemma_date stays aligned
 *  with the rest of the daily-dilemma machinery. */
export function dilemmaDateKey(date: Date = new Date()): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Stable non-negative hash of a pool key, used to desync the daily rotation
 *  across pools so two people of different archetypes don't move in lockstep. */
function poolSalt(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export type DilemmaRef = { poolKey: string; index: number };

export type PersonalizedDilemma = {
  dilemma: DeepDilemma;
  poolKey: string;
  index: number;
  dateKey: string;
};

/** Today's personalized dilemma for a given archetype (or null for unplaced
 *  users → the universal pool). Deterministic per UTC day, so a refresh shows
 *  the same question and re-answering is blocked correctly. */
export function getPersonalizedDilemma(
  archetypeKey: string | null,
  date: Date = new Date(),
): PersonalizedDilemma {
  const poolKey =
    archetypeKey && ARCHETYPE_DILEMMAS[archetypeKey] ? archetypeKey : 'universal';
  const pool = poolKey === 'universal' ? UNIVERSAL_DEEP : ARCHETYPE_DILEMMAS[poolKey];

  const yyyy = date.getUTCFullYear();
  const start = Date.UTC(yyyy, 0, 0);
  const now = Date.UTC(yyyy, date.getUTCMonth(), date.getUTCDate());
  const dayOfYear = Math.floor((now - start) / 86400000);

  const index = (dayOfYear + yyyy * 7 + poolSalt(poolKey)) % pool.length;
  return { dilemma: pool[index], poolKey, index, dateKey: dilemmaDateKey(date) };
}

/** Reconstruct the exact dilemma from a client-provided ref. Returns null if
 *  the pool is unknown or the index is out of range — the submit route uses
 *  this so it never has to trust client free-text for what the question was. */
export function getDeepDilemmaByRef(poolKey: string, index: number): DeepDilemma | null {
  const pool = poolKey === 'universal' ? UNIVERSAL_DEEP : ARCHETYPE_DILEMMAS[poolKey];
  if (!pool) return null;
  if (!Number.isInteger(index) || index < 0 || index >= pool.length) return null;
  return pool[index];
}

/** Resolve a deep dilemma's prompt/hint for a locale. zh has inline strings;
 *  every other non-en locale falls back to English (same policy as the
 *  long-form archetype essays). */
export function localizeDeepDilemma(
  d: DeepDilemma,
  locale: Locale,
): { prompt: string; hint?: string } {
  if (locale === 'zh' && d.zh) {
    return { prompt: d.zh.prompt, hint: d.zh.hint ?? d.hint };
  }
  return { prompt: d.prompt, hint: d.hint };
}
