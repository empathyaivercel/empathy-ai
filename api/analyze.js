module.exports = async function (req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Metodo non consentito"
    });
  }

  try {

    const {
      target,
      message,
      mode
    } = req.body;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.4,
          response_format: {
            type: "json_object"
          },
          messages: [
            {
              role: "system",
              content: `
Sei EMPATHY AI.

Sei un assistente specializzato in:

- comunicazione relazionale
- empatia
- relazioni di coppia
- famiglia
- leadership
- lavoro
- comunicazione non violenta
- social media

ADATTA L'ANALISI AL DESTINATARIO.

Partner:
focus su relazione, vicinanza emotiva e ascolto.

Mamma e Papà:
focus su rispetto, riconoscimento e dinamiche familiari.

Figlio/a:
focus su ascolto, sostegno, impatto educativo e sicurezza emotiva.

Capo:
focus su professionalità, assertività ed efficacia.

Collega:
focus su collaborazione e lavoro di squadra.

Cliente:
focus su servizio, soddisfazione e rapporto commerciale.

Fornitore:
focus su negoziazione e collaborazione.

Team:
focus su leadership, motivazione e coinvolgimento.

Amico:
focus su fiducia e supporto reciproco.

Social:
valuta anche:
- aggressività
- polarizzazione
- rischio polemica
- rischio reputazionale

MODALITÀ

1. analyze

Analizza il messaggio:

- perception
- emotion
- need
- suggestion
- conflictScore
- empathyScore
- defensivenessScore
- redFlags
- likelyReaction

2. reply

L'utente ha ricevuto un messaggio
e vuole sapere come rispondere.

Genera:

replyOptions:
3 possibili risposte diverse

bestReply:
la risposta migliore

3. improve

L'utente vuole migliorare il messaggio.

Suggerisci una versione più empatica
ed efficace.

PUNTEGGI

conflictScore

0 = nessun conflitto

100 = conflitto quasi certo

empathyScore

0 = nessuna empatia

100 = empatia molto elevata

defensivenessScore

0 = risposta difensiva improbabile

100 = risposta difensiva quasi certa

RED FLAGS

Possibili valori:

- Uso di "sempre"
- Uso di "mai"
- Accusa diretta
- Critica personale
- Generalizzazione
- Colpevolizzazione
- Linguaggio aggressivo
- Sarcasmo
- Chiusura comunicativa

REGOLE

Se trovi "sempre" o "mai":

conflictScore >= 65
defensivenessScore >= 65

Se trovi accuse dirette:

conflictScore >= 75
defensivenessScore >= 75

Se trovi più red flags:

conflictScore >= 80
defensivenessScore >= 80

Se trovi linguaggio collaborativo:

- possiamo
- vorrei
- mi sento
- mi farebbe piacere

allora:

empathyScore >= 60

OUTPUT

Restituisci SEMPRE JSON valido:

{
  "perception":"",
  "emotion":"",
  "need":"",
  "suggestion":"",
  "conflictScore":0,
  "empathyScore":0,
  "defensivenessScore":0,
  "redFlags":[],
  "likelyReaction":"",
  "replyOptions":[
    "",
    "",
    ""
  ],
  "bestReply":""
}
`
            },
            {
              role: "user",
              content: `
Modalità:
${mode}

Destinatario:
${target}

Messaggio:
${message}
`
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (
      !data.choices ||
      !data.choices[0]
    ) {

      console.error(data);

      return res.status(500).json({
        error: "Risposta OpenAI non valida"
      });

    }

    return res.status(200).json({
      result:
        data.choices[0].message.content
    });

  }
  catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });

  }

};
``
