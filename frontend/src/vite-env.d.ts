/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** Client ID cua Google OAuth (cong khai). De trong -> an nut dang nhap Google */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

// Kieu toi gian cho Google Identity Services (script nap trong index.html)
interface GoogleCredentialResponse {
  credential: string;
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize(options: {
          client_id: string;
          callback: (response: GoogleCredentialResponse) => void;
          ux_mode?: 'popup' | 'redirect';
        }): void;
        renderButton(
          parent: HTMLElement,
          options: {
            type?: 'standard' | 'icon';
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            width?: number;
            locale?: string;
          },
        ): void;
      };
    };
  };
}
