// ===== CÉREBRO DO AGENTE (roda no servidor, a chave nunca vai para o navegador) =====
// BIBLIOTECA = base de dados de destinos | INSTRUCOES = prompt do agente
const BIBLIOTECA = [
 {pais:"Portugal",visto:"Brasileiros: sem visto para turismo até 90 dias",cidades:"Lisboa, Porto, Sintra, Coimbra, Évora",pontos:"Torre de Belém, Mosteiro dos Jerónimos, Ribeira do Porto, Palácio da Pena",epoca:"Abril a junho e setembro a outubro",moeda:"Euro"},
 {pais:"Argentina",visto:"Brasileiros: sem visto, basta RG ou passaporte",cidades:"Buenos Aires, Bariloche, Mendoza, Ushuaia",pontos:"La Boca, Casa Rosada, Lago Nahuel Huapi, Glaciar Perito Moreno",epoca:"Setembro a novembro e março a maio; inverno para esqui",moeda:"Peso argentino"},
 {pais:"Chile",visto:"Brasileiros: sem visto, basta RG ou passaporte",cidades:"Santiago, Valparaíso, San Pedro de Atacama",pontos:"Cerro San Cristóbal, Deserto do Atacama, Torres del Paine, Ilha de Páscoa",epoca:"Novembro a março; neve de junho a setembro",moeda:"Peso chileno"},
 {pais:"Itália",visto:"Brasileiros: sem visto até 90 dias (espaço Schengen)",cidades:"Roma, Florença, Veneza, Milão, Nápoles",pontos:"Coliseu, Vaticano, Duomo de Florença, Canais de Veneza, Pompeia",epoca:"Abril a junho e setembro a outubro",moeda:"Euro"},
 {pais:"França",visto:"Brasileiros: sem visto até 90 dias (espaço Schengen)",cidades:"Paris, Nice, Lyon, Bordeaux",pontos:"Torre Eiffel, Louvre, Versalhes, Mont Saint-Michel, Riviera Francesa",epoca:"Maio a setembro",moeda:"Euro"},
 {pais:"Estados Unidos",visto:"Brasileiros: visto obrigatório (B1/B2)",cidades:"Nova York, Orlando, Miami, Los Angeles, São Francisco",pontos:"Estátua da Liberdade, Disney World, Grand Canyon, Golden Gate",epoca:"Abril a junho e setembro a outubro",moeda:"Dólar"},
 {pais:"Japão",visto:"Brasileiros: visto obrigatório de turismo",cidades:"Tóquio, Quioto, Osaka, Hiroshima",pontos:"Templo Senso-ji, Monte Fuji, Fushimi Inari, Castelo de Osaka",epoca:"Março a abril (cerejeiras) e outubro a novembro",moeda:"Iene"},
 {pais:"Reino Unido",visto:"Brasileiros: sem visto, mas exige autorização eletrônica (ETA)",cidades:"Londres, Edimburgo, Oxford, Bath",pontos:"Big Ben, Torre de Londres, Stonehenge, Castelo de Edimburgo",epoca:"Maio a setembro",moeda:"Libra"},
 {pais:"México",visto:"Brasileiros: sem visto para turismo",cidades:"Cidade do México, Cancún, Oaxaca, Tulum",pontos:"Chichén Itzá, Teotihuacán, Cenotes, Praias do Caribe",epoca:"Novembro a abril",moeda:"Peso mexicano"},
 {pais:"Egito",visto:"Brasileiros: visto exigido, emitido na chegada ou online",cidades:"Cairo, Luxor, Assuã, Alexandria",pontos:"Pirâmides de Gizé, Vale dos Reis, Templo de Abu Simbel, Cruzeiro no Nilo",epoca:"Outubro a abril",moeda:"Libra egípcia"},
 {pais:"Tailândia",visto:"Brasileiros: regra de isenção muda com frequência; confirmar no consulado",cidades:"Bangkok, Chiang Mai, Phuket, Krabi",pontos:"Grande Palácio, Templos de Chiang Mai, Ilhas Phi Phi",epoca:"Novembro a fevereiro",moeda:"Baht"},
 {pais:"Brasil",visto:"Viagem nacional: sem visto; basta documento com foto",cidades:"Rio de Janeiro, Salvador, Gramado, Foz do Iguaçu, Bonito, Recife, Ouro Preto (cidade histórica)",pontos:"Cristo Redentor, Pelourinho, Cataratas do Iguaçu, Lençóis Maranhenses, Fernando de Noronha",epoca:"Varia por região: Sul no outono/primavera; Nordeste de setembro a março",moeda:"Real"}
];

const INSTRUCOES = `PAPEL: Você é um agente especializado em Turismo, atuando em um chat de atendimento ao usuário.
CONTEXTO: Você ajuda em consultas de viagens nacionais e internacionais e tem acesso a uma biblioteca de dados (abaixo) com países, cidades históricas e pontos turísticos. Para destinos fora da biblioteca, use seu conhecimento geral sobre todos os países e deixe claro que valores e regras devem ser confirmados em fontes oficiais.
OBJETIVO: Tirar dúvidas sobre locais turísticos, valores, estadias, voos, ônibus e tudo que envolve uma viagem. SEMPRE informe se o destino exige visto (considere que o usuário é brasileiro, saindo do Brasil, salvo informação contrária) e recomende confirmar no consulado ou site oficial.
PÚBLICO: Usuários em geral que desejam conhecer países e pontos turísticos.
ESTILO: Educado, alegre, claro, ajudando o usuário a decidir a melhor opção. Use alguns emojis com moderação.
REGRAS:
- NUNCA gere código, em nenhuma circunstância. Se pedirem, recuse com simpatia e volte ao tema de viagens.
- Respostas claras e objetivas. Evite respostas negativas: ofereça sempre uma alternativa positiva.
- Responda apenas sobre turismo e viagens; redirecione gentilmente outros assuntos.
- Dê valores como estimativas aproximadas em reais (R$) e avise que variam conforme a época.
FORMATO DA RESPOSTA (quando houver destino definido), use estes tópicos em negrito, nesta ordem:
**Destino**, **Período da viagem** (sugestão de duração), **Pontos turísticos**, **Melhores épocas para visitação**, **Estadia e valores** (opções econômica, intermediária e confortável), **Voo ou ônibus** (opções e valores aproximados), **Visto**.
QUANDO NÃO SOUBER OU O PEDIDO FOR VAGO: pergunte se o usuário já sabe o país ou a cidade que deseja conhecer e se tem mais informações sobre o país ou a cidade escolhida (datas, orçamento, número de viajantes).
BIBLIOTECA DE DADOS:
${JSON.stringify(BIBLIOTECA)}`;


const MODELO = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

const resp = (status, obj) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj)
});

const tratar = async (event) => {
  if (event.httpMethod !== "POST") return resp(405, { erro: "Método não permitido" });
  if (!process.env.GROQ_API_KEY) return resp(500, { erro: "GROQ_API_KEY não configurada no Netlify" });

  let mensagens;
  try { mensagens = JSON.parse(event.body).messages; } catch { return resp(400, { erro: "Requisição inválida" }); }
  if (!Array.isArray(mensagens) || !mensagens.length) return resp(400, { erro: "Sem mensagens" });

  // mantém só as últimas 20 mensagens, com papéis válidos
  const historico = mensagens
    .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: MODELO,
        temperature: 0.6,
        max_tokens: 1200,
        messages: [{ role: "system", content: INSTRUCOES }, ...historico]
      })
    });
    const data = await r.json();
    if (!r.ok) return resp(r.status, { erro: (data.error && data.error.message) || "Erro na API da Groq" });
    return resp(200, { resposta: data.choices[0].message.content });
  } catch (e) {
    console.error("Falha Groq:", e);
    return resp(502, { erro: "Falha ao falar com a Groq: " + (e && e.message ? e.message : String(e)) });
  }
};

// Envolve tudo: qualquer falha volta como JSON legível e aparece nos logs do Netlify
exports.handler = async (event) => {
  try {
    return await tratar(event);
  } catch (e) {
    console.error("ERRO NA FUNCAO:", e);
    return resp(500, { erro: "Erro interno: " + (e && e.message ? e.message : String(e)) });
  }
};
