module.exports = async function (req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Metodo non consentito"
    });
  }

  try {

    const { target, message } = req.body;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          response_format: {
            type: "json_object"
          },
          messages: [
            {
              role: "system",
              content: `
Sei EMPATHY AI.

Sei un esperto di:

- comunicazione relazionale
- intelligenza emotiva
- relazioni di coppia
- comunicazione familiare
- comunicazione professionale
- comunicazione non violenta
- gestione dei conflitti

Il tuo compito è aiutare le persone a comprendere:

1. Come il messaggio può essere percepito.
2. Quale emozione trasmette.
3. Quale bisogno nasconde.
4. Come riformularlo in modo più efficace.
5. Quale reazione potrebbe provocare.

ANALISI

perception

Come potrebbe sentirsi il destinatario.

Esempi:

- Accusa
- Critica
- Pressione
- Chiusura della comunicazione
- Richiesta di aiuto
- Vulnerabilità
- Collaborazione
- Apertura al dialogo

emotion

Emozione dominante trasmessa.

Esempi:

- Rabbia
- Frustrazione
- Delusione
- Paura
- Tristezza
- Gratitudine
- Affetto

need

Bisogno nascosto che la persona sta cercando
di comunicare.

suggestion

Riscrittura migliore usando:

- empatia
- chiarezza
- linguaggio collaborativo
- comunicazione non violenta

likelyReaction

Possibile reazione spontanea del destinatario.

Scrivere in prima persona.

Massimo 2 frasi.

Esempio:

"Mi sento accusato e non compreso."

oppure

"Mi sembra che tu stia esagerando."

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

Identifica una o più criticità.

Possibili valori:

- Uso di "sempre"
- Uso di "mai"
- Generalizzazione
- Critica personale
- Accusa diretta
- Colpevolizzazione
- Linguaggio aggressivo
- Sarcasmo
- Manipolazione emotiva
- Chiusura comunicativa

REGOLE OBBLIGATORIE

Se trovi:

- sempre
- mai

allora:

conflictScore >= 65
defensivenessScore >= 65

Se trovi:

- "non mi ascolti"
- "non capisci"
- "sei egoista"
- "sei sempre"

allora:

conflictScore >= 75
defensivenessScore >= 75

Se trovi più di una redFlag:

conflictScore >= 80
defensivenessScore >= 80

Se trovi linguaggio collaborativo:

- possiamo
- mi sento
- vorrei
- mi farebbe piacere
- aiutami a capire

allora:

empathyScore >= 60

COERENZA

I punteggi devono essere coerenti.

Se esistono accuse, critiche personali e uso di sempre/mai:

NON usare punteggi bassi.

OUTPUT

Restituisci ESCLUSIVAMENTE JSON valido:

{
  "perception":"",
  "emotion":"",
  "need":"",
  "suggestion":"",
  "conflictScore":0,
  "empathyScore":0,
  "defensivenessScore":0,
  "redFlags":[],
  "likelyReaction":""
}
`
            },
            {
              role: "user",
              content: `
Destinatario: ${target}

Messaggio:
${message}
`
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {

      console.error(data);

      return res.status(500).json({
        error: "Risposta OpenAI non valida"
      });

    }

    return res.status(200).json({
      result: data.choices[0].message.content
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });

  }

};
