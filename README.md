# 🃏 Burraco Tournament Manager

Web App per la gestione di tornei di burraco tra amici.

## Stack

- **React** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS v4** (styling)
- **React Router v7** (routing)
- **localStorage** (persistenza dati)
- **PWA** (installabile su smartphone)

## Installazione Locale

```bash
# Clona il repository
git clone https://github.com/your-username/burracoTournament.git
cd burracoTournament

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

## Comandi

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia il server di sviluppo |
| `npm run build` | Crea la build di produzione |
| `npm run preview` | Anteprima della build di produzione |

## Deploy su Vercel

1. Collega il repository GitHub a Vercel
2. Vercel rileverà automaticamente Vite
3. Deploy automatico ad ogni push su `main`

## Struttura Progetto

```
src/
├── components/     # Componenti UI riutilizzabili
├── pages/          # Pagine/view dell'app
├── models/         # TypeScript interfaces e types
├── services/       # Business logic services
│   ├── storageService.ts     # Persistenza localStorage
│   ├── tournamentService.ts  # Creazione/gestione tornei
│   ├── scoringService.ts     # Inserimento risultati
│   ├── standingsService.ts   # Calcolo classifica
│   └── prizeService.ts       # Gestione premi
├── algorithms/     # Motori di generazione incontri
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── context/        # React Context (stato globale)
├── App.tsx         # Router principale
└── main.tsx        # Entry point
```

## Formule di Torneo

| Formula | Stato |
|---------|-------|
| Round Robin | 🔜 Fase 2 |
| Sistema Svizzero | 🔜 Fase 4 |
| Eliminazione Diretta | 🔜 Fase 9 |
| Gironi + Playoff | 📋 Pianificato |

## Licenza

MIT
