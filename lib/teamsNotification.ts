import axios from "axios"

const TEAMS_WEBHOOK_URL = process.env.TEAMS_WEBHOOK_URL || ""
const TEAMS_AUTH_TOKEN = process.env.TEAMS_AUTH_TOKEN || ""

export async function sendTeamsNotification(incident: any) {
  if (!TEAMS_WEBHOOK_URL) {
    console.error("Teams webhook URL is not set")
    return
  }

  const message = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    themeColor: "0076D7",
    summary: "新規レポートが登録されました",
    sections: [
      {
        activityTitle: "新規レポートが登録されました",
        activitySubtitle: `レポート ID: ${incident.id}`,
        activityImage: `${process.env.NEXT_PUBLIC_APP_URL}/report-icon.png`,
        facts: [
          {
            name: "カテゴリ",
            value: incident.category,
          },
          {
            name: "発生日時",
            value: new Date(incident.occurrenceDateTime).toLocaleString("ja-JP"),
          },
          {
            name: "部門",
            value: incident.department,
          },
        ],
        markdown: true,
      },
    ],
    potentialAction: [
      {
        "@type": "OpenUri",
        name: "レポッチにアクセスする",
        targets: [{ os: "default", uri: `${process.env.NEXT_PUBLIC_APP_URL}/incidents/${incident.id}` }],
      },
    ],
  }

  try {
    const config: { headers: { "Content-Type": string; "Authorization"?: string } } = {
      headers: {
        "Content-Type": "application/json",
      },
    }

    if (TEAMS_AUTH_TOKEN) {
      config.headers["Authorization"] = `Bearer ${TEAMS_AUTH_TOKEN}`
    }

    await axios.post(TEAMS_WEBHOOK_URL, message, config)
    console.log("Teams notification sent successfully")
  } catch (error) {
    console.error("Error sending Teams notification:", error)
    throw error // Re-throw the error so it can be handled by the caller
  }
}

