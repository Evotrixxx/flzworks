export const PUBLIC_CONTACT_PROFILE = {
  name: "Bence Flosz",
  interest: "3D Artist & Game Dev",
  email: "7BFloszB@gmail.com",
  webLabel: "flz.works",
  webUrl: "https://flz.works",
} as const;

export const PUBLIC_CONTACT_ROWS = [
  ["NAME", PUBLIC_CONTACT_PROFILE.name],
  ["INTEREST", PUBLIC_CONTACT_PROFILE.interest],
  ["EMAIL", PUBLIC_CONTACT_PROFILE.email],
  ["WEB", PUBLIC_CONTACT_PROFILE.webLabel],
] as const;
