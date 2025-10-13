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

## Reset credenziali admin
Se le credenziali dell'amministratore vengono smarrite o bloccate, è possibile rigenerarle eseguendo:

```bash
npm run admin:reset
```

Di default verrà ripristinata la password `admin2024` sull'utente `admin`. È possibile passare una nuova password ed un indirizzo email personalizzato:

```bash
npm run admin:reset -- <nuova-password> <email>
```

In alternativa è possibile impostare le variabili d'ambiente `ADMIN_RESET_PASSWORD` e `ADMIN_EMAIL` prima di eseguire il comando.
