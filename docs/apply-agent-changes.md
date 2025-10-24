# Guida per importare le modifiche dell'agente

Questi passaggi spiegano come allineare il tuo repository locale allo stato prodotto dall'agente (commit `7349bf7`). Le istruzioni sono pensate per una workstation con **git** installato.

> **Suggerimento**: prima di procedere crea un branch o un backup del tuo lavoro corrente, così potrai ripristinarlo in caso di problemi.

## 1. Preparare l'area di lavoro
1. Apri un terminale nella cartella del tuo progetto.
2. Verifica che non ci siano modifiche non salvate:
   ```bash
   git status
   ```
   Se il comando mostra file "modified" o "untracked", effettua un commit oppure salva i file da parte (`git stash` o una copia manuale).

## 2. Collegarsi al branch dell'agente
1. Aggiungi un remote temporaneo che punti al repository generato dall'agente (sostituisci `<URL_AGENT>` con l'URL reale, ad esempio quello del fork usato per la PR):
   ```bash
   git remote add agent <URL_AGENT>
   ```
2. Scarica il branch `work` (o quello indicato nel PR):
   ```bash
   git fetch agent work
   ```
3. Sovrascrivi il tuo branch locale (ad esempio `main`) con lo stato del branch dell'agente:
   ```bash
   git checkout main
   git reset --hard agent/work
   ```
4. (Opzionale) Rimuovi il remote temporaneo:
   ```bash
   git remote remove agent
   ```

## 3. Installare dipendenze e verificare
Dopo aver aggiornato i file esegui i comandi di progetto per assicurarti che tutto funzioni:
```bash
npm install
npm run build
```

Se usi anche il server Node, ricordati di rieseguire `npm run dev` o lo script di avvio previsto.

## 4. Commit e push
Quando hai verificato che l'applicazione funzioni puoi creare un commit e pubblicarlo sul tuo repository:
```bash
git add .
git commit -m "Allinea progetto alle modifiche dell'agente"
git push origin main
```

Se hai usato la `reset --hard`, il push potrebbe richiedere l'opzione `--force` (solo se sei sicuro di voler sovrascrivere la cronologia remota):
```bash
git push origin main --force
```

Seguendo questi passaggi il tuo repository conterrà le stesse modifiche applicate dall'agente.
