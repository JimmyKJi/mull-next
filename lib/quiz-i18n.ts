// Translations of the quick-mode quiz questions and answer texts.
//
// Extracted verbatim from public/mull.html `const QUICK_I18N`. Indexed
// by question index (matches QUICK_QUESTIONS in lib/quiz-questions.ts),
// then by locale code (es/fr/pt/ru/zh/ja/ko — English is the source
// and lives in QUICK_QUESTIONS itself).
//
// The detailed (50-question) set is intentionally English-only — see
// AGENTS.md and the i18n.content_notice in lib/translations.ts. The
// translation work for deep content is on hold pending scholar review.

export type LocalizedQuestion = {
  /** Translated prompt. */
  p: string;
  /** Translated answer texts, in the same order as QUICK_QUESTIONS[idx].a. */
  a: string[];
};

export type SupportedQuizLocale = "es" | "fr" | "pt" | "ru" | "zh" | "ja" | "ko";

/** Mapping: question index → locale code → translated content. */
export const QUICK_QUIZ_I18N: Record<number, Partial<Record<SupportedQuizLocale, LocalizedQuestion>>> = {
  0: {
    es: { p:"Tu mejor amigo se está muriendo y está aterrado. ¿Qué le dices de verdad?", a:[
      "\"Hay algo más allá de esto. No sabemos qué, pero puedo sentirlo.\"",
      "\"Todos enfrentamos esto. La sabiduría está en cómo lo enfrentamos.\"",
      "\"Cuéntame qué te ha importado. Nombrémoslo juntos.\"",
      "\"Hicimos cosas hermosas. Eso no desaparece porque tú desaparezcas.\""
    ]},
    fr: { p:"Ton ami le plus proche se meurt et est terrifié. Qu'est-ce que tu lui dis vraiment ?", a:[
      "« Il y a quelque chose au-delà de ça. On ne sait pas quoi, mais je le sens. »",
      "« Tout le monde fait face à ça. La sagesse, c'est comment on y fait face. »",
      "« Dis-moi ce qui a compté pour toi. Nommons-le ensemble. »",
      "« On a fait de belles choses. Ça ne disparaît pas parce que tu disparais. »"
    ]},
    pt: { p:"Seu amigo mais próximo está morrendo e aterrorizado. O que você de fato diz?", a:[
      "\"Há algo além disso. Não sabemos o quê, mas eu sinto.\"",
      "\"Todo mundo enfrenta isso. A sabedoria está em como enfrentamos.\"",
      "\"Me diga o que importou para você. Vamos nomear juntos.\"",
      "\"Fizemos coisas belas. Isso não desaparece porque você desaparece.\""
    ]},
    ru: { p:"Ваш ближайший друг умирает и в ужасе. Что вы на самом деле скажете?", a:[
      "«Есть что-то за этим. Мы не знаем что, но я это чувствую».",
      "«С этим сталкиваются все. Мудрость — в том, как мы сталкиваемся».",
      "«Расскажи мне, что было для тебя важно. Назовём это вместе».",
      "«Мы сделали красивые вещи. Они не исчезнут оттого, что ты исчезнешь»."
    ]},
    zh: { p:"你最亲密的朋友正在死去，他害怕。你到底会说什么？", a:[
      "「这之后还有什么。我们说不清，但我能感觉到。」",
      "「每个人都要面对这个。智慧在于我们如何面对。」",
      "「告诉我，对你而言重要的是什么。我们一起把它说出来。」",
      "「我们一起做过美好的事。它们不会因为你不在而消失。」"
    ]},
    ja: { p:"いちばん近い友人が死にかけ、怯えている。あなたは実際、何を言いますか？", a:[
      "「この向こうに何かがある。何かはわからないけれど、感じる。」",
      "「誰もが直面することだ。知恵は、どう向き合うかにある。」",
      "「あなたにとって大切だったことを教えて。一緒に名前をつけよう。」",
      "「私たちは美しいものを作った。あなたが消えても、それは消えない。」"
    ]},
    ko: { p:"가장 가까운 친구가 두려움 속에 죽어가고 있다. 당신은 실제로 무슨 말을 하나요?", a:[
      "\"이것 너머에 무언가가 있어. 뭔지는 모르지만 나는 그게 느껴져.\"",
      "\"모두가 마주하는 일이야. 지혜는 어떻게 마주하느냐에 있어.\"",
      "\"네게 중요했던 게 뭔지 말해 줘. 함께 이름 붙여 보자.\"",
      "\"우리는 아름다운 것들을 만들었어. 네가 사라진다고 그것이 사라지는 건 아니야.\""
    ]},
  },
  1: {
    es: { p:"Cinco pacientes morirán sin trasplante de órganos. Un cirujano podría salvar a los cinco sacrificando a una persona sana que entró al hospital. ¿Debe hacerlo?", a:[
      "No — hay líneas que no se cruzan, ni siquiera por buenos resultados.",
      "Sí — cinco vidas pesan más que una. La aritmética es dura pero clara.",
      "No, pero por razones prácticas — destruiría la confianza en la medicina.",
      "La pregunta está mal planteada. La ética real no se reduce a estos casos."
    ]},
    fr: { p:"Cinq patients mourront sans greffe d'organes. Un chirurgien pourrait tous les sauver en sacrifiant une personne en bonne santé entrée à la clinique. Doit-il le faire ?", a:[
      "Non — il y a des lignes qu'on ne franchit pas, même pour de bonnes conséquences.",
      "Oui — cinq vies pèsent plus qu'une. Le calcul est dur mais clair.",
      "Non, mais pour des raisons pratiques — ça détruirait la confiance dans la médecine.",
      "La question est mal posée. L'éthique réelle ne se réduit pas à ces cas."
    ]},
    pt: { p:"Cinco pacientes morrerão sem transplante. Um cirurgião poderia salvar os cinco sacrificando uma pessoa saudável que entrou na clínica. Ele deve fazer isso?", a:[
      "Não — há linhas que não se cruzam, mesmo por bons resultados.",
      "Sim — cinco vidas pesam mais que uma. A matemática é dura, mas clara.",
      "Não, mas por razões práticas — destruiria a confiança na medicina.",
      "A pergunta é mal formada. A ética real não se reduz a esses casos."
    ]},
    ru: { p:"Пять пациентов умрут без трансплантации. Хирург мог бы спасти всех, пожертвовав одним здоровым, зашедшим в клинику. Должен ли он это сделать?", a:[
      "Нет — есть черты, которые не переступают даже ради хороших исходов.",
      "Да — пять жизней перевешивают одну. Расчёт жесток, но прозрачен.",
      "Нет, но по практическим причинам — это уничтожило бы доверие к медицине.",
      "Вопрос неверно поставлен. Настоящая этика не сводится к таким случаям."
    ]},
    zh: { p:"五名病人若得不到器官移植就会死。外科医生可以牺牲一名走进诊所的健康人来救他们五个。他该这么做吗？", a:[
      "不 —— 有些界限不能越，哪怕结果是好的。",
      "应该 —— 五条命压过一条。这数学很硬，但很清楚。",
      "不，但出于实际原因 —— 这会毁掉人对医学的信任。",
      "这个问题本身就不对。真正的伦理不能化约成这种案例。"
    ]},
    ja: { p:"5 人の患者が臓器移植を受けなければ死ぬ。外科医は、診療所に入ってきた健康な 1 人を犠牲にすれば 5 人を救える。やるべきか？", a:[
      "やるべきでない — 結果がよくても、越えてはならない一線がある。",
      "やるべき — 5 人の命は 1 人より重い。計算は冷たいが明白だ。",
      "やるべきでない、ただし実際的な理由で — 医療への信頼が壊れる。",
      "問いが歪んでいる。実際の倫理はこんな例には還元できない。"
    ]},
    ko: { p:"다섯 환자가 장기이식 없이 죽는다. 의사가 진료소에 들어온 건강한 한 사람을 희생시키면 다섯을 살릴 수 있다. 그렇게 해야 하는가?", a:[
      "아니다 — 좋은 결과를 위해서라도 넘으면 안 되는 선이 있다.",
      "그렇다 — 다섯 생명이 하나보다 무겁다. 계산은 가혹하지만 분명하다.",
      "아니다, 다만 실용적 이유로 — 의학에 대한 신뢰가 무너진다.",
      "질문 자체가 잘못됐다. 실제 윤리는 이런 사례로 환원되지 않는다."
    ]},
  },
  2: {
    es: { p:"Tú y alguien a quien respetas tenéis un desacuerdo moral real y persistente — no un malentendido, una diferencia de fondo. ¿Cuál es el movimiento honesto?", a:[
      "Discutir, fuerte. La verdad lo merece.",
      "Encontrar lo que de verdad os enfrenta debajo de la superficie.",
      "Decidir cuál de los dos tiene más probabilidades de tener razón y aprender de esa persona.",
      "Sostener el desacuerdo. Algunas cosas no se resuelven.",
      "Vivir distinto y dejar que el desacuerdo respire."
    ]},
    fr: { p:"Toi et quelqu'un que tu respectes avez un désaccord moral réel et durable — pas un malentendu, une véritable différence. Quel est le geste honnête ?", a:[
      "Discuter, fort. La vérité le mérite.",
      "Trouver ce sur quoi vous êtes en désaccord en dessous de la surface.",
      "Décider lequel de vous a le plus de chances d'avoir raison et apprendre de l'autre.",
      "Tenir le désaccord. Certaines choses ne se résolvent pas.",
      "Vivre différemment et laisser le désaccord respirer."
    ]},
    pt: { p:"Você e alguém que respeita têm um desacordo moral real e duradouro — não um mal-entendido, uma diferença de verdade. Qual é o movimento honesto?", a:[
      "Discutir, forte. A verdade merece.",
      "Encontrar o que de fato divide vocês debaixo da superfície.",
      "Decidir qual dos dois tem mais chance de estar certo e aprender com essa pessoa.",
      "Sustentar o desacordo. Algumas coisas não se resolvem.",
      "Viver de forma diferente e deixar o desacordo respirar."
    ]},
    ru: { p:"У вас с уважаемым вами человеком — настоящее, длящееся моральное несогласие. Не недопонимание, а реальное различие. Каков честный шаг?", a:[
      "Спорить — жёстко. Истина этого заслуживает.",
      "Найти, о чём вы на самом деле расходитесь — глубже поверхности.",
      "Решить, кто из вас вероятнее прав, и поучиться у того.",
      "Удерживать несогласие. Кое-что не разрешается.",
      "Жить по-своему и дать несогласию дышать."
    ]},
    zh: { p:"你和一个你尊敬的人，在道德问题上有真切而长久的分歧 —— 不是误解，是实质的差异。诚实的做法是什么？", a:[
      "好好辩。真理值得。",
      "找出表层之下，你们真正分歧之处。",
      "判断你们当中谁更可能对，并向那个人学习。",
      "把分歧搁在那里。有些东西本不会化解。",
      "活成不一样的样子，让分歧自己呼吸。"
    ]},
    ja: { p:"尊敬する人との間に、本物で長く続く道徳的な不一致がある — 誤解ではなく、本物の違い。誠実な動きは何か？", a:[
      "強く議論する。真理にはそれだけの価値がある。",
      "表面の下で、本当はどこで食い違っているのかを探す。",
      "どちらが正しい確率が高いかを決め、その人から学ぶ。",
      "不一致を抱えたままでおく。解けないものはある。",
      "別々に生きて、不一致に呼吸させる。"
    ]},
    ko: { p:"당신과 존경하는 어떤 사람 사이에 진짜이고 지속되는 도덕적 불일치가 있다 — 오해가 아니라 실재하는 차이. 정직한 움직임은?", a:[
      "강하게 논쟁한다. 진리는 그만한 가치가 있다.",
      "표면 아래에서 정말로 갈리는 지점을 찾아낸다.",
      "둘 중 누가 옳을 가능성이 더 높은지 정하고, 그에게서 배운다.",
      "불일치를 그대로 안고 간다. 어떤 것은 해소되지 않는다.",
      "다르게 살고, 불일치가 숨 쉬도록 둔다."
    ]},
  },
  3: {
    es: { p:"Te dan un botón. Si lo aprietas, vivirás una vida perfecta y dichosa — pero todo es una simulación. Si no lo aprietas, conservas tu vida real con todas sus decepciones. ¿Lo aprietas?", a:[
      "Lo aprieto — el placer es real venga de donde venga.",
      "No lo aprieto — la vida real tiene un sentido que va más allá del placer.",
      "No lo aprieto — ¿qué estaría perdiendo si nunca supiera que algo es real?",
      "Probablemente lo aprieto. La mayor parte de la \"vida real\" tampoco es gran cosa."
    ]},
    fr: { p:"On te donne un bouton. Tu l'appuies, tu vis une vie parfaite et joyeuse — mais c'est une simulation. Tu n'appuies pas, tu gardes ta vie réelle avec toutes ses déceptions. Tu appuies ?", a:[
      "J'appuie — le plaisir est réel d'où qu'il vienne.",
      "Je n'appuie pas — la vie réelle a un sens qui dépasse le plaisir.",
      "Je n'appuie pas — qu'est-ce que je perdrais si je ne savais jamais que c'est réel ?",
      "J'appuie probablement. La plupart de la \"vraie vie\" n'a rien d'extraordinaire."
    ]},
    pt: { p:"Você ganha um botão. Aperte e viverá uma vida perfeita e feliz — mas é tudo simulação. Não aperte e mantém sua vida real com todas as decepções. Aperta?", a:[
      "Aperto — prazer é real venha de onde vier.",
      "Não aperto — a vida real tem sentido para além do prazer.",
      "Não aperto — o que eu estaria perdendo se nunca soubesse que algo é real?",
      "Provavelmente aperto. Boa parte da \"vida real\" também não é grande coisa."
    ]},
    ru: { p:"Вам дают кнопку. Нажмёте — проживёте идеальную, радостную жизнь, но всё это симуляция. Не нажмёте — оставите свою настоящую жизнь со всеми её разочарованиями. Нажмёте?", a:[
      "Нажму — удовольствие реально, откуда бы оно ни шло.",
      "Не нажму — у настоящей жизни есть смысл за пределами удовольствия.",
      "Не нажму — что я потерял бы, если бы никогда не знал, что что-то настоящее?",
      "Скорее нажму. Большая часть «настоящей жизни» тоже так себе."
    ]},
    zh: { p:"给你一个按钮。按下，你将体验一段完美、欢乐的人生 —— 但全是模拟。不按，你保留你真实的生活，连同它所有的失望。按吗？", a:[
      "按 —— 快乐是真实的，无论它从哪里来。",
      "不按 —— 真实的人生有超越快乐的意义。",
      "不按 —— 如果我永远不知道什么才是真的，我又算失去了什么？",
      "大概会按。所谓「真实人生」，多数也没多好。"
    ]},
    ja: { p:"ボタンを渡される。押せば完全で歓ばしい人生を体験できる — ただし全てシミュレーション。押さなければ、失望ごと現実の人生を保つ。押すか？", a:[
      "押す — 喜びはどこから来ようと本物だ。",
      "押さない — 実人生には喜び以上の意味がある。",
      "押さない — 何が現実だったかを永遠に知らないなら、自分は何を失ったことになる？",
      "たぶん押す。「実人生」だってほとんどはたいしたものでもない。"
    ]},
    ko: { p:"버튼이 주어진다. 누르면 완벽하고 기쁜 삶을 살게 된다 — 단, 모든 것이 시뮬레이션. 안 누르면 실망까지 모두 포함한 진짜 삶을 유지한다. 누르겠나?", a:[
      "누른다 — 즐거움은 어디서 오든 진짜다.",
      "안 누른다 — 진짜 삶에는 즐거움 너머의 의미가 있다.",
      "안 누른다 — 어떤 것이 진짜인지 끝내 모른다면, 무엇을 잃은 셈일까?",
      "아마 누른다. 사실 \"진짜 삶\"의 대부분도 그리 대단치는 않다."
    ]},
  },
  4: {
    es: { p:"Alguien que amas tomó una decisión libre y deliberada — sin coacción, ni adicción, ni accidente — que arruinó su vida. Mirando atrás, piensas:", a:[
      "Pudo elegir distinto. Es responsable.",
      "Dado quién era y todo lo que había vivido, esto siempre iba a pasar.",
      "Las dos cosas — es responsable Y siempre iba a pasar.",
      "Ninguna. La vida son sobre todo accidentes que narramos después."
    ]},
    fr: { p:"Quelqu'un que tu aimes a pris une décision libre et délibérée — sans contrainte, ni addiction, ni accident — qui a ruiné sa vie. Avec le recul, tu penses :", a:[
      "Il aurait pu choisir autrement. Il est responsable.",
      "Vu qui il était et ce qu'il avait traversé, ça allait arriver de toute façon.",
      "Les deux — il est responsable ET ça allait arriver.",
      "Aucun des deux. La vie, ce sont surtout des accidents qu'on raconte après."
    ]},
    pt: { p:"Alguém que você ama tomou uma decisão livre e deliberada — sem coerção, vício ou acidente — que arruinou sua vida. Olhando para trás, você pensa:", a:[
      "Poderia ter escolhido diferente. É responsável.",
      "Dado quem era e tudo o que viveu, isso sempre ia acontecer.",
      "As duas coisas — é responsável E sempre ia acontecer.",
      "Nem uma nem outra. A vida é, sobretudo, acidentes que contamos depois."
    ]},
    ru: { p:"Близкий вам человек принял свободное, обдуманное решение — без принуждения, зависимости или случайности, — которое разрушило его жизнь. Оглядываясь, вы думаете:", a:[
      "Он мог выбрать иначе. Он отвечает за это.",
      "Учитывая, кем он был и через что прошёл, это так или иначе случилось бы.",
      "И то, и другое — он отвечает И это так или иначе случилось бы.",
      "Ни то, ни другое. Жизнь — в основном случайности, которые мы потом пересказываем."
    ]},
    zh: { p:"你深爱的人做了一个自由、深思熟虑的决定 —— 没有胁迫、没有成瘾、没有意外 —— 而这毁掉了他的人生。回头看，你会想：", a:[
      "他本可以选不同的。他要负责。",
      "鉴于他是谁、走过什么路，这迟早都会发生。",
      "两者都对 —— 他要负责，而且这迟早都会发生。",
      "都不对。人生大多是事故，我们事后加上叙事。"
    ]},
    ja: { p:"あなたが愛する誰かが、強制も依存も事故もない、自由で熟慮した決断をして人生を壊した。振り返って、あなたはこう思う：", a:[
      "別の選択もできたはず。本人に責任がある。",
      "その人がそういう人で、それまでを経てきた以上、これはどのみち起きた。",
      "両方 — 本人に責任があり、なおかつどのみち起きた。",
      "どちらでもない。人生はほとんど偶然で、私たちは後から物語にしている。"
    ]},
    ko: { p:"당신이 사랑하는 이가 강요도, 중독도, 사고도 없이 자유롭게 숙고한 결정을 내려 인생을 망가뜨렸다. 돌아보며 당신은 이렇게 생각한다:", a:[
      "다르게 선택할 수도 있었다. 그는 책임이 있다.",
      "그가 어떤 사람이었고 무엇을 겪었는지 보면, 이것은 결국 일어날 일이었다.",
      "둘 다 — 책임이 있고, 그리고 어쨌든 일어날 일이었다.",
      "둘 다 아니다. 인생은 대부분 사고이고, 우리는 나중에 이야기를 붙인다."
    ]},
  },
  5: {
    es: { p:"A mitad de carrera te das cuenta de que el trabajo ya no significa nada para ti. Es inofensivo, paga bien, y tienes alternativas viables si quisieras irte. ¿Qué es lo sabio?", a:[
      "Quédate. Encuentra sentido fuera del trabajo.",
      "Vete. Una vida con sentido no puede tener 40 horas semanales sin sentido.",
      "Quédate, pero redefine el trabajo. El sentido es un marco que llevas tú.",
      "Quédate y sufre en silencio. La mayoría de las vidas tiene este tipo de compromiso.",
      "La premisa supone que el sentido es el marco adecuado para el trabajo."
    ]},
    fr: { p:"À mi-carrière, tu te rends compte que le travail n'a plus aucun sens pour toi. Il est inoffensif, bien payé, et tu as des alternatives viables si tu voulais partir. Le geste sage ?", a:[
      "Reste. Trouve du sens en dehors du travail.",
      "Pars. Une vie pleine de sens ne peut contenir 40 heures par semaine de non-sens.",
      "Reste, mais redéfinis le travail. Le sens est un cadre que tu apportes.",
      "Reste et fais ton deuil en silence. La plupart des vies contiennent ce genre de compromis.",
      "Le présupposé que le sens est le bon cadre pour le travail est lui-même discutable."
    ]},
    pt: { p:"No meio da carreira, você percebe que o trabalho não significa mais nada para você. É inofensivo, paga bem, e você tem alternativas viáveis se quisesse sair. Qual o movimento sábio?", a:[
      "Fique. Encontre sentido fora do trabalho.",
      "Saia. Uma vida com sentido não comporta 40 horas semanais de falta de sentido.",
      "Fique, mas redefina o trabalho. Sentido é um enquadramento que você traz.",
      "Fique e lute o luto em silêncio. A maioria das vidas tem esse tipo de compromisso.",
      "A pergunta supõe que sentido seja o quadro certo para o trabalho."
    ]},
    ru: { p:"К середине карьеры вы понимаете, что работа больше ничего для вас не значит. Она безвредна, платят хорошо, и есть жизнеспособные альтернативы, если уйти. Мудрый ход?", a:[
      "Останьтесь. Найдите смысл вне работы.",
      "Уйдите. Осмысленная жизнь не вмещает 40 часов бессмысленности в неделю.",
      "Останьтесь, но переопределите саму работу. Смысл — это рамка, которую приносите вы.",
      "Останьтесь и тихо горюйте. Большинство жизней содержит такого рода компромисс.",
      "Предпосылка сама под вопросом: верно ли, что смысл — нужная рамка для работы вообще?"
    ]},
    zh: { p:"职业生涯过半，你发现工作对你已无任何意义。它无害、薪水不错，你也有可行的替代选择。明智的做法是？", a:[
      "留下。在工作之外寻意义。",
      "辞掉。一段有意义的生活，不该包含每周 40 小时的无意义。",
      "留下，但重新定义这份工作。意义是你带进去的框架。",
      "留下，安静地哀悼。大多数人生都包含这种妥协。",
      "前提本身值得追问 —— 「意义」未必是衡量工作的正确框架。"
    ]},
    ja: { p:"キャリアの半ばで、仕事が自分にとってもう何も意味しないと気づく。害はなく、給料も良く、辞めるなら別の道もある。賢明な動きは？", a:[
      "とどまる。意味は仕事の外で見つける。",
      "辞める。意味ある人生に、週 40 時間の無意味は含められない。",
      "とどまり、仕事自体を定義し直す。意味とは、自分が持ち込む枠組みだ。",
      "とどまり、静かに喪に服す。多くの人生にはこの種の妥協が含まれる。",
      "そもそも仕事に「意味」という枠組みを当てるのが正しいのか、という前提自体が疑わしい。"
    ]},
    ko: { p:"경력의 한가운데서, 그 일이 더는 의미가 없다는 걸 깨닫는다. 해가 되진 않고, 보수는 좋고, 떠나려면 갈 곳도 있다. 현명한 움직임은?", a:[
      "남는다. 의미는 일 바깥에서 찾는다.",
      "떠난다. 의미 있는 삶에 주 40시간의 무의미를 담을 수는 없다.",
      "남되, 일 자체를 다시 정의한다. 의미는 당신이 가져오는 틀이다.",
      "남아 조용히 애도한다. 대부분의 삶은 이런 종류의 타협을 안고 간다.",
      "전제 자체가 의심스럽다 — '의미'가 일에 맞는 틀인지부터."
    ]},
  },
  6: {
    es: { p:"Una práctica antigua se ha hecho de la misma manera durante 2.000 años. Alguien propone una manera claramente más eficiente. Tu reacción visceral:", a:[
      "Adopta lo nuevo. Gana la eficiencia.",
      "Mantén la tradición. La supervivencia larga es evidencia de sabiduría oculta.",
      "Investiga por qué la vieja perduró antes de cambiar nada.",
      "Pruébalas las dos durante una temporada. Mira lo que pasa de verdad.",
      "Espera. A veces la vía natural se revela cuando dejas de forzar."
    ]},
    fr: { p:"Une pratique ancienne se fait de la même manière depuis 2 000 ans. Quelqu'un propose une voie clairement plus efficace. Ta réaction immédiate :", a:[
      "Adopter le nouveau. L'efficacité l'emporte.",
      "Tenir à la tradition. Une longue survie est l'indice d'une sagesse cachée.",
      "Enquêter sur la raison de la persistance de l'ancien avant de changer quoi que ce soit.",
      "Essayer les deux pendant une saison. Voir ce qui se passe vraiment.",
      "Attendre. Parfois, la voie juste se révèle quand on cesse de forcer."
    ]},
    pt: { p:"Uma prática antiga é feita do mesmo jeito há 2.000 anos. Alguém propõe um modo claramente mais eficiente. Reação imediata:", a:[
      "Adote o novo. Eficiência ganha.",
      "Mantenha a tradição. A longa sobrevivência é evidência de sabedoria escondida.",
      "Investigue por que o jeito antigo persistiu antes de mudar.",
      "Tente os dois por um tempo. Veja o que de fato acontece.",
      "Espere. Às vezes o caminho natural se revela quando se deixa de forçar."
    ]},
    ru: { p:"Древняя практика делается одинаково две тысячи лет. Кто-то предлагает явно более эффективный способ. Ваша моментальная реакция:", a:[
      "Принять новое. Эффективность побеждает.",
      "Держаться традиции. Долгое выживание — свидетельство скрытой мудрости.",
      "Сначала разобраться, почему старая держалась — потом менять.",
      "Попробовать обе одно время. Посмотреть, что реально происходит.",
      "Подождать. Иногда естественный путь обнаруживает себя, когда перестаёшь давить."
    ]},
    zh: { p:"一项古老的做法两千年来都按一种方式进行。有人提出一种明显更高效的方式。你的本能反应：", a:[
      "采用新方式。效率优先。",
      "守住传统。长久存留本身就是隐性智慧的证据。",
      "在改变之前，先弄清旧法为何延续下来。",
      "两者并行一段时间。看看真实情况。",
      "等一等。当你不再硬推，自然的路有时会自己显现。"
    ]},
    ja: { p:"ある古い実践が、2000 年同じやり方で続いている。誰かが明らかにもっと効率の良い方法を提案する。あなたの直感的な反応は：", a:[
      "新しいやり方を採る。効率が勝つ。",
      "伝統を守る。長く生き残ったことそのものが、隠れた知恵の証拠。",
      "古いやり方が続いてきた理由を調べてから変える。",
      "ひと季節、両方を試す。実際に何が起きるか見る。",
      "待つ。押すのをやめると、自然なやり方がひとりでに現れることがある。"
    ]},
    ko: { p:"한 오래된 실천이 2,000년 동안 같은 방식으로 이어져 왔다. 누군가 분명히 더 효율적인 방식을 제안한다. 본능적 반응은?", a:[
      "새 방식을 받아들인다. 효율이 이긴다.",
      "전통을 지킨다. 오래 살아남은 것 자체가 숨은 지혜의 증거다.",
      "옛 방식이 왜 지속됐는지 먼저 살핀 뒤 바꾼다.",
      "한동안 두 방식을 함께 해본다. 실제로 어떤 일이 일어나는지 본다.",
      "기다린다. 억지로 밀지 않을 때, 자연스러운 방식이 스스로 드러나기도 한다."
    ]},
  },
  7: {
    es: { p:"Tienes dos horas libres y ningún compromiso. ¿Qué te alimenta más? Elige una o dos que de verdad encajen.", a:[
      "Leer algo difícil. La comprensión real cuesta.",
      "Caminar por algún lugar hermoso, en silencio.",
      "Hacer algo con las manos.",
      "Estar con gente que quieres, sin hacer nada en particular."
    ]},
    fr: { p:"Tu as deux heures libres et aucune obligation. Qu'est-ce qui te nourrit le plus ? Choisis une ou deux options qui te correspondent vraiment.", a:[
      "Lire quelque chose de difficile. La vraie compréhension demande de l'effort.",
      "Marcher dans un endroit beau, en silence.",
      "Faire quelque chose avec tes mains.",
      "Être avec ceux que tu aimes, sans rien faire de particulier."
    ]},
    pt: { p:"Você tem duas horas livres e nenhuma obrigação. O que mais te alimenta? Escolha uma ou duas que realmente combinem.", a:[
      "Ler algo difícil. Compreensão real exige trabalho.",
      "Caminhar em um lugar bonito, em silêncio.",
      "Fazer algo com as mãos.",
      "Estar com pessoas que ama, sem fazer nada em particular."
    ]},
    ru: { p:"У вас два свободных часа и никаких обязательств. Что вас наполняет больше всего? Выберите одно-два варианта, которые действительно подходят.", a:[
      "Прочесть что-то сложное. Настоящее понимание требует труда.",
      "Пройтись по красивому месту в тишине.",
      "Сделать что-то руками.",
      "Побыть с теми, кого любите, ничем особенным не занимаясь."
    ]},
    zh: { p:"你有两个小时空闲，没有任何责任。哪一种最让你回血？挑一两个真正适合你的。", a:[
      "读点难的东西。真正的理解要花力气。",
      "在某处美景里安静地走一走。",
      "用手做点东西。",
      "和你爱的人在一起，无所事事。"
    ]},
    ja: { p:"自由な 2 時間、何の義務もない。あなたを最も満たすのは？ 本当に当てはまるものを 1 つか 2 つ選ぶ。", a:[
      "難しいものを読む。本当の理解には労が要る。",
      "美しい場所を、静かに歩く。",
      "手を動かして何かを作る。",
      "愛する人と、特に何をするでもなく一緒にいる。"
    ]},
    ko: { p:"두 시간이 비어 있고 아무 의무도 없다. 무엇이 당신을 가장 채우나요? 정말로 맞는 하나나 둘을 고르세요.", a:[
      "어려운 것을 읽는다. 진짜 이해에는 품이 든다.",
      "아름다운 곳을 조용히 걷는다.",
      "손으로 무언가를 만든다.",
      "사랑하는 사람과 특별한 것 없이 함께 있는다."
    ]},
  },
  8: {
    es: { p:"¿Cuál es la fuente de verdad más confiable?", a:[
      "El razonamiento cuidadoso a partir de principios claros.",
      "La experiencia y la observación directas.",
      "Tradiciones y textos que han durado generaciones.",
      "La atención silenciosa a lo que está debajo de las palabras.",
      "Ninguna sola — todas, sopesadas entre sí."
    ]},
    fr: { p:"Quelle est la source de vérité la plus fiable ?", a:[
      "Le raisonnement soigné à partir de principes clairs.",
      "L'expérience et l'observation directes.",
      "Les traditions et les textes qui ont traversé les générations.",
      "L'attention silencieuse à ce qui est sous les mots.",
      "Aucune seule — toutes, pesées les unes contre les autres."
    ]},
    pt: { p:"Qual é a fonte de verdade mais confiável?", a:[
      "Raciocínio cuidadoso a partir de princípios claros.",
      "Experiência e observação direta.",
      "Tradições e textos que duraram gerações.",
      "Atenção silenciosa ao que está abaixo das palavras.",
      "Nenhuma sozinha — todas, pesadas umas contra as outras."
    ]},
    ru: { p:"Какой источник истины самый надёжный?", a:[
      "Тщательное рассуждение из ясных принципов.",
      "Прямой опыт и наблюдение.",
      "Традиции и тексты, выдержавшие поколения.",
      "Тихое внимание к тому, что под словами.",
      "Ни один в одиночку — все вместе, в сопоставлении."
    ]},
    zh: { p:"哪一个是最可靠的真理来源？", a:[
      "从清楚原则出发的细致推理。",
      "直接的经验与观察。",
      "穿越世代仍存在的传统与文本。",
      "对话语之下东西的安静注意。",
      "没有哪一种单独可靠 —— 它们彼此互相称量。"
    ]},
    ja: { p:"もっとも信頼できる真理の源泉は？", a:[
      "明確な原理からの丁寧な推論。",
      "直接の経験と観察。",
      "世代を超えて生き残った伝統や古典。",
      "ことばの下にあるものへの、静かな注意。",
      "どれ単独でもない — すべてを互いに照らし合わせること。"
    ]},
    ko: { p:"가장 신뢰할 수 있는 진리의 원천은?", a:[
      "명확한 원리에서 출발하는 세심한 추론.",
      "직접적인 경험과 관찰.",
      "여러 세대를 거치며 살아남은 전통과 문헌.",
      "말 아래 있는 것에 대한 고요한 주의.",
      "어느 하나만으로는 안 된다 — 모두를 서로 견주어 가며."
    ]},
  },
  9: {
    es: { p:"Cuando enfrentas una decisión difícil, ¿cuál es tu primer movimiento real?", a:[
      "Listar las opciones y sus consecuencias probables.",
      "Atender al cuerpo — ¿qué es lo que él quiere?",
      "Preguntar qué haría la persona en la que quiero convertirme.",
      "Hablar con la gente que quiero.",
      "Dormir sobre ello. La respuesta llega cuando dejo de buscarla.",
      "Buscar la opción que estoy evitando. Suele ser la correcta."
    ]},
    fr: { p:"Face à une décision difficile, quel est ton vrai premier geste ?", a:[
      "Lister les options et leurs conséquences probables.",
      "Écouter mon corps — qu'est-ce qu'il veut ?",
      "Demander ce que ferait la personne que je veux devenir.",
      "Parler avec ceux que j'aime.",
      "Dormir dessus. La réponse vient quand je cesse de tendre la main.",
      "Chercher le choix que j'évite. C'est souvent le bon."
    ]},
    pt: { p:"Diante de uma decisão difícil, qual é seu primeiro movimento de verdade?", a:[
      "Listar as opções e suas consequências prováveis.",
      "Notar o corpo — o que ele quer?",
      "Perguntar o que faria a pessoa que eu quero me tornar.",
      "Falar com as pessoas que amo.",
      "Dormir sobre isso. A resposta vem quando paro de buscar.",
      "Procurar a escolha que estou evitando. Costuma ser a certa."
    ]},
    ru: { p:"Когда перед вами трудное решение, каков ваш реальный первый ход?", a:[
      "Перечислить варианты и их вероятные последствия.",
      "Прислушаться к телу — чего оно хочет?",
      "Спросить, что сделал бы тот, кем я хочу стать.",
      "Поговорить с теми, кого люблю.",
      "Поспать на этом. Ответ приходит, когда перестаёшь тянуться к нему.",
      "Найти выбор, которого я избегаю. Обычно он и есть верный."
    ]},
    zh: { p:"面对一个艰难的决定，你真正的第一步是什么？", a:[
      "把选项和它们可能的后果列出来。",
      "留意身体 —— 它想要什么？",
      "问：我想成为的那个人会怎么做？",
      "和我爱的人聊聊。",
      "把它放过夜。当我不再去够，答案自己会来。",
      "去找那个我在回避的选项。它常常就是对的。"
    ]},
    ja: { p:"難しい決断を前にしたとき、あなたの本当の最初の一手は？", a:[
      "選択肢とそれぞれの予想される結果を書き出す。",
      "身体に気づく — それは何を望んでいるか。",
      "自分がなりたい人なら何をするかを問う。",
      "愛する人たちと話す。",
      "ひと晩寝かせる。手を伸ばすのをやめたとき、答えが来る。",
      "自分が避けている選択肢を探す。たいてい、それが正解。"
    ]},
    ko: { p:"어려운 결정 앞에서, 당신의 실제 첫 동작은?", a:[
      "선택지와 가능한 결과들을 적어 본다.",
      "몸을 살핀다 — 몸은 무엇을 원하는가?",
      "내가 되고 싶은 사람이라면 어떻게 할지를 묻는다.",
      "사랑하는 사람들과 이야기한다.",
      "하룻밤 묵힌다. 손을 뻗지 않을 때 답이 온다.",
      "내가 피하고 있는 선택지를 찾는다. 보통 그것이 맞는 답이다."
    ]},
  },
  10: {
    es: { p:"Sobre la cuestión de Dios, lo sagrado, o como quieras llamarlo:", a:[
      "Algo está ahí, aunque no podamos nombrarlo.",
      "Probablemente no. El mundo tiene sentido sin eso.",
      "La pregunta misma importa más que cualquier respuesta.",
      "Piense lo que piense en privado, respeto lo que la gente ha construido alrededor."
    ]},
    fr: { p:"Sur la question de Dieu, du sacré, ou de ce que tu voudrais l'appeler :", a:[
      "Quelque chose est là, même si on ne sait pas le nommer.",
      "Probablement pas. Le monde a du sens sans cela.",
      "La question elle-même importe plus que toute réponse.",
      "Quoi que je pense personnellement, je respecte ce que les gens ont bâti autour."
    ]},
    pt: { p:"Sobre a questão de Deus, do sagrado, ou seja lá como você o chame:", a:[
      "Algo está ali, mesmo se não podemos nomear.",
      "Provavelmente não. O mundo faz sentido sem isso.",
      "A pergunta em si importa mais que qualquer resposta.",
      "Pessoalmente pense o que pensar, respeito o que as pessoas construíram em torno disso."
    ]},
    ru: { p:"О вопросе Бога, священного — или как бы вы это ни называли:", a:[
      "Что-то там есть, даже если мы не можем это назвать.",
      "Скорее всего нет. Мир имеет смысл и без этого.",
      "Сам вопрос важнее любого ответа на него.",
      "Что бы я ни думал лично, я уважаю то, что люди построили вокруг этого."
    ]},
    zh: { p:"关于神、关于神圣 —— 或你愿意如何称呼它的问题：", a:[
      "有什么在那里，哪怕我们叫不出名字。",
      "大概没有。这个世界没有它也讲得通。",
      "问题本身，比任何答案都重要。",
      "无论我个人怎么想，我都尊重人们围绕它建起来的东西。"
    ]},
    ja: { p:"神について、聖なるものについて、あるいはあなたがそれを何と呼ぶにせよ：", a:[
      "何かはある。たとえ名づけられなくとも。",
      "おそらくない。この世界はそれなしでも筋が通っている。",
      "問いそのものが、いかなる答えよりも重い。",
      "個人としてどう思おうと、人々がその周りに築き上げてきたものは尊重する。"
    ]},
    ko: { p:"신에 대해, 성스러움에 대해 — 혹은 당신이 그것을 무엇이라 부르든:", a:[
      "무언가가 거기 있다. 우리가 이름 붙이지 못하더라도.",
      "아마 아니다. 세계는 그것 없이도 말이 된다.",
      "어떤 답보다 질문 자체가 더 중요하다.",
      "개인적으로 어떻게 생각하든, 사람들이 그것을 둘러싸고 쌓아 올린 것은 존중한다."
    ]},
  },
  11: {
    es: { p:"¿Eres la misma persona que eras hace diez años?", a:[
      "Sí. Hay un yo continuo, aunque haya cambiado.",
      "No. Soy una persona distinta que comparte recuerdos con aquélla.",
      "La pregunta está mal planteada — no hay un \"yo\" fijo que comparar.",
      "En su mayor parte sí, pero un desconocido apenas me reconocería.",
      "No lo pienso. No me ayuda a vivir."
    ]},
    fr: { p:"Es-tu la même personne qu'il y a dix ans ?", a:[
      "Oui. Il y a un soi continu, même si j'ai changé.",
      "Non. Je suis une autre personne qui partage des souvenirs avec celle-là.",
      "La question est mal posée — il n'y a pas de \"soi\" fixe à comparer.",
      "Surtout oui, mais un inconnu me reconnaîtrait à peine.",
      "Je n'y pense pas. Ça ne m'aide pas à vivre."
    ]},
    pt: { p:"Você é a mesma pessoa que era dez anos atrás?", a:[
      "Sim. Há um eu contínuo, mesmo que eu tenha mudado.",
      "Não. Sou outra pessoa que compartilha memórias com aquela.",
      "A pergunta é mal formada — não há um \"eu\" fixo para comparar.",
      "Na maior parte sim, mas um estranho mal me reconheceria.",
      "Não penso nisso. Não me ajuda a viver."
    ]},
    ru: { p:"Вы тот же человек, что был десять лет назад?", a:[
      "Да. Есть непрерывное «я», даже если я изменился.",
      "Нет. Я другой человек, у которого общие воспоминания с тем.",
      "Вопрос неверно поставлен — нет фиксированного «я», которое можно было бы сравнить.",
      "В основном да, но посторонний меня едва бы узнал.",
      "Я об этом не думаю. Это не помогает жить."
    ]},
    zh: { p:"你和十年前的你是同一个人吗？", a:[
      "是。我有一个延续的自我，即便我变过。",
      "不是。我是另一个人，只是共享着那一个的记忆。",
      "问题本身不通 —— 没有一个固定的「自我」可以拿来比对。",
      "大体上是，但陌生人怕也认不出我了。",
      "我不去想这个。它对生活没有帮助。"
    ]},
    ja: { p:"あなたは 10 年前のあなたと同じ人物ですか？", a:[
      "はい。変わってきても、連続した自己はある。",
      "いいえ。私はあの人物と記憶を共有する、別の人物。",
      "問いが歪んでいる — 比べるべき固定された「自己」などない。",
      "おおむねイエス。でも他人ならほとんど認識できないだろう。",
      "考えない。生きるのに役立たない。"
    ]},
    ko: { p:"당신은 10년 전의 당신과 같은 사람인가요?", a:[
      "그렇다. 변했더라도 이어지는 자아가 있다.",
      "아니다. 그 사람과 기억을 공유하는 다른 사람이다.",
      "질문 자체가 잘못됐다 — 비교할 고정된 \"자아\"는 없다.",
      "대체로 그렇다. 다만 낯선 사람은 거의 알아보지 못할 것이다.",
      "그것을 생각하지 않는다. 사는 데 도움이 되지 않는다."
    ]},
  },
  12: {
    es: { p:"Justicia — ¿qué es, sobre todo?", a:[
      "Tratar a iguales por igual y a desiguales en proporción.",
      "Dar a cada uno lo que necesita para vivir bien.",
      "Dar a cada uno lo que ha ganado con su esfuerzo.",
      "Lo que una comunidad ha construido como justo a lo largo del tiempo.",
      "Lo que la gente hace junta cuando comparte lo que tiene.",
      "Un ideal imposible hacia el que seguimos avanzando a tropezones."
    ]},
    fr: { p:"La justice — qu'est-ce, principalement ?", a:[
      "Traiter les égaux à égalité et les inégaux en proportion.",
      "Donner à chacun ce qu'il faut pour bien vivre.",
      "Donner à chacun ce qu'il a gagné par ses efforts.",
      "Ce qu'une communauté a construit avec le temps comme étant juste.",
      "Ce que les gens font ensemble quand ils partagent ce qu'ils ont.",
      "Un idéal impossible vers lequel nous trébuchons sans cesse."
    ]},
    pt: { p:"Justiça — o que é, sobretudo?", a:[
      "Tratar iguais como iguais e desiguais proporcionalmente.",
      "Dar a cada um o que precisa para viver bem.",
      "Dar a cada um o que ganhou com seu esforço.",
      "Aquilo que uma comunidade construiu ao longo do tempo como justo.",
      "O que as pessoas fazem juntas quando dividem o que têm.",
      "Um ideal impossível em direção ao qual seguimos tropeçando."
    ]},
    ru: { p:"Справедливость — что она, прежде всего?", a:[
      "Обходиться с равными как с равными, а с неравными — пропорционально.",
      "Давать каждому то, что нужно для хорошей жизни.",
      "Давать каждому то, что он заслужил усилием.",
      "Всё то, что сообщество со временем сложило как справедливое.",
      "То, что люди делают вместе, когда делятся тем, что у них есть.",
      "Невозможный идеал, к которому мы продолжаем спотыкаться."
    ]},
    zh: { p:"正义 —— 它最根本是什么？", a:[
      "平等地对待平等者，不平等者按比例对待。",
      "给每个人他们好好生活所需要的。",
      "给每个人他们靠努力挣来的。",
      "一个社群随着时间累积起来、被认作公正的东西。",
      "人们在彼此分享所拥有的时候共同造出的东西。",
      "一个不可能的理想，我们不断跌跌撞撞地靠近它。"
    ]},
    ja: { p:"正義 — 第一に、それは何か？", a:[
      "等しい者を等しく、等しくない者を比例して扱うこと。",
      "それぞれが善く生きるのに必要なものを与えること。",
      "それぞれが努力で得たものを与えること。",
      "ある共同体が時間をかけて公正だと築き上げてきたもの。",
      "人々が、持てるものを分かち合うときに共に作り出すもの。",
      "決してたどり着けず、それでも我々がよろめきながら向かう理想。"
    ]},
    ko: { p:"정의 — 무엇보다 그것은 무엇인가?", a:[
      "같은 자는 같게, 다른 자는 그에 비례해 다루는 것.",
      "각자가 잘 살기 위해 필요한 것을 주는 것.",
      "각자가 수고로 얻어낸 것을 주는 것.",
      "한 공동체가 오랜 시간에 걸쳐 공정하다고 쌓아 올린 것.",
      "사람들이 가진 것을 나눌 때 함께 만들어 내는 것.",
      "도달할 수 없는 이상, 그래도 우리가 비틀거리며 향해 가는 것."
    ]},
  },
  13: {
    es: { p:"Estás en una cena con gente que quieres. Sirven ternera — y la forma en que se produce te resulta éticamente problemática. Tus anfitriones no conocían tu postura y comen felices. ¿Qué haces?", a:[
      "Comes con ellos. La conexión en este momento importa más que el principio.",
      "Comes los acompañamientos en silencio sin armar escena.",
      "Rechazas educadamente y explicas si te preguntan.",
      "Rechazas y planteas suavemente la cuestión."
    ]},
    fr: { p:"Tu es à un dîner avec des gens que tu aimes. On sert du veau — et la façon dont il est produit te pose un vrai problème éthique. Tes hôtes ignoraient ta position et mangent avec plaisir. Tu fais quoi ?", a:[
      "Tu manges avec eux. La connexion ici et maintenant compte plus que le principe.",
      "Tu manges les accompagnements en silence, sans faire de scène.",
      "Tu décline poliment et expliques si on te le demande.",
      "Tu décline et soulève la question avec douceur."
    ]},
    pt: { p:"Você está em um jantar com pessoas que ama. Servem vitela — e a forma como é produzida te incomoda eticamente. Seus anfitriões não conheciam sua posição e comem felizes. O que faz?", a:[
      "Coma com eles. A conexão deste momento importa mais que o princípio.",
      "Coma os acompanhamentos em silêncio sem causar cena.",
      "Recuse educadamente e explique se perguntarem.",
      "Recuse e levante a questão com gentileza."
    ]},
    ru: { p:"Вы на ужине с близкими. Подают телятину — а способ её производства этически вас тревожит. Хозяева не знали вашей позиции и едят с удовольствием. Что вы делаете?", a:[
      "Едите вместе. Связь здесь и сейчас важнее принципа.",
      "Молча едите гарниры, не устраивая сцен.",
      "Вежливо отказываетесь и объясняете, если спросят.",
      "Отказываетесь и мягко поднимаете вопрос."
    ]},
    zh: { p:"你和一群你爱的人在共进晚餐。端上的是小牛肉 —— 而你觉得它的生产方式在伦理上有问题。主人不知道你的看法，正高兴地吃着。你怎么做？", a:[
      "和他们一起吃。当下的连结比原则更重要。",
      "安静地吃配菜，不要搞出场面。",
      "礼貌拒绝；被问起时再解释。",
      "拒绝，并轻轻把这个问题提出来。"
    ]},
    ja: { p:"愛する人たちとの夕食。仔牛肉が出てくる — その生産の仕方をあなたは倫理的に問題と感じている。ホストはあなたの立場を知らずに楽しそうに食べている。どうする？", a:[
      "一緒に食べる。今この瞬間のつながりは、原則より重い。",
      "騒ぎ立てず、サイドだけを静かに食べる。",
      "丁寧に断り、聞かれたら説明する。",
      "断り、やさしく問いを差し出す。"
    ]},
    ko: { p:"사랑하는 사람들과의 저녁 자리. 송아지 고기가 나온다 — 그것의 생산 방식이 당신에겐 윤리적으로 거슬린다. 주인장은 당신의 입장을 모른 채 즐겁게 먹고 있다. 어떻게 하나?", a:[
      "함께 먹는다. 지금의 연결이 원칙보다 더 중요하다.",
      "소란을 피우지 않고 사이드만 조용히 먹는다.",
      "정중히 사양하고, 물어보면 설명한다.",
      "사양하고, 부드럽게 그 질문을 꺼낸다."
    ]},
  },
  14: {
    es: { p:"La belleza en el mundo — ¿para qué sirve?", a:[
      "Para nada. Solo es. Por eso importa.",
      "Una señal evolutiva. El resto es decoración que añadimos.",
      "Apunta más allá de sí misma, hacia algo eterno.",
      "La forma más alta de utilidad — placer hecho permanente.",
      "Un recordatorio de seguir despierto a lo que ya está aquí."
    ]},
    fr: { p:"La beauté dans le monde — à quoi sert-elle ?", a:[
      "À rien. Elle est, simplement. C'est pour ça qu'elle compte.",
      "Un signal évolutif. Le reste, c'est de la décoration qu'on ajoute.",
      "Elle pointe au-delà d'elle-même, vers quelque chose d'éternel.",
      "La forme la plus haute de l'utilité — du plaisir rendu permanent.",
      "Un rappel : reste vivant à ce qui est déjà là."
    ]},
    pt: { p:"A beleza no mundo — para que serve?", a:[
      "Para nada. Ela apenas é. Por isso importa.",
      "Um sinal evolutivo. O resto é decoração que acrescentamos.",
      "Ela aponta para além de si, em direção a algo eterno.",
      "A forma mais alta de utilidade — prazer tornado permanente.",
      "Um lembrete de permanecer vivo ao que já está aqui."
    ]},
    ru: { p:"Красота в мире — для чего она?", a:[
      "Ни для чего. Она просто есть. Поэтому она и важна.",
      "Эволюционный сигнал. Остальное — декорация, которую мы добавляем.",
      "Она указывает за пределы себя — на нечто вечное.",
      "Высшая форма пользы — удовольствие, сделанное постоянным.",
      "Напоминание оставаться живым по отношению к тому, что уже здесь."
    ]},
    zh: { p:"这个世界中的美 —— 它是为了什么？", a:[
      "什么也不为。它就是。正因为如此它才重要。",
      "一种进化信号。其余是我们后加的装饰。",
      "它指向自身之外，指向某种永恒。",
      "最高形式的实用 —— 让快乐变得长久。",
      "一种提醒，提醒你对眼前已有之物保持鲜活。"
    ]},
    ja: { p:"世界の中の美 — それは何のためにある？", a:[
      "何のためでもない。ただある。だからこそ大切だ。",
      "進化的なシグナル。あとは私たちが付け足した装飾。",
      "美はそれ自身を超えて、永遠なるものを指し示す。",
      "もっとも高次の有用性 — 喜びを永続にしたもの。",
      "すでに目の前にあるものに対して生き生きとあれ、という呼びかけ。"
    ]},
    ko: { p:"세계 속의 아름다움 — 그것은 무엇을 위한 것인가?", a:[
      "어떤 목적도 없다. 그저 있다. 그래서 중요하다.",
      "진화적 신호다. 나머지는 우리가 덧붙인 장식.",
      "스스로를 넘어 어떤 영원한 것을 가리킨다.",
      "가장 높은 형태의 유용함 — 즐거움을 지속하게 만든 것.",
      "이미 여기 있는 것에 깨어 있으라는 신호."
    ]},
  },
  15: {
    es: { p:"De estos, ¿qué merece más la pena perseguir? Elige uno o dos que resuenen.", a:[
      "Sabiduría — entender cómo son las cosas de verdad.",
      "Excelencia — ser muy bueno en algo que importa.",
      "Conexión — vínculos profundos con otros.",
      "Paz — libertad respecto del desasosiego y la avidez.",
      "Alegría — experimentar plenamente estar vivo.",
      "Libertad — ser autor de tu propia vida."
    ]},
    fr: { p:"Parmi ceux-ci, lequel mérite le plus d'être poursuivi ? Choisis-en un ou deux qui sonnent juste.", a:[
      "La sagesse — comprendre comment les choses sont vraiment.",
      "L'excellence — être grand dans ce qui compte.",
      "La connexion — des liens profonds avec les autres.",
      "La paix — affranchi du trouble et du manque.",
      "La joie — éprouver pleinement le fait d'être vivant.",
      "La liberté — être l'auteur de sa propre vie."
    ]},
    pt: { p:"Destes, o que mais vale a pena buscar? Escolha um ou dois que ressoem.", a:[
      "Sabedoria — entender como as coisas realmente são.",
      "Excelência — ser ótimo em algo que importa.",
      "Conexão — laços profundos com os outros.",
      "Paz — liberdade do desassossego e do desejo.",
      "Alegria — experimentar plenamente estar vivo.",
      "Liberdade — ser autor da própria vida."
    ]},
    ru: { p:"Из этого — что больше всего стоит того, чтобы стремиться? Выберите одно-два, что отзывается.", a:[
      "Мудрость — понимать, как всё устроено на самом деле.",
      "Совершенство — быть превосходным в чём-то важном.",
      "Связь — глубокие узы с другими.",
      "Покой — свобода от смятения и жажды.",
      "Радость — полностью переживать, что живёшь.",
      "Свобода — быть автором собственной жизни."
    ]},
    zh: { p:"以下哪一项最值得追求？挑一两个真正打动你的。", a:[
      "智慧 —— 看清事物本来的样子。",
      "卓越 —— 在某件值得的事上做得极好。",
      "连结 —— 与他人之间深的纽带。",
      "宁静 —— 从扰动与渴求中得自由。",
      "喜悦 —— 完整地体验「正在活着」。",
      "自由 —— 做你自己人生的作者。"
    ]},
    ja: { p:"このうち、もっとも追い求める価値があるものは？ 本当に響くものを 1 つか 2 つ選ぶ。", a:[
      "知恵 — ものごとがほんとうにどうあるかを理解すること。",
      "卓越 — 重要なことに、卓越して在ること。",
      "つながり — 他者との深い結び。",
      "平安 — 動揺と渇きからの自由。",
      "喜び — 生きていることを存分に味わうこと。",
      "自由 — 自分の人生の作者であること。"
    ]},
    ko: { p:"이 중 가장 추구할 만한 것은 무엇인가요? 진짜로 와닿는 하나나 둘을 고르세요.", a:[
      "지혜 — 사물이 실제로 어떤지 이해하기.",
      "탁월 — 의미 있는 무언가에서 빼어나게 잘하기.",
      "연결 — 다른 이들과의 깊은 유대.",
      "평정 — 동요와 갈망으로부터의 자유.",
      "기쁨 — 살아 있다는 것을 온전히 누리기.",
      "자유 — 자기 삶의 저자가 되기."
    ]},
  },
  16: {
    es: { p:"Hay una política del gobierno que te parece dañina. ¿Qué haces?", a:[
      "Discutir, organizar, votar. El sistema se puede cambiar.",
      "Retirarte y vivir según tus propios valores.",
      "Esperar. El cambio rápido suele fallar. El lento perdura.",
      "Cuestionar si de verdad tienes razón sobre eso.",
      "Construir algo paralelo que no dependa de ello."
    ]},
    fr: { p:"Il y a une politique gouvernementale que tu trouves nuisible. Tu fais quoi ?", a:[
      "Débattre, organiser, voter. Le système peut changer.",
      "Te retirer et vivre selon tes propres valeurs.",
      "Attendre. Le changement rapide rate souvent. Le changement lent dure.",
      "Te demander si tu as vraiment raison là-dessus.",
      "Construire quelque chose en parallèle qui n'en dépend pas."
    ]},
    pt: { p:"Há uma política do governo que você acha danosa. O que faz?", a:[
      "Discutir, organizar, votar. O sistema pode mudar.",
      "Recolher-se e viver segundo seus próprios valores.",
      "Esperar. Mudança rápida costuma falhar. Mudança lenta dura.",
      "Questionar se você realmente está certo sobre isso.",
      "Construir algo paralelo que não dependa disso."
    ]},
    ru: { p:"Есть правительственная политика, которая, по-вашему, вредит. Что вы делаете?", a:[
      "Спорить, организовываться, голосовать. Систему можно менять.",
      "Отойти и жить по своим ценностям.",
      "Ждать. Быстрое изменение обычно не удаётся. Медленное — держится.",
      "Усомниться, действительно ли вы правы на этот счёт.",
      "Строить параллельное, что от этого не зависит."
    ]},
    zh: { p:"有一项政府政策你认为有害。你怎么做？", a:[
      "辩论、组织、投票。系统是可改的。",
      "退出来，按自己的价值过活。",
      "等。快的变革通常失败。慢的变革才长久。",
      "先质问自己 —— 我真的对吗？",
      "另起炉灶，做不依赖它的事。"
    ]},
    ja: { p:"あなたが有害だと感じる政府の政策がある。どうする？", a:[
      "議論し、組織し、投票する。制度は変えられる。",
      "退いて、自分の価値観に沿って生きる。",
      "待つ。速い変化はたいてい失敗する。遅い変化が残る。",
      "自分が本当に正しいか、いったん疑う。",
      "それに依存しない並行する何かを築く。"
    ]},
    ko: { p:"당신이 해롭다고 생각하는 정부 정책이 있다. 어떻게 하나?", a:[
      "토론하고, 조직하고, 투표한다. 체제는 바꿀 수 있다.",
      "물러나 자신의 가치관에 따라 산다.",
      "기다린다. 빠른 변화는 보통 실패한다. 느린 변화가 오래 간다.",
      "내가 정말 맞는지부터 의심해 본다.",
      "그것에 의존하지 않는 평행한 무언가를 짓는다."
    ]},
  },
  17: {
    es: { p:"Si pudieras subir tu mente a un sustrato digital perfecto — los mismos recuerdos, los mismos patrones de pensamiento, pero sin cuerpo y sin muerte — ¿lo harías?", a:[
      "Sí. El cuerpo es hardware. La mente es lo que importa.",
      "Sí, en algún momento. Pero no antes de entender qué perderíamos.",
      "No. El cuerpo no está separado de quien soy.",
      "No. La muerte le da forma a la vida.",
      "La pregunta supone que hay un \"yo\" que subir. En ese sentido, no lo hay."
    ]},
    fr: { p:"Si tu pouvais transférer ton esprit sur un substrat numérique parfait — mêmes souvenirs, mêmes schémas de pensée, mais sans corps et sans mort — le ferais-tu ?", a:[
      "Oui. Le corps est du matériel. L'esprit, c'est ce qui compte.",
      "Oui, à terme. Mais pas avant qu'on comprenne ce qu'on y perd.",
      "Non. Le corps n'est pas séparé de qui je suis.",
      "Non. La mort donne sa forme à la vie.",
      "La question suppose un \"moi\" à transférer. En ce sens, il n'y en a pas."
    ]},
    pt: { p:"Se você pudesse subir sua mente para um substrato digital perfeito — mesmas memórias, mesmos padrões de pensamento, mas sem corpo e sem morte — você subiria?", a:[
      "Sim. O corpo é hardware. A mente é o que importa.",
      "Sim, eventualmente. Mas só depois de entender o que perderíamos.",
      "Não. O corpo não é separado de quem eu sou.",
      "Não. A morte é o que dá forma à vida.",
      "A pergunta supõe um \"eu\" a ser carregado. Nesse sentido, não há."
    ]},
    ru: { p:"Если бы вы могли загрузить разум в идеальный цифровой носитель — те же воспоминания, те же узоры мыслей, но без тела и без смерти — стали бы вы?", a:[
      "Да. Тело — это железо. Важен ум.",
      "Да, со временем. Но только когда поймём, что при этом теряется.",
      "Нет. Тело не отделимо от того, кто я есть.",
      "Нет. Смерть придаёт жизни форму.",
      "Вопрос предполагает «я», которое можно загрузить. В этом смысле его нет."
    ]},
    zh: { p:"如果你能把心灵上传到一个完美的数字介质 —— 同样的记忆、同样的思维模式，但没有身体、没有死亡 —— 你会吗？", a:[
      "会。身体是硬件。心灵才要紧。",
      "终究会。但要等我们清楚自己将失去什么。",
      "不会。身体并非与我是谁分离开的。",
      "不会。死亡赋予生命形状。",
      "问题假设有一个可上传的「我」。在这个意义上，没有。"
    ]},
    ja: { p:"もし完全なデジタル基盤に自分の心をアップロードできるとしたら — 同じ記憶、同じ思考のパターン、ただし身体はなく死もない。アップロードしますか？", a:[
      "する。身体はハードウェア。心こそが要点だ。",
      "いずれする。ただし、何を失うのか理解できてから。",
      "しない。身体は自分が誰かということと切り離せない。",
      "しない。死こそが人生に形を与える。",
      "そもそも「アップロードすべき私」がいるという前提が怪しい。その意味で、いない。"
    ]},
    ko: { p:"완벽한 디지털 매체로 마음을 업로드할 수 있다면 — 같은 기억, 같은 사고 패턴, 다만 몸도 없고 죽음도 없다. 업로드하겠나?", a:[
      "한다. 몸은 하드웨어. 중요한 건 마음이다.",
      "결국엔 한다. 단, 무엇을 잃는지 이해하고 나서.",
      "안 한다. 몸은 내가 누구인가와 분리되지 않는다.",
      "안 한다. 죽음이 삶에 형태를 준다.",
      "그 질문은 업로드할 \"나\"가 있다고 가정한다. 그런 의미의 \"나\"는 없다."
    ]},
  },
  18: {
    es: { p:"¿Somos hoy responsables del daño que causaron nuestros antepasados — los males hechos por las instituciones, naciones o grupos a los que pertenecemos, generaciones antes de nacer?", a:[
      "Sí. Heredamos sus ventajas, así que heredamos sus deudas.",
      "Sí, en el sentido de que debemos enmendarlo de aquí en adelante.",
      "No. Cada persona responde por lo que hizo, no por lo que hicimos «nosotros».",
      "La pregunta es más interesante que cualquier respuesta a ella."
    ]},
    fr: { p:"Sommes-nous aujourd'hui responsables des torts causés par nos ancêtres — c'est-à-dire les maux commis par les institutions, nations ou groupes auxquels nous appartenons, des générations avant notre naissance ?", a:[
      "Oui. Nous héritons de leurs avantages, donc de leurs dettes.",
      "Oui, dans le sens où nous devons réparer à partir de maintenant.",
      "Non. Chaque personne répond de ce qu'elle a fait, pas de ce qu'« on » a fait.",
      "La question est plus intéressante que n'importe quelle réponse."
    ]},
    pt: { p:"Somos hoje responsáveis pelos danos que nossos antepassados causaram — males feitos pelas instituições, nações ou grupos a que pertencemos, gerações antes de nascermos?", a:[
      "Sim. Herdamos seus privilégios, portanto herdamos suas dívidas.",
      "Sim, no sentido de que devemos consertar daqui em diante.",
      "Não. Cada pessoa responde pelo que fez, não pelo que \"nós\" fizemos.",
      "A pergunta é mais interessante que qualquer resposta a ela."
    ]},
    ru: { p:"Несём ли мы сегодня ответственность за зло, причинённое нашими предками — то есть за неправды, совершённые институтами, нациями или группами, к которым мы принадлежим, за поколения до нашего рождения?", a:[
      "Да. Мы унаследовали их преимущества — значит, унаследовали и долги.",
      "Да, в том смысле, что должны исправлять начиная с настоящего.",
      "Нет. Каждый отвечает за то, что сделал он, а не за то, что сделали «мы».",
      "Сам вопрос интереснее любого ответа на него."
    ]},
    zh: { p:"对于祖先造成的伤害 —— 也就是我们所属的机构、国家或群体在我们出生前几代所作的恶 —— 我们今天是否有责？", a:[
      "有。我们继承了他们的好处，便也继承了他们的债。",
      "有，在「从此往后该把事情扳正」这个意义上。",
      "没有。每个人对自己所为负责，不对「我们」所为负责。",
      "这个问题，比任何答案都更有意思。"
    ]},
    ja: { p:"先祖が引き起こした害 — 私たちが属する制度・国家・集団が、私たちが生まれる何世代も前に犯した不正 — について、今日の私たちには責任があるか？", a:[
      "ある。利得を受け継いでいる以上、負債も受け継ぐ。",
      "ある。これから先、是正していくべきだ、という意味で。",
      "ない。各人は自分のしたことに責任を負うのであって、「私たち」がしたことではない。",
      "問いそのものが、どんな答えよりも面白い。"
    ]},
    ko: { p:"우리가 속한 제도·국가·집단이 우리가 태어나기 여러 세대 전에 저지른 잘못에 대해, 오늘의 우리에게 책임이 있는가?", a:[
      "있다. 그들의 이익을 물려받았으니, 부채도 함께 물려받는다.",
      "있다. 지금부터 바로잡아 나가야 한다는 의미에서.",
      "없다. 각자는 자기가 한 일에 대해 책임을 지지, \"우리\"가 한 일에 대해서가 아니다.",
      "어떤 답보다 그 질문 자체가 더 흥미롭다."
    ]},
  },
  19: {
    es: { p:"¿Qué es el amor verdadero, sobre todo?", a:[
      "Dos personas eligiéndose, una y otra vez, cada día.",
      "Reconocerte en otra persona — el encuentro de almas.",
      "El trabajo compartido de construir una vida juntos.",
      "Una atención tan completa que disuelve la frontera entre vosotros.",
      "Sobre todo, biología. El resto son los relatos que tejemos alrededor."
    ]},
    fr: { p:"Qu'est-ce que le véritable amour, principalement ?", a:[
      "Deux personnes qui se choisissent encore, chaque jour.",
      "Se reconnaître dans une autre personne — la rencontre d'âmes.",
      "Le travail partagé de bâtir une vie ensemble.",
      "Une attention si complète qu'elle dissout la frontière entre vous.",
      "Surtout de la biologie. Le reste, ce sont les histoires qu'on en raconte."
    ]},
    pt: { p:"O que é o amor de verdade, sobretudo?", a:[
      "Duas pessoas escolhendo uma à outra, todo dia, de novo.",
      "Reconhecer-se em outra pessoa — o encontro de almas.",
      "O trabalho compartilhado de construir uma vida juntos.",
      "Uma atenção tão completa que dissolve a fronteira entre vocês.",
      "Sobretudo biologia. O resto são as histórias que contamos sobre isso."
    ]},
    ru: { p:"Что такое настоящая любовь — прежде всего?", a:[
      "Двое, выбирающие друг друга снова и снова, день за днём.",
      "Узнавание себя в другом — встреча душ.",
      "Совместная работа по созданию общей жизни.",
      "Внимание настолько полное, что растворяет границу между вами.",
      "Главным образом биология. Остальное — истории, которые мы про неё рассказываем."
    ]},
    zh: { p:"真正的爱，最根本是什么？", a:[
      "两个人，每一天，再次选择彼此。",
      "在另一个人身上认出自己 —— 灵魂的相遇。",
      "共同把一段人生建立起来的工作。",
      "一种全然的注意，溶解了你与他之间的边界。",
      "主要是生物学。其余是我们围绕它讲出来的故事。"
    ]},
    ja: { p:"本当の愛とは、まず何か？", a:[
      "二人が、毎日、もう一度互いを選ぶこと。",
      "他者の中に自分を認めること — 魂と魂の出会い。",
      "共に一つの暮らしを築いていく営み。",
      "二人のあいだの境を溶かしてしまうほどの、まるごとの注意。",
      "ほとんどは生物学。あとは、そのまわりに紡がれた物語だ。"
    ]},
    ko: { p:"진짜 사랑은 무엇보다 무엇인가?", a:[
      "두 사람이 매일 다시 서로를 선택하는 것.",
      "다른 사람 속에서 자신을 알아보는 것 — 영혼의 만남.",
      "함께 삶을 짓는 공동의 노동.",
      "두 사람 사이의 경계를 녹일 만큼 완전한 주의.",
      "대부분은 생물학. 나머지는 그것을 둘러싸고 우리가 짜내는 이야기들."
    ]},
  }
};

/** Look up a translated question. Returns undefined when the index has
 *  no entry for the given locale (caller should fall back to the
 *  English source in QUICK_QUESTIONS). */
export function getLocalizedQuickQuestion(
  idx: number,
  locale: SupportedQuizLocale,
): LocalizedQuestion | undefined {
  return QUICK_QUIZ_I18N[idx]?.[locale];
}
