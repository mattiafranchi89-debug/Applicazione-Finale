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
All'avvio del server viene verificato automaticamente che esista un account amministratore (per default `admin` / `admin2024`).
Le credenziali possono essere personalizzate tramite le variabili d'ambiente `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `ADMIN_EMAIL`.

Se le credenziali dell'amministratore vengono smarrite o bloccate, è possibile rigenerarle eseguendo:

```bash
npm run admin:reset
```

Di default verrà ripristinata la password `admin2024` sull'utente `admin`. È possibile passare una nuova password ed un indirizzo email personalizzato:

```bash
npm run admin:reset -- <nuova-password> <email>
```

In alternativa è possibile impostare le variabili d'ambiente `ADMIN_RESET_PASSWORD`, `ADMIN_EMAIL` e `ADMIN_USERNAME` prima di eseguire il comando. Impostando `ADMIN_PASSWORD` (o `ADMIN_FORCE_RESET=true`) il server aggiornerà automaticamente la password all'avvio.

## Come applicare le modifiche dell'agente
Se devi riallineare un tuo clone del progetto allo stesso stato generato dall'agente puoi seguire la guida in `docs/apply-agent-changes.md`, che include sia una patch pronta (`docs/ensure-admin-account-update.patch`) sia i comandi `git` per collegarti direttamente al branch dell'agente.
