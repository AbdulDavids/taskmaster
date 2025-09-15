import { getContext, setContext } from 'svelte';
import { createToaster } from '@skeletonlabs/skeleton-svelte';

class AuthState {
  user: { id: string; name: string; email: string } | null = $state(null);
  session: { id: string } | null = $state(null);
  error: { message: string } | null = $state(null);
  isPending: boolean = $state(false);
  isRefetching: boolean = $state(false);
}

export class AppState {
  private constructor(
    public auth: AuthState = new AuthState(),
    public toaster = createToaster({ max: 5, overlap: true, placement: 'bottom-end' })
  ) {
    // Private constructor to prevent instantiation
  }

  public static init(): AppState {
    return setContext('appState', new AppState());
  }

  public static get(): AppState {
    return getContext<AppState>('appState');
  }

  public static getAuth(): AuthState {
    return AppState.get().auth;
  }

  public static getToaster(): ReturnType<typeof createToaster> {
    return AppState.get().toaster;
  }
}
