import "server-only";
import { resolve4 } from "node:dns/promises";


import nodemailer from "nodemailer";

type AccessRequestEmail = {
  name: string;
  email: string;
  ipAddress: string;
  approveUrl: string;
  denyUrl: string;
};

type BuiltAccessRequestEmail = {
  from?: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

function brevoConfigReady() {
  return Boolean(process.env.BREVO_API_KEY);
}

function resendConfigReady() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

function smtpConfigReady() {
  return Boolean(process.env.GMAIL_SMTP_USER && process.env.GMAIL_SMTP_APP_PASSWORD);
}

export async function sendAccessRequestEmail(request: AccessRequestEmail) {
  if (brevoConfigReady()) {
    const fromEmail = process.env.BREVO_FROM?.trim() || "noreply@flz.works";
    await sendWithBrevo(buildAccessRequestEmail(request, fromEmail));
    return { sent: true };
  }

  if (smtpConfigReady()) {
    const smtpUser = process.env.GMAIL_SMTP_USER?.trim();
    const smtpPassword = process.env.GMAIL_SMTP_APP_PASSWORD?.replace(/\s+/g, "");
    const smtpFrom = process.env.GMAIL_SMTP_FROM?.trim() || smtpUser;
    const smtpHost = await resolveGmailSmtpIpv4Host();
    const email = buildAccessRequestEmail(request, smtpFrom);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: 587,
      secure: false, // upgrade later with STARTTLS
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: { servername: "smtp.gmail.com" },
      auth: { user: smtpUser, pass: smtpPassword },
    });

    await transporter.sendMail(email);
    return { sent: true };
  }

  if (resendConfigReady()) {
    await sendWithResend(buildAccessRequestEmail(request, process.env.RESEND_FROM?.trim()));
    return { sent: true };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Email delivery is not configured.");
  }

  console.info("Intranet access email skipped because email delivery is not configured.", {
    approveUrl: request.approveUrl,
    denyUrl: request.denyUrl,
  });
  return { sent: false };
}

function buildAccessRequestEmail(
  request: AccessRequestEmail,
  from: string | undefined,
): BuiltAccessRequestEmail {
  const hostEmail = process.env.INTRANET_HOST_EMAIL?.trim() || "floszbeni@gmail.com";

  return {
    from,
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
  };
}

export async function sendMagicLinkEmail(email: string, name: string, claimUrl: string, module: string) {
  const request = { to: email, name, claimUrl, module };

  if (brevoConfigReady()) {
    const fromEmail = process.env.BREVO_FROM?.trim() || "noreply@flz.works";
    await sendWithBrevo(buildMagicLinkEmail(request, fromEmail));
    return { sent: true };
  }

  if (smtpConfigReady()) {
    const smtpUser = process.env.GMAIL_SMTP_USER?.trim();
    const smtpPassword = process.env.GMAIL_SMTP_APP_PASSWORD?.replace(/\s+/g, "");
    const smtpFrom = process.env.GMAIL_SMTP_FROM?.trim() || smtpUser;
    const smtpHost = await resolveGmailSmtpIpv4Host();
    const builtEmail = buildMagicLinkEmail(request, smtpFrom);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: 587,
      secure: false,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: { servername: "smtp.gmail.com" },
      auth: { user: smtpUser, pass: smtpPassword },
    });

    await transporter.sendMail(builtEmail);
    return { sent: true };
  }

  if (resendConfigReady()) {
    await sendWithResend(buildMagicLinkEmail(request, process.env.RESEND_FROM?.trim()));
    return { sent: true };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Email delivery is not configured.");
  }
  console.info("Intranet magic link email skipped because email delivery is not configured.", { claimUrl: request.claimUrl });
  return { sent: false };


}

function buildMagicLinkEmail(
  request: { to: string; name: string; claimUrl: string; module: string },
  from: string | undefined,
): BuiltAccessRequestEmail {
  return {
    from,
    to: request.to,
    subject: `Your Intranet Access is Approved`,
    text: [
      `Hello ${request.name},`,
      "",
      `Your request to access the ${request.module} intranet module has been approved.`,
      "Click the link below to securely log in. This link can only be used once.",
      "",
      `Login: ${request.claimUrl}`,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h1 style="font-size:20px">Your Intranet Access is Approved</h1>
        <p>Hello ${escapeHtml(request.name)},</p>
        <p>Your request to access the <strong>${escapeHtml(request.module)}</strong> intranet module has been approved.</p>
        <p>Click the button below to securely log in. This link can only be used once.</p>
        <p style="margin-top:24px">
          <a href="${request.claimUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#111827;color:#fff;text-decoration:none;font-weight:bold">Secure Login</a>
        </p>
      </div>
    `,
  };
}

async function sendWithResend(email: BuiltAccessRequestEmail) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || !email.from) {
    throw new Error("Resend email delivery is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: email.from,
      to: [email.to],
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend email failed with ${response.status}: ${body.slice(0, 500)}`);
  }
}

async function sendWithBrevo(email: BuiltAccessRequestEmail) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("Missing BREVO_API_KEY");

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: email.from || "noreply@flz.works", name: "AutoPiac Intranet" },
      to: [{ email: email.to }],
      subject: email.subject,
      htmlContent: email.html,
      textContent: email.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Brevo email failed with ${response.status}: ${body.slice(0, 500)}`);
  }
}

async function resolveGmailSmtpIpv4Host() {
  const [address] = await resolve4("smtp.gmail.com");
  if (!address) {
    throw new Error("Gmail SMTP IPv4 address could not be resolved.");
  }
  return address;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
