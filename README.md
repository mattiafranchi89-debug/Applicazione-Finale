# Seguro Calcio U19 — Full (persistenza + reset + minuti + settimane definite)

- **Reset dati locali** in header
- **Minuti giocati** per partita + **Calcola minuti** da sostituzioni e XI iniziale
- **Settimane allenamenti** precaricate (Set 2025 → Mag 2026) con 3 sedute (Lun/Mer/Ven)
- Widget Tuttocampo: Risultati, Classifica, Marcatori + Ultima/Prossima
- Persistenza totale (`localStorage`): Giocatori, Allenamenti (+settimana), Convocazioni, Partite/Eventi/Minuti

## Avvio
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Ripristino dati applicazione
Per ricaricare i dati iniziali nell'ambiente locale puoi eseguire:

```bash
npm run db:seed-data
```

Se vuoi azzerare solo le statistiche dei giocatori mantenendo il resto delle informazioni puoi usare:

```bash
npm run db:clear-players
```

## Come applicare le modifiche dell'agente
Se devi riallineare un tuo clone del progetto allo stesso stato generato dall'agente puoi seguire la guida in `docs/apply-agent-changes.md`, che descrive come collegarsi direttamente al branch dell'agente tramite `git`.
