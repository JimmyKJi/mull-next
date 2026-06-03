// Per-exercise translations.
//
// Coverage: name, summary, tradition, duration, reflection, and steps are
// translated into every non-English locale. The longer `about` prose is
// complete for Simplified Chinese (zh) and partial for the other locales; the
// detail page shows a small inline notice on any exercise whose `about` still
// falls back to English.
//
// The EXERCISES_I18N map below is generated and maintained by
// scripts/translate-content.mjs (domain: exercises) within the BEGIN/END
// gen-translate sentinels — do NOT hand-edit between them, as re-running the
// script rewrites the whole region. The types and the localizeExercise()
// helper around the sentinels are hand-maintained. Missing keys fall back to
// the original English value.

import type { Exercise } from './exercises';
import type { Locale } from './translations';

type ExerciseFields = Pick<Exercise, 'name' | 'summary' | 'tradition' | 'duration' | 'about' | 'reflection'> & {
  steps?: string[];
};
type ExerciseI18N = Partial<Record<Locale, Partial<ExerciseFields>>>;

// ─── BEGIN gen-translate EXERCISES_I18N ───
export const EXERCISES_I18N: Record<string, ExerciseI18N> = {
  "premortem": {
    "es": {
      "name": "Premortem",
      "summary": "Imagina con detalle el fracaso de tu plan antes de empezar.",
      "tradition": "Estoica / teoría de la decisión (Gary Klein, después de Séneca)",
      "duration": "10–15 min",
      "reflection": "¿Qué modo de fracaso te resististe más a imaginar? ¿Qué te dice eso sobre dónde eres menos honesto contigo mismo?",
      "steps": [
        "Elige un plan real que estés a punto de comprometerte a seguir. Grande o pequeño — un proyecto, una conversación, una compra.",
        "Imagina que ya pasaron seis meses. El plan fracasó. No catastróficamente, solo claramente.",
        "Escribe 5–10 razones específicas por las que fracasó. Nada de tópicos (\"perdí el foco\") — causas concretas (\"subestimé cuánto tardaría la revisión legal\").",
        "Para cada razón, pregunta: ¿qué podría hacer ahora que reduzca de verdad ese riesgo?",
        "Actualiza el plan con los dos o tres cambios más fuertes. Descarta los demás si costarían más de lo que el riesgo justifica."
      ]
    },
    "fr": {
      "name": "Pré-mortem",
      "summary": "Imagine en détail l'échec de ton plan avant même de commencer.",
      "tradition": "Stoïque / théorie de la décision (Gary Klein, après Sénèque)",
      "duration": "10–15 min",
      "reflection": "Quel mode d'échec as-tu le moins voulu imaginer ? Qu'est-ce que cela te dit sur le point où tu es le moins honnête avec toi-même ?",
      "steps": [
        "Choisis un vrai plan que tu t'apprêtes à valider. Grand ou petit — un projet, une conversation, un achat.",
        "Imagine qu'on est six mois plus tard. Le plan a échoué. Pas catastrophiquement, juste clairement.",
        "Écris 5–10 raisons précises pour lesquelles il a échoué. Pas de banalités (« j'ai perdu le focus ») — des causes concrètes (« j'avais sous-estimé la durée de la revue juridique »).",
        "Pour chaque raison, demande-toi : que pourrais-je faire maintenant pour réduire vraiment ce risque ?",
        "Mets le plan à jour avec les deux ou trois changements les plus forts. Laisse tomber les autres si leur coût dépasse le risque évité."
      ]
    },
    "pt": {
      "name": "Pré-mortem",
      "summary": "Imagine em detalhes o fracasso do seu plano antes de começar.",
      "tradition": "Estoica / teoria da decisão (Gary Klein, depois de Sêneca)",
      "duration": "10–15 min",
      "reflection": "Qual modo de fracasso você mais resistiu a imaginar? O que isso diz sobre onde você é menos honesto consigo mesmo?",
      "steps": [
        "Escolha um plano real que você está prestes a assumir. Grande ou pequeno — um projeto, uma conversa, uma compra.",
        "Imagine que se passaram seis meses. O plano fracassou. Não catastroficamente, mas de forma clara.",
        "Escreva 5–10 razões específicas pelas quais ele fracassou. Sem clichês (\"perdi o foco\") — causas concretas (\"subestimei quanto tempo a revisão legal levaria\").",
        "Para cada razão, pergunte: o que eu poderia fazer agora que reduziria de verdade esse risco?",
        "Atualize o plano com as duas ou três mudanças mais fortes. Descarte as outras se custarem mais do que o risco justifica."
      ]
    },
    "ru": {
      "name": "Премортем",
      "summary": "Заранее, в деталях, представьте провал своего плана.",
      "tradition": "Стоики / теория решений (Гэри Клейн, после Сенеки)",
      "duration": "10–15 мин",
      "reflection": "Какой сценарий провала вы меньше всего хотели представлять? О чём это говорит — о том, где вы с собой наименее честны?",
      "steps": [
        "Возьмите реальный план, на который вы уже готовы пойти. Любого размера — проект, разговор, покупка.",
        "Представьте, что прошло шесть месяцев. План провалился. Не катастрофически, но явно.",
        "Запишите 5–10 конкретных причин, почему он провалился. Никаких общих мест («потерял фокус») — только конкретные причины («недооценил, сколько займёт юридическая проверка»).",
        "По каждой причине спросите: что я могу сделать сейчас, чтобы заметно снизить этот риск?",
        "Внесите в план две-три самые сильные правки. Остальные отбросьте, если они дороже, чем сам риск."
      ]
    },
    "zh": {
      "name": "预先剖析",
      "summary": "在开始之前，先把计划的失败设想得具体而生动。",
      "tradition": "斯多葛 / 决策理论（Gary Klein，承继塞涅卡）",
      "duration": "10–15 分钟",
      "reflection": "哪种失败模式是你最不愿想象的？它揭示了你最不愿对自己诚实的地方在哪里？",
      "steps": [
        "挑一个你真的快要执行的计划。大小不限 —— 一个项目、一次谈话、一笔购买。",
        "设想已经过了六个月。计划失败了。不是一败涂地，但确实很清楚地失败了。",
        "写下 5–10 条它失败的具体原因。不要笼统话（「我没专注」）—— 写具体的（「我低估了法务审查需要多久」）。",
        "对每条原因，问自己：现在能做哪件事，可以实质性地降低这个风险？",
        "把计划用两到三条最关键的修改更新一下。其余如果代价超过风险本身，就放弃。"
      ],
      "about": "预验尸分析是事后验尸的逆向操作。它不是在事情出错之后追问原因，而是先想象失败本身——具体而言，是六个月后的失败——再反向推演导致失败的路径。斯多葛派每天早晨都在做类似的事：设想这一天可能降临的种种灾难，不是为了沉溺其中，而是为了让它们失去突袭的力量。现代决策研究（克莱因、卡尼曼）发现，这种“前瞻性后见之明”能将失败预测的准确率提升约30%。"
    },
    "ja": {
      "name": "プレモーテム",
      "summary": "始める前に、計画の失敗を具体的に想像する。",
      "tradition": "ストア派 / 意思決定論（ゲイリー・クライン、セネカに連なる）",
      "duration": "10〜15分",
      "reflection": "もっとも想像したくなかった失敗のかたちはどれですか？ それは、自分にいちばん正直になれない場所がどこかを教えてくれます。",
      "steps": [
        "これからコミットしようとしている本物の計画を選ぶ。大小は問わない — プロジェクト、会話、買い物。",
        "半年後を想像する。計画は失敗した。壊滅的にではなく、はっきりと。",
        "失敗した具体的な理由を 5〜10 個書く。決まり文句ではなく（「集中が切れた」ではなく）、具体的な原因を（「法務レビューにかかる時間を見積もりすぎていた」）。",
        "理由ごとに問う：今できることのうち、そのリスクを本当に減らせるのは何か？",
        "もっとも効きそうな 2〜3 つで計画を更新する。それ以外は、リスクより手間が大きければ捨てる。"
      ]
    },
    "ko": {
      "name": "프리모템",
      "summary": "시작하기 전에, 계획의 실패를 구체적으로 상상해 본다.",
      "tradition": "스토아 / 의사결정 이론 (Gary Klein, 세네카의 계승)",
      "duration": "10–15분",
      "reflection": "가장 상상하기 싫었던 실패 시나리오는 무엇인가요? 그것은 당신이 자신에게 가장 정직하지 못한 곳을 가리킵니다.",
      "steps": [
        "곧 실행할 진짜 계획을 하나 고른다. 크기는 상관없다 — 프로젝트, 대화, 구매.",
        "6개월이 지났다고 상상한다. 계획은 실패했다. 파국까지는 아니지만 분명히.",
        "실패한 구체적 이유 5~10개를 적는다. 상투구는 안 된다(\"집중을 잃었다\") — 구체적 원인을(\"법률 검토에 걸리는 시간을 과소평가했다\").",
        "이유마다 묻는다: 지금 무엇을 하면 그 위험이 정말로 줄어들까?",
        "가장 효과 있을 두세 가지로 계획을 업데이트한다. 나머지는 위험보다 비용이 크면 버린다."
      ]
    }
  },
  "negative-visualization": {
    "es": {
      "name": "Visualización negativa",
      "summary": "Imagina perder lo que tienes, brevemente y en concreto, para recordar que es un don.",
      "tradition": "Estoica (Marco Aurelio, Epicteto, Séneca)",
      "duration": "5–10 min",
      "reflection": "¿Qué notaste sobre la cosa cuando \"la recuperaste\"? ¿Hay algo que estés dando por sentado?",
      "steps": [
        "Elige algo o alguien presente en tu vida ahora mismo. Específico, no abstracto.",
        "Imagina con viveza que ya no está. No hipotéticamente — concretamente. La silla vacía, el silencio, la rutina ausente.",
        "Quédate con la pérdida durante aproximadamente un minuto. Permítete sentir su peso.",
        "Vuelve al presente. La cosa sigue ahí. Nota que no tenía por qué estarlo.",
        "Opcional: escribe una línea sobre lo que querrías recordar de esa cosa que de otro modo olvidarías."
      ]
    },
    "fr": {
      "name": "Visualisation négative",
      "summary": "Imagine brièvement et concrètement perdre ce que tu as, pour te rappeler que c'est un don.",
      "tradition": "Stoïque (Marc Aurèle, Épictète, Sénèque)",
      "duration": "5–10 min",
      "reflection": "Qu'as-tu remarqué sur la chose une fois \"récupérée\" ? Y a-t-il quelque chose que tu tiens pour acquis ?",
      "steps": [
        "Choisis une chose ou une personne présente dans ta vie maintenant. Quelque chose de précis, pas d'abstrait.",
        "Imagine vivement qu'elle n'est plus là. Pas hypothétiquement — concrètement. La chaise vide, le silence, la routine manquante.",
        "Reste avec la perte pendant environ une minute. Laisse-toi en sentir le poids.",
        "Reviens au présent. La chose est toujours là. Remarque qu'elle n'était pas obligée de l'être.",
        "Facultatif : écris une phrase sur ce que tu voudrais te rappeler d'elle et que tu oublierais sinon."
      ]
    },
    "pt": {
      "name": "Visualização negativa",
      "summary": "Imagine perder o que você tem, brevemente e concretamente, para lembrar que é um presente.",
      "tradition": "Estoica (Marco Aurélio, Epicteto, Sêneca)",
      "duration": "5–10 min",
      "reflection": "O que você notou sobre a coisa quando a \"recuperou\"? Há algo que você tem dado como certo?",
      "steps": [
        "Escolha algo ou alguém presente na sua vida agora. Específico, não abstrato.",
        "Imagine vivamente que isso se foi. Não de forma hipotética — concretamente. A cadeira vazia, o silêncio, a rotina ausente.",
        "Fique com a perda por cerca de um minuto. Deixe-se sentir o peso dela.",
        "Volte ao presente. A coisa ainda está aí. Note que não precisava estar.",
        "Opcional: escreva uma linha sobre o que você gostaria de lembrar dela que de outro modo esqueceria."
      ]
    },
    "ru": {
      "name": "Негативная визуализация",
      "summary": "Кратко и конкретно представьте, что теряете то, что у вас есть, чтобы вспомнить: это подарок.",
      "tradition": "Стоики (Марк Аврелий, Эпиктет, Сенека)",
      "duration": "5–10 мин",
      "reflection": "Что вы заметили в этой вещи, когда \"вернули\" её? Что вы давно перестали замечать?",
      "steps": [
        "Выберите что-то или кого-то, кто сейчас в вашей жизни. Конкретное, не абстрактное.",
        "Живо представьте, что этого больше нет. Не гипотетически — конкретно. Пустой стул, тишина, отсутствующий ритуал.",
        "Побудьте с этой потерей около минуты. Позвольте себе ощутить её вес.",
        "Вернитесь в настоящее. Это всё ещё здесь. Заметьте, что могло бы и не быть.",
        "По желанию: запишите одну строку о том, что вы хотели бы помнить про эту вещь — иначе забудете."
      ]
    },
    "zh": {
      "name": "消极想象",
      "summary": "短暂而具体地想象失去你所拥有的，提醒自己那是一份礼物。",
      "tradition": "斯多葛（马可·奥勒留、爱比克泰德、塞涅卡）",
      "duration": "5–10 分钟",
      "reflection": "当那东西「回来」之后，你注意到了什么？有什么是你早已视为理所当然的？",
      "steps": [
        "挑一件此刻就在你生活里的东西、或一个人。具体的，不要抽象。",
        "生动地想象它已经消失了。不是假设性地 —— 而是具体地。空着的椅子、寂静、不再有的某个习惯。",
        "让这种「失去」停留大约一分钟。允许自己感受它的重量。",
        "现在回到当下。它仍在你身边。注意：它本可以不在的。",
        "可选：写下一句话，记下这件东西里你不愿忘记的部分，否则你会忘。"
      ],
      "about": "斯多葛派称这种练习为premeditatio malorum——预想诸恶。看似悖常的是，他们并非以此培养悲观情绪。他们这样做，是因为人会习以为常。活着的奇迹，一杯咖啡的美好，某人回复你消息的温暖——若不时常想起这一切原本可以不同，它们便会悄然沉入背景，不再被感知。消极观想是一种人为制造的匮乏感。你在心中持守那份失去一分钟，然后放手，而眼前的事物便会在此后数小时里显得更加明亮。"
    },
    "ja": {
      "name": "ネガティブ・ビジュアリゼーション",
      "summary": "今あるものを失うところを短く具体的に想像し、それが贈り物だったと思い出す。",
      "tradition": "ストア派（マルクス・アウレリウス、エピクテトス、セネカ）",
      "duration": "5〜10分",
      "reflection": "「戻ってきた」ものについて、何に気づきましたか？ あたりまえだと感じていたものはありませんか？",
      "steps": [
        "今、自分の生活のなかにあるもの、もしくは人を一つ選ぶ。具体的で、抽象でないこと。",
        "それが失われたところを、ありありと想像する。仮定としてではなく、具体的に。空いた椅子、静けさ、消えた習慣。",
        "失われた感触のなかに、1 分ほどとどまる。その重みを自分に感じさせる。",
        "今に戻る。それはまだそこにある。なくてもおかしくなかったのに、と気づく。",
        "任意：そのもののうち、いつか忘れてしまいそうな大切な点を一行で書いておく。"
      ]
    },
    "ko": {
      "name": "부정적 시각화",
      "summary": "가진 것을 잃는 모습을 잠깐 구체적으로 상상해, 그것이 선물이었음을 떠올린다.",
      "tradition": "스토아 (마르쿠스 아우렐리우스, 에픽테토스, 세네카)",
      "duration": "5–10분",
      "reflection": "그것이 \"돌아왔을 때\" 무엇을 알아챘나요? 너무 당연하게 여기고 있던 것이 있나요?",
      "steps": [
        "지금 자신의 삶 속에 있는 어떤 것, 혹은 어떤 사람을 한 가지 고른다. 구체적으로, 추상이 아니라.",
        "그것이 사라진 모습을 생생히 상상한다. 가설이 아니라 구체적으로. 빈 의자, 적막, 사라진 일상의 한 부분.",
        "잃었다는 감각 속에 1분쯤 머문다. 그 무게를 그대로 느끼도록 둔다.",
        "지금으로 돌아온다. 그것은 여전히 그 자리에 있다. 그러지 않을 수도 있었음을 알아챈다.",
        "선택: 그 대상에 관해 잊지 않고 싶은 한 가지를 한 줄로 적는다."
      ]
    }
  },
  "socratic-self-questioning": {
    "es": {
      "name": "Auto-cuestionamiento socrático",
      "summary": "Toma una creencia que sostienes con fuerza y pásala por cinco \"porqués\".",
      "tradition": "Socrática (los diálogos de Platón)",
      "duration": "15–25 min",
      "reflection": "Si tu creencia se sostuvo, ¿puedes describir con más precisión qué la hace verdadera? Si no, ¿cuál es la nueva forma de la creencia que realmente sostienes?",
      "steps": [
        "Elige una creencia que sostienes con fuerza. Política, ética, personal — algo donde defenderías tu posición si te la cuestionaran.",
        "Anótala en una sola frase. Sé preciso.",
        "Pregunta: ¿por qué creo esto? Escribe una respuesta de una frase.",
        "Hazle la misma pregunta a esa respuesta. Y a esa. Cinco veces en total.",
        "En la quinta respuesta, mira la primera. ¿Es tu fundamento lo que pensabas?"
      ]
    },
    "fr": {
      "name": "Auto-questionnement socratique",
      "summary": "Prends une conviction forte et fais-la passer par cinq \"pourquoi\".",
      "tradition": "Socratique (les dialogues de Platon)",
      "duration": "15–25 min",
      "reflection": "Si ta conviction a tenu, peux-tu décrire plus précisément ce qui la rend vraie ? Sinon, quelle est la nouvelle forme de la conviction que tu tiens vraiment ?",
      "steps": [
        "Choisis une conviction que tu tiens fortement. Politique, éthique, personnelle — quelque chose que tu défendrais si on te poussait.",
        "Écris-la en une seule phrase. Sois précis.",
        "Demande : pourquoi je crois cela ? Réponds en une phrase.",
        "Pose la même question à cette réponse. Puis à celle-là. Cinq fois en tout.",
        "À la cinquième réponse, regarde la première. Le fondement est-il celui que tu pensais ?"
      ]
    },
    "pt": {
      "name": "Autoquestionamento socrático",
      "summary": "Pegue uma crença que você sustenta com força e passe por cinco \"porquês\".",
      "tradition": "Socrática (os diálogos de Platão)",
      "duration": "15–25 min",
      "reflection": "Se sua crença se manteve, você consegue descrever com mais precisão o que a torna verdadeira? Se não, qual é a nova forma da crença que você realmente sustenta?",
      "steps": [
        "Escolha uma crença que você sustenta com força. Política, ética, pessoal — algo que defenderia se fosse pressionado.",
        "Escreva-a em uma única frase. Seja preciso.",
        "Pergunte: por que eu acredito nisso? Escreva uma resposta de uma frase.",
        "Faça a mesma pergunta a essa resposta. E à seguinte. Cinco vezes no total.",
        "Na quinta resposta, olhe para a primeira. Sua fundação é o que você pensava que era?"
      ]
    },
    "ru": {
      "name": "Сократический самовопрос",
      "summary": "Возьмите свою сильную убеждённость и проведите её через пять «почему».",
      "tradition": "Сократическая (диалоги Платона)",
      "duration": "15–25 мин",
      "reflection": "Если ваша вера выстояла — можете ли вы точнее описать, что именно делает её истинной? Если нет — какова новая форма того, во что вы действительно верите?",
      "steps": [
        "Выберите убеждение, которое вы держите крепко. Политическое, этическое, личное — что-то, что стали бы защищать.",
        "Запишите его одной фразой. Точно.",
        "Спросите: почему я в это верю? Ответьте одной фразой.",
        "Тот же вопрос — к этому ответу. И к следующему. Пять раз в сумме.",
        "На пятом ответе посмотрите на первый. Это ли тот фундамент, который вы себе представляли?"
      ]
    },
    "zh": {
      "name": "苏格拉底式自我质询",
      "summary": "挑一个你坚定持有的信念，对它连问五次「为什么」。",
      "tradition": "苏格拉底式（柏拉图对话录）",
      "duration": "15–25 分钟",
      "reflection": "如果你的信念经得起追问，你能更精确地说出它为何为真吗？如果经不起，你真正持有的，是怎样新的形态？",
      "steps": [
        "挑一个你强烈持有的信念。政治、伦理、个人 —— 任何一处你被挑战时会回击的。",
        "用一句话把它写下来。要精确。",
        "问：我为什么相信这个？写一句话作答。",
        "对那个回答再问同样的问题。再对下一个。一共五次。",
        "第五个回答之后，回头看第一句。你的根基，是你以为的那个吗？"
      ],
      "about": "苏格拉底的方法不是讲授，而是追问，尤其针对那些自以为已经明白的人。目的不在于令人难堪，而在于揭示我们所说的信念与我们真正能够捍卫的东西之间的裂隙。将这种方法用于自身，会带来一种有益的不适。大多数坚定的信念，经过三四个“为什么”之后便会松动瓦解。那些经得住追问的，才是值得认真对待的。"
    },
    "ja": {
      "name": "ソクラテス的自問",
      "summary": "強く信じている考えを一つ取り、「なぜ」を 5 回かけてみる。",
      "tradition": "ソクラテス的（プラトンの対話篇）",
      "duration": "15〜25分",
      "reflection": "信念が持ちこたえたなら、それを真にしているものを以前より正確に言えますか？ 持ちこたえなかったなら、あなたが実際に抱いている信念の新しい形は何ですか？",
      "steps": [
        "強く信じている考えを一つ選ぶ。政治、倫理、個人的なこと — 反論されたら押し返したくなるようなもの。",
        "一文で書き出す。正確に。",
        "問う：なぜ自分はこれを信じているのか？ 一文で答える。",
        "その答えに同じ問いを向ける。次の答えにも。合わせて五回。",
        "五つめの答えのところで、最初の文を見返す。あなたの土台は、思っていた通りのものですか？"
      ]
    },
    "ko": {
      "name": "소크라테스적 자문",
      "summary": "강하게 믿는 한 가지 생각을 골라, 다섯 번 \"왜\"를 던진다.",
      "tradition": "소크라테스적 (플라톤의 대화편)",
      "duration": "15–25분",
      "reflection": "믿음이 견디어 냈다면, 그것을 참되게 만드는 것이 무엇인지 더 정확히 말할 수 있나요? 견디지 못했다면, 당신이 실제로 가진 믿음의 새로운 형태는 무엇인가요?",
      "steps": [
        "강하게 가진 믿음을 하나 고른다. 정치, 윤리, 개인적인 것 — 반박당하면 맞받아치게 될 만한 것.",
        "한 문장으로 적는다. 정확하게.",
        "묻는다: 나는 왜 이것을 믿는가? 한 문장으로 답한다.",
        "그 답에 같은 질문을 던진다. 다음 답에도. 모두 다섯 번.",
        "다섯 번째 답을 본 뒤, 첫 문장을 다시 본다. 당신의 토대는 당신이 생각했던 그것인가요?"
      ]
    }
  },
  "view-from-above": {
    "es": {
      "name": "Vista desde lo alto",
      "summary": "Aleja mentalmente la cámara — tu ciudad, tu país, el planeta — y mira tu día desde allí.",
      "tradition": "Estoica (Marco Aurelio)",
      "duration": "5 min",
      "reflection": "¿Qué se ve diferente ahora? ¿Qué siguió siendo tan urgente como pensabas?",
      "steps": [
        "Quédate con lo que te tiene preocupado. Sostenlo en mente con claridad.",
        "Ahora imagina que asciendes despacio. La habitación. El edificio. Tu barrio, tu ciudad, tu país, la curvatura de la tierra.",
        "Desde esa altura, mira hacia abajo. Identifica a la versión de ti que está preocupada por esto. Obsérvala.",
        "Pregunta: desde aquí arriba, ¿qué tan grande se ve el problema? ¿Es del tamaño que pensabas?",
        "Baja despacio. Nota cualquier cosa que se haya movido durante el regreso."
      ]
    },
    "fr": {
      "name": "Vue d'en haut",
      "summary": "Recule mentalement — ta ville, ton pays, la planète — puis regarde ta journée depuis là-haut.",
      "tradition": "Stoïque (Marc Aurèle)",
      "duration": "5 min",
      "reflection": "Qu'est-ce qui paraît différent maintenant ? Qu'est-ce qui est resté aussi urgent qu'avant ?",
      "steps": [
        "Reste avec ce qui te préoccupe. Tiens-le clairement en tête.",
        "Maintenant imagine que tu t'élèves lentement. La pièce. Le bâtiment. Ton quartier, ta ville, ton pays, la courbe de la terre.",
        "Depuis là-haut, regarde en bas. Repère la version de toi inquiète de ce sujet. Observe-la.",
        "Demande : d'ici, quelle taille a le problème ? Est-ce la taille que tu pensais ?",
        "Redescends lentement. Remarque ce qui a bougé pendant le retour."
      ]
    },
    "pt": {
      "name": "Vista do alto",
      "summary": "Mentalmente, afaste o ponto de vista — sua cidade, seu país, o planeta — e olhe seu dia de lá.",
      "tradition": "Estoica (Marco Aurélio)",
      "duration": "5 min",
      "reflection": "O que parece diferente agora? O que continuou tão urgente quanto antes?",
      "steps": [
        "Fique com aquilo que te preocupa. Mantenha-o claramente em mente.",
        "Agora imagine que você sobe devagar. O cômodo. O prédio. Seu bairro, sua cidade, seu país, a curvatura da terra.",
        "Daquela altura, olhe para baixo. Identifique a versão sua preocupada com isso. Observe-a.",
        "Pergunte: daqui de cima, qual o tamanho do problema? É o tamanho que você imaginava?",
        "Desça devagar. Note qualquer coisa que tenha mudado no caminho de volta."
      ]
    },
    "ru": {
      "name": "Взгляд сверху",
      "summary": "Мысленно отдалитесь — ваш город, ваша страна, планета — и посмотрите на свой день с этой высоты.",
      "tradition": "Стоики (Марк Аврелий)",
      "duration": "5 мин",
      "reflection": "Что выглядит иначе теперь? А что осталось ровно таким же срочным?",
      "steps": [
        "Останьтесь с тем, что вас тревожит. Удержите это в уме отчётливо.",
        "Теперь представьте, что медленно поднимаетесь вверх. Комната. Здание. Ваш район, ваш город, ваша страна, изгиб земли.",
        "С этой высоты посмотрите вниз. Увидьте ту версию себя, что переживает. Наблюдайте за ней.",
        "Спросите: отсюда, насколько велика проблема? Тот ли это размер, что вы думали?",
        "Медленно вернитесь. Заметьте, что сдвинулось на обратном пути."
      ]
    },
    "zh": {
      "name": "高处俯瞰",
      "summary": "在脑海里向后拉远 —— 你的城市、你的国家、整个星球 —— 然后回头看今天。",
      "tradition": "斯多葛（马可·奥勒留）",
      "duration": "5 分钟",
      "reflection": "现在看起来有什么不同？又有什么依然和原来一样紧迫？",
      "steps": [
        "把现在让你焦虑的事，清楚地放在心里。",
        "想象自己缓慢升起。房间。楼宇。社区、城市、国家、地球弧线。",
        "从那高处往下看。找出那个正为此焦虑的「你」。观察他。",
        "问：从这里看，问题有多大？还是你以为的大小吗？",
        "慢慢回到地上。留意回来途中有什么松动了。"
      ],
      "about": "马可·奥勒留在《沉思录》中反复做这件事：想象自己升腾而起，从宇宙的高度俯瞰人间万象，再回到当下。这样做的意义不在于贬低自己的困境，而在于将它们置于更宏大的框架之中，从而看得更清楚。在眼前像一堵墙的东西，当你能够看见整张地图时，往往只是其中一处细小的标注。"
    },
    "ja": {
      "name": "高みからの眺め",
      "summary": "心のなかで視点を引いていく — 街、国、地球 — そこから自分の一日を見下ろす。",
      "tradition": "ストア派（マルクス・アウレリウス）",
      "duration": "5分",
      "reflection": "今、何が違って見えますか？ そして何が、まったく同じだけ切迫したまま残りましたか？",
      "steps": [
        "今気がかりなことをはっきり心に置いておく。",
        "ゆっくり上昇していく自分を想像する。部屋。建物。地域、街、国、地球の弧。",
        "その高さから見下ろす。これに悩んでいる自分を見つける。眺める。",
        "問う：ここから見て、問題はどれほどの大きさか？ 思っていた大きさと同じか？",
        "ゆっくり降りていく。降りる途中で何が動いたかに気づく。"
      ]
    },
    "ko": {
      "name": "높은 곳에서 본 풍경",
      "summary": "머릿속으로 시야를 끌어올린다 — 도시, 나라, 지구 — 그 위에서 오늘을 내려다본다.",
      "tradition": "스토아 (마르쿠스 아우렐리우스)",
      "duration": "5분",
      "reflection": "지금 무엇이 달리 보이나요? 그리고 무엇이 여전히 똑같이 절박하게 남아 있나요?",
      "steps": [
        "지금 마음을 차지하고 있는 것을 또렷하게 그대로 둔다.",
        "천천히 위로 올라가는 자신을 상상한다. 방. 건물. 동네, 도시, 나라, 지구의 곡선.",
        "그 높이에서 아래를 본다. 이 일로 걱정하는 자신의 모습을 찾는다. 바라본다.",
        "묻는다: 이 위에서 보면, 그 문제는 얼마나 큰가? 생각했던 그 크기인가?",
        "다시 천천히 내려온다. 내려오는 동안 무엇이 달라졌는지 알아챈다."
      ]
    }
  },
  "examen": {
    "es": {
      "name": "El Examen",
      "summary": "Revisión ignaciana de cinco pasos al final del día — qué se te dio, qué se te pasó, qué llevarás a mañana.",
      "tradition": "Ignaciana (jesuita, también funciona en clave laica)",
      "duration": "10–15 min",
      "reflection": "¿Hay patrones a lo largo de varios días de Examen? ¿Qué sugieren sobre lo que realmente te importa — frente a lo que dices que te importa?",
      "steps": [
        "Date cuenta de dónde estás. Una respiración. Asentarte.",
        "Gratitud: ¿qué te llegó hoy que no te era debido? Nómbralo concretamente. Tres cosas si puedes.",
        "Repasa el día en escenas. Camínalo desde el despertar hasta ahora. ¿Dónde te sentiste vivo? ¿Dónde, vacío? No analices — solo nota.",
        "¿Dónde te quedaste corto de quien quieres ser? Sin reproches. Solo nota la distancia entre la intención y el acto.",
        "Mira hacia mañana. ¿Qué única cosa querrías traer con otra atención? Sostenlo con suavidad."
      ]
    },
    "fr": {
      "name": "L'Examen",
      "summary": "Revue ignacienne en cinq étapes à la fin de la journée — ce qui t'a été donné, ce que tu as manqué, ce que tu emportes vers demain.",
      "tradition": "Ignacienne (jésuite, mais marche en version laïque)",
      "duration": "10–15 min",
      "reflection": "Y a-t-il des motifs récurrents sur plusieurs jours d'Examen ? Que disent-ils de ce qui te tient à cœur — par rapport à ce que tu prétends ?",
      "steps": [
        "Prends conscience d'où tu es. Une respiration. Tu te poses.",
        "Gratitude : qu'as-tu reçu aujourd'hui qui ne t'était pas dû ? Nomme-le concrètement. Trois choses si tu peux.",
        "Repasse la journée en scènes. Marche de ton réveil à maintenant. Où t'es-tu senti vivant ? Où vide ? N'analyse pas — remarque.",
        "Où as-tu été en deçà de qui tu veux être ? Sans te flageller. Juste remarquer l'écart entre l'intention et l'acte.",
        "Tourne-toi vers demain. Quelle est la seule chose à laquelle tu voudrais porter une attention différente ? Tiens-la avec douceur."
      ]
    },
    "pt": {
      "name": "O Exame",
      "summary": "Revisão inaciana de cinco passos no fim do dia — o que foi dado, o que escapou, o que você leva para amanhã.",
      "tradition": "Inaciana (jesuíta, também funciona em chave secular)",
      "duration": "10–15 min",
      "reflection": "Há padrões em vários dias de Exame? O que eles sugerem sobre o que você realmente se importa — em contraste com o que você diz se importar?",
      "steps": [
        "Perceba onde você está. Uma respiração. Aterre.",
        "Gratidão: o que chegou hoje sem que lhe fosse devido? Nomeie concretamente. Três coisas se conseguir.",
        "Reveja o dia em cenas. Caminhe do despertar até agora. Onde se sentiu vivo? Onde, oco? Não analise — apenas note.",
        "Onde você ficou aquém de quem quer ser? Sem se castigar. Só perceba a distância entre intenção e ato.",
        "Olhe para amanhã. Que única coisa você gostaria de carregar com outra atenção? Segure-a com leveza."
      ]
    },
    "ru": {
      "name": "Examen",
      "summary": "Игнатианский пятишаговый обзор дня — что дано, что упущено, что взять в завтра.",
      "tradition": "Игнатианская (иезуитская, работает и в светском прочтении)",
      "duration": "10–15 мин",
      "reflection": "Есть ли повторяющиеся узоры в нескольких днях практики? Что они говорят о том, что вам действительно важно — в отличие от того, что вы об этом говорите?",
      "steps": [
        "Заметьте, где вы. Один вдох. Усядьтесь.",
        "Благодарность: что пришло сегодня, чего вам не задолжали? Назовите конкретно. Три вещи, если получится.",
        "Пройдите день сценами — от пробуждения до сейчас. Где было живо? Где пусто? Не анализируйте — просто замечайте.",
        "Где вы недотянули до того, кем хотите быть? Без самобичевания. Просто заметьте разрыв между намерением и поступком.",
        "Посмотрите в завтра. Какая одна вещь должна получить другое внимание? Удержите её мягко."
      ]
    },
    "zh": {
      "name": "日省（Examen）",
      "summary": "依纳爵传统的五步晚省 —— 今日所得、今日所失、明日所携。",
      "tradition": "依纳爵（耶稣会传统，世俗化版本同样可用）",
      "duration": "10–15 分钟",
      "reflection": "若你做了多日的日省，是否能看出贯穿其间的某种模式？它们暗示你真正在意的是什么 —— 与你声称在意的相比呢？",
      "steps": [
        "先觉察自己此刻的所在。一次呼吸。落定。",
        "感恩：今天有什么是降临到你身上、本不属于你的？具体地说出。能列三件最好。",
        "把今天像场景一样重走一遍 —— 从醒来到此刻。哪里感到活着？哪里空？别去分析 —— 只是看见。",
        "哪些地方你没活成你想成为的样子？不必苛责自己。只是看见意图与行为之间的差距。",
        "看向明天。你最想用另一种注意去承接的，是哪一件事？轻轻地把它握住。"
      ],
      "about": "依纳爵·罗耀拉要求他的耶稣会士每天做两次这项操练。它延续了五百年，即便剥去神学外衣，也依然凭自身之效力而成立。省察是一种结构化的觉察。它不是日记，而是一份五步清单——你在脑海中或以寥寥数语完成：感恩、觉察、回应、悔改所需，以及为明日所祈。"
    },
    "ja": {
      "name": "エクザメン",
      "summary": "イグナチオ式の 5 ステップで一日を振り返る — 与えられたもの、見落としたもの、明日へ持ち越すもの。",
      "tradition": "イグナチオ（イエズス会、世俗的に読み替えても機能する）",
      "duration": "10〜15分",
      "reflection": "何日か続けてみて、共通するパターンが見えますか？ 自分が口で語る「大切なもの」と、実際の振る舞いの差を、それは何と教えてくれますか？",
      "steps": [
        "今いる場所に気づく。ひと息。落ち着く。",
        "感謝：今日、当然ではないのに与えられたものは？ 具体的に名指す。できれば三つ。",
        "一日を場面のかたちで歩き直す。起きてから今まで。どこで生きていた？ どこで虚ろだった？ 分析せず、ただ気づく。",
        "なりたい自分にどこで届かなかったか。責めない。意図と行為の隔たりを見るだけ。",
        "明日を見る。違う注意を向けたいたった一つは何？ 軽く手のなかに置く。"
      ]
    },
    "ko": {
      "name": "엑사멘",
      "summary": "하루 끝에 하는 이냐시오식 5단계 점검 — 받은 것, 놓친 것, 내일로 가져갈 것.",
      "tradition": "이냐시오 (예수회, 세속적 형태로도 작동)",
      "duration": "10–15분",
      "reflection": "여러 날 이어가다 보면 어떤 패턴이 보이나요? 그것은 당신이 말로 표현하는 \"중요한 것\"과 실제 모습의 격차를 어떻게 보여주나요?",
      "steps": [
        "지금 있는 자리를 알아차린다. 한 호흡. 자리 잡는다.",
        "감사: 오늘 빚지지 않았는데 다가온 것은 무엇인가? 구체적으로 이름 짓는다. 가능하면 세 가지.",
        "하루를 장면처럼 다시 걸어 본다. 깨어남에서 지금까지. 어디서 살아 있었는가? 어디서 비어 있었는가? 분석하지 말고, 그냥 알아챈다.",
        "되고 싶은 자기 자신에 못 미친 곳은 어디였는가? 자책하지 말고, 의도와 행동 사이의 거리를 보기만 한다.",
        "내일을 본다. 다른 주의를 두고 싶은 단 한 가지는 무엇인가? 가볍게 손에 둔다."
      ]
    }
  },
  "memento-mori": {
    "es": {
      "name": "Memento mori",
      "summary": "Una confrontación breve y deliberada con la mortalidad. Aclara.",
      "tradition": "Estoica, budista, monástica cristiana",
      "duration": "5–10 min",
      "reflection": "¿Qué cosa pequeña cambiarías en el plan de mañana si tomaras en serio la respuesta de hoy?",
      "steps": [
        "Busca un lugar tranquilo. Pon un temporizador de 5 minutos.",
        "Cierra los ojos. Reconoce con sencillez que un día morirás. Nadie está exento.",
        "Imagina — sin melodrama — tu último día. ¿A quién querrías cerca? ¿Qué querrías estar haciendo?",
        "Ahora piensa en el día de hoy. ¿Qué distancia hay entre cómo lo pasaste y cómo pasarías ese último día?",
        "Cuando suene el temporizador, abre los ojos. No intentes hacer nada con la respuesta de inmediato. Solo nótala."
      ]
    },
    "fr": {
      "name": "Memento mori",
      "summary": "Une confrontation brève et délibérée avec la mortalité. Cela éclaircit.",
      "tradition": "Stoïque, bouddhiste, monastique chrétienne",
      "duration": "5–10 min",
      "reflection": "Quelle petite chose changerais-tu dans le plan de demain si tu prenais ta réponse d'aujourd'hui au sérieux ?",
      "steps": [
        "Trouve un endroit calme. Mets un minuteur de 5 minutes.",
        "Ferme les yeux. Reconnais simplement qu'un jour tu mourras. Personne n'est exempté.",
        "Imagine — sans mélodrame — ton dernier jour. Qui voudrais-tu près de toi ? Que voudrais-tu être en train de faire ?",
        "Pense maintenant à aujourd'hui. Quel écart entre la façon dont tu l'as passé et la façon dont tu passerais ce dernier jour ?",
        "Quand le minuteur sonne, ouvre les yeux. N'essaie pas tout de suite de faire quelque chose de la réponse. Juste, remarque-la."
      ]
    },
    "pt": {
      "name": "Memento mori",
      "summary": "Um confronto breve e deliberado com a mortalidade. Esclarece.",
      "tradition": "Estoica, budista, monástica cristã",
      "duration": "5–10 min",
      "reflection": "Que pequena coisa você mudaria no plano de amanhã se levasse a resposta de hoje a sério?",
      "steps": [
        "Encontre um lugar tranquilo. Programe um timer de 5 minutos.",
        "Feche os olhos. Reconheça simplesmente que um dia você vai morrer. Ninguém está isento.",
        "Imagine — sem melodrama — seu último dia. Quem você gostaria que estivesse por perto? O que você gostaria de estar fazendo?",
        "Agora pense em hoje. Qual a distância entre como você passou hoje e como passaria esse último dia?",
        "Quando o timer tocar, abra os olhos. Não tente fazer nada com a resposta de imediato. Só perceba."
      ]
    },
    "ru": {
      "name": "Memento mori",
      "summary": "Короткое, намеренное столкновение со смертностью. Прояснение.",
      "tradition": "Стоики, буддизм, христианское монашество",
      "duration": "5–10 мин",
      "reflection": "Что одно маленькое в плане завтрашнего дня вы бы изменили, если бы всерьёз отнеслись к сегодняшнему ответу?",
      "steps": [
        "Найдите тихое место. Поставьте таймер на 5 минут.",
        "Закройте глаза. Прямо признайте: однажды вы умрёте. Никто не освобождён.",
        "Представьте — без надрыва — свой последний день. Кого вы хотели бы видеть рядом? Чем вы хотели бы быть заняты?",
        "Теперь подумайте о сегодняшнем дне. Каков разрыв между тем, как вы провели его, и тем, как провели бы тот последний?",
        "Когда таймер прозвенит, откройте глаза. Не пытайтесь сразу что-то сделать с ответом. Просто заметьте его."
      ]
    },
    "zh": {
      "name": "勿忘人皆有死",
      "summary": "一次短暂、刻意的与死亡相对。它能让人看清。",
      "tradition": "斯多葛、佛教、基督宗教修道传统",
      "duration": "5–10 分钟",
      "reflection": "若你认真对待今天的回答，明天的安排里有哪一件小事会变？",
      "steps": [
        "找一个安静的地方。把闹钟设为 5 分钟。",
        "闭上眼。坦然地承认：你终有一天会死。无人例外。",
        "想象 —— 不要戏剧化 —— 你的最后一天。你希望谁在身边？你希望自己在做什么？",
        "再回到今天。你今天度过的方式，与那「最后一天」之间，差了多远？",
        "闹钟响时，睁眼。不要急着用答案做什么。只是看见它。"
      ],
      "about": "几乎每一种沉思传统都有某种形式的这项修习。斯多葛派随身携带小小的提醒之物；佛教僧侣在尸身旁打坐冥想；中世纪基督教修会将头骨置于案头。其用意不在于使人沉溺于阴郁，而在于澄明。当我们短暂地记起自己是过客，我们便会做出不同的选择。不是出于绝望，而是出于自洽：我们不再将时光耗费在那些——以永恒之眼光观之——我们其实并不在乎的事情上。"
    },
    "ja": {
      "name": "メメント・モリ",
      "summary": "死と短く意識的に向き合う実践。ものごとがすっきりする。",
      "tradition": "ストア派、仏教、キリスト教修道院",
      "duration": "5〜10分",
      "reflection": "今日の答えを真に受けるとしたら、明日の予定で変えたい小さなことは何ですか？",
      "steps": [
        "静かな場所を見つける。5 分のタイマーをセット。",
        "目を閉じる。いつか自分は死ぬ、と素朴に認める。例外はない。",
        "誇張せず、自分の最後の日を想像する。誰がそばにいてほしい？ 何をしていたい？",
        "今度は今日を考える。今日の過ごし方と、その最後の日の過ごし方は、どれだけ離れている？",
        "タイマーが鳴ったら目を開ける。すぐに答えで何かをしようとしない。ただ気づくだけ。"
      ]
    },
    "ko": {
      "name": "메멘토 모리",
      "summary": "죽음과 짧고 의도적으로 마주하는 시간. 시야가 정리됩니다.",
      "tradition": "스토아, 불교, 그리스도교 수도원",
      "duration": "5–10분",
      "reflection": "오늘의 답을 진지하게 받아들인다면, 내일 계획에서 바꿀 작은 한 가지는 무엇인가요?",
      "steps": [
        "조용한 곳을 찾는다. 타이머를 5분으로 맞춘다.",
        "눈을 감는다. 언젠가는 죽는다는 사실을 담담히 인정한다. 예외는 없다.",
        "과장 없이 마지막 하루를 상상한다. 누가 곁에 있길 바라는가? 무엇을 하고 있길 바라는가?",
        "이제 오늘을 본다. 오늘을 보낸 방식과, 그 마지막 하루를 보낼 방식 사이의 거리는?",
        "타이머가 울리면 눈을 뜬다. 답으로 곧장 무언가 하려 하지 않는다. 그저 알아채기만 한다."
      ]
    }
  },
  "fallacy-hunt": {
    "es": {
      "name": "Caza de falacias",
      "summary": "Toma un argumento real del mundo y encuentra tres errores de razonamiento en él.",
      "tradition": "Pensamiento crítico (de la taxonomía aristotélica en adelante)",
      "duration": "15–25 min",
      "reflection": "¿Te costó más encontrar falacias en el lado con el que estabas de acuerdo? ¿Qué dice eso sobre cómo lees en un día normal?",
      "steps": [
        "Encuentra un texto retórico. De 500 a 1500 palabras. Mejor si viene de fuera de tu burbuja — es más fácil ver falacias que no te halagan.",
        "Léelo una vez para captar la idea. ¿A qué conclusión quiere el autor que llegues?",
        "Léelo otra vez, cazando. Marca tres frases donde el autor pasa de premisa a conclusión sin que la premisa apoye realmente el salto.",
        "Para cada una, escribe una línea sobre qué falla. Opcional: ponle nombre a la falacia (ad hominem, falsa dicotomía, motte-and-bailey). No te preocupes por acertar el nombre — describe el movimiento.",
        "Ahora invierte: toma un texto con el que ESTÉS de acuerdo. Encuentra ahí también tres falacias. (Esta es la mitad más difícil del ejercicio.)"
      ]
    },
    "fr": {
      "name": "Chasse aux sophismes",
      "summary": "Prends un argument réel et repère trois erreurs de raisonnement.",
      "tradition": "Pensée critique (depuis la taxonomie aristotélicienne)",
      "duration": "15–25 min",
      "reflection": "A-t-il été nettement plus difficile de trouver des sophismes du côté avec lequel tu étais d'accord ? Que dit cela de la façon dont tu lis au quotidien ?",
      "steps": [
        "Trouve un texte rhétorique. 500 à 1500 mots. Mieux si ça vient hors de ta bulle — plus facile de voir des sophismes qui ne te flattent pas.",
        "Lis-le une fois pour le sens. À quelle conclusion l'auteur veut-il te mener ?",
        "Relis en chassant. Marque trois phrases où l'auteur passe de prémisse à conclusion sans que la prémisse soutienne vraiment le saut.",
        "Pour chacune, écris une ligne sur ce qui cloche. Optionnel : nomme le sophisme (ad hominem, fausse dichotomie, motte-and-bailey). Pas grave de te tromper de nom — décris le mouvement.",
        "Maintenant inverse : prends un texte avec lequel tu es d'accord. Trouves-y aussi trois sophismes. (C'est la moitié la plus difficile.)"
      ]
    },
    "pt": {
      "name": "Caça às falácias",
      "summary": "Pegue um argumento real e encontre três erros de raciocínio nele.",
      "tradition": "Pensamento crítico (da taxonomia aristotélica em diante)",
      "duration": "15–25 min",
      "reflection": "Foi mensuravelmente mais difícil achar falácias no lado com o qual você concordava? O que isso sugere sobre como você lê em um dia normal?",
      "steps": [
        "Encontre um texto retórico. 500 a 1500 palavras. Melhor se for de fora da sua bolha — falácias que não te bajulam ficam mais visíveis.",
        "Leia uma vez para o sentido geral. Que conclusão o autor quer que você adote?",
        "Releia caçando. Marque três frases onde o autor pula de premissa para conclusão sem que a premissa realmente sustente o salto.",
        "Para cada uma, escreva uma linha sobre o que está errado. Opcional: dê nome à falácia (ad hominem, falsa dicotomia, motte-and-bailey). Não se preocupe em acertar o nome — descreva o movimento.",
        "Inverta: pegue um texto com o qual você CONCORDA. Encontre três falácias ali também. (Essa é a metade mais difícil.)"
      ]
    },
    "ru": {
      "name": "Охота на ошибки",
      "summary": "Возьмите реальный текст и найдите в нём три ошибки рассуждения.",
      "tradition": "Критическое мышление (от аристотелевской таксономии и далее)",
      "duration": "15–25 мин",
      "reflection": "Заметно труднее было находить ошибки на стороне, с которой вы согласны? Что это говорит о том, как вы читаете в обычный день?",
      "steps": [
        "Найдите риторический текст. 500–1500 слов. Лучше за пределами вашего пузыря — ошибки, которые вам не льстят, заметнее.",
        "Прочтите один раз для смысла. К какому выводу автор хочет вас привести?",
        "Перечитайте, охотясь. Отметьте три места, где автор переходит от посылки к выводу без реальной поддержки.",
        "Для каждой — строкой опишите, что не так. По желанию: назовите ошибку (ad hominem, ложная дихотомия, motte-and-bailey). Не страшно, если имя неточное — опишите ход.",
        "Теперь обратное: возьмите текст, с которым ВЫ СОГЛАСНЫ. Найдите три ошибки и там. (Это сложнее.)"
      ]
    },
    "zh": {
      "name": "捉谬误",
      "summary": "挑一段真实世界的论证，从中找出三处推理失误。",
      "tradition": "批判性思维（自亚里士多德谬误分类以来）",
      "duration": "15–25 分钟",
      "reflection": "在你赞同的那一方找谬误，是不是明显更难？这透露了你日常阅读时的什么习惯？",
      "steps": [
        "找一段真实的修辞文字。500–1500 字。最好出自你不熟悉的那一边 —— 不顺你心的谬误更容易被看见。",
        "读一遍把握大意。作者想把你引到什么结论？",
        "再读一遍，开始捕猎。标出三处作者从前提滑向结论、但前提其实并未支撑那一跳的句子。",
        "为每一处写一行：哪里错了。可选：给它命名（人身攻击、假二分法、motte-and-bailey）。不一定要叫对名字 —— 把动作描述出来即可。",
        "反过来再做：挑一段你「赞同」的文字。在里面也找三个谬误。（这是这练习更难的一半。）"
      ],
      "about": "日常论辩中，几乎处处可见谬误。这项能力的关键不在于背熟谬误的名称，而在于学会感知某个论证步骤的不妥之处，进而辨认出是哪种惯常的扭曲在发生。选一段真实的论述——一篇社论、一条推文串、一位政客的演讲、一段推销话术——仔细阅读，找出三处推理本身（而非仅仅是结论）出了问题的地方。"
    },
    "ja": {
      "name": "誤謬さがし",
      "summary": "現実の議論を一つ拾い、推論のミスを 3 つ見つける。",
      "tradition": "批判的思考（アリストテレス以来の誤謬分類学）",
      "duration": "15〜25分",
      "reflection": "同意している側の誤謬を探すほうが、はっきり難しかったですか？ 普段の読み方について、それは何を示していますか？",
      "steps": [
        "実際の文章を一つ選ぶ。500〜1500 語。バブルの外から取ると、自分におもねらない誤謬が見やすい。",
        "ひと通り読み、要旨を掴む。著者はどの結論に導きたいのか。",
        "もう一度、狩りをしながら読む。前提から結論に飛んでいるが、前提が支えていない箇所を 3 つマークする。",
        "各箇所について、何が変かを一行で書く。任意で誤謬の名前を当てる（人身攻撃、偽の二分法、motte-and-bailey）。名前は外してもよい — 動きを記述する。",
        "次は逆向き：「同意する」テキストを取り、そこにも 3 つの誤謬を見つける。（こちらが本番。）"
      ]
    },
    "ko": {
      "name": "오류 사냥",
      "summary": "실제 세계의 논증을 하나 골라, 추론의 오류 세 가지를 찾아낸다.",
      "tradition": "비판적 사고 (아리스토텔레스적 오류 분류 이래)",
      "duration": "15–25분",
      "reflection": "동의하는 쪽에서 오류를 찾는 게 눈에 띄게 더 어려웠나요? 그것은 평소 당신의 읽기 방식에 대해 무엇을 말해 주나요?",
      "steps": [
        "실제 글을 하나 고른다. 500~1500자. 자기 진영 바깥의 글이 좋다 — 자신을 추켜세우지 않는 오류가 더 잘 보인다.",
        "한 번 훑어 핵심을 잡는다. 글쓴이는 어떤 결론으로 데려가려 하나?",
        "다시 한 번, 사냥하듯 읽는다. 전제에서 결론으로 건너뛰지만 전제가 그 도약을 떠받치지 못하는 문장 셋을 표시한다.",
        "각각에 대해 한 줄로 무엇이 잘못됐는지 적는다. 선택: 오류의 이름을 붙여 본다 (인신공격, 거짓 이분법, motte-and-bailey). 이름이 어긋나도 좋다 — 동작을 기술하면 된다.",
        "반대로도 한다: 자신이 \"동의하는\" 글에서도 오류 세 개를 찾는다. (이 쪽이 더 어려운 반쪽이다.)"
      ]
    }
  },
  "steelmanning": {
    "es": {
      "name": "Steelmanning del opuesto",
      "summary": "Escribe la versión más fuerte posible del punto de vista que más rechazas.",
      "tradition": "Filosofía analítica (Daniel Dennett, tras el principio de caridad)",
      "duration": "20–40 min",
      "reflection": "¿Algo, al escribir el steelman, desplazó tu confianza en tu propia posición — aunque sea levemente? ¿De dónde vino la resistencia cuando lo hizo?",
      "steps": [
        "Elige una posición que rechazas — política, ética, religiosa, metodológica. Que te irrite de verdad.",
        "Imagina a la persona más reflexiva que sostiene esa posición. ¿Qué experiencia de vida la habría llevado allí?",
        "Escribe 250 palabras defendiendo la posición en primera persona, como si fuera tuya. Usa los argumentos y la evidencia más fuertes, no los embarazosos.",
        "¿Hay alguna parte del steelman que, si eres honesto, encuentras más convincente de lo que reconocerías?",
        "Opcional: envíaselo a alguien que sostenga esa posición de verdad. Pregúntale si lo captaste bien."
      ]
    },
    "fr": {
      "name": "Steelman de l'opposé",
      "summary": "Écris la version la plus forte possible de la position que tu rejettes le plus.",
      "tradition": "Philosophie analytique (Daniel Dennett, après le principe de charité)",
      "duration": "20–40 min",
      "reflection": "L'écriture du steelman a-t-elle, même un peu, déplacé ta confiance dans ta propre position ? D'où venait la résistance quand c'est arrivé ?",
      "steps": [
        "Choisis une position que tu rejettes — politique, éthique, religieuse, méthodologique. Quelque chose qui t'agace vraiment.",
        "Imagine la personne la plus réfléchie qui défend cette position. Quel parcours l'aurait menée là ?",
        "Écris 250 mots qui défendent cette position à la première personne, comme si tu y croyais. Prends les meilleurs arguments et preuves, pas les caricaturaux.",
        "Y a-t-il une partie du steelman que, en étant honnête, tu trouves plus convaincante que tu n'oses l'admettre ?",
        "Optionnel : envoie-le à quelqu'un qui défend vraiment cette position. Demande-lui si tu as bien rendu."
      ]
    },
    "pt": {
      "name": "Steelmanning do oposto",
      "summary": "Escreva a versão mais forte possível da visão que você mais rejeita.",
      "tradition": "Filosofia analítica (Daniel Dennett, após o princípio da caridade)",
      "duration": "20–40 min",
      "reflection": "Algo no ato de escrever o steelman deslocou, mesmo que um pouco, sua confiança na própria posição? De onde veio a resistência quando isso aconteceu?",
      "steps": [
        "Escolha uma posição que você rejeita — política, ética, religiosa, metodológica. Que realmente te irrite.",
        "Imagine a pessoa mais cuidadosa que sustenta essa posição. Que experiência de vida a teria levado até lá?",
        "Escreva 250 palavras defendendo a posição na primeira pessoa, como se fosse sua. Use os argumentos e provas mais fortes, não os caricatos.",
        "Há alguma parte do steelman que, se for honesto, você acha mais convincente do que admitiria antes?",
        "Opcional: envie a alguém que realmente sustente essa posição. Pergunte se você acertou."
      ]
    },
    "ru": {
      "name": "Стилмэн противоположного",
      "summary": "Напишите максимально сильную версию взгляда, который вы больше всего отвергаете.",
      "tradition": "Аналитическая философия (Дэниел Деннет, после принципа доброжелательности)",
      "duration": "20–40 мин",
      "reflection": "Сдвинуло ли написание стилмэна вашу уверенность в собственной позиции — пусть на чуть-чуть? Откуда тогда взялось сопротивление?",
      "steps": [
        "Выберите взгляд, который вы отвергаете — политический, этический, религиозный, методологический. Который вас по-настоящему раздражает.",
        "Вообразите самого вдумчивого человека, кто его держит. Какой жизненный путь привёл бы туда?",
        "Напишите 250 слов в защиту этой позиции от первого лица, как если бы это были вы. Самые сильные аргументы и доводы, а не позорные.",
        "Есть ли в стилмэне что-то, что — если честно — вам кажется убедительнее, чем вы признаётесь?",
        "По желанию: отправьте человеку, который реально это защищает. Спросите, попали ли вы в суть."
      ]
    },
    "zh": {
      "name": "为对立方写最强版",
      "summary": "写出你最反感的那种立场所能拥有的最强论证。",
      "tradition": "分析哲学（丹尼尔·丹尼特，承「宽容原则」）",
      "duration": "20–40 分钟",
      "reflection": "写完最强版后，你对自己原本立场的信心，有没有哪怕一点点的位移？如果有抗拒，它从哪里来？",
      "steps": [
        "挑一个你拒斥的立场 —— 政治、伦理、宗教、方法论皆可。要选真的让你心烦的那种。",
        "想象最深思熟虑的、持这立场的人。怎样的人生经历会把人带到那里？",
        "用第一人称写 250 字为它辩护，仿佛那就是你的立场。采用最强的论据与证据，不是漏洞百出的版本。",
        "诚实地问：在这「最强版」里，是否有某一处比你愿意承认的更有说服力？",
        "可选：把它发给真持这立场的人，问问你是否传达准确。"
      ],
      "about": "稻草人是对手观点的故意弱化版本，容易被击倒。钢铁人则恰恰相反：它是那一观点最有力的表述，一如该立场最睿智的捍卫者所能呈现的那样。锻造钢铁人的训练，是智识生活中最接近体能测试的东西。如果你写不出一个连对手都会认为公允的钢铁人，你其实并未真正理解他们的立场——你不过是在与自己凭空捏造的幻影争辩。"
    },
    "ja": {
      "name": "反対側のスティールマン",
      "summary": "もっとも受け入れがたい立場の、可能な限り強い形を自分で書いてみる。",
      "tradition": "分析哲学（ダニエル・デネット、「善意の原則」のあと）",
      "duration": "20〜40分",
      "reflection": "スティールマンを書く中で、自分の立場への自信がほんの少しでも揺らいだことはありますか？ 抵抗があったとしたら、それはどこから来たものでしたか？",
      "steps": [
        "自分が退ける立場を一つ選ぶ — 政治、倫理、宗教、方法論。本当に苛立つもの。",
        "その立場を持つ最も思慮深い人を想像する。どんな人生経験がそこへ導くだろう。",
        "一人称で 250 語、自分の立場かのように擁護する。最強の論拠と証拠を使い、惨めな版ではなく。",
        "正直に問う：書いたスティールマンの中に、認めたくない以上に説得力を持つ部分はあるか？",
        "任意：その立場を実際に持つ人に送り、合っているか尋ねる。"
      ]
    },
    "ko": {
      "name": "반대편을 가장 강하게",
      "summary": "가장 거부감이 드는 입장을, 그것이 가질 수 있는 가장 강한 형태로 직접 써본다.",
      "tradition": "분석 철학 (다니엘 데닛, 자비의 원리 이후)",
      "duration": "20–40분",
      "reflection": "스틸맨을 쓰는 동안, 자신의 입장에 대한 확신이 아주 조금이라도 움직였나요? 저항이 일었다면, 그것은 어디서 온 건가요?",
      "steps": [
        "자신이 거부하는 입장을 하나 고른다 — 정치, 윤리, 종교, 방법론. 실제로 짜증나게 하는 것으로.",
        "그 입장을 가진 가장 사려 깊은 사람을 상상한다. 어떤 삶의 경로가 그를 거기로 데려갔을까?",
        "1인칭으로 250자가량, 그 입장을 자신의 것처럼 옹호한다. 가장 강한 논거와 증거를 쓰되, 우스꽝스러운 버전은 피한다.",
        "정직하게 묻는다: 쓴 스틸맨에서, 인정하기 싫지만 더 설득력 있게 다가오는 부분이 있는가?",
        "선택: 그 입장을 실제로 가진 사람에게 보내 본다. 제대로 잡았는지 묻는다."
      ]
    }
  },
  "counterexample-drill": {
    "es": {
      "name": "Ejercicio de contraejemplo",
      "summary": "Intenta romper una regla moral con un caso concreto único.",
      "tradition": "Ética analítica (la tradición del problema del tranvía)",
      "duration": "15–20 min",
      "reflection": "Tras tres rondas de ataque y revisión, ¿qué forma tiene la regla? ¿Sigue siendo una guía útil, o se ha convertido en una salvedad?",
      "steps": [
        "Enuncia una regla moral en la que de verdad crees. Una sola frase. («Está mal mentir.» «Hay que ayudar a desconocidos en apuros si te cuesta poco.»)",
        "Imagina tres casos concretos donde seguirla llevaría a un mal claro, O romperla llevaría a un bien claro.",
        "Toma el caso que más muerde. ¿Podrías morder la bala y decir: sí, incluso aquí, sigo la regla?",
        "Si sí — ¿de qué depende realmente la regla? Has hallado el principio más profundo.",
        "Si no — reescribe la regla con la excepción o matiz correctos. Y atáca la nueva regla del mismo modo."
      ]
    },
    "fr": {
      "name": "Exercice du contre-exemple",
      "summary": "Essaie de briser une règle morale avec un seul cas concret.",
      "tradition": "Éthique analytique (la tradition du dilemme du tramway)",
      "duration": "15–20 min",
      "reflection": "Après trois cycles d'attaque-révision, à quoi ressemble la règle ? Reste-t-elle un guide utile, ou est-elle devenue une simple précaution ?",
      "steps": [
        "Formule une règle morale à laquelle tu crois vraiment. Une phrase claire. (« Mentir est mal. » « Il faut aider un inconnu en difficulté si ça te coûte peu. »)",
        "Imagine trois cas concrets où la suivre mènerait à un mal manifeste, OU où l'enfreindre mènerait à un bien manifeste.",
        "Prends le cas qui mord le plus. Pourrais-tu mordre la balle et dire : oui, même là, je tiens la règle ?",
        "Si oui — de quoi dépend vraiment la règle ? Tu as trouvé le principe plus profond.",
        "Si non — réécris la règle avec la bonne exception ou nuance. Puis attaque la nouvelle règle de la même manière."
      ]
    },
    "pt": {
      "name": "Treino de contraexemplo",
      "summary": "Tente quebrar uma regra moral com um único caso concreto.",
      "tradition": "Ética analítica (a tradição do problema do bonde)",
      "duration": "15–20 min",
      "reflection": "Após três rodadas de ataque e revisão, como a regra ficou? Ela ainda é um guia útil, ou virou uma ressalva?",
      "steps": [
        "Enuncie uma regra moral em que você de fato acredita. Uma só frase. (\"É errado mentir.\" \"Você deve ajudar estranhos em apuros se te custa pouco.\")",
        "Imagine três casos concretos em que segui-la levaria a um mal claro, OU quebrá-la levaria a um bem claro.",
        "Pegue o caso que morde mais forte. Você consegue morder a bala e dizer: sim, mesmo aqui, sigo a regra?",
        "Se sim — do que a regra realmente depende? Você achou o princípio mais profundo.",
        "Se não — reescreva a regra com a exceção ou ressalva certa. Depois ataque a nova regra do mesmo modo."
      ]
    },
    "ru": {
      "name": "Тренинг контрпримеров",
      "summary": "Попробуйте сломать моральное правило одним конкретным случаем.",
      "tradition": "Аналитическая этика (традиция «вагонетки»)",
      "duration": "15–20 мин",
      "reflection": "После трёх кругов «атака — правка» — на что похоже правило? Остаётся ли оно полезным ориентиром или превратилось в оговорку?",
      "steps": [
        "Сформулируйте моральное правило, в которое вы действительно верите. Одна чистая фраза. («Лгать — плохо.» «Помогать чужому в беде, если это вам почти ничего не стоит.»)",
        "Представьте три конкретных случая, где следование ему привело бы к явному злу, ИЛИ нарушение — к явному благу.",
        "Возьмите самый кусачий. Готовы ли вы прикусить пулю и сказать: да, даже здесь, я держусь правила?",
        "Если да — от чего правило на самом деле зависит? Вы нашли более глубокий принцип.",
        "Если нет — перепишите правило с правильным исключением или оговоркой. Затем атакуйте новую формулировку так же."
      ]
    },
    "zh": {
      "name": "反例操练",
      "summary": "试着用一个具体的案例去打破一条道德规则。",
      "tradition": "分析伦理学（电车难题传统）",
      "duration": "15–20 分钟",
      "reflection": "经过三轮攻击与修订之后，这条规则现在是什么样？它仍然是有用的指南，还是已经变成一种自我保护？",
      "steps": [
        "说出一条你真心相信的道德规则。用一句清楚的话。（「说谎不对。」「如果代价不大，就该帮助陌生人。」）",
        "想出三个具体的案例：要么遵守它会带来明显的恶，要么打破它会带来明显的善。",
        "挑出最尖刻的那个。你能不能咬下子弹，说：是的，即便在这里，我仍守住这条规则？",
        "若能 —— 规则真正依赖的是什么？那便是更深的原则。",
        "若不能 —— 加上正确的例外或限定，把规则改写。然后再以同样方式攻击新规则。"
      ],
      "about": "道德规则——“永远不要撒谎”、“始终使福祉最大化”、“不可杀人”——说来容易，辩护起来却极为困难。分析哲学的惯常做法，是提出一个足够尖锐的反例，迫使规则的持有者要么修正它，要么放弃它。本练习让你同时扮演两个角色：先提出一条规则，再向它发起攻击。"
    },
    "ja": {
      "name": "反例ドリル",
      "summary": "たったひとつの具体例で、道徳的なルールを壊しにいく。",
      "tradition": "分析倫理学（トロッコ問題の系譜）",
      "duration": "15〜20分",
      "reflection": "攻撃と修正を 3 巡したあと、ルールはどんな形になっていますか？ なお有用な指針ですか、それとも逃げ道になっていますか？",
      "steps": [
        "本当に信じている道徳的ルールを一文で書く。（「嘘はいけない」「困っている他人を、自分の負担が小さいなら助けるべきだ」など。）",
        "それを守ると明らかな悪が生じる、または破ると明らかな善が生じる、具体的なケースを 3 つ思い描く。",
        "一番噛みつくケースを選ぶ。「弾を噛む」覚悟で、ここでもルールを守ると言えるか？",
        "言える場合 — ルールが本当に依拠している原理は何か？ それがより深い原則。",
        "言えない場合 — 正しい例外・但し書きをつけて書き直す。新しいルールを同じやり方で攻撃する。"
      ]
    },
    "ko": {
      "name": "반례 훈련",
      "summary": "구체적인 한 사례로 도덕 규칙을 깨뜨려 본다.",
      "tradition": "분석 윤리 (트롤리 문제 전통)",
      "duration": "15–20분",
      "reflection": "세 번의 공격–수정 끝에 규칙은 어떤 모습이 되었나요? 여전히 유용한 지침인가요, 아니면 자기 변호로 변했나요?",
      "steps": [
        "진심으로 믿는 도덕 규칙을 한 문장으로 적는다. (\"거짓말은 잘못이다.\" \"큰 비용이 들지 않는다면 어려움에 빠진 낯선 이를 도와야 한다.\")",
        "그 규칙을 따르면 명백히 나쁜 결과가 나오거나, 어기면 명백히 좋은 결과가 나오는 구체 사례 셋을 떠올린다.",
        "가장 따끔한 사례를 고른다. \"총알을 깨물고\" 그래도 규칙을 지킨다고 말할 수 있는가?",
        "말할 수 있다면 — 그 규칙은 실제로 무엇에 기대고 있는가? 그것이 더 깊은 원리.",
        "말할 수 없다면 — 적절한 예외나 단서를 붙여 다시 쓴다. 새 규칙도 같은 방식으로 공격한다."
      ]
    }
  },
  "argument-map": {
    "es": {
      "name": "Mapa de argumentos",
      "summary": "Dibuja la estructura de un argumento como cajas y flechas. Verás sus muros de carga.",
      "tradition": "Lógica informal, pedagogía del pensamiento crítico",
      "duration": "20–30 min",
      "reflection": "¿La premisa de carga era la que el autor más defendió, o una que pasó rápido?",
      "steps": [
        "Encuentra un argumento: un párrafo, un fragmento de ensayo, una opinión. ~300–800 palabras.",
        "Identifica la conclusión. Escríbela en una caja al pie de la página.",
        "Identifica las premisas que la sustentan directamente. Cajas arriba, flechas hacia abajo.",
        "Para cada premisa, pregunta: ¿qué sustenta a ÉSTA? Añade otra fila de cajas si hace falta. Para cuando llegues a afirmaciones que aceptarías sin apoyo.",
        "Mira el mapa. ¿Qué premisa, atacada, derrumbaría más estructura? Ese es el muro de carga."
      ]
    },
    "fr": {
      "name": "Carte d'arguments",
      "summary": "Dessine la structure d'un argument en boîtes et flèches. Tu verras ses murs porteurs.",
      "tradition": "Logique informelle, pédagogie de la pensée critique",
      "duration": "20–30 min",
      "reflection": "La prémisse porteuse était-elle celle que l'auteur a le plus défendue, ou celle qu'il a glissée vite ?",
      "steps": [
        "Trouve un argument : un paragraphe, un extrait, une tribune. ~300–800 mots.",
        "Identifie la conclusion. Écris-la dans une boîte en bas de la page.",
        "Identifie les prémisses qui la soutiennent directement. Boîtes au-dessus, flèches vers le bas.",
        "Pour chaque prémisse, demande : qu'est-ce qui la soutient ELLE ? Ajoute une autre rangée si nécessaire. Arrête quand tu atteins des affirmations que tu accepterais sans preuve.",
        "Regarde la carte. Quelle prémisse, attaquée, ferait s'effondrer le plus de structure ? C'est le mur porteur."
      ]
    },
    "pt": {
      "name": "Mapa do argumento",
      "summary": "Desenhe a estrutura de um argumento como caixas e setas. Você verá as paredes de sustentação.",
      "tradition": "Lógica informal, pedagogia do pensamento crítico",
      "duration": "20–30 min",
      "reflection": "A premissa central era a que o autor mais defendeu, ou uma que ele passou rápido?",
      "steps": [
        "Ache um argumento: um parágrafo, um trecho, uma coluna. ~300–800 palavras.",
        "Identifique a conclusão. Escreva-a numa caixa no pé da página.",
        "Identifique as premissas que a sustentam diretamente. Caixas acima, setas para baixo.",
        "Para cada premissa, pergunte: o que sustenta ESTA? Acrescente outra linha de caixas se preciso. Pare quando chegar a afirmações que você aceitaria sem suporte.",
        "Olhe o mapa. Qual premissa, atacada, derrubaria mais da estrutura? Essa é a parede de sustentação."
      ]
    },
    "ru": {
      "name": "Карта аргумента",
      "summary": "Нарисуйте структуру аргумента как коробки и стрелки. Несущие стены станут видны.",
      "tradition": "Неформальная логика, педагогика критического мышления",
      "duration": "20–30 мин",
      "reflection": "Главная посылка — это та, которую автор защищал больше всего, или та, мимо которой быстро проскочил?",
      "steps": [
        "Найдите аргумент: абзац, фрагмент эссе, колонка. ~300–800 слов.",
        "Найдите вывод. Запишите его в коробку внизу страницы.",
        "Найдите посылки, которые его прямо подпирают. Коробки выше, стрелки вниз.",
        "По каждой посылке спросите: что подпирает ЕЁ? Добавьте ещё ряд коробок, если надо. Остановитесь, когда дойдёте до утверждений, которые вы примете без поддержки.",
        "Посмотрите на карту. Какая посылка, если её снести, обрушит больше всего? Это и есть несущая стена."
      ]
    },
    "zh": {
      "name": "论证图",
      "summary": "把一个论证的结构画成方框与箭头。它的承重墙会显现。",
      "tradition": "非形式逻辑、批判性思维教学",
      "duration": "20–30 分钟",
      "reflection": "那个承重的前提，是作者花最多笔墨辩护的那个，还是被他匆匆带过的那个？",
      "steps": [
        "找一段论证：一段、一节、或一篇短评。300–800 字左右。",
        "找出结论，把它写在页面底部的方框里。",
        "找出直接支撑结论的前提。方框在上，箭头向下。",
        "对每个前提再问：是什么支撑「它」？需要时再画一行。直到你遇到无须支撑也愿意接受的命题。",
        "看整张图。哪一个前提一旦被攻破，会塌下最多结构？那就是承重墙。"
      ],
      "about": "大多数论证以散文形式呈现——长句之间隐含着推进的步骤。论证图将这些步骤显现出来：每个前提是一个节点，每个推论是一条箭头。最终的结果像一张电路图。它最大的价值在于，迫使你辨别哪些前提真正在承担工作，哪些不过是装饰。你不需要任何软件，纸笔即可。这项技能同样适用于自己的论证——一旦你能为他人的论证绘图，便会在写作时心中已有图形。"
    },
    "ja": {
      "name": "議論マップ",
      "summary": "議論の構造を箱と矢印で描く。耐力壁が見えてくる。",
      "tradition": "インフォーマル論理、批判的思考の教育",
      "duration": "20〜30分",
      "reflection": "耐力壁の前提は、著者が最も丁寧に擁護したものでしたか？ それともさらりと通り過ぎたものでしたか？",
      "steps": [
        "議論を一つ見つける：段落、エッセイの一節、論説。300〜800 語ほど。",
        "結論を特定する。ページ下部の箱に書く。",
        "結論を直接支える前提を特定する。上に箱、下向きに矢印。",
        "前提ごとに問う：「これ自体」を支えているものは？ 必要なら段を追加する。支えなしに受け入れる主張に達したら止める。",
        "マップ全体を見る。攻撃すれば最も多くの構造が崩れる前提はどれか？ それが耐力壁。"
      ]
    },
    "ko": {
      "name": "논증 지도",
      "summary": "논증의 구조를 상자와 화살표로 그려 본다. 그 안의 내력벽이 드러난다.",
      "tradition": "비형식 논리, 비판적 사고 교육",
      "duration": "20–30분",
      "reflection": "내력 전제는 저자가 가장 공들여 옹호한 것이었나요, 아니면 빠르게 지나간 것이었나요?",
      "steps": [
        "논증을 하나 찾는다: 문단, 에세이의 한 부분, 칼럼. 300~800 단어쯤.",
        "결론을 찾는다. 페이지 아래의 상자에 적는다.",
        "결론을 직접 떠받치는 전제들을 찾는다. 위에 상자, 아래로 화살표.",
        "각 전제에 다시 묻는다: \"이것\" 자체를 떠받치는 것은? 필요하면 한 층을 더 그린다. 더는 뒷받침 없이 받아들일 만한 주장이 나오면 멈춘다.",
        "지도를 본다. 어느 전제를 무너뜨리면 가장 많은 구조가 함께 무너지는가? 그것이 내력벽이다."
      ]
    }
  },
  "reductio": {
    "es": {
      "name": "Reductio ad absurdum",
      "summary": "Toma una afirmación en serio, llévala a su límite lógico, y mira si aún la crees.",
      "tradition": "Griega (Zenón, Platón), pervive en toda la filosofía analítica",
      "duration": "15–25 min",
      "reflection": "¿En qué punto de la cadena de consecuencias quisiste agregar una salvedad? Ese es el lugar a investigar después.",
      "steps": [
        "Elige una afirmación con la que tengas sentimientos encontrados, o una muy difundida que sospechas que es floja.",
        "Asume que es verdadera, plenamente y sin excepciones.",
        "Pregunta: ¿qué más tendría que ser cierto si esto lo fuera? Anota tres o cuatro implicaciones. Llévalas a sus consecuencias concretas.",
        "Mira esas implicaciones. ¿Alguna es claramente absurda, monstruosa o simplemente bochornosa?",
        "Si sí, la afirmación necesita revisión — descubre dónde el paso al absurdo. Si no, la has tomado más en serio que la mayoría de sus defensores y has ganado más confianza en ella."
      ]
    },
    "fr": {
      "name": "Reductio ad absurdum",
      "summary": "Prends une thèse au sérieux, pousse-la jusqu'à sa limite logique, et regarde si tu y crois encore.",
      "tradition": "Grecque (Zénon, Platon), traverse toute la philosophie analytique",
      "duration": "15–25 min",
      "reflection": "À quel maillon de la chaîne as-tu eu le plus envie d'ajouter un bémol ? C'est l'endroit à creuser ensuite.",
      "steps": [
        "Choisis une thèse à ton sujet ambivalent, ou très répandue et que tu soupçonnes molle.",
        "Suppose-la vraie, pleinement et sans exceptions.",
        "Demande : qu'est-ce qui devrait aussi être vrai dans ce cas ? Note trois ou quatre implications. Pousse-les à leurs conséquences concrètes.",
        "Regarde ces implications. Y en a-t-il qui soient clairement absurdes, monstrueuses ou simplement gênantes ?",
        "Si oui, la thèse a besoin d'une révision — repère où le passage à l'absurde s'est fait. Sinon, tu l'as prise plus au sérieux que la plupart de ses défenseurs, et tu y crois davantage."
      ]
    },
    "pt": {
      "name": "Reductio ad absurdum",
      "summary": "Leve uma afirmação a sério, empurre-a até o limite lógico e veja se ainda acredita nela.",
      "tradition": "Grega (Zenão, Platão), atravessando toda a filosofia analítica",
      "duration": "15–25 min",
      "reflection": "Em que elo da cadeia de consequências você mais quis recuar e adicionar uma ressalva? Esse é o lugar a investigar a seguir.",
      "steps": [
        "Escolha uma afirmação sobre a qual você tem sentimentos mistos, ou uma muito difundida que suspeita ser frágil.",
        "Assuma que é verdadeira, plenamente e sem exceções.",
        "Pergunte: o que mais teria de ser verdade se isto fosse? Anote três ou quatro implicações. Empurre-as até consequências concretas.",
        "Olhe essas implicações. Alguma é claramente absurda, monstruosa ou simplesmente embaraçosa?",
        "Se sim, a afirmação precisa de revisão — descubra onde aconteceu o salto para o absurdo. Se não, você a levou mais a sério que a maioria dos defensores, e ganhou mais confiança nela."
      ]
    },
    "ru": {
      "name": "Reductio ad absurdum",
      "summary": "Возьмите утверждение всерьёз, доведите до логического предела — и посмотрите, верите ли вы в него ещё.",
      "tradition": "Греческая (Зенон, Платон), пронизывает всю аналитическую философию",
      "duration": "15–25 мин",
      "reflection": "В какой точке цепочки вы больше всего хотели вставить оговорку? Это место и стоит исследовать дальше.",
      "steps": [
        "Выберите утверждение, к которому у вас неоднозначные чувства, либо широко распространённое, в чьей строгости вы сомневаетесь.",
        "Примите его за истину — полностью, без исключений.",
        "Спросите: что ещё должно быть истиной, если это так? Запишите три-четыре следствия. Доведите их до конкретного.",
        "Посмотрите на следствия. Есть ли среди них откровенно абсурдные, чудовищные или просто неловкие?",
        "Если да — утверждение надо пересматривать; найдите, где случился переход к абсурду. Если нет — вы взяли его серьёзнее большинства его защитников и получили больше доверия к нему."
      ]
    },
    "zh": {
      "name": "归谬法",
      "summary": "认真接受一个主张，把它推到逻辑的尽头，看你是否还信。",
      "tradition": "希腊（芝诺、柏拉图），贯穿整个分析哲学",
      "duration": "15–25 分钟",
      "reflection": "在推导链的哪一环，你最想退一步、加一句但书？那一处，就是下一步要深入查看的地方。",
      "steps": [
        "挑一个你对它感受复杂的主张，或一个广为流传、但你怀疑其松散的主张。",
        "假设它为真 —— 完整地、无例外地。",
        "问：若它为真，还有什么也必须为真？写下三四条蕴含，把它们推到具体的后果。",
        "看那些蕴含。其中有没有明显荒谬、可怕或单纯尴尬的？",
        "若有，这主张需要修正 —— 找出推向荒谬的那一步。若无，你比它的多数支持者更认真地待它，对它的信心也理当更高。"
      ],
      "about": "归谬法是哲学中最古老的论证方式之一：假设某一立场为真，毫不回避地推演其后果，然后审视这个结果是否可以接受。若不可接受，则原来的立场在某处出了问题。这一方法的力量在于，它不要求你正面驳斥那个立场——你只需比它的持有者更认真地对待它。"
    },
    "ja": {
      "name": "帰謬法",
      "summary": "ある主張を真に受け、論理的な極限まで進めてみて、まだ信じられるかを確かめる。",
      "tradition": "ギリシャ（ゼノン、プラトン）、分析哲学全体に通底",
      "duration": "15〜25分",
      "reflection": "結論への鎖のどの段階で、あなたは「ただし」を一番加えたくなりましたか？ そこが次に掘り下げる場所です。",
      "steps": [
        "自分が複雑な感情を抱える主張、または広く受け入れられているが脆そうだと感じる主張を一つ選ぶ。",
        "それを真と仮定する。完全に、例外なく。",
        "問う：それが真なら、ほかに何が真でなければならない？ 含意を 3〜4 つ書き出す。具体的な帰結まで押し進める。",
        "それらの含意を見る。明らかに不条理、過酷、または単に気まずいものはあるか？",
        "あれば、主張は修正が必要 — 不条理に転じた箇所を見つける。なければ、あなたは多くの支持者よりも真剣にそれを取り、より高い自信を得たことになる。"
      ]
    },
    "ko": {
      "name": "귀류법",
      "summary": "주장을 진지하게 받아들여 논리적 끝까지 밀어붙이고, 여전히 믿을 수 있는지 본다.",
      "tradition": "그리스 (제논, 플라톤), 분석철학 전반에 살아 있음",
      "duration": "15–25분",
      "reflection": "결과의 사슬 어느 지점에서 가장 \"그러나\"를 끼워넣고 싶었나요? 거기가 다음으로 들여다볼 곳입니다.",
      "steps": [
        "자신이 복잡한 감정을 가진 주장, 또는 널리 받아들여지지만 허술해 보이는 주장을 하나 고른다.",
        "그것이 참이라고 가정한다. 완전히, 예외 없이.",
        "묻는다: 그것이 참이라면 또 무엇이 참이어야 하는가? 함의 셋 또는 넷을 적는다. 구체적 결과까지 밀어붙인다.",
        "그 함의들을 본다. 명백히 부조리하거나, 잔혹하거나, 그저 민망한 것이 있는가?",
        "있다면 주장은 수정이 필요하다 — 부조리로 넘어간 지점을 찾는다. 없다면, 당신은 다수의 지지자보다 더 진지하게 그것을 다룬 셈이고, 그것에 대한 자신감을 더 가질 만하다."
      ]
    }
  },
  "sixty-second-case": {
    "es": {
      "name": "El caso de 60 segundos",
      "summary": "Comprime tu argumento hasta que basten 60 segundos.",
      "tradition": "Retórica (como un pitch de ascensor, pero más lento)",
      "duration": "15–25 min",
      "reflection": "¿Lo que más recortaste era lo que más te importa personalmente — o lo que en realidad era más débil?",
      "steps": [
        "Elige una posición que de verdad sostienes. Algo donde un amigo reflexivo discreparía.",
        "Escribe la versión de 5 minutos. Estíratela — cada matiz, cada ejemplo, cada objeción y respuesta.",
        "Comprime a 2 minutos. Recorta primero lo más débil. Conserva lo que carga peso.",
        "Comprime a 60 segundos. Léelo en voz alta y cronométrate. Si te pasas, recorta más.",
        "Compara la versión de 60 segundos con la de 5 minutos. ¿Qué cortaste que de verdad defenderías si te lo preguntaran?"
      ]
    },
    "fr": {
      "name": "L'argument en 60 secondes",
      "summary": "Compresse ton argument jusqu'à ce que 60 secondes suffisent.",
      "tradition": "Rhétorique (le pitch d'ascenseur, version ralentie)",
      "duration": "15–25 min",
      "reflection": "Ce que tu as le plus coupé, était-ce ce qui te tient vraiment à cœur — ou ce qui était en fait le plus fragile ?",
      "steps": [
        "Choisis une position que tu tiens vraiment. Quelque chose dont un ami sérieux serait en désaccord.",
        "Écris la version de 5 minutes. Étire-la — chaque nuance, chaque exemple, chaque objection et réponse.",
        "Compresse à 2 minutes. Coupe d'abord le plus faible. Garde ce qui porte.",
        "Compresse à 60 secondes. Lis à voix haute et chronomètre-toi. Si tu dépasses, coupe encore.",
        "Compare la version 60 secondes à celle de 5 minutes. Qu'as-tu coupé que tu défendrais vraiment si on te poussait ?"
      ]
    },
    "pt": {
      "name": "O caso em 60 segundos",
      "summary": "Comprima seu argumento até 60 segundos serem suficientes.",
      "tradition": "Retórica (o pitch de elevador, em ritmo mais lento)",
      "duration": "15–25 min",
      "reflection": "O que você mais cortou era o que mais te importa pessoalmente — ou o que de fato era mais fraco?",
      "steps": [
        "Escolha uma posição que você realmente sustenta. Algo em que um amigo reflexivo discordaria.",
        "Escreva a versão de 5 minutos. Estique — cada nuance, cada exemplo, cada objeção-e-resposta.",
        "Comprima para 2 minutos. Corte primeiro o mais fraco. Mantenha o que carrega peso.",
        "Comprima para 60 segundos. Leia em voz alta e cronometre. Se passar, corte mais.",
        "Compare a versão de 60 segundos com a de 5 minutos. O que você cortou que de fato defenderia se questionado?"
      ]
    },
    "ru": {
      "name": "Кейс на 60 секунд",
      "summary": "Сожмите аргумент так, чтобы 60 секунд хватило.",
      "tradition": "Риторика (вроде «лифтового питча», но в замедлении)",
      "duration": "15–25 мин",
      "reflection": "То, что вы вырезали больше всего — это самое важное лично для вас, или то, что на самом деле было слабее всего?",
      "steps": [
        "Выберите позицию, которой вы действительно держитесь. Такую, с которой вдумчивый друг не согласился бы.",
        "Напишите 5-минутную версию. Растяните — каждый нюанс, каждый пример, каждое возражение-и-ответ.",
        "Сожмите до 2 минут. Сначала режьте слабое. Оставьте то, что несёт вес.",
        "Сожмите до 60 секунд. Прочитайте вслух с таймером. Не уложились — режьте ещё.",
        "Сравните 60-секундную и 5-минутную версии. Что вы вырезали, что на самом деле стали бы защищать, если спросить?"
      ]
    },
    "zh": {
      "name": "60 秒陈词",
      "summary": "把你的论点压缩到 60 秒讲得完为止。",
      "tradition": "修辞学（像「电梯陈述」，但更慢）",
      "duration": "15–25 分钟",
      "reflection": "你砍得最多的那部分，是你最在意的，还是其实最薄弱的？",
      "steps": [
        "挑一个你真实持有的立场。要选一位审慎的朋友会反对的那种。",
        "写一份 5 分钟的版本。把它撑开 —— 每一个细节、每一个例子、每一句反驳与回应。",
        "压缩到 2 分钟。先砍最弱的部分，保留承担重量的部分。",
        "压缩到 60 秒。出声读，给自己计时。超出就再砍。",
        "把 60 秒版与 5 分钟版并读。你砍掉的当中，有哪些其实还想为之辩护？"
      ],
      "about": "如果你无法在60秒内陈述自己的论点，很可能你自己还没弄清楚论点究竟是什么。压缩迫使你找出承重的前提、最简洁的例证与结论，并舍弃一切并未实际发挥作用的内容。这个练习令人不安——大多数论证都将自身的软弱藏匿于篇幅之中。"
    },
    "ja": {
      "name": "60 秒の主張",
      "summary": "60 秒で語り切れるところまで、自分の論を圧縮する。",
      "tradition": "修辞学（エレベーター・ピッチをスローダウンしたもの）",
      "duration": "15〜25分",
      "reflection": "一番削った部分は、本当はあなたが最も大切に思っているところでしたか？ それとも、本当はいちばん弱かったところでしたか？",
      "steps": [
        "本当に自分が抱える立場を一つ選ぶ。思慮ある友人なら異論を持ちそうなもの。",
        "5 分版を書く。引き伸ばす — ニュアンス、例、反論と応答すべて。",
        "2 分版に圧縮する。まず弱い部分から削る。重みを担う部分は残す。",
        "60 秒版に圧縮する。声に出して時計で計る。超えたらさらに削る。",
        "60 秒版と 5 分版を並べて読む。削った中で、問われたら本当は守りたいものはあったか？"
      ]
    },
    "ko": {
      "name": "60초의 주장",
      "summary": "60초로 끝내질 수 있을 때까지 자신의 논점을 압축한다.",
      "tradition": "수사학 (엘리베이터 피치를 느리게 늘인 것)",
      "duration": "15–25분",
      "reflection": "가장 많이 잘라낸 부분은 사실 당신에게 가장 소중한 곳이었나요, 아니면 실제로 가장 약했던 곳이었나요?",
      "steps": [
        "실제로 자신이 가지고 있는 입장을 하나 고른다. 사려 깊은 친구라면 반대할 만한 것.",
        "5분짜리 버전을 쓴다. 펼친다 — 미묘한 점, 예시, 반론과 응답 전부.",
        "2분으로 압축한다. 가장 약한 것부터 자른다. 무게를 지탱하는 것은 남긴다.",
        "60초로 압축한다. 소리 내어 읽고 시간을 잰다. 넘치면 더 자른다.",
        "60초 버전과 5분 버전을 나란히 읽는다. 잘라낸 것 중에서 정말로 변호하고 싶은 부분이 있었는가?"
      ]
    }
  },
  "anticipating-objections": {
    "es": {
      "name": "Anticipar objeciones",
      "summary": "Para cada posición, lista las tres objeciones más fuertes — y luego respóndelas.",
      "tradition": "Aquino (estructura de la Summa: objeción, sed contra, respuesta)",
      "duration": "20–35 min",
      "reflection": "¿Qué objeción te resultó más difícil de responder limpiamente? Ahí es donde tu posición es más débil — y posiblemente más interesante.",
      "steps": [
        "Elige una afirmación que vas a defender. Algo lo bastante específico para poder estar equivocado.",
        "Escribe tres objeciones, en su forma más fuerte (ya practicaste el steelman).",
        "Para cada una, nombra a una persona — real o imaginaria — que la formularía. Específica: una escéptica reflexiva, no un muñeco de paja.",
        "Escribe una respuesta de un párrafo a cada una. Sé honesto si parte de la objeción acierta; concédelo y defiende lo que no.",
        "Lee las tres respuestas juntas. ¿Tu posición ahora está más matizada? ¿Mejor definida? ¿O simplemente te disculpaste?"
      ]
    },
    "fr": {
      "name": "Anticiper les objections",
      "summary": "Pour chaque thèse, liste les trois objections les plus fortes — puis réponds-y.",
      "tradition": "Aquin (structure de la Somme : objection, sed contra, réponse)",
      "duration": "20–35 min",
      "reflection": "Quelle objection as-tu trouvée la plus difficile à traiter proprement ? C'est là que ta position est la plus fragile — et peut-être la plus intéressante.",
      "steps": [
        "Choisis une thèse à défendre. Quelque chose d'assez précis pour pouvoir être faux.",
        "Écris trois objections, sous leur forme la plus solide (tu as déjà pratiqué le steelman).",
        "Pour chacune, nomme une personne — réelle ou imaginée — qui la pousserait. Précise : une sceptique réfléchie, pas un homme de paille.",
        "Écris une réponse d'un paragraphe à chacune. Sois honnête si une partie de l'objection touche juste ; concède-la, défends le reste.",
        "Lis les trois réponses ensemble. Ta position est-elle plus nuancée ? Mieux définie ? Ou tu t'es contenté de t'excuser ?"
      ]
    },
    "pt": {
      "name": "Antecipar objeções",
      "summary": "Para cada posição, liste as três objeções mais fortes — e então responda a cada uma.",
      "tradition": "Aquino (estrutura da Summa: objeção, sed contra, resposta)",
      "duration": "20–35 min",
      "reflection": "Qual objeção foi mais difícil de responder com clareza? É aí que sua posição é mais fraca — e possivelmente mais interessante.",
      "steps": [
        "Escolha uma afirmação a defender. Específica o bastante para poder estar errada.",
        "Escreva três objeções, na forma mais forte que conseguir (já praticou steelman).",
        "Para cada uma, nomeie uma pessoa — real ou imaginária — que a faria. Específica: uma cética reflexiva, não um espantalho.",
        "Escreva uma resposta de um parágrafo a cada uma. Seja honesto se parte da objeção acertar; conceda e defenda o resto.",
        "Leia as três respostas juntas. Sua posição ficou mais matizada? Melhor definida? Ou você só pediu desculpas?"
      ]
    },
    "ru": {
      "name": "Предвосхищение возражений",
      "summary": "Для каждой позиции запишите три самых сильных возражения — и ответьте на них.",
      "tradition": "Фома Аквинский (структура «Суммы»: возражение, sed contra, ответ)",
      "duration": "20–35 мин",
      "reflection": "Какое возражение оказалось труднее всего отбить чисто? Там и сидит самая слабая часть вашей позиции — возможно, и самая интересная.",
      "steps": [
        "Выберите утверждение, которое будете защищать. Достаточно конкретное, чтобы быть способным оказаться ошибочным.",
        "Запишите три возражения в самой сильной форме (со стилмэном вы уже потренировались).",
        "Для каждого назовите человека — реального или воображаемого — кто бы его выдвинул. Конкретного: вдумчивого скептика, а не соломенное чучело.",
        "Дайте на каждое ответ в один абзац. Честно: если часть возражения попадает — признайте и защищайте только то, что устояло.",
        "Прочитайте три ответа вместе. Позиция стала тоньше? Чётче? Или вы просто извинились?"
      ]
    },
    "zh": {
      "name": "预想反对",
      "summary": "为每一个立场列出最强的三条反对意见 —— 然后逐一回答。",
      "tradition": "阿奎那（《神学大全》结构：异议、sed contra、回答）",
      "duration": "20–35 分钟",
      "reflection": "哪条反对最难干净地回答？那里就是你立场最薄弱的地方 —— 也常常是最有意思的地方。",
      "steps": [
        "挑一个你要辩护的主张。足够具体，以至于可能出错。",
        "写下三条反对，用你能想到的最强形式（你已经练过 steelman）。",
        "为每条反对，指出一位会提出它的人 —— 真实或想象。要具体：思虑周详的怀疑者，而不是稻草人。",
        "为每条反对写一段回应。诚实点：若反对的一部分确实切中，就让出那一部分，守住其余。",
        "把三段回应一起读。你的整体立场是否更细致了？更精确了？还是只是道了个歉？"
      ],
      "about": "阿奎那写作《神学大全》时，总是先陈述反对意见：在为自己的每一个立场辩护之前，他先提出最有力的反驳。这样一来，任何读者都无法指责他回避了困难。同样的做法适用于你正在准备的任何论证——无论是论文、对话还是提案。列出三条反对意见，设想会提出这些意见的最聪明的人，然后逐一作答。"
    },
    "ja": {
      "name": "反論を先取りする",
      "summary": "各立場について、最強の反論を 3 つあげ、それぞれに答える。",
      "tradition": "アクィナス（『神学大全』の構造：異議、sed contra、応答）",
      "duration": "20〜35分",
      "reflection": "もっとも整然と答えにくかった反論はどれでしたか？ そこがあなたの論のいちばん弱いところであり、たぶんいちばん面白いところです。",
      "steps": [
        "擁護する主張を一つ選ぶ。間違いうるくらい具体的なもの。",
        "反論を 3 つ書く。可能なかぎり強い形で（スティールマンの練習をすでにやった）。",
        "各反論について、それを実際に押すであろう人物を名指す。具体的に — 思慮深い懐疑家であって、わら人形ではない。",
        "反論ごとに段落一つで応答する。当たっている部分は正直に認め、残るところを守る。",
        "三つの応答を続けて読む。立場は前より繊細になったか？ 輪郭が明確になったか？ それとも謝っただけか？"
      ]
    },
    "ko": {
      "name": "반론을 미리 떠올리기",
      "summary": "각 입장마다 가장 강한 반론 셋을 적고, 그것에 대해 답한다.",
      "tradition": "아퀴나스 (신학대전 구조: 이의, sed contra, 답변)",
      "duration": "20–35분",
      "reflection": "깔끔하게 답하기가 가장 어려웠던 반론은 무엇인가요? 거기가 당신 입장의 가장 약한 곳이며, 아마 가장 흥미로운 곳입니다.",
      "steps": [
        "변호할 주장을 하나 고른다. 틀릴 수 있을 만큼 구체적인 것.",
        "반론 셋을 가능한 한 강한 형태로 적는다 (이미 스틸맨 연습을 했다).",
        "각 반론마다 그것을 실제로 밀어붙일 인물 — 실재든 상상이든 — 을 지목한다. 사려 깊은 회의주의자, 허수아비 아닌 것으로.",
        "반론마다 한 문단으로 응답한다. 정직하게: 반론의 일부가 맞다면 그 부분은 양보하고 나머지를 지킨다.",
        "세 응답을 함께 읽는다. 당신의 입장은 더 섬세해졌나? 더 또렷해졌나? 아니면 그저 사과만 했나?"
      ]
    }
  },
  "translation-under-constraint": {
    "es": {
      "name": "Traducción con restricciones",
      "summary": "Reformula un argumento complejo para un niño de 12 años, luego para un escéptico, luego para un adversario.",
      "tradition": "Pedagogía + retórica (técnica Feynman generalizada)",
      "duration": "20–30 min",
      "reflection": "¿La versión para el niño de 12 años reveló algo que en realidad no podías explicar? Ahí hay un agujero en tu comprensión.",
      "steps": [
        "Elige una posición que querrías defender — algo con varias piezas en movimiento.",
        "Escribe la versión original. Usa el vocabulario que te sale natural.",
        "Tradúcela para un niño de 12 años inteligente y curioso. Sin jerga, sin nombres, sin apelar a la autoridad.",
        "Tradúcela de nuevo para una escéptica — alguien que ha leído más que tú y discrepa. Comprime, anticipa.",
        "Tradúcela una vez más para una adversaria — alguien a quien le encantaría verte fracasar. ¿Dónde golpea más? Construye esa respuesta dentro del propio argumento."
      ]
    },
    "fr": {
      "name": "Traduction sous contrainte",
      "summary": "Reformule un argument complexe pour un enfant de 12 ans, puis pour un sceptique, puis pour un adversaire.",
      "tradition": "Pédagogie + rhétorique (technique de Feynman généralisée)",
      "duration": "20–30 min",
      "reflection": "La version pour l'enfant de 12 ans a-t-elle révélé quelque chose que tu ne pouvais pas vraiment expliquer ? C'est là qu'il y a un trou dans ta compréhension.",
      "steps": [
        "Choisis une position que tu voudrais défendre — quelque chose à plusieurs rouages.",
        "Écris la version originale. Utilise le vocabulaire qui te vient naturellement.",
        "Traduis-la pour un enfant intelligent et curieux de 12 ans. Pas de jargon, pas de noms balancés, pas d'appel à l'autorité.",
        "Traduis-la à nouveau pour une sceptique — quelqu'un qui a lu plus que toi et qui n'est pas d'accord. Compresse, anticipe.",
        "Traduis encore une fois pour une adversaire — quelqu'un qui adorerait te voir échouer. Où tape-t-elle le plus fort ? Intègre la réponse dans l'argument lui-même."
      ]
    },
    "pt": {
      "name": "Tradução sob restrição",
      "summary": "Reescreva um argumento complexo para uma criança de 12 anos, depois para um cético, depois para um adversário.",
      "tradition": "Pedagogia + retórica (técnica de Feynman generalizada)",
      "duration": "20–30 min",
      "reflection": "A versão para uma criança de 12 anos revelou algo que você não conseguia explicar de verdade? Ali há um buraco no seu entendimento.",
      "steps": [
        "Escolha uma posição que você queira defender — algo com peças em movimento.",
        "Escreva a versão original. Use o vocabulário que vem naturalmente.",
        "Traduza para uma criança inteligente e curiosa de 12 anos. Sem jargão, sem nomes, sem apelo à autoridade.",
        "Traduza de novo para uma cética — alguém que leu mais que você e discorda. Comprima, antecipe.",
        "Traduza mais uma vez para uma adversária — alguém que adoraria te ver falhar. Onde ela bate mais forte? Embuta a resposta dentro do próprio argumento."
      ]
    },
    "ru": {
      "name": "Перевод под ограничением",
      "summary": "Перескажите сложный аргумент для 12-летнего, потом для скептика, потом для оппонента.",
      "tradition": "Педагогика + риторика (обобщённый «метод Фейнмана»)",
      "duration": "20–30 мин",
      "reflection": "Версия для 12-летнего обнажила что-то, что вы на самом деле не могли объяснить? Это и есть пробел в вашем понимании.",
      "steps": [
        "Выберите позицию, которую хотите защищать — с несколькими движущимися частями.",
        "Напишите исходную версию. Тем словарём, что приходит сам.",
        "Перескажите её умному и любопытному 12-летнему. Без жаргона, без имён, без апелляций к авторитету.",
        "Перескажите ещё раз — скептику, который читал больше вашего и не согласен. Сжимайте, предугадывайте.",
        "Перескажите ещё раз — врагу, который бы рад вашему поражению. Где он бьёт сильнее всего? Встроьте ответ в сам аргумент."
      ]
    },
    "zh": {
      "name": "受限翻译",
      "summary": "把一个复杂论证讲给一个 12 岁孩子，再讲给一个怀疑者，最后讲给一个反对者听。",
      "tradition": "教学法 + 修辞（推广了的费曼技巧）",
      "duration": "20–30 分钟",
      "reflection": "给 12 岁版本时，你是否暴露了自己其实无法说清的部分？那就是你理解中的窟窿。",
      "steps": [
        "挑一个你想为之辩护的立场 —— 要有几处运转的部件。",
        "写下「原版」。用你最自然的词汇。",
        "把它翻给一个聪明、好奇的 12 岁孩子听。不要术语、不要点名、不要诉诸权威。",
        "再翻一次，给一位怀疑者 —— 比你读得更多、并且不同意的人。压缩、预防、应对。",
        "再翻一次，给一位敌手 —— 巴不得你失败的人。他从哪里下手最狠？把回应嵌进论证本身。"
      ],
      "about": "如果你只能以一种方式呈现论证，那么你便全然依赖于听众恰好是你所预设的那类人。为不同的听众转译，迫使你辨认出论证的核心、所用的比喻，以及那些只对原本听众有效的部分。这也是一次诚实的检验：术语往往遮蔽混乱。把论证转化为一个十二岁孩子能理解的语言，便能告诉你，你是否真正理解了它。"
    },
    "ja": {
      "name": "制約のもとの翻訳",
      "summary": "複雑な議論を、12 歳の子に、次に懐疑者に、最後に敵対者に向けて言い直す。",
      "tradition": "教育学 + 修辞学（一般化したファインマン・テクニック）",
      "duration": "20〜30分",
      "reflection": "12 歳向けの版で、本当は説明できていなかったことが露わになりませんでしたか？ そこがあなたの理解の穴です。",
      "steps": [
        "擁護したい立場を一つ選ぶ — 動く部品がいくつかあるもの。",
        "原版を書く。自然に出る語彙を使う。",
        "12 歳の利発で好奇心ある子向けに訳す。専門用語なし、固有名詞なし、権威に頼らない。",
        "懐疑者に向けてもう一度訳す — あなたより多く読み、不同意の人物。圧縮し、先回りする。",
        "敵対者に向けてもう一度訳す — あなたの失敗を望む人。最も鋭く打ってくる場所はどこか。その応答を議論そのものに組み込む。"
      ]
    },
    "ko": {
      "name": "제약 속의 번역",
      "summary": "복잡한 논증을 12살 아이에게, 다음엔 회의주의자에게, 마지막엔 적대자에게 다시 말해 본다.",
      "tradition": "교수법 + 수사학 (일반화한 파인만 기법)",
      "duration": "20–30분",
      "reflection": "12살 버전에서 사실은 설명하지 못하던 부분이 드러났나요? 거기가 당신 이해의 구멍입니다.",
      "steps": [
        "변호하고 싶은 입장을 하나 고른다 — 움직이는 부품이 몇 개 있는 것.",
        "원본 버전을 쓴다. 자연스럽게 떠오르는 어휘로.",
        "명석하고 호기심 많은 12살 아이에게 통하도록 옮긴다. 전문용어 없이, 인명 없이, 권위에 호소하지 않고.",
        "다시 회의주의자에게 옮긴다 — 당신보다 많이 읽었고 동의하지 않는 사람. 압축하고 미리 대비한다.",
        "한 번 더, 적대자에게 옮긴다 — 당신이 실패하길 바라는 사람. 가장 세게 치는 지점은 어디인가? 그 응답을 논증 안쪽에 심어 둔다."
      ]
    }
  },
  "dialectical-loop": {
    "es": {
      "name": "Bucle dialéctico",
      "summary": "Tesis → antítesis más fuerte → síntesis. El movimiento de Hegel, hecho transitable.",
      "tradition": "Dialéctica hegeliana, refinada por Marx y muchos otros",
      "duration": "25–40 min",
      "reflection": "¿La síntesis se sintió como un compromiso o como un descubrimiento? Si fue compromiso, no empujaste lo bastante la antítesis.",
      "steps": [
        "Enuncia tu tesis. Una sola frase clara. (No \"quizás X\" — sino \"X\".)",
        "Ahora enuncia la antítesis. No la mera negación — la posición que se opone a la tuya desde otro punto de partida.",
        "¿Qué da por supuesto cada posición que la otra niega? Saca a la luz la premisa enterrada.",
        "Escribe una síntesis: una posición que tome en serio aquello a lo que cada una respondía, sin negar el núcleo de ninguna. No partas la diferencia — encuentra el tercer lugar.",
        "Trata la síntesis como nueva tesis. ¿Cuál es su antítesis? Repite el ciclo. La tercera posición suele ser más profunda que la primera."
      ]
    },
    "fr": {
      "name": "Boucle dialectique",
      "summary": "Thèse → antithèse la plus forte → synthèse. Le mouvement hégélien, rendu praticable.",
      "tradition": "Dialectique hégélienne, raffinée par Marx et bien d'autres",
      "duration": "25–40 min",
      "reflection": "La synthèse t'a-t-elle semblé un compromis ou une découverte ? Si c'est un compromis, c'est que tu n'as pas assez poussé l'antithèse.",
      "steps": [
        "Énonce ta thèse. Une seule phrase nette. (Pas « peut-être X » — vraiment X.)",
        "Maintenant énonce l'antithèse. Pas la simple négation — la position qui s'oppose à la tienne à partir d'un autre point de départ.",
        "Que présuppose chacune que l'autre nie ? Fais remonter la prémisse enfouie.",
        "Écris une synthèse : une position qui prend au sérieux ce à quoi chacune répondait, sans nier le noyau d'aucune. Ne fais pas la moyenne — trouve la troisième place.",
        "Traite la synthèse comme nouvelle thèse. Quelle est son antithèse ? Refais une boucle. La troisième position est en général plus profonde que la première."
      ]
    },
    "pt": {
      "name": "Loop dialético",
      "summary": "Tese → antítese mais forte → síntese. O movimento de Hegel, tornado caminhável.",
      "tradition": "Dialética hegeliana, refinada por Marx e muitos outros",
      "duration": "25–40 min",
      "reflection": "A síntese soou como concessão ou como descoberta? Se foi concessão, você não empurrou a antítese o suficiente.",
      "steps": [
        "Enuncie sua tese. Uma única frase limpa. (Não \"talvez X\" — X mesmo.)",
        "Agora enuncie a antítese. Não a mera negação — a posição que se opõe a partir de outro ponto de partida.",
        "O que cada posição assume que a outra nega? Traga à tona a premissa enterrada.",
        "Escreva uma síntese: uma posição que leve a sério aquilo a que cada uma respondia, sem negar o núcleo de nenhuma. Não rache a diferença — encontre o terceiro lugar.",
        "Trate a síntese como nova tese. Qual é sua antítese? Refaça o loop. A terceira posição costuma ser mais profunda que a primeira."
      ]
    },
    "ru": {
      "name": "Диалектическая петля",
      "summary": "Тезис → сильнейший антитезис → синтез. Гегелевский ход, сделанный проходимым.",
      "tradition": "Гегельянская диалектика, отточенная Марксом и многими другими",
      "duration": "25–40 мин",
      "reflection": "Синтез показался компромиссом или открытием? Если компромиссом — значит, антитезис вы не дожали.",
      "steps": [
        "Сформулируйте тезис. Одна чёткая фраза. (Не «возможно X», а именно X.)",
        "Теперь — антитезис. Не голое отрицание, а позиция, которая противостоит вашей с другой исходной точки.",
        "Что предполагает каждая из позиций, отрицаемое другой? Вытащите спрятанную предпосылку.",
        "Напишите синтез: позицию, которая всерьёз воспринимает то, на что отвечает каждая, не отрицая её ядра. Не «делите пополам» — найдите третье место.",
        "Считайте синтез новым тезисом. Какой у него антитезис? Запустите цикл снова. Третья позиция обычно глубже первой."
      ]
    },
    "zh": {
      "name": "辩证回路",
      "summary": "正题 → 最强反题 → 合题。把黑格尔的步法走出来。",
      "tradition": "黑格尔辩证法，经马克思与众多人精炼",
      "duration": "25–40 分钟",
      "reflection": "合题感觉像妥协，还是像发现？若像妥协，说明你对反题的力气不够。",
      "steps": [
        "说出你的正题。一句干净的话。（不是「也许是 X」，就是「X」。）",
        "再说反题。不是简单的否定 —— 是从另一个起点出发、对你立场形成对立的另一种位置。",
        "两者各自预设了什么、却被对方否定？把那条埋藏的前提挖出来。",
        "写一个合题：一个能认真承接两边各自回应之物、而不否定任何一方核心的位置。不要折中 —— 要找到第三处。",
        "把合题当作新的正题。它的反题是什么？再走一圈回路。第三个位置往往比第一个深。"
      ],
      "about": "辩证的运动：每一个立场都包含着其对立面的种子。你提出一个正题，然后阐明的不只是对它的反驳，而是将其翻转的立场——反题。综合并非折中；它是当你同时认真对待两者、并察觉到它们都在回应某种更深层之物时所涌现出的第三个立场。这个循环是迭代的，每一个综合都成为新的正题。你并非在寻求一个最终答案——而是借助这一结构，持续地向它靠近。"
    },
    "ja": {
      "name": "弁証法のループ",
      "summary": "テーゼ → 最強のアンチテーゼ → ジンテーゼ。ヘーゲルの足取りを実際にたどってみる。",
      "tradition": "ヘーゲルの弁証法、マルクスや多くの後継者が精緻化",
      "duration": "25〜40分",
      "reflection": "ジンテーゼは妥協でしたか、それとも発見でしたか？ 妥協なら、アンチテーゼをまだ押し切れていません。",
      "steps": [
        "自分のテーゼを述べる。一つの明確な文で。（「たぶん X」ではなく X、と。）",
        "次にアンチテーゼを述べる。単なる否定ではなく、別の出発点から自分の立場に対抗する立場。",
        "それぞれが前提しつつ、互いに否定しているものは何か？ 埋もれた前提を地表に出す。",
        "ジンテーゼを書く：それぞれが応答していたものを真に受け、どちらの核も否定しない立場。差を半分に取るのではなく、第三の場所を見つける。",
        "ジンテーゼを新しいテーゼとして扱う。そのアンチテーゼは何か？ もう一周。三つ目の位置は最初より深いことが多い。"
      ]
    },
    "ko": {
      "name": "변증법 루프",
      "summary": "정 → 가장 강한 반 → 합. 헤겔의 발걸음을 실제로 걸어 본다.",
      "tradition": "헤겔의 변증법, 마르크스 등이 다듬어 왔다",
      "duration": "25–40분",
      "reflection": "합이 타협처럼 느껴졌나요, 발견처럼 느껴졌나요? 타협처럼 느껴졌다면, 반(反)을 충분히 밀어붙이지 않은 것입니다.",
      "steps": [
        "자신의 정(正)을 말한다. 한 줄의 또렷한 문장으로. (\"어쩌면 X\"가 아니라, X라고.)",
        "이제 반(反)을 말한다. 단순한 부정이 아니라, 다른 출발점에서 자신의 입장과 맞서는 위치.",
        "둘이 각자 전제하면서 서로가 부정하는 것은 무엇인가? 묻혀 있던 전제를 끌어올린다.",
        "합(合)을 쓴다: 양쪽이 응답하던 것을 진지하게 받아들이되, 어느 쪽의 핵심도 부정하지 않는 입장. 가운데를 가르지 말고, 제3의 자리를 찾는다.",
        "합을 새로운 정으로 둔다. 그것의 반은 무엇인가? 한 번 더 루프를 돈다. 세 번째 위치가 첫 번째보다 깊은 경우가 많다."
      ]
    }
  },
  "switch-sides": {
    "es": {
      "name": "Cambia de bando",
      "summary": "Argumenta los dos lados de un debate, alternando, hasta que ya no sepas cuál era el tuyo.",
      "tradition": "Sofística / dialéctica (Protágoras, antilogía)",
      "duration": "30–45 min",
      "reflection": "¿Dónde, durante el ejercicio, cambiaste genuinamente de opinión, aunque fuera por un momento? ¿Podrías quedarte ahí?",
      "steps": [
        "Elige una pregunta con dos posiciones reales — debatible, contestada, con defensores fuertes en ambos lados.",
        "Decide con qué lado empiezas (lanza una moneda si no lo sabes).",
        "Defiende ese lado durante 2 minutos — en voz alta o por escrito, tu mejor caso posible.",
        "Cambia. Defiende el otro lado durante 2 minutos. No repitas lo ya dicho.",
        "Sigue alternando cada 2 minutos hasta agotar ambos lados. Luego siéntate y nota: ¿qué lado costó más defender? ¿Cuál se sintió más natural? ¿Encontraste algún argumento que no habías considerado?"
      ]
    },
    "fr": {
      "name": "Change de camp",
      "summary": "Défends les deux côtés d'un débat, en alternance, jusqu'à ne plus savoir lequel était le tien.",
      "tradition": "Sophistique / dialectique (Protagoras, antilogie)",
      "duration": "30–45 min",
      "reflection": "À quel moment de l'exercice as-tu vraiment changé d'avis, même brièvement ? Pourrais-tu y rester ?",
      "steps": [
        "Choisis une question avec deux positions réelles — débattable, contestée, avec de bons défenseurs des deux côtés.",
        "Décide par quel côté tu commences (lance une pièce si tu ne sais pas).",
        "Défends ce côté pendant 2 minutes — à voix haute ou par écrit, le meilleur argumentaire possible.",
        "Change. Défends l'autre côté pendant 2 minutes. Ne répète pas ce que tu viens de dire.",
        "Continue à alterner toutes les 2 minutes jusqu'à épuiser les deux camps. Puis pose-toi : lequel était le plus dur à défendre ? Lequel semblait le plus naturel ? As-tu trouvé un argument auquel tu n'avais jamais pensé ?"
      ]
    },
    "pt": {
      "name": "Trocar de lado",
      "summary": "Defenda os dois lados de um debate, alternando, até não saber mais qual era o seu.",
      "tradition": "Sofística / dialética (Protágoras, antilogia)",
      "duration": "30–45 min",
      "reflection": "Onde, durante o exercício, você genuinamente mudou de ideia, mesmo que por um instante? Conseguiria ficar ali?",
      "steps": [
        "Escolha uma pergunta com dois lados reais — debatível, contestada, com bons defensores dos dois lados.",
        "Decida por qual lado começar (jogue uma moeda se não souber).",
        "Defenda esse lado por 2 minutos — em voz alta ou por escrito, o melhor caso possível.",
        "Troque. Defenda o outro lado por 2 minutos. Não repita o que já disse.",
        "Continue alternando a cada 2 minutos até esgotar os dois lados. Depois sente-se e perceba: qual lado custou mais defender? Qual pareceu mais natural? Você encontrou algum argumento novo?"
      ]
    },
    "ru": {
      "name": "Сменить сторону",
      "summary": "Аргументируйте обе стороны спора по очереди — пока не забудете, с какой начали.",
      "tradition": "Софистика / диалектика (Протагор, антилогии)",
      "duration": "30–45 мин",
      "reflection": "В какой момент упражнения вы по-настоящему изменили мнение, пусть на миг? Смогли бы вы там остаться?",
      "steps": [
        "Выберите вопрос с двумя реальными позициями — спорный, с серьёзными защитниками с обеих сторон.",
        "Решите, с какой стороны начнёте (если не знаете — подкиньте монету).",
        "Защищайте эту сторону 2 минуты — вслух или письменно, наилучшим аргументом, какой у вас есть.",
        "Сменили. Защищайте противоположную сторону 2 минуты. Не повторяйте уже сказанное.",
        "Меняйтесь каждые 2 минуты, пока обе стороны не исчерпаются. Затем — тишина и наблюдение: какую сторону отстаивать было труднее? Какая ощущалась естественнее? Появился ли довод, которого вы раньше не видели?"
      ]
    },
    "zh": {
      "name": "换边辩论",
      "summary": "为辩题的两边轮流辩护，直到不再记得自己最初站哪边。",
      "tradition": "智者派 / 辩证法（普罗泰戈拉，反对论）",
      "duration": "30–45 分钟",
      "reflection": "在练习的哪一刻，你真的改变了想法，哪怕只是一瞬？你能不能停在那里？",
      "steps": [
        "选一个真有两种立场的问题 —— 有争议，两边都有强力的辩护者。",
        "决定从哪一边开始（不确定就抛硬币）。",
        "为这一边辩护 2 分钟 —— 出声讲或写下来，拿出你最好的论证。",
        "换边。为另一边辩护 2 分钟。不要重复刚才说过的。",
        "继续每 2 分钟换一次，直到两边都讲尽。然后静下来观察：哪边更难辩？哪边更自然？是否冒出了你以前没想过的论点？"
      ],
      "about": "普罗泰戈拉曾说，每一个问题都有可以同等论证的两面。他的本意并非犬儒——而是一种修炼。能从任何一方都论证有力，才能使你不被自己碰巧起步的那一方所俘获。这是一个真实的练习：选定一个问题，找一位同伴（或独自计时并记录于日记中），每两分钟换一次立场，持续半小时。结束时，你已将两方可用的论证悉数演练了一遍。"
    },
    "ja": {
      "name": "立場を入れ替える",
      "summary": "ある論題の両側を交互に弁護し、自分がどちらで始めたか分からなくなるまで続ける。",
      "tradition": "ソフィスト / 弁証法（プロタゴラス、アンチロギア）",
      "duration": "30〜45分",
      "reflection": "エクササイズの中で、ほんの一瞬でも本当に考えが変わった瞬間はありましたか？ そこに留まり続けられますか？",
      "steps": [
        "本当に二つの立場が成り立つ問題を選ぶ — 論争中で、両側に強力な擁護者がいるもの。",
        "どちら側から始めるか決める（迷ったらコインで）。",
        "その側を 2 分間擁護する — 声に出すか書くかして、もっとも強い議論で。",
        "立場を替える。反対側を 2 分間擁護する。すでに言ったことは繰り返さない。",
        "2 分ごとに切り替え、両側が出尽くすまで続ける。そして静かに気づく：どちらが弁護しにくかったか。どちらが自然に感じたか。初めて見つかった論点はあったか。"
      ]
    },
    "ko": {
      "name": "편 바꾸기",
      "summary": "한 논제의 양쪽을 번갈아 변호하다가, 처음 어느 편이었는지 잊을 때까지 간다.",
      "tradition": "소피스트 / 변증법 (프로타고라스, 반론술)",
      "duration": "30–45분",
      "reflection": "연습 중 어느 순간 진짜로 마음이 바뀌었나요? 잠시였더라도. 그 자리에 머무를 수 있겠나요?",
      "steps": [
        "진짜로 두 입장이 성립하는 질문을 고른다 — 논쟁 중이고, 양쪽에 강한 옹호자가 있는 것.",
        "어느 편부터 시작할지 정한다 (모르겠으면 동전을 던진다).",
        "그 편을 2분 동안 변호한다 — 소리 내어 말하거나 글로, 가능한 한 가장 강한 논거로.",
        "편을 바꾼다. 반대편을 2분 동안 변호한다. 이미 한 말은 반복하지 않는다.",
        "2분마다 번갈아 가며 양쪽이 모두 소진될 때까지 계속한다. 그리고 가만히 살핀다: 어느 편이 더 변호하기 어려웠는지, 어느 편이 더 자연스러웠는지, 전에 보지 못했던 논거가 떠올랐는지."
      ]
    }
  },
  "morning-intention": {
    "zh": {
      "name": "晨间意向",
      "summary": "以你将带给这一天的东西开始，而非你期望从中得到什么。",
      "tradition": "斯多葛",
      "duration": "3–5 分钟",
      "reflection": "这个意向撑过了这一天吗？你在何处将它遗忘？下一次，怎样才能让你更早地想起它？",
      "about": "马可·奥勒留在《沉思录》的开篇，写下的正是某种晨间意向：“今日我将遭遇阻挠、忘恩、傲慢、背叛……”这并非悲观——而是预备。立下意向，并非要固定这一天的结果，而是选择你面对一切来临之事时所持的姿态。\n\n真正奏效的意向，能避开两种失误：模糊的期许（“今天要活在当下”）经不住第一封晨间邮件的冲击；而以结果为目标（“完成提案”）则将效率误认为品格。你所要立下的意向，关乎你将以怎样的方式出现，而非你将完成什么。",
      "steps": [
        "醒来后五分钟之内，在拿起手机或浏览新闻之前，带着一本笔记本静静坐下。",
        "写下日期。",
        "写下一个句子：“今天，无论发生什么，我想带着___去面对。”在空白处填入一种品质——耐心、诚实、专注、轻盈、拒绝仓促——一种真正在你掌控之内的品质。",
        "写下这一天可能带来的一个摩擦时刻（一场会议、某个人、一件你一直回避的事），以及你的意图将如何与之相遇。",
        "随身带着这本笔记本。午饭时，重读那句话。"
      ]
    }
  },
  "three-line-evening": {
    "zh": {
      "name": "三句话的夜晚",
      "summary": "每夜的回顾，浓缩为三句诚实的话。",
      "tradition": "斯多葛（现代简化）",
      "duration": "2–3 分钟",
      "reflection": "一周之后，将这些句子一并重读。你看到了什么样的规律？在这七天里，始终如一的那个人是谁？",
      "about": "长篇日记对大多数人而言往往适得其反——每日所需的投入太重，难以持续。三行，是真正能托住这一修习的最小剂量：累了也写得下去，短小而不失分量。\n\n结构如下：一行写进展顺遂之事，一行写不尽如意之处，一行写明日可以做出怎样不同的选择。这份纪律，就在于简短本身。你无从过度解释，压缩迫使你诚实。",
      "steps": [
        "就寝前，在笔记本上书写（用纸，而非手机——手机会将你引向别处）。",
        "第一行：“今天进展顺遂的时刻是___。”写一个具体的瞬间，而非整天的概括。",
        "第二行：“今天不尽如意的时刻是___。”同样：写具体的瞬间，而非泛泛的类别。",
        "第三行：“若明天能有所不同，我会___。”写一个具体的准备、行动，或心态上的重新框定。",
        "合上笔记本。不必回头重读。重要的是书写本身，而非留存档案。"
      ]
    }
  },
  "loving-kindness": {
    "zh": {
      "name": "慈心（loving-kindness）",
      "summary": "佛教修习，用于培育温柔的慈悲——先向自身，再向外层层扩展，如涟漪般漫开。",
      "tradition": "上座部佛教（含现代诠释）",
      "duration": "8–15 分钟",
      "reflection": "哪个圆最难跨越？这告诉了你什么——你的善意在哪里划下了界限？",
      "about": "慈心禅（Metta meditation）是佛教训练善意之感的修习。它有其结构，因为结构本身有助于修行——也因为结构会显露善意在何处受阻。几乎每个人都会发现至少有一个圆难以穿越。\n\n传统的次第为：自己、一位至爱之人、一位中立的人（比如每天见到的咖啡师）、一位令你感到困难的人，最后是一切众生。祈愿的话语保持简朴：“愿你平安，愿你安好，愿你内心宁静。”重点不在于制造某种感受，而在于引导注意力的方向。",
      "steps": [
        "以舒适的姿势坐下。轻闭双眼，或目光柔和地垂落。缓缓呼吸三次。",
        "第一个圆（1 分钟）：自己。在心中默念：“愿我平安。愿我安好。愿我内心宁静。”留意升起的一切——包括抗拒。",
        "第二个圆（1 分钟）：一位你毫无保留地爱着的人。以同样的祈愿语句，在心中浮现他们的样子。",
        "第三个圆（1 分钟）：一位中立的人——你常常见到、却并不真正了解的人。",
        "第四圈（1分钟）：一个令你感到困难的人。不必选最难的——从轻微的摩擦开始。重复同样的短语。留意哪里感到阻力。",
        "第五圈（1分钟）：一切众生。尽你的注意力所能抵达的广度。",
        "以三次呼吸作结。"
      ]
    }
  },
  "breath-count": {
    "zh": {
      "name": "数息至十",
      "summary": "禅修工具中最简朴的专注练习。大多数人数不到五就已失去。",
      "tradition": "禅",
      "duration": "5–20 分钟",
      "reflection": "当心离开计数时，它奔向了什么？它惯常去往何处？",
      "about": "从一数到十，随每次呼气默数：呼气，'一'；再次呼气，'二'。数到十后，重新从一开始。若心神游移、数数中断，不必责怪自己——只需重新从一开始。\n\n这个练习以其简朴而近乎严苛。没有什么故事可讲，没有进展可言。你要么数到了十，要么没有。大多数人初次尝试时，数到四便已失神。重点不在于“不中断”，而在于“察觉中断”。那一刻，正是训练的所在：散乱与回归之间的间隙。",
      "steps": [
        "端坐，保持自然挺直，不必紧绷。双手置于自然舒适之处。目光轻柔放松，或轻闭双眼。",
        "让呼吸自然发生，不加控制。",
        "每次呼气时，在心中默数“一”。下一次呼气：“二”。如此继续，直至十。",
        "若数到十，重新从一开始。",
        "若中途失数，重新从一开始。不要评判这次中断。",
        "在预定的时间内持续练习。结束时，做一次缓慢的呼吸，不再计数。"
      ]
    }
  },
  "mindful-eating": {
    "zh": {
      "name": "专注进食",
      "summary": "一餐饭，全神贯注地吃。揭示我们平日里多少味道从未真正被品尝。",
      "tradition": "佛教（内观传承）",
      "duration": "10–25 分钟（一餐）",
      "reflection": "你尝到了哪些平时会错过的味道？你想用什么来填补那片寂静——为什么？",
      "about": "挑选一餐——从小处开始，也许只是一片水果或一小碟食物——全神贯注地吃。不看手机，不读书，不开电视，不交谈。只有食物本身。\n\n这比听起来难得多。几乎每个人在三十秒内就会伸手去找什么来填满注意力。这种不安本身就是修习。你在觉察那种心不在焉的习惯——并且几乎总会发现，食物比你记忆中的更为有趣。",
      "steps": [
        "有意识地选择食物。选那种你平时边做别的事边吃的东西。",
        "坐在桌旁。不开屏幕，不拿书，连包装上的字也不读。",
        "进食之前，先看着这份食物。留意它的颜色、形状和气味。",
        "取一口食物，细嚼慢咽。留意它的质地、温度，以及咀嚼过程中味道的变化。",
        "每口之间，将餐具放下。留意自己想要立刻再次拿起它的冲动。",
        "如此继续，直到吃完——或者直到你察觉到自己已经饱了（这往往比你预想的来得更早）。"
      ]
    }
  },
  "letter-future-self": {
    "zh": {
      "name": "写给未来自己的信",
      "summary": "写信给一年后、五年后、十年后的自己，在书写中发现你最想告诉他们的话。",
      "tradition": "普世沉思传统",
      "duration": "20–40 分钟",
      "reflection": "重读自己写下的文字，写信的那个人身上，有什么令你感到意外？",
      "about": "选定一个时间节点——一年、五年或十年——给届时阅读这封信的自己写一封信。写下你此刻是怎样一个人，写下你害怕他们会遗忘的事，写下你希望他们仍然珍守的事。\n\n这个练习能让你察觉那些平日里浑然不觉的价值观。你会有一股冲动想要给出忠告——请克制它。未来的自己已经活过了中间这些年岁；忠告并非合适的姿态。他们真正需要的，是一份关于你的记录——记录那些岁月发生之前，你曾是什么样的人。",
      "steps": [
        "确定你的时间节点。写下你写信的日期，以及这封信将被打开的未来日期。",
        "以这句话开头：“我在___写下这封信，因为我想让你记得___。”",
        "写下你最希望他们从你当下的生活中保留下来的东西：一段关系、一种修习、一个追问、一份善意，或者一个信念。",
        "写下你担心他们已然放弃、而你会为此痛惜的事。",
        "写下你希望他们终于走出的困境或执念。",
        "用一句只属于他们的话作结。将信封好，在封面注明未来的日期，放到一个你终将找到它的地方。"
      ]
    }
  },
  "body-scan": {
    "zh": {
      "name": "身体扫描",
      "summary": "缓慢地将注意力移过身体的每一个区域。将你带回你真正栖居的唯一所在。",
      "tradition": "现代（卡巴金）+ 古典（内观、瑜伽尼德拉）",
      "duration": "15–30 分钟",
      "reflection": "哪个区域藏着你未曾察觉的东西？那是什么？",
      "about": "躺下来。将注意力缓慢地在身体各区域间移动，逐一经过——从脚到头，或从头到脚，方向无妨——留意那里存在的一切。紧绷、温热、隐痛，或者什么也没有。这个练习不是为了修正任何事，而是为了专注地陪伴。\n\n大多数人在几分钟后会发现，自己的下颌、肩膀或腹部整日都在用力，却从未意识到。身体知晓许多心智一直忽略的事情。身体扫描，是一种温柔的询问方式——去问问，身体想告诉你什么。",
      "steps": [
        "仰卧。双手置于身体两侧。闭上眼睛。",
        "缓慢地呼吸三次。安定下来。",
        "从脚趾开始。留意左脚大拇趾，然后依次是每一根脚趾。只是留意，不要刻意改变什么。",
        "向上移至左脚踝。小腿。膝盖。大腿。髋部。",
        "右腿重复同样的过程。",
        "继续向上：骨盆、腰背、腹部、胸腔、上背、肩膀。",
        "沿两臂向下，直至指尖。",
        "返回至颈部、下颌、面部（每次专注一个区域：下颌、面颊、双眼、额头、头皮）。",
        "最后将注意力同时落于整个身体。缓缓呼吸三次。"
      ]
    }
  },
  "burden-of-proof": {
    "zh": {
      "name": "举证责任审查",
      "summary": "大多数论辩之所以失败，是因为错误的一方被要求证明错误的事情。",
      "tradition": "分析哲学",
      "duration": "5–10 分钟",
      "reflection": "哪一方更好地履行了自己的举证责任？你自身的预设又在哪些地方替他们免除了这一责任？",
      "about": "提出肯定性主张的一方承担举证责任。“X 存在”需要加以辩护，而“X 不存在”在默认情况下则无须如此。这听起来显而易见，但在实际论辩中，举证责任始终在悄然转移，非形式逻辑中的大多数混乱，正源于这种被掩盖的责任置换。\n\n本练习的做法是：取一场你正身处其中（或近来读到）的真实论争，针对每一个论断追问：“此处的举证责任在谁？”那些悄然发生的转移，将会令你出乎意料。",
      "steps": [
        "选取一场论争——真实的，且是近期的。或许是你在网上目睹的一场辩论。",
        "逐一列出双方各自提出的论断。",
        "针对每一个论断，追问：这是肯定性主张（X 为真），还是否定性主张（X 为假）？逐一加以标注。",
        "针对每一个肯定性主张，追问：提出者所给出的证据，是否足以支撑该主张的分量？",
        "辨别是否存在举证责任的转移：有人是否通过要求对方反驳自己的主张，来规避本应由自己承担的举证责任？",
        "将其中一方最有力的论证重新表述，使举证责任回归其应有的归属。"
      ]
    }
  },
  "necessary-sufficient": {
    "zh": {
      "name": "必要条件与充分条件",
      "summary": "这一混淆所葬送的论证，比任何谬误都要多。",
      "tradition": "分析逻辑",
      "duration": "5 分钟",
      "reflection": "在你自己的思考中，何处将某个仅属必要的条件误当成了充分条件？",
      "about": "必要条件是X成立所不可或缺的前提；充分条件则足以保证X的发生。二者常被混淆——最常见于人们争论某事的“原因”时。一粒火星，在干燥的草木之中，足以引燃一场山火：火星是充分条件，干燥的草木是必要条件，却并非充分条件。\n\n这一练习通过强迫你分别命名二者，来磨砺这种辨别力——尤其是在只有其中一个条件在起实质作用的情形中。",
      "steps": [
        "选取三个形如“X导致Y”或“X是Y的原因”的命题。",
        "对每一个命题，追问：X对Y而言是必要条件吗？（没有X，Y还能发生吗？）",
        "再追问：X对Y而言是充分条件吗？（X单独出现，是否就能可靠地产生Y？）",
        "大多数原因是必要条件而非充分条件——它们还需要其他条件才能真正产生结果。请在你的三个例子中分别标注各属哪种情形。",
        "进阶练习：找一个有人声称“X导致Y”，但X既非必要条件、又非充分条件的案例。（这种情形在大众科学写作中极为常见。）"
      ]
    }
  },
  "modus-tollens": {
    "zh": {
      "name": "否定后件式练习",
      "summary": "否定后件推理法，是发现条件命题破绽最迅捷的方式。",
      "tradition": "古典逻辑",
      "duration": "5–10 分钟",
      "reflection": "你有哪些信念，已经停止用它们的预测来检验自己了？",
      "about": "否定后件式：若P则Q。非Q。故非P。这一推论形式是大多数理论证伪的核心引擎。\n\n这个练习简单而实用：取一个“若【理论】，则【预测】”形式的命题，再看看现实中实际发生了什么。若预测并未成真，该理论便承受了真实的冲击——而你刚刚运用的，正是否定后件式。",
      "steps": [
        "选取一个带有可检验预测的理论性命题。例如：“若将最低工资提高至15美元会导致失业，那么2017年西雅图提薪之后，我们应能观察到就业岗位减少。”",
        "将条件句清晰表述出来：“若P（理论），则Q（预测）。”",
        "检验Q。现实中究竟发生了什么？",
        "若Q并未发生：该理论便陷入了困境。（未必就此被彻底证伪——也许条件句本身有误，或有其他因素介入——但它欠你一个解释。）",
        "用你自己的三个信念来做这个练习。你当初预测了什么？实际又发生了什么？"
      ]
    }
  },
  "bayesian-update": {
    "zh": {
      "name": "贝叶斯更新",
      "summary": "新的证据出现了。信念应当移动多少？这是一种负责任地运用概率的方式。",
      "tradition": "贝叶斯认识论",
      "duration": "10–15 分钟",
      "reflection": "在你生活中，哪些地方你对薄弱的证据反应过度，或对有力的证据反应不足？",
      "about": "贝叶斯定理，通俗而言：你对某件事的信念程度，应当与你的先验信念乘以在该信念成立的条件下新证据出现的可能性成正比。新证据并不取代先验，而是对其进行修正。修正幅度的大小，取决于在每一个假设下，这条证据令人意外的程度。\n\n实践中的运用并不需要数学计算，只需如实回答：你此前持有怎样的信念？对于你正在考虑的每一个假设，这条新证据出现的可能性有多大？然后：你应当移动多少？",
      "steps": [
        "选取一个有两到三个候选答案（假设）的问题。",
        "在接触新证据之前：为每个假设分配一个大致的概率，使它们合计为100%。例如：“我有60%的把握认为伴侣是因X而不高兴，30%认为是Y，10%是其他原因。”",
        "说出新的证据：刚刚发生了什么？",
        "针对每一个假设，追问：'假设此假设成立，这一证据出现的可能性有多大？'",
        "令证据更有可能出现的那个假设，其概率随之提升；其余假设的概率则相应收缩。重新分配各假设的概率。",
        "留意：你的信念移动了吗？移动了多少？这一移动与证据的分量相称吗？"
      ]
    }
  },
  "hidden-premises": {
    "zh": {
      "name": "揭示隐含前提",
      "summary": "大多数论证并不明言其假设。让这些假设显露出来，往往是反驳论证的最快途径。",
      "tradition": "论证理论",
      "duration": "10 分钟",
      "reflection": "你自己的哪些论证，建立在从未被你认真捍卫过的隐藏前提之上？",
      "about": "每一个论证都依赖前提——那些被视为理所当然、结论由此而来的假设。大多数论证只明确陈述其中一部分前提，其余的则被悄悄带入，默认为共识。\n\n这项练习的做法是：取一个论证，将其隐藏的前提逐一还原。仅仅是把它们写出来这个动作，几乎总会揭示出至少一个——若有人当场追问，论证者将难以为之辩护。",
      "steps": [
        "选取一个论证——你自己的，或他人的。引用原文，或尽可能精确地加以转述。",
        "确定结论：这个论证意图证明什么？",
        "确定已陈述的前提：有哪些事实或主张被援引为支撑？",
        "追问：结论真的能从这些已陈述的前提中推导出来吗？若不能，还需要添加什么前提，结论才得以成立？",
        "将隐藏前提明确写出。例如：“大多数人都像X一样”，“自然的就是好的”，“有利可图的就是有效的”。",
        "追问：论证者是否会以捍卫显性前提的同等信心，来捍卫每一个隐藏前提？"
      ]
    }
  },
  "ockhams-razor": {
    "zh": {
      "name": "奥卡姆剃刀",
      "summary": "当两种理论能解释同样的证据时，取实体更少的那一个。这是手术刀，不是棍棒。",
      "tradition": "经院哲学与科学传统",
      "duration": "5–10 分钟",
      "reflection": "你在哪些地方习惯于援引繁复的解释，而简单的解释其实已经足够？你又在哪些地方过于简化了？",
      "about": "威廉·奥卡姆（14世纪）因这一原则而为人铭记：勿在必要之外增添实体。现代科学将其奉为准则：当两种理论能解释同样的数据时，取其较简者。较简的理论更有可能是正确的（至少更为实用），因为它所依赖的假设更少，出错的可能也就更小。\n\n本练习旨在训练对这一原则的审慎运用。奥卡姆剃刀常遭误用。它的意思不是“较简单的理论就是真理”，而是“当两种理论能解释同一件事时，取其较简者”。例外情形在于：若较简的理论丧失了解释力，则另当别论。",
      "steps": [
        "选取一个存在竞争性解释的现象。（可以很日常，比如：“我的朋友为何对我冷淡？”）",
        "列出至少两种候选解释，按复杂程度排列，最简者在前。",
        "对每一种解释，追问：它能否说明**所有**的证据？",
        "若较简单的解释足以说明全部证据，你便找到了奥卡姆所倾向的答案。",
        "若不能，较复杂的解释就必须以其复杂性换来更多——它所解释的，必须超过简单解释所能解释的。",
        "留意一种常见的误用：仅仅因为一个理论更复杂便将其排除，即便它能解释简单理论所无法解释的现象。"
      ]
    }
  },
  "disjunction-elimination": {
    "zh": {
      "name": "析取消去",
      "summary": "当你知道结果非A即B，而其中一项已可排除，另一项便成为必然。",
      "tradition": "古典逻辑",
      "duration": "5 分钟",
      "reflection": "在生活中，你是否常在未确认C、D、E等可能性之前，便断定“非A即B”？",
      "about": "析取消去是逻辑学的正式术语，指这样一种推理：“P或Q。非P。故Q。”夏洛克·福尔摩斯频繁运用此法：当你排尽了不可能的选项，剩下的那个，无论看似多么不可能，必然是真相。\n\n这一练习旨在训练你运用析取消去——但更重要的是，让你察觉自己何时正把这一推理施于并非穷举的析取式之上。",
      "steps": [
        "选取一个你正试图厘清来龙去脉的情境。",
        "将各候选解释列为一个析取式：“是A，或是B，或是C。”",
        "首先检查：这份清单是否穷尽了所有可能？是否遗漏了某些解释？（非正式的析取消去大多在此处失误——所谓“A或B”，从一开始其实是“A或B或C或D”。）",
        "若清单已然穷尽，逐一审视每一项：它为真需要满足哪些条件？有哪些证据可以将其排除？",
        "排除那些可以排除的。剩余之物，便是你的暂定答案。",
        "随后检验这一余项：即便其他选项已被排除，它与现有证据是否真正吻合？"
      ]
    }
  },
  "charitable-interpretation": {
    "zh": {
      "name": "善意诠释",
      "summary": "在反驳一个立场之前，先证明你对它的理解已足够充分——充分到持有该立场的人会说：“对，就是这个意思。”",
      "tradition": "分析哲学与德性认识论",
      "duration": "10 分钟",
      "reflection": "回顾过去的论争，你是否曾反驳的只是对手实际立场的一个更弱的版本？若当时理解得更准确，那场对话会走向何处？",
      "about": "慈善原则要求你以最强的形式，而非最弱的形式，来诠释对手的论证。这不是一种宽容，而是一种自律。驳倒最弱的版本，对最强的版本毫无证明，而大多数公开的“反驳”正是在不自知地犯着这个错误。\n\n这一练习迫使你放慢脚步。在回应一个立场之前，先用对方能够认可的方式将其复述出来，然后再作回应。",
      "steps": [
        "选取一个你不认同的立场。要真实、近期、具体。",
        "用你自己的话重新表述它，尽可能作出最宽厚的诠释。",
        "做一次核查：持有这一立场的人，若读到你的复述，是否会认出那是他们的观点？他们会想补充什么吗？删去什么吗？",
        "如果你通不过这项核查，说明你还没有真正理解这个观点。多读一些，与该立场的支持者交谈，暂不作答。",
        "一旦能够通过核查，再动笔回应。留意一下：针对“弱版本”奏效的反驳，对“强版本”是否同样有效。"
      ]
    }
  },
  "concession-and-counter": {
    "zh": {
      "name": "让步与反驳",
      "summary": "一种先建立信任、再提出异议的论辩结构。",
      "tradition": "古典修辞学",
      "duration": "5–10 分钟",
      "reflection": "做出让步时，你内心是什么感受？它削弱了你的论点，还是强化了它，抑或以某种其他方式改变了它的形态？",
      "about": "大多数论争在开口第一句便已失败——尚未确立任何共识，便急于攻击对方的立场。古典修辞学提供了一种相反的做法：在为自己所反对的部分辩论之前，先承认对方说对了什么。\n\n其结构是：“你说得对，X。而且，Y。”不是“但是”，而是“而且”。这一转换表明你真正听进了对方的正确之处，却并未因此放弃自己的全部立场。",
      "steps": [
        "选取一个分歧。找出对方立场的核心主张。",
        "在对方的论点中，找出至少一处确实有道理的地方——不是勉强认可，而是你真心认同的内容。",
        "以这样的方式开始你的回应：“你说得对，___。”措辞要像对方自己说的那样清晰干净。",
        "然后接着说：“而且，___。”提出你的反驳主张——但将其作为对所承认之点的补充，而非否定。",
        "留意对方听到“而且”与“但是”时，反应有何不同。"
      ]
    }
  },
  "ideological-turing-test": {
    "zh": {
      "name": "意识形态图灵测试",
      "summary": "将对方的观点阐述得足够到位，以至于陌生人无法判断你究竟是否真的信奉它。",
      "tradition": "现代（布莱恩·卡普兰，2011年）+ 古典（柏拉图苏格拉底式对话法）",
      "duration": "15–30 分钟",
      "reflection": "写这篇文章让你对“为何有识之士会持此观点”有了哪些新的理解？有什么是你现在更难轻易驳斥的？",
      "about": "原始的图灵测试是这样的：若人类无法分辨对话对象究竟是人还是机器，则机器通过测试。意识形态版本与此类似：若一个立场的真正持有者无法判断你是否真的认同该立场，则你通过测试。\n\n这是“最强论证”练习中要求最高的形式。它不仅要求你理解论证本身，更要求你进入其内在动机——从那个立场的内部去感受世界。若争论双方都能在回应之前通过这一测试，大多数论争都将因此而深化。",
      "steps": [
        "选取一个你不认同的观点。挑选一个你曾认真接触过的——而非你一直刻意回避的稻草人。",
        "写一篇约三百字的文章，为这一立场进行辩护。用第一人称。如同你本就持有此观点。",
        "务必呈现出内在动机：不只是这一立场在说什么，还要说明一个理性之人为何可能认为它令人信服。",
        "如有可能，将文章给一位真正持有此观点的人看，请他判断：“读起来像是我们中的一员，还是在假扮？”",
        "若对方说是在假装，问问自己遗漏了什么。重新修正。",
        "若无法找到真正持此观点的人，不妨问自己：如果对方读到这段话，我会感到难堪吗？"
      ]
    }
  },
  "reframe-disagreement": {
    "zh": {
      "name": "重构分歧",
      "summary": "当两个人各说各话、互不相交，分歧往往比双方所言的都要更深。",
      "tradition": "辩证法与治疗学",
      "duration": "10–15 分钟",
      "reflection": "点明更深层的分歧，是否改变了表层的争论？重新框架之后，它变得可以化解了吗？还是说，那个更深的分歧才是真正的问题所在？",
      "about": "许多冲突之所以发生，是因为双方其实在争论不同的事，却都以为自己在争论同一件事。表层的分歧——政策、决定、某条界线——遮蔽了更深处的分歧：价值观、原则，或各自的经历。\n\n这一练习培养的，是打破循环的那个动作：不再为自己的立场辩护，而是追问：真正的分歧究竟是什么？有时候，那才是本应发生的对话。",
      "steps": [
        "选一个真实的分歧——那种反复出现的。你们一再争论的那个。",
        "用一句话写下这个分歧表面上看起来是什么。",
        "现在问自己：我的立场若要成立，什么必须为真？我依赖的是怎样的底层信念、价值观或经历？",
        "对另一方做同样的事：若要他们的立场成立，什么底层信念、价值观或经历必须为真？",
        "加以比较。表层的分歧往往根植于更深层的分歧。说出那个底层的分歧。",
        "可选：将底层分歧带给对方。“我觉得我们真正的分歧在于___。你觉得是这样吗？”"
      ]
    }
  },
  "stoic-preview": {
    "zh": {
      "name": "斯多葛预演",
      "summary": "在一场艰难的对话开始之前，在心中演练它可能走向的最坏情形，然后走进去。",
      "tradition": "斯多葛（恶之预思）",
      "duration": "10 分钟",
      "reflection": "对话结束后，回想一下：最坏的情况发生了吗？还是说，那个最坏的可能其实远没有你感受的那般迫近？你真正的镇定，究竟从何而来？",
      "about": "斯多葛式的预思修炼：在坏事到来之前，先在心中将它生动地演历一遍，如此一来，当它真的降临时，便不至于令你措手不及。将这一方法用于争论：在一次艰难的对话开始之前，先在脑海中排演一切都走向最坏的版本——对方勃然大怒，拒绝倾听，说出最刻薄的话，而你也失去了自持。\n\n这一修炼并不会令人沮丧，恰恰相反。正因为你在内心已经历过最坏的境况，当你真正踏入那场对话时，你对真实处境看得更清，对任何突如其来的冲击不再慌乱，也更能坚守自己原本的意图。",
      "steps": [
        "找出那场艰难的对话。真实的，就在眼前的。",
        "用3分钟，生动地想象它走向最坏的情形。落到具体细节：对方的神情、他们的言语、以及你最惧怕的那个时刻。",
        "用3分钟，问自己：如果这一切真的发生，我希望自己怎么做？在最艰难的时刻，我想以怎样的面貌出现？",
        "用2分钟，明确地说出这场对话中真正重要的东西——你想传达什么，你能接受什么结果，哪种结果对你来说是真正的损失。",
        "走进那场对话。感受一下，事先演练过最坏的情形，对你此刻的沉着有何影响。"
      ]
    }
  },
  "ten-word-version": {
    "zh": {
      "name": "十个词的版本",
      "summary": "将你的论点压缩为十个词。这种压缩逼出诚实。",
      "tradition": "现代（摘要写作、海明威、英美新闻写作）",
      "duration": "5–10 分钟",
      "reflection": "在冗长的版本里，你说了哪些话——而十个词的版本揭示出，那些话其实并非你真正的意思？",
      "about": "取一个你正在阐述的论点——无论是写下来的还是心中持有的——将它压缩为十个词，再展开为二十个词。留意什么在压缩中得以留存，什么悄然消失。\n\n十个词的版本是残酷的。它剥去了所有限定语、修辞装饰与自我保护的缓冲。留下来的，才是真正的主张。若你的论点经不住压缩——若十个词的版本听起来要么微不足道，要么干脆是错的——那你已经从这个论点本身学到了某件要紧的事。",
      "steps": [
        "选取一个你近来提出过的论点——一篇文章、一场辩论，或某次对话中的立场。",
        "写出十个字的版本。恰好十个字。其余一概删去。",
        "将这十个字的版本朗读出来。听起来如何？站得住脚吗？令人尴尬吗？还是与你以为自己在论证的东西出人意料地不同？",
        "写出二十个字的版本，允许自己加入一处限定。再读一遍。",
        "留意十字版与二十字版之间的落差——在进一步压缩之后，什么留存了下来？",
        "现在写出百字版。大多数论证在这里都能得到充分的安置。更长的原文，多半不过是冗余的填充。"
      ]
    }
  }
};
// ─── END gen-translate EXERCISES_I18N ───

export function localizeExercise(ex: Exercise, locale: Locale): Exercise {
  if (locale === 'en') return ex;
  const i18n = EXERCISES_I18N[ex.slug]?.[locale];
  if (!i18n) return ex;
  return {
    ...ex,
    name: i18n.name ?? ex.name,
    summary: i18n.summary ?? ex.summary,
    tradition: i18n.tradition ?? ex.tradition,
    duration: i18n.duration ?? ex.duration,
    about: i18n.about ?? ex.about,
    steps: i18n.steps ?? ex.steps,
    reflection: i18n.reflection ?? ex.reflection,
  };
}
