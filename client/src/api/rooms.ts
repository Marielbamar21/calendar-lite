import { getToken } from "./auth";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

const ROOMS_BASE = `${API_BASE}/api/v1/rooms`;

export interface Room {
  id: number;
  name: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface PaginatedRoomsResponse {
  data: Room[];
  total: number;
  page: number;
  limit: number;
}

export interface FetchRoomsParams {
  page: number;
  limit: number;
}

export interface CreateRoomParams {
  name: string;
}

export interface UpdateRoomParams {
  name: string;
}

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response, parseJson = true): Promise<T> {
  const json = parseJson ? await res.json().catch(() => ({})) : ({} as T);
  if (!res.ok) {
    const msg =
      (json as { message?: string })?.message ??
      (json as { error?: string })?.error ??
      `Error ${res.status}`;
    throw new Error(msg);
  }
  return (parseJson ? json : res) as T;
}

export async function fetchRooms(
  params: FetchRoomsParams
): Promise<PaginatedRoomsResponse> {
  const { page, limit } = params;
  const offset = (page - 1) * limit;
  const url = `${ROOMS_BASE}?limit=${limit}&offset=${offset}`;
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (json as { message?: string }).message ??
        (json as { error?: string }).error ??
        "Failed to load rooms"
    );
  }
  return normalizePaginatedResponse(json, page, limit);
}

function normalizePaginatedResponse(
  raw: Record<string, unknown>,
  page: number,
  limit: number
): PaginatedRoomsResponse {
  const rooms = raw.rooms as { rows?: Room[]; count?: number } | undefined;
  const data = (rooms?.rows ?? raw.data ?? raw.rows ?? []) as Room[];
  const total = Number(
    rooms?.count ?? raw.total ?? raw.count ?? raw.totalCount ?? data.length
  );
  return { data, total, page, limit };
}

export async function fetchRoom(id: number | string): Promise<Room> {
  const res = await fetch(`${ROOMS_BASE}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (json as { message?: string }).message ??
        (json as { error?: string }).error ??
        "Failed to load room"
    );
  }
  const room = (json as { room?: Room }).room ?? json;
  return room as Room;
}

export async function createRoom(
  params: CreateRoomParams
): Promise<{ message: string; room: Room }> {
  const res = await fetch(ROOMS_BASE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name: params.name }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (json as { message?: string }).message ??
        (json as { error?: string }).error ??
        "Failed to create room"
    );
  }
  return json as { message: string; room: Room };
}

export async function updateRoom(
  id: number | string,
  params: UpdateRoomParams
): Promise<{ message: string; room: Room }> {
  const res = await fetch(`${ROOMS_BASE}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name: params.name }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (json as { message?: string }).message ??
        (json as { error?: string }).error ??
        "Failed to update room"
    );
  }
  return json as { message: string; room: Room };
}

export async function deleteRoom(
  id: number | string
): Promise<{ message: string; room: Room }> {
  const res = await fetch(`${ROOMS_BASE}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (json as { message?: string }).message ??
        (json as { error?: string }).error ??
        "Failed to delete room"
    );
  }
  return json as { message: string; room: Room };
}
