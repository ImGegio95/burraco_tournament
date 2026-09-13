# 🃏 Burraco Tournament Manager

Web App moderna, responsive e PWA per la gestione completa di tornei di burraco tra amici.
Sviluppata interamente frontend-only senza necessità di backend o database esterni.

[![CI Tests](https://img.shields.io/badge/tests-525%20passed-emerald)](https://github.com/ImGegio95/burraco_tournament)
[![PWA Ready](https://img.shields.io/badge/PWA-installable-blue)](https://github.com/ImGegio95/burraco_tournament)
[![Deploy Vercel](https://img.shields.io/badge/deploy-Vercel-black)](https://vercel.com/lorenzo-personal)

---

## ✨ Funzionalità

### 👥 1. Gestione Giocatori e Coppie
- **Giocatori**: Aggiunta rapida con tasto Invio, modifica inline del nome, eliminazione protetta, prevenzione duplicati e avviso immediato in caso di numero dispari.
- **Coppie**:
  - **Generazione Casuale**: Algoritmo `Fisher-Yates` shuffle istantaneo.
  - **Accoppiamento Manuale**: Selezione a tendina di due giocatori liberi.
  - **Personalizzazione**: Possibilità di rinominare le squadre con nomi personalizzati (es. *"I Draghi"*).

### 🏆 2. Formule di Torneo Supportate
1. **🔄 Round Robin (Tutti contro tutti)**:
   - Algoritmo ciclico di Berger.
   - Supporto nativo per numeri pari e numeri dispari con **BYE (Turno di Riposo)** a rotazione equa.
   - Assegnazione automatica dei tavoli fisici (`Tavolo 1`, `Tavolo 2`...).
2. **🇨🇭 Sistema Svizzero (Swiss System)**:
   - Abbinamenti progressivi round-by-round basati sulla classifica live.
   - Algoritmo di backtracking intelligente che minimizza il distacco di classifica ed **evita i rematch**.
   - Assegnazione dinamica del turno di riposo per numeri dispari alla squadra peggio piazzata che non ha ancora riposato.
3. **⚡ Eliminazione Diretta (Knockout)**:
   - Tabellone con quarti, semifinali e finale.
   - Gestione automatica di numeri di coppie non potenza di 2 tramite turni preliminari e BYE.
   - Avanzamento progressivo dei vincitori a ogni turno completato.

### 📊 3. Risultati & Classifica Live Deterministica
- **Inserimento Risultati**: Input punteggi con conferma e blocco anti-modifica accidentale.
- **Sblocco Organizzatore**: Possibilità esplicita di modificare o resettare una partita conclusa con ricalcolo immediato della classifica.
- **Podio Top 3**: Schede grafiche con medaglie (oro 🥇, argento 🥈, bronzo 🥉).
- **Trend Posizioni**: Indicatori dinamici di variazione (`▲ +1`, `▼ -1`, `—`).
- **Tie-Break Deterministico**: Risoluzione rigorosa della parità senza sorteggi casuali:
  1. Punti totali
  2. Numero di vittorie
  3. Differenza punti
  4. Scontro diretto (Head-to-head)

### 💰 4. Montepremi & Distribuzione Premi
- Calcolo automatico del montepremi totale (`quota per giocatore × partecipanti`) o montepremi custom.
- Ripartizione percentuale per posizione (es. 1°: 60%, 2°: 30%, 3°: 10%) con validazione 100%.
- Badge premi visibili sia nella dashboard che nella classifica.
- Banner celebrativo finale con assegnazione premi ai vincitori.

### 💾 5. Persistenza & Backup JSON
- **Auto-Save**: Salvataggio automatico e trasparente su `localStorage` ad ogni azione.
- **Recovery**: Ripristino istantaneo dello stato del torneo attivo in caso di refresh del browser o riavvio.
- **Multi-Torneo**: Possibilità di creare, archiviare ed eliminare più tornei dalla Home.
- **Import / Export**: Esportazione di backup completi in file `.json` e importazione rapida da qualsiasi dispositivo.

### 📱 6. Progressive Web App (PWA)
- Installabile come app nativa su smartphone Android e iOS (Homescreen).
- Icone personalizzate (192x192, 512x512) a tema tavolo verde Burraco.
- Service Worker per funzionamento garantito anche in assenza di rete (offline cache).
- Design responsive ottimizzato per smartphone, tablet e desktop.

---

## 🛠️ Stack Tecnologico

- **Core**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4 (Glassmorphism, Dark Theme tavolo da gioco)
- **Routing**: React Router v7
- **Icone**: Heroicons / SVG / Emoji native
- **Test Runner**: TSX + TypeScript test runner

---

## 🚀 Comandi del Progetto

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo locale (http://localhost:5173/)
npm run dev

# Esegui l'intera suite di test automatizzati (525 asserzioni)
npm test

# Crea la build di produzione per il deploy
npm run build

# Anteprima locale della build di produzione
npm run preview
```

---

## 🌐 Deploy su Vercel

Il progetto include già il file `vercel.json` con la configurazione di **rewrite per SPA**:

1. Vai su [Vercel](https://vercel.com/lorenzo-personal)
2. Seleziona **"Add New..."** ➔ **"Project"**
3. Importa il repository GitHub `ImGegio95/burraco_tournament`
4. Clicca su **Deploy** (i parametri Vite, build e dist sono rilevati automaticamente).

---

## 📄 Licenza

Distribuito sotto licenza MIT.
