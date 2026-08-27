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
          response_format: {
            type: "json_object"
          },
          messages: [
            {
              role: "system",
              content: `
Sei EMPATHY AI.

Analizza il messaggio considerando il destinatario.

Restituisci ESCLUSIVAMENTE un JSON valido nel formato:

{
  "perception":"",
  "emotion":"",
  "need":"",
  "suggestion":"",
  "conflictScore":0,
  "empathyScore":0,
  "defensivenessScore":0,
  "redFlags":[]
}

Regole:

- perception = come il destinatario potrebbe percepirlo
- emotion = emozione principale
- need = bisogno nascosto
- suggestion = versione più empatica

Aumentano conflictScore e defensivenessScore:

- sempre
- mai
- accuse
- critiche personali
- sarcasmo

Aumentano empathyScore:

- io mi sento
- collaborazione
- vulnerabilità
- ascolto reciproco

redFlags è una lista delle criticità individuate.
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
