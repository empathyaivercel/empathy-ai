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
    mode,
    tone
} = req.body;

    const prompt = `
Sei EMPATHY AI.

Destinatario:
${target}

Modalità:
${mode}

Tono:
${tone}

Messaggio:
${message}

Restituisci SEMPRE e SOLO JSON valido.

Formato obbligatorio:

{
  "perception":"",
  "emotion":"",
  "need":"",
  "suggestion":"",
  "conflictScore":0,
  "empathyScore":0,
  "defensivenessScore":0,
  "careScore":0,
  "clarityScore":0,
  "redFlags":[],
  "likelyReaction":"",
  "replyOptions":[
    "",
    "",
    ""
  ],
  "bestReply":""
}

Regole:

Se mode = analyze:

Compila SEMPRE tutti i campi.

PERCEPTION

perception non deve descrivere il messaggio.

perception deve descrivere cosa potrebbe provare
o percepire il destinatario leggendo il messaggio.

Esempio:

Messaggio:
"Ti ho visto serio stamattina, tutto bene?"

NO:
"Il partner sembra serio."

SI:
"Attenzione e interesse nei suoi confronti."

Messaggio:
"Non mi ascolti mai."

SI:
"Accusa e giudizio."

Messaggio:
"Mi farebbe piacere parlarne con te."

SI:
"Apertura e desiderio di dialogo."

VALUTAZIONE CONFLICT SCORE

0 = nessun conflitto

100 = conflitto quasi certo

Messaggi neutri o di supporto:
conflictScore <= 20

Messaggi accusatori:
conflictScore >= 70

VALUTAZIONE EMPATHY SCORE

0 = nessuna empatia

100 = empatia molto elevata

Empatia alta quando il messaggio contiene:

- ascolto
- interesse sincero
- supporto
- rassicurazione
- premura
- domande gentili

Esempi:

"Come stai?"
empathyScore >= 70

"Ti ho visto pensieroso, va tutto bene?"
empathyScore >= 85

"Posso aiutarti?"
empathyScore >= 90

"Grazie per avermelo detto"
empathyScore >= 80

VALUTAZIONE CARE SCORE

0 = nessuna cura percepita

100 = forte attenzione verso l'altra persona

Se il messaggio mostra interesse verso
il benessere dell'altra persona:

careScore >= 80

Esempi:

"Come stai?"
careScore >= 80

"Ti ho visto serio stamattina, tutto bene?"
careScore >= 90

VALUTAZIONE CLARITY SCORE

0 = messaggio ambiguo

100 = messaggio molto chiaro

Messaggi brevi ma comprensibili:
clarityScore >= 70

Messaggi diretti e specifici:
clarityScore >= 85

VALUTAZIONE EMPATIA

Empatia alta quando il messaggio contiene:

- interesse sincero
- ascolto
- domande gentili
- supporto
- apertura al dialogo
- rassicurazione

Domande gentili sullo stato emotivo dell'altra persona:

empathyScore >= 80

Esempio:

"Ti ho visto serio stamattina, tutto bene?"

empathyScore >= 80

careScore >= 90

Esempi:

"Come stai?"
empathyScore >= 70

"Ti ho visto pensieroso, va tutto bene?"
empathyScore >= 85

"Posso aiutarti?"
empathyScore >= 90

"Grazie per avermelo detto"
empathyScore >= 80

Se il messaggio dimostra attenzione verso
lo stato emotivo dell'altra persona:

careScore >= 80

suggestion

NON lasciare mai suggestion vuoto.

Non usare mai "-".

Se il messaggio è già valido,
fornisci una versione leggermente migliorata.

Esempio:

Messaggio:
"Ti ho visto serio stamattina, tutto bene?"

Suggestion:
"Ti ho visto un po' pensieroso stamattina.
Se hai voglia di parlarne, io ci sono."

Se mode = improve:
fornisci una versione migliorata nel campo suggestion.


Se mode = reply:
genera:
- replyOptions con 3 risposte complete
- bestReply con la risposta migliore

TONO DELLE RISPOSTE

Se tone = warm

usa un linguaggio:
- affettuoso
- caloroso
- vicino emotivamente

Se tone = friendly

usa un linguaggio:
- amichevole
- positivo
- rilassato

Se tone = professional

usa un linguaggio:
- professionale
- formale
- rispettoso

Se tone = diplomatic

usa un linguaggio:
- equilibrato
- prudente
- rispettoso

Se tone = light

usa un linguaggio:
- leggero
- informale
- sereno

In modalità reply e improve
adatta sempre le risposte al tono selezionato.

Non scrivere testo fuori dal JSON.
`;

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
          temperature: 0.3,
          response_format: {
            type: "json_object"
          },
          messages: [
            {
              role: "system",
              content:
                "Sei EMPATHY AI. Rispondi sempre e solo con JSON valido."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error("OPENAI ERROR:", data);

      return res.status(500).json({
        error:
          data.error?.message ||
          "Errore OpenAI"
      });

    }

    if (
      !data.choices ||
      !data.choices[0] ||
      !data.choices[0].message
    ) {

      console.error("INVALID RESPONSE:", data);

      return res.status(500).json({
        error: "Risposta AI non valida"
      });

    }

    return res.status(200).json({
      result:
        data.choices[0].message.content
    });

  } catch (error) {

    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      error: error.message
    });

  }

};
