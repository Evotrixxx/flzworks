import "server-only";

import nodemailer from "nodemailer";

type AccessRequestEmail = {
  name: string;
  email: string;
  ipAddress: string;
  approveUrl: string;
  denyUrl: string;
};

function smtpConfigReady() {
  return Boolean(process.env.GMAIL_SMTP_USER && process.env.GMAIL_SMTP_APP_PASSWORD);
}

export async function sendAccessRequestEmail(request: AccessRequestEmail) {
  if (!smtpConfigReady()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Gmail SMTP is not configured.");
    }

    console.info("Intranet access email skipped because Gmail SMTP is not configured.", {
      approveUrl: request.approveUrl,
      denyUrl: request.denyUrl,
    });
    return { sent: false };
  }

  const smtpUser = process.env.GMAIL_SMTP_USER?.trim();
  const smtpPassword = process.env.GMAIL_SMTP_APP_PASSWORD?.replace(/\s+/g, "");
  const smtpFrom = process.env.GMAIL_SMTP_FROM?.trim() || smtpUser;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    // Railway can resolve Gmail SMTP to IPv6 addresses that are not routable
    // from the container. Force IPv4 so requests do not hang on ENETUNREACH.
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      servername: "smtp.gmail.com",
    },
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  } as Parameters<typeof nodemailer.createTransport>[0] & { family: 4 });

  const hostEmail = process.env.INTRANET_HOST_EMAIL ?? "floszbeni@gmail.com";

  await transporter.sendMail({
    from: smtpFrom,
    to: hostEmail,
    subject: `AutoPiac intranet access request: ${request.name}`,
    text: [
      "A new AutoPiac intranet access request arrived.",
      "",
      `Name: ${request.name}`,
      `Email: ${request.email}`,
      `IP address: ${request.ipAddress}`,
      "",
      `Approve: ${request.approveUrl}`,
      `Deny and block IP for 30 days: ${request.denyUrl}`,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h1 style="font-size:20px">AutoPiac intranet access request</h1>
        <p><strong>Name:</strong> ${escapeHtml(request.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(request.email)}</p>
        <p><strong>IP address:</strong> ${escapeHtml(request.ipAddress)}</p>
        <p>
          <a href="${request.approveUrl}" style="display:inline-block;margin-right:10px;padding:10px 14px;border-radius:999px;background:#111827;color:#fff;text-decoration:none">Approve access</a>
          <a href="${request.denyUrl}" style="display:inline-block;padding:10px 14px;border-radius:999px;background:#991b1b;color:#fff;text-decoration:none">Deny and block IP</a>
        </p>
      </div>
    `,
  });

  return { sent: true };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
