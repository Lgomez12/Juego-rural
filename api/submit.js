const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyaOkpPgHrs1t7MBVWA-7e_ivbqYQiEK8I-BnGvtmVDWLfBREKESZ3Kz9LnaM0caan5Pw/exec";

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");

    return response.status(405).json({
      ok: false,
      message: "Método no permitido."
    });
  }

  try {
    const payload =
      typeof request.body === "string"
        ? JSON.parse(request.body)
        : request.body;

    const requiredFields = [
      "name",
      "phone",
      "situation",
      "propertyType",
      "goal",
      "timing",
      "profile"
    ];

    const missing = requiredFields.filter(
      (field) => !payload || !String(payload[field] || "").trim()
    );

    if (missing.length > 0) {
      return response.status(400).json({
        ok: false,
        message: "Faltan datos obligatorios: " + missing.join(", ")
      });
    }

    const scriptResponse = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      redirect: "follow"
    });

    const responseText = await scriptResponse.text();

    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = {
        ok: false,
        message: "Apps Script devolvió una respuesta no válida."
      };
    }

    if (!scriptResponse.ok || !result.ok) {
      return response.status(502).json({
        ok: false,
        message: result.message || "No se pudieron guardar los datos."
      });
    }

    return response.status(200).json({
      ok: true,
      message: "Datos guardados correctamente."
    });
  } catch (error) {
    console.error("Error al enviar a Apps Script:", error);

    return response.status(500).json({
      ok: false,
      message:
        error && error.message
          ? error.message
          : "No se pudieron guardar los datos."
    });
  }
};
