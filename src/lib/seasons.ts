/*
 * As 72 microestações (七十二候, shichijūni kō) do calendário japonês.
 *
 * O ano se divide em 24 termos solares e cada um deles em três kō de
 * cerca de cinco dias — 72 recortes minúsculos do ano, cada um com um
 * nome que descreve uma única coisa acontecendo na natureza. É a mesma
 * ideia que o app inteiro persegue: tempo como algo que passa e se
 * observa, não como número.
 *
 * Sobre as datas: elas derivam dos termos solares e variam em torno de
 * um dia conforme o ano. Aqui ficam fixas e aproximadas, que é o padrão
 * para uso decorativo — ninguém planta arroz com base neste rodapé.
 *
 * A lista está em ordem de calendário (janeiro a dezembro), e não na
 * ordem tradicional (que começa no risshun, em fevereiro), porque assim
 * a busca pela microestação vigente é uma varredura simples.
 */

export interface Microseason {
  /** Mês (1-12) e dia em que a microestação começa. */
  month: number;
  day: number;
  /** O nome em japonês — a assinatura visual. */
  kanji: string;
  /** O sentido, em cada idioma. */
  pt: string;
  en: string;
}

export const MICROSEASONS: Microseason[] = [
  { month: 1, day: 5, kanji: '芹乃栄', pt: 'a salsa-d’água viceja', en: 'parsley flourishes' },
  { month: 1, day: 10, kanji: '水泉動', pt: 'as nascentes se movem sob o gelo', en: 'springs stir under the ice' },
  { month: 1, day: 15, kanji: '雉始雊', pt: 'os faisões começam a chamar', en: 'pheasants start to call' },
  { month: 1, day: 20, kanji: '款冬華', pt: 'os brotos de fuki despontam', en: 'butterburs bud' },
  { month: 1, day: 25, kanji: '水沢腹堅', pt: 'o gelo engrossa nos riachos', en: 'ice thickens on the streams' },
  { month: 1, day: 30, kanji: '鶏始乳', pt: 'as galinhas voltam a botar', en: 'hens start laying again' },

  { month: 2, day: 4, kanji: '東風解凍', pt: 'o vento leste derrete o gelo', en: 'the east wind melts the ice' },
  { month: 2, day: 9, kanji: '黄鶯睍睆', pt: 'os rouxinóis cantam na montanha', en: 'warblers sing in the mountains' },
  { month: 2, day: 14, kanji: '魚上氷', pt: 'os peixes emergem do gelo', en: 'fish emerge from the ice' },
  { month: 2, day: 19, kanji: '土脉潤起', pt: 'a chuva umedece a terra', en: 'rain moistens the soil' },
  { month: 2, day: 24, kanji: '霞始靆', pt: 'a neblina começa a pairar', en: 'mist starts to linger' },

  { month: 3, day: 1, kanji: '草木萌動', pt: 'capim e árvores brotam', en: 'grass sprouts, trees bud' },
  { month: 3, day: 6, kanji: '蟄虫啓戸', pt: 'os insetos deixam a toca', en: 'hibernating insects surface' },
  { month: 3, day: 11, kanji: '桃始笑', pt: 'os pêssegos começam a florir', en: 'the first peach blossoms' },
  { month: 3, day: 16, kanji: '菜虫化蝶', pt: 'as lagartas viram borboletas', en: 'caterpillars become butterflies' },
  { month: 3, day: 21, kanji: '雀始巣', pt: 'os pardais começam a nidificar', en: 'sparrows start to nest' },
  { month: 3, day: 26, kanji: '桜始開', pt: 'as primeiras cerejeiras abrem', en: 'the first cherry blossoms' },
  { month: 3, day: 31, kanji: '雷乃発声', pt: 'o trovão distante se anuncia', en: 'distant thunder' },

  { month: 4, day: 5, kanji: '玄鳥至', pt: 'as andorinhas retornam', en: 'swallows return' },
  { month: 4, day: 10, kanji: '鴻雁北', pt: 'os gansos selvagens voam ao norte', en: 'wild geese fly north' },
  { month: 4, day: 15, kanji: '虹始見', pt: 'surgem os primeiros arco-íris', en: 'the first rainbows appear' },
  { month: 4, day: 20, kanji: '葭始生', pt: 'os juncos começam a brotar', en: 'reeds start to sprout' },
  { month: 4, day: 25, kanji: '霜止出苗', pt: 'cessa a geada, cresce o arroz', en: 'last frost, rice seedlings grow' },
  { month: 4, day: 30, kanji: '牡丹華', pt: 'as peônias florescem', en: 'peonies bloom' },

  { month: 5, day: 5, kanji: '蛙始鳴', pt: 'as rãs começam a cantar', en: 'frogs start singing' },
  { month: 5, day: 10, kanji: '蚯蚓出', pt: 'as minhocas vêm à superfície', en: 'worms surface' },
  { month: 5, day: 15, kanji: '竹笋生', pt: 'os brotos de bambu despontam', en: 'bamboo shoots sprout' },
  { month: 5, day: 21, kanji: '蚕起食桑', pt: 'os bichos-da-seda comem amoreira', en: 'silkworms feast on mulberry' },
  { month: 5, day: 26, kanji: '紅花栄', pt: 'os cártamos se abrem', en: 'safflowers bloom' },
  { month: 5, day: 31, kanji: '麦秋至', pt: 'o trigo amadurece', en: 'wheat ripens' },

  { month: 6, day: 6, kanji: '蟷螂生', pt: 'nascem os louva-a-deus', en: 'praying mantises hatch' },
  { month: 6, day: 11, kanji: '腐草為螢', pt: 'o capim apodrecido vira vaga-lume', en: 'rotting grass becomes fireflies' },
  { month: 6, day: 16, kanji: '梅子黄', pt: 'as ameixas amarelam', en: 'plums turn yellow' },
  { month: 6, day: 21, kanji: '乃東枯', pt: 'a prunela murcha', en: 'self-heal withers' },
  { month: 6, day: 26, kanji: '菖蒲華', pt: 'os lírios florescem', en: 'irises bloom' },

  { month: 7, day: 1, kanji: '半夏生', pt: 'brota a erva do meio do verão', en: 'crow-dipper sprouts' },
  { month: 7, day: 7, kanji: '温風至', pt: 'chegam os ventos mornos', en: 'warm winds blow' },
  { month: 7, day: 12, kanji: '蓮始開', pt: 'os primeiros lótus se abrem', en: 'the first lotus blossoms' },
  { month: 7, day: 17, kanji: '鷹乃学習', pt: 'os falcões aprendem a voar', en: 'hawks learn to fly' },
  { month: 7, day: 23, kanji: '桐始結花', pt: 'a paulownia dá sementes', en: 'paulownia trees produce seeds' },
  { month: 7, day: 28, kanji: '土潤溽暑', pt: 'terra úmida, ar abafado', en: 'damp earth, humid air' },

  { month: 8, day: 2, kanji: '大雨時行', pt: 'às vezes caem grandes chuvas', en: 'great rains sometimes fall' },
  { month: 8, day: 8, kanji: '涼風至', pt: 'chegam os ventos frescos', en: 'cool winds arrive' },
  { month: 8, day: 13, kanji: '寒蝉鳴', pt: 'as cigarras do entardecer cantam', en: 'evening cicadas sing' },
  { month: 8, day: 18, kanji: '蒙霧升降', pt: 'a névoa densa desce', en: 'thick fog descends' },
  { month: 8, day: 23, kanji: '綿柎開', pt: 'abrem-se as flores do algodão', en: 'cotton flowers bloom' },
  { month: 8, day: 28, kanji: '天地始粛', pt: 'o calor começa a ceder', en: 'the heat starts to die down' },

  { month: 9, day: 2, kanji: '禾乃登', pt: 'o arroz amadurece', en: 'rice ripens' },
  { month: 9, day: 8, kanji: '草露白', pt: 'o orvalho brilha branco na grama', en: 'dew glistens white on the grass' },
  { month: 9, day: 13, kanji: '鶺鴒鳴', pt: 'as lavandeiras cantam', en: 'wagtails sing' },
  { month: 9, day: 18, kanji: '玄鳥去', pt: 'as andorinhas partem', en: 'swallows leave' },
  { month: 9, day: 23, kanji: '雷乃収声', pt: 'o trovão se cala', en: 'thunder ceases' },
  { month: 9, day: 28, kanji: '蟄虫坏戸', pt: 'os insetos se fecham na terra', en: 'insects hole up underground' },

  { month: 10, day: 3, kanji: '水始涸', pt: 'as águas começam a secar', en: 'farmers drain the fields' },
  { month: 10, day: 8, kanji: '鴻雁来', pt: 'os gansos selvagens retornam', en: 'wild geese return' },
  { month: 10, day: 13, kanji: '菊花開', pt: 'os crisântemos se abrem', en: 'chrysanthemums bloom' },
  { month: 10, day: 18, kanji: '蟋蟀在戸', pt: 'os grilos cantam junto à porta', en: 'crickets chirp by the door' },
  { month: 10, day: 23, kanji: '霜始降', pt: 'cai a primeira geada', en: 'the first frost falls' },
  { month: 10, day: 28, kanji: '霎時施', pt: 'chuviscos passageiros', en: 'light rains sometimes fall' },

  { month: 11, day: 2, kanji: '楓蔦黄', pt: 'bordos e heras amarelam', en: 'maples and ivy turn yellow' },
  { month: 11, day: 7, kanji: '山茶始開', pt: 'as camélias começam a abrir', en: 'camellias start to bloom' },
  { month: 11, day: 12, kanji: '地始凍', pt: 'a terra começa a congelar', en: 'the land starts to freeze' },
  { month: 11, day: 17, kanji: '金盞香', pt: 'os narcisos perfumam', en: 'daffodils bloom' },
  { month: 11, day: 22, kanji: '虹蔵不見', pt: 'os arco-íris se escondem', en: 'rainbows hide' },
  { month: 11, day: 27, kanji: '朔風払葉', pt: 'o vento norte varre as folhas', en: 'the north wind strips the leaves' },

  { month: 12, day: 2, kanji: '橘始黄', pt: 'as tangerinas amarelam', en: 'tangerines start to turn yellow' },
  { month: 12, day: 7, kanji: '閉塞成冬', pt: 'o frio se fecha, entra o inverno', en: 'cold sets in, winter begins' },
  { month: 12, day: 12, kanji: '熊蟄穴', pt: 'os ursos recolhem-se às tocas', en: 'bears retreat into their dens' },
  { month: 12, day: 16, kanji: '鱖魚群', pt: 'os salmões sobem o rio', en: 'salmon gather and swim upstream' },
  { month: 12, day: 22, kanji: '乃東生', pt: 'a prunela brota', en: 'self-heal sprouts' },
  { month: 12, day: 26, kanji: '麋角解', pt: 'os cervos perdem os chifres', en: 'deer shed their antlers' },
  { month: 12, day: 31, kanji: '雪下出麦', pt: 'o trigo brota sob a neve', en: 'wheat sprouts under the snow' },
];

/**
 * A microestação vigente numa data. Como a lista está ordenada, basta
 * guardar a última que já começou.
 *
 * O caso de virada do ano: entre 1 e 4 de janeiro nenhuma entrada do ano
 * novo começou ainda, e quem vale é a última de dezembro — por isso ela
 * é o ponto de partida da busca.
 */
export function currentMicroseason(date: Date): Microseason {
  const month = date.getMonth() + 1; // getMonth() conta de 0 a 11
  const day = date.getDate();

  let current = MICROSEASONS[MICROSEASONS.length - 1];

  for (const season of MICROSEASONS) {
    const alreadyStarted =
      season.month < month || (season.month === month && season.day <= day);
    if (!alreadyStarted) break;
    current = season;
  }

  return current;
}
