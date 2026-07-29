interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  clientId?: string;
}

interface GoogleButtonConfig {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: number;
  locale?: string;
}

interface GoogleAccounts {
  id: {
    initialize(config: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
      auto_select?: boolean;
      itp_support?: boolean;
    }): void;
    renderButton(parent: HTMLElement, config: GoogleButtonConfig): void;
    prompt(): void;
    disableAutoSelect(): void;
    revoke(hint: string, callback?: () => void): void;
  };
}

interface Google {
  accounts: GoogleAccounts;
}

declare const google: Google;
