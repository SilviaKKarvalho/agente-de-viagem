import { Groq } from 'groq-sdk';

export default async (req, context) => {
  // Garante que a requisição seja POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const body = await req.json();
    const { pergunta, systemPrompt } = body;

    // Pega a chave da API diretamente das variáveis de ambiente do Netlify
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Chave de API do Groq não configurada no servidor.' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const client = new Groq({ apiKey });

    const resposta = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Modelo atualizado e altamente recomendado na Groq
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: pergunta }
      ],
      temperature: 0.8
    });

    return new Response(
      JSON.stringify({ content: resposta.choices[0].message.content }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno ao processar a requisição.' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};
