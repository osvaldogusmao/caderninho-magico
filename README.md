# Caderninho Mágico

Jogo de matemática da pré-escola ao 6º ano, feito para rodar até no iPad antigo (iOS 12).
Tem mundos e lições por ano, aquecimento, revisão com dicas, jogos bônus (números de 1 a 100 e tabuada),
ranking, login com nome e data de nascimento, diamantes, loja de skins e acessórios, troca de diamantes por
Family Coin e a Área dos pais com relatório.

## Como está organizado

| Pasta | O que tem |
|---|---|
| `public/index.html` | O jogo pronto (uma página só). A raiz do site abre ele. |
| `public/voz/` | As falas gravadas, em pacotes JSON (comum, um por ano e nomes). |
| `jogo/src/` | O código-fonte do jogo, em partes. `jogo/build.py` junta tudo. |
| `src/app/api/` | A API: jogadores, login, lições e diamantes, loja, trocas, ranking e Área dos pais. |
| `src/lib/` | Regras do jogo (`game.ts`), da Área dos pais (`game-family.ts`) e da loja (`game-shop.ts`). |
| `prisma/` | O banco (Postgres): jogadores, famílias, lições e trocas. |

## Colocar no ar (Vercel)

1. No Vercel, **Add New → Project** e importe o repositório `caderninho-magico`. O framework (Next.js) é detectado sozinho.
2. Antes do primeiro deploy, crie o banco: no projeto, **Storage → Create Database → Neon (Postgres)** e conecte ao projeto.
   Isso cria a variável `DATABASE_URL`.
3. Em **Settings → Environment Variables**, crie `SESSION_SECRET` com uma chave aleatória
   (por exemplo, a saída de `openssl rand -base64 32`). Ela assina a sessão da Área dos pais.
4. Faça o deploy (ou **Redeploy**, se o primeiro rodou antes do banco existir). O build roda
   `prisma migrate deploy`, que cria as tabelas.

O site fica em `https://<nome-do-projeto>.vercel.app`, com o jogo na raiz.

## Rodar no computador

```bash
npm install
cp .env.example .env      # preencha DATABASE_URL e SESSION_SECRET
npx prisma migrate dev
npm run dev               # http://localhost:3000
```

## Mudar o jogo

1. Edite as partes em `jogo/src/`.
2. Rode `npm run jogo` (precisa de Python 3). Ele gera `public/index.html`, já com o JavaScript convertido para
   o Safari do iOS 12, e uma cópia sem servidor em `jogo/caderninho-magico.html` (a versão do claude.ai).
3. Faça commit do `public/index.html` junto com as mudanças em `jogo/src/`.

Na loja, o preço e o lugar de cada item existem nos dois lados: `jogo/src/6e-shop.js` (desenho) e
`src/lib/game-shop.ts` (o servidor confere a compra). Mude os dois juntos.

## Regras da recompensa

- Cada lição terminada dá 1 diamante por estrela (até 3), até o limite diário da família (padrão 30).
  Quem conta é o servidor.
- Padrão da troca: 100 diamantes = 1 Family Coin = R$ 50,00. Os pais mudam na Área dos pais.
- A criança pede a troca e os diamantes ficam reservados. Os pais marcam "Paguei" (os diamantes saem)
  ou "Recusar" (os diamantes voltam).
- A Área dos pais entra com um PIN de 4 números, que bloqueia por 15 minutos depois de 5 erros.

## Voz

As falas foram geradas com o XTTS v2 (Coqui, voz "Ana Florence"), conferidas uma a uma com reconhecimento de
fala. O modelo usa a Coqui Public Model License, que **não permite uso comercial**: o jogo é para uso da família.
Quando uma fala não tem gravação, o jogo usa a voz do próprio aparelho.
