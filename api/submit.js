const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdCEowOlyqFDiaugl68Qd7P59v6v_1lRWHdJxQJrfF39xYjLA/formResponse";

const FIELDS = {
  name: "entry.2005620554",
  phone: "entry.892132621",
  situation: "entry.1065046570",
  propertyType: "entry.1166974658",
  goal: "entry.86430257",
  timing: "entry.1077059376",
  profile: "entry.1731181553"
};

export default async function handler(request, response) {
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
        message: `Faltan datos obligatorios: ${missing.join(", ")}`
      });
    }

    const formBody = new URLSearchParams();
    formBody.append(FIELDS.name, String(payload.name));
    formBody.append(FIELDS.phone, String(payload.phone));
    formBody.append(FIELDS.situation, String(payload.situation));
    formBody.append(FIELDS.propertyType, String(payload.propertyType));
    formBody.append(FIELDS.goal, String(payload.goal));
    formBody.append(FIELDS.timing, String(payload.timing));
    formBody.append(FIELDS.profile, String(payload.profile));
    formBody.append("fvv", "1");
    formBody.append("pageHistory", "0");

    const googleResponse = await fetch(FORM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: formBody.toString(),
      redirect: "follow"
    });

    if (!googleResponse.ok) {
      throw new Error(
        `Google Forms respondió con estado ${googleResponse.status}.`
      );
    }

    return response.status(200).json({
      ok: true,
      message: "Datos guardados correctamente."
    });
  } catch (error) {
    console.error("Error al enviar a Google Forms:", error);

    return response.status(500).json({
      ok: false,
      message: error instanceof Error
        ? error.message
        : "No se pudieron guardar los datos."
    });
  }
}
