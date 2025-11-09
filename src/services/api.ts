import axios from 'axios';
import {
  ApiResponse,
  GetTokensResponse,
  GetPositionsResponse,
  GetTradeHistoryResponse,
  ExecuteTradeResponse,
  TradeRequest
} from '../types';
import { API_ENDPOINT } from '../utils/constants';

class ApiService {
  private axiosInstance = axios.create({
    baseURL: API_ENDPOINT,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  /**
   * Fetch available tokens
   */
  async getTokens(): Promise<ApiResponse<GetTokensResponse>> {
    try {
      const response = await this.axiosInstance.post('', {
        action: 'get_tokens'
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Fetch user positions
   */
  async getPositions(userId: number, walletAddress: string): Promise<ApiResponse<GetPositionsResponse>> {
    try {
      const response = await this.axiosInstance.post('', {
        action: 'get_positions',
        user_id: userId,
        wallet_address: walletAddress
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Execute a trade (buy/sell)
   */
  async executeTrade(tradeRequest: TradeRequest): Promise<ApiResponse<ExecuteTradeResponse>> {
    try {
      const response = await this.axiosInstance.post('', {
        action: 'execute_trade',
        user_id: tradeRequest.userId,
        wallet_address: tradeRequest.walletAddress,
        token: tradeRequest.tokenId,
        amount: tradeRequest.amount,
        type: tradeRequest.type,
        slippage: tradeRequest.slippage
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Fetch trade history
   */
  async getTradeHistory(userId: number, walletAddress: string): Promise<ApiResponse<GetTradeHistoryResponse>> {
    try {
      const response = await this.axiosInstance.post('', {
        action: 'get_trade_history',
        user_id: userId,
        wallet_address: walletAddress
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Extract error message from error object
   */
  private getErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message || 'Network error';
    }
    return error?.message || 'Unknown error';
  }
}

export const apiService = new ApiService();
