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
          temperature: 0.4,
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

Analizza il messaggio dal punto di vista del destinatario.

Restituisci SEMPRE ed ESCLUSIVAMENTE un JSON valido.

Valuta:

perception
Come il destinatario potrebbe percepire il messaggio.

Possibili esempi:
- Accusa
- Critica
- Pressione
- Chiusura della comunicazione
- Richiesta di aiuto
- Vulnerabilità
- Collaborazione
- Frustrazione implicita

emotion
L'emozione principale trasmessa.

need
Il bisogno emotivo nascosto dietro al messaggio.

suggestion
Riscrittura più empatica, collaborativa e costruttiva.

conflictScore

0-20 = nessun conflitto
21-40 = leggera tensione
41-60 = possibile conflitto
61-80 = conflitto probabile
81-100 = conflitto molto probabile

empathyScore

0-20 = bassa empatia
21-40 = empatia limitata
41-60 = empatia moderata
61-80 = buona empatia
81-100 = empatia molto elevata

defensivenessScore

0-20 = risposta difensiva improbabile
21-40 = leggermente probabile
41-60 = probabile
61-80 = molto probabile
81-100 = quasi certa

redFlags

Elenco delle criticità trovate.

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

IMPORTANTISSIMO

Applica queste regole:

Se il messaggio contiene "sempre"
allora:
conflictScore >= 65
defensivenessScore >= 65

Se il messaggio contiene "mai"
allora:
conflictScore >= 65
defensivenessScore >= 65

Se contiene accuse dirette:
conflictScore >= 75
defensivenessScore >= 75

Se contiene critiche personali:
conflictScore >= 75
defensivenessScore >= 75

Se contiene più redFlags:
conflictScore >= 80
defensivenessScore >= 80

Se usa frasi collaborative come:
- possiamo
- vorrei
- mi sento
- mi farebbe piacere

allora:
empathyScore >= 60

I punteggi DEVONO essere coerenti con le redFlags.

Se individui:
- Accusa diretta
- Uso di sempre/mai
- Critica personale

NON assegnare mai conflictScore inferiore a 65.

Restituisci solo questo formato:

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
