import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

type SendSesEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

function requiredEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value || !String(value).trim()) return undefined;
  return String(value).trim();
}

function getSesClient() {
  const region =
    requiredEnv("AWS_SES_REGION") ||
    requiredEnv("AWS_REGION") ||
    requiredEnv("AWS_S3_REGION") ||
    "ap-south-1";

  const accessKeyId =
    requiredEnv("AWS_ACCESS_KEY_ID") ||
    requiredEnv("AWS_S3_ACCESS_KEY_ID");
  const secretAccessKey =
    requiredEnv("AWS_SECRET_ACCESS_KEY") ||
    requiredEnv("AWS_S3_SECRET_ACCESS_KEY");

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("SES credentials are not configured");
  }

  return new SESClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function sendSesEmail(input: SendSesEmailInput) {
  const from = input.from || requiredEnv("AWS_SES_FROM_EMAIL") || "enquiry@raceautoindia.com";
  const client = getSesClient();

  const command = new SendEmailCommand({
    Source: from,
    Destination: {
      ToAddresses: [input.to],
    },
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: input.subject,
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: input.html,
        },
        Text: {
          Charset: "UTF-8",
          Data: input.text || "",
        },
      },
    },
  });

  return client.send(command);
}
