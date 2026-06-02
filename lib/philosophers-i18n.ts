// Per-philosopher translations (overlay) for the 560-entry constellation.
//
// IMPORTANT: lib/philosophers.ts is partly generator-owned — the Wave 2
// entries live between gen-philosophers sentinels and are rewritten by
// scripts/gen-philosophers.mjs. So translations must NOT live there. They
// live here instead, keyed by philosopherSlug(name) — the same slug the
// pages and getPhilosopherBySlug() use — then by locale. Missing fields
// fall back to English.
//
// The PHILOSOPHERS_I18N object between the BEGIN/END sentinels is GENERATED
// by scripts/translate-content.mjs (it rewrites that region in place).
// Don't hand-edit inside the sentinels. The types + the localizePhilosopher
// helper below are hand-maintained.

import type { PhilosopherEntry } from './philosophers';
import type { Locale } from './translations';

/** Translatable subset of PhilosopherEntry. The vector, archetypeKey, and
 *  aliases stay English: the vector is numeric, archetypeKey is a structural
 *  link, and aliases are search keys (Latin-script name variants). */
export type PhilosopherI18nFields = {
  name?: string;
  dates?: string;
  keyIdea?: string;
};

// ─── BEGIN gen-translate PHILOSOPHERS_I18N ───
export const PHILOSOPHERS_I18N: Record<string, Partial<Record<Locale, PhilosopherI18nFields>>> = {
  "heraclitus": {
    "zh": {
      "name": "赫拉克利特",
      "dates": "约公元前535–475年",
      "keyIdea": "万物流变。你不能两次踏入同一条河流。隐藏的和谐比显见的和谐更为深远。"
    }
  },
  "plato": {
    "zh": {
      "name": "柏拉图",
      "dates": "约公元前428–348年",
      "keyIdea": "可见的世界不过是永恒理念的影子。知识乃是灵魂的回忆；凭借理性，灵魂得以从表象攀升至实在。"
    }
  },
  "aristotle": {
    "zh": {
      "name": "亚里士多德",
      "dates": "公元前384–322年",
      "keyIdea": "德性是经由实践而养成的稳固品质。美好的生活，是依循理性、卓越而积极的生命活动。"
    }
  },
  "diogenes-of-sinope": {
    "zh": {
      "name": "第欧根尼（锡诺普）",
      "dates": "约公元前412—323年",
      "keyIdea": "居于桶中，自称世界公民。拒绝世俗成规，以顺应自然为生活准则。"
    }
  },
  "epicurus": {
    "zh": {
      "name": "伊壁鸠鲁",
      "dates": "公元前341—270年",
      "keyIdea": "幸福的艺术在于消除痛苦。简朴地生活，培育友谊，不惧死亡。"
    }
  },
  "epictetus": {
    "zh": {
      "name": "爱比克泰德",
      "dates": "50–135 CE",
      "keyIdea": "重要的不是发生了什么，而是你如何回应。有些事取决于我们自身，大多数事则不然。"
    }
  },
  "marcus-aurelius": {
    "zh": {
      "name": "马可·奥勒留",
      "dates": "121–180 CE",
      "keyIdea": "你无法左右降临于你的事，却能掌握自己如何承受。生命的功课在于你的回应，而非外在的世界。"
    }
  },
  "plotinus": {
    "zh": {
      "name": "普罗提诺",
      "dates": "约204–270 CE",
      "keyIdea": "万物皆从太一流溢而出。灵魂经由沉思，循源而上，复归其本。"
    }
  },
  "augustine": {
    "zh": {
      "name": "奥古斯丁",
      "dates": "354–430",
      "keyIdea": "我们的心灵躁动不安，直到在你怀中得享安息。记忆、意志与理解，映照三位一体之奥秘。"
    }
  },
  "thomas-aquinas": {
    "zh": {
      "name": "托马斯·阿奎那",
      "dates": "1225–1274",
      "keyIdea": "信仰与理性相辅相成。自然法奠定神圣律法之基础。以五路论证上帝之存在。"
    }
  },
  "meister-eckhart": {
    "zh": {
      "name": "迈斯特·艾克哈特",
      "dates": "约1260–1328",
      "keyIdea": "化归于无。我借以观照上帝的那只眼，正是上帝借以观照我的那只眼。"
    }
  },
  "maimonides": {
    "zh": {
      "name": "迈蒙尼德",
      "dates": "1138–1204",
      "keyIdea": "我们所能言说的，唯有上帝之所不是。理性与启示在其最高处殊途同归。"
    }
  },
  "spinoza": {
    "zh": {
      "name": "斯宾诺莎",
      "dates": "1632–1677",
      "keyIdea": "上帝即自然。万有皆在上帝之中。自由即对必然性的理解。"
    }
  },
  "mary-wollstonecraft": {
    "zh": {
      "name": "玛丽·沃斯通克拉夫特",
      "dates": "1759–1797",
      "keyIdea": "女性的权利即人的权利。理性无分性别。教育带来解放。"
    }
  },
  "al-farabi": {
    "zh": {
      "name": "阿尔-法拉比",
      "dates": "约872–950",
      "keyIdea": "德性之城摹仿宇宙的秩序。哲学与宗教以不同的形式表达同一真理。"
    }
  },
  "ibn-sina-avicenna": {
    "zh": {
      "name": "伊本·西那（阿维森纳）",
      "dates": "980–1037",
      "keyIdea": "必然存在者的上帝论证。\"悬浮人\"说明灵魂是独立于身体的实体。"
    }
  },
  "al-ghazali": {
    "zh": {
      "name": "安萨里",
      "dates": "1058–1111",
      "keyIdea": "理性有其限度。通过苏菲修行直接体验神圣。怀疑引我重归信仰。"
    }
  },
  "ibn-rushd-averroes": {
    "zh": {
      "name": "伊本·鲁世德（阿威罗伊）",
      "dates": "1126–1198",
      "keyIdea": "理性与启示相契合。为哲学辩护，以驳安萨里。亚里士多德注疏之业。"
    }
  },
  "ibn-arabi": {
    "zh": {
      "name": "伊本·阿拉比",
      "dates": "1165–1240",
      "keyIdea": "存在统一论（Wahdat al-wujud）——存在之合一。世界是神的自我显现。想象力具有创造性。"
    }
  },
  "rumi": {
    "zh": {
      "name": "鲁米",
      "dates": "1207–1273",
      "keyIdea": "芦苇离苇床而被割，哭诉离别之苦。爱是你与万物之间的桥梁。"
    }
  },
  "patanjali": {
    "zh": {
      "name": "帕坦伽利",
      "dates": "约公元前200年",
      "keyIdea": "瑜伽是心念波动的止息。八支功法导向三摩地。"
    }
  },
  "adi-shankara": {
    "zh": {
      "name": "阿迪·商羯罗",
      "dates": "~788–820",
      "keyIdea": "唯梵真实。世界为幻。阿特曼即梵。解脱在于智识。"
    }
  },
  "ramanuja": {
    "zh": {
      "name": "罗摩努阇",
      "dates": "1017–1137",
      "keyIdea": "限定不二论。虔信为解脱之道。灵魂真实，与神相异而又不可分离。"
    }
  },
  "aurobindo": {
    "zh": {
      "name": "奥罗宾多",
      "dates": "1872–1950",
      "keyIdea": "精神降入物质，复又向精神演化回归。未来的人类将成为神性的人类。"
    }
  },
  "krishnamurti": {
    "zh": {
      "name": "克里希那穆提",
      "dates": "1895–1986",
      "keyIdea": "真理是一片无路之地。质疑一切权威。自由在于直接观照，而非追随。"
    }
  },
  "tagore": {
    "zh": {
      "name": "泰戈尔",
      "dates": "1861–1941",
      "keyIdea": "心灵无所畏惧之处。人格的无垠天空。自然与人类融为一体。"
    }
  },
  "gandhi": {
    "zh": {
      "name": "甘地",
      "dates": "1869–1948",
      "keyIdea": "萨提亚格拉哈——真理之力。非暴力抵抗。欲化世界，先化其身。"
    }
  },
  "bodhidharma": {
    "zh": {
      "dates": "~470–~543",
      "keyIdea": "教外别传，不立文字。直指人心，见性成佛。",
      "name": "菩提达摩"
    }
  },
  "hui-neng": {
    "zh": {
      "name": "慧能",
      "dates": "638–713",
      "keyIdea": "本来无一物。顿悟成佛。拨开迷障，直见本心。"
    }
  },
  "tsongkhapa": {
    "zh": {
      "name": "宗喀巴",
      "dates": "1357–1419",
      "keyIdea": "融合显密二乘。以严密逻辑阐发空性义理。《菩提道次第广论》——渐次修行之路。"
    }
  },
  "thich-nhat-hanh": {
    "zh": {
      "name": "一行禅师",
      "dates": "1926–2022",
      "keyIdea": "入世佛教。正念是修行的核心。相即共生——我们由非自我的诸元素构成。"
    }
  },
  "dalai-lama-14th": {
    "zh": {
      "name": "达赖喇嘛（第十四世）",
      "dates": "生于1935年",
      "keyIdea": "慈悲是一切的根基。内心的平静是外部和平的源泉。我的宗教即是善意。"
    }
  },
  "han-feizi": {
    "zh": {
      "name": "韩非子",
      "dates": "约公元前280—前233年",
      "keyIdea": "严刑峻法，不信任何人。权势、地位、术数——君主驭世之器。"
    }
  },
  "wang-yangming": {
    "zh": {
      "name": "王阳明",
      "dates": "1472–1529",
      "keyIdea": "良知本具。知行合一。向内体察本心，而非向外格物。"
    }
  },
  "zhu-xi": {
    "zh": {
      "name": "朱熹",
      "dates": "1130–1200",
      "keyIdea": "格物致知。理与气之辨。严谨而博大的儒学综合体系。"
    }
  },
  "kukai": {
    "zh": {
      "name": "空海",
      "dates": "774–835",
      "keyIdea": "即身成佛。真言、手印、曼陀罗。日本密教之精髓。"
    }
  },
  "hakuin": {
    "zh": {
      "name": "白隐",
      "dates": "1686–1769",
      "keyIdea": "单手之声，何处可寻？大疑之下，方有大悟。"
    }
  },
  "watsuji-tetsuro": {
    "zh": {
      "name": "和辻哲郎",
      "dates": "1889–1960",
      "keyIdea": "风土与文化塑造伦理。自我由关系构成，而非孤立自存。"
    }
  },
  "hillel": {
    "zh": {
      "name": "希勒尔",
      "dates": "约公元前110年–公元10年",
      "keyIdea": "凡你所厌恶的，勿施于人。其余皆注脚。"
    }
  },
  "martin-buber": {
    "zh": {
      "name": "马丁·布伯",
      "dates": "1878–1965",
      "keyIdea": "我—你与我—它之别。一切真实的生命皆是相遇。永恒之你在每一个你中与我们相遇。"
    }
  },
  "abraham-heschel": {
    "zh": {
      "name": "亚伯拉罕·赫舍尔",
      "dates": "1907–1972",
      "keyIdea": "根本性的惊异。祈祷即赞颂。先知呼唤正义。上帝寻觅人。"
    }
  },
  "baal-shem-tov": {
    "zh": {
      "name": "巴力·闪·托夫",
      "dates": "~1698–1760",
      "keyIdea": "上帝无处不在；以喜乐侍奉祂。每一位犹太人皆怀神圣火花。哈西德虔诚之道，由狂喜而达神。"
    }
  },
  "cheikh-anta-diop": {
    "zh": {
      "name": "谢赫·安塔·迪奥普",
      "dates": "1923–1986",
      "keyIdea": "非洲文明是人类文明的根基，而非旁支末流。重夺历史，重建未来。"
    }
  },
  "achille-mbembe": {
    "zh": {
      "name": "阿希尔·姆贝姆贝",
      "dates": "生于1957年",
      "keyIdea": "死亡政治。殖民事业作为死亡的生产。世界的黑化。"
    }
  },
  "kwame-anthony-appiah": {
    "zh": {
      "name": "夸梅·安东尼·阿皮亚",
      "dates": "生于1954年",
      "keyIdea": "世界主义：有根基的、局部的，却能跨越边界相互抵达。身份认同是建构的，却在其效应中真实存在。"
    }
  },
  "vine-deloria-jr": {
    "zh": {
      "name": "瓦恩·德洛里亚（子）",
      "dates": "1933—2005",
      "keyIdea": "上帝是红色的。时间即空间。地方至关重要。原住民知识抵抗西方的抽象化。"
    }
  },
  "carneades": {
    "zh": {
      "dates": "约公元前214—前129年",
      "keyIdea": "或然性——\"可信者\"——在确定性缺失时充当行动的向导。",
      "name": "卡尔内阿德斯"
    }
  },
  "aenesidemus": {
    "zh": {
      "name": "埃奈西德穆",
      "dates": "公元前1世纪",
      "keyIdea": "复兴皮浪主义——以十种论式驳斥独断论主张。"
    }
  },
  "philo-of-alexandria": {
    "zh": {
      "name": "亚历山大里亚的斐洛",
      "dates": "约公元前20—公元50年",
      "keyIdea": "寓意诠释；沟通犹太经典与希腊哲学。"
    }
  },
  "porphyry": {
    "zh": {
      "name": "波菲利",
      "dates": "~234–305",
      "keyIdea": "普罗提诺著作的编纂者；《导引》一书奠定了中世纪逻辑学长达千年的基本框架。"
    }
  },
  "iamblichus": {
    "zh": {
      "name": "扬布里柯",
      "dates": "~245–325",
      "keyIdea": "神术论——以礼仪实践作为灵魂升归神圣的途径。"
    }
  },
  "proclus": {
    "zh": {
      "name": "普罗克洛",
      "dates": "412–485",
      "keyIdea": "系统化的新柏拉图主义——每一原因皆溢出自身；实在由等级分明的三元组构成。"
    }
  },
  "hypatia": {
    "zh": {
      "name": "希帕提娅",
      "dates": "约360—415",
      "keyIdea": "亚历山大里亚数学家与新柏拉图主义者；殉道于基督徒之手的异教先贤。"
    }
  },
  "damascius": {
    "zh": {
      "name": "达马斯基乌斯",
      "dates": "约458—538",
      "keyIdea": "雅典学园最后一任掌门——那不可言说者超乎太一之上。"
    }
  },
  "boethius": {
    "zh": {
      "name": "波爱修斯",
      "dates": "~480–524",
      "keyIdea": "《哲学的慰藉》——命运之轮在死牢中悄然转动。"
    }
  },
  "plutarch": {
    "zh": {
      "name": "普鲁塔克",
      "dates": "~46–119",
      "keyIdea": "《平行列传》——品格于道德比照中得以彰显。"
    }
  },
  "lucian-of-samosata": {
    "zh": {
      "name": "萨莫萨塔的琉善",
      "dates": "~125–180",
      "keyIdea": "教条的讽刺者——以笑声消解一切自命不凡。"
    }
  },
  "marcus-tullius-varro": {
    "zh": {
      "name": "马库斯·图利乌斯·瓦罗",
      "dates": "公元前116—27年",
      "keyIdea": "百科全书式学者——编目三百种神学，而后方下判断。"
    }
  },
  "sextus-empiricus-the-younger": {
    "zh": {
      "name": "小塞克斯都·恩披里克",
      "dates": "2—3世纪",
      "keyIdea": "《皮浪主义概要》——对怀疑论方法的全面梳理与清点。"
    }
  },
  "origen": {
    "zh": {
      "name": "俄利根",
      "dates": "约185—254年",
      "keyIdea": "寓意释经与万物复原论——就连魔鬼终将得救。"
    }
  },
  "gregory-of-nyssa": {
    "zh": {
      "name": "尼撒的格里高利",
      "dates": "约335–395",
      "keyIdea": "灵魂延伸论——无限趋近上帝；永无抵达，唯有前行。"
    }
  },
  "pseudo-dionysius": {
    "zh": {
      "name": "伪狄奥尼修斯",
      "dates": "约5–6世纪",
      "keyIdea": "否定神学——言说上帝之所非，乃唯一诚实的路径。"
    }
  },
  "maximus-the-confessor": {
    "zh": {
      "name": "马克西姆斯认信者",
      "dates": "~580–662",
      "keyIdea": "宇宙礼仪——基督作为一切逻各斯的复归与总括。"
    }
  },
  "john-scotus-eriugena": {
    "zh": {
      "name": "约翰·司各脱·爱留根纳",
      "dates": "~815–877",
      "keyIdea": "《论自然的区分》——上帝作为自我展开、自我创造的本性。"
    }
  },
  "bonaventure": {
    "zh": {
      "name": "波纳文图拉",
      "dates": "1221–1274",
      "keyIdea": "《心灵升向上帝的旅程》——灵魂经由自然迈向上帝深处之旅。"
    }
  },
  "avicebron-ibn-gabirol": {
    "zh": {
      "name": "阿维塞布隆（伊本·加比罗尔）",
      "dates": "~1021–1058",
      "keyIdea": "《生命之泉》——即便在精神实体之中，亦有普遍质料与形式。"
    }
  },
  "peter-abelard": {
    "zh": {
      "name": "彼得·阿伯拉尔",
      "dates": "1079–1142",
      "keyIdea": "概念论——共相乃心灵中的概念，既非实在之物，亦非单纯名称。"
    }
  },
  "heloise-of-argenteuil": {
    "zh": {
      "name": "阿尔让特伊的爱洛伊丝",
      "dates": "~1098–1164",
      "keyIdea": "《致阿贝拉尔书》——爱才是最真实的动机，而非律法或责任。"
    }
  },
  "anselm-of-canterbury": {
    "zh": {
      "name": "坎特伯雷的安瑟伦",
      "dates": "1033–1109",
      "keyIdea": "信仰寻求理解；从定义出发的本体论论证。"
    }
  },
  "albertus-magnus": {
    "zh": {
      "name": "大阿尔伯特",
      "dates": "约1200–1280",
      "keyIdea": "受洗礼的亚里士多德——自然哲学作为通往神圣智慧之路。"
    }
  },
  "duns-scotus": {
    "zh": {
      "name": "邓斯·司各脱",
      "dates": "~1266–1308",
      "keyIdea": "存在的单义性；此性——使个体成其所是的\"这个性\"。"
    }
  },
  "marguerite-porete": {
    "zh": {
      "name": "玛格丽特·波雷特",
      "dates": "~1250–1310",
      "keyIdea": "《单纯灵魂之镜》——灵魂湮没于神圣之爱中。"
    }
  },
  "christine-de-pizan": {
    "zh": {
      "name": "克里斯蒂娜·德·皮桑",
      "dates": "1364–1430",
      "keyIdea": "《女士之城》——德性无关性别；理性乃人之公共根基。"
    }
  },
  "marsilius-of-padua": {
    "zh": {
      "name": "帕多瓦的马尔西利乌斯",
      "dates": "~1275–1342",
      "keyIdea": "《和平捍卫者》——世俗主权凌驾于精神权威之上。"
    }
  },
  "marsilio-ficino": {
    "zh": {
      "name": "马尔西利奥·费奇诺",
      "dates": "1433–1499",
      "keyIdea": "文艺复兴新柏拉图主义——灵魂作为上帝与质料之间的纽带。"
    }
  },
  "pico-della-mirandola": {
    "zh": {
      "name": "皮科·德拉·米兰多拉",
      "dates": "1463–1494",
      "keyIdea": "《论人的尊严》——自我塑造乃人类与生俱来的权利。"
    }
  },
  "pietro-pomponazzi": {
    "zh": {
      "name": "彼得罗·庞波纳齐",
      "dates": "1462–1525",
      "keyIdea": "灵魂的必死性——德性值得为其自身而追求。"
    }
  },
  "giordano-bruno": {
    "zh": {
      "name": "乔尔达诺·布鲁诺",
      "dates": "1548–1600",
      "keyIdea": "无限宇宙；宇宙作为活的整体——他为此付出了生命。"
    }
  },
  "tommaso-campanella": {
    "zh": {
      "name": "托马索·康帕内拉",
      "dates": "1568–1639",
      "keyIdea": "《太阳城》——以知识治国的乌托邦共和国。"
    }
  },
  "lorenzo-valla": {
    "zh": {
      "name": "洛伦佐·瓦拉",
      "dates": "约1407–1457",
      "keyIdea": "语文学批判——揭露《君士坦丁赠礼》为伪造文书。"
    }
  },
  "erasmus-of-rotterdam": {
    "zh": {
      "name": "鹿特丹的伊拉斯谟",
      "dates": "约1466–1536",
      "keyIdea": "《愚人颂》——基督教人文主义，以自由意志抗衡路德。"
    }
  },
  "hadewijch-of-antwerp": {
    "zh": {
      "name": "安特卫普的哈德维希",
      "dates": "约13世纪",
      "keyIdea": "贝居因派神秘主义者——爱的风暴（minne）即上帝自身的生命。"
    }
  },
  "mechthild-of-magdeburg": {
    "zh": {
      "name": "马格德堡的梅希蒂尔德",
      "dates": "约1207–1282",
      "keyIdea": "《神性的流光》——以德语白话写就的新娘神秘主义。"
    }
  },
  "hugh-of-saint-victor": {
    "zh": {
      "name": "圣维克多的雨果",
      "dates": "约1096–1141",
      "keyIdea": "三重眼目——肉眼、理性之眼与沉思之眼，各有其不同的观照方式。"
    }
  },
  "bernard-of-clairvaux": {
    "zh": {
      "name": "克莱尔沃的伯纳德",
      "dates": "1090–1153",
      "keyIdea": "爱上帝的四重递升境界；意志的神秘主义。"
    }
  },
  "ramon-llull": {
    "zh": {
      "name": "拉蒙·柳利",
      "dates": "约1232–1316",
      "keyIdea": "《大艺术》——以纯粹理性的组合逻辑实现皈依。"
    }
  },
  "al-razi-rhazes": {
    "zh": {
      "name": "拉齐（拉泽斯）",
      "dates": "~865–925",
      "keyIdea": "自然主义与怀疑论——五大永恒原则，预言非必要。"
    }
  },
  "al-biruni": {
    "zh": {
      "name": "比鲁尼",
      "dates": "973–1048",
      "keyIdea": "《印度志》——无争辩的比较方法；诚实的描述优先于一切。"
    }
  },
  "ibn-bajja-avempace": {
    "zh": {
      "name": "伊本·巴哲（阿文帕塞）",
      "dates": "~1085–1138",
      "keyIdea": "孤独的智识者——在堕落的社会中修养德性。"
    }
  },
  "olympe-de-gouges": {
    "zh": {
      "name": "奥兰普·德古热",
      "dates": "1748–1793",
      "keyIdea": "《妇女权利宣言》——因认真对待自由而被送上断头台。"
    }
  },
  "harriet-martineau": {
    "zh": {
      "name": "哈丽雅特·马蒂诺",
      "dates": "1802–1876",
      "keyIdea": "《政治经济学图解》——以道德观察为基础的社会学。"
    }
  },
  "harriet-taylor-mill": {
    "zh": {
      "name": "哈丽雅特·泰勒·密尔",
      "dates": "1807–1858",
      "keyIdea": "《妇女参政权》——借穆勒之笔流传的论证。"
    }
  },
  "frances-wright": {
    "zh": {
      "name": "弗朗西丝·赖特",
      "dates": "1795–1852",
      "keyIdea": "自由思想、废奴、平等教育——《大众讲座集》。"
    }
  },
  "anna-julia-cooper": {
    "zh": {
      "name": "安娜·茱莉亚·库珀",
      "dates": "1858–1964",
      "keyIdea": "《南方的声音》——以黑人女性为衡量任何共和国的尺度。"
    }
  },
  "ida-b-wells": {
    "zh": {
      "name": "艾达·B·韦尔斯",
      "dates": "1862–1931",
      "keyIdea": "反私刑调查——以道德证据超越体面政治。"
    }
  },
  "charlotte-perkins-gilman": {
    "zh": {
      "name": "夏洛特·帕金斯·吉尔曼",
      "dates": "1860–1935",
      "keyIdea": "《妇女与经济》——家务劳动作为经济上的隐形存在。"
    }
  },
  "emma-goldman": {
    "zh": {
      "name": "艾玛·高德曼",
      "dates": "1869–1940",
      "keyIdea": "《无政府主义及其他论文》——自由唯向自身负责。"
    }
  },
  "rosa-mayreder": {
    "zh": {
      "name": "罗莎·迈雷德尔",
      "dates": "1858–1938",
      "keyIdea": "走向对女性气质的批判——文化所建构的性别樊笼。"
    }
  },
  "edith-stein": {
    "zh": {
      "name": "埃迪特·施泰因",
      "dates": "1891–1942",
      "keyIdea": "移情的现象学；加尔默罗修女，殒命于奥斯维辛。"
    }
  },
  "rachel-bespaloff": {
    "zh": {
      "name": "拉歇尔·贝斯帕洛夫",
      "dates": "1895–1949",
      "keyIdea": "《论伊利亚特》——将人化为物的力量。"
    }
  },
  "edith-wyschogrod": {
    "zh": {
      "name": "伊迪丝·怀斯科格罗德",
      "dates": "1930–2009",
      "keyIdea": "圣徒与后现代主义——形而上学留白处的伦理学。"
    }
  },
  "gertrude-stein": {
    "zh": {
      "name": "格特鲁德·斯泰因",
      "dates": "1874–1946",
      "keyIdea": "作为阐释的构成——重复作为观照当下的方式。"
    }
  },
  "susanne-langer": {
    "zh": {
      "name": "苏珊·朗格",
      "dates": "1895–1985",
      "keyIdea": "《哲学新解》——符号创造乃心灵之标志。"
    }
  },
  "mary-calkins": {
    "zh": {
      "name": "玛丽·卡尔金斯",
      "dates": "1863–1930",
      "keyIdea": "人格主义自我心理学——自我乃哲学的首要基点。"
    }
  },
  "l-susan-stebbing": {
    "zh": {
      "name": "L·苏珊·斯特宾",
      "dates": "1885–1943",
      "keyIdea": "《有效思维》——逻辑乃公民抵御宣传蒙蔽的护盾。"
    }
  },
  "ruth-barcan-marcus": {
    "zh": {
      "name": "鲁思·巴坎·马库斯",
      "dates": "1921–2012",
      "keyIdea": "模态逻辑——在克里普克为可能世界命名之前，她已先行开辟此域。"
    }
  },
  "philippa-foot": {
    "zh": {
      "name": "菲利帕·富特",
      "dates": "1920–2010",
      "keyIdea": "自然之善——美德乃关于生命体繁盛状态的事实。"
    }
  },
  "iris-murdoch": {
    "zh": {
      "name": "艾丽丝·默多克",
      "dates": "1919–1999",
      "keyIdea": "善的主权——对独特他者的道德关注。"
    }
  },
  "mary-midgley": {
    "zh": {
      "name": "玛丽·米奇利",
      "dates": "1919–2018",
      "keyIdea": "《野兽与人》——动物、伦理与科学并非相互对立。"
    }
  },
  "mary-warnock": {
    "zh": {
      "name": "玛丽·沃诺克",
      "dates": "1924–2019",
      "keyIdea": "想象力——沃诺克生命伦理报告；道德委员会中的理性。"
    }
  },
  "hilde-lindemann": {
    "zh": {
      "name": "希尔德·林德曼",
      "dates": "生于1949年",
      "keyIdea": "《受损的身份认同，叙事的修复》——以叙事为道德实践。"
    }
  },
  "carol-gilligan": {
    "zh": {
      "name": "卡罗尔·吉利根",
      "dates": "生于1936年",
      "keyIdea": "《不同的声音》——关怀伦理学与正义伦理学并重。"
    }
  },
  "nel-noddings": {
    "zh": {
      "name": "内尔·诺丁斯",
      "dates": "1929–2022",
      "keyIdea": "《关怀》——以人与人之间的相遇为核心的关系伦理学。"
    }
  },
  "annette-baier": {
    "zh": {
      "name": "安妮特·拜尔",
      "dates": "1929–2012",
      "keyIdea": "信任作为道德生活的前提条件；以女性视角重读休谟。"
    }
  },
  "onora-o-neill": {
    "zh": {
      "name": "奥诺拉·奥尼尔",
      "dates": "生于1941年",
      "keyIdea": "建构性康德主义；现代制度中的信任与问责。"
    }
  },
  "susan-sontag": {
    "zh": {
      "name": "苏珊·桑塔格",
      "dates": "1933–2004",
      "keyIdea": "《反对阐释》——艺术的情欲学胜于诠释学。"
    }
  },
  "catharine-mackinnon": {
    "zh": {
      "name": "凯瑟琳·麦金侬",
      "dates": "生于1946年",
      "keyIdea": "《迈向国家的女性主义理论》——性别等级制度乃政治之最深层。"
    }
  },
  "drucilla-cornell": {
    "zh": {
      "name": "德鲁西拉·科内尔",
      "dates": "1950—2022",
      "keyIdea": "想象领域——平等需要为想象另一种自我留有空间。"
    }
  },
  "julia-kristeva": {
    "zh": {
      "name": "朱莉娅·克里斯蒂娃",
      "dates": "生于1941年",
      "keyIdea": "卑贱体——自我为维系自身而划定的边界。"
    }
  },
  "helene-cixous": {
    "zh": {
      "name": "埃莱娜·西苏",
      "dates": "生于1937年",
      "keyIdea": "女性书写——以身体写作，拒绝二元对立。"
    }
  },
  "luce-irigaray": {
    "zh": {
      "name": "吕斯·伊里加雷",
      "dates": "生于1930年",
      "keyIdea": "《他者女性的镜像》——性别差异作为哲学的根基。"
    }
  },
  "patricia-churchland": {
    "zh": {
      "name": "帕特里夏·丘奇兰德",
      "dates": "生于1943年",
      "keyIdea": "神经哲学——将道德概念自然化为哺乳动物大脑的产物。"
    }
  },
  "susan-haack": {
    "zh": {
      "name": "苏珊·哈克",
      "dates": "生于1945年",
      "keyIdea": "基础融贯论——知识如填字游戏，而非金字塔。"
    }
  },
  "sally-haslanger": {
    "zh": {
      "name": "萨利·哈斯兰格",
      "dates": "生于1955年",
      "keyIdea": "种族与性别是社会位置，而非自然种类。"
    }
  },
  "miranda-fricker": {
    "zh": {
      "name": "米兰达·弗里克",
      "dates": "生于1966年",
      "keyIdea": "认识论不正义——对人作为认知者所施加的伤害。"
    }
  },
  "rae-langton": {
    "zh": {
      "name": "蕾·朗顿",
      "dates": "生于1961年",
      "keyIdea": "色情作品作为沉默化——言语行为理论的伦理转向。"
    }
  },
  "linda-zagzebski": {
    "zh": {
      "name": "琳达·扎格泽布斯基",
      "dates": "生于1946年",
      "keyIdea": "心灵的德性——认识德性与道德德性同属一体。"
    }
  },
  "sara-heinamaa": {
    "zh": {
      "name": "萨拉·海纳玛",
      "dates": "生于1960年",
      "keyIdea": "性别差异作为身体性的现象学——承继波伏瓦之思。"
    }
  },
  "sara-ruddick": {
    "zh": {
      "name": "萨拉·鲁迪克",
      "dates": "1935—2011",
      "keyIdea": "母性思维——母育实践作为认知劳动。"
    }
  },
  "gloria-anzaldua": {
    "zh": {
      "name": "格洛丽亚·安萨尔杜阿",
      "dates": "1942–2004",
      "keyIdea": "《边境地带／边疆》——混血意识，架桥于诸重自我之间。"
    }
  },
  "maria-lugones": {
    "zh": {
      "name": "玛丽亚·卢戈内斯",
      "dates": "1944–2020",
      "keyIdea": "世界旅行——以游戏性的多元主义抵抗纯粹性的逻辑。"
    }
  },
  "linda-martin-alcoff": {
    "zh": {
      "name": "琳达·马丁·阿尔科夫",
      "dates": "1955年生",
      "keyIdea": "《可见的身份》——种族、性别与社会认识论的政治。"
    }
  },
  "adrian-piper": {
    "zh": {
      "dates": "生于1948年",
      "keyIdea": "理性与自我的结构——康德哲学与黑人概念艺术。",
      "name": "阿德里安·派珀"
    }
  },
  "karl-popper": {
    "zh": {
      "name": "卡尔·波普尔",
      "dates": "1902–1994",
      "keyIdea": "可证伪性——以可错的知识捍卫开放社会。"
    }
  },
  "imre-lakatos": {
    "zh": {
      "name": "伊姆雷·拉卡托斯",
      "dates": "1922–1974",
      "keyIdea": "研究纲领——游走于波普尔的锋刃与库恩的共同体之间的科学。"
    }
  },
  "thomas-kuhn": {
    "zh": {
      "name": "托马斯·库恩",
      "dates": "1922–1996",
      "keyIdea": "《科学革命的结构》——范式在转变，而非数据。"
    }
  },
  "paul-feyerabend": {
    "zh": {
      "name": "保罗·费耶阿本德",
      "dates": "1924–1994",
      "keyIdea": "《反对方法》——怎么都行；认识论无政府主义。"
    }
  },
  "ian-hacking": {
    "zh": {
      "name": "伊恩·哈金",
      "dates": "1936–2023",
      "keyIdea": "《表征与干预》——构建人物类型；推理风格。"
    }
  },
  "bas-van-fraassen": {
    "zh": {
      "name": "巴斯·范·弗拉森",
      "dates": "生于1941年",
      "keyIdea": "建构经验主义——接受可观察之物，对其余悬而不判。"
    }
  },
  "nelson-goodman": {
    "zh": {
      "name": "纳尔逊·古德曼",
      "dates": "1906–1998",
      "keyIdea": "《事实、虚构与预测》——\"绿蓝\"悖论，以及世界构建的诸种方式。"
    }
  },
  "donald-davidson": {
    "zh": {
      "name": "唐纳德·戴维森",
      "dates": "1917–2003",
      "keyIdea": "异常一元论；彻底诠释作为意义的检验标准。"
    }
  },
  "wilfrid-sellars": {
    "zh": {
      "name": "威尔弗里德·塞拉斯",
      "dates": "1912–1989",
      "keyIdea": "所与之神话——显现图像与科学图像并行共存。"
    }
  },
  "robert-brandom": {
    "zh": {
      "name": "罗伯特·布兰顿",
      "dates": "1950年生",
      "keyIdea": "《使之明确》——意义作为社会空间中的推理承诺。"
    }
  },
  "john-mcdowell": {
    "zh": {
      "name": "约翰·麦克道尔",
      "dates": "生于1942年",
      "keyIdea": "心灵与世界——第二自然，理由空间贯穿始终。"
    }
  },
  "jaakko-hintikka": {
    "zh": {
      "name": "雅科·辛提卡",
      "dates": "1929–2015",
      "keyIdea": "博弈论语义学；关于知识与信念的认知逻辑。"
    }
  },
  "frank-ramsey": {
    "zh": {
      "name": "弗兰克·拉姆齐",
      "dates": "1903–1930",
      "keyIdea": "真理即成功；冗余论；部分信念与实用主义。"
    }
  },
  "bernard-bolzano": {
    "zh": {
      "name": "伯纳德·波尔扎诺",
      "dates": "1781–1848",
      "keyIdea": "科学理论——语言转向之前的自在命题。"
    }
  },
  "gottlob-frege": {
    "zh": {
      "name": "戈特洛布·弗雷格",
      "dates": "1848–1925",
      "keyIdea": "《概念文字》——逻辑以算术基础之名获得新生。"
    }
  },
  "kurt-godel": {
    "zh": {
      "name": "库尔特·哥德尔",
      "dates": "1906–1978",
      "keyIdea": "不完备性——任何足够强的形式系统都存在无法在其内部证明的真命题。"
    }
  },
  "alfred-tarski": {
    "zh": {
      "name": "阿尔弗雷德·塔斯基",
      "dates": "1901–1983",
      "keyIdea": "真理的语义理论；真理于模型之中。"
    }
  },
  "alonzo-church": {
    "zh": {
      "name": "阿朗佐·丘奇",
      "dates": "1903–1995",
      "keyIdea": "λ演算；一阶逻辑的不可判定性。"
    }
  },
  "alan-turing": {
    "zh": {
      "name": "艾伦·图灵",
      "dates": "1912–1954",
      "keyIdea": "可计算数；心智即机器，机器即心智。"
    }
  },
  "norbert-wiener": {
    "zh": {
      "name": "诺伯特·维纳",
      "dates": "1894–1964",
      "keyIdea": "控制论——以反馈与控制为核心的通信科学。"
    }
  },
  "claude-shannon": {
    "zh": {
      "name": "克劳德·香农",
      "dates": "1916–2001",
      "keyIdea": "《通信的数学理论》——以比特度量信息。"
    }
  },
  "otto-neurath": {
    "zh": {
      "name": "奥托·纽拉特",
      "dates": "1882–1945",
      "keyIdea": "在航行中重建船只——哲学不能外在于进行中的科学。"
    }
  },
  "rudolf-carnap": {
    "zh": {
      "name": "鲁道夫·卡尔纳普",
      "dates": "1891–1970",
      "keyIdea": "语言的逻辑句法；宽容原则。"
    }
  },
  "moritz-schlick": {
    "zh": {
      "name": "莫里茨·石里克",
      "dates": "1882–1936",
      "keyIdea": "维也纳学圈——以可证实性为意义的判准。"
    }
  },
  "a-j-ayer": {
    "zh": {
      "name": "A·J·艾耶尔",
      "dates": "1910–1989",
      "keyIdea": "《语言、真理与逻辑》——伦理学不过是情感的表达。"
    }
  },
  "gilbert-ryle": {
    "zh": {
      "name": "吉尔伯特·赖尔",
      "dates": "1900–1976",
      "keyIdea": "《心的概念》——范畴错误；机器中并无幽灵。"
    }
  },
  "p-f-strawson": {
    "zh": {
      "name": "P.F. 斯特劳森",
      "dates": "1919–2006",
      "keyIdea": "个体——关于人与身体的描述性形而上学。"
    }
  },
  "michael-dummett": {
    "zh": {
      "name": "迈克尔·达米特",
      "dates": "1925–2011",
      "keyIdea": "反实在论；意义即使用，并由此引出构造性逻辑。"
    }
  },
  "stuart-hampshire": {
    "zh": {
      "name": "斯图亚特·汉普希尔",
      "dates": "1914–2004",
      "keyIdea": "思想与行动；自由寓于审慎之中，而非在审慎之前。"
    }
  },
  "david-lewis": {
    "zh": {
      "name": "大卫·刘易斯",
      "dates": "1941–2001",
      "keyIdea": "《论世界的多元性》——每一种可能性都是一个真实的世界。"
    }
  },
  "bernard-lonergan": {
    "zh": {
      "name": "伯纳德·洛纳根",
      "dates": "1904–1984",
      "keyIdea": "《洞见》——意向意识的结构作为认知方法。"
    }
  },
  "vladimir-solovyov": {
    "zh": {
      "name": "弗拉基米尔·索洛维约夫",
      "dates": "1853–1900",
      "keyIdea": "俄罗斯宗教哲学——全一性与神圣智慧。"
    }
  },
  "nikolai-berdyaev": {
    "zh": {
      "name": "尼古拉·别尔嘉耶夫",
      "dates": "1874–1948",
      "keyIdea": "自由与创造，乃人格中神圣性之所在。"
    }
  },
  "lev-tolstoy": {
    "zh": {
      "name": "列夫·托尔斯泰",
      "dates": "1828–1910",
      "keyIdea": "《忏悔录》——无政府主义、素食主义，以及内心的上帝之国。"
    }
  },
  "fyodor-dostoevsky": {
    "zh": {
      "name": "费奥多尔·陀思妥耶夫斯基",
      "dates": "1821–1881",
      "keyIdea": "宗教大法官——自由之重，甚于面包。"
    }
  },
  "pavel-florensky": {
    "zh": {
      "name": "帕维尔·弗洛连斯基",
      "dates": "1882–1937",
      "keyIdea": "《真理之柱与真理之基》——二律背反被视为信仰本身的形式而欣然接纳。"
    }
  },
  "sergei-bulgakov": {
    "zh": {
      "name": "谢尔盖·布尔加科夫",
      "dates": "1871–1944",
      "keyIdea": "索菲亚——神圣智慧，作为世界可知性的根基。"
    }
  },
  "mikhail-bakhtin": {
    "zh": {
      "name": "米哈伊尔·巴赫金",
      "dates": "1895–1975",
      "keyIdea": "对话性想象——自我在回应他者声音的过程中得以建构。"
    }
  },
  "roland-barthes": {
    "zh": {
      "name": "罗兰·巴特",
      "dates": "1915–1980",
      "keyIdea": "作者之死——文本的愉悦栖居于读者之中。"
    }
  },
  "maurice-blanchot": {
    "zh": {
      "name": "莫里斯·布朗肖",
      "dates": "1907–2003",
      "keyIdea": "文学空间——写作即作者的隐没。"
    }
  },
  "edmond-jabes": {
    "zh": {
      "name": "埃德蒙·雅贝斯",
      "dates": "1912–1991",
      "keyIdea": "《问题之书》——问题历经一切回答而长存。"
    }
  },
  "jean-luc-nancy": {
    "zh": {
      "name": "让-吕克·南希",
      "dates": "1940–2021",
      "keyIdea": "单数复数的存在——存在本已是共在。"
    }
  },
  "etienne-balibar": {
    "zh": {
      "name": "艾蒂安·巴利巴尔",
      "dates": "生于1942年",
      "keyIdea": "公民主体——平等与自由作为不可分割的政治发明。"
    }
  },
  "alain-badiou": {
    "zh": {
      "name": "阿兰·巴迪欧",
      "dates": "生于1937年",
      "keyIdea": "存在与事件——真理程序源于对奇异性的忠诚。"
    }
  },
  "jacques-ranciere": {
    "zh": {
      "name": "雅克·朗西埃",
      "dates": "生于1940年",
      "keyIdea": "感性的分配——政治即重新划定谁被纳入计算的疆界。"
    }
  },
  "bernard-stiegler": {
    "zh": {
      "name": "贝尔纳·斯蒂格勒",
      "dates": "1952–2020",
      "keyIdea": "技术与时间——记忆的外化塑造了人类本身。"
    }
  },
  "quentin-meillassoux": {
    "zh": {
      "name": "康坦·梅亚苏",
      "dates": "生于1967年",
      "keyIdea": "《有限性之后》——绝对者经由思辨理性而复归。"
    }
  },
  "catherine-malabou": {
    "zh": {
      "name": "凯瑟琳·马拉布",
      "dates": "生于1959年",
      "keyIdea": "可塑性——大脑是给予形式、同时接受形式的形式本身。"
    }
  },
  "bruno-latour": {
    "zh": {
      "name": "布鲁诺·拉图尔",
      "dates": "1947—2022",
      "keyIdea": "行动者网络理论——人类与非人类相互缠结，共同构成集合体。"
    }
  },
  "isabelle-stengers": {
    "zh": {
      "name": "伊莎贝尔·斯唐热",
      "dates": "生于1949年",
      "keyIdea": "宇宙政治学——科学作为一种实践，迟缓而充满风险。"
    }
  },
  "karen-barad": {
    "zh": {
      "name": "凯伦·巴拉德",
      "dates": "生于1956年",
      "keyIdea": "能动实在论——现实的基本单元是现象，而非对象。"
    }
  },
  "eduardo-viveiros-de-castro": {
    "zh": {
      "name": "爱德华多·维韦罗斯·德卡斯特罗",
      "dates": "生于1951年",
      "keyIdea": "亚美林底亚视角主义——身体各异，视角繁多。"
    }
  },
  "philippe-descola": {
    "zh": {
      "name": "菲利普·德斯科拉",
      "dates": "生于1949年",
      "keyIdea": "《超越自然与文化》——组织各民族生活方式的四种本体论。"
    }
  },
  "eduardo-kohn": {
    "zh": {
      "name": "爱德华多·科恩",
      "dates": "生于1968年",
      "keyIdea": "《森林如何思考》——森林逻辑中超越人类的符号过程。"
    }
  },
  "anna-tsing": {
    "zh": {
      "name": "安娜·金",
      "dates": "生于1952年",
      "keyIdea": "《世界末日的蘑菇》——资本主义废墟中的生命。"
    }
  },
  "karen-armstrong": {
    "zh": {
      "name": "凯伦·阿姆斯特朗",
      "dates": "生于1944年",
      "keyIdea": "《为上帝辩护》——宗教作为一种实践，重塑人的专注与关注。"
    }
  },
  "charles-hartshorne": {
    "zh": {
      "name": "查尔斯·哈特肖恩",
      "dates": "1897—2000",
      "keyIdea": "过程神学——上帝具有两极性，与受造物共担苦难。"
    }
  },
  "anandamayi-ma": {
    "zh": {
      "name": "阿南达玛依·玛",
      "dates": "1896—1982",
      "keyIdea": "拜拉维圣母——沉默是她最明晰的教导。"
    }
  },
  "sarvepalli-radhakrishnan": {
    "zh": {
      "name": "萨尔瓦帕利·拉达克里希南",
      "dates": "1888–1975",
      "keyIdea": "印度教的人生观——宗教即体验，哲学即其文法。"
    }
  },
  "bhimrao-ambedkar": {
    "zh": {
      "name": "毕姆拉奥·安贝德卡尔",
      "dates": "1891–1956",
      "keyIdea": "《种姓制度的消灭》——皈依佛教，作为道德意义上的反抗。"
    }
  },
  "vinoba-bhave": {
    "zh": {
      "name": "维诺巴·巴韦",
      "dates": "1895–1982",
      "keyIdea": "土地布施运动——以徒步行走实践甘地式革命。"
    }
  },
  "u-g-krishnamurti": {
    "zh": {
      "name": "U·G·克里希那穆提",
      "dates": "1918–2007",
      "keyIdea": "反上师的上师——自然状态本无可教之物。"
    }
  },
  "osho-rajneesh": {
    "zh": {
      "name": "奥修（拉杰尼希）",
      "dates": "1931–1990",
      "keyIdea": "动态冥想——为现代享乐主义者重塑出家之道。"
    }
  },
  "b-k-s-iyengar": {
    "zh": {
      "name": "B·K·S·艾扬格",
      "dates": "1918–2014",
      "keyIdea": "《瑜伽之光》——身体的对位即智性的具身形式。"
    }
  },
  "daisaku-ikeda": {
    "zh": {
      "name": "池田大作",
      "dates": "1928–2023",
      "keyIdea": "创价学会人文主义——从内心深处发起的修行者之革命。"
    }
  },
  "shunryu-suzuki": {
    "zh": {
      "name": "铃木俊隆",
      "dates": "1904–1971",
      "keyIdea": "《禅者的初心》——那颗本然空明之心，随时皆可回归。"
    }
  },
  "robert-aitken": {
    "zh": {
      "name": "罗伯特·艾特肯",
      "dates": "1917–2010",
      "keyIdea": "美国禅与社会关怀——公案与良知并行。"
    }
  },
  "toni-packer": {
    "zh": {
      "name": "托妮·帕克",
      "dates": "1927–2013",
      "keyIdea": "无权威的觉醒——无传承的探询。"
    }
  },
  "pema-chodron": {
    "zh": {
      "name": "佩玛·丘卓",
      "dates": "生于1936年",
      "keyIdea": "《当生命陷落时》——在无所依凭之中触遇本初善性。"
    }
  },
  "walter-rodney": {
    "zh": {
      "dates": "1942–1980",
      "keyIdea": "《欧洲如何使非洲欠发达》——帝国的政治经济学。",
      "name": "沃尔特·罗德尼"
    }
  },
  "steve-biko": {
    "zh": {
      "name": "史蒂夫·比科",
      "dates": "1946–1977",
      "keyIdea": "黑人意识——心理层面的解放先于政治自由。"
    }
  },
  "edward-said": {
    "zh": {
      "name": "爱德华·萨义德",
      "dates": "1935–2003",
      "keyIdea": "《东方主义》——关于\"他者\"的知识，作为帝国的谋划。"
    }
  },
  "paul-gilroy": {
    "zh": {
      "name": "保罗·吉尔罗伊",
      "dates": "生于1956年",
      "keyIdea": "黑色大西洋——以中间航道为棱镜折射出的现代性。"
    }
  },
  "sara-ahmed": {
    "zh": {
      "name": "萨拉·艾哈迈德",
      "dates": "生于1969年",
      "keyIdea": "《幸福的承诺》——驱使我们趋于顺从的情感力量。"
    }
  },
  "lauren-berlant": {
    "zh": {
      "name": "劳伦·柏兰特",
      "dates": "1957—2021",
      "keyIdea": "残忍的乐观主义——对繁荣的依附，恰恰阻碍了繁荣本身。"
    }
  },
  "eve-kosofsky-sedgwick": {
    "zh": {
      "name": "伊芙·科索夫斯基·塞奇威克",
      "dates": "1950–2009",
      "keyIdea": "《壁柜的认识论》——偏执式阅读与修复式阅读。"
    }
  },
  "jose-esteban-munoz": {
    "zh": {
      "name": "何塞·埃斯特万·穆尼奥斯",
      "dates": "1967–2013",
      "keyIdea": "《巡游乌托邦》——酷儿性作为尚未到来之物。"
    }
  },
  "boaventura-de-sousa-santos": {
    "zh": {
      "name": "博阿文图拉·德·苏萨·桑托斯",
      "dates": "生于1940年",
      "keyIdea": "南方认识论——从斗争中生长出来的知识。"
    }
  },
  "linda-tuhiwai-smith": {
    "zh": {
      "name": "琳达·图希瓦伊·史密斯",
      "dates": "生于1950年",
      "keyIdea": "《去殖民化方法论》——以被研究者的立场从事研究。"
    }
  },
  "mariana-ortega": {
    "zh": {
      "name": "玛丽亚娜·奥尔特加",
      "dates": "生于1965年",
      "keyIdea": "《居间》——拉丁裔女性生命中多重交织的自我。"
    }
  },
  "anibal-quijano": {
    "zh": {
      "name": "阿尼巴尔·基哈诺",
      "dates": "1928–2018",
      "keyIdea": "权力的殖民性——种族是现代统治最深层的轴心。"
    }
  },
  "walter-mignolo": {
    "zh": {
      "name": "沃尔特·米尼奥洛",
      "dates": "1941年生",
      "keyIdea": "地方历史／全球设计——以多元宇宙性对抗普遍主义。"
    }
  },
  "isaac-newton": {
    "zh": {
      "name": "艾萨克·牛顿",
      "dates": "1643–1727",
      "keyIdea": "自然哲学的数学原理；绝对空间与绝对时间。"
    }
  },
  "robert-boyle": {
    "zh": {
      "name": "罗伯特·波义耳",
      "dates": "1627–1691",
      "keyIdea": "《怀疑的化学家》——实验纲领；钟表匠上帝。"
    }
  },
  "christiaan-huygens": {
    "zh": {
      "name": "克里斯蒂安·惠更斯",
      "dates": "1629–1695",
      "keyIdea": "摆钟、波动光学与宇宙有人居住之说。"
    }
  },
  "antoine-lavoisier": {
    "zh": {
      "name": "安托万·拉瓦锡",
      "dates": "1743–1794",
      "keyIdea": "质量守恒——化学在定量方法的基础上得以重建。"
    }
  },
  "stuart-kauffman": {
    "zh": {
      "name": "斯图尔特·考夫曼",
      "dates": "生于1939年",
      "keyIdea": "《宇宙为家》——秩序得之无偿；复杂系统中的自组织。"
    }
  },
  "ilya-prigogine": {
    "zh": {
      "name": "伊利亚·普里戈金",
      "dates": "1917—2003",
      "keyIdea": "耗散结构——秩序生于远离平衡态的流动之中。"
    }
  },
  "d-s-wilson": {
    "zh": {
      "name": "D·S·威尔逊",
      "dates": "生于1949年",
      "keyIdea": "多层次选择——为行为研究重新确立群体选择的地位。"
    }
  },
  "frans-de-waal": {
    "zh": {
      "name": "弗朗斯·德瓦尔",
      "dates": "1948–2024",
      "keyIdea": "灵长类伦理学——移情与道德具有深远的演化根源。"
    }
  },
  "iain-mcgilchrist": {
    "zh": {
      "name": "伊恩·麦吉尔克里斯特",
      "dates": "生于1953年",
      "keyIdea": "《主人与使者》——两个大脑半球作为关注世界的不同方式。"
    }
  },
  "antonio-damasio": {
    "zh": {
      "name": "安东尼奥·达马西奥",
      "dates": "生于1944年",
      "keyIdea": "躯体标记——情感是理性的基底，而非其对立面。"
    }
  },
  "anil-seth": {
    "zh": {
      "name": "阿尼尔·塞思",
      "dates": "生于1972年",
      "keyIdea": "《成为你自己》——感知即受控的幻觉。"
    }
  },
  "karl-friston": {
    "zh": {
      "name": "卡尔·弗里斯顿",
      "dates": "生于1959年",
      "keyIdea": "自由能原理——心智是以最小化意外为目标的推断引擎。"
    }
  },
  "buddha": {
    "zh": {
      "name": "佛陀",
      "dates": "约公元前563—483年",
      "keyIdea": "苦乃第一圣谛。受苦之自我，本身即是幻象。行八正道。"
    }
  },
  "mahavira": {
    "zh": {
      "name": "大雄",
      "dates": "公元前599—527年",
      "keyIdea": "非暴力（ahimsa）高于一切。实在多面（anekāntavāda）。以苦行求解脱。"
    }
  },
  "nagarjuna": {
    "zh": {
      "name": "龙树"
    }
  },
  "mozi": {
    "zh": {
      "name": "墨子",
      "dates": "约公元前470–391年",
      "keyIdea": "兼爱众生，以利为衡。反对奢靡与厚葬。"
    }
  },
  "mencius": {
    "zh": {
      "name": "孟子",
      "dates": "公元前372–289年",
      "keyIdea": "人性本善，四端之心有待培育而已。"
    }
  },
  "zhuangzi": {
    "zh": {
      "name": "庄子",
      "dates": "约公元前369–286年"
    }
  },
  "frantz-fanon": {
    "zh": {
      "name": "弗朗茨·法农",
      "dates": "1925–1961",
      "keyIdea": "大地上的受苦者必须为自己发声。非殖民化是对强加之存在的暴力拒绝。"
    }
  },
  "kwasi-wiredu": {
    "zh": {
      "name": "夸西·维雷杜",
      "dates": "1931–2022",
      "keyIdea": "概念的去殖民化。阿坎思想中的真理观。以共识取代多数决。"
    }
  },
  "audre-lorde": {
    "zh": {
      "name": "奥德丽·洛德",
      "dates": "1934–1992"
    }
  },
  "john-dewey": {
    "zh": {
      "dates": "1859–1952",
      "keyIdea": "民主不止于政府。在实践中学习。探究是一切思维的范式。"
    }
  },
  "husserl": {
    "zh": {
      "name": "胡塞尔",
      "dates": "1859–1938",
      "keyIdea": "悬置你的预设，回归事物本身。现象学作为严格的科学。"
    }
  },
  "wittgenstein": {
    "zh": {
      "name": "维特根斯坦",
      "dates": "1889–1951",
      "keyIdea": "我的语言的界限，就是我的世界的界限。凡不可言说者，对之必须保持沉默。"
    }
  },
  "heidegger": {
    "zh": {
      "name": "海德格尔",
      "dates": "1889–1976",
      "keyIdea": "向死而生。此在。存在之遗忘。通过决断性达于本真。"
    }
  },
  "sartre": {
    "zh": {
      "name": "萨特",
      "dates": "1905–1980",
      "keyIdea": "你被判处自由。没有任何人性可供退守。做出选择，并承担那个选择。"
    }
  },
  "hannah-arendt": {
    "zh": {
      "name": "汉娜·阿伦特",
      "dates": "1906–1975"
    }
  },
  "ayn-rand": {
    "zh": {
      "name": "安·兰德",
      "dates": "1905–1982",
      "keyIdea": "理性的自利即是道德。资本主义是唯一与理性相符的制度。利他主义不过是一场骗局。"
    }
  },
  "derek-parfit": {
    "zh": {
      "name": "德里克·帕菲特",
      "dates": "1942–2017",
      "keyIdea": "人格同一性并非真正要紧之事。理由与人格。缩减自我，拓展道德关怀的边界。"
    }
  },
  "pythagoras": {
    "zh": {
      "name": "毕达哥拉斯",
      "dates": "约公元前570—前495年"
    }
  },
  "hildegard-of-bingen": {
    "zh": {
      "dates": "1098–1179",
      "keyIdea": "上帝活光的异象。维里迪塔斯——万物生发的绿意之力。身与魂乃神圣的统一体。"
    }
  },
  "catherine-of-siena": {
    "zh": {
      "name": "锡耶纳的凯瑟琳",
      "dates": "1347–1380",
      "keyIdea": "与基督的神秘合一。自我认知之室。上帝与人类之间的桥梁。"
    }
  },
  "nicholas-of-cusa": {
    "zh": {
      "name": "库萨的尼古拉",
      "dates": "1401–1464",
      "keyIdea": "有学识的无知。对立面的重合。无限者涵容一切有限。"
    }
  },
  "teresa-of-avila": {
    "zh": {
      "name": "阿维拉的德兰",
      "dates": "1515–1582",
      "keyIdea": "内心城堡，分七重居所。神秘祈祷引领灵魂与上帝合一。"
    }
  },
  "john-of-the-cross": {
    "zh": {
      "name": "十字若望",
      "dates": "1542–1591",
      "keyIdea": "灵魂的黑夜。Nada y todo——虚无与圆满。舍弃一切，方能寻得上帝。"
    }
  },
  "julian-of-norwich": {
    "zh": {
      "name": "诺里奇的朱利安",
      "dates": "约1342–1416"
    }
  },
  "pascal": {
    "zh": {
      "dates": "1623–1662",
      "keyIdea": "无限空间的永恒沉默令我战栗。心有其理，理性浑然不知。赌注押向上帝。"
    }
  },
  "al-kindi": {
    "zh": {
      "name": "阿尔-金迪",
      "dates": "约801–873",
      "keyIdea": "哲学与启示同出一源，皆来自神圣之处。真理不在乎由谁道出。"
    }
  },
  "ibn-tufayl": {
    "zh": {
      "name": "伊本·图费利",
      "dates": "约1105–1185",
      "keyIdea": "哈伊·伊本·叶格赞独自在孤岛上成长，凭借纯粹的理性，终而抵达神秘之真理。"
    }
  },
  "mulla-sadra": {
    "zh": {
      "name": "毛拉·萨德拉",
      "dates": "1571–1640",
      "keyIdea": "存在先于本质。存在的实在性通过等级渐进而强化。跨实体运动。"
    }
  },
  "madhva": {
    "zh": {
      "name": "摩陀婆",
      "dates": "1238–1317",
      "keyIdea": "严格的二元论。灵魂与神永恒地相区别。虔信是解脱之道。"
    }
  },
  "vivekananda": {
    "zh": {
      "name": "辨喜",
      "dates": "1863–1902",
      "keyIdea": "奋起，觉醒，不达目标誓不停歇。每个灵魂皆蕴含神性。实践吠檀多。"
    }
  },
  "ramana-maharshi": {
    "zh": {
      "name": "拉玛那·马哈希",
      "dates": "1879–1950",
      "keyIdea": "我是谁？追溯\"我念\"至其根源。唯有自我是真实的。"
    }
  },
  "nisargadatta-maharaj": {
    "zh": {
      "name": "尼萨迦达塔·马哈拉吉",
      "dates": "1897–1981",
      "keyIdea": "我即那。在一切习气与条件之前，你是纯粹的觉知。寻找本源。"
    }
  },
  "voltaire": {
    "zh": {
      "dates": "1694–1778",
      "keyIdea": "消灭卑劣。誓死捍卫言论自由。耕耘自己的园地。"
    }
  },
  "rousseau": {
    "zh": {
      "name": "卢梭",
      "dates": "1712–1778",
      "keyIdea": "人生而自由，却无往不在枷锁之中。文明使人堕落。公意。"
    }
  },
  "francis-bacon": {
    "zh": {
      "name": "弗朗西斯·培根",
      "dates": "1561–1626",
      "keyIdea": "知识就是力量。种族幻象、洞穴幻象、市场幻象、剧场幻象。归纳法。"
    }
  },
  "bergson": {
    "zh": {
      "keyIdea": "绵延，而非时空。生命冲力——生命的创造性驱动。直觉优于分析。"
    }
  },
  "whitehead": {
    "zh": {
      "name": "怀特海",
      "dates": "1861–1947",
      "keyIdea": "实在是过程，而非实体。经验的实际际遇。上帝非例外，乃典范。"
    }
  },
  "comte": {
    "zh": {
      "name": "孔德",
      "dates": "1798–1857",
      "keyIdea": "人类知识的三阶段：神学阶段、形而上学阶段、实证阶段。社会学为诸科学之后。"
    }
  },
  "peirce": {
    "zh": {
      "name": "皮尔士",
      "dates": "1839–1914",
      "keyIdea": "实用主义准则：一个概念的意义在于其实际效果。信念即我们据以行动之物。"
    }
  },
  "camus": {
    "zh": {
      "name": "加缪",
      "dates": "1913–1960",
      "keyIdea": "向着高处攀登的挣扎本身，已足以充盈一个人的心灵。我们必须想象西西弗斯是幸福的。"
    }
  },
  "merleau-ponty": {
    "zh": {
      "name": "梅洛-庞蒂",
      "dates": "1908–1961",
      "keyIdea": "身体自有其知。感知并非发生于头脑之中；它是世界与血肉的相遇。"
    }
  },
  "karl-jaspers": {
    "zh": {
      "name": "卡尔·雅斯贝尔斯",
      "dates": "1883–1969",
      "keyIdea": "存在显现于边界处境之中。涵括一切的超越。交流而不征服。"
    }
  },
  "paul-ricoeur": {
    "zh": {
      "name": "保罗·利科",
      "dates": "1913–2005",
      "keyIdea": "叙事自我。怀疑的诠释学。他者视域中的自身。"
    }
  },
  "hans-georg-gadamer": {
    "zh": {
      "name": "汉斯-格奥尔格·伽达默尔",
      "dates": "1900–2002"
    }
  },
  "baudrillard": {
    "zh": {
      "name": "鲍德里亚",
      "dates": "1929–2007",
      "keyIdea": "我们生活在仿真之中。真实已被超真实所取代。地图先于疆域而存在。"
    }
  },
  "lyotard": {
    "zh": {
      "name": "利奥塔",
      "dates": "1924–1998",
      "keyIdea": "对宏大叙事的质疑。歧异。崇高打破一切规则。"
    }
  },
  "marcuse": {
    "zh": {
      "name": "马尔库塞",
      "dates": "1898–1979"
    }
  },
  "john-searle": {
    "zh": {
      "dates": "1932–2025",
      "keyIdea": "中文屋论证。强人工智能不可能实现。言语行为理论。集体意向性构建社会实在。"
    }
  },
  "daniel-dennett": {
    "zh": {
      "name": "丹尼尔·丹尼特",
      "dates": "1942–2024",
      "keyIdea": "意识是多重草稿。自我是叙事重力的中心。达尔文的危险观念。"
    }
  },
  "david-chalmers": {
    "zh": {
      "name": "大卫·查默斯",
      "dates": "生于1966年",
      "keyIdea": "意识的难题：为何存在某种\"身为某物的感受\"？属性二元论。"
    }
  },
  "bernard-williams": {
    "zh": {
      "name": "伯纳德·威廉斯",
      "dates": "1929–2003",
      "keyIdea": "道德运气。内在理由。伦理学无法纳入系统性理论。"
    }
  },
  "alasdair-macintyre": {
    "zh": {
      "name": "阿拉斯代尔·麦金太尔",
      "dates": "1929–2025",
      "keyIdea": "德性之后。伦理学的根基有赖于传统与叙事。亚里士多德传统依然生机勃勃。"
    }
  },
  "charles-taylor": {
    "zh": {
      "name": "查尔斯·泰勒",
      "dates": "1931年生"
    }
  },
  "peter-singer": {
    "zh": {
      "dates": "生于1946年",
      "keyIdea": "所有动物一律平等。有效利他主义。以你所有，在力所能及之处拯救生命。"
    }
  },
  "christine-korsgaard": {
    "zh": {
      "name": "克里斯汀·科斯嘉",
      "dates": "生于1952年",
      "keyIdea": "规范性的来源。自我构成。实践身份奠定行动理由。"
    }
  },
  "harry-frankfurt": {
    "zh": {
      "name": "哈里·法兰克福",
      "dates": "1929—2023",
      "keyIdea": "论扯淡。关怀使我们成其为人。高阶欲望构成自我。"
    }
  },
  "richard-rorty": {
    "zh": {
      "name": "理查德·罗蒂",
      "dates": "1931–2007",
      "keyIdea": "真理不过是你的同时代人所允许你坚持的东西。以团结代替客观性。反讽自由主义。"
    }
  },
  "george-herbert-mead": {
    "zh": {
      "name": "乔治·赫伯特·米德",
      "dates": "1863–1931",
      "keyIdea": "自我生成于社会互动之中。\"主我\"与\"客我\"。泛化的他者。"
    }
  },
  "judith-butler": {
    "zh": {
      "name": "朱迪斯·巴特勒",
      "dates": "生于1956年",
      "keyIdea": "性别具有表演性。主体在重复中构成自身。脆弱性是一种政治资源。"
    }
  },
  "donna-haraway": {
    "zh": {
      "name": "唐娜·哈拉维",
      "dates": "生于1944年",
      "keyIdea": "赛博格宣言。与麻烦同在。伴侣物种。知识是情境性的。"
    }
  },
  "angela-davis": {
    "zh": {
      "name": "安吉拉·戴维斯",
      "dates": "生于1944年",
      "keyIdea": "废除民主。监狱无法被改良，只能被废除。团结即行动。"
    }
  },
  "gayatri-spivak": {
    "zh": {
      "name": "佳亚特里·斯皮瓦克",
      "dates": "生于1942年",
      "keyIdea": "底层人能言说吗？策略性本质主义。翻译作为政治实践。"
    }
  },
  "sylvia-wynter": {
    "zh": {
      "name": "西尔维娅·温特",
      "dates": "生于1928年",
      "keyIdea": "我们必须动摇殖民式的\"人\"之范畴，重新书写人的定义。一门关于混杂人性的存在科学。"
    }
  },
  "cornel-west": {
    "zh": {
      "name": "科内尔·韦斯特",
      "dates": "生于1953年",
      "keyIdea": "先知性实用主义。正义是爱在公共生活中的面貌。黑人的自我肯定与政治勇气。"
    }
  },
  "stuart-hall": {
    "zh": {
      "name": "斯图亚特·霍尔",
      "dates": "1932–2014",
      "keyIdea": "文化研究。编码与解码。身份认同是我们被召唤去占据的位置。"
    }
  },
  "d-t-suzuki": {
    "zh": {
      "name": "铃木大拙",
      "dates": "1870–1966",
      "keyIdea": "禅是超越理智的直接体验。悟不可言传，只可指引。"
    }
  },
  "carl-jung": {
    "zh": {
      "name": "卡尔·荣格",
      "dates": "1875–1961",
      "keyIdea": "集体无意识。原型。直面阴影，走向个体化。"
    }
  },
  "mary-astell": {
    "zh": {
      "name": "玛丽·阿斯特尔",
      "dates": "1666–1731",
      "keyIdea": "理性无关性别。女性的教育权利。友谊是最真实的爱。"
    }
  },
  "sojourner-truth": {
    "zh": {
      "name": "索杰纳·特鲁思",
      "dates": "约1797–1883",
      "keyIdea": "难道我不是一个女人？真理穿透沉默而燃烧。信仰与自由不可分割。"
    }
  },
  "albert-schweitzer": {
    "zh": {
      "name": "阿尔贝特·史怀哲",
      "dates": "1875–1965",
      "keyIdea": "敬畏生命。伦理即无限的责任。神学、音乐、医学、使命。"
    }
  },
  "anaximander": {
    "zh": {
      "name": "阿那克西曼德",
      "dates": "约公元前610—546年",
      "keyIdea": "无限者（阿派朗）是万物之源——前苏格拉底时代最初的自然哲学。"
    }
  },
  "anaximenes": {
    "zh": {
      "name": "阿那克西美尼",
      "dates": "约公元前586—526年",
      "keyIdea": "气是万物的本原，通过凝聚与稀散化生一切现象。"
    }
  },
  "xenophanes": {
    "zh": {
      "name": "克塞诺芬尼",
      "dates": "约公元前570–478年",
      "keyIdea": "对拟人化神灵的怀疑；真理是近似，而非确定。"
    }
  },
  "zeno-of-elea": {
    "zh": {
      "name": "埃利亚的芝诺",
      "dates": "约公元前490–430年",
      "keyIdea": "运动的悖论——理性颠覆感官；实在是唯一且不变的。"
    }
  },
  "anaxagoras": {
    "zh": {
      "name": "阿那克萨哥拉",
      "dates": "约公元前500–428年",
      "keyIdea": "心智（nous）将无限混合的种子秩序化，构成宇宙。"
    }
  },
  "leucippus": {
    "zh": {
      "name": "留基伯",
      "dates": "约公元前5世纪",
      "keyIdea": "原子论之先驱——实在由虚空与运动中不可分割的原子构成。"
    }
  },
  "democritus": {
    "zh": {
      "name": "德谟克利特",
      "dates": "约公元前460—370年",
      "keyIdea": "原子论与愉悦的宁静；万物不过是原子与虚空。"
    }
  },
  "gorgias": {
    "zh": {
      "name": "高尔吉亚",
      "dates": "约公元前483—375年",
      "keyIdea": "无物存在；即便存在，亦不可知；即便可知，亦不可传达。"
    }
  },
  "antisthenes": {
    "zh": {
      "name": "安提斯泰尼",
      "dates": "约公元前445—365年",
      "keyIdea": "唯有德性足以成就幸福——犬儒学派之先驱，苏格拉底之挚友。"
    }
  },
  "cleanthes": {
    "zh": {
      "name": "克勒安忒斯",
      "dates": "约公元前330—230年",
      "keyIdea": "《宙斯颂》；斯多葛派的神意论与对宇宙秩序的顺从。"
    }
  },
  "chrysippus": {
    "zh": {
      "name": "克吕西波",
      "dates": "约公元前279—206年",
      "keyIdea": "斯多葛主义的第二位奠基人——命题逻辑、命运论与赞同学说。"
    }
  },
  "posidonius": {
    "zh": {
      "name": "波西多尼奥斯",
      "dates": "约公元前135—51年",
      "keyIdea": "中期斯多葛派的综合者——天文学、地理学与宇宙共感论。"
    }
  },
  "musonius-rufus": {
    "zh": {
      "name": "穆索尼乌斯·鲁弗斯",
      "dates": "约公元25—95年",
      "keyIdea": "爱比克泰德之师，斯多葛派学者——主张女性同样具备哲学能力。"
    }
  },
  "hierocles-the-stoic": {
    "zh": {
      "name": "斯多葛派的赫拉克利斯",
      "dates": "公元2世纪",
      "keyIdea": "亲缘关系论——道德关怀如同涟漪，由内向外扩展为同心圆。"
    }
  },
  "arcesilaus": {
    "zh": {
      "name": "阿尔克西劳斯",
      "dates": "约公元前316—前241年",
      "keyIdea": "学园怀疑主义的创始人——主张悬置判断，以或然性指导生活。"
    }
  },
  "ibn-khaldun": {
    "zh": {
      "name": "伊本·赫勒敦",
      "dates": "1332–1406",
      "keyIdea": "《历史绪论》——群体凝聚力（'asabiyyah）是王朝兴衰循环的根本动力。"
    }
  },
  "suhrawardi": {
    "zh": {
      "name": "苏赫拉瓦尔迪",
      "dates": "1154–1191",
      "keyIdea": "光照哲学——以光为形而上学的基本原素。"
    }
  },
  "al-jahiz": {
    "zh": {
      "name": "贾希兹",
      "dates": "约776–869",
      "keyIdea": "《动物之书》——关于适应性与言说社会学的早期观察。"
    }
  },
  "rabia-al-adawiyya": {
    "zh": {
      "name": "拉比娅·阿达维亚",
      "dates": "约717—801",
      "keyIdea": "苏菲之爱——为神而爱神，既不求天堂，亦不惧地狱。"
    }
  },
  "mansur-al-hallaj": {
    "zh": {
      "name": "曼苏尔·哈拉智",
      "dates": "约858—922",
      "keyIdea": "「我即真理」——消融于神；因此语而被处决。"
    }
  },
  "junayd-of-baghdad": {
    "zh": {
      "name": "巴格达的朱奈德",
      "dates": "~830–910",
      "keyIdea": "清醒的苏菲主义——经历消融（fanāʾ）之后重返尘世，携带对合一的领悟。"
    }
  },
  "bahya-ibn-paquda": {
    "zh": {
      "name": "巴希亚·伊本·帕库达",
      "dates": "~1050–1120",
      "keyIdea": "《心灵的职责》——内心的意向，乃犹太虔诚之核心。"
    }
  },
  "judah-halevi": {
    "zh": {
      "name": "犹大·哈列维",
      "dates": "~1075–1141",
      "keyIdea": "《可萨王书》——犹太民族的特殊性，高于普世哲学。"
    }
  },
  "hasdai-crescas": {
    "zh": {
      "name": "哈斯代·克雷斯卡斯",
      "dates": "约1340–1410",
      "keyIdea": "对亚里士多德的批判——以神圣之爱为本，意志自由为要。"
    }
  },
  "isaac-luria": {
    "zh": {
      "name": "以撒·鲁里亚",
      "dates": "1534–1572",
      "keyIdea": "鲁里亚卡巴拉——神圣收缩、器皿破碎与修复（提昆）。"
    }
  },
  "bhartrihari": {
    "zh": {
      "name": "婆罗诃梨诃利",
      "dates": "约5世纪",
      "keyIdea": "语音整体论（Sphota理论）——意义整体涌现；语言作为世界的敞开。"
    }
  },
  "dharmakirti": {
    "zh": {
      "name": "法称",
      "dates": "约600–660",
      "keyIdea": "佛教逻辑与认识论——重构知觉与推理。"
    }
  },
  "dignaga": {
    "zh": {
      "name": "陈那",
      "dates": "约480–540",
      "keyIdea": "《集量论》——佛教认识论之奠基者。"
    }
  },
  "asanga": {
    "zh": {
      "name": "无著",
      "dates": "约四世纪",
      "keyIdea": "瑜伽行派——唯识论；意识构建其所感知的世界。"
    }
  },
  "vasubandhu": {
    "zh": {
      "name": "世亲",
      "dates": "约四世纪",
      "keyIdea": "《二十唯识论》——以唯识论回应实在论的诘难。"
    }
  },
  "buddhaghosa": {
    "zh": {
      "name": "觉音",
      "dates": "约五世纪",
      "keyIdea": "《清净道论》——论清净之道；上座部佛教注疏大师。"
    }
  },
  "padmasambhava": {
    "zh": {
      "name": "莲花生大士",
      "dates": "约8世纪",
      "keyIdea": "藏传密宗奠基者——认识心性即本初觉知。"
    }
  },
  "atisha": {
    "zh": {
      "name": "阿底峡",
      "dates": "982–1054",
      "keyIdea": "三士道次第；以修心七义训练悲心。"
    }
  },
  "milarepa": {
    "zh": {
      "name": "密勒日巴",
      "dates": "约1052–1135",
      "keyIdea": "藏地瑜伽诗人——洞窟中吟唱的道歌；以解脱赎清杀业。"
    }
  },
  "longchenpa": {
    "zh": {
      "name": "龙钦巴",
      "dates": "1308–1364",
      "keyIdea": "大圆满祖师——本初清净，超越一切修习。"
    }
  },
  "patrul-rinpoche": {
    "zh": {
      "name": "巴珠仁波切",
      "dates": "1808–1887",
      "keyIdea": "《普贤上师言教》——以平实之语阐明前行法要。"
    }
  },
  "kumarajila": {
    "zh": {
      "name": "鸠摩罗什",
      "dates": "344–413",
      "keyIdea": "《法华经》与《金刚经》的译者——中国佛教之脊梁。"
    }
  },
  "zhiyi": {
    "zh": {
      "name": "智顗",
      "dates": "538–597",
      "keyIdea": "天台宗创始人——三谛圆融，相互含摄。"
    }
  },
  "fazang": {
    "zh": {
      "name": "法藏",
      "dates": "643–712",
      "keyIdea": "华严宗——因陀罗网；一微尘中含摄全体。"
    }
  },
  "linji-yixuan": {
    "zh": {
      "name": "临济义玄",
      "dates": "约810—866",
      "keyIdea": "临济宗禅——路遇佛则杀佛；本无一物可求。"
    }
  },
  "bankei-yotaku": {
    "zh": {
      "name": "盘珪永琢",
      "dates": "1622—1693",
      "keyIdea": "不生——你在一切见解生起之前、一切修行方法之先的本来面目。"
    }
  },
  "ikkyu-sojun": {
    "zh": {
      "name": "一休宗纯",
      "dates": "1394—1481",
      "keyIdea": "狂云禅——清酒、情人，与京都青楼中的顿悟。"
    }
  },
  "wonhyo": {
    "zh": {
      "name": "元晓",
      "dates": "617–686",
      "keyIdea": "韩国佛教的会通之学——饮于髑髅，因此而悟。"
    }
  },
  "jinul": {
    "zh": {
      "name": "知讷",
      "dates": "1158–1210",
      "keyIdea": "韩国禅宗——顿悟在先，渐修随后。"
    }
  },
  "wang-bi": {
    "zh": {
      "name": "王弼",
      "dates": "226–249",
      "keyIdea": "玄学对《易经》与《老子》的诠释——以无为本。"
    }
  },
  "guo-xiang": {
    "zh": {
      "name": "郭象",
      "dates": "约252–312",
      "keyIdea": "自然（自然而然）——万物各以自身为据；道无所作为。"
    }
  },
  "liezi": {
    "zh": {
      "name": "列子",
      "dates": "约公元前五世纪，传说人物",
      "keyIdea": "御风而行、无所畏惧——自我之幻与无为之道。"
    }
  },
  "han-yu": {
    "zh": {
      "name": "韩愈",
      "dates": "768–824",
      "keyIdea": "唐代儒学复兴——以道统对抗佛教。"
    }
  },
  "cheng-yi": {
    "zh": {
      "name": "程颐",
      "dates": "1033–1107",
      "keyIdea": "格物穷理——理学之学即道德修养之功。"
    }
  },
  "cheng-hao": {
    "zh": {
      "name": "程颢",
      "dates": "1032–1085",
      "keyIdea": "仁即与万物同体；神秘主义的儒学进路。"
    }
  },
  "wang-fuzhi": {
    "zh": {
      "name": "王夫之",
      "dates": "1619–1692",
      "keyIdea": "反寂静主义的儒者——气是唯一的实在；历史即气之化成。"
    }
  },
  "dai-zhen": {
    "zh": {
      "name": "戴震",
      "dates": "1724–1777",
      "keyIdea": "考据之学——情感经由审察而通达义理，而非为义理所窒。"
    }
  },
  "kang-youwei": {
    "zh": {
      "name": "康有为",
      "dates": "1858–1927",
      "keyIdea": "大同——面向近代中国的乌托邦改良儒学。"
    }
  },
  "liang-shuming": {
    "zh": {
      "name": "梁漱溟",
      "dates": "1893–1988",
      "keyIdea": "三种文化之比较——中、印、西三条人生路向。"
    }
  },
  "mou-zongsan": {
    "zh": {
      "name": "牟宗三",
      "dates": "1909–1995",
      "keyIdea": "当代新儒家——以智的直觉建构道德形上学。"
    }
  },
  "tu-weiming": {
    "zh": {
      "name": "杜维明",
      "dates": "生于1940年",
      "keyIdea": "儒家人文主义与全球伦理的对话。"
    }
  },
  "montaigne": {
    "zh": {
      "name": "蒙田",
      "dates": "1533–1592",
      "keyIdea": "《随笔集》——\"我知道什么？\"——怀疑主义化为自我画像。"
    }
  },
  "galileo-galilei": {
    "zh": {
      "name": "伽利略·伽利雷",
      "dates": "1564–1642",
      "keyIdea": "数学是自然书写所用的语言——然而在威胁之下，他收回了这一信念。"
    }
  },
  "johannes-kepler": {
    "zh": {
      "name": "约翰内斯·开普勒",
      "dates": "1571–1630",
      "keyIdea": "行星依循法则而舞——神秘主义与精确测量并行共存。"
    }
  },
  "hugo-grotius": {
    "zh": {
      "name": "雨果·格劳秀斯",
      "dates": "1583–1645",
      "keyIdea": "自然法与国际公法——以共同理性为基础建立和平。"
    }
  },
  "margaret-cavendish": {
    "zh": {
      "name": "玛格丽特·卡文迪什",
      "dates": "1623–1673",
      "keyIdea": "活力论唯物主义——物质自身贯通感知与理性。"
    }
  },
  "anne-conway": {
    "zh": {
      "name": "安妮·康韦",
      "dates": "1631–1679",
      "keyIdea": "《原理》——一元实体，具有无限层级的渐变；对莱布尼茨影响深远。"
    }
  },
  "emilie-du-chatelet": {
    "zh": {
      "name": "埃米莉·杜·夏特莱",
      "dates": "1706–1749",
      "keyIdea": "以法语诠释牛顿——以mv²定义能量；并为女性思想之权利张目。"
    }
  },
  "cudworth": {
    "zh": {
      "name": "卡德沃思",
      "dates": "1617–1688",
      "keyIdea": "剑桥柏拉图主义者——永恒的道德真理与可塑的自然。"
    }
  },
  "henry-more": {
    "zh": {
      "name": "亨利·莫尔",
      "dates": "1614–1687",
      "keyIdea": "自然之灵——一位笛卡尔主义者，却深信鬼魂乃真实的经验材料。"
    }
  },
  "spinozism-in-bayle": {
    "zh": {
      "name": "培尔眼中的斯宾诺莎主义",
      "dates": "1647–1706",
      "keyIdea": "皮埃尔·培尔——以充满怀疑论词条的辞典武装了启蒙运动。"
    }
  },
  "pierre-bayle": {
    "zh": {
      "name": "皮埃尔·培尔",
      "dates": "1647–1706",
      "keyIdea": "《历史与批判辞典》——以怀疑论为撬动宽容之楔。"
    }
  },
  "samuel-pufendorf": {
    "zh": {
      "name": "萨缪尔·普芬道夫",
      "dates": "1632–1694",
      "keyIdea": "义务奠基于社会性——道德实体凌驾于自然躯体之上。"
    }
  },
  "anthony-ashley-cooper-shaftesbury": {
    "zh": {
      "name": "安东尼·阿什利·库珀（沙夫茨伯里）",
      "dates": "1671–1713",
      "keyIdea": "道德感——德性即情感的和谐。"
    }
  },
  "francis-hutcheson": {
    "zh": {
      "name": "弗朗西斯·哈奇森",
      "dates": "1694–1746",
      "keyIdea": "道德感学派——仁爱为赞许之正当对象。"
    }
  },
  "bernard-mandeville": {
    "zh": {
      "name": "伯纳德·曼德维尔",
      "dates": "1670–1733",
      "keyIdea": "《蜜蜂的寓言》——私人恶行，公共利益。"
    }
  },
  "adam-smith": {
    "zh": {
      "name": "亚当·斯密",
      "dates": "1723–1790",
      "keyIdea": "《道德情操论》——每个人内心那位公正的旁观者。"
    }
  },
  "joseph-butler": {
    "zh": {
      "name": "约瑟夫·巴特勒",
      "dates": "1692–1752",
      "keyIdea": "良知是人性的正当主宰。"
    }
  },
  "thomas-reid": {
    "zh": {
      "name": "托马斯·里德",
      "dates": "1710–1796",
      "keyIdea": "常识——一切哲学必须预先承认的根本原则。"
    }
  },
  "dugald-stewart": {
    "zh": {
      "name": "杜格尔德·斯图尔特",
      "dates": "1753–1828",
      "keyIdea": "苏格兰常识哲学的系统化——心灵哲学。"
    }
  },
  "maine-de-biran": {
    "zh": {
      "name": "曼恩·德·比朗",
      "dates": "1766–1824",
      "keyIdea": "努力与意愿——自我得以显现的切身源泉。"
    }
  },
  "joseph-de-maistre": {
    "zh": {
      "name": "约瑟夫·德·迈斯特",
      "dates": "1753–1821",
      "keyIdea": "反动的王权与祭坛——天命寓于暴烈的历史之中。"
    }
  },
  "edmund-burke": {
    "zh": {
      "name": "埃德蒙·柏克",
      "dates": "1729–1797",
      "keyIdea": "《法国革命论》——传统乃凝缩而成的智慧。"
    }
  },
  "tom-paine": {
    "zh": {
      "name": "托马斯·潘恩",
      "dates": "1737–1809",
      "keyIdea": "《人权论》——以常识对抗君主专制与教条桎梏。"
    }
  },
  "william-godwin": {
    "zh": {
      "name": "威廉·葛德文",
      "dates": "1756–1836",
      "keyIdea": "《政治正义论》——以理性通向无政府主义；真理消融强制。"
    }
  },
  "joseph-priestley": {
    "zh": {
      "name": "约瑟夫·普利斯特里",
      "dates": "1733–1804",
      "keyIdea": "必然性、唯物论、氧气——一位一神论激进派化学家。"
    }
  },
  "condorcet": {
    "zh": {
      "name": "孔多塞",
      "dates": "1743–1794",
      "keyIdea": "人类进步之素描——在逃避断头台的藏匿中写就的乐观主义。"
    }
  },
  "alexander-von-humboldt": {
    "zh": {
      "name": "亚历山大·冯·洪堡",
      "dates": "1769–1859",
      "keyIdea": "宇宙如交织之网——由地理学演化而来的生态学思想。"
    }
  },
  "wilhelm-von-humboldt": {
    "zh": {
      "name": "威廉·冯·洪堡",
      "dates": "1767–1835",
      "keyIdea": "语言塑造思想——教化（Bildung）即自由养成之个性。"
    }
  },
  "friedrich-schleiermacher": {
    "zh": {
      "name": "弗里德里希·施莱尔马赫",
      "dates": "1768–1834",
      "keyIdea": "宗教即绝对依赖之情感。"
    }
  },
  "goethe": {
    "zh": {
      "name": "歌德",
      "dates": "1749–1832",
      "keyIdea": "极性与强化——以诗人之眼观照自然。"
    }
  },
  "friedrich-schlegel": {
    "zh": {
      "name": "弗里德里希·施莱格尔",
      "dates": "1772–1829",
      "keyIdea": "浪漫主义断片——反讽即从任何固定观点中获得自由。"
    }
  },
  "novalis": {
    "zh": {
      "name": "诺瓦利斯",
      "dates": "1772–1801",
      "keyIdea": "《夜的颂歌》——魔幻唯心主义；万物皆为象征。"
    }
  },
  "madame-de-stael": {
    "zh": {
      "name": "斯塔尔夫人",
      "dates": "1766–1817",
      "keyIdea": "《论德意志》——浪漫主义在法国的传播；热情作为一种政治力量。"
    }
  },
  "adam-muller": {
    "zh": {
      "name": "亚当·米勒",
      "dates": "1779–1829",
      "keyIdea": "浪漫保守主义——有机国家对抗原子式自由主义。"
    }
  },
  "ralph-waldo-emerson": {
    "zh": {
      "name": "拉尔夫·瓦尔多·爱默生",
      "dates": "1803–1882",
      "keyIdea": "自我依赖——灵魂拒绝一切归属，唯守其本真。"
    }
  },
  "henry-david-thoreau": {
    "zh": {
      "name": "亨利·大卫·梭罗",
      "dates": "1817–1862",
      "keyIdea": "《瓦尔登湖》——简朴，再简朴；良知高于成文法。"
    }
  },
  "margaret-fuller": {
    "zh": {
      "name": "玛格丽特·富勒",
      "dates": "1810–1850",
      "keyIdea": "《十九世纪的女性》——每一个灵魂皆自我成全。"
    }
  },
  "alexis-de-tocqueville": {
    "zh": {
      "name": "阿历克西·德·托克维尔",
      "dates": "1805–1859",
      "keyIdea": "《论美国的民主》——平等的诱惑与其温柔的专制。"
    }
  },
  "john-henry-newman": {
    "zh": {
      "name": "约翰·亨利·纽曼",
      "dates": "1801–1890",
      "keyIdea": "《赞同的语法》——真正的确信属于完整的人，而非属于命题。"
    }
  },
  "walter-pater": {
    "zh": {
      "name": "沃尔特·佩特",
      "dates": "1839–1894",
      "keyIdea": "永远燃烧着坚硬如宝石般的火焰——审美生活即伦理。"
    }
  },
  "f-h-bradley": {
    "zh": {
      "name": "F.H. 布拉德雷",
      "dates": "1846–1924",
      "keyIdea": "《现象与实在》——关系自相矛盾；唯有绝对者方为真实。"
    }
  },
  "t-h-green": {
    "zh": {
      "name": "T.H. 格林",
      "dates": "1836–1882",
      "keyIdea": "理想主义伦理学——以共同善为国家行动的正当目的。"
    }
  },
  "henry-sidgwick": {
    "zh": {
      "name": "亨利·西季威克",
      "dates": "1838–1900",
      "keyIdea": "《伦理学方法》——对功利主义、利己主义与直觉主义的审慎比较。"
    }
  },
  "rosa-luxemburg": {
    "zh": {
      "name": "罗莎·卢森堡",
      "dates": "1871–1919",
      "keyIdea": "群众的自发性；社会主义或野蛮状态。"
    }
  },
  "pyotr-kropotkin": {
    "zh": {
      "name": "彼得·克鲁泡特金",
      "dates": "1842–1921",
      "keyIdea": "互助论——合作作为进化的一种动因。"
    }
  },
  "mikhail-bakunin": {
    "zh": {
      "name": "米哈伊尔·巴枯宁",
      "dates": "1814–1876",
      "keyIdea": "无政府主义的激情——摧毁国家，恢复自发的公社。"
    }
  },
  "max-stirner": {
    "zh": {
      "name": "麦克斯·施蒂纳",
      "dates": "1806–1856",
      "keyIdea": "《唯一者及其所有物》——除我自身之外，一切事业皆是游魂。"
    }
  },
  "jeremy-bentham": {
    "zh": {
      "name": "杰里米·边沁",
      "dates": "1748–1832",
      "keyIdea": "最大多数人的最大幸福——以快乐计算为法则。"
    }
  },
  "auguste-blanqui": {
    "zh": {
      "name": "奥古斯特·布朗基",
      "dates": "1805–1881",
      "keyIdea": "以革命为业——在囚室中仰望星空，以求永恒。"
    }
  },
  "emile-durkheim": {
    "zh": {
      "name": "埃米尔·涂尔干",
      "dates": "1858–1917",
      "keyIdea": "集体意识——社会先于个人而存在，并塑造个人。"
    }
  },
  "max-weber": {
    "zh": {
      "name": "马克斯·韦伯",
      "dates": "1864–1920",
      "keyIdea": "新教伦理——祛魅理性的铁笼。"
    }
  },
  "vilfredo-pareto": {
    "zh": {
      "name": "维尔弗雷多·帕累托",
      "dates": "1848–1923",
      "keyIdea": "残基与衍生论——大多数推理不过是情感的理性化。"
    }
  },
  "lev-shestov": {
    "zh": {
      "name": "列夫·舍斯托夫",
      "dates": "1866–1938",
      "keyIdea": "雅典与耶路撒冷——理性无权裁判信仰的荒诞。"
    }
  },
  "ban-zhao": {
    "zh": {
      "name": "班昭",
      "dates": "约45–116",
      "keyIdea": "《女诫》——汉代女学者所著的儒家女德规范之书。"
    }
  },
  "diotima-of-mantinea": {
    "zh": {
      "name": "曼提尼亚的狄俄提玛",
      "dates": "约公元前5世纪",
      "keyIdea": "《会饮》中苏格拉底的启蒙者——爱欲由感官形体逐级升华，直抵美本身的理念。"
    }
  },
  "aspasia-of-miletus": {
    "zh": {
      "name": "米利都的阿斯帕西娅",
      "dates": "约公元前470—400年",
      "keyIdea": "伯里克利时代雅典的修辞学家；据载曾为苏格拉底之师。"
    }
  },
  "themistoclea": {
    "zh": {
      "name": "忒弥斯托克勒亚",
      "dates": "约公元前6世纪",
      "keyIdea": "德尔斐女祭司，毕达哥拉斯称其为自己伦理学上的授业之师。"
    }
  },
  "sappho": {
    "zh": {
      "name": "萨福",
      "dates": "约公元前630—570年",
      "keyIdea": "第十位缪斯——欲望作为重新排列宇宙秩序的力量。"
    }
  },
  "macrina-the-younger": {
    "zh": {
      "name": "小玛克里娜",
      "dates": "约324–379",
      "keyIdea": "《论灵魂与复活》——在兄长临终床边展开的基督教柏拉图主义。"
    }
  },
  "lalleshwari-lal-ded": {
    "zh": {
      "name": "拉勒什瓦里（拉尔·德德）",
      "dates": "约1320–1392",
      "keyIdea": "克什米尔湿婆派神秘主义者——所作诗句称为vakhs，口耳相传，不依典籍。"
    }
  },
  "mirabai": {
    "zh": {
      "name": "米拉拜",
      "dates": "~1498–1547",
      "keyIdea": "克里希纳的新娘——以虔诚颂歌消融种姓与家室之界。"
    }
  },
  "sor-juana-ines-de-la-cruz": {
    "zh": {
      "name": "索尔·胡安娜·伊内斯·德拉克鲁斯",
      "dates": "1648–1695",
      "keyIdea": "墨西哥修女哲学家——以《答辩书》捍卫女性求学之权。"
    }
  },
  "catharine-macaulay": {
    "zh": {
      "name": "凯瑟琳·麦考利",
      "dates": "1731–1791",
      "keyIdea": "《英格兰史》——共和美德与女性平等才能论。"
    }
  },
  "charles-mills": {
    "zh": {
      "name": "查尔斯·米尔斯",
      "dates": "1951–2021",
      "keyIdea": "《种族契约》——自由主义政治理论的根本揭示。"
    }
  },
  "tommie-shelby": {
    "zh": {
      "name": "汤米·谢尔比",
      "dates": "生于1967年",
      "keyIdea": "《黑暗贫民窟》——结构性不正义的政治哲学。"
    }
  },
  "joanna-macy": {
    "zh": {
      "name": "乔安娜·梅西",
      "dates": "生于1929年",
      "keyIdea": "「重新连结」的工作——以绝望为门径，通向生态行动。"
    }
  },
  "david-bohm": {
    "zh": {
      "name": "戴维·玻姆",
      "dates": "1917—1992",
      "keyIdea": "《整体性与隐缠序》——在最深层次上探究物理学与对话。"
    }
  },
  "krishna-chandra-bhattacharya": {
    "zh": {
      "name": "克里希纳·钱德拉·巴塔查里亚",
      "dates": "1875–1949",
      "keyIdea": "主体即自由——印度康德式现象学。"
    }
  },
  "a-k-coomaraswamy": {
    "zh": {
      "name": "A·K·库马拉斯瓦米",
      "dates": "1877–1947",
      "keyIdea": "传统主义——神圣艺术作为形而上学知识的承载媒介。"
    }
  },
  "rene-guenon": {
    "zh": {
      "name": "勒内·盖农",
      "dates": "1886–1951",
      "keyIdea": "现代世界的危机——回归原初传统。"
    }
  },
  "frithjof-schuon": {
    "zh": {
      "name": "弗里特霍夫·舒昂",
      "dates": "1907–1998",
      "keyIdea": "宗教的超验统一——长青哲学。"
    }
  },
  "seyyed-hossein-nasr": {
    "zh": {
      "name": "赛义德·侯赛因·纳斯尔",
      "dates": "生于1933年",
      "keyIdea": "伊斯兰长青主义——脱离神圣的科学是形而上学的暴力。"
    }
  },
  "ali-shariati": {
    "zh": {
      "name": "阿里·沙里亚蒂",
      "dates": "1933–1977",
      "keyIdea": "红色什叶派——革命伊斯兰对抗西方的异化。"
    }
  },
  "muhammad-iqbal": {
    "zh": {
      "name": "穆罕默德·伊克巴尔",
      "dates": "1877–1938",
      "keyIdea": "《伊斯兰宗教思想的重建》——自我作为上帝的协作者。"
    }
  },
  "tariq-ramadan": {
    "zh": {
      "name": "塔里克·拉马丹",
      "dates": "生于1962年",
      "keyIdea": "欧洲伊斯兰——在不被世俗主义削平的前提下推动内部改革。"
    }
  },
  "wang-hui": {
    "zh": {
      "name": "汪晖",
      "dates": "生于1959年",
      "keyIdea": "现代中国思想的兴起——从传统内部重新审视现代性。"
    }
  },
  "li-zehou": {
    "zh": {
      "name": "李泽厚",
      "dates": "1930–2021",
      "keyIdea": "积淀说——实践的长期积累形成审美与道德的感性。"
    }
  },
  "karatani-kojin": {
    "zh": {
      "name": "柄谷行人",
      "dates": "生于1941年",
      "keyIdea": "交换样式论——资本与馈赠作为一对政治史的范畴。"
    }
  },
  "maruyama-masao": {
    "zh": {
      "name": "丸山真男",
      "dates": "1914–1996",
      "keyIdea": "从封建到近代——日本政治思想的谱系探源。"
    }
  },
  "chen-duxiu": {
    "zh": {
      "name": "陈独秀",
      "dates": "1879–1942",
      "keyIdea": "中国共产主义的奠基者——《新青年》对科学与民主的呼唤。"
    }
  },
  "tan-sitong": {
    "zh": {
      "name": "谭嗣同",
      "dates": "1865–1898",
      "keyIdea": "仁学——以仁为宇宙之以太；百日维新的殉道者。"
    }
  },
  "helio-oiticica": {
    "zh": {
      "name": "埃利奥·奥伊蒂西卡",
      "dates": "1937–1980",
      "keyIdea": "热带主义美学——披挂装置（parangolé）作为可穿戴的命题。"
    }
  },
  "paulo-freire": {
    "zh": {
      "name": "保罗·弗莱雷",
      "dates": "1921–1997",
      "keyIdea": "《被压迫者教育学》——教育即自由的实践。"
    }
  },
  "enrique-dussel": {
    "zh": {
      "name": "恩里克·杜塞尔",
      "dates": "1934–2023",
      "keyIdea": "解放哲学——殖民处境中的他者，乃伦理之首位。"
    }
  },
  "jose-carlos-mariategui": {
    "zh": {
      "name": "何塞·卡洛斯·马里亚特吉",
      "dates": "1894–1930",
      "keyIdea": "《关于秘鲁国情的七篇论文》——植根于阿伊鲁公社的印第安共产主义。"
    }
  },
  "octavio-paz": {
    "zh": {
      "name": "奥克塔维奥·帕斯",
      "dates": "1914–1998",
      "keyIdea": "《孤独的迷宫》——面具、他性与墨西哥人的生存处境。"
    }
  },
  "bartolome-de-las-casas": {
    "zh": {
      "name": "巴托洛梅·德·拉斯·卡萨斯",
      "dates": "1484–1566",
      "keyIdea": "《印第安人的保护者》——坚持主张原住民族的人性尊严。"
    }
  },
  "robin-wall-kimmerer": {
    "zh": {
      "name": "罗宾·沃尔·基默尔",
      "dates": "生于1953年",
      "keyIdea": "《编织香草》——以生命语法持守植物学的意义。"
    }
  },
  "glen-coulthard": {
    "zh": {
      "name": "格伦·库尔塔德",
      "dates": "生于1974年",
      "keyIdea": "《红皮肤，白面具》——原住民复兴作为反殖民实践。"
    }
  },
  "leanne-betasamosake-simpson": {
    "zh": {
      "name": "莱安妮·贝塔萨莫萨克·辛普森",
      "dates": "生于1971年",
      "keyIdea": "《一如既往》——尼什纳贝格智慧与民族复兴。"
    }
  },
  "whitehead-s-pupil-david-ray-griffin": {
    "zh": {
      "name": "怀特海的学生——大卫·雷·格里芬",
      "dates": "1939—2022",
      "keyIdea": "过程神学——上帝与创造力在事件时间中共同演化。"
    }
  },
  "galen-strawson": {
    "zh": {
      "name": "盖伦·斯特劳森",
      "dates": "1952年生",
      "keyIdea": "泛心论——经验贯穿一切，而非在某个门槛处凭空涌现。"
    }
  },
  "andy-clark": {
    "zh": {
      "name": "安迪·克拉克",
      "dates": "1957年生",
      "keyIdea": "延展心智——认知渗出自身，流入笔、纸与手机之中。"
    }
  },
  "alva-noe": {
    "zh": {
      "name": "阿尔瓦·诺伊",
      "dates": "1964年生",
      "keyIdea": "《走出我们的脑袋》——感知是我们所做之事，而非我们所拥有之物。"
    }
  },
  "evan-thompson": {
    "zh": {
      "name": "埃文·汤普森",
      "dates": "生于1962年",
      "keyIdea": "生命中的心智——生成主义，意识的自创生生物学。"
    }
  },
  "francisco-varela": {
    "zh": {
      "name": "弗朗西斯科·瓦雷拉",
      "dates": "1946—2001",
      "keyIdea": "自创生——作为自我生成循环因果性的生物学。"
    }
  },
  "nick-bostrom": {
    "zh": {
      "name": "尼克·博斯特罗姆",
      "dates": "生于1973年",
      "keyIdea": "《超级智能》——目标错位的优化所引发的存在性风险。"
    }
  },
  "toby-ord": {
    "zh": {
      "name": "托比·奥德",
      "dates": "生于1979年",
      "keyIdea": "《悬崖边缘》——人类的长远未来作为一项道德范畴。"
    }
  },
  "william-macaskill": {
    "zh": {
      "name": "威廉·麦卡斯基尔",
      "dates": "生于1987年",
      "keyIdea": "有效利他主义与长期主义——以最严格的方法行最大之善。"
    }
  },
  "hilary-greaves": {
    "zh": {
      "name": "希拉里·格里夫斯",
      "dates": "生于1978年",
      "keyIdea": "长期主义——当下对广阔未来的义务。"
    }
  },
  "agnes-callard": {
    "zh": {
      "name": "阿格尼斯·卡拉德",
      "dates": "生于1976年",
      "keyIdea": "志向——成为那个已然拥有她所追求之价值的人。"
    }
  },
  "kieran-setiya": {
    "zh": {
      "name": "基兰·塞提亚",
      "dates": "生于1968年",
      "keyIdea": "中年——当你拥有的时间多于理由时，该向往什么。"
    }
  },
  "susan-wolf": {
    "zh": {
      "name": "苏珊·沃尔夫",
      "dates": "生于1952年",
      "keyIdea": "生命的意义——投身于具有客观价值的事业。"
    }
  },
  "cheshire-calhoun": {
    "zh": {
      "name": "切郡·卡尔霍恩",
      "dates": "生于1953年",
      "keyIdea": "女性主义哲学——道德失范、希望，以及何事值得为之。"
    }
  },
  "talia-mae-bettcher": {
    "zh": {
      "name": "塔利亚·梅·贝彻",
      "dates": "生于1972年",
      "keyIdea": "跨性别哲学——个体对自身性别的第一人称权威。"
    }
  },
  "helen-frowe": {
    "zh": {
      "name": "海伦·弗罗",
      "dates": "生于1979年",
      "keyIdea": "正义战争再审视——防卫性责任归咎与个体道德地位。"
    }
  },
  "jeff-mcmahan": {
    "zh": {
      "name": "杰夫·麦克马汉",
      "dates": "生于1954年",
      "keyIdea": "杀戮伦理学——生命边界情形中的道德地位问题。"
    }
  },
  "david-velleman": {
    "zh": {
      "name": "大卫·维勒曼",
      "dates": "生于1952年",
      "keyIdea": "自我理解作为能动性的形式；自我的叙事。"
    }
  },
  "tamar-schapiro": {
    "zh": {
      "name": "塔玛·夏皮罗",
      "dates": "生于1965年",
      "keyIdea": "倾向作为意志的原料；由理由重塑的能动性。"
    }
  },
  "jay-garfield": {
    "zh": {
      "name": "杰伊·加菲尔德",
      "dates": "生于1955年",
      "keyIdea": "介入佛教——以中观之眼审视分析哲学。"
    }
  },
  "owen-flanagan": {
    "zh": {
      "name": "欧文·弗拉纳根",
      "dates": "生于1949年",
      "keyIdea": "自然化伦理学——以生物学为基础的道德心理学。"
    }
  },
  "ruth-millikan": {
    "zh": {
      "name": "露丝·米利肯",
      "dates": "生于1933年",
      "keyIdea": "生物语义学——意义内容作为进化而来的固有功能。"
    }
  },
  "jenann-ismael": {
    "zh": {
      "name": "杰南·伊斯梅尔",
      "dates": "生于1968年",
      "keyIdea": "自我作为时间性模式——物理学与第一人称经验的交汇。"
    }
  },
  "kit-fine": {
    "zh": {
      "name": "基特·法恩",
      "dates": "生于1946年",
      "keyIdea": "本质、依存与碎片的本体论。"
    }
  },
  "timothy-williamson": {
    "zh": {
      "name": "蒂莫西·威廉森",
      "dates": "生于1955年",
      "keyIdea": "知识优先——以知晓作为不可分析的出发点。"
    }
  },
  "crispin-wright": {
    "zh": {
      "name": "克里斯平·赖特",
      "dates": "生于1942年",
      "keyIdea": "实在论之追问——意义、真理与遵循规则。"
    }
  },
  "frank-jackson": {
    "zh": {
      "name": "弗兰克·杰克逊",
      "dates": "生于1943年",
      "keyIdea": "玛丽之室——物理主义对红色之红所遗漏的那一面。"
    }
  },
  "cora-diamond": {
    "zh": {
      "name": "科拉·戴蒙德",
      "dates": "生于1937年",
      "keyIdea": "《现实主义精神》——阅读维特根斯坦，以道德眼光阅读生命。"
    }
  },
  "talbot-brewer": {
    "zh": {
      "name": "塔尔博特·布鲁尔",
      "dates": "生于1967年",
      "keyIdea": "《伦理学的重拾》——由理解所陶冶的欲望。"
    }
  },
  "sarah-buss": {
    "zh": {
      "name": "萨拉·巴斯",
      "dates": "生于1953年",
      "keyIdea": "自主行动——自我治理的能动性之条件。"
    }
  },
  "sobonfu-some": {
    "zh": {
      "name": "索邦富·索梅",
      "dates": "1969—2017",
      "keyIdea": "西非达加拉族教师——悲悼仪式与社群的亲密性。"
    }
  },
  "malidoma-patrice-some": {
    "zh": {
      "name": "马利多马·帕特里斯·索美",
      "dates": "1956–2021",
      "keyIdea": "《水与灵》——启蒙仪式作为归返更广阔自我的回乡之旅。"
    }
  },
  "john-mbiti": {
    "zh": {
      "name": "约翰·姆比提",
      "dates": "1931–2019",
      "keyIdea": "《非洲宗教与哲学》——\"我存在，因为我们存在。\""
    }
  },
  "paulin-hountondji": {
    "zh": {
      "name": "保兰·洪通吉",
      "dates": "1942–2024",
      "keyIdea": "《非洲哲学：神话与现实》——以书写话语超越民族哲学。"
    }
  },
  "mogobe-ramose": {
    "zh": {
      "name": "莫戈贝·拉莫塞",
      "dates": "生于1949年",
      "keyIdea": "以乌班图诠释非洲哲学——整体性作为关系性存在论。"
    }
  },
  "lewis-gordon": {
    "zh": {
      "name": "刘易斯·戈登",
      "dates": "生于1962年",
      "keyIdea": "非洲裔存在主义哲学——法农、反黑人世界与身体的活生生经验。"
    }
  },
  "nkiru-nzegwu": {
    "zh": {
      "name": "恩基鲁·恩泽格武",
      "dates": "生于1953年",
      "keyIdea": "非洲性别、母性与伊博双性政体。"
    }
  },
  "oyeronke-oyewumi": {
    "zh": {
      "name": "奥耶荣凯·奥耶乌米",
      "dates": "生于1957年",
      "keyIdea": "《女性的发明》——无性别范畴的约鲁巴社会。"
    }
  },
  "edouard-glissant": {
    "zh": {
      "name": "爱德华·格利桑",
      "dates": "1928–2011",
      "keyIdea": "《关系诗学》——论晦暗性与群岛式的不被知晓之权利。"
    }
  },
  "suzanne-cesaire": {
    "zh": {
      "name": "苏珊·塞泽尔",
      "dates": "1915–1966",
      "keyIdea": "《热带》——马提尼克岛上的超现实主义与去殖民化的想象力。"
    }
  },
  "c-l-r-james": {
    "zh": {
      "name": "C.L.R.詹姆斯",
      "dates": "1901–1989",
      "keyIdea": "《黑色雅各宾派》——奴隶们如何以自身之力缔造了一个共和国。"
    }
  },
  "pierre-simon-laplace": {
    "zh": {
      "name": "皮埃尔-西蒙·拉普拉斯",
      "dates": "1749–1827",
      "keyIdea": "天体力学；那个知晓一切位置、洞见一切未来的妖灵。"
    }
  },
  "carl-friedrich-gauss": {
    "zh": {
      "name": "卡尔·弗里德里希·高斯",
      "dates": "1777–1855",
      "keyIdea": "《算术研究》——关于非欧几何的直觉，静静压在他的案底。"
    }
  },
  "bernhard-riemann": {
    "zh": {
      "name": "贝恩哈德·黎曼",
      "dates": "1826–1866",
      "keyIdea": "论几何学所依据的假设——空间作为可度量的流形。"
    }
  },
  "charles-darwin": {
    "zh": {
      "name": "查尔斯·达尔文",
      "dates": "1809–1882",
      "keyIdea": "《物种起源》——渐变中的传承；哲学之锤。"
    }
  },
  "alfred-russel-wallace": {
    "zh": {
      "name": "阿尔弗雷德·拉塞尔·华莱士",
      "dates": "1823–1913",
      "keyIdea": "自然选择的共同发现者；人类一面则归于唯灵论。"
    }
  },
  "gregor-mendel": {
    "zh": {
      "name": "格雷戈尔·孟德尔",
      "dates": "1822–1884",
      "keyIdea": "修道院园圃中的豌豆——离散遗传由此发现。"
    }
  },
  "henri-poincare": {
    "zh": {
      "name": "昂利·庞加莱",
      "dates": "1854–1912",
      "keyIdea": "约定主义——几何学是为契合而选择，而非从自然中发现。"
    }
  },
  "pierre-duhem": {
    "zh": {
      "name": "皮埃尔·迪昂",
      "dates": "1861–1916",
      "keyIdea": "物理理论的目的与结构——理论由数据所不充分决定。"
    }
  },
  "albert-einstein": {
    "zh": {
      "name": "阿尔伯特·爱因斯坦",
      "dates": "1879–1955",
      "keyIdea": "相对论——上帝不掷骰子；宇宙向想象力敞开。"
    }
  },
  "niels-bohr": {
    "zh": {
      "name": "尼尔斯·玻尔",
      "dates": "1885–1962",
      "keyIdea": "互补性——波与粒子因所问之问题而并存于一体。"
    }
  },
  "werner-heisenberg": {
    "zh": {
      "name": "维尔纳·海森堡",
      "dates": "1901–1976",
      "keyIdea": "不确定性——我们所知依赖于我们所问。"
    }
  },
  "erwin-schrodinger": {
    "zh": {
      "name": "埃尔温·薛定谔",
      "dates": "1887–1961",
      "keyIdea": "《生命是什么？》——秩序从秩序中涌现，跨越物理学的边界。"
    }
  },
  "wolfgang-pauli": {
    "zh": {
      "name": "沃尔夫冈·泡利",
      "dates": "1900–1958",
      "keyIdea": "不相容原理；与荣格关于共时性的通信往来。"
    }
  },
  "sigmund-freud": {
    "zh": {
      "name": "西格蒙德·弗洛伊德",
      "dates": "1856–1939",
      "keyIdea": "无意识；文明建立于被压抑的欲望之上。"
    }
  },
  "wilhelm-wundt": {
    "zh": {
      "name": "威廉·冯特",
      "dates": "1832–1920",
      "keyIdea": "实验心理学的奠基者；民族的社会心理。"
    }
  },
  "edward-o-wilson": {
    "zh": {
      "name": "爱德华·O·威尔逊",
      "dates": "1929–2021",
      "keyIdea": "知识大融通——自然科学各领域知识的统一。"
    }
  },
  "stephen-jay-gould": {
    "zh": {
      "name": "斯蒂芬·杰·古尔德",
      "dates": "1941–2002",
      "keyIdea": "不重叠教权论；间断平衡论；历史演变中的偶然性。"
    }
  },
  "lynn-margulis": {
    "zh": {
      "name": "林恩·马古利斯",
      "dates": "1938–2011",
      "keyIdea": "共生起源说——细胞套叠于细胞之中；竞争并非生命的全部故事。"
    }
  }
};
// ─── END gen-translate PHILOSOPHERS_I18N ───

/** Overlay translated fields onto a PhilosopherEntry for the given locale.
 *  Keyed by slug (philosopherSlug(name)). Falls back to English per field. */
export function localizePhilosopher(
  p: PhilosopherEntry,
  slug: string,
  locale: Locale,
): PhilosopherEntry {
  if (locale === 'en') return p;
  const o = PHILOSOPHERS_I18N[slug]?.[locale];
  if (!o) return p;
  return {
    ...p,
    name: o.name ?? p.name,
    dates: o.dates ?? p.dates,
    keyIdea: o.keyIdea ?? p.keyIdea,
  };
}
