# Galeria Personalizada — Batizado do Enrico 🕊️
**Clique & Poesia** • *"Um clique, uma poesia."*

Esta galeria foi desenvolvida sob medida para a entrega das fotografias do **Batizado do Enrico**, seguindo com precisão a **identidade visual oficial da Clique & Poesia** ([cliqueepoesia.vercel.app](https://cliqueepoesia.vercel.app/)) e inspirada no modelo de entrega da galeria da Fernanda.

---

## 🎨 Identidade Visual & Conceito
- **Paleta de Cores**: Verde floresta profundo (`#0d130c`, `#151e14`), verde musgo exclusivo da Clique (`#384936`), dourado champagne (`#d6b985`, `#e4cda1`) e toques suaves em papel artesanal (`#f2ede3`).
- **Tipografia**:
  - *Canvas Script* (Adobe Fonts) para assinaturas poéticas e destaque do nome do Enrico.
  - *Cormorant Garamond* para títulos nobres e cabeçalhos editoriais.
  - *Omnes* / *Plus Jakarta Sans* para legibilidade refinada de toda a interface.
- **Logotipo Oficial**: Vetor SVG oficial da Clique & Poesia incluído no topo e no rodapé.
- **Textos Poéticos**: Textos originais e acolhedores adaptados especificamente para a cerimônia de batizado e bênção familiar.

---

## ✨ Recursos da Galeria
1. **Visualização em Grade Fluida**:
   - 90 fotos em alta definição do batizado já otimizadas para carregamento instantâneo.
   - Carregamento sob demanda (*lazy loading*).
   - Efeito de zoom elegante e foco ao passar o mouse.
2. **Download Imediato**:
   - **Download individual**: Ícone de download direto em cada card de foto ou no topo do Lightbox.
   - **Download em lote (ZIP)**: Baixe todas as fotos favoritas selecionadas em um único arquivo compactado (`Batizado-Enrico-Clique-e-Poesia.zip`) via JSZip.
3. **Seleção de Fotos Favoritas**:
   - Marque no coração suas fotos preferidas.
   - Aba exclusiva "Favoritas / Selecionadas" com contador dinâmico.
   - Seleção salva automaticamente no navegador (não perde ao atualizar a página).
4. **Lightbox em Tela Cheia**:
   - Imagens em tela cheia com alta fidelidade de cor.
   - Navegação por botões, setas do teclado (`←` e `→`) e suporte a **deslizar o dedo (swipe)** em celulares.
   - Contador de posição (ex: `Foto 1 de 90`).
5. **Barra Flutuante de Ações**:
   - Surge automaticamente ao selecionar 1 ou mais fotos.
   - Acesso rápido para baixar em ZIP, enviar lista pelo WhatsApp ou copiar nomes dos arquivos.
6. **Integração com WhatsApp**:
   - Envia a lista formatada das fotos escolhidas diretamente para a fotógrafa da Clique & Poesia (`(38) 99756-9353`).

---

## 🚀 Como Testar Localmente no Computador
1. Basta dar **dois cliques** no arquivo `iniciar-galeria.bat`.
2. A galeria abrirá automaticamente no seu navegador padrão (`http://localhost:8080/`).
3. Todas as funcionalidades (incluindo o download de ZIP) funcionam perfeitamente.

---

## ☁️ Como Publicar no Vercel (Online para o Cliente)
1. Acesse [vercel.com](https://vercel.com/) e faça login.
2. Clique em **"Add New"** > **"Project"**.
3. Importe a pasta `Batizado Enrico` (ou arraste a pasta diretamente para o painel do Vercel).
4. O arquivo `vercel.json` já configurado cuidará do cache e da entrega ultra-rápida das fotos.
5. Pronto! Você receberá um link como `https://batizado-do-enrico.vercel.app` para enviar para os pais do Enrico.

---

## 🔄 Como Atualizar Fotos no Futuro
Se adicionar novas fotos na pasta `photos/`:
- **Com PowerShell**: Clique com o botão direito em `generate-gallery.ps1` e selecione "Executar com o PowerShell".
- **Com Node.js**: Execute `node generate-gallery.js` no terminal.