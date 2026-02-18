declare global {
  type GoogleCredentialResponse = {
    credential?: string;
  };

  type GoogleButtonOptions = {
    type: 'standard' | 'icon';
    theme: 'outline' | 'filled_blue' | 'filled_black';
    size: 'large' | 'medium' | 'small';
    text?: string;
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    logo_alignment?: 'left' | 'center';
    width?: number;
  };

  type GoogleIdentityNamespace = {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: GoogleCredentialResponse) => void;
        }) => void;
        renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
      };
    };
  };

  interface Window {
    google?: GoogleIdentityNamespace;
  }
}

export {};
