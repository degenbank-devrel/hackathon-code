const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Ensure API_BASE_URL ends with a trailing slash if needed
const getFormattedBaseUrl = () => {
  if (!API_BASE_URL) return "http://localhost:8080";
  return API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
};

// New API Response structure
export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  statusCode: number;
}

// User interface matching the API response
export interface User {
  userId: string;
  fullname: string;
  privyId: string | null;
  walletAddress: string;
  email: string | null;
  image: string;
  joinDate: string;
}

// Backend user response interface (snake_case fields)
interface BackendUser {
  user_id: string;
  fullname: string;
  privy_id: string | null;
  wallet_address: string;
  email: string | null;
  image: string;
  join_date: string;
}

// Get all users response structure
export interface GetUsersResponse {
  results: User[];
  total: number;
}

// Create user request structure
export interface CreateUserRequest {
  fullname: string;
  privyId: string;
  walletAddress: string;
  email?: string;
  image?: string;
}

// Update user request structure
export interface UpdateUserRequest {
  fullname?: string;
  walletAddress?: string;
  image?: string;
}

// Vault interfaces - matching backend model exactly
export interface Vault {
  vault_id: string;
  vault_type: string;
  vault_name: string;
  vault_image: string;
  vault_address: string;
  token_program: string;
  token_address: string;
  vault_token_address: string;
  vault_token_mint: string;
  locked_start: string; // Date as ISO string from API
  locked_end: string; // Date as ISO string from API
  vault_strategy: string;
  vault_risks: string;
  description: string;
  manager_id: string;
  battle_id: number | null;
  last_performance_update: string; // Date as ISO string from API
  risk_level: string;
  apy: number;
  deposit_asset: string;
  min_deposit: number;
  // Relations
  manager?: Manager;
  battle?: Battle;
  tvl: number;
  total_stakers: number;
}

export interface GetVaultsResponse {
  results: Vault[];
  total: number;
}

export interface VaultPerformanceData {
  date: string;
  value: number;
  roi: number;
  sharePrice: number;
  vaultBalance: number;
}

export interface VaultPerformanceResponse {
  period: string;
  data: VaultPerformanceData[];
  summary: {
    totalReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
}

// Note: Performance data should come from backend API, not generated client-side

// Battle interfaces - Updated to match backend model exactly
export interface Battle {
  battle_id: number;
  battle_name: string;
  battle_image: string | null;
  battle_description: string | null;
  battle_start: string; // Date as ISO string
  battle_end: string; // Date as ISO string
  program_address: string;
  treasury_address: string;
  owner_address: string;
  pda_address: string;
  arena_type:
    | "DCA Strategy"
    | "Lending Strategy"
    | "Mixed Strategy"
    | "Yield Farming";
  current_phase: "stake_phase" | "battle_phase" | "completed";
  prize_pool: number; // bigint from backend converted to number
  winner_vault_id: string | null;
  arena_color: string | null;
  status: "open_deposit" | "ongoing_battle" | "completed";
  vaults?: Vault[];
  total_participants: number;
  total_tvl: number;
}

export interface GetBattlesResponse {
  results: Battle[];
  total: number;
}

// Battle Comment interfaces
export interface BattleComment {
  comment_id: number;
  battle_id: number;
  commentator: string;
  comment: string;
  comment_at: string; // Date as ISO string
}

export interface GetBattleCommentsResponse {
  data: BattleComment[];
  message: string;
  statusCode: number;
}

// Manager interfaces
export interface Manager {
  manager_id: string;
  manager_name: string;
  wallet_address: string;
  manager_token_address: string;
  image: string;
  is_kyb: boolean;
}

export interface GetManagersResponse {
  results: Manager[];
  total: number;
}

// Token interfaces
export interface Token {
  tokenId: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenImage: string;
  tokenDecimals: number;
  network: string;
  created_at: string;
}

export interface GetTokensResponse {
  results: Token[];
  total: number;
}

// User Vault Position interfaces
export interface UserVaultPosition {
  position_id: string;
  user_id: string;
  vault_id: string;
  vault_shares: string;
  cumulative_deposits: string;
  cumulative_withdrawals: string;
  current_value: string;
  high_water_mark: string;
  fees_paid: string;
  max_daily_drawdown: string;
  total_return_percentage: string;
  tx_hash: string | null;
  first_deposit_at: string;
  last_transaction_at: string;
  created_at: string;
  updated_at: string;
  vault?: {
    vault_id: string;
    vault_name: string;
    vault_address: string;
    vault_strategy: string;
    vault_type: string;
    vault_image: string;
    battle_id: number | null;
    apy: number;
  };
}

// Deposit request interface
export interface DepositRequest {
  amount: number;
  shares_received: number;
  tx_hash: string;
}

// Withdrawal request interface
export interface WithdrawalRequest {
  amount: number;
  shares_burned: number;
  tx_hash: string;
}

// UserTxHistory interface matching backend model
export interface UserTxHistory {
  tx_id: string;
  vault_id: string;
  user_id: string;
  tx_type: "deposit" | "withdrawal";
  amount: string;
  fee: string;
  transactionDate: string; // Date as ISO string
  vault?: {
    vault_id: string;
    vault_name: string;
    vault_image: string;
    vault_strategy: string;
    vault_type: string;
  };
  user?: {
    userId: string;
    fullname: string;
    walletAddress: string;
  };
}

export interface GetUserTxHistoryResponse {
  results: UserTxHistory[];
  total: number;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<ApiResponse<T>> {
    // Use the formatted base URL to ensure proper URL construction
    const baseUrl = getFormattedBaseUrl();
    // Make sure endpoint doesn't start with a slash if baseUrl ends with one
    const formattedEndpoint = endpoint.startsWith("/")
      ? endpoint.substring(1)
      : endpoint;
    const url = `${baseUrl}${formattedEndpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token is provided
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const fetchConfig = {
        ...config,
        signal: controller.signal,
      };

      const response = await fetch(url, fetchConfig).finally(() =>
        clearTimeout(timeoutId)
      );

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;

        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = `${errorMessage} - ${errorData.message}`;
          }
        } catch {
          // If response is not JSON, use default error message
          errorMessage = `${errorMessage} - ${response.statusText}`;
        }

        // Handle specific status codes
        if (response.status === 500) {
          console.warn("Server error (500) - this might be a temporary issue");
        } else if (response.status === 409) {
          console.info("Conflict (409) - resource might already exist");
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      // Improved error handling with more specific messages
      let errorMessage = "API request failed";

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage =
          "Network error: Unable to connect to the server. Please check your internet connection or the server might be down.";
      } else if (error instanceof DOMException && error.name === "AbortError") {
        errorMessage = "Request timeout: The server took too long to respond.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("API request failed:", {
        url,
        method: config.method || "GET",
        error: errorMessage,
      });

      // Throw the error instead of returning a structured response
      throw new Error(errorMessage);
    }
  }

  // Create a new user with retry logic
  async createUser(
    userData: CreateUserRequest,
    token?: string,
    retryCount = 0
  ): Promise<User> {
    const maxRetries = 2;

    try {
      const response = await this.request<BackendUser>(
        "/users",
        {
          method: "POST",
          body: JSON.stringify(userData),
        },
        token
      );

      const backendUser = response.data;

      // Map backend response fields to frontend interface
      const user: User = {
        userId: backendUser.user_id,
        fullname: backendUser.fullname,
        privyId: backendUser.privy_id,
        walletAddress: backendUser.wallet_address,
        email: backendUser.email,
        image: backendUser.image,
        joinDate: backendUser.join_date,
      };

      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Retry on 500 errors (server errors) but not on client errors (4xx)
      if (retryCount < maxRetries && errorMessage.includes("status: 500")) {
        console.log(
          `Retrying createUser request (attempt ${retryCount + 1}/${maxRetries})`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        ); // Exponential backoff
        return this.createUser(userData, token, retryCount + 1);
      }

      // If it's a 409 (conflict), the user might already exist - this is not necessarily an error
      if (errorMessage.includes("status: 409")) {
        console.info("User might already exist (409 conflict)");
        throw new Error("User already exists");
      }

      throw error;
    }
  }

  // Get user by wallet address
  async getUser(walletAddress: string): Promise<User | null> {
    try {
      const response = await this.request<BackendUser>(
        `/users/wallet/${walletAddress}`
      );
      const backendUser = response.data;

      if (!backendUser) {
        return null;
      }


      // Map backend response fields to frontend interface
      const user: User = {
        userId: backendUser.user_id,
        fullname: backendUser.fullname,
        privyId: backendUser.privy_id,
        walletAddress: backendUser.wallet_address,
        email: backendUser.email,
        image: backendUser.image,
        joinDate: backendUser.join_date,
      };

      return user;
    } catch (error) {
      // If user not found (404), return null instead of throwing error
      if (error instanceof Error && error.message.includes("status: 404")) {
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  }

  // Get all users
  async getAllUsers(): Promise<GetUsersResponse> {
    const response = await this.request<GetUsersResponse>("/users");
    return response.data;
  }

  // Vault API methods
  async getVault(id: string): Promise<Vault> {
    const response = await this.request<Vault>(`/vault/${id}`);
    return response.data;
  }

  async getAllVaults(
    skip: number = 0,
    limit: number = 10
  ): Promise<GetVaultsResponse> {
    const response = await this.request<GetVaultsResponse>(
      `/vault?skip=${skip}&limit=${limit}`
    );
    return response.data;
  }

  async getVaultsByBattleId(battleId: number): Promise<Vault[]> {
    const response = await this.request<Vault[]>(`/vault/battle/${battleId}`);
    return response.data;
  }

  async getVaultPerformance(
    vaultId: string,
    period: string = "14D"
  ): Promise<VaultPerformanceResponse> {
    const response = await this.request<VaultPerformanceResponse>(
      `/vault/${vaultId}/performance?period=${period}`
    );
    return response.data;
  }

  async disqualifyVault(vaultId: string): Promise<Vault> {
    const response = await this.request<Vault>(`/vault/${vaultId}/disqualify`, {
      method: "POST",
    });
    return response.data;
  }

  // Battle API methods
  async getBattle(id: string): Promise<Battle> {
    const response = await this.request<Battle>(`/battle/${id}`);
    return response.data;
  }

  async getAllBattles(
    skip: number = 0,
    limit: number = 10
  ): Promise<GetBattlesResponse> {
    const response = await this.request<GetBattlesResponse>(
      `/battle?skip=${skip}&limit=${limit}`
    );
    return response.data;
  }

  async getBattleComments(battleId: string | number): Promise<BattleComment[]> {
    const response = await this.request<GetBattleCommentsResponse>(
      `comments/battle/${battleId}/comments`
    );

    // Handle different possible response structures
    let comments: BattleComment[] = [];

    if (response.data) {
      // If response.data has a 'data' property (nested structure)
      if (response.data.data && Array.isArray(response.data.data)) {
        comments = response.data.data;
      }
      // If response.data is directly an array (fallback)
      else if (Array.isArray(response.data)) {
        comments = response.data as BattleComment[];
      }
    }

    return comments;
  }

  // Manager API methods
  async getManager(id: string): Promise<Manager> {
    const response = await this.request<Manager>(`/manager/${id}`);
    return response.data;
  }

  async getAllManagers(
    skip: number = 0,
    limit: number = 10
  ): Promise<GetManagersResponse> {
    const response = await this.request<GetManagersResponse>(
      `/manager?skip=${skip}&limit=${limit}`
    );
    return response.data;
  }

  // Token API methods
  async getToken(id: string): Promise<Token> {
    const response = await this.request<Token>(`/token/${id}`);
    return response.data;
  }

  async getTokenByAddress(address: string): Promise<Token> {
    const response = await this.request<Token>(`/token/address/${address}`);
    return response.data;
  }

  async getTokensByNetwork(
    network: string,
    skip: number = 0,
    limit: number = 10
  ): Promise<Token[]> {
    const response = await this.request<Token[]>(
      `/token/network/${network}?skip=${skip}&limit=${limit}`
    );
    return response.data;
  }

  // User Vault Position API methods
  async getUserVaultPosition(
    userId: string,
    vaultId: string,
    token?: string
  ): Promise<UserVaultPosition | null> {
    const response = await this.request<UserVaultPosition | null>(
      `/user-vault-position/user/${userId}/vault/${vaultId}`,
      {},
      token
    );
    return response.data;
  }

  async getUserVaultPositions(
    userId: string,
    skip: number = 0,
    limit: number = 10,
    token?: string
  ): Promise<UserVaultPosition[]> {
    const response = await this.request<UserVaultPosition[]>(
      `/user-vault-position/user/${userId}?skip=${skip}&limit=${limit}`,
      {},
      token
    );
    return response.data;
  }

  async getVaultPositions(
    vaultId: string,
    token?: string
  ): Promise<UserVaultPosition[]> {
    const response = await this.request<UserVaultPosition[]>(
      `/user-vault-position/vault/${vaultId}`,
      {},
      token
    );
    return response.data;
  }

  async recordDeposit(
    userId: string,
    vaultId: string,
    depositData: DepositRequest,
    token?: string
  ): Promise<UserVaultPosition> {
    const response = await this.request<UserVaultPosition>(
      `/user-vault-position/user/${userId}/vault/${vaultId}/deposit`,
      {
        method: "POST",
        body: JSON.stringify(depositData),
      },
      token
    );
    return response.data;
  }

  async recordWithdrawal(
    userId: string,
    vaultId: string,
    withdrawalData: WithdrawalRequest,
    token?: string
  ): Promise<UserVaultPosition> {
    const response = await this.request<UserVaultPosition>(
      `/user-vault-position/user/${userId}/vault/${vaultId}/withdrawal`,
      {
        method: "POST",
        body: JSON.stringify(withdrawalData),
      },
      token
    );
    return response.data;
  }

  async updatePositionPerformance(
    userId: string,
    vaultId: string,
    performanceData: {
      current_value?: number;
      high_water_mark?: number;
      max_daily_drawdown?: number;
      total_return_percentage?: number;
      fees_paid?: number;
    },
    token?: string
  ): Promise<UserVaultPosition> {
    const response = await this.request<UserVaultPosition>(
      `/user-vault-position/user/${userId}/vault/${vaultId}/performance`,
      {
        method: "PUT",
        body: JSON.stringify(performanceData),
      },
      token
    );
    return response.data;
  }

  // User Transaction History methods
  async getUserTxHistory(
    userId: string,
    skip: number = 0,
    limit: number = 10,
    token?: string
  ): Promise<GetUserTxHistoryResponse> {
    const response = await this.request<GetUserTxHistoryResponse>(
      `/user-tx-history/user/${userId}?skip=${skip}&limit=${limit}`,
      {},
      token
    );
    return response.data;
  }

  async getTxHistoryById(txId: string, token?: string): Promise<UserTxHistory> {
    const response = await this.request<UserTxHistory>(
      `/user-tx-history/${txId}`,
      {},
      token
    );
    return response.data;
  }

  async getAllTxHistory(
    skip: number = 0,
    limit: number = 10,
    token?: string
  ): Promise<GetUserTxHistoryResponse> {
    const response = await this.request<GetUserTxHistoryResponse>(
      `/user-tx-history?skip=${skip}&limit=${limit}`,
      {},
      token
    );
    return response.data;
  }
}

export const apiService = new ApiService();
