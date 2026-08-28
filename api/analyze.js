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

    const prompt = `
Sei EMPATHY AI.

Destinatario:
${target}

Modalità:
${mode}

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
compila tutti i campi.

Se mode = improve:
fornisci una versione migliorata nel campo suggestion.

Se mode = reply:
genera:
- replyOptions con 3 risposte complete
- bestReply con la risposta migliore

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
