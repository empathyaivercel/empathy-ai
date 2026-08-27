export default async function handler(req, res) {

  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo non consentito" });
    return;
  }

  try {

    const { target, message } = req.body;

    const openAiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: `
Sei un consulente esperto di comunicazione relazionale.

Analizza il messaggio e restituisci SOLO un JSON valido:

{
  "perception":"",
  "emotion":"",
  "need":"",
  "suggestion":""
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

    const data = await openAiResponse.json();

    res.status(200).json({
      result: data.choices[0].message.content
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

}
