# Agente de Turismo IA (Groq + Netlify)

## Estrutura
- index.html, style.css, script.js: interface do chat
- netlify/functions/chat.js: agente (prompt, biblioteca e chamada à Groq)
- netlify.toml: configuração do Netlify

## Deploy
1. Crie a chave em https://console.groq.com/keys
2. Suba esta pasta no GitHub e conecte ao Netlify (ou use "Deploy manually" com Netlify CLI).
3. Em Site configuration > Environment variables, crie:
   - GROQ_API_KEY = sua chave
   - GROQ_MODEL (opcional) = llama-3.3-70b-versatile
4. Faça o deploy e teste.

## Testar localmente
npm i -g netlify-cli
echo GROQ_API_KEY=sua_chave > .env
netlify dev
