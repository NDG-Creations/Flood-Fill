/**
 * Ambient type declarations for Jabali SDK plugins.
 *
 * These declare module types so TypeScript resolves @jabali/* imports.
 * The actual runtime code is provided by the platform (Sandpack virtual
 * node_modules in dev, vendor/ injection in published builds).
 */

declare module "@jabali/auth" {
  export interface JabaliAuthConfig {
    gameId?: string;
    gameToken?: string;
    apiGatewayUrl?: string;
    nakamaUrl?: string;
    nakamaServerKey?: string;
  }

  export class JabaliAuth {
    constructor(config?: JabaliAuthConfig);
    get gameId(): string;
    get gameToken(): string;
    get apiGatewayUrl(): string;
    get nakamaUrl(): string;
    get nakamaServerKey(): string;
  }

  export function useJabaliAuth(config?: JabaliAuthConfig): JabaliAuth;
}

declare module "@jabali/llm-games-sdk" {
  export interface SDKOptions {
    baseUrl: string;
    accessToken: string;
    fetch?: typeof fetch;
  }

  export interface GameContext {
    game_description: string;
    turn_order?: string[];
    [key: string]: unknown;
  }

  export interface MoveDefinition {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    instructions: string;
    [key: string]: unknown;
  }

  export interface CreateGameOptions {
    state: Record<string, unknown>;
    context: GameContext;
    moves: MoveDefinition[];
    visibility?: Record<string, unknown>;
    id?: string;
  }

  export interface AddPlayerOptions {
    id: string;
    name: string;
    description?: string;
    type?: "ai" | "human";
  }

  export interface ListGamesOptions {
    limit?: number;
    offset?: number;
  }

  export interface UpdateDefinitionOptions {
    [key: string]: unknown;
  }

  export interface MoveResult {
    newState: Record<string, unknown>;
    timestamp: string;
  }

  export interface PickMoveResult {
    moveName: string;
  }

  export interface MakeMoveResult {
    arguments: Record<string, unknown>;
  }

  export interface TalkResult {
    message: string;
    timestamp: string;
  }

  export interface AutoMoveResult {
    moveName: string;
    arguments: Record<string, unknown>;
    newState: Record<string, unknown>;
    timestamp: string;
  }

  export interface GameMeta {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }

  export class Player {
    readonly id: string;
    readonly name: string;
    readonly type: "ai" | "human";
    applyMove(
      moveName: string,
      args: Record<string, unknown>
    ): Promise<MoveResult>;
    pickMove(): Promise<PickMoveResult>;
    makeMove(moveName: string): Promise<MakeMoveResult>;
    autoMove(): Promise<AutoMoveResult>;
    talk(instructions: string): Promise<TalkResult>;
    say(content: string): Promise<void>;
  }

  export class Game {
    readonly id: string;
    readonly context: Record<string, unknown>;
    get state(): Record<string, unknown>;
    refresh(): Promise<void>;
    updateState(newState: Record<string, unknown>): Promise<void>;
    updateDefinition(newDefinition: UpdateDefinitionOptions): Promise<void>;
    addPlayer(options: AddPlayerOptions): Promise<Player>;
    getPlayer(playerId: string): Promise<Player>;
  }

  export class LLMGamesSDK {
    constructor(options: SDKOptions);
    createGame(options: CreateGameOptions): Promise<Game>;
    loadGame(gameId: string): Promise<Game>;
    listGames(options?: ListGamesOptions): Promise<GameMeta[]>;
  }

  export function useJabaliLLMGames(options: SDKOptions): LLMGamesSDK;
}
